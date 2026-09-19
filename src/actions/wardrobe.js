"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Real persistence for the wardrobe view (docs/04-data-model.md's `wardrobe_items`
// table). Photo upload + AI background-removal/tagging is a Phase 1 feature
// (docs/03-roadmap.md) — for now items are logged manually, same fields the
// existing AddItemModal UI already collects.

export async function addWardrobeItem({ name, brand, category, color, tags }) {
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
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return data;
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
