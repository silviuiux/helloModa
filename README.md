# helloModa

Conversational AI stylist — turns mood, occasion, wardrobe, and budget into
curated outfit direction. Part of helloCorp.

See `docs/` for the full production plan (architecture, tech stack, roadmap,
data model, affiliate integrations, risks/legal, costs, conversation design).
Start at `docs/00-overview.md`.

## Status

Phase 0 (Foundations) done; Phase 1 (`docs/03-roadmap.md`) underway. Real
Next.js + Supabase infra: auth, database, RLS. **Chat is real** — `POST
/api/chat` calls Claude (`claude-opus-5`) with structured output, persisted
to Postgres, with multi-conversation support (History dropdown in the bottom
bar: list/switch/new chat). Requires `ANTHROPIC_API_KEY` set (server-only) —
see `.env.local.example`. Wardrobe is real (add/favorite/remove, no photo
upload/AI tagging yet — that's next in Phase 1). "Shop" suggestions in chat
are honest AI guesses with no fabricated price/retailer, since there's no
real product catalog yet (Awin integration,
`docs/05-integrations-affiliates.md`, not started).

**Conversation UX, redesigned 2026-09-19** per `docs/09-conversation-design.md`
(the maintained rules doc — read it before changing chat behavior/layout):
one outfit direction per turn (title + narrative + hero visual side by side,
no container chrome — hero visual is currently a styled placeholder, real
image generation is a deliberate later step), the underlying product cards
collapsed by default behind "Find items for this outfit", AI-authored
quick-reply chips, a welcome screen with example occasion cards before the
first message, and every control (nav, composer, history, share, account)
in one bottom bar (`BottomBar.jsx`) — no top bar, no sidebar, just a wide
centered content column.

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
    page.jsx                   protected home route — fetches wardrobe + conversation list
    AppShell.jsx                app shell, view routing, wardrobe + conversation state (client)
    login/page.jsx              email + password sign-in
    register/page.jsx           email + password sign-up
    auth/callback/route.js      PKCE "code" exchange (OAuth, future)
    auth/confirm/route.js       "token_hash" confirmation (signup email link)
    api/chat/route.js           real chat: Claude call, structured output, DB persistence
  actions/
    wardrobe.js                 Server Actions: add/toggle-favorite/remove wardrobe items
    conversations.js            Server Actions: list conversations, load a conversation's messages
    auth.js                     Server Action: sign out
  lib/
    supabase/client.js          browser Supabase client
    supabase/server.js          server Supabase client (Server Components/Actions)
    supabase/middleware.js      session-refresh helper used by middleware.js
    stylist.js                  Zod schema + system prompt for structured chat replies
    look.js                     stylist piece -> wardrobe item shape (save-to-closet)
    iconMap.jsx                 garment-icon resolver
  data/seed.js                  static reference data (wardrobe categories)
  components/
    BottomBar.jsx                every control, one bar: home/new-chat, chat/wardrobe
                                 toggle, composer, history, share, account (docs/09)
    Icons.jsx                   inline stroke icon set (no deps)
    auth/SocialButtons.jsx      inert Google/Apple/Facebook/X placeholders
    chat/
      EmptyState.jsx             welcome screen: greeting, occasion cards, example prompts
      ChatView.jsx                message list only — sending lives in AppShell now
      MessageBubble.jsx           one turn: title, narrative, hero, quick replies, toolbar
      OutfitHero.jsx               placeholder outfit-in-scene visual (real image-gen: later)
      RecommendationCards.jsx     product grid, revealed via "Find items for this outfit"
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

Photo upload + AI tagging for wardrobe items · Awin signup + affiliate
product matching for "shop" suggestions · outfit preview render (SDXL,
Phase 2) · calendar sync · digital avatar · circular marketplace.
