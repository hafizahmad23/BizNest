// LOCAL DEVELOPMENT ONLY — Not used in Vercel production
// Production uses: Supabase (data) + Vercel Serverless Functions (Gemini)
//
// In Vercel production the /api/gemini/* routes are served by the functions
// inside /api/gemini/*. This Express server only exists so the same routes
// work during local development alongside the Vite dev server.
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getAiClient,
  getGeminiApiKey,
  buildDescriptionPrompt,
  buildTaglinePrompt,
  buildKeywordsPrompt,
  buildSummaryPrompt,
  GEMINI_MODEL,
} from "./api/gemini/_shared";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- GEMINI AI ENDPOINTS (local dev mirror of /api/gemini/* serverless functions) ---

  // 1. AI Business Description Generator
  app.post("/api/gemini/generate-description", async (req, res) => {
    try {
      if (!getGeminiApiKey()) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const { name, category, city, keyHighlights, description, targetAudience, mode } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents:
          mode === "tagline"
            ? buildTaglinePrompt({ name, category, city, description, keyHighlights })
            : buildDescriptionPrompt({ name, category, city, keyHighlights, description, targetAudience }),
      });

      res.json({ description: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("Gemini description error:", err);
      res.status(500).json({ error: "Failed to generate AI description", details: err.message });
    }
  });

  // 2. AI SEO Keywords Generator
  app.post("/api/gemini/generate-keywords", async (req, res) => {
    try {
      if (!getGeminiApiKey()) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const { name, category, city, description } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildKeywordsPrompt({ name, category, city, description }),
        config: {
          responseMimeType: "application/json",
        },
      });

      let keywords: string[] = [];
      try {
        const parsed = JSON.parse(response.text?.trim() || "[]");
        if (Array.isArray(parsed)) {
          keywords = parsed.filter((k) => typeof k === "string" && k.trim()).slice(0, 8);
        }
      } catch {
        keywords = [];
      }

      res.json({ keywords });
    } catch (err: any) {
      console.error("Gemini keywords error:", err);
      res.status(500).json({ error: "Failed to generate AI keywords", details: err.message });
    }
  });

  // 3. AI Profile Summary Generator
  app.post("/api/gemini/summarize-profile", async (req, res) => {
    try {
      if (!getGeminiApiKey()) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const { name, category, city, description, rating, reviewCount } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: buildSummaryPrompt({ name, category, city, description, rating, reviewCount }),
      });

      res.json({ summary: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("Gemini summary error:", err);
      res.status(500).json({ error: "Failed to generate AI summary", details: err.message });
    }
  });

  // 4. Smart AI Matchmaker Assistant
  app.post("/api/gemini/matchmaker", async (req, res) => {
    try {
      if (!getGeminiApiKey()) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }
      const { userPrompt, businesses } = req.body;

      if (!userPrompt || typeof userPrompt !== "string" || !userPrompt.trim()) {
        return res.status(400).json({ error: "userPrompt is required." });
      }

      const ai = getAiClient();

      const prompt = `You are the BizNest AI Smart Matchmaker, a business discovery assistant for Pakistan.
User query: "${String(userPrompt).trim().slice(0, 500)}"

Available BizNest Businesses Database (real listings):
${JSON.stringify(Array.isArray(businesses) ? businesses : [], null, 2)}

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
          responseMimeType: "application/json",
        },
      });

      let parsed = { matchedBusinessIds: [] as string[], matchReasoning: "" };
      try {
        const raw = JSON.parse(response.text?.trim() || "{}");
        const list: any[] = Array.isArray(businesses) ? businesses : [];
        parsed = {
          matchedBusinessIds: Array.isArray(raw.matchedBusinessIds)
            ? raw.matchedBusinessIds.filter((id: any) => list.some((b) => b.id === id))
            : [],
          matchReasoning: typeof raw.matchReasoning === "string" ? raw.matchReasoning : "",
        };
      } catch {
        parsed = {
          matchedBusinessIds: [],
          matchReasoning: "I could not process that request just now. Please try rephrasing your requirement.",
        };
      }

      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini matchmaker error:", err);
      res.status(500).json({ error: "Failed to process matchmaker query", details: err.message });
    }
  });

  // Serve Vite frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Allow the sandbox/preview proxy hosts (e2b.app) to reach the dev server
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BizNest LOCAL DEV server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
