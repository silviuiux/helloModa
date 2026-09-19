# helloModa — Core Data Model

Sketch, not a migration file — refine when Phase 0 scaffolding actually stands up Supabase.
All tables get Row-Level Security scoped to `auth.uid()` unless noted.

```
users                          -- from Supabase Auth, extended via a public.profiles table
  id (uuid, pk, = auth.users.id)
  display_name
  style_traits          jsonb  -- e.g. ["Minimal tailoring", "Soft neutrals"]
  created_at

wardrobe_items
  id (uuid, pk)
  user_id (fk -> users)
  name
  category               text  -- Tops/Bottoms/Dresses/Outerwear/Shoes/Bags/Accessories
  tags                   text[]
  brand
  color_hex
  image_url                     -- Supabase Storage path
  embedding              vector -- pgvector, CLIP embedding of the item photo
  is_favorite             bool
  available_for_rent      bool  default false   -- Phase 4
  available_for_sale      bool  default false   -- Phase 4
  created_at

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
  generated_image_url             -- Phase 2, nullable until then
  occasion                text
  weather_context         jsonb
  followup_question       text   -- superseded by quick_replies; unused going forward, kept for now

outfit_recommendation_items
  id (uuid, pk)
  recommendation_id (fk -> outfit_recommendations)
  wardrobe_item_id (fk -> wardrobe_items, nullable)   -- set if sourced from closet
  product_id (fk -> products, nullable)                -- set if matched to real catalog (Phase 3)
  suggested_brand         text   -- set instead, when this is a pure AI suggestion not yet
  suggested_name          text   -- matched to a real product (Phase 1 reality: no catalog
  suggested_category      text   -- exists yet — see 05-integrations-affiliates.md)
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
  embedding                vector -- pgvector, CLIP embedding of the product image
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

- **Two `embedding` columns** (`wardrobe_items`, `products`) both use the same CLIP embedding
  space so a generated look, a closet item, and a catalog product can all be compared with the
  same `pgvector` cosine-distance query — that's the mechanism behind "Shop Your Closet" (prefer
  owned items) and CV product matching (Phase 3).
- `outfit_recommendation_items.role` lets the UI distinguish "hero piece" vs "layer" vs
  "accessory," matching the business plan's outfit-narration style ("Start with the trousers
  as the anchor...").
- Keep `products` as a **cache** synced from affiliate feeds (nightly job), not a live
  pass-through — needed for fast pgvector search and to avoid hammering retailer APIs on every
  chat message.
