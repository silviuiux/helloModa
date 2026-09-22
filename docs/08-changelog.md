# helloModa — Changelog

Living log, append-only — never rewrite past entries, add new ones at the top.

---

## 2026-09-22 — Light theme with violet accent; placeholder photos replace vector art

Direct request: keep the light theme with purple accents, and use placeholder images instead of
the vector garment graphics throughout the app.

- **Light theme.** The redesign's structure stays: orb, organic motion, choreography, and
  Plus Jakarta Sans / Instrument Serif / IBM Plex Mono. The tokens flip back to light:
  - canvas `#f5f3fa`, paper `#fff`, ink `#1e1a2e`
  - accent violet `#8b6cf0`, deep `#6a4bd8`, soft `#d4c8fb`, tint `#f0ebff`
  - purple-tinted shadows and a violet glow
  - `.app-canvas` haze, glass, grain (multiply), scrollbar, skeleton, and the orb (lavender body,
    violet blobs, halo and ripple) recoloured in `globals.css`
  - favicon is a violet orb
- **Contrast fixes.**
  - Image overlays (avatar, vibe, occasion, and empty-state cards; outfit error) use an ink scrim
    with white text.
  - Modal scrims are `bg-ink/25`.
  - The composer fade, wardrobe card controls and label fade, `.input`, and global-error are all
    light.
- **Placeholder photos.** `GarmentArt.jsx` is deleted. The new `src/lib/placeholder.js` is the one
  place the source is defined: deterministic picsum seed URLs. The new `PlaceholderImage.jsx`
  loads in three steps: the real image, then the seeded placeholder photo, then a soft violet
  plate. It's used in:
  - landing: the stage visuals, the editorial plates (the `shapes` prop is removed), the occasion
    marquee, and the detail specimens (copy updated)
  - chat: the empty-state cards, the outfit hero, and recommendation cards
  - vibe cards and guide hero images
  - Each slot seeds on a stable key (slug, id, or path), so it always shows the same photo until
    the real image replaces it.
- **Intentionally kept.** Wardrobe item cards still show the garment-colour swatch and icon. A
  random photo would misrepresent the user's own clothes.
- **Caveats.**
  - The picsum photos are generic, not fashion. A curated set can go in `public/placeholders/`
    by changing only `placeholderSrc`.
  - The sandbox blocks picsum and Google Fonts. Screenshots showed the violet fallback plate and
    fallback fonts, so real photos haven't been seen rendered yet.

---

## 2026-09-22 — Full redesign: "organic intelligence" (app + landing page)

Direct request: a complete redesign of the app and landing page — super minimalist but friendly,
an organic AI interface with organic animated elements and loaders, smooth transitions between
states, a conversation that feels natural, while staying sharp, futuristic and minimal. Built
against Silviu's taste system (dark-first, typographic authority, glass materiality, mono data
labels, one accent, restrained motion) — which the previous light-lavender/purple identity, Inter
body face and script display face all contradicted, so this is a from-the-tokens-up change, not a
reskin.

**The concept: organic inside, precise outside.** One warm, living element — the orb — set in an
otherwise dark, sharp, mono-labelled interface.

- **Design tokens rebuilt** (`tailwind.config.js`, `globals.css`, `layout.jsx`): warm near-black
  canvas (`#0f0e0c`) with an atmospheric amber haze instead of a flat fill; warm off-white ink;
  one industrial-amber accent (`#d4a853`) used sparingly; dark glass. Plus Jakarta Sans (display
  + body, replacing Fraunces/Inter), Instrument Serif for the look titles (replacing the
  handwritten Yuyu Short), IBM Plex Mono kept for data labels. All colors stay alpha-free hex so
  the codebase's existing opacity modifiers (`border-line/70`, `bg-accent-tint/70`) keep working.
  Speaker corners kept but sharpened: 28px/6px on large surfaces, 14px/4px on small ones.
  Primary buttons are 10–12px rounded rectangles with dark text on amber (pills are for tags).
- **The orb** (`src/components/Orb.jsx`, CSS in `globals.css`): a morphing amber body inside a
  crisp 1px ring. Three states — `idle` (breathes), `listening` (swells, ring brightens),
  `thinking` (tightens, an inner ripple surfaces). State changes only touch transitionable
  properties (scale/opacity/filter/border-color) and never an animation's duration, because
  changing duration mid-cycle makes the blob visibly jump — so every state change is a ~0.9s
  blend. Pure CSS, no canvas/WebGL or animation library. Its `morph`/`drift`/`breathe` keyframes
  live in `globals.css` rather than the Tailwind config, since Tailwind only emits keyframes an
  `animate-*` utility actually uses.
- **Organic loaders, never spinners**: `ThinkingLine` is the orb in its thinking state with
  phrases that dissolve into each other; outfit-image generation shows a dark plate with a slow
  warm light sweep and the orb (`OutfitHero` `pending`), and the finished painting resolves in
  from a blur once it has actually loaded (not when its URL arrives).
- **Conversation choreography**: everything materializes (rise + blur-resolve) instead of
  sliding; a freshly arrived reply streams in word by word, and its actions and quick replies
  wait for the stream to finish (verified: opacity 0 mid-stream, 1 after). The welcome orb
  listens while you type and thinks while a reply is made (verified in the DOM: both orbs switch
  to `listening` on input). The composer floats over a fade instead of a hard bar edge, glows
  amber on focus, and its send button only lights up with a draft. Chat ↔ wardrobe crossfades.
- **Landing page** rebuilt around an immersive-object hero: the orb (cycling through its real
  states, with a live `state:` readout) with four NASA-poster callouts on hairlines whose dots
  are computed to sit on the ring, then a massive tight-tracked headline bottom-left and the one
  CTA bottom-right — all above a 900px fold. New trust band, larger statements, a "Presence"
  specimen card showing the three orb states, closing CTA with the orb, multi-column footer.
  "Details" copy updated so the page's claims about its own design stay true (no more "128px",
  "script" or "handwritten face").
- **Sweep**: every surface moved to the dark system — wardrobe, profile, avatars, outfits,
  login/register, guides, global error — via one rule-based pass (translucent white → faint light
  lifts, white fades → canvas fades, `text-white` on amber → dark text), with special cases where
  a naive swap would break contrast: modal scrims (`bg-ink/30` would now lay a pale haze over the
  app), and wardrobe cards, whose controls and labels sit on real garment-colour swatches that
  can be light. `GarmentArt` fallbacks became fine light linework with amber detail dots on dark
  plates; `EditorialPlate` palettes were re-graded dark.
- **Two pre-existing bugs surfaced by the redesign and fixed**: on first load with no messages,
  `ChatView`'s auto-scroll-to-bottom pushed the entire welcome (now the orb) out of view — it now
  stays at the top until there's a thread; and hero geometry on phones (a CSS `scale()` doesn't
  shrink the layout box, so the orb overflowed its cell off-centre).

**Verification**: `npm run build` clean. Public pages (landing, login, guides) screenshotted
with Playwright at 1440×900 and 390×844 — no page errors, no horizontal overflow on mobile. The
signed-in chat, composer states, image skeleton and wardrobe were verified through a temporary
local-only page under the already-public `/what-to-wear/` path rendering the real components
with sample data — deleted before commit, never shipped, and no auth/middleware change made to do
it. **Fonts are unverified visually**: this sandbox can't reach Google Fonts, so every screenshot
shows fallback faces — Plus Jakarta Sans and Instrument Serif need a look on a real deploy.

---

## 2026-09-22 — Usage metering + free/Pro plumbing

Follow-up to a monetization brainstorm: before any revenue model works, this app needed the thing
it didn't have at all — a bound on per-user Claude/Replicate cost, and an actual gate the
`subscriptions` table (present since Phase 0, never wired to anything) could sell.

- **New `usage_events` table** (migration `usage_metering`) — one row per billable action.
  Scoped to the two real per-request external-API costs for v1: `chat_message` (`/api/chat`) and
  `image_generation` (`/api/generate-image` and `/api/avatar/generate`, sharing one bucket since
  both are a Replicate generation call). Wardrobe/avatar vision-tagging calls aren't metered yet
  — smaller, less frequent, deliberately out of scope for a first pass.
- **`src/lib/plans.js` + `usage.js`**: free caps at 30 chat messages and 10 image generations per
  calendar month, Pro unlimited — starting numbers, not tuned against real usage data (no
  production traffic to tune against yet, same honest caveat as this session's product-match
  threshold and avatar quota work). `assertUnderQuota()` checks and throws before any billable
  work happens (fail fast, before writing conversation/message rows or spending on a Claude call);
  `recordUsage()` is called only after the actual cost was incurred, not before, so a request that
  fails midway (bad input, API error) never burns a slot of the user's quota it didn't actually use.
- **Family avatars gated too**: free is self-only, Pro unlocks the existing self+3 cap
  (`actions/avatars.js`, `/avatars` page). The "Add family member" tile is replaced by a plain
  "Add family members with Pro" card at the free cap, rather than letting someone fill out the
  whole form and get blocked only on submit.
- **Surfaced, not silent**: a quota-exceeded response shows a real message ("You've used your 30
  free styling messages this month...") in the chat error bubble (existing generic error-message
  path) and, new, under the outfit hero image when generation is blocked
  (`useOutfitImage.js`/`OutfitHero.jsx` now carry the failure reason through, where before any
  generation failure — quota or otherwise — just showed a silent placeholder forever). A new
  `UsageSummary.jsx` on `/profile` shows the month's running totals so a limit isn't a surprise.
- **Found and fixed a real, unrelated bug while wiring `getUserPlan()`**: `subscriptions` has had
  RLS enabled since Phase 0 with **zero policies** — meaning no user could ever read their own
  subscription row back, even once Stripe existed and wrote one. Would have silently made every
  account look "free" forever regardless of actual billing status. Added an owner-select policy
  (migration `subscriptions_owner_select`); writes are still meant to come only from a trusted
  Stripe webhook via the service role, so no insert/update policy was added for users.

**Not built yet, the deliberate next step**: real Stripe Checkout, a webhook writing
`subscriptions` rows, a pricing page, and billing management — this ships the metering and the
gate, not a way to actually pay for Pro. Every account is "free" in practice until that exists.
`npm run build` passes with no errors; the new RLS policies and table were checked directly
against the live Supabase project.

---

## 2026-09-22 — Wire Awin product matching into chat, fix the embedding backlog

Picked back up `05-integrations-affiliates.md`'s explicitly-flagged follow-up: "Not yet wired
into `/api/chat`." Checked the real state of things directly against Supabase before writing any
code, and found two problems worth fixing alongside the wiring itself, not after:

- **The Italist catalog had zero embedded products.** 25,100 rows synced, 0 with `embedding` set
  — matching was never going to find anything regardless of how the chat side was wired. Root
  cause, from reading `syncAwinProducts.mjs`: the embed step was a fully sequential loop, one
  Replicate call at a time, against a cron route capped at `maxDuration = 300`. At that catalog
  size that loop was never going to finish inside one invocation. Fixed: bounded + concurrent
  (`embedLimit` default 400, `embedConcurrency` default 8, `mapWithConcurrency` — no new
  dependency), resumable across runs since it always re-queries `embedding is null`. For clearing
  the existing 25,100-row backlog, documented running the manual script once with a large
  `--embed-limit` (no serverless time cap outside Vercel) rather than waiting ~63 nights on cron
  alone.
- **`products.category` doesn't mean what the chat side would have assumed.** Checked the real
  synced values: `"Sneakers"` (21,171 of 25,100 rows — this catalog is overwhelmingly shoes),
  `"Shirts"`, `"Clothing Accessories"`, not this app's `top`/`bottoms`/`dress`/... enum. Filtering
  `matchProducts()` by category using the app's own type values would have silently returned
  nothing, ever. Left the category filter unused for chat matching — semantic similarity on the
  description is the only filter that survives different retailers having different taxonomies.

With that groundwork actually checked, wired the matching itself:

- **`/api/chat/route.js`**: every "shop"-sourced piece the stylist suggests now gets one
  `matchProducts()` lookup (top-1 hit, `PRODUCT_MATCH_MIN_SIMILARITY = 0.26` — picked without real
  match data to calibrate against, flagged in-code to revisit once the embedding backlog clears
  and there's something to eyeball). A hit above threshold sets
  `outfit_recommendation_items.product_id` instead of the `suggested_*` text fields; below
  threshold, or the lookup errors, falls straight back to today's honest AI guess — never a live
  retailer API call in the request path, still just the pre-synced `products` cache.
- **`actions/conversations.js`**: `mapRecommendationItem` (shared by chat history reload and
  `/outfits`) gets a third branch alongside wardrobe-sourced and AI-guess pieces, resolving a
  `product_id` back into the same card shape.
- **`RecommendationCards.jsx`**: a matched real product now shows its actual photo
  (`ImageWithFallback`, same graceful-degradation pattern as everywhere else in this app) and
  price, and the photo links out to the real `product_url` — the Awin deep link, carried through
  completely unmodified — in a new tab (`rel="noopener nofollow sponsored"`). Everything else
  (closet pieces, unmatched AI guesses) renders exactly as before.

Net effect right now: correct, tested-as-much-as-this-sandbox-allows code that will start
resolving real products the moment the embedding backlog above actually clears in production —
not before. `npm run build` passes with no errors; `matchProducts()`/`embedText()` ultimately call
Replicate, which this sandbox still can't reach, so the match path itself is unverified against a
live call, same caveat as every other Replicate-backed feature in this log.

---

## 2026-09-22 — Chat hero image: back to portrait

Direct request. The chat hero image (`OutfitHero.jsx`) went portrait `4:5` → landscape `3:2` on
2026-09-21 to match a supplied mockup for that day's chat-turn redesign — reverted back to `4:5`
now. Two lines: `OutfitHero.jsx`'s container (`aspect-[3/2]` → `aspect-[4/5]`) and
`/api/generate-image`'s call into `generateOutfitImage` (`"3:2"` → `"4:5"`, `src/lib/imageGen.js`
requires the caller's aspect ratio to match the display crop exactly, so both have to move
together — this is the same coupling the 2026-09-21 entry below documents getting bitten by
once already). Also fixed a stale comment in `imageGen.js` left over from before that redesign,
still describing the chat layout as "side-by-side" when it hasn't been since 2026-09-21.

Scoped to the real chat hero image only, same as the original 2026-09-21 change — the landing
page's mockups of the chat turn (`StageVisuals.jsx`, `LandingPage.jsx`) illustrate the product,
they don't call the real generation API, and weren't asked about here, so left alone.

Not screenshot-verified in this sandbox (auth gate); `npm run build` passes with no errors.

---

## 2026-09-22 — helloAvatar: same face/hair/body across chat generations

Direct question: could a selected avatar's face, hair, and body type actually carry over into
the outfit images generated in chat? The honest answer at the time was no, not really — the
img2img path shipped with helloAvatar v1 (`generateOutfitImage`'s `prompt_strength: 0.82`
reference) was always documented as "a strong loose reference (pose/figure/coloring), not a
guarantee of pixel-identical likeness," because plain flux-dev img2img just nudges the output
toward the reference's rough structure — it was never going to hold a consistent face.

Switched the avatar-linked path to **Flux Kontext** (`black-forest-labs/flux-kontext-dev`,
`src/lib/imageGen.js`) instead: an image-*editing* model, not img2img — given a reference photo
and an instruction, it's built to preserve the subject (face, hair, body) while changing
context/clothing, which is what this request actually needs. The prompt explicitly says to keep
the same face, hairstyle/color, body type and skin tone, and only change the outfit and scene.

- **Fails closed, not open:** if the Kontext call errors or returns nothing, `generateOutfitImage`
  falls straight back to the previous flux-dev img2img path rather than failing the whole
  generation — an avatar-linked look still renders, just with the older, looser reference
  behavior, if Kontext has a problem.
- **Scope:** only affects generations where an avatar is selected
  (`outfit_recommendations.avatar_profile_id` set). Plain text-to-image generation (no avatar
  picked) is completely unchanged.
- **Genuinely unverified** — this sandbox still can't reach `api.replicate.com`, so this
  integration is written from documented Kontext behavior/parameter conventions, not exercised
  against a live call. If the input schema (`input_image`, `aspect_ratio`, `output_format`)
  doesn't match what Replicate's flux-kontext-dev actually expects, the try/catch above means it
  quietly falls back to img2img rather than erroring visibly — worth explicitly testing a real
  avatar-linked chat generation once this is live, not just trusting the fallback to mask it.
- Cost: Kontext is priced slightly above plain flux-dev per image on Replicate; only avatar-linked
  generations use it, so this is negligible at private-beta volume (`07-costs-budget.md`).

---

## 2026-09-22 — Fix: helloAvatar painting the wrong gender

Bug report: a "Man" avatar was being painted as a woman. Two likely causes in
`generateAvatarPortrait` (`src/lib/imageGen.js`), both about prompt weighting, not the data (the
gender value itself was flowing through correctly from `avatar_profiles.gender`):

1. The subject/gender clause was stated once, ~40 words into the prompt, after the whole
   style + pose description. This file's own `STYLE_DIRECTIVE` comment already documents that
   Flux weights earlier tokens more heavily — a single mid-prompt mention is weak by the same
   logic that made an *early* style directive necessary in the first place.
2. "Editorial fashion illustration" as a genre is female-skewed in what these models were
   trained on, which can override a weak gender signal even when it's technically present.

Fix: the prompt now leads with an explicit subject clause ("Portrait of a male man, heavyset
build...") before the style directive even starts, states the sex word plainly ("male"/"female",
not just "man"/"woman"), and repeats it at the end alongside the build reminder — the same
primacy + recency pairing already used for style and build. No schema or API contract changes.

Not verified against a real generation in this sandbox — `api.replicate.com` isn't reachable here
(confirmed via a direct connectivity check, same limitation noted throughout this doc for every
Replicate-backed feature). `npm run build` passes with no errors. Please confirm on a real
regeneration ("Try again" on an existing avatar, or a fresh one) that this actually resolves it.

---

## 2026-09-22 — helloAvatar: realistic bodies, age, retry

Follow-up to helloAvatar v1 (same day, below) — direct feedback that avatars should reflect real
body proportions instead of defaulting to slim/athletic figures, plus a few missing fields.

- **Body realism, not a default athletic figure.** Image models like Flux lean toward
  slim/idealized bodies unless told firmly otherwise — so a new `build` field (`slim` / `average`
  / `athletic` / `fuller` / `heavyset`, `src/lib/avatarBuild.js`) is BMI-suggested from height/weight
  the moment both are entered, always shown as an editable chip selector, and stated as an explicit
  requirement in the generation prompt ("paint a heavyset build, not a slimmer figure than
  described") rather than a soft hint. `athletic` is deliberately never auto-suggested — BMI alone
  can't tell you someone is toned, so that one's opt-in only, matching the request that not every
  avatar should read as fit.
- **Age, asked at creation** — whole years, required, but only ever used to pick "boy"/"girl" vs
  "man"/"woman" phrasing in the prompt; never surfaced as a number anywhere (same "no exact age"
  rule the vision step already followed, now stated in one place instead of two).
- **Gender narrowed to Woman/Man** on the avatar form specifically (direct request) — the general
  `/profile` gender field is unchanged, this only affects how an avatar is painted.
  `formatProfileForPrompt`'s stylist-facing wording is untouched.
  "Boy"/"girl" isn't a separate option — it falls out of age + this choice automatically.
- **Hair type and facial hair**, added to the vision step's output schema
  (`avatarDescriber.js`): hair texture (straight/wavy/curly/coily/bald) and facial hair
  (beard/mustache/stubble/clean-shaven/none) are now explicit fields the illustrator's brief
  reports, not folded into a vaguer "hair" description. Body build moved OUT of that schema
  entirely — it's now sourced from real height/weight data and the user's own confirmation
  instead of asking the vision model to guess a body shape from a photo, which is both less
  reliable and a more sensitive thing to infer than hair/skin tone.
- **Retry painting** — after a generation, the reference photo (still only ever in memory, never
  written to Storage) stays available for one more attempt: a "Try again" button reruns
  generation on the exact same photo without re-uploading, for when the first pass doesn't
  resemble the person. Choosing a different photo instead resets consent, since that's a new
  photo being used, not a repaint of the same one already consented to.

Not screenshot-verified in this sandbox, same reasons as the v1 entry below (auth gate,
Replicate/Anthropic unreachable). `npm run build` passes with no errors; the `age`/`build` columns
were added via a second migration (`avatar_profiles_age_build`) applied directly to the live
Supabase project.

---

## 2026-09-22 — helloAvatar v1: family avatars as outfit models

Direct request: an avatar per user plus up to 3 family members, each with their own measurements
and a watercolor-style render, used as the model for outfits generated in chat. `03-roadmap.md`
already flagged this as GDPR-sensitive (`06-risks-legal.md` #3) and said the consent flow has to
be built as part of the feature, not after — that shaped most of the design decisions below, all
confirmed directly rather than assumed:

- **Photo-based likeness, not attribute-only** — a reference photo is genuinely used to inform
  the avatar, not just a picker of build/skin-tone/hair options.
- **The photo is never stored, anywhere, at any point.** It arrives as base64 in one API request
  (`POST /api/avatar/generate`), goes straight into a single Claude vision call
  (`src/lib/avatarDescriber.js` — deliberately scoped to a non-identifying, illustrator's-brief
  level of description: build, hair, skin tone, explicitly *not* facial-feature detail), and is
  discarded when the request completes. Nothing downstream — the image generation step, Storage,
  the database, logs — ever sees the raw photo. Only the final generated watercolor image is
  persisted. This is stricter than "store then delete on a timer"; there's nothing to delete
  because nothing was written.
- **Consent is per-avatar, separate from ToS, and recorded** — a required checkbox
  (`src/lib/avatarConsent.js`) gates the generate button, and a successful generation stamps
  `consent_attested_at` + `consent_text_version` on that avatar_profiles row. For a family member
  (no login of their own), consent is the account holder's explicit attestation that they have
  that person's permission or are their parent/guardian — a real product decision, not a legal
  conclusion; `06-risks-legal.md` #3 now documents exactly what was built and what's still open.
- **New `avatar_profiles` table** (migration `avatar_profiles`, applied directly to Supabase —
  see `04-data-model.md`): one row per model, `is_self` true for exactly one (partial unique
  index), up to 3 more as family members (capped app-side in `src/actions/avatars.js`, matching
  this codebase's existing preference for business rules in the action layer over DB triggers).
  New private `avatar-renders` Storage bucket, same owner-folder RLS pattern as the other three
  buckets. Deleting a profile (`deleteAvatarProfile`) removes its Storage object too, not just
  the row.
- **New `/avatars` page** (`AvatarsView.jsx`, `AvatarCard.jsx`, `AvatarProfileModal.jsx`) — a
  card grid matching the app's existing large-surface visual language (`EmptyState.jsx`'s
  occasion cards), linked from the account menu in `BottomBar.jsx`. "Set up your avatar" prefills
  from the measurements already on `/profile` rather than asking twice.
  `src/app/api/avatar/generate/route.js` does the vision → appearance-brief → watercolor-portrait
  pipeline (`generateAvatarPortrait`, `src/lib/imageGen.js`, sharing the same `STYLE_DIRECTIVE`
  as outfit images, so an avatar and a generated look read as the same house style).
- **Wired into chat, both halves:** `BottomBar.jsx` gets a "styling for" picker (defaults to the
  account holder if a self-avatar exists, otherwise none selected — never silently assumed
  otherwise). The pick flows through `/api/chat` two ways: (1) `formatProfileForPrompt`
  (`src/lib/stylist.js`) now takes the selected avatar and swaps in *their* sizing/measurements
  instead of the account holder's when styling for someone else, so the narrative fits the right
  body; (2) the resulting `outfit_recommendations` row stores `avatar_profile_id`, which
  `POST /api/generate-image` reads back to pass that avatar's painted image to Flux as an img2img
  reference (`generateOutfitImage`'s new `referenceImageUrl` param) — the honest limit here is
  that Flux has no true character-consistency mechanism, so this is a strong loose reference
  (pose/figure/coloring), not a guarantee of pixel-identical likeness across generations.

Not screenshot-verified in this sandbox — `/avatars` sits behind the same invite-only auth gate
as the rest of the signed-in app, and Replicate/Anthropic calls aren't reachable here either
(same limitation as every other real-generation feature in this codebase). `npm run build` passes
with no errors; the migration (table, RLS, unique index, Storage bucket + policies) was applied
and confirmed directly against the live Supabase project, same as the closet-analytics migration
above.

---

## 2026-09-22 — Closet analytics: cost-per-wear + wardrobe value

Next roadmap item after the Style Journal (`03-roadmap.md` Phase 3). The roadmap called this
"straightforward once wardrobe data exists" — turned out `wardrobe_items` had neither a purchase
price nor any wear-tracking, so this needed a small schema migration first, not just UI.

- **Migration `wardrobe_closet_analytics`** (applied directly via Supabase, no local migration
  files in this repo) adds `price_cents` (nullable, user-entered), `wear_count` (int, default 0),
  and `last_worn_at` (nullable timestamp) to `wardrobe_items`. Also adds
  `increment_wardrobe_wear(item_id)`, a SQL function that atomically bumps `wear_count` and sets
  `last_worn_at`, scoped to the caller's own rows (`user_id = auth.uid()`, and it still runs
  under the caller's RLS as `SECURITY INVOKER`) — a plain read-then-write `UPDATE` from the
  server action would have the same effect most of the time but could drop a wear on a double-tap.
- **Wear tracking is two signals, not one** (direct decision this session): a **manual** "Log a
  wear" tap on each card (`WardrobeItemCard.jsx`, calls `logWardrobeItemWear` →
  `increment_wardrobe_wear`) drives the actual cost-per-wear number, since it's the only one that
  means "actually worn." Alongside it, a **"styled Nx"** chip shows how many times that piece has
  been included in a chat outfit recommendation (`getStyledCounts` in `actions/wardrobe.js`,
  counting `outfit_recommendation_items` rows) — zero extra effort, but explicitly a *softer*
  signal ("styled" isn't "worn") and never mixed into the cost-per-wear math itself.
- **`AddItemModal.jsx`** gets an optional "Purchase price" field; **`WardrobeItemCard.jsx`** gets
  an inline price editor too (click the price, or "+ Add price") since most existing pieces were
  added before this field existed and back-filling one at a time from the grid is easier than a
  bulk-edit screen for a first version.
- **New `ClosetStats.jsx`** — a summary strip at the top of the Wardrobe view: total wardrobe
  value (sum of priced items), average cost-per-wear (across pieces with both a price and at
  least one logged wear), and a "never logged worn" count as a light declutter signal. Every
  number degrades to "—" with an explanatory hint instead of a wrong calculation when the
  underlying price/wear data isn't there yet — true for most of the 8 real items in the database
  today, so this is deliberately not zero-state-hostile.

Not screenshot-verified in this sandbox — the Wardrobe view sits behind the same invite-only auth
gate as the rest of the signed-in app. `npm run build` passes with no errors; the migration and
its function grants were checked directly against the live Supabase project (`has_function_
privilege` confirms `authenticated` can call `increment_wardrobe_wear`, and the existing
`wardrobe_items: owner only` RLS policy already covers `UPDATE`).

---

## 2026-09-22 — Style Journal: /outfits redesigned into "Vibe Cards"

Picked up the next roadmap item (`03-roadmap.md` Phase 3): "Style Journal ('Vibe Cards') —
mostly a UI/data-modeling feature on top of existing conversation data." `/outfits` already
existed as a functional but plain divided-row list (`OutfitHistoryList.jsx`/`OutfitHistoryRow.jsx`,
shipped 2026-09-21); this redesigns it into the editorial card treatment the rest of the app
already uses (`EmptyState.jsx`'s occasion carousel), rather than adding a second, differently-named
feature.

- **New `VibeCard.jsx`** — one big `aspect-[4/5]` tile per look: cover photo (or the `GarmentArt`
  fallback, same graceful-degradation pattern as everywhere else), a bottom gradient with the
  conversation's title in `font-script` and its date, and a small piece-count chip. Sized large
  enough (well over 250px tall in every breakpoint) that `rounded-bubble`'s 128px corner is the
  correct large-surface token — see the "squared corners" fix directly above; this is exactly the
  kind of element that should stay on the large token, not move to `-sm`.
- **`OutfitHistoryList.jsx` rewritten** to group rows into month buckets ("September 2026", …)
  over a responsive 2/3-column grid, each group revealed with the existing `Reveal.jsx`
  scroll-reveal (moved from `components/landing/` to `components/` — it was already generic,
  now genuinely shared between the landing page and this page rather than landing-only).
  `OutfitHistoryRow.jsx` is removed; its per-piece expand/save affordance is dropped rather than
  ported, since it was awkward in a grid and duplicated the piece-level save action
  `RecommendationCards` already offers once a card is clicked into its conversation
  (`/?conversation=<id>`) — that's still one click away, just not inline on the journal itself.
- **`listOutfitHistory()` (`actions/conversations.js`)** now also returns each row's
  `createdAt`, needed for the month grouping and the per-card date. Considered also surfacing
  `outfit_recommendations.occasion` as a tag on each card, but that column is defined in the
  schema and never actually written by `/api/chat` — decided against building UI around a field
  that would always render empty; `conversations.title` (the field `04-data-model.md` already
  says this feature was meant to use) carries the card instead.

Not yet screenshot-verified in this sandbox — `/outfits` sits behind the same invite-only auth
gate as the rest of the signed-in app (`src/middleware.js`), same caveat as `MessageBubble.jsx`
above. `npm run build` passes with no errors.

---

## 2026-09-22 — Small elements: squared corners, not pills

Direct request: on small elements (chat bubbles, buttons, chips — roughly 30–90px tall), the
128px `rounded-bubble`/`rounded-bubble-reply` corner clamps to exactly half the box's height,
which is a full semicircle — it reads as a pill or a circle, not a rounded square. The 128px
value only works as "a large rounded corner" once the box is comfortably taller than ~250px.

Split the token in two instead of picking one radius for everything:

- `bubble` / `bubble-reply` (128px) — **large surfaces only** now: the chat hero image, the
  `/outfits` cover photos, `EmptyState`'s occasion cards, the landing page's photo plates and
  marquee tiles. Unchanged values, scope narrowed.
- **New** `bubble-sm` / `bubble-reply-sm` (14px, same square-corner position) —
  **everything small**: the real chat's user/assistant text bubbles and its Retry/Find
  Outfit/quick-reply buttons (`MessageBubble.jsx` — this was the main offender, since a
  one-line message is short enough that the old token made it a stadium shape), plus every
  landing-page bubble/button/chip built to look like those (`LandingPage.jsx`,
  `StageVisuals.jsx`, `LandingChatDemo.jsx`, `DetailHighlights.jsx`'s corner-geometry specimen,
  which now demonstrates the token actually in use rather than a stale one). 14px stays visibly
  under half the height of even the app's smallest chip (~32px), so it reads as a deliberate
  small curve, not a browser clamp.
- A few small **photo** tiles that had been using the large token at the wrong scale
  (`StageVisuals.jsx`'s row thumbnail and fallback demo tiles, `DetailHighlights.jsx`'s fallback
  specimen, all ~75–112px) moved to the existing `rounded-xl2` (20px) instead — the same radius
  `WardrobeItemCard`/`RecommendationCards` already use for small tiles, so this is more
  consistent with the rest of the app, not a new one-off.
- Updated the two places that asserted the old "everything shares 128px" framing in either code
  comments or landing-page copy (`DetailHighlights.jsx`'s "Geometry" card body, `StageVisuals.jsx`'s
  file header) so the page's own claims about its design system stay accurate.

---

## 2026-09-21 — Landing page redesign: editorial scrollytelling

Second pass at `/`, replacing the centre-stacked first version. Brief: clean, modern,
scroll-driven, editorial, big pictures, attention-to-detail highlights, SaaS conversion best
practice.

**Direction.** "Editorial atelier" — helloModa's own light/warm/lavender identity and script
display face, composed with editorial-spread discipline. The `silviu-taste` skill was loaded and
is dark-first, anti-purple-gradient and anti-script-font, which is the exact inverse of this
brand; it allows light as a deliberate editorial exception and script "where the project demands
it," which this one does (three separate font directives today). So the *palette and voice* stayed
helloModa's and the *structure* came from the skill: typographic authority, monospaced data
labels, asymmetric splits instead of centre stacks, uneven bento spans, 140px+ section rhythm,
glass materiality, IntersectionObserver motion rather than an animation library.

**Conversion structure**, grounded in current practice rather than memory (one web search, see
that turn): exactly one primary action per viewport — the secondary path is a text link, not a
competing button, which the first version got wrong; trust signals before the first feature; real
product UI rather than illustration; one story unfolding on scroll instead of unrelated sections.
The trust band is four *true* product facts (20 occasions, one look per turn, EU/Frankfurt, no
invented prices) — no fabricated logos, testimonials or metrics, because there aren't any.

**New pieces:**
- `src/lib/useScrollProgress.js` — rAF-throttled 0..1 progress of an element through the
  viewport, the engine for the pinned section.
- `landing/StickyStage.jsx` — the centrepiece. A five-step narrative (occasion → closet → look →
  gap → history) where the product stays pinned and the *surface itself changes* per step.
  Desktop pins; below `sm` it degrades to a stacked sequence, since pinned scrollytelling fights
  a phone's scroll. Both branches render from one `STEPS` array so the story can't drift.
- `landing/StageVisuals.jsx` — the five scenes, mirroring real product surfaces.
- `landing/EditorialPlate.jsx` — **the fix for the "big pictures" problem.** `GarmentArt` was
  drawn for small square cards; blown up to a hero slot it letterboxes one faint silhouette into
  an effectively empty gradient, which was exactly what the first screenshot showed. Large slots
  now get a composed plate: a real colour story, overlapping silhouettes at editorial scale,
  light blooms, grain, swatches. Openly illustration rather than a fake photo, and it swaps
  itself for real photography the moment `public/occasions/{slug}-hero.jpg` exists.
- `landing/OccasionMarquee.jsx` — full-bleed, driven by the real `occasions` dataset so it can't
  drift from what the product actually covers.
- `landing/DetailHighlights.jsx` — the "attention to details" ask, as *specimens rather than
  bullets*: the corner geometry demoed with two real bubbles and annotation rules, the three type
  faces shown side by side, the real fallback tiles, the house-style directive.
- `GarmentArt.jsx` gained `bare` + `strength` props so `EditorialPlate` could layer silhouettes
  over a shared background — a small real API instead of reaching into its internals with an
  arbitrary-variant CSS hack, which would have broken silently the next time that component moved.

**Three real bugs caught by actually looking at it, not by the build passing:**
1. `overflow-x-hidden` on the page root **silently broke `position: sticky`** — it makes the
   element a scroll container, so the pinned stage just scrolled away and left ~4000px of empty
   page. Now `overflow-x-clip`, which contains the hero's overhanging bubble without creating a
   scroll box.
2. The 128px `rounded-bubble` corner was applied to 150–210px tiles, where it stops reading as a
   corner and collapses the tile into a blob. Small tiles now use `rounded-xl2`, which is also
   what the real `WardrobeItemCard`/`RecommendationCards` use — so this is more faithful, not
   less. The marquee tiles went to 300px so the real corner reads properly.
3. Below `sm` the frame's 128px corner curved through the scene labels; the frame drops to
   `rounded-xl3` there.

**Process note:** running `npm run build` while `next dev` was live clobbered the shared `.next`
and produced a 137,000px-tall garbage render, and separately a stale `next-server` from earlier
was squatting port 3000 while dev sat on 3001 — so several "verification" screenshots were of a
dead server. Both are the same trap this changelog already flagged once. Build with dev stopped;
check the port the dev server actually printed.

---

## 2026-09-21 — Public marketing landing page at "/"

Per direct request: a real landing page for signed-out visitors, in the same visual language as
the app, with an interactive demo and scroll animations — not just the invite-only login wall
that used to be the first thing anyone unauthenticated saw at every route.

**Two decisions confirmed before building, both taken as given**:
1. **Routing stays minimal-touch**: `/` is the only thing that changes. Signed-out → the new
   `LandingPage.jsx`. Signed-in → the exact same real app as before, same path, nothing moved.
   No new `/app` route, no changed Home-icon link, no touched post-login redirect.
2. **The embedded chat demo is scripted, not live**: zero real API calls, zero cost per
   pageview, no new unauthenticated surface on `/api/chat` — given the app's invite-only/
   private-beta posture (`docs/06-risks-legal.md`), letting anonymous visitors trigger real
   Claude + Replicate calls was a real risk, not a detail.

**What shipped**:
- `src/lib/supabase/middleware.js` — `/` added to the public-route allowlist (exact match, not
  `startsWith`, so no authenticated sub-path leaks through). `src/app/page.jsx` now branches:
  no `user` → `<LandingPage />`; otherwise the existing wardrobe/conversation-loading logic,
  unchanged.
- `src/app/LandingPage.jsx` — hero (script-font headline, dual CTA), a 3-step "how it works"
  using `GarmentArt` illustrations, the live demo section, a 4-item feature grid, closing CTA,
  footer matching `GuideLayout.jsx`'s existing public-page chrome.
- `src/components/landing/LandingChatDemo.jsx` — reuses the real `MessageBubble.jsx` component
  (not a mockup of it) with scripted turn data, so the demo looks exactly like the product.
  Visitor taps an occasion chip → a real user bubble appears → `ThinkingLine` for ~1.1s → the
  scripted AI turn renders. A turn with no `recommendationId`/`heroPrompt` never triggers
  `useOutfitImage`'s fetch, so this is genuinely inert, not just rate-limited — verified by
  reading the hook, not assumed. "Rooftop after dark" copy is lifted near-verbatim from a real
  turn the product actually generated (screenshot supplied same day); the second script written
  to match that voice, not invented from nothing.
- `src/components/landing/Reveal.jsx` — scroll-reveal via `IntersectionObserver` + the existing
  `animate-fade-up` keyframe (`tailwind.config.js`), not a new animation dependency — matches
  this codebase's established no-dependency-UI preference. Respects `prefers-reduced-motion`
  (skips the animation, shows immediately, rather than forcing motion on someone who opted out).
- `robots.js`/`sitemap.js` updated — `/` (exact root, `"/$"` anchor, not a blanket allow) is now
  crawlable and in the sitemap alongside `/what-to-wear`; every authenticated route stays
  disallowed exactly as before.
- **Verified live, not just built**: since `/` is genuinely public now, this was the first UI
  change all session actually screenshot-testable end-to-end in this sandbox (no invite-only
  gate in the way) — confirmed the redirect no longer fires (`200`, not `302` to `/login`), the
  demo's tap-to-reply interaction actually works, and the GarmentArt fallback renders correctly
  for the (not-yet-generated) demo images.

---

## 2026-09-21 — Smooth-scroll the chat thread instead of snapping

`ChatView.jsx`'s auto-scroll-to-bottom (`el.scrollTop = el.scrollHeight`, instant) read as a
jarring jump every time a message sent or a reply landed. Switched to `el.scrollTo({ ...,
behavior: "smooth" })`, but only for the live case — a new `prevCountRef` distinguishes "one
message/thinking-indicator just changed during this session" (smooth) from "a whole
conversation just loaded at once" (`isBulkLoad`, `Math.abs(messages.length -
prevCountRef.current) > 1` — history-dropdown switch or `/outfits` deep link via
`ConversationFromQuery.jsx`), which still jumps instantly — animating a long scroll through
history someone didn't just write would look worse, not better, not what was asked for.

---

## 2026-09-21 — Occasion carousel: 20 cards, real-image pipeline, full-bleed sizing

Expanded the home-screen carousel from 7 hardcoded cards to **20**, moved into
`src/data/occasions.js` (same pattern as `src/data/guides.js` — `heroImagePrompt` per entry,
picked up by a new generation script) and wired up the same real-image-with-fallback pipeline
the `/what-to-wear` guides already have:

- **`src/components/ImageWithFallback.jsx`** — extracted the hydration-race-safe image/fallback
  logic `GuideHeroImage.jsx` already had (deferring `src` to a client-only effect — see that
  file's original comment for why) into a shared component, so it's not reinvented a third time.
  `GuideHeroImage.jsx` now just wraps it; `EmptyState.jsx`'s cards use it directly.
- **`scripts/generate-occasion-images.mjs`** — near-identical to `generate-guide-images.mjs`,
  reads `occasions.js`, writes `public/occasions/{slug}-hero.jpg`. Not run here (same Replicate
  reachability limits as the guide-image script) — the user runs it locally.
- **Caught while wiring this up**: `generateOutfitImage()` (`src/lib/imageGen.js`) had a
  **hardcoded `aspect_ratio: "3:2"`** left over from fixing the chat-hero-image crop mismatch
  the same day — every caller got landscape, including the *portrait* guide-image script, which
  would have silently cropped the next `--force` regeneration. Fixed by making `aspectRatio` a
  required parameter instead of a hardcoded value: `/api/generate-image` passes `"3:2"`,
  `generate-guide-images.mjs` and the new `generate-occasion-images.mjs` pass `"4:5"`.
- **Full-bleed carousel row + bigger cards**: the cards row is no longer wrapped in
  `EmptyState.jsx`'s `max-w-content` container (that still wraps the greeting text and the
  example-prompt chips) — it's a full-width sibling instead, so scrolling reveals cards
  edge-to-edge rather than stopping at the centered content column. Card width corrected
  same-day: "2.25 cards" meant filling `max-w-content` (1160px) specifically, not the full
  viewport — `(1160px - 16px gap) / 2.25 ≈ 508px` fixed width at `sm`+, `78vw` below it (a fixed
  508px card would dwarf a phone screen; single-dominant-card reads better there anyway). Aspect
  ratio changed again same-day, portrait `4:5` → **`1:1`** square, and `generate-occasion-
  images.mjs` updated to request `"1:1"` from Flux to match (same crop-mismatch risk as the
  guide-image aspect-ratio bug above if these two ever drift apart).

---

## 2026-09-21 — History icon: hover previews, click opens /outfits; cards deep-link into chat

Three follow-ups to yesterday's `/outfits` page, all direct requests:

- **`BottomBar.jsx`'s `ConversationMenu`** no longer toggles its quick-switch panel on click.
  It's now a real `Link` to `/outfits` (click navigates there directly), with the same panel
  shown on hover (`onMouseEnter`/`onMouseLeave`) instead — "peek" vs. "go there," not the
  generic click-toggle `Dropdown` other bar menus use. The "View all outfits" link added
  yesterday is gone — redundant now that the icon itself does that.
- **`/outfits` rows now continue the conversation.** Clicking a row's cover image or title
  navigates to `/?conversation=<id>` — a new `ConversationFromQuery.jsx` (mirrors
  `PostHogPageview.jsx`'s `useSearchParams`-in-its-own-`Suspense` pattern) reads that param once,
  hands it to `AppShell`'s existing `handleSelectConversation`, and cleans the URL via
  `router.replace("/")` so a refresh doesn't re-trigger it. The chevron is now a separate control
  (`stopPropagation` isn't even needed — it's a sibling, not nested inside the link) that still
  expands the pieces preview in place, so browsing doesn't require leaving the page.
- **`EmptyState.jsx`'s occasion cards, ~25% bigger** (`w-[200px] sm:w-[260px]`, was
  `w-40 sm:w-52`) and switched from `rounded-xl2` to `rounded-bubble` — same corner language as
  the chat hero image and the `/outfits` cover photos now.

---

## 2026-09-21 — Bottom whitespace to match the top

`ChatView.jsx`'s message thread container's bottom padding changed from `pb-8 sm:pb-12` to
`pb-[33vh]`, matching `EmptyState.jsx`'s `pt-[33vh]` — the last message in a conversation now
sits with the same generous breathing room below it that the greeting has above it, instead of
crowding the bottom bar.

---

## 2026-09-21 — New `/outfits` page: past conversations as a cover-image list

Per a supplied mockup ("myOutfit"): a dedicated page for browsing past conversations, each
shown as a row — cover image, title, short narrative, expand for the outfit's pieces — instead
of only being reachable through the small conversation-switcher dropdown.

- `listOutfitHistory()` (`src/actions/conversations.js`) — one row per conversation, summarized
  by its **most recent** `outfit_recommendation` (the one whose `generated_image_url` becomes
  the row's cover photo). Extracted the item-mapping logic `getConversationMessages` already had
  into a shared `mapRecommendationItem()` helper rather than duplicating it. A conversation with
  no recommendation yet (abandoned before a reply landed) is skipped — nothing to show.
- `src/app/outfits/page.jsx` + `src/components/outfits/{OutfitHistoryList,OutfitHistoryRow}.jsx`
  — a standalone protected route (same pattern as `/profile`, not part of `AppShell`'s view
  switching). Cover image uses the same `rounded-bubble`/3:2 language as the chat hero image,
  since it's literally the same generated asset. Expanding a row reuses `RecommendationCards.jsx`
  as-is for the pieces grid — same component chat already uses behind "Find Outfit."
- **Saving a piece to wardrobe from this page is session-only feedback**, not a real toggle
  against existing wardrobe state (this route has no shared client wardrobe state to check
  against, unlike `AppShell`) — clicking the heart fires `addWardrobeItem()` and flips local
  state optimistically. Mirrors a simplification the chat view already had (`ChatView.jsx`'s
  `savedIds`, scoped to one session), not a new inconsistency.
- **Entry point**: a "View all outfits" link inside the existing History dropdown
  (`BottomBar.jsx`) rather than a new bottom-bar icon — the bar's icon budget is already
  documented as tight (`docs/09-conversation-design.md`), and this keeps the change reversible/
  low-risk. Worth revisiting if this page turns out to want more prominent placement.

---

## 2026-09-21 — Large top whitespace above the greeting

`EmptyState.jsx`'s top padding changed from `py-10 sm:py-16` (~40-64px) to `pt-[33vh]` (top only —
bottom padding unchanged) so "hello, …" sits roughly a third of the way down the viewport instead
of flush against the top, easier for the eye to land on first. Direct request. Uses `vh` against
the full browser viewport, not the scroll container specifically (which is shorter by
`BottomBar`'s height) — close enough to the intent, not worth the complexity of measuring the
container itself for this.

---

## 2026-09-21 — Generous vertical rhythm (128px) + greeting uses the script font

Per direct feedback on the live site: spacing between top-level sections felt cramped.

- **128px vertical rhythm** (`mt-32`/`space-y-32`/`pt-32` — Tailwind's default `32` step already
  equals 8rem/128px, no custom token needed) between: `EmptyState`'s occasion cards and its
  example-prompt chips row, the hero and the message thread, and each top-level message turn in
  `ChatView.jsx`. Deliberately *not* applied inside a turn's own text stack (title → narrative →
  actions) or the hero's tight logo lockup (greeting → tagline → description) — those read as one
  cohesive block, not separate "elements."
- **`EmptyState`'s greeting headline** ("hello, Silviu") switched from `font-display` (Fraunces)
  to `font-script` (Yuyu Short) — now matches the script face used for every turn's title,
  bumped to `text-[48px] sm:text-[64px]` since a script face reads smaller than a serif at the
  same pixel size.

---

## 2026-09-21 — Script font: Mr De Haviland → Yuyu Short

Another direct swap of the `script` token (`tailwind.config.js` + the Google Fonts `<link>` in
`layout.jsx`) — third one today (Bonheur Royale → Mr De Haviland → Yuyu Short). Confirmed via
web search that Yuyu Short is a real, free Google Font (this sandbox can't reach fonts.google.com
directly to verify visually) since a wrong/typo'd family name would silently fall back to the
generic `cursive` browser default with no error. **Worth a visual check once deployed**: Yuyu
Short's lowercase glyphs render as slim uppercase-style caps by design, and this project's
titles are lowercase-first ("vineyard wedding," "hello, Horia") — may or may not read the way
it's intended at a glance.

---

## 2026-09-21 — Persistent hero + reversed chat bubble convention

Per a supplied mockup, two more changes to the chat experience (`docs/09-conversation-design.md`
updated to match, since it went stale across today's earlier redesigns too — brought the whole
doc current in this pass, not just these two items):

- **`EmptyState` is now a persistent hero**, always mounted at the top of `ChatView.jsx` instead
  of being swapped out once a conversation has messages. Scrolling up during any conversation —
  new or old — reaches the greeting/occasion-cards/example-chips header again. Direct request:
  "the first fold elements would still be available after prompting — basically the hero of each
  conversation."
- **Chat bubble sides reversed from convention**: the user's message bubble is now always
  **left-aligned** (was right-aligned), filled purple, square bottom-left corner
  (`rounded-bubble`, unchanged token). A new mirrored token, **`rounded-bubble-reply`** (square
  top-right instead), is used for a text-only assistant reply, always **right-aligned**,
  outlined instead of filled. Today that only fires for the network/API error fallbacks in
  `AppShell.jsx` — real stylist turns always have a title+heroPrompt (required by
  `stylist.js`'s schema) so they keep the existing two-column image+text layout, never this
  bubble. Confirmed scope directly rather than guessing: this reversal is deliberate brand
  identity, not a bug to "fix" back to the usual convention later.

---

## 2026-09-21 — Fixed generation/display aspect-ratio mismatch; layout follow-up

Follow-up to the same-day chat redesign below, after visual feedback that the landscape crop
was cutting off the generated character:

- **Root cause**: `src/lib/imageGen.js` was still requesting `aspect_ratio: "4:5"` (portrait)
  from Replicate/Flux while the new display container was `3:2` (landscape) — `object-cover`
  was cropping a tall portrait composition into a wide box, chopping the figure. Fixed by
  requesting `3:2` from Flux directly, so the composition is actually framed for landscape
  (full figure fits) instead of relying on CSS to salvage a mismatched source image.
- **Layout**: moved title + narrative back to sit beside the image (two-column, image left/text
  right) rather than full-width above it — closer to the pre-mockup layout, now with the
  "thinking" state living in the text column instead of gating the whole row.
- **Actions row**: thumbs up/down, Retry, and Find Outfit now render as one inline row instead
  of a stacked thumbs-row + buttons-row.
- **`ThinkingLine`**: dropped the script font (`Mr De Haviland` reads badly at status-text
  sizes) for the same body font/size as the narrative paragraph — used in both its `ChatView`
  placement (whole-turn wait) and its new placement inside `MessageBubble` (image-only wait).

---

## 2026-09-21 — Chat turn redesign: layout, corner language, aspect ratio, script font

Per a supplied mockup, reworked `MessageBubble.jsx`'s AI-turn layout and the visual language
around it:

- **Layout**: title + narrative now render full-width at the top of a turn (previously
  side-by-side with the hero image), followed by the hero image + a right-aligned actions
  column (thumbs up/down, "Retry", "Find Outfit") once ready, then quick-reply chips.
- **New "thinking" behavior**: image generation used to show its own "Generating…" badge inside
  a placeholder box. Split image-generation state out of `OutfitHero.jsx` into a new hook,
  `src/lib/useOutfitImage.js` — `MessageBubble` now shows the existing `ThinkingLine` (cycling
  fashion-flavored phrases) as its own line while the image is in flight, and only reveals the
  image + actions row once generation settles (ready or failed). `OutfitHero.jsx` is now purely
  presentational (just `imageUrl` in, `<img>` or the `GarmentArt` fallback out).
- **Hero image aspect ratio**: `4:5` (portrait) → `3:2` (landscape), matching the mockup.
  Scoped to the chat hero image only — wardrobe/recommendation-card tiles and the `/what-to-wear`
  guide images keep their existing ratios, different content, not shown in the mockup.
- **Corner language — new `rounded-bubble` token** (`tailwind.config.js`,
  `border-radius: 128px 128px 128px 0px`): every corner rounded except bottom-left, which stays
  square as a chat-bubble "tail." At typical element sizes 128px exceeds half the box, so it
  just reads as fully rounded on the open corners. Applied to the user message bubble, the hero
  image, the Retry/Find Outfit buttons, and quick-reply chips — scoped to the chat turn itself,
  not applied sitewide (wardrobe cards, guides, auth pages, etc. keep their existing radii;
  wasn't asked for and risks an unreviewed visual change everywhere).
- **Script font swap**: Bonheur Royale → **Mr De Haviland**, changed once in
  `tailwind.config.js`'s `fontFamily.script` (+ the Google Fonts `<link>` in `layout.jsx`) so
  every existing `font-script` usage — chat turn titles, `ThinkingLine`, the `/what-to-wear`
  guide pull-quotes and showcase heading — picks it up automatically, no per-component edits.
- Added `ThumbsUp`/`ThumbsDown` to `Icons.jsx` (previously only a `Heart` "Love" icon existed,
  used for a different purpose — saving to wardrobe — elsewhere in the app).
- **Not visually verified end-to-end**: this sandbox can't reach Google Fonts (egress policy) or
  sign in past the invite-only gate, so the actual rendered chat turn — including whether Mr De
  Haviland loads correctly — needs a real check once deployed, not just taken on faith from the
  build passing.

---

## 2026-09-21 — Fixed: invite-only auth gate was swallowing the cron route

Caught immediately while testing the cron endpoint above with a live curl: the
`src/lib/supabase/middleware.js` invite-only redirect runs on every request except a short
allowlist (`/login`, `/register`, `/auth`, `/what-to-wear`, robots/sitemap) — `/api/cron/*`
wasn't on it, so an unauthenticated request (curl, and critically the real Vercel Cron trigger
itself, which never carries a user session) got silently 302'd to `/login` before the route's
own `CRON_SECRET` check ever ran. Fixed by exempting `/api/cron/` from that redirect — the
route still does its own bearer-token auth, so this doesn't weaken anything, it just lets a
self-authenticating route be reached at all.

---

## 2026-09-21 — Nightly Vercel Cron trigger for the Italist product sync

Follow-up to the same-day Awin scaffold below: `GET /api/cron/sync-products-italist`
(`src/app/api/cron/sync-products-italist/route.js`) wraps `syncAwinProducts()` for Vercel Cron
(`vercel.json`, nightly at 03:00 UTC) so the catalog sync doesn't depend on someone remembering
to run the script by hand. Guarded by `CRON_SECRET` (Vercel signs cron requests with
`Authorization: Bearer $CRON_SECRET` automatically once set) so the endpoint can't be hit
externally to burn Replicate credits. Requires `AWIN_ITALIST_FEED_URL` and
`SUPABASE_SERVICE_ROLE_KEY` to also be set as real env vars in the Vercel project (not just
`.env.local`) — the manual script and this route share the exact same sync logic, just two
different triggers for it.

---

## 2026-09-21 — Awin product catalog sync, live for Italist

Italist (first approved Awin advertiser) turned the `05-integrations-affiliates.md` ingestion
plan into real code:

- `scripts/lib/syncAwinProducts.mjs` — shared pipeline: fetch an Awin datafeed (comma/tab
  auto-detected, hand-rolled parser handling quoted fields — no new dependency), upsert into
  `products` on `(retailer, external_id)`, then CLIP-embed (`src/lib/embeddings.js`) whatever's
  missing an embedding. `scripts/sync-products-italist.mjs` is the thin per-retailer entry
  point (`AWIN_ITALIST_FEED_URL`); the next approved advertiser is a copy of that file with a
  new retailer slug, no changes to the shared logic.
- Added the `products_embedding_hnsw_idx` index and a `match_products()` Postgres function
  (mirrors `match_wardrobe_items`, same pgvector cosine-distance pattern, `products`' RLS is
  already public-read so no auth needed) plus its JS wrapper `src/lib/productMatching.js`. The
  `(retailer, external_id)` unique constraint the data-model doc already described turned out to
  already exist on the table.
- Script writes with the Supabase **service role** key (bypasses RLS — this runs outside any
  user session, same reasoning as any scheduled ingestion job), so `SUPABASE_SERVICE_ROLE_KEY`
  is now a required env var for it specifically; treat it and the Awin feed URL (which embeds
  your publisher auth token) as credentials, same as the Replicate token — don't paste either
  into chat or commit them.
- **Deliberately not wired into `/api/chat` yet.** "Shop" suggestions still show honest AI
  guesses with no real link. Wiring real Italist hits into recommendation slots (via
  `matchProducts()`, above some similarity threshold, falling back to the AI guess) is worth
  doing once the feed's actually been synced once and spot-checked — not blind, and it's a
  separate product decision (when to trust a match enough to show a real price/link) from the
  plumbing itself.

---

## 2026-09-21 — Randomized, expanded occasion carousel on the welcome screen

`EmptyState.jsx`'s image occasion cards (the ones tied to the actual GTM wedge, not the
text-only example chips below them) grew from a static 3 to 7, covering the launch niche plus
adjacent high-intent moments (wedding guest, black-tie, interview, first date, summer festival,
brunch, weekend trip). Shuffled once per mount (Fisher-Yates, not `sort(() => Math.random() -
0.5)` which is known to skew) so returning users don't see the same 3 every visit, and shown in
a horizontal-scroll carousel (`overflow-x-auto` + `shrink-0`, reusing the existing `.scroll-area`
scrollbar styling) instead of a wrapped grid so all 7 stay reachable on narrow viewports. The
4 text-only `EXAMPLE_PROMPTS` chips were left untouched — out of scope per the request.

---

## 2026-09-20 — Editorial redesign of the /what-to-wear guides

Per direct request: same helloModa look and feel (warm lavender-gray canvas, glass panels,
Fraunces/Bonheur Royale, purple accent — explicitly *not* the dark/industrial "mission control"
direction a loaded design-taste reference leaned toward, which would have fought the established
brand), but heavier editorial composition, real imagery, and a literal demonstration of the
product rather than just a CTA button.

- **Real generated hero images, one per guide.** Each guide now has a `heroImagePrompt`
  (`src/data/guides.js`) and a new one-off script, `scripts/generate-guide-images.mjs` — run
  manually with `REPLICATE_API_TOKEN` set, saves real watercolor-style images (the same house
  style/pipeline as chat's `OutfitHero`) to `public/guides/{slug}-hero.jpg` as static files. No
  Supabase Storage/signing needed — this is public marketing content, not per-user data. Not run
  here (this sandbox still can't reach `api.replicate.com`); pages work correctly without it.
- **`GuideHeroImage.jsx`**: renders the real image when present, falls back to the same
  illustrated `GarmentArt` placeholder the chat UI already uses otherwise — never a broken image.
  **Real bug caught and fixed while verifying this**: the first version rendered the `<img src>`
  directly in server HTML, so on a fast local 404 the native `error` event fired *before* React
  hydration attached the `onError` listener — the event was lost, and the fallback silently never
  appeared (confirmed via `naturalWidth: 0` with zero re-render, no console errors in production
  mode masking it further). Fixed by deferring `src` to a client-only effect after mount, so the
  request — and any error — only happens once the listener is live. Documented in the component
  itself since it's a non-obvious gotcha, not something a future edit should "simplify" away.
  Verified via direct DOM inspection (img/svg counts, `naturalWidth`), not just a screenshot,
  since a screenshot alone wouldn't have caught the original silent failure.
- **Detail page redesign**: split hero (oversized headline + hook rendered as a script-font pull
  quote, image alongside — not stacked), alternating for-her/for-him sections with illustrated
  look tiles (not the same photo repeated — repeating one generated image across a page reads as
  repetitive, not "lots of images"), a new `palette` field per guide rendered as literal color
  swatches instead of prose-only color description, and a new **`GuideShowcase.jsx`** — "See it
  in helloModa" — styled with the *exact* visual grammar of a real chat turn (`MessageBubble.jsx`:
  script-font title, narrative copy, a prompt chip), reusing the guide's own hero image. This is
  a literal, honest demonstration of the product's real UI, not a mockup or screenshot standing
  in for one.
- **Index page redesign**: large image-forward cards per guide (still grouped by category),
  replacing the earlier small text-only glass cards.
- `weatherNotes`→`contextNotes` rename (previous entry) stays; this pass didn't touch that.

---

## 2026-09-20 — Broadened SEO guides beyond weddings

Direct follow-up to a real inconsistency: while pitching Awin advertisers on helloModa as "an AI
stylist for any occasion," the public site itself (`/what-to-wear`) was 100% wedding content —
the messaging and the site didn't match, which a reviewer could easily notice. Fixed by actually
broadening the content, not just the pitch:

- 3 new guides (`src/data/guides.js`): Job Interview, First Date, Summer Festival — same depth
  and specificity as the wedding guides (for her / for him / fabric & color / context notes /
  what to avoid), not a thinner template. 9 guides total now, all statically generated.
- Added a `category` field ("Wedding Guest" / "Everyday Occasions") to every guide; the index
  page (`/what-to-wear/page.jsx`) now groups by category instead of one flat grid.
- Renamed the `weatherNotes` field to `contextNotes` across all 9 guides and the detail page's
  "Weather notes" section header to "Weather & setting notes" — the field covers actual weather
  for outdoor wedding occasions but venue/culture-reading advice for interviews and dates, so the
  old name stopped fitting once the content wasn't wedding-only.
- Updated the index page's title/description/OG metadata and intro copy to drop wedding-specific
  framing ("Wedding Guest Style Guides" → "Style Guides"), and swapped the copy's own example
  from two wedding types to a wedding vs. job-interview contrast, so the page's own text
  demonstrates the broader scope rather than just asserting it.
- Cross-link list at the bottom of each guide ("Other occasions") intentionally stays a flat mix
  across categories — good for internal linking/SEO — only the index page groups.
- Verified: all 9 routes prerender and return 200, index page renders the two category sections
  correctly, the new guides' "Weather & setting notes" section reads naturally despite the field
  rename.

---

## 2026-09-20 — SEO landing pages: "What to Wear to a [X] Wedding"

Per direct request, with a real blocker surfaced and cleared first: `docs/06-risks-legal.md`
explicitly listed "no indexed SEO landing pages" as part of the low-profile posture pending a
Fashion Days employment-contract conflict-of-interest review. Confirmed with Silviu that the
review is done and the risk is accepted before building anything — updated that doc to record it
rather than silently proceeding.

- 6 hand-curated guides (`src/data/guides.js`): beach, black-tie, garden, vineyard, fall, and
  winter weddings — real, distinct, specific content per occasion (for her / for him / fabric &
  color / weather notes / what to avoid), not a templated fill-in-the-blank, to avoid the thin-
  content trap that actively hurts SEO. Static data, not generated per-request, so search engines
  see stable content.
- `/what-to-wear` (index) and `/what-to-wear/[slug]` (detail, `generateStaticParams` — all 6
  prerendered at build time), sharing a new lightweight `GuideLayout.jsx` — deliberately not
  `AppShell`, no bottom bar or auth-only chrome, just a header (logo + "Try helloModa" CTA) and
  footer. Each detail page has real `generateMetadata` (title/description/canonical/OG) and a
  JSON-LD `Article` schema block.
- `src/app/robots.js` / `sitemap.js` (Next's file-convention routes): only `/what-to-wear` is
  allowed/listed — everything else stays disallowed, since the rest of the app is the
  authenticated private beta, not meant to be indexed.
- `middleware.js`'s auth gate now explicitly exempts `/what-to-wear`, `/robots.txt`, and
  `/sitemap.xml` — without this they'd 307-redirect to `/login` like every other route, silently
  breaking indexing.
- New `src/lib/siteConfig.js` (`SITE_URL`, defaults to `hellomoda.shop`) — also wired into root
  `layout.jsx`'s `metadataBase` (was missing before this, so any relative OG/canonical URLs
  anywhere in the app would have resolved incorrectly).
- Verified locally: all 6 guide routes 200, unknown slug 404s, `robots.txt`/`sitemap.xml` 200 and
  correctly scoped, unauthenticated root still redirects (307) — the exemption is scoped
  correctly, not an accidental full auth bypass. Real search-engine indexing obviously can't be
  verified here; that's on actual deployment + Google Search Console over time.

---

## 2026-09-20 — CLIP embedding + wardrobe similarity matching infrastructure

Prompted by "how do we find matching pieces for a suggested outfit" — the real answer (a synced
Awin catalog, CLIP-embedded and pgvector-matched, per `05-integrations-affiliates.md`/Phase 3) is
blocked on the Awin signup, still on hold. Built the shared infrastructure that's a prerequisite
either way and *is* fully testable today without Awin — matching against the user's own wardrobe:

- `src/lib/embeddings.js`: `embedText()`/`embedImageUrl()` via Replicate's
  `krthr/clip-embeddings` (clip-vit-large-patch14, 768-dim). Chosen specifically because text and
  images land in the *same* vector space — a wardrobe photo gets embedded directly as an image,
  no need to write a text description of it first, which is a better design than the
  "describe both sides, then text-match" approach originally proposed.
- `wardrobe_items.embedding`/`products.embedding` resized from a never-used placeholder
  `vector(512)` to `vector(768)` to match (safe — verified 0 rows had an embedding first), plus
  HNSW cosine-distance indexes on both.
- New `match_wardrobe_items()` Postgres function (SQL, `SECURITY INVOKER` — runs under the
  caller's RLS, not a separate access-control boundary) — cosine-similarity search over the
  caller's own wardrobe, optional category filter. `src/lib/wardrobeMatching.js` wraps it.
- `addWardrobeItem` (`src/actions/wardrobe.js`) now embeds every new item automatically — the
  photo if one exists, else a text embedding of brand/name/category. Best-effort: a failed embed
  (Sentry-reported) doesn't block adding the item.
- New `POST /api/wardrobe/backfill-embeddings`: embeds any of the caller's existing items that
  predate this (run once per account, manually — see the route's own comment for the one-line
  fetch to trigger it from the browser console while signed in).
- Verified the SQL side properly (the one part testable without Replicate, which this sandbox
  can't reach): loaded synthetic 768-dim vectors into the 3 real wardrobe items, confirmed
  `match_wardrobe_items()` ranks by actual cosine similarity (exact-match query scored 1.0,
  near-opposite scored -0.99) and that the category filter correctly excludes non-matching rows,
  then cleared the test vectors back to null. The Replicate embedding calls themselves are
  unverified end-to-end — next real wardrobe add is the actual test.
- **Deliberately not wired into the live chat/recommendation flow yet** — surfacing "you might
  already own something like this" for an AI "shop" suggestion without stepping on the stylist's
  explicit closet-vs-buy-new intent is a UX decision, not an infra one; worth its own pass once
  there's real embedded wardrobe data to try it against.

---

## 2026-09-20 — Watercolor style wasn't showing up in real generations — reordered + strengthened

First real generation seen (with `REPLICATE_API_TOKEN`/`ANTHROPIC_API_KEY` finally live) came
back **fully photorealistic**, zero watercolor quality — the style directive wasn't taking
effect at all, contradicting the intent behind the two style entries above. Two likely causes,
both fixed in `src/lib/imageGen.js`:

- `STYLE_DIRECTIVE` was appended *after* the scene description; diffusion prompt encoders weight
  earlier tokens more heavily, so it was losing to a `heroPrompt` written as vivid photographic
  scene description. Now prepended instead (`${STYLE_DIRECTIVE} Scene: ${prompt}`).
- Wording strengthened to explicitly say "NOT a photograph" up front — Flux's photorealism bias
  is strong enough that a soft "rendered as..." framing wasn't enough to override it.

**Verified against a real generation 2026-09-20 and accepted as-is** — still fairly subtle
watercolor quality, but judged good enough; no further prompt tuning or LoRA needed for now.
Revisit `STYLE_DIRECTIVE` again only if that judgment changes later.

---

## 2026-09-20 — Reverted: soft-to-white feathered margins

Per direct request ("let's ditch the feathering done like that") — removed entirely, not
replaced with a different technique. `imageGen.js` is back to returning Replicate's output
directly (full-bleed), the `sharp` post-processing step and `applyWatercolorMargin()` are gone,
and the `sharp` dependency is uninstalled. Also reverted the prompt-side "generous empty space
toward the edges" line in `STYLE_DIRECTIVE` that was added specifically to complement the
feathering — the watercolor-style wording itself stays. See the entry below for what was reverted
and why it was built the way it was (kept for history, not rewritten).

---

## 2026-09-20 — Soft-to-white feathered margins on generated images

Per direct request: generated images shouldn't reach the photo edge, like an unfinished
watercolor painting with white margins. Text-prompt wording alone is unreliable for a
compositional instruction like "leave the edges blank" (diffusion models are trained to fill the
whole frame), so this is a **deterministic post-processing step**, not a prompt hope:

- `applyWatercolorMargin()` in `src/lib/imageGen.js` (new `sharp` dependency — already present
  transitively via Next.js, so no real new weight) feathers the generated image's edges to
  transparent using a radial-gradient SVG mask (`dest-in` blend), then composites the result onto
  solid white. Every generated image gets this, unconditionally — not dependent on the model's
  compliance.
- Also added a light prompt-side complement to `STYLE_DIRECTIVE` ("generous empty space toward
  the edges... the subject sits within the frame, not cropped by it") so the model itself tends
  to leave the frame edges sparser, which the feather then blends more naturally.
- **Bug caught and fixed during verification:** the first version dropped the alpha channel
  when the intermediate faded buffer round-tripped through `.toBuffer()` without an explicit
  format — sharp silently fell back to the source's jpeg encoding (jpeg has no alpha), flattening
  the "transparent" edges to **black** instead of leaving them to composite onto white. Fixed by
  encoding that intermediate step as `.png()` explicitly. Caught by testing the actual
  `applyWatercolorMargin` function locally against a synthetic test image (this sandbox can't
  reach `api.replicate.com` to test a real generation end-to-end, but the post-processing step is
  pure image manipulation and testable in isolation) — the bug would otherwise have shipped
  silently, since a JPEG's default flatten-to-black looks like "a bug" but not an obviously wrong
  one without a side-by-side check.

---

## 2026-09-20 — House visual style for generated images: watercolor + realistic detail

Per direct request. `src/lib/imageGen.js` now appends a `STYLE_DIRECTIVE` string to every
`heroPrompt` before it goes to Replicate — soft watercolor washes and paper texture in the scene
and background, but the outfit itself (fabric, folds, fit) and the face/hands stay crisp and
realistically detailed. Chose prompt-only styling over a watercolor-tuned LoRA for now — zero new
infra, one string to edit and redeploy if the wording doesn't hold the look consistently across
generations; the LoRA route is documented as the upgrade path in `docs/02-tech-stack.md` if
prompt-only proves too inconsistent once you see real output (this sandbox can't reach
`api.replicate.com` to preview it — spot-check once `REPLICATE_API_TOKEN` is live).

---

## 2026-09-20 — Real outfit image generation (Replicate) — Phase 2

Per direct request ("let's go with Replicate," token already in hand). `docs/02-tech-stack.md`
had flagged fal.ai as the soft default from earlier research, but Replicate was chosen directly
rather than re-litigating that — both use the same async job pattern, so it isn't a hard commit:

- `src/lib/imageGen.js`: `generateOutfitImage(prompt)` calls Replicate
  (`black-forest-labs/flux-dev`) with the stylist's `heroPrompt` plus a fixed "editorial fashion
  photography, natural lighting, photorealistic" suffix, `aspect_ratio: "4:5"` to match
  `OutfitHero`'s frame, returns a jpeg Blob. Model is a one-line swap if Flux's output quality
  disappoints on real prompts.
- New private Storage bucket `generated-looks` (owner-scoped RLS, same pattern as
  `wardrobe-photos`/`avatars`), path `{user_id}/{recommendation_id}.jpg`. Generated images are
  re-hosted here rather than linked directly to Replicate's delivery URL, which isn't permanent.
- New `POST /api/generate-image` route: takes `{ recommendationId }`, relies on the existing RLS
  policy (owner via message → conversation) to reject anyone else's recommendation rather than
  hand-rolling an ownership check, generates + uploads + writes
  `outfit_recommendations.generated_image_url`, returns a signed URL. **Idempotent** — a
  recommendation that already has a generated image just returns its signed URL instead of
  paying for a second generation.
- **Called client-side, not behind a background-job worker.** The roadmap originally said
  "behind the background job worker," but there's no Trigger.dev/Inngest in this project yet
  (still just a Phase 0 stack pick, never wired up) — and Replicate's Node SDK already blocks
  until the prediction finishes (~5-10s for Flux), which fits inside one Vercel function call.
  `OutfitHero.jsx` fires the request itself right after a chat turn renders (title/narrative show
  instantly from the existing chat response; the hero image swaps in after, with a
  "Generating…" badge in between) — meets the roadmap's "good loading state" exit criterion
  without adding a queue/worker for a single call per turn. Revisit only if latency, Vercel
  timeouts, or volume make that not hold up.
- `getConversationMessages` (`src/actions/conversations.js`) now also loads and signs
  `generated_image_url`, so revisiting an old turn — including ones from before this shipped —
  loads the cached image if one exists, or triggers generation on demand if not (same
  `OutfitHero` code path either way, no special-casing "old" vs "new" turns).
- QA note: this sandbox's proxy blocks `api.replicate.com` outright (same class of limitation as
  Supabase — see the wardrobe-photo-upload entry), so a real generation call couldn't be verified
  end-to-end here. Verified instead via a temporary preview route (removed after): the
  "Generating…" state renders correctly, and a failed call (401 in the unauthenticated harness —
  the middleware matcher covers `/api/*`, same as the existing chat/wardrobe-tag routes) falls
  back cleanly to the placeholder rather than breaking the turn. Real generation needs
  `REPLICATE_API_TOKEN` set in Vercel and a live spot-check once deployed.

---

## 2026-09-20 — Sentry (error monitoring) + PostHog (product analytics) wired

A Phase 0 exit criterion ("Wire Sentry + PostHog," `docs/03-roadmap.md`) that had slipped —
neither was in the code until now, so the only way to learn about a production bug was a user
complaining, and there was zero usage data:

- **Sentry** (`@sentry/nextjs`): `sentry.server.config.js` / `sentry.edge.config.js` /
  `src/instrumentation-client.js`, loaded via `src/instrumentation.js`'s `register()` per
  runtime. `onRequestError` reports framework-level errors that escape a route's own try/catch;
  `src/app/global-error.jsx` catches anything that escapes the whole app shell and shows a
  minimal fallback instead of a blank page. The existing `catch` blocks in
  `api/chat/route.js` and `api/wardrobe/tag/route.js` now also call `Sentry.captureException`
  alongside their `console.error` (the graceful JSON error response to the user is unchanged —
  this only adds visibility). `next.config.js` wraps the config with `withSentryConfig` for
  source-map upload, which silently no-ops without `SENTRY_ORG`/`SENTRY_PROJECT`/
  `SENTRY_AUTH_TOKEN` set (build-time only, e.g. in Vercel).
- **PostHog** (`posthog-js`): `src/lib/analytics.js` inits once client-side and exports
  `track()`/`identifyUser()` — both safe no-ops until `NEXT_PUBLIC_POSTHOG_KEY` is set, same
  pattern as `ANTHROPIC_API_KEY`. `PostHogPageview.jsx` captures pageviews manually (App Router
  client navigations aren't full page loads, so `capture_pageview` is off). Instrumented the
  funnel that actually matters for the "describe an occasion → get styled" wedge, not just
  pageviews: `sign_up_submitted` (`register/page.jsx`), `chat_message_sent` and
  `wardrobe_item_added` (`AppShell.jsx`), `profile_saved` (`ProfileForm.jsx`). `AppShell.jsx`
  identifies the signed-in user (`userId` now passed down from `page.jsx`) on mount so events
  tie back to a real person, not an anonymous session.
- Both are genuinely inert with no keys configured — verified via a clean `npm run build` and a
  `npm run dev` smoke test (login page 200, unauthenticated root still redirects) with
  `NEXT_PUBLIC_SENTRY_DSN`/`NEXT_PUBLIC_POSTHOG_KEY` unset locally. Real event delivery couldn't
  be verified end-to-end here — no Sentry/PostHog project exists yet — spot-check once real keys
  are set (in Vercel, and locally if you want dev-time events too).
- First Load JS grew meaningfully (`/` went from ~185 kB to ~341 kB) — both SDKs are client
  bundles. Worth watching if it becomes a real perceived-load issue, not a concern yet.

---

## 2026-09-20 — Profile page (username, gender, avatar, measurements, sizes, style preferences, brands)

Per direct request, scoped down from a broader "full profile" list (colors-to-avoid, budget
range, location/climate deliberately left out this pass — easy to add to `profiles` later if
needed):

- New `/profile` page (`src/components/profile/ProfileForm.jsx`), linked from the bottom bar's
  Account dropdown. Extends the `profiles` table (which already existed with `display_name` +
  `style_traits`, auto-created per user by the `on_auth_user_created` trigger) with `gender`,
  `avatar_url`, `height_cm`/`weight_kg`/`bust_cm`/`waist_cm`/`hip_cm`, `size_top`/`size_bottom`/
  `size_shoe`, `favorite_brands`, `avoid_brands` — see `docs/04-data-model.md`.
- Avatar photo reuses the wardrobe-photo pattern end to end: client-side downscale
  (`imageResize.js`), upload to a new private `avatars` Storage bucket (owner-scoped RLS, same
  shape as `wardrobe-photos`), `image_url`-style path stored and turned into a signed URL
  (`src/lib/profileImages.js`) wherever it's read.
- Style preferences and brands are a new reusable `TagField` (chip list + free-text add, with
  one-tap suggestion chips for style preferences) — same component handles favorite brands and
  brands-to-avoid as two independent lists.
- **The profile now actually feeds the stylist**, not just storage: `formatProfileForPrompt`
  (`src/lib/stylist.js`) builds a context block from it, injected into every `POST /api/chat`
  call alongside the wardrobe list. The system prompt was updated with an explicit rule to use
  sizes/measurements only for silent fit/silhouette language and never comment on the user's body
  directly, and to favor favorite brands / avoid avoid-listed ones.
- The home screen's greeting name (`EmptyState.jsx`) now reads `profiles.display_name` instead of
  the never-actually-set `auth.users.user_metadata.display_name` — `/profile` is the first real
  way to set it.
- QA note: same sandbox limitation as the wardrobe-photo entry below (`*.supabase.co` blocked by
  this environment's proxy) — verified via a temporary unauthenticated preview route (removed
  after): avatar upload/preview, gender toggle, all measurement/size fields, style-preference
  suggestion chips + custom tags, and both brand tag lists all work; save correctly surfaces "Not
  signed in" inline in the unauthenticated harness, proving the error path. Real Storage
  upload/save should be spot-checked once deployed.

---

## 2026-09-19 — Wardrobe photo upload + AI attribute tagging

Phase 1 roadmap item (`docs/03-roadmap.md`'s "Digital closet"):

- `AddItemModal.jsx` now opens with a photo picker (`capture="environment"`
  for a direct camera shot on mobile) instead of only manual fields. Picking
  a photo downscales it client-side to ≤1024px jpeg (`src/lib/imageResize.js`)
  for speed/cost, shows an instant preview, and calls the new
  `POST /api/wardrobe/tag` route — a Claude vision call
  (`src/lib/wardrobeTagger.js`'s `WardrobeTagSchema`: name/category/colorHex/
  brand) that prefills the form. Every field stays editable — tagging is a
  starting point, never silently trusted, and brand is only ever set when a
  logo/label is actually legible in the shot (never guessed from style).
  If tagging fails (bad photo, model hiccup, no `ANTHROPIC_API_KEY`
  configured), the modal degrades to a clear inline message and the manual
  fields still work — photo capture and manual logging were never coupled.
- On submit, the photo uploads to a new private Supabase Storage bucket,
  `wardrobe-photos`, at `{user_id}/{uuid}.jpg` — RLS-scoped so a user can only
  read/write/delete their own folder (`wardrobe photos: owner select/insert/
  delete` policies), matching every other table's `auth.uid()` scoping in
  this project. `wardrobe_items.image_url` stores that Storage path, not a
  public URL; `src/lib/wardrobeImages.js` turns it into a 1-hour signed URL
  wherever wardrobe rows are read (`page.jsx` on load, `addWardrobeItem` on
  save) — never a public bucket, consistent with the private-beta posture.
  `WardrobeItemCard.jsx` renders the real photo when present, falling back to
  the existing color-swatch-plus-icon tile otherwise (saved-from-chat items
  still have no photo, and that's fine).
- Background removal (also named in the roadmap line) is deliberately not
  bundled here — it needs a separate paid service and isn't required for a
  usable upload+tag loop; the photo is stored/shown as-is for now.
- QA note: this sandbox's egress proxy blocks `*.supabase.co` outright (not
  just a cert-trust issue like prior UI passes), and `ANTHROPIC_API_KEY` isn't
  set locally either, so the real Storage upload and real vision tagging
  couldn't be exercised end-to-end here. Verified instead via a temporary
  unauthenticated preview route (removed after) exercising the actual
  component code: photo picker → preview → tagging call fails closed with the
  intended inline error (proving the fallback path) → manual fields still
  submit → card renders the uploaded photo. Caught and fixed a real bug in
  that pass: the preview blob URL was being revoked immediately after handoff
  to the parent, breaking the just-added card's image — fixed by making
  `AppShell.jsx#handleAdd` the one place that revokes it, only once the
  server-confirmed image has taken over (or the add failed). Real
  Storage/Claude calls should be spot-checked once deployed.

---

## 2026-09-19 — Bonheur Royale title font; cycling "thinking" line

Per direct request:

- Swapped the `script` font token (`tailwind.config.js`) from Caveat to
  **Bonheur Royale** — free on Google Fonts, closer to the calligraphic feel
  originally wanted from Liza (still unavailable — paid Underware webfont,
  see the 2026-09-19 "wider content column" entry below). Applies to outfit
  titles and the thinking line, both `font-script`.
- New `ThinkingLine.jsx`: instead of a static "thinking…" label, cycles
  every 1.5s through a fixed list of fashion-flavored synonyms ("Styling…",
  "Draping…", "Consulting the moodboard…", "Auditioning fabrics…", etc.) —
  purely decorative, see `docs/09-conversation-design.md`.
- Verified with the same temporary preview-route + Playwright pattern as
  prior redesigns (removed after) — confirmed both the new title font and
  the cycling phrase text render correctly.

---

## 2026-09-19 — All controls into one bottom bar; ditched turn containers

Per direct request, against new mockups:

- **New `BottomBar.jsx` replaces `TopBar.jsx` entirely** — every control
  (Home/new-chat, Chat toggle, Wardrobe toggle, the composer, History with a
  conversation-count badge, Share, Account) now lives in one bar anchored to
  the bottom of the screen, flanking the composer, instead of split between
  a header and an in-chat composer.
- **The composer moved out of `ChatView.jsx`** into the global bar, which
  means the send logic (`handleSend`) moved up to `AppShell.jsx` — it's no
  longer scoped to the chat view, since the bar (and its composer) is now
  visible and functional from every view. Sending while on Wardrobe switches
  to Chat and sends there.
- **Share is real, not a placeholder** — Web Share API, falling back to
  clipboard copy, sharing the most recent outfit's title+narrative as plain
  text. Deliberately not a link — there's no public/shareable conversation
  page built yet, and sharing a link a recipient couldn't open would be
  exactly the kind of dishonest UI this project has been avoiding elsewhere
  (fabricated retailer data, fake product prices, etc.).
- **Turn containers removed** — `MessageBubble.jsx`'s outer `glass` card is
  gone; the image and text sit directly on the page background. Same for
  the revealed "Find items" grid (`RecommendationCards.jsx`): flat images
  with a plain-text caption below, no bordered/gradient-overlay tile.
  Spacing increased throughout (title, gaps, inter-turn spacing) now that
  there's no box implicitly providing visual separation.
- Verified with the same temporary preview-route + Playwright pattern as the
  prior two redesigns (removed after). Caught one real bug this pass: the
  bottom bar overflowed the viewport on mobile (six icons + input in one
  row) — fixed with a responsive two-row layout (input on top, icons split
  evenly below) under the `sm` breakpoint.

---

## 2026-09-19 — Wider content column, two-column outfit turns

Layout refinements from new mockups, per direct request:

- Content column widened from `max-w-xl` (576px) to a new `max-w-content`
  token (1160px, `tailwind.config.js`) — used in `ChatView.jsx`'s message
  list and `EmptyState.jsx`. `Composer.jsx`'s input stayed narrower
  (`max-w-2xl`, 672px) — a 1160px-wide text field is poor ergonomics even
  when the surrounding content column is that wide.
- Each outfit turn (`MessageBubble.jsx`) is now a two-column split at `sm`+
  (`OutfitHero` image left, title/narrative/actions right) instead of the
  image stacked above the text — matches the reference mockups, collapses
  back to a single stacked column below `sm`. Title moved out of the
  image-overlay position (`OutfitHero.jsx` no longer renders it) into the
  text column as a standalone heading.
- `EmptyState.jsx`'s occasion-card and example-prompt rows switched from
  horizontal-scroll carousels to `flex-wrap` — at the new width they fit
  without scrolling; still wraps correctly on mobile.
- Asked about the requested **Liza** title font: it's a paid webfont
  (Underware, via their own store or Type Network), not on Google Fonts and
  not something this session can purchase or embed. Kept **Caveat**
  (already in place, already free/licensed) as the stand-in per the user's
  choice — swappable later via the single `script` token in
  `tailwind.config.js` if a Liza license gets purchased.
- Verified again via the same temporary unauthenticated preview route +
  Playwright pattern as the previous redesign entry (removed after).
  Found and worked around one sandbox-only issue this time: Playwright's
  Chromium doesn't trust this environment's proxy CA, so Google Fonts
  requests failed with a cert error and the title silently fell back to a
  generic serif in the first screenshot pass — not a real app bug (the CA
  is specific to this dev sandbox's egress proxy; Vercel has no such
  intercepting proxy). Re-shot with `--ignore-certificate-errors` on the
  local test browser only, confirmed Caveat actually renders correctly.

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
