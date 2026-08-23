// ============================================================
// Vercel Serverless Function — AI Business Description Generator
// POST /api/gemini/generate-description
// ============================================================
import {
  getAiClient,
  getGeminiApiKey,
  ensurePost,
  sendError,
  readBody,
  buildDescriptionPrompt,
  buildTaglinePrompt,
  GEMINI_MODEL,
} from './_shared';

export default async function handler(req: any, res: any) {
  if (!ensurePost(req, res)) return;

  if (!getGeminiApiKey()) {
    return sendError(res, 500, 'GEMINI_API_KEY is not configured on the server.');
  }

  try {
    const { name, category, city, keyHighlights, description, targetAudience, mode } =
      readBody(req);
    const ai = getAiClient();

    // mode === 'tagline' generates a short unique tagline for THIS business
    const prompt =
      mode === 'tagline'
        ? buildTaglinePrompt({ name, category, city, description, keyHighlights })
        : buildDescriptionPrompt({
            name,
            category,
            city,
            keyHighlights,
            description,
            targetAudience,
          });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    res.status(200).json({
      description: response.text?.trim() || '',
    });
  } catch (err: any) {
    console.error('Gemini description error:', err);
    sendError(res, 500, 'Failed to generate AI description', err?.message);
  }
}
