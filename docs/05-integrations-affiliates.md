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

## Networks — researched 2026-09-19

| Network | Notes |
|---|---|
| **Awin** | Primary recommendation. Berlin/London HQ, 25,000+ advertisers, strongest EU coverage (UK/DE/FR/NL/SE especially). Carries ASOS, Zalando (Lounge), and most of the mid-market brands already in the app's seed data (Mango, & Other Stories, Arket, COS, etc. — confirm each individually in-dashboard). Has a real **product data feed API** (`productdata.awin.com`, "Create-a-Feed" tool) built for shopping/price-comparison publishers — exactly the ingestion use case in `04-data-model.md`, not just tracking links. **Start here.** |
| **Zalando Partner Program** | Zalando also runs its own direct program (`partner.zalando.com`) alongside its Awin listing — apply directly too, may give better data access. Commission ~5–10%, varies new vs. returning customer. |
| **Farfetch** | Named directly in the business plan. 1–8% commission depending on network, 30-day cookie. Available via several of the generalist networks (check current listing at signup time). |
| **CJ Affiliate / Rakuten Advertising** | Secondary networks, also carry ASOS and others; more US-centric than Awin but worth a backup account for reach. |
| **Sovrn Commerce (ex-VigLink) / Skimlinks** | Carry H&M (~2–10%) and About You (~5–15%, 7-day cookie). More of an auto-monetizing link layer than a curated feed — useful as supplementary revenue, less ideal as the primary catalog source for CV matching. |
| **2Performant** | Romania's own network — carries **eMAG / Fashion Days** (2Performant acquired Profitshare; eMAG's owner Dante International is now a 2Performant shareholder). **Do not integrate.** This is the single biggest overlap with the day job, and the one you'd default into for convenience precisely because it has the best Romanian catalog coverage — flagged here explicitly to not do that until the conflict-of-interest question in `06-risks-legal.md` is resolved. |

Not yet confirmed, check at signup: **Zara/Inditex** — thinner margins (~4% reported) and,
per available sources, managed through a smaller network (Captiv8) rather than the big
generalists above; verify directly rather than assuming Awin/Rakuten coverage.

## Recommended sequencing

1. Sign up for **Awin** as a publisher — unlocks Zalando, ASOS, and most of the existing
   seed-data brands, plus the product feed API the ingestion pipeline below needs.
2. Apply to **Zalando's own Partner Program** and **Farfetch** directly in parallel.
3. Add CJ/Rakuten and Sovrn/Skimlinks later for coverage of H&M, About You, and anything Awin
   doesn't carry.
4. Leave 2Performant/eMAG alone until the conflict-of-interest review is done.

## Ingestion pipeline — live for Italist, 2026-09-21

Italist approved the Awin partnership; this is the first real advertiser, so the pipeline
described below is now real code, not just a plan.

1. `scripts/sync-products-italist.mjs` (thin per-retailer entry point) calls the shared
   `scripts/lib/syncAwinProducts.mjs`, which fetches the Awin datafeed (`AWIN_ITALIST_FEED_URL`
   — Awin dashboard -> Italist advertiser page -> Datafeeds, or `productdata.awin.com`'s
   "Create-a-Feed" tool), parses it (comma or tab, auto-detected; a few common Awin column-name
   aliases per field since publishers can rename columns in Create-a-Feed), and upserts into
   `products` on `(retailer, external_id)` — brand, name, category, price, currency,
   `product_url` (the `aw_deep_link`, untouched — this *is* the affiliate tracking link), image
   URL. Run manually for now: `node scripts/sync-products-italist.mjs`; a nightly
   cron/scheduled-job wrapper is the natural next step once this has run cleanly a few times.
2. Same script then embeds any product missing `embedding` (CLIP via `src/lib/embeddings.js`,
   same 768-dim space as `wardrobe_items`) — the slow, costly part, so re-syncs only embed
   new/changed rows, not the whole catalog every time.
3. `match_products()` (Postgres function, pgvector cosine distance, mirrors the existing
   `match_wardrobe_items`) and its JS wrapper `src/lib/productMatching.js` do the actual
   matching — same pattern as `wardrobeMatching.js`, just over the `products` table instead of
   a user's closet. `products` RLS is public-read, so no auth is required to query it.
4. **Not yet wired into `/api/chat`** — that's a deliberate follow-up, not part of this
   scaffold: today's "shop" suggestions are still honest AI text guesses (no real link). Wiring
   means, per outfit slot, calling `matchProducts()` and preferring a real hit above some
   similarity threshold over the AI guess, populating `outfit_recommendation_items.product_id`
   instead of `suggested_brand`/`suggested_name`. Worth doing once Italist's catalog has
   actually been synced and spot-checked for match quality, not blind.
5. Adding the next approved advertiser (once one comes in) is a copy of
   `scripts/sync-products-italist.mjs` with a new retailer slug and feed env var — the shared
   logic in `syncAwinProducts.mjs` doesn't change.

Never call the affiliate API live in the chat request path — `products` is always a cache,
synced ahead of time, per the original plan below.

## Commission/link handling

- Every outbound "buy" link must carry the affiliate network's tracking parameters unmodified.
- Track click-through and (where the network supports postback/webhook conversion tracking)
  actual purchases, to measure real affiliate revenue per recommendation — needed to validate
  the business plan's 8–12% commission assumption against reality once live.
