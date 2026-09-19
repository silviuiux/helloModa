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

**This app is meant to be invite-only / private beta** (docs/06-risks-legal.md —
low-profile posture pending a Fashion Days employment-contract review), but
registration is currently **open self-serve sign-up** — anyone who finds
`/register` can create an account. If that's not the intent, the actual gate
now has to be one of: disabling "Allow new users to sign up" in the Supabase
Auth dashboard (Authentication → Providers → Email, project ref
`hdbwcjtvbjeisgtpisne`, eu-central-1 — no MCP tool exposes this toggle, it's
dashboard-only), or adding an invite-code check in the register flow. Neither
is done yet — flagging so it doesn't get lost before this goes public.

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
