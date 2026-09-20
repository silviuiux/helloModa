# helloModa — Technology Stack

Concrete choices, with the reasoning and the alternative considered. Optimized for: solo
builder, $100s–$1000s/month budget, ship fast, minimize number of systems to operate.

| Layer | Choice | Why | Alternative considered |
|---|---|---|---|
| Frontend framework | **Next.js 14/15 (App Router)** | Matches prior vault decision; SSR helps the SEO-led GTM wedge (landing pages); one deploy target with the backend | Keep Vite SPA — rejected, no SSR, worse for SEO landing pages |
| Styling | **Tailwind CSS** | Already used in the current prototype; port config/tokens directly | — |
| UI components | Port existing `Sidebar`, `ChatView`, `WardrobeView`, `RecommendationCards`, etc. from the Vite repo into Next.js | Design work is already done and looks good; don't redo it | — |
| Mobile | **Deferred to Phase 5** — React Native/Expo when the web core loop is validated | Avoid maintaining two frontends before there's a proven product | React Native from day one — rejected, too much surface area solo |
| Auth | **Supabase Auth** | Bundled with the DB you're already using; email + Google/Apple OAuth out of the box; RLS integrates directly | Clerk/Auth0 — cleaner DX but an extra vendor and extra cost for no real gain here |
| Database | **Supabase Postgres** | Managed Postgres, generous free tier → Pro at $25/mo, RLS for per-user data isolation | Raw Postgres on Railway/Render — more ops work for no benefit at this scale |
| Vector search | **pgvector (inside Supabase)** | One less system than a dedicated vector DB; fine up to low-millions of vectors | Pinecone (original plan) — extra vendor/cost not justified yet |
| File storage | **Supabase Storage** | Same project, same auth/RLS model, S3-compatible under the hood | Cloudflare R2 direct — revisit only if storage cost becomes significant |
| LLM (conversational brain) | **Claude API** (Sonnet-tier model for main conversation; consider a cheaper/faster model for classification-style sub-tasks like intent extraction) | Best-in-class instruction following for the nuanced "vineyard wedding in June" style prompts described in the business plan; prompt caching keeps repeated system-prompt cost down | GPT-4 (business plan's other option) — comparable quality, no strong reason to pick over Claude here; can be swapped later since this is just an API call |
| Image generation | **Replicate**, `black-forest-labs/flux-dev` — ✅ wired 2026-09-20 (`src/lib/imageGen.js`), needs `REPLICATE_API_TOKEN` | Direct choice (over fal.ai, which was the soft default from earlier research) — Replicate's widest model selection and mature tooling won out; pay-per-generation, zero GPU infra to run/maintain solo. Model is a one-line swap (`MODEL` const in `imageGen.js`) if Flux's fashion-photorealism disappoints in practice | fal.ai — faster/cheaper per image by reputation, not chosen since Replicate's token was already in hand; revisit only if Replicate's cost/quality/latency proves worse at real volume. **Magnific** (formerly Freepik) — subscription+credit pricing, worse fit for spiky early-beta usage, still documented as a fallback. Self-hosted GPU (Modal/RunPod) — revisit only once volume is high enough that per-image hosted cost exceeds a dedicated GPU's amortized cost. |
| Computer vision / product matching | **CLIP embeddings** via the same hosted-inference provider, matched with pgvector | Standard, well-understood approach; no training required to start | YOLO segmentation (business plan's original mention) — useful later for precise garment-region cropping before embedding, not needed for a v1 nearest-neighbor match |
| Background jobs | **Trigger.dev** or **Inngest** | Free tier covers early volume; built-in retries/observability that you'd otherwise hand-roll solo | Supabase Edge Functions only — viable fallback, weaker tooling |
| Payments | **Stripe** | Subscriptions (helloModa Pro) now; Stripe Connect for marketplace payouts in Phase 4 | — |
| Affiliate tracking | Network-dependent (see `05-integrations-affiliates.md`) | — | — |
| Hosting | **Vercel** (Next.js) + **Supabase Cloud** | Zero-ops for both, EU region available for GDPR | Self-managed (Docker on a VPS) — more control, much more ops burden solo |
| Analytics | **PostHog** (cloud, free tier) — ✅ wired 2026-09-20, needs `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics + feature flags + session replay in one tool, generous free tier | — |
| Error monitoring | **Sentry** — ✅ wired 2026-09-20, needs `NEXT_PUBLIC_SENTRY_DSN` | Standard, free tier sufficient early | — |
| Calendar integration | Google Calendar API + Apple's EventKit/CalDAV (Phase 3 feature) | Matches business plan's "Calendar Sync" feature | — |

## Local dev

- Supabase CLI for local Postgres + Auth emulation during development.
- `.env.local` for API keys (Claude, fal.ai/Replicate, Stripe test keys) — never commit these;
  `.gitignore` already covers `.env*` (verify when the Next.js project is scaffolded).

## Migration note

The current repo's component code (`src/components/**`) is a reasonable starting point for the
Next.js port — same Tailwind setup, same visual language. Treat `App.jsx`'s local `useState`
wardrobe as scaffolding to replace with Supabase-backed data fetching, not logic to preserve.
