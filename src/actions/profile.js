"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { signAvatarUrl } from "@/lib/profileImages";

// Real persistence for /profile (docs/04-data-model.md's `profiles` table).
// A row already exists per user (created by the `on_auth_user_created`
// trigger on signup) — this is always an update, never an insert.
export async function updateProfile(fields) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const {
    displayName,
    gender,
    avatarPath,
    heightCm,
    weightKg,
    bustCm,
    waistCm,
    hipCm,
    sizeTop,
    sizeBottom,
    sizeShoe,
    styleTraits,
    favoriteBrands,
    avoidBrands,
  } = fields;

  const update = {
    display_name: displayName?.trim() || null,
    gender: gender || null,
    height_cm: heightCm ?? null,
    weight_kg: weightKg ?? null,
    bust_cm: bustCm ?? null,
    waist_cm: waistCm ?? null,
    hip_cm: hipCm ?? null,
    size_top: sizeTop?.trim() || null,
    size_bottom: sizeBottom?.trim() || null,
    size_shoe: sizeShoe?.trim() || null,
    style_traits: styleTraits || [],
    favorite_brands: favoriteBrands || [],
    avoid_brands: avoidBrands || [],
  };
  // Only touch avatar_url when a new photo was actually uploaded this save —
  // undefined means "leave the existing one alone."
  if (avatarPath !== undefined) update.avatar_url = avatarPath;

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
  revalidatePath("/");
  return { ...data, avatar_signed_url: await signAvatarUrl(supabase, data.avatar_url) };
}
