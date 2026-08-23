// ============================================================
// Shared helpers for BizNest Vercel Serverless Gemini Functions
// (files/folders prefixed with "_" are NOT exposed as routes by Vercel)
// ============================================================
import { GoogleGenAI } from '@google/genai';

/** Server-side ONLY key. Never use a VITE_ prefixed variable here. */
export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || '';
}

let cachedClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey: getGeminiApiKey(),
    });
  }
  return cachedClient;
}

export const GEMINI_MODEL = 'gemini-3.6-flash';

/** Reject anything except POST, with JSON error. */
export function ensurePost(req: any, res: any): boolean {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return false;
  }
  return true;
}

export function sendError(res: any, status: number, message: string, details?: string) {
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}

/**
 * Category-aware style guidance so every business gets UNIQUE, honest copy.
 * IMPORTANT anti-fabrication rules are always appended.
 */
export function categoryTone(category: string): string {
  const c = (category || '').toLowerCase();
  if (/(restaurant|cafe|food|bakery)/.test(c)) {
    return 'Focus on cuisine style, signature dishes ambiance, hygiene, family seating and location convenience. Use appetizing but factual Pakistani dining language.';
  }
  if (/(software|freelance|agency|tech|it|developer)/.test(c)) {
    return 'Focus on the actual tech stack offered, delivery process, communication style and business outcomes. Sound professional and modern without hype.';
  }
  if (/(doctor|clinic|hospital|medical|diagnostic|dental|skin)/.test(c)) {
    return 'Use a calm, caring, clinical tone. Focus on patient care, appointment ease, hygiene and the services actually listed. Never invent qualifications or certifications.';
  }
  if (/(retail|wholesale|shop|store|market)/.test(c)) {
    return 'Focus on product range actually described, fair pricing, stock availability and delivery or pickup convenience in their city.';
  }
  if (/(lawyer|legal|advocate)/.test(c)) {
    return 'Use a formal, trustworthy legal tone. Focus on practice areas actually listed, consultation process and responsiveness. Never invent case wins or years of experience.';
  }
  if (/(solar|electric|energy|plumbing|repair|technician)/.test(c)) {
    return 'Focus on the exact services listed, response speed, workmanship quality and service area. Sound practical and dependable.';
  }
  if (/(hotel|guest|hospitality|resort)/.test(c)) {
    return 'Focus on location advantage, comfort, cleanliness, and the amenities actually provided.';
  }
  if (/(real estate|property|plot)/.test(c)) {
    return 'Focus on transparency, documentation clarity, locality knowledge and the property types actually offered.';
  }
  if (/(salon|spa|beauty|barber)/.test(c)) {
    return 'Focus on the services listed, hygiene, staff professionalism and appointment convenience.';
  }
  if (/(gym|fitness|yoga|sports)/.test(c)) {
    return 'Focus on facilities and training services actually listed, timings, and member support.';
  }
  if (/(nursery|botanical|plant|garden)/.test(c)) {
    return 'Focus on plant varieties actually offered, plant health guidance, delivery care and landscaping services if listed.';
  }
  if (/(photograph|media|video|studio)/.test(c)) {
    return 'Focus on the photography/media services actually listed, equipment quality and booking process.';
  }
  if (/(academy|tutor|education|school|coaching)/.test(c)) {
    return 'Focus on subjects and classes actually offered, teaching approach and results-driven discipline. Never invent pass rates.';
  }
  return 'Focus on the services actually described, city presence, customer care and reliability.';
}

export const ANTI_FABRICATION_RULES = `
STRICT HONESTY RULES (must follow):
- ONLY use facts explicitly provided below (name, category, city, description, highlights).
- NEVER fabricate: years of experience, awards, certifications, customer counts, ratings, "best in Pakistan", "No.1", "trusted by thousands", guaranteed results, or any specific numbers not provided.
- Never claim badges, verification, or partnerships that were not provided.
- Write in clear, warm, professional English suited for Pakistani customers.
`;

export function buildDescriptionPrompt(input: {
  name?: string;
  category?: string;
  city?: string;
  keyHighlights?: string;
  description?: string;
  targetAudience?: string;
}): string {
  const { name, category, city, keyHighlights, description, targetAudience } = input;
  return `You are an expert Pakistani business copywriter for BizNest, a business discovery platform in Pakistan.

${ANTI_FABRICATION_RULES}

TONE GUIDANCE FOR THIS CATEGORY:
${categoryTone(category || '')}

Write ONE compelling, unique business description (100-150 words, exactly 2 short paragraphs) for:
- Business Name: ${name || 'this business'}
- Category: ${category || 'General Business'}
- City: ${city || 'Pakistan'}
- Owner-provided description / services: ${description || keyHighlights || 'Not provided'}
- Target Audience: ${targetAudience || 'Pakistani consumers and businesses'}

The description must feel hand-written for THIS specific business — reference its actual name, category and city naturally. Output ONLY the description text, no titles or quotes.`;
}

export function buildTaglinePrompt(input: {
  name?: string;
  category?: string;
  city?: string;
  description?: string;
  keyHighlights?: string;
}): string {
  const { name, category, city, description, keyHighlights } = input;
  return `You are a branding expert for Pakistani local businesses.

${ANTI_FABRICATION_RULES}

CATEGORY TONE:
${categoryTone(category || '')}

Create ONE short, memorable, unique tagline (maximum 12 words) for:
- Business Name: ${name || 'this business'}
- Category: ${category || 'General Business'}
- City: ${city || 'Pakistan'}
- What they actually offer: ${description || keyHighlights || 'Not provided'}

The tagline must be specific to THIS business (not a generic slogan every business could use). Output ONLY the tagline text. No quotes, no punctuation-heavy marketing filler.`;
}

export function buildKeywordsPrompt(input: {
  name?: string;
  category?: string;
  city?: string;
  description?: string;
}): string {
  const { name, category, city, description } = input;
  return `Generate a JSON array of 6-8 high-impact SEO search keywords/phrases that Pakistani users would search on Google or BizNest to find this exact business.
Business Name: ${name || 'N/A'}
Category: ${category || 'General'}
City: ${city || 'Pakistan'}
Description snippet: ${description || 'N/A'}

Return strictly valid JSON in this exact format: ["Keyword 1", "Keyword 2", ...]`;
}

export function buildSummaryPrompt(input: {
  name?: string;
  category?: string;
  city?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
}): string {
  const { name, category, city, description, rating, reviewCount } = input;
  const reviewInfo =
    typeof rating === 'number' && (reviewCount ?? 0) > 0
      ? `The business currently has a ${rating} out of 5 rating from ${reviewCount} real customer reviews.`
      : 'The business is new on BizNest and has no customer reviews yet — do NOT invent any ratings.';
  return `Write a punchy 2-sentence AI profile summary for a business listing on BizNest Pakistan.

${ANTI_FABRICATION_RULES}

- Name: ${name || 'N/A'}
- Category: ${category || 'General'}
- City: ${city || 'Pakistan'}
- Description: ${description || 'N/A'}
- ${reviewInfo}

Focus on what the business actually offers and its location advantage. Output ONLY the 2-sentence summary.`;
}

/** Safely parse a JSON payload from a Vercel/Express request body. */
export function readBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}
