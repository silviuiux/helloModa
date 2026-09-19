# helloModa — Changelog

Living log, append-only — never rewrite past entries, add new ones at the top.

---

## 2026-09-19 — Phase 0 shipped: real Next.js + Supabase infra

Migrated the app from the Vite/mock-data prototype to the actual production
stack decided in `02-tech-stack.md`:

- Created the `helloModa` Supabase project (`hdbwcjtvbjeisgtpisne`, eu-central-1
  / Frankfurt, ~$10/mo). Applied the initial schema from `04-data-model.md`
  (profiles, wardrobe_items, conversations, messages, products,
  outfit_recommendations, subscriptions, marketplace tables), `pgvector`
  enabled, RLS on every table, an auto-profile-on-signup trigger. Fixed one
  security-advisor warning (publicly-executable trigger function).
- Scaffolded Next.js 15 (App Router), ported all existing UI components
  unchanged (Sidebar, ChatView, WardrobeView, etc. — same visual language).
- Real auth: Supabase magic-link sign-in, session-refresh + invite-only gate
  in middleware (`shouldCreateUser: false`), sign-out wired into the sidebar.
- Real wardrobe persistence: add/favorite/remove now hit the database via
  Server Actions, scoped by RLS — a new account starts empty, as intended.
  Chat still runs on seed data; wiring a real LLM is Phase 1.
- Verified: clean `npm install`, clean `npm run build`, and a live smoke test
  against the real Supabase project confirming unauthenticated requests
  redirect to `/login` (307) and the login page renders (200).

**Manual action still needed (not exposed by any available tool):** disable
public sign-up for the `helloModa` Supabase project in the dashboard
(Authentication → Providers → Email) — see `README.md`. Until done, the
`shouldCreateUser: false` flag on the client is the only thing enforcing
invite-only access.

Next action: start Phase 1 (real chat via Claude API, closet photo
ingestion, affiliate-backed recommendations, Wedding Guest landing pages).

## 2026-09-19 — Production plan compiled

Compiled this full `docs/` set from: the original business plan (attached 2026-09-18), an
audit of the existing repo (static Vite/React/Tailwind UI shell, mock data only, no backend),
and prior planning notes found in the `brain` vault (`Projects/helloModa.md`,
`Tech/Tech Stack & Tools.md`, `HELLO-CORP.md`).

Decisions locked in (see `00-overview.md` for full detail):
- Scope: full business-plan vision, staged across 5 phases.
- Stack: Next.js + Supabase (matches prior vault decision), pgvector instead of a separate
  Pinecone instance, hosted SDXL/CLIP inference instead of self-hosted GPU.
- Posture: low-profile / private beta only until the Fashion Days employment-contract question
  is resolved — no public launch, no eMAG/Fashion Days affiliate integration in the meantime.
- Resourcing: solo, willing to spend $100s–$1000s/mo on paid APIs/infra.

Next action: start Phase 0 (Next.js + Supabase scaffolding, port existing UI components).
