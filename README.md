# helloModa

Conversational AI stylist — turns mood, occasion, wardrobe, and budget into
curated outfit direction. Part of helloCorp.

See `docs/` for the full production plan (architecture, tech stack, roadmap,
data model, affiliate integrations, risks/legal, costs). Start at
`docs/00-overview.md`.

## Status

Phase 0 (Foundations) in progress — see `docs/03-roadmap.md`. Real Next.js +
Supabase infra is live: auth, database, RLS. Chat is still seed/mock data;
wiring it to a real LLM is Phase 1.

**Auth:** email + password (`/login`, `/register`). Social sign-in buttons
(Google, Apple, Facebook, X) are on the login/register pages but are inert
placeholders — `src/components/auth/SocialButtons.jsx` — wire these up to
real Supabase OAuth providers when that's prioritized.

**Registration is gated by a shared invite code** (docs/06-risks-legal.md —
low-profile/private-beta posture pending a Fashion Days employment-contract
review). Set `INVITE_CODE` (server-only, never `NEXT_PUBLIC_*`) in your env —
see `.env.local.example` — and ask Silviu for the actual value; it's not
committed anywhere. This is one shared secret, not per-user tracked codes —
fine for a solo private beta, worth revisiting with a real `invite_codes`
table before a wider beta. The Supabase Auth dashboard's "Allow new users to
sign up" toggle (Authentication → Providers → Email) is still worth confirming
disabled too, as defense in depth — no MCP tool exposes that setting.

## Run

```bash
npm install
cp .env.local.example .env.local   # fill in your own values if not using the shared project
npm run dev
```

Open the printed localhost URL. Unauthenticated requests redirect to `/login`
— register a new account at `/register` (email + password) to get in.

## Stack

- **Next.js 15 (App Router) + React 18** — SSR, Server Actions, one deploy target.
- **Supabase** — Postgres + Auth + Storage + `pgvector`, EU region (Frankfurt).
- **Tailwind CSS** — design tokens live in `tailwind.config.js`.
- Fonts (Fraunces / Inter / IBM Plex Mono) load from Google Fonts in `src/app/layout.jsx`.

Full reasoning for these choices: `docs/02-tech-stack.md`.

## Structure

```
src/
  middleware.js                session refresh + invite-only auth gate
  app/
    layout.jsx                 root layout, fonts, metadata
    globals.css                Tailwind + glass/HUD surface styles
    page.jsx                   protected home route — fetches real wardrobe data
    AppShell.jsx                app shell, view routing, wardrobe state (client)
    login/page.jsx              email + password sign-in
    register/page.jsx           email + password sign-up
    auth/callback/route.js      PKCE "code" exchange (OAuth, future)
    auth/confirm/route.js       "token_hash" confirmation (signup email link)
  actions/
    wardrobe.js                 Server Actions: add/toggle-favorite/remove wardrobe items
    auth.js                     Server Action: sign out
  lib/
    supabase/client.js          browser Supabase client
    supabase/server.js          server Supabase client (Server Components/Actions)
    supabase/middleware.js      session-refresh helper used by middleware.js
    iconMap.jsx                 garment-icon resolver
  data/seed.js                  mock data still used by chat (real LLM wiring is Phase 1)
  components/
    Sidebar.jsx                 brand, style memory, nav, account/sign-out
    Icons.jsx                   inline stroke icon set (no deps)
    auth/SocialButtons.jsx      inert Google/Apple/Facebook/X placeholders
    chat/
      ChatView.jsx               header + chips + messages + composer
      MessageBubble.jsx          user / AI bubbles
      RecommendationCards.jsx    outfit suggestion cards
      Composer.jsx                input + quick prompts
      LookContextPanel.jsx        right panel: silhouette / palette / risk
    wardrobe/
      WardrobeView.jsx            grid, search, category filters
      WardrobeItemCard.jsx        item tile (favorite / remove)
      AddItemModal.jsx            add a piece (now persists via Server Action)
```

## Design language

Warm lavender-gray canvas, visionOS-style glass HUD panels, purple accent.
Editorial serif display (Fraunces) against monospaced data labels — shares
helloCorp's DNA.

## Next ideas (Phase 1+, see `docs/03-roadmap.md`)

Real chat wired to Claude · photo upload + AI tagging for wardrobe items ·
outfit preview render (SDXL) · affiliate product matching · calendar sync ·
digital avatar · circular marketplace.
