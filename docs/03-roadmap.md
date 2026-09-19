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
- Wire Sentry + PostHog.

**Exit criteria:** You can sign up, log in, and see an empty wardrobe/chat shell running on
real infra, privately.

## Phase 1 — The Wedge: Wedding Guest MVP (4–8 weeks)
**Goal:** The core "describe an occasion → get styled" loop, real (not mocked), for one
high-intent niche, matching the business plan's Phase 1 GTM.

- Real chat: Claude API call with a system prompt encoding stylist persona + occasion
  reasoning; store conversation history in Postgres.
- Digital closet: photo upload → background removal + AI attribute tagging (color/cut/category)
  via a vision-capable model call, stored as structured wardrobe items.
- Outfit recommendations: LLM proposes an outfit (mix of closet items + suggested new pieces);
  new pieces resolved to real affiliate products from the cached catalog (`05-integrations-affiliates.md`)
  via text/category match — no image generation or CV matching yet, keep this phase cheap and fast.
- "Upload your invitation" tool: parse a wedding invitation image/text for dress code cues (can
  reuse the same vision-model call as closet tagging).
- SEO landing pages: "What to wear to a [X] wedding" templates, statically generated.

**Exit criteria:** A real user can describe a wedding, get a genuinely useful outfit
recommendation mixing closet + shoppable items, and click through to buy. Private beta only.

## Phase 2 — Generative Visualization (4–6 weeks)
**Goal:** The "Magic Mirror" — photorealistic visualization, the plan's headline differentiator.

- Integrate hosted SDXL (fal.ai/Replicate) behind the background job worker; generate the
  outfit-in-context image (e.g. "at a winery") from the LLM's outfit description.
- Cache/store generated images in Supabase Storage; show a loading state in chat while the job runs.
- A/B the actual visual quality and generation latency before investing further — this is the
  highest-cost-per-interaction feature, validate it earns its keep.

**Exit criteria:** Outfit recommendations come with a generated visual, generated in an
acceptable time (target: under ~15s perceived latency with a good loading state), at a
per-generation cost you've actually measured against `07-costs-budget.md`.

## Phase 3 — Real Inventory Matching + Lifestyle Features (6–10 weeks)
**Goal:** Close the gap between "AI suggests" and "AI finds the actual purchasable thing,"
plus retention features.

- CLIP-embed the product catalog (from affiliate feeds) and generated look images; pgvector
  nearest-neighbor match to surface the closest real, buyable items instead of only
  text/category-matched ones.
- helloAvatar v1: user-uploaded reference photos → a simple digital twin the generated outfit
  is rendered on (start basic — this is a GDPR-sensitive feature, see risks doc, don't over-build
  before the legal/consent flow is right).
- Calendar sync (Google first) + proactive nudges (needs a scheduled job, not just reactive chat).
- Closet analytics: cost-per-wear, wardrobe value — straightforward once wardrobe data exists.
- Style Journal ("Vibe Cards") — mostly a UI/data-modeling feature on top of existing conversation data.

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
