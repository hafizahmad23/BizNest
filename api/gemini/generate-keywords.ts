// ============================================================
// Vercel Serverless Function — AI SEO Keywords Generator
// POST /api/gemini/generate-keywords
// ============================================================
import {
  getAiClient,
  getGeminiApiKey,
  ensurePost,
  sendError,
  readBody,
  buildKeywordsPrompt,
  GEMINI_MODEL,
} from './_shared';

export default async function handler(req: any, res: any) {
  if (!ensurePost(req, res)) return;

  if (!getGeminiApiKey()) {
    return sendError(res, 500, 'GEMINI_API_KEY is not configured on the server.');
  }

  try {
    const { name, category, city, description } = readBody(req);
    const ai = getAiClient();

    const prompt = buildKeywordsPrompt({ name, category, city, description });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let keywords: string[] = [];
    try {
      const parsed = JSON.parse(response.text?.trim() || '[]');
      if (Array.isArray(parsed)) {
        keywords = parsed.filter((k) => typeof k === 'string' && k.trim()).slice(0, 8);
      }
    } catch {
      keywords = [];
    }

    res.status(200).json({ keywords });
  } catch (err: any) {
    console.error('Gemini keywords error:', err);
    sendError(res, 500, 'Failed to generate AI keywords', err?.message);
  }
}
