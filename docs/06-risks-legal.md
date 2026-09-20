# helloModa — Risks & Legal

Not legal advice — a list of what needs real legal review before the corresponding roadmap
phase ships, plus the product decisions that follow from staying low-profile until then.

## 1. Fashion Days / eMAG conflict of interest — highest priority, blocks public launch

Your day job is UX work at Fashion Days, part of the eMAG ecosystem — genuinely useful domain
knowledge, but also the thing most likely to create a real conflict.

**✅ Contract review done, risk accepted — 2026-09-20.** The specific "no indexed SEO pages"
constraint below is lifted as of that date (see `08-changelog.md`); public SEO landing pages can
ship. The eMAG/Fashion Days affiliate non-integration and the no-proprietary-data rules below
still stand — narrower and unrelated to this review.

**Action needed before any public step (this blocks Phase 5, not Phase 0–4 private build):**
- Read your actual employment contract for non-compete, moonlighting-disclosure, and IP-
  assignment clauses. "IP assignment" clauses in particular can sometimes claim work-adjacent
  side projects even without an explicit non-compete — worth confirming, not assuming.
- If there's a moonlighting-disclosure requirement, decide whether/when to disclose this
  venture to your employer, ideally before it's discoverable rather than after.

**What "low-profile" means concretely, until that review happens:**
- No public marketing, no indexed SEO landing pages live yet, invite-only/private beta access
  (password gate or allowlist, per `03-roadmap.md` Phase 0).
- **Do not integrate the eMAG/Fashion Days affiliate program** (`05-integrations-affiliates.md`)
  — the most direct overlap. Use other affiliate networks for the private-beta build.
- Don't use any non-public Fashion Days catalog data, vendor contacts, or internal tooling
  knowledge in this build — general fashion e-commerce/UX expertise is fine, specific
  employer-proprietary information isn't.
- Fine to keep building product/tech in private (this whole doc set, the codebase, a private
  beta with friends) — the constraint is on *public/commercial* exposure, not on building.

## 2. AI-generated images of real brands / trademark exposure

Generating photorealistic visualizations that reference or resemble real brands' products (the
business plan explicitly names Zara, Farfetch) has some trademark/right-of-publicity exposure,
mostly around: implying brand endorsement, and generating images depicting a specific branded
product closely enough to be a copy rather than an inspired styling suggestion.

- Prefer generating **generic garment visualizations** ("ivory sheer knit," not "COS Fall 2026
  sheer knit exactly reproduced") and using the CV-matched real product's own retailer photo
  for the actual shoppable item, rather than generating a photorealistic fake of a specific
  branded product.
- Avoid any UI copy that could read as "endorsed by" a brand.

## 3. helloAvatar — GDPR special-category data

A user-generated "digital twin" from reference photos touches **biometric data**, which GDPR
classifies as special-category (Article 9) — higher consent bar than ordinary personal data.

- Explicit, specific consent flow before any avatar feature (Phase 3) goes live, separate from
  general ToS acceptance.
- Clear data retention/deletion path for avatar source photos and derived models.
- This is exactly why `03-roadmap.md` Phase 3 says "don't over-build before the legal/consent
  flow is right" — build the consent mechanism as part of the feature, not after.

## 4. Retailer Terms of Service

Covered in depth in `05-integrations-affiliates.md`: use affiliate network feeds, not scraping.
Scraping retailer sites for product data is both a ToS violation risk and directly the kind of
public/discoverable exposure the low-profile posture is meant to avoid.

## 5. Circular marketplace (Phase 4) — consumer protection & liability

The P2P rent/resell marketplace is the single highest legal-complexity feature in the whole
plan, and `03-roadmap.md` already gates Phase 4 on this being resolved first:

- Platform liability for counterfeit or misrepresented items sold/rented through the marketplace.
- Consumer protection obligations (EU Consumer Rights Directive implications for a marketplace
  facilitating consumer-to-consumer sales) — whether/how these apply depends on how the
  platform is structured (pure facilitator vs. more active role).
- Payment/escrow handling for rentals (holding funds during a rental period) may itself have
  regulatory implications depending on structure — Stripe Connect's standard flows should be
  checked against this specifically, not assumed to cover it.

**Do not build Phase 4 until a lawyer (even a single paid consultation) has looked at this.**

## 6. Data residency / GDPR generally

- Supabase and Vercel EU regions chosen specifically for this (`01-architecture.md`,
  `02-tech-stack.md`) — keep it that way as the default, don't quietly drift to US regions for
  convenience later.
- Standard requirements apply regardless of the above: privacy policy, data export/deletion
  on request, cookie consent for analytics (PostHog).
