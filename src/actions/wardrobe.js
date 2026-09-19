"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { signWardrobeImageUrl } from "@/lib/wardrobeImages";

// Real persistence for the wardrobe view (docs/04-data-model.md's `wardrobe_items`
// table). Photo upload + AI attribute tagging (docs/03-roadmap.md, Phase 1)
// happens client-side (AddItemModal.jsx calls /api/wardrobe/tag, then uploads
// the photo to the `wardrobe-photos` Storage bucket) — this action just
// persists the resulting fields plus the Storage path, if any.

export async function addWardrobeItem({ name, brand, category, color, tags, imagePath }) {
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return { ...data, image_signed_url: await signWardrobeImageUrl(supabase, data.image_url) };
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
