import { embedText } from "./embeddings.js";

// Finds real catalog products (from onboarded affiliate retailers, e.g.
// Italist via Awin — see scripts/sync-products-italist.mjs) closest in
// meaning to a described piece, via the match_products Postgres function
// (pgvector cosine distance, docs/04-data-model.md). `products` RLS is
// public-read, so any Supabase client works here, no auth required.
export async function matchProducts(
  supabase,
  description,
  { category, retailer, limit = 6 } = {}
) {
  const queryEmbedding = await embedText(description);
  const { data, error } = await supabase.rpc("match_products", {
    query_embedding: queryEmbedding,
    match_category: category || null,
    match_retailer: retailer || null,
    match_count: limit,
  });
  if (error) throw new Error(error.message);
  return data || [];
}
