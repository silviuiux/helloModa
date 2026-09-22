# helloModa — Roadmap to Production

Phased so each phase ships something real and testable, in the order the business plan's own
Go-To-Market section implies ("The Wedge" → viral loops → marketplace). Full vision, staged —
per the locked-in decision in `00-overview.md`. Timelines assume solo, part-time-to-full-time
effort; treat them as order-of-magnitude, not commitments.

## Phase 0 — Foundations (2–4 weeks)
**Goal:** A real, deployed, empty-but-working skeleton on the actual production stack.

- Scaffold Next.js App Router project; port existing UI components/Tailwind config from the
  Vite repo.
- Stand up Supabase project (EU region), enable `pgvector`, define initial schema
  (`04-data-model.md`), wire up Supabase Auth (email + Google OAuth).
- Deploy to Vercel behind a password gate or invite-only allowlist (low-profile posture —
  see `06-risks-legal.md`).
- ✅ **Sentry + PostHog wired, 2026-09-20** (belatedly — this was a Phase 0 exit criterion that
  had slipped): error monitoring and product analytics are in code and safe-no-op until real
  project keys are set (`.env.local.example`). See the 2026-09-20 changelog entry.

**Exit criteria:** You can sign up, log in, and see an empty wardrobe/chat shell running on
real infra, privately.

## Phase 1 — The Wedge: Wedding Guest MVP (4–8 weeks)
**Goal:** The core "describe an occasion → get styled" loop, real (not mocked), for one
high-intent niche, matching the business plan's Phase 1 GTM.

- ✅ **Real chat, shipped 2026-09-19:** `POST /api/chat` calls Claude (`claude-opus-5`) with a
  system prompt encoding the stylist persona; structured JSON output (title/narration/cards/
  follow-up) via Zod + `output_config.format`, not freeform text, so it plugs directly into the
  existing recommendation-card UI. Multi-conversation support (list, switch, new chat) in the
  sidebar. Conversation + message history persisted in Postgres (`conversations`, `messages`,
  `outfit_recommendations`, `outfit_recommendation_items`). The AI prioritizes real wardrobe
  items (passed by exact id, validated server-side against hallucination) before suggesting new
  pieces — "shop" suggestions are honestly unmatched (no fabricated retailer/price) since the
  affiliate catalog below doesn't exist yet.
- ✅ **Digital closet photo upload + AI tagging, shipped 2026-09-19:** `AddItemModal.jsx`
  uploads a photo to a private Storage bucket and calls Claude vision
  (`POST /api/wardrobe/tag`) to prefill name/category/color/brand — still
  editable, brand only ever set from a visible logo. Background removal is
  deliberately deferred (needs a separate paid service, not required for a
  usable loop).
- Outfit recommendations: resolve today's "shop" suggestions to real affiliate products from the
  cached catalog (`05-integrations-affiliates.md`) via text/category match once Awin is live —
  no image generation or CV matching yet, keep this phase cheap and fast. (Image generation
  ended up shipping anyway, Phase 2, see below — this bullet's "no CV matching yet" still holds:
  ✅ the shared CLIP-embedding/pgvector-matching infra shipped 2026-09-20, scoped to the wardrobe
  only since Awin itself is still on hold — see Phase 3's embedding bullet.)
- "Upload your invitation" tool: parse a wedding invitation image/text for dress code cues (can
  reuse the same vision-model call as closet tagging).
- ✅ **SEO landing pages, shipped 2026-09-20, broadened same day:** `/what-to-wear/[slug]` — 9
  statically generated, hand-curated guides across two categories: Wedding Guest (beach,
  black-tie, garden, vineyard, fall, winter) and Everyday Occasions (job interview, first date,
  summer festival) — grouped on the index page. Plus `robots.txt`, `sitemap.xml`, and JSON-LD
  Article schema per guide. Public and indexed — cleared 2026-09-20 per `06-risks-legal.md`'s
  Fashion Days conflict-of-interest review (previously blocked). Content is static/curated, not
  generated per-request, so it stays stable for search engines. Broadened beyond wedding-only the
  same day it shipped, once it became clear "wedding" was meant as one example occasion, not the
  whole scope — see `08-changelog.md`.

**Exit criteria:** A real user can describe a wedding, get a genuinely useful outfit
recommendation mixing closet + shoppable items, and click through to buy. Private beta only.

## Phase 2 — Generative Visualization (4–6 weeks)
**Goal:** The "Magic Mirror" — photorealistic visualization, the plan's headline differentiator.

- ✅ **Real image generation, shipped 2026-09-20:** `POST /api/generate-image` calls Replicate
  (`black-forest-labs/flux-dev`) with the stylist's `heroPrompt`, generating the outfit-in-context
  image; cached in the private `generated-looks` Storage bucket (`outfit_recommendations.
  generated_image_url`), served via signed URL. Called client-side right after a chat turn
  renders (`OutfitHero.jsx`) rather than behind a separate background-job worker — Replicate's
  Node SDK blocks until the prediction finishes (~5-10s for Flux), which fits inside one request
  without needing Trigger.dev/Inngest yet; revisit only if generation latency or Vercel function
  timeouts become a real problem at higher volume. The text reply still renders instantly — the
  image fills in after, with a "Generating…" state — matching the exit criteria below without a
  bigger infra lift.
- Not yet done: the A/B on visual quality/latency/cost against real usage (needs actual traffic
  through it first) and a per-generation cost-tracking log (`07-costs-budget.md`) — do this once
  `REPLICATE_API_TOKEN` is live in production and turns are actually flowing through it.

**Exit criteria:** Outfit recommendations come with a generated visual, generated in an
acceptable time (target: under ~15s perceived latency with a good loading state), at a
per-generation cost you've actually measured against `07-costs-budget.md`.

## Phase 3 — Real Inventory Matching + Lifestyle Features (6–10 weeks)
**Goal:** Close the gap between "AI suggests" and "AI finds the actual purchasable thing,"
plus retention features.

- CLIP-embed the product catalog (from affiliate feeds) and generated look images; pgvector
  nearest-neighbor match to surface the closest real, buyable items instead of only
  text/category-matched ones. **The embedding + matching infra itself shipped early, 2026-09-20**
  (`src/lib/embeddings.js`, `wardrobeMatching.js`, `match_wardrobe_items()`) — built and tested
  against the wardrobe (which is real, needs no Awin) since it's a shared prerequisite either way.
  What's left here once Awin exists: the ingestion job that populates `products.embedding`, and
  extending `match_wardrobe_items()`'s pattern to a `products` equivalent.
- ✅ **helloAvatar v1, shipped 2026-09-22:** `/avatars` — the account holder plus up to 3 family
  members, each with their own measurements/sizes and a generated watercolor avatar. Consent is
  per-avatar and recorded (`avatar_profiles.consent_attested_at/consent_text_version`), and the
  reference photo is never stored at all (not stored-then-deleted — never written to disk/Storage
  in the first place; see `06-risks-legal.md` #3 and the 2026-09-22 changelog entry for the full
  reasoning). Wired into chat: picking an avatar in the bottom bar sends outfit generation through
  that avatar's painted image as an img2img reference (`generateOutfitImage`, `src/lib/imageGen.js`),
  and the stylist's text reply uses that avatar's sizing/measurements when it isn't the account
  holder's own.
- Calendar sync (Google first) + proactive nudges (needs a scheduled job, not just reactive chat).
- ✅ **Closet analytics, shipped 2026-09-22:** cost-per-wear and wardrobe value on the Wardrobe
  view — turned out to need two new `wardrobe_items` columns first (`price_cents`, `wear_count`),
  not just UI on data that already existed, since neither a purchase price nor a wear log existed
  in the schema before this.
- ✅ **Style Journal ("Vibe Cards"), shipped 2026-09-22:** `/outfits` (existing "Outfit history"
  list) redesigned into an editorial card grid grouped by month, reusing `conversations.title`
  (already the field this was meant to power, per `04-data-model.md`) and `created_at` — no new
  columns needed, confirming the roadmap's "mostly UI" framing.

**Exit criteria:** Recommended-to-buy items are real matched inventory, not just category
guesses; retention features are live for private beta users.

## Phase 4 — Circular Marketplace (8–12 weeks)
**Goal:** P2P rent/resell, the plan's third revenue stream — and its highest legal-complexity feature.

- Listings (rent/sell toggle on wardrobe items), Stripe Connect for payouts, escrow/hold logic
  for rentals.
- Trust & safety basics: reporting, item condition disputes, minimal identity verification.
- **Do not start this phase until `06-risks-legal.md`'s marketplace-liability questions are
  actually answered** (consumer protection obligations, counterfeit liability, platform-vs-
  marketplace legal classification) — this is the part of the plan most likely to need a lawyer.

**Exit criteria:** A user can list an item and another user can successfully rent/buy it,
with money moving safely and legally.

## Phase 5 — Mobile + Public Launch
**Goal:** Graduate out of low-profile/private-beta, once the Fashion Days conflict question is
resolved (`06-risks-legal.md`) and the core loop (Phases 1–3) is validated with real private-beta usage.

- React Native (Expo) app reusing the same Supabase backend.
- Public GTM per the business plan: SEO wedge content live publicly, then Phase 2/3 viral loops
  ("Help Me Choose" voting links).

## Explicitly deferred, not in this roadmap
Smart Mirror (IoT), AR "Style Snatch," biometric styling (Apple Watch/Oura), generative
manufacturing/3D knitting — the business plan's own "Future Horizon" section. Correctly framed
there as v3.0+ moonshots; no infra decisions needed now, revisit only after Phase 4 ships.
