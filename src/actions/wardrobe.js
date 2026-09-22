"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { signWardrobeImageUrl } from "@/lib/wardrobeImages";
import { embedText, embedImageUrl } from "@/lib/embeddings";

// Real persistence for the wardrobe view (docs/04-data-model.md's `wardrobe_items`
// table). Photo upload + AI attribute tagging (docs/03-roadmap.md, Phase 1)
// happens client-side (AddItemModal.jsx calls /api/wardrobe/tag, then uploads
// the photo to the `wardrobe-photos` Storage bucket) — this action just
// persists the resulting fields plus the Storage path, if any.

export async function addWardrobeItem({ name, brand, category, color, tags, imagePath, priceCents }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert({
      user_id: user.id,
      name,
      brand: brand || "Unbranded",
      category,
      color_hex: color,
      tags: tags || [],
      image_url: imagePath || null,
      price_cents: priceCents ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  const imageSignedUrl = await signWardrobeImageUrl(supabase, data.image_url);

  // Best-effort: embed the photo directly if there is one, else fall back to
  // a text embedding of the item's fields — both land in the same CLIP
  // space (src/lib/embeddings.js). A failed embed shouldn't block adding the
  // item; it just won't surface in similarity matches until re-tried.
  try {
    const embedding = imagePath
      ? await embedImageUrl(imageSignedUrl)
      : await embedText(`${brand || "Unbranded"} ${name}, ${category}`);
    await supabase.from("wardrobe_items").update({ embedding }).eq("id", data.id);
  } catch (err) {
    console.error("Failed to embed wardrobe item:", err);
    Sentry.captureException(err);
  }

  revalidatePath("/");
  return { ...data, image_signed_url: imageSignedUrl };
}

export async function toggleWardrobeFavorite(id, nextValue) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wardrobe_items")
    .update({ is_favorite: nextValue })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function removeWardrobeItem(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// Closet analytics (docs/03-roadmap.md, Phase 3): lets a user price a piece
// after the fact, not just at add-time — most existing items were added
// before this field existed.
export async function setWardrobeItemPrice(id, priceCents) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wardrobe_items")
    .update({ price_cents: priceCents })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// "Worn today" — the manual half of cost-per-wear (the other half,
// suggested_count, comes from getStyledCounts below). Calls the
// increment_wardrobe_wear() SQL function (migration
// wardrobe_closet_analytics) rather than a read-then-write here, so two
// quick taps can't race and drop a wear.
export async function logWardrobeItemWear(id) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("increment_wardrobe_wear", { item_id: id });
  if (error) throw new Error(error.message);
  return data;
}

// How many times each wardrobe item has actually been included in a styled
// outfit (outfit_recommendation_items) — a softer, zero-effort signal
// alongside the manual wear count, not a substitute for it ("styled" isn't
// "worn"). Scoped to the given ids rather than trusting RLS alone, so this
// can't accidentally read another user's join rows if that table's policy
// is ever loosened.
export async function getStyledCounts(wardrobeItemIds) {
  if (!wardrobeItemIds?.length) return {};
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outfit_recommendation_items")
    .select("wardrobe_item_id")
    .in("wardrobe_item_id", wardrobeItemIds);
  if (error) throw new Error(error.message);

  const counts = {};
  for (const row of data || []) {
    counts[row.wardrobe_item_id] = (counts[row.wardrobe_item_id] || 0) + 1;
  }
  return counts;
}
