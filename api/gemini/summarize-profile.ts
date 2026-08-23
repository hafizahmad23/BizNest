// ============================================================
// Vercel Serverless Function — AI Profile Summary Generator
// POST /api/gemini/summarize-profile
// ============================================================
import {
  getAiClient,
  getGeminiApiKey,
  ensurePost,
  sendError,
  readBody,
  buildSummaryPrompt,
  GEMINI_MODEL,
} from './_shared';

export default async function handler(req: any, res: any) {
  if (!ensurePost(req, res)) return;

  if (!getGeminiApiKey()) {
    return sendError(res, 500, 'GEMINI_API_KEY is not configured on the server.');
  }

  try {
    const { name, category, city, description, rating, reviewCount } = readBody(req);
    const ai = getAiClient();

    const prompt = buildSummaryPrompt({ name, category, city, description, rating, reviewCount });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    res.status(200).json({
      summary: response.text?.trim() || '',
    });
  } catch (err: any) {
    console.error('Gemini summary error:', err);
    sendError(res, 500, 'Failed to generate AI summary', err?.message);
  }
}
