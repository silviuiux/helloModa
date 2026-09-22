# helloModa — Core Data Model

Sketch, not a migration file — refine when Phase 0 scaffolding actually stands up Supabase.
All tables get Row-Level Security scoped to `auth.uid()` unless noted.

```
users                          -- from Supabase Auth, extended via a public.profiles table
  id (uuid, pk, = auth.users.id)
  display_name
  gender
  avatar_url                    -- Supabase Storage path, `avatars` bucket (private, signed URL
                                    via src/lib/profileImages.js — same pattern as wardrobe photos)
  height_cm | weight_kg | bust_cm | waist_cm | hip_cm    numeric, all nullable
  size_top | size_bottom | size_shoe                     text, free-form (brand/region vary)
  style_traits          jsonb  -- e.g. ["Minimal tailoring", "Soft neutrals"]
  favorite_brands        text[]
  avoid_brands            text[]
  created_at

wardrobe_items
  id (uuid, pk)
  user_id (fk -> users)
  name
  category               text  -- Tops/Bottoms/Dresses/Outerwear/Shoes/Bags/Accessories
  tags                   text[]
  brand
  color_hex
  image_url                     -- Supabase Storage path, `wardrobe-photos` bucket
                                    (private; RLS-scoped to auth.uid(), signed URL
                                    via src/lib/wardrobeImages.js — never public)
  embedding              vector(768) -- CLIP (krthr/clip-embeddings via Replicate), image-embedded
                                    when a photo exists, else text-embedded from name/brand/
                                    category (src/lib/embeddings.js). Populated automatically on
                                    add (src/actions/wardrobe.js); pre-existing items need
                                    POST /api/wardrobe/backfill-embeddings run once.
  is_favorite             bool
  available_for_rent      bool  default false   -- Phase 4
  available_for_sale      bool  default false   -- Phase 4
  price_cents              int  nullable -- optional, user-entered; powers closet analytics
                                    (wardrobe value + cost-per-wear), added 2026-09-22
  wear_count                int  default 0  -- manual "worn today" log, incremented via the
                                    increment_wardrobe_wear() SQL function (atomic, RLS-scoped),
                                    not a direct UPDATE — see src/actions/wardrobe.js
  last_worn_at        timestamptz nullable -- set alongside wear_count on each log
  created_at

avatar_profiles                  -- helloAvatar (Phase 3), added 2026-09-22
  id (uuid, pk)
  user_id (fk -> users)
  is_self                bool    -- exactly one true row per user (partial unique index)
  relationship            text   -- e.g. "Partner", "Daughter" — null for the is_self row
  display_name            text
  gender                  text   -- 'Woman' | 'Man' only (direct decision 2026-09-22); age below
                                     decides boy/girl vs man/woman phrasing, not a third option here
  age                     int    -- whole years; only ever used for child/adult phrasing in the
                                     generation prompt (src/lib/imageGen.js), never shown as a number
  build                   text   -- 'slim'|'average'|'athletic'|'fuller'|'heavyset', BMI-suggested
                                     by src/lib/avatarBuild.js and always user-editable — so the
                                     painted body isn't defaulted to slim/athletic regardless of
                                     actual measurements
  height_cm | weight_kg | bust_cm | waist_cm | hip_cm    numeric, all nullable
  size_top | size_bottom | size_shoe                     text, free-form
  avatar_image_url        text   -- Supabase Storage path, `avatar-renders` bucket (private,
                                     signed URL via src/lib/avatarImages.js); null until a photo
                                     is generated — the row can exist for measurements alone
  consent_attested_at  timestamptz  -- set by POST /api/avatar/generate, never before
  consent_text_version     text   -- src/lib/avatarConsent.js's AVATAR_CONSENT_TEXT_VERSION
  created_at, updated_at

conversations
  id (uuid, pk)
  user_id (fk -> users)
  title                          -- e.g. "London Trip" — powers the Style Journal / Vibe Cards
  created_at

messages
  id (uuid, pk)
  conversation_id (fk -> conversations)
  role                   text    -- 'user' | 'assistant'
  content                text
  created_at

outfit_recommendations
  id (uuid, pk)
  message_id (fk -> messages)     -- the assistant message that produced this
  title                    text   -- short evocative phrase, e.g. "Vineyard wedding" (docs/09-conversation-design.md)
  hero_prompt              text   -- image-gen prompt, written now, used once Phase 2 wires up real generation
  quick_replies            jsonb  -- AI-authored follow-up chips for this turn, e.g. ["Show me something more casual"]
  generated_image_url             -- Supabase Storage path, `generated-looks` bucket (private,
                                      signed URL via src/lib/lookImages.js); null until
                                      POST /api/generate-image populates it (Phase 2)
  occasion                text
  weather_context         jsonb
  followup_question       text   -- superseded by quick_replies; unused going forward, kept for now
  avatar_profile_id (fk -> avatar_profiles, nullable, on delete set null)   -- helloAvatar, added
                             2026-09-22: which avatar (if any) this look was generated for. Set
                             from the chat request; POST /api/generate-image reads it back to use
                             that avatar's image as an img2img reference (src/lib/imageGen.js).

outfit_recommendation_items
  id (uuid, pk)
  recommendation_id (fk -> outfit_recommendations)
  wardrobe_item_id (fk -> wardrobe_items, nullable)   -- set if sourced from closet
  product_id (fk -> products, nullable)                -- ✅ actually populated now, 2026-09-22:
                                    /api/chat matches each "shop" suggestion against the Awin
                                    catalog and sets this above a similarity threshold — see
                                    05-integrations-affiliates.md. Still often null in practice
                                    (no match, or below threshold), same fallback as before.
  suggested_brand         text   -- set instead, when this is a pure AI suggestion not
  suggested_name          text   -- matched to a real product — see 05-integrations-
  suggested_category      text   -- affiliates.md for when that actually happens
  role                    text   -- e.g. 'hero', 'layer', 'accessory'
  -- No longer requires wardrobe_item_id OR product_id to be set (the original
  -- constraint) — a row can have all three source fields null-but-suggested_*,
  -- since Phase 1 chat produces real AI suggestions with no catalog to link to yet.

products                          -- cached/synced from affiliate feeds, see 05-integrations
  id (uuid, pk)
  retailer                text
  affiliate_network       text
  external_id              text   -- retailer's own SKU/product id
  brand
  name
  category
  price_cents
  currency
  product_url               text  -- outbound affiliate link
  image_url
  embedding                vector(768) -- same CLIP space as wardrobe_items.embedding; populated
                                          once the Awin ingestion pipeline exists (on hold)
  last_synced_at

  unique(retailer, external_id)

subscriptions                      -- helloModa Pro
  id (uuid, pk)
  user_id (fk -> users)
  stripe_customer_id
  stripe_subscription_id
  status                    text
  current_period_end

marketplace_listings                -- Phase 4
  id (uuid, pk)
  wardrobe_item_id (fk -> wardrobe_items)
  owner_id (fk -> users)
  type                       text   -- 'rent' | 'sale'
  price_cents
  status                     text   -- 'active' | 'reserved' | 'sold' | 'removed'

marketplace_transactions            -- Phase 4
  id (uuid, pk)
  listing_id (fk -> marketplace_listings)
  buyer_id (fk -> users)
  stripe_payment_intent_id
  status
  created_at
```

## Notes

- **`profiles` feeds the stylist prompt** — `src/lib/stylist.js`'s `formatProfileForPrompt`
  injects display name/gender/style traits/sizes/measurements/favorite-avoid brands into every
  chat turn (`src/app/api/chat/route.js`), same pattern as the wardrobe list. The system prompt
  is instructed to use measurements/sizes only for silent fit/silhouette guidance, never to
  comment on the user's body directly.
- **`profiles.avatar_url` and body measurements are ordinary personal data, not the GDPR
  special-category concern in `06-risks-legal.md`'s helloAvatar section** — that's about a
  biometric digital-twin render from reference photos (Phase 3); a profile photo and numeric
  height/weight/bust/waist/hip fields don't trigger the same Article 9 bar, but keep them scoped
  to what the stylist actually uses if this table grows further.
- **Two `embedding` columns** (`wardrobe_items`, `products`) both use the same CLIP embedding
  space (`krthr/clip-embeddings`, 768-dim, text and images comparable directly — see
  `src/lib/embeddings.js`) so a generated look, a closet item, and a catalog product can all be
  compared with the same `pgvector` cosine-distance query. The `wardrobe_items` half of this
  (embedding pipeline + `match_wardrobe_items()` similarity search, `src/lib/wardrobeMatching.js`)
  shipped 2026-09-20 — that's the mechanism behind "Shop Your Closet." The `products` half (CV
  product matching, Phase 3) now has a real ingestion path too, live for Italist since
  2026-09-21 (`05-integrations-affiliates.md`, `scripts/sync-products-italist.mjs`,
  `match_products()` / `src/lib/productMatching.js`) — not yet wired into chat recommendations.
- `outfit_recommendation_items.role` lets the UI distinguish "hero piece" vs "layer" vs
  "accessory," matching the business plan's outfit-narration style ("Start with the trousers
  as the anchor...").
- Keep `products` as a **cache** synced from affiliate feeds (nightly job), not a live
  pass-through — needed for fast pgvector search and to avoid hammering retailer APIs on every
  chat message.
