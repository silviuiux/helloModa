# helloModa — Changelog

Living log, append-only — never rewrite past entries, add new ones at the top.

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
