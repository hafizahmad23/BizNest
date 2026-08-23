// ============================================================
// Vercel Serverless Function — Smart AI Matchmaker Assistant
// POST /api/gemini/matchmaker
// Body: { userPrompt: string, businesses?: Array<...> }
// ============================================================
import {
  getAiClient,
  getGeminiApiKey,
  ensurePost,
  sendError,
  readBody,
  GEMINI_MODEL,
} from './_shared';

interface BusinessSummary {
  id: string;
  name: string;
  category: string;
  city: string;
  tagline?: string;
  rating?: number;
  reviewCount?: number;
}

/** Optionally load live businesses from Supabase when server config exists. */
async function loadBusinessesFromSupabase(): Promise<BusinessSummary[]> {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/businesses?select=id,name,tagline,rating,review_count,categories(name),cities(name)&status=eq.active&limit=100`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.categories?.name || 'General',
      city: r.cities?.name || 'Pakistan',
      tagline: r.tagline || '',
      rating: r.rating ?? 0,
      reviewCount: r.review_count ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function handler(req: any, res: any) {
  if (!ensurePost(req, res)) return;

  if (!getGeminiApiKey()) {
    return sendError(res, 500, 'GEMINI_API_KEY is not configured on the server.');
  }

  try {
    const body = readBody(req);
    const { userPrompt } = body;

    if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
      return sendError(res, 400, 'userPrompt is required.');
    }

    // Prefer live businesses passed by the client; otherwise try server-side Supabase.
    let businesses: BusinessSummary[] = Array.isArray(body.businesses)
      ? body.businesses.map((b: any) => ({
          id: String(b.id),
          name: String(b.name || ''),
          category: String(b.category || 'General'),
          city: String(b.city || 'Pakistan'),
          tagline: b.tagline ? String(b.tagline) : '',
          rating: typeof b.rating === 'number' ? b.rating : 0,
          reviewCount: typeof b.reviewCount === 'number' ? b.reviewCount : 0,
        }))
      : [];

    if (businesses.length === 0) {
      businesses = await loadBusinessesFromSupabase();
    }

    const ai = getAiClient();

    const prompt = `You are the BizNest AI Smart Matchmaker, a business discovery assistant for Pakistan.
User query: "${userPrompt.trim().slice(0, 500)}"

Available BizNest Businesses Database (real listings):
${JSON.stringify(businesses, null, 2)}

Instructions:
1. Recommend 1 to 3 best matching businesses from the provided database ONLY. Never invent businesses that are not in the list.
2. If the database is empty or nothing matches, return an empty matchedBusinessIds array and explain honestly that no matching businesses are listed yet.
3. Explain specifically WHY each recommendation fits the query (location, category, services described).
4. Never fabricate ratings, reviews, or experience claims about a business.
5. Be helpful, polite, and write in clear English with local Pakistani business context.
6. Return a JSON response matching this schema exactly:
{
  "matchedBusinessIds": ["id-1", "id-2"],
  "matchReasoning": "Natural language explanation..."
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let parsed: { matchedBusinessIds: string[]; matchReasoning: string } = {
      matchedBusinessIds: [],
      matchReasoning: '',
    };

    try {
      const raw = JSON.parse(response.text?.trim() || '{}');
      parsed = {
        matchedBusinessIds: Array.isArray(raw.matchedBusinessIds)
          ? raw.matchedBusinessIds.filter((id: any) =>
              businesses.some((b) => b.id === id)
            )
          : [],
        matchReasoning: typeof raw.matchReasoning === 'string' ? raw.matchReasoning : '',
      };
    } catch {
      parsed = {
        matchedBusinessIds: [],
        matchReasoning:
          'I could not process that request just now. Please try rephrasing your requirement.',
      };
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Gemini matchmaker error:', err);
    sendError(res, 500, 'Failed to process matchmaker query', err?.message);
  }
}
