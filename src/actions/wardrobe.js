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
