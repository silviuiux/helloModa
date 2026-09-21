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
see `.env.local.example`. Wardrobe is real (add/favorite/remove, plus photo
upload + AI attribute tagging — snap a photo, Claude vision prefills name/
category/color/brand, still editable; stored in the private `wardrobe-photos`
Storage bucket). **Profile is real** (`/profile` — username, gender, avatar,
measurements, sizes, style preferences, favorite/avoid brands) and actually
feeds the stylist prompt (`formatProfileForPrompt`, `src/lib/stylist.js`),
not just storage. "Shop" suggestions in chat
are honest AI guesses with no fabricated price/retailer, since there's no
real product catalog yet (Awin integration,
`docs/05-integrations-affiliates.md`, on hold). **Wardrobe items are CLIP-embedded**
(`src/lib/embeddings.js`, `wardrobe_items.embedding`) with a pgvector similarity search
(`match_wardrobe_items()`, `src/lib/wardrobeMatching.js`) — shared infra for the eventual
Awin-catalog matching, usable today against the closet. Not yet wired into the chat/
recommendation flow itself. **The Awin catalog side is real too, for Italist** (first approved
advertiser, 2026-09-21) — `scripts/sync-products-italist.mjs` syncs its product feed into
`products` and embeds it, `match_products()`/`src/lib/productMatching.js` finds real catalog
hits the same way. Not yet wired into `/api/chat`'s "shop" suggestions (see
`docs/05-integrations-affiliates.md`).

**SEO landing pages are live and public** — `/what-to-wear` and 9 statically generated
`/what-to-wear/[slug]` guides, grouped into Wedding Guest (beach, black-tie, garden, vineyard,
fall, winter) and Everyday Occasions (job interview, first date, summer festival) — the one
deliberate exception to the app's invite-only auth gate. Cleared 2026-09-20 per
`docs/06-risks-legal.md`'s Fashion Days conflict-of-interest review (previously blocked, see
that doc's changelog note). Editorial redesign with real generated hero images
(`scripts/generate-guide-images.mjs`, run manually — needs `REPLICATE_API_TOKEN`) and a
"See it in helloModa" showcase styled like a real chat turn — pages degrade gracefully to
illustrated placeholders until that script has been run.

**Error monitoring (Sentry) + product analytics (PostHog) are wired** — the
last Phase 0 exit criterion, done 2026-09-20. Both are safe no-ops until you
set `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY` (`.env.local.example`);
see `src/lib/analytics.js` and `src/instrumentation.js`.

**Phase 2 image generation is real** — `POST /api/generate-image` calls
Replicate (`black-forest-labs/flux-dev`) with the stylist's `heroPrompt` and
caches the result in the private `generated-looks` Storage bucket. Requires
`REPLICATE_API_TOKEN` set (server-only) — see `.env.local.example`.
`OutfitHero.jsx` fires the call itself right after a turn renders, showing a
"Generating…" state in between.

**Conversation UX, redesigned 2026-09-19** per `docs/09-conversation-design.md`
(the maintained rules doc — read it before changing chat behavior/layout):
one outfit direction per turn (title + narrative + hero visual side by side,
no container chrome — hero visual is now a real generated image, see above),
the underlying product cards
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
- **Sentry** (error monitoring) + **PostHog** (product analytics) — see `src/instrumentation.js`,
  `src/instrumentation-client.js`, `sentry.server.config.js`, `sentry.edge.config.js`.
- **Replicate** (`black-forest-labs/flux-dev`) for real outfit-image generation — `src/lib/imageGen.js`.

Full reasoning for these choices: `docs/02-tech-stack.md`.

## Structure

```
src/
  instrumentation.js            loads Sentry per runtime; reports framework-level request errors
  instrumentation-client.js     client-side Sentry init
  middleware.js                session refresh + invite-only auth gate
  app/
    layout.jsx                 root layout, fonts, metadata, PostHogPageview
    global-error.jsx            catches errors escaping the whole app shell, reports to Sentry
    globals.css                Tailwind + glass/HUD surface styles
    page.jsx                   protected home route — fetches wardrobe + conversation list
    AppShell.jsx                app shell, view routing, wardrobe + conversation state (client)
    login/page.jsx              email + password sign-in
    register/page.jsx           email + password sign-up
    auth/callback/route.js      PKCE "code" exchange (OAuth, future)
    auth/confirm/route.js       "token_hash" confirmation (signup email link)
    profile/page.jsx            protected profile route — loads + signs the avatar
    what-to-wear/page.jsx       public SEO guides index (not auth-gated)
    what-to-wear/[slug]/page.jsx public SEO guide detail, statically generated
    robots.js / sitemap.js      public-route-only crawl rules (Next file conventions)
    api/chat/route.js           real chat: Claude call, structured output, DB persistence
    api/wardrobe/tag/route.js   vision call: photo -> name/category/color/brand
    api/wardrobe/backfill-embeddings/route.js  one-off: embeds pre-existing wardrobe items
    api/generate-image/route.js Replicate call: heroPrompt -> real outfit image, cached + signed
  actions/
    wardrobe.js                 Server Actions: add/toggle-favorite/remove wardrobe items
    profile.js                  Server Action: update profile (fields + avatar path)
    conversations.js            Server Actions: list conversations, load a conversation's messages
    auth.js                     Server Action: sign out
  lib/
    supabase/client.js          browser Supabase client
    supabase/server.js          server Supabase client (Server Components/Actions)
    supabase/middleware.js      session-refresh helper used by middleware.js
    stylist.js                  Zod schema + system prompt for structured chat replies;
                                 formatProfileForPrompt/formatWardrobeForPrompt context builders
    wardrobeTagger.js           Zod schema + system prompt for photo -> attributes
    wardrobeImages.js           signs `wardrobe-photos` Storage paths into short-lived URLs
    profileImages.js            signs `avatars` Storage paths into short-lived URLs
    lookImages.js                signs `generated-looks` Storage paths into short-lived URLs
    imageGen.js                  Replicate call: heroPrompt -> generated outfit image (Blob)
    embeddings.js                 CLIP text/image embeddings via Replicate (shared vector space)
    wardrobeMatching.js           pgvector similarity search over the caller's own wardrobe
    productMatching.js             pgvector similarity search over the synced affiliate catalog
    imageResize.js               client-side photo downscale before tag/upload
    analytics.js                 PostHog init + track()/identifyUser(), safe no-op without a key
    siteConfig.js                 SITE_URL — metadataBase, robots.js, sitemap.js, JSON-LD
    look.js                     stylist piece -> wardrobe item shape (save-to-closet)
    iconMap.jsx                 garment-icon resolver
  data/
    seed.js                      static reference data (wardrobe categories)
    guides.js                     the 6 SEO guides' content — add an object here to add a guide
  components/
    BottomBar.jsx                every control, one bar: home/new-chat, chat/wardrobe
                                 toggle, composer, history, share, account -> profile link (docs/09)
    PostHogPageview.jsx          manual pageview capture (App Router nav isn't a full page load)
    Icons.jsx                   inline stroke icon set (no deps)
    auth/SocialButtons.jsx      inert Google/Apple/Facebook/X placeholders
    chat/
      EmptyState.jsx             welcome screen: greeting, occasion cards, example prompts
      ChatView.jsx                message list only — sending lives in AppShell now
      MessageBubble.jsx           one turn: title, narrative, hero, quick replies, toolbar
      OutfitHero.jsx               real generated outfit-in-scene image (calls /api/generate-image itself)
      RecommendationCards.jsx     product grid, revealed via "Find items for this outfit"
    wardrobe/
      WardrobeView.jsx            grid, search, category filters
      WardrobeItemCard.jsx        item tile (favorite / remove)
      AddItemModal.jsx            add a piece — photo picker + AI tagging, or manual fields
    profile/
      ProfileForm.jsx              username/gender/avatar/measurements/sizes/style/brands
    guides/
      GuideLayout.jsx               shared chrome for /what-to-wear pages (not AppShell)
      GuideHeroImage.jsx             real generated image, falls back to GarmentArt illustration
      GuideShowcase.jsx              "See it in helloModa" — styled like a real chat turn
```

## Design language

Warm lavender-gray canvas, visionOS-style glass HUD panels, purple accent.
Editorial serif display (Fraunces) against monospaced data labels — shares
helloCorp's DNA.

## Next ideas (Phase 1+, see `docs/03-roadmap.md`)

Awin signup + affiliate product matching for "shop" suggestions ·
"upload your invitation" dress-code parsing · calendar sync · digital
avatar · circular marketplace.
