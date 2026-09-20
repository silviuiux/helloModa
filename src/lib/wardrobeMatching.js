import { embedText } from "./embeddings.js";

// Finds the caller's own wardrobe items closest in meaning to a described
// piece (e.g. an AI-suggested "shop" piece from a chat turn), via the
// match_wardrobe_items Postgres function (pgvector cosine distance,
// docs/04-data-model.md). RLS-scoped through `supabase` — never returns
// another user's items.
export async function matchWardrobeItems(supabase, description, { category, limit = 3 } = {}) {
  const queryEmbedding = await embedText(description);
  const { data, error } = await supabase.rpc("match_wardrobe_items", {
    query_embedding: queryEmbedding,
    match_category: category || null,
    match_count: limit,
  });
  if (error) throw new Error(error.message);
  return data || [];
}
