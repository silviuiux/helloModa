# helloModa — Architecture

## System shape

```
                         ┌─────────────────────────┐
                         │        Next.js app       │
                         │  (Vercel — App Router)   │
                         │                           │
                         │  UI (ported from current  │
                         │  Vite shell) + Server      │
                         │  Actions / Route Handlers │
                         └───────────┬───────────────┘
                                     │
              ┌──────────────────────┼───────────────────────┐
              │                      │                        │
              ▼                      ▼                        ▼
     ┌────────────────┐    ┌──────────────────┐     ┌──────────────────┐
     │    Supabase     │    │   Job queue /     │     │  External APIs    │
     │ Postgres + Auth │    │   background       │     │                    │
     │ + Storage +      │◄──►│   worker           │────►│ Claude (chat)      │
     │ pgvector         │    │ (Inngest/Trigger.dev│     │ Image-gen (fal.ai/ │
     │                  │    │  or Supabase Edge   │     │ Replicate — SDXL)  │
     │                  │    │  Functions)          │     │ CLIP embeddings    │
     └────────────────┘    └──────────────────┘     │ Affiliate/retailer  │
                                                        │ product feeds       │
                                                        │ Stripe               │
                                                        └──────────────────┘
```

## Components

### 1. Next.js app (frontend + thin backend)
- App Router, React Server Components for read-heavy views (wardrobe grid, style journal),
  client components for the chat interface and interactive cards (ported near-1:1 from the
  existing `ChatView`, `RecommendationCards`, `WardrobeView` components).
- Server Actions / Route Handlers call Supabase directly for CRUD, and call the job queue for
  anything slow (image generation, CV matching, closet-item background removal + tagging).
- Deployed on Vercel. Environment: EU region (Frankfurt) for GDPR data-residency reasons.

### 2. Supabase (system of record)
- **Postgres** — users, wardrobe items, conversations, recommendations, product cache,
  marketplace listings/transactions (see `04-data-model.md`).
- **Auth** — email/OAuth (Google/Apple) sign-in. Row-Level Security scoped per user from day one.
- **Storage** — user-uploaded wardrobe photos, generated outfit images, avatar assets.
- **pgvector extension** — replaces the business plan's original "Pinecone" line item. Product
  embeddings (CLIP vectors) and closet-item embeddings live in Postgres directly, matched with
  `pgvector`'s cosine-distance index. One fewer system to run/pay for/keep in sync, and
  perfectly adequate at this scale (tens of thousands to low millions of product vectors).
  Revisit a dedicated vector DB only if match latency or catalog size becomes a real problem.

### 3. Background job worker
Anything that takes more than ~1-2s or costs money per call should never block a request:
- Outfit image generation (SDXL call, several seconds).
- Closet photo ingestion: background removal + attribute tagging (color/cut/season) via a
  vision model.
- CV product matching: embed the generated look, query pgvector against the cached product
  catalog, return top matches.
- Affiliate feed sync (nightly/hourly pull of retailer product feeds into the product cache).

Recommended: **Trigger.dev** or **Inngest** (both have generous free tiers, integrate cleanly
with Next.js + Vercel, and give you retries/observability for free — worth it solo, since you
won't be hand-rolling a queue). Supabase Edge Functions are a fallback if you want to avoid a
third vendor, at the cost of weaker retry/observability tooling.

### 4. External APIs
- **LLM (the conversational brain):** Claude API — see `02-tech-stack.md` for model choice.
- **Image generation:** hosted SDXL (or a fashion-tuned variant) via fal.ai or Replicate — pay
  per generation, no GPU infra to run yourself.
- **CV/embeddings:** CLIP via the same hosted-inference providers (fal.ai/Replicate both offer
  CLIP endpoints), or OpenAI's embeddings API for text-side matching.
- **Affiliate/retailer data:** see `05-integrations-affiliates.md`.
- **Payments:** Stripe (subscriptions + eventual marketplace payouts via Stripe Connect).

## Why not the business plan's original stack verbatim

The original plan named Python/FastAPI + a separate Pinecone vector DB + React Native from day
one. Given solo/budget-constrained resourcing, this plan consolidates:
- **FastAPI → Next.js Route Handlers / Server Actions.** No second backend language/repo to
  maintain solo. Revisit a dedicated Python service only if you end up doing real ML work
  (e.g. fine-tuning a model yourselves) rather than calling hosted inference APIs.
- **Pinecone → Supabase pgvector.** One database instead of two, no extra vendor.
- **React Native → deferred to Phase 5.** Ship web first (faster iteration, works for the SEO-led
  "Wedding Guest" go-to-market wedge from the business plan), add the mobile app once the core
  loop is validated.
