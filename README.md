<div align="center">

# 🪺 BizNest Pakistan

**Pakistan's premier digital business discovery, growth, and ecosystem platform.**

Find, review, compare, and connect with local businesses, shops, restaurants, and
services across every province and district of Pakistan — powered by AI.

</div>

---

## ✨ Features

- **Business Discovery** — Browse businesses by category, province, district, and city
- **AI Matchmaker** — Get personalized business recommendations using Gemini AI
- **AI Writing Tools** — Auto-generate business descriptions, taglines, and SEO keywords
- **Smart Search** — Cascading province → district → city location selector
- **Interactive Maps** — Google Maps integration plus a visual Pakistan map
- **Compare & Cart** — Compare businesses side-by-side and shortlist them in a cart
- **Checkout & Plans** — Pricing plans with a full checkout flow
- **Authentication** — Email/password sign-up, login, and password reset (Supabase Auth)
- **Role-based accounts** — `user`, `business`, and `admin` roles with a user dashboard, account settings, and an admin panel
- **Live Stats & Testimonials** — Real-time engagement counters and community reviews
- **SEO Ready** — Per-page meta tags via `react-helmet-async`

## 🧰 Tech Stack

| Layer       | Technology |
| ----------- | ---------- |
| Frontend    | React 19, TypeScript, Vite 6, Tailwind CSS 4, Motion |
| Backend     | Express (local dev) + Vercel Serverless Functions (production) |
| Database    | Supabase (PostgreSQL) |
| Auth        | Supabase Auth |
| AI          | Google Gemini API (`@google/genai`) |
| Maps        | Google Maps Platform (`@vis.gl/react-google-maps`) |
| Hosting     | Vercel |

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (and npm)
- A **Supabase** project (free tier is fine)
- A **Google Maps Platform** API key
- A **Google Gemini API** key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it | Scope |
| -------- | --------------- | ----- |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API | Frontend (safe to expose) |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API | Frontend (safe to expose) |
| `VITE_GOOGLE_MAPS_PLATFORM_KEY` | Google Cloud Console → APIs & Services | Frontend (safe to expose) |
| `GEMINI_API_KEY` | Google AI Studio | **Server-side only — never expose in the browser** |

> `.env*` files are gitignored, so your keys stay private.

### 3. Set up the database

Open **Supabase Dashboard → SQL Editor → New Query**, paste the contents of
[`supabase/migration.sql`](supabase/migration.sql), and run it once.
It is idempotent, so re-running it is safe.

Storefront upgrade files (run in this order, both idempotent):

1. [`supabase/feature_storefront.sql`](supabase/feature_storefront.sql) —
   product discount column, public image buckets (`product-images`,
   `business-images`) with owner-only writes, and the one-business-per-account
   unique index (includes a duplicate-owner audit SELECT to verify first).
2. [`supabase/cities_bulk.sql`](supabase/cities_bulk.sql) — ~250 additional
   towns/tehsil HQs across every district (Kasur district alone gains 10
   towns).

### 4. Run the app locally

```bash
npm run dev
```

The app starts at **http://localhost:3000** — an Express server serves the Vite
frontend and mirrors the `/api/gemini/*` endpoints that run as Serverless
Functions in production.

## 📜 Scripts

| Script            | Description |
| ----------------- | ----------- |
| `npm run dev`     | Start the local dev server (Express + Vite) on port 3000 |
| `npm run build`   | Build the Vite frontend and bundle the Express server to `dist/` |
| `npm start`       | Run the bundled server from `dist/` |
| `npm run preview` | Preview the built frontend with Vite |
| `npm run lint`    | Type-check the project (`tsc --noEmit`) |
| `npm run clean`   | Remove `dist/` build artifacts |

## 📁 Project Structure

```
├── api/gemini/          # Vercel Serverless Functions (Gemini AI endpoints)
├── src/
│   ├── components/      # React UI components (modals, sections, maps, dashboard…)
│   ├── data/            # Location data & services (provinces, districts, cities)
│   ├── lib/             # Supabase client, auth, DB helpers, validation
│   ├── types.ts         # Shared TypeScript types
│   └── main.tsx         # App entry point
├── supabase/
│   └── migration.sql    # Complete database schema (idempotent)
├── server.ts            # Local dev server (Express + Vite + Gemini mirror)
├── vercel.json          # Vercel build output & rewrite rules
└── .env.example         # Environment variable template
```

## ☁️ Deployment (Vercel)

1. Push this repository to GitHub and import it in [Vercel](https://vercel.com).
2. The `vercel.json` handles the build (`npm run build`, output in `dist/`) and
   routes `/api/gemini/*` to the Serverless Functions.
3. Add all environment variables from [step 2](#2-configure-environment-variables)
   to the Vercel project (Production, Preview, and Development environments).
4. Deploy — that's it. The frontend talks to Supabase directly, and the
   `GEMINI_API_KEY` stays server-side inside the `/api/gemini/*` functions.

## 📄 License

Private project — all rights reserved.
