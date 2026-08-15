import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_BUSINESSES, PAKISTAN_CITIES, POPULAR_CATEGORIES, PLATFORM_STATS } from "./src/data/mockData";
import { Business, LeadInquiry, Review } from "./src/types";

// In-memory data store for the live session
let businessesStore: Business[] = [...INITIAL_BUSINESSES];
let leadsStore: LeadInquiry[] = [
  {
    id: 'lead-101',
    businessId: 'biz-1',
    businessName: 'Green Flora Botanical Nursery',
    senderName: 'Usman Ali',
    senderPhone: '+92 300 1234567',
    senderEmail: 'usman@gmail.com',
    message: 'Interested in ordering 15 air purifying indoor plants for my restaurant in DHA Lahore.',
    city: 'Lahore',
    createdAt: new Date().toISOString().split('T')[0],
    status: 'new'
  }
];

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Healthcheck endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Stats
  app.get("/api/stats", (req, res) => {
    res.json({
      ...PLATFORM_STATS,
      totalBusinesses: businessesStore.length,
      totalLeadsGenerated: leadsStore.length + 184500
    });
  });

  // Cities & Categories
  app.get("/api/cities", (req, res) => {
    res.json(PAKISTAN_CITIES);
  });

  app.get("/api/categories", (req, res) => {
    res.json(POPULAR_CATEGORIES);
  });

  // Businesses CRUD & Query
  app.get("/api/businesses", (req, res) => {
    let result = [...businessesStore];
    const { query, category, city, verified, openNow, minRating, minTrustScore, sortBy } = req.query;

    if (query && typeof query === 'string' && query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        (b.aiKeywords && b.aiKeywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    if (category && typeof category === 'string' && category !== 'all') {
      result = result.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }

    if (city && typeof city === 'string' && city !== 'all') {
      result = result.filter(b => b.city.toLowerCase() === city.toLowerCase());
    }

    if (verified === 'true') {
      result = result.filter(b => b.isVerified);
    }

    if (openNow === 'true') {
      result = result.filter(b => b.isOpenNow);
    }

    if (minRating) {
      const mr = parseFloat(minRating as string);
      if (!isNaN(mr)) {
        result = result.filter(b => b.rating >= mr);
      }
    }

    if (minTrustScore) {
      const mts = parseInt(minTrustScore as string, 10);
      if (!isNaN(mts)) {
        result = result.filter(b => b.trustScore >= mts);
      }
    }

    // Sorting
    if (sortBy === 'trustScore') {
      result.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'popularityScore') {
      result.sort((a, b) => b.popularityScore - a.popularityScore);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: featured first, then trust score
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.trustScore - a.trustScore);
    }

    res.json(result);
  });

  app.get("/api/businesses/:id", (req, res) => {
    const biz = businessesStore.find(b => b.id === req.params.id);
    if (!biz) {
      return res.status(404).json({ error: "Business not found" });
    }
    // Increment view count
    biz.viewsCount += 1;
    res.json(biz);
  });

  app.post("/api/businesses", (req, res) => {
    const body = req.body as Partial<Business>;
    if (!body.name || !body.category || !body.city) {
      return res.status(400).json({ error: "Missing required business fields (name, category, city)" });
    }

    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      name: body.name,
      tagline: body.tagline || `${body.category} services in ${body.city}`,
      category: body.category,
      city: body.city,
      address: body.address || `${body.city}, Pakistan`,
      phone: body.phone || '+92 300 0000000',
      whatsapp: body.whatsapp || body.phone?.replace(/[^0-9]/g, '') || '+923000000000',
      email: body.email || 'contact@business.pk',
      website: body.website || '',
      instagram: body.instagram || '',
      facebook: body.facebook || '',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      logoImage: body.logoImage || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
      galleryImages: body.galleryImages && body.galleryImages.length > 0 ? body.galleryImages : ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
      description: body.description || `${body.name} provides top-tier ${body.category} services in ${body.city}, Pakistan.`,
      aiSummary: body.aiSummary || `Newly listed ${body.category} in ${body.city}. Fast responder with verified contact details.`,
      aiKeywords: body.aiKeywords || [body.category, body.city, body.name],
      trustScore: 92,
      popularityScore: 88,
      responseTime: body.responseTime || '< 15 mins',
      isVerified: true,
      isFeatured: false,
      isPremium: body.isPremium || false,
      status: 'active',
      rating: 5.0,
      reviewCount: 1,
      isOpenNow: true,
      operatingHours: body.operatingHours || '09:00 AM - 08:00 PM (Mon - Sat)',
      priceRange: body.priceRange || 'PKR 💸💸',
      productsServices: body.productsServices || [
        { id: 'p-default', name: 'Core Service Consultation', price: 'Contact for Quote', description: 'Custom solution tailored for your requirements.' }
      ],
      reviews: [
        { id: 'r-initial', userName: 'BizNest Verification Team', userCity: body.city, rating: 5, date: 'Today', comment: 'Profile verified and published on BizNest platform.' }
      ],
      viewsCount: 1,
      leadsCount: 0,
      savedCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    businessesStore.unshift(newBiz);
    res.status(201).json(newBiz);
  });

  app.put("/api/businesses/:id", (req, res) => {
    const index = businessesStore.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Business not found" });
    }
    businessesStore[index] = { ...businessesStore[index], ...req.body };
    res.json(businessesStore[index]);
  });

  app.delete("/api/businesses/:id", (req, res) => {
    businessesStore = businessesStore.filter(b => b.id !== req.params.id);
    res.json({ success: true, id: req.params.id });
  });

  // Leads
  app.post("/api/leads", (req, res) => {
    const { businessId, senderName, senderPhone, senderEmail, message, city } = req.body;
    const biz = businessesStore.find(b => b.id === businessId);
    if (!biz) {
      return res.status(404).json({ error: "Target business not found" });
    }

    const newLead: LeadInquiry = {
      id: `lead-${Date.now()}`,
      businessId,
      businessName: biz.name,
      senderName: senderName || 'Anonymous User',
      senderPhone: senderPhone || '+92 300 0000000',
      senderEmail: senderEmail || 'user@example.com',
      message: message || 'Hello, I saw your business on BizNest and would like to inquire about your services.',
      city: city || biz.city,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    leadsStore.unshift(newLead);
    biz.leadsCount += 1;
    res.status(201).json({ success: true, lead: newLead });
  });

  app.get("/api/leads", (req, res) => {
    const { businessId } = req.query;
    if (businessId) {
      return res.json(leadsStore.filter(l => l.businessId === businessId));
    }
    res.json(leadsStore);
  });

  // Reviews
  app.post("/api/reviews", (req, res) => {
    const { businessId, userName, userCity, rating, comment } = req.body;
    const biz = businessesStore.find(b => b.id === businessId);
    if (!biz) {
      return res.status(404).json({ error: "Business not found" });
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: userName || 'Satisfied Client',
      userCity: userCity || biz.city,
      rating: Number(rating) || 5,
      date: 'Just now',
      comment: comment || 'Excellent service and great response time!',
      verifiedPurchase: true
    };

    biz.reviews.unshift(newRev);
    biz.reviewCount += 1;
    // Recalculate rating average
    const total = biz.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    biz.rating = Number((total / biz.reviews.length).toFixed(1));

    res.status(201).json({ success: true, business: biz });
  });

  // --- GEMINI AI ENDPOINTS ---

  // 1. AI Business Description Generator
  app.post("/api/gemini/generate-description", async (req, res) => {
    try {
      const { name, category, city, keyHighlights, targetAudience } = req.body;
      const ai = getAiClient();

      const prompt = `You are an expert Pakistani business copywriter for BizNest, Pakistan's premier digital business hub. 
Generate an attractive, highly professional, trust-building business description (around 100-150 words) for a business with the following details:
- Business Name: ${name || 'BizNest Member'}
- Category: ${category || 'General Business'}
- City: ${city || 'Pakistan'}
- Key Highlights: ${keyHighlights || 'Quality services, fast response, customer satisfaction'}
- Target Audience: ${targetAudience || 'Pakistani consumers and businesses'}

Format the output cleanly in 2 cohesive paragraphs highlighting expertise, trust, location advantage in ${city}, and commitment to quality. Output ONLY the description text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      res.json({ description: response.text?.trim() || "Quality business providing exceptional services across Pakistan." });
    } catch (err: any) {
      console.error("Gemini description error:", err);
      res.status(500).json({ error: "Failed to generate AI description", details: err.message });
    }
  });

  // 2. AI SEO Keywords Generator
  app.post("/api/gemini/generate-keywords", async (req, res) => {
    try {
      const { name, category, city, description } = req.body;
      const ai = getAiClient();

      const prompt = `Generate a JSON array of 6-8 high-impact SEO search keywords/phrases that Pakistani users would search on Google or BizNest to find this business.
Business: ${name}, Category: ${category}, City: ${city}, Description snippet: ${description || ''}.
Return strictly valid JSON in this format: ["Keyword 1", "Keyword 2", ...]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let keywords: string[] = [];
      try {
        keywords = JSON.parse(response.text?.trim() || "[]");
      } catch {
        keywords = [`${category} in ${city}`, `${name} ${city}`, `Best ${category} ${city}`];
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
      const { name, category, city, description, trustScore, responseTime } = req.body;
      const ai = getAiClient();

      const prompt = `Write a 2-sentence punchy, AI-generated Trust Summary for a business listing on BizNest Pakistan:
Name: ${name}, Category: ${category}, City: ${city}, Trust Score: ${trustScore}/100, Response Time: ${responseTime}. Description: ${description}.
Focus on key USPs, location reliability, and customer satisfaction.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      res.json({ summary: response.text?.trim() || "Verified Pakistani business with proven response speed and excellent customer feedback." });
    } catch (err: any) {
      console.error("Gemini summary error:", err);
      res.status(500).json({ error: "Failed to generate AI summary", details: err.message });
    }
  });

  // 4. Smart AI Matchmaker Assistant
  app.post("/api/gemini/matchmaker", async (req, res) => {
    try {
      const { userPrompt } = req.body;
      const ai = getAiClient();

      // Send simplified database context to Gemini
      const businessSummaries = businessesStore.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        city: b.city,
        trustScore: b.trustScore,
        responseTime: b.responseTime,
        rating: b.rating,
        tagline: b.tagline,
        address: b.address
      }));

      const prompt = `You are the BizNest AI Smart Matchmaker, Pakistan's most intelligent business discovery assistant.
User query: "${userPrompt}"

Available BizNest Businesses Database:
${JSON.stringify(businessSummaries, null, 2)}

Instructions:
1. Recommend 1 to 3 best matching businesses from the provided database.
2. Explain specifically WHY each recommendation fits their query (e.g. location match in Lahore/Islamabad/Karachi, trust score, response speed, service specialization).
3. Be helpful, polite, and write in clear English with local Pakistani business context.
4. Return a JSON response matching this schema:
{
  "matchedBusinessIds": ["biz-1", "biz-2"],
  "matchReasoning": "Detailed natural language explanation of why these businesses match the user's needs..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let parsed = { matchedBusinessIds: [], matchReasoning: "" };
      try {
        parsed = JSON.parse(response.text?.trim() || "{}");
      } catch {
        parsed = {
          matchedBusinessIds: [businessesStore[0].id],
          matchReasoning: `Here are our top-rated recommendations matching your criteria across Pakistan.`
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
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BizNest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
