# helloModa — Changelog

Living log, append-only — never rewrite past entries, add new ones at the top.

---

## 2026-09-19 — Documented Magnific as an image-gen alternative

Added Magnific (formerly Freepik, rebranded April 2026) as a documented
alternative in `docs/02-tech-stack.md`'s image-generation row, per direct
request — same async task-id/poll API shape as fal.ai/Replicate so it fits
the existing background-job plan without rework, but subscription+credit
priced rather than pure pay-per-generation. Documentation only — no code
changed; the actual choice gets made when Phase 2 (real image generation)
starts, by trialing both on real outfit prompts.

## 2026-09-19 — Conversation redesign: one outfit per turn, no sidebar

Reworked the chat UX from XD mockups, per direct request. New rules doc:
`docs/09-conversation-design.md` — read it before changing chat behavior or
layout; it's the maintained source of truth, not this entry.

- **Turn shape:** one focused outfit direction per reply (short script-font
  title, editorial narrative, hero visual, 2-4 AI-authored quick-reply
  chips), not a grid of interchangeable product cards. The underlying
  structured pieces still generate and persist every turn — they're just
  collapsed by default behind a "Find items for this outfit" toggle.
- **Hero visual is a styled placeholder, not a real generated image** — by
  direct decision, to ship the layout/flow change without pulling in a paid
  image-gen provider signup today. `heroPrompt` is generated and stored on
  every turn regardless, so wiring real generation later is additive, not a
  rework of this schema.
- **Welcome screen** before the first message: greeting, GTM-relevant example
  occasion cards (Wedding Guest wedge + adjacent), example prompt chips.
  Conversations no longer auto-resume on page load — always start here;
  past conversations are one click away in the top bar's History dropdown.
- **No sidebar anywhere** (was: Chat-only decision, widened to the whole app
  per direct request) — replaced by a minimal top bar (brand, Chat/Wardrobe
  nav, History dropdown, account menu) over a narrow centered column.
  `Sidebar.jsx` and `LookContextPanel.jsx` deleted (recoverable from git
  history) along with the look-builder feature they implemented — no mockup
  called for it, and decluttering only meant something if things were
  actually removed, not just moved.
- Removed the "swap suggestion" control and its mock catalog
  (`lib/look.js#pickAlternative`, `seed.js#catalog`) — no longer part of the
  simplified per-piece card. `seed.js` trimmed to just what's still real
  (wardrobe categories); everything else in it was already-dead mock data
  from before real chat/wardrobe existed.
- Schema: added `outfit_recommendations.hero_prompt` and `.quick_replies`.
- Verified visually via a temporary unauthenticated preview route (this
  sandbox's network egress blocks direct browser/server calls to
  `*.supabase.co`, so a real logged-in Playwright session wasn't possible
  here) — desktop and mobile screenshots confirmed the welcome screen, a
  live-shaped turn, the "Find items" toggle, and the History dropdown all
  render and behave correctly; one real bug found and fixed this way (the
  History dropdown overflowed the viewport edge). The preview route,
  its middleware bypass, and the test account used were all removed after.

## 2026-09-19 — Real chat, wired to Claude, with multi-conversation support

Replaced the mock seed conversation with real chat, the first Phase 1 item
(`docs/03-roadmap.md`) to ship:

- `POST /api/chat` — calls Claude (`claude-opus-5`) with a stylist system
  prompt (`src/lib/stylist.js`) and structured JSON output (Zod +
  `output_config.format` via `client.messages.parse`), so the reply plugs
  directly into the existing recommendation-card UI without a redesign.
- The AI is given the user's real wardrobe (exact ids) and told to prefer
  reusing owned pieces; a returned `wardrobeItemId` is validated server-side
  against the actual wardrobe before trusting it (never rendered on
  unverified model output).
- New pieces the AI suggests to buy are stored and shown honestly as
  unmatched AI suggestions — no fabricated retailer name or price — since
  there's no real product catalog yet (Awin integration not started).
- Conversation + message history now persists in Postgres (`conversations`,
  `messages`, `outfit_recommendations`, `outfit_recommendation_items`).
  Multi-conversation support shipped ahead of its original Phase 3 slot
  (list/switch/new-chat in the sidebar), per direct request.
- Schema changes: added `outfit_recommendations.title`; relaxed
  `outfit_recommendation_items`' check constraint and added
  `suggested_brand/name/category` columns to hold a pure AI suggestion that
  isn't yet linked to a wardrobe item or a real catalog product — the
  original constraint only anticipated those first two cases.
- Also revoked a leftover `PUBLIC` execute grant on `handle_new_user()`
  (the anon/authenticated-specific revoke from Phase 0 didn't cover the
  broader `PUBLIC` role grant that PostgREST exposure inherits from) —
  closes a security-advisor warning that had persisted silently since then.

Requires `ANTHROPIC_API_KEY` (server-only). Not yet set anywhere at the time
of this entry — verified via a clean build only; the live round-trip to
Claude is unverified pending that key being added to Vercel.

## 2026-09-19 — Gated registration behind an invite code

Closed the open self-serve sign-up gap from the previous entry: `/register`
now requires a shared `INVITE_CODE` (server-only env var, checked in
`registerWithInvite` in `src/actions/auth.js` before `signUp()` runs).
Verified with a headless-browser test against the real dev build: a wrong
code is rejected with no Supabase call made; a correct code passes the gate
and reaches the actual `signUp()` call (that last leg couldn't be fully
round-tripped in this dev sandbox — its network egress policy blocks direct
calls to `*.supabase.co` outright, confirmed independently with a raw
`fetch()`, unrelated to this app's code and not a constraint that exists on
Vercel). Also hardened `registerWithInvite` to return a clean error message
instead of raw parser text if Supabase's response is ever unavailable or
non-JSON (outage, network blip).

This is a single shared secret, not per-invite tracked codes — reasonable for
a solo private beta, worth a real `invite_codes` table (per-code, single-use,
attributable) before a wider beta. The Supabase dashboard's "Allow new users
to sign up" toggle is still unconfirmed and worth disabling too, as defense
in depth alongside the code check.

## 2026-09-19 — Switched auth from magic-link to email + password

Replaced the OTP/magic-link sign-in with standard email + password
login (`/login`) and registration (`/register`), per direct request. Added
inert placeholder buttons for Google/Apple/Facebook/X
(`src/components/auth/SocialButtons.jsx`) — visible, disabled, no-op —
to wire up later. Added `/auth/confirm` (token_hash-based) alongside the
existing `/auth/callback` (PKCE code-based) since Supabase's default signup
confirmation email uses the former.

Deleted the magic-link-only placeholder account created earlier
(`silviuxardelean@gmail.com` had no password set, incompatible with the new
flow) so it can be created fresh through the real Register form instead —
this means no password ever passed through this session/chat.

**Net effect on the low-profile posture (`06-risks-legal.md`):** registration
is now **open self-serve sign-up** — the `shouldCreateUser: false` guard that
gated the old magic-link flow doesn't have an equivalent for
`auth.signUp()`. The only remaining gate is whatever the Supabase Auth
dashboard's "Allow new users to sign up" toggle is set to, and that still
hasn't been confirmed disabled. Until it is (or an invite-code check gets
added to `/register`), this app is realistically public-signable if the URL
leaks — flagged in `README.md` too so it isn't missed before any public step.

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
