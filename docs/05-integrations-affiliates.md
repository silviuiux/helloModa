# helloModa — Retailer Data & Affiliate Integrations

## The core tension

The business plan wants real, purchasable inventory (Zara, Farfetch, etc.) matched via CV. In
practice there are three ways to get retailer product data, in order of legal/technical safety:

1. **Affiliate network product feeds** (safest, recommended for launch) — networks like
   **Awin**, **CJ Affiliate**, **ShopStyle Collective**, or **Rakuten Advertising** aggregate
   many retailers' product catalogs as structured feeds (XML/CSV, sometimes API) specifically
   for this use case, plus they handle commission tracking and payout. This is the plan's own
   "Affiliate Commission" revenue stream mechanism, not just a data source.
2. **Retailer-direct affiliate/partner APIs** — some retailers (e.g. Zalando's Partner Program)
   offer their own feed/API directly. Better data freshness, more integration work per retailer.
3. **Scraping** — explicitly avoid. Almost universally against retailer Terms of Service,
   fragile, and a real legal exposure for a venture that's supposed to stay low-profile.

## What to actually research before Phase 1 build starts

This doc flags the need rather than pretends to have already done it — this needs real,
current research, not assumptions baked into a plan:

- **Which affiliate networks have decent EU/Romanian fashion retailer coverage.**
  ShopStyle Collective and CJ Affiliate skew US-retailer-heavy; Awin has stronger European
  coverage and is worth checking first. Confirm actual retailer lists and commission terms
  before committing integration work to any one network.
- **Zalando Partner Program** — directly named in the business plan's tech stack section
  (`ShopStyle/CJ` as examples, Zalando named as a target retailer) — check current terms and
  whether it's accessible to an individual/small business.
- **eMAG / Fashion Days affiliate program** — technically available, and eMAG is Romania's
  dominant fashion e-commerce ecosystem, so the catalog coverage would be excellent. **Do not
  integrate this without first resolving the Fashion Days conflict-of-interest question in
  `06-risks-legal.md`.** This is the single biggest overlap risk between the day job and this
  venture — flagged here explicitly so it isn't done by default out of convenience.

## Ingestion pipeline (once a network is chosen)

1. Scheduled job (nightly, via the background worker) pulls the affiliate feed for onboarded
   retailers.
2. Normalize into the `products` table schema (`04-data-model.md`): brand, name, category,
   price, currency, product URL (with affiliate tracking params preserved), image URL.
3. Generate a CLIP embedding for each product image, store in `products.embedding`.
4. On outfit recommendation, match against this cached table via pgvector — never call the
   affiliate API live in the chat request path.

## Commission/link handling

- Every outbound "buy" link must carry the affiliate network's tracking parameters unmodified.
- Track click-through and (where the network supports postback/webhook conversion tracking)
  actual purchases, to measure real affiliate revenue per recommendation — needed to validate
  the business plan's 8–12% commission assumption against reality once live.
