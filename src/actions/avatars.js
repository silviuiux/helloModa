"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import { limitsFor } from "@/lib/plans";

// helloAvatar (docs/03-roadmap.md Phase 3, docs/04-data-model.md
// `avatar_profiles`). Self plus up to plans.js's maxAvatars family
// members per user — the cap is enforced here, app-side, rather than a DB
// trigger, matching this codebase's existing preference for business-rule
// checks in the action layer (e.g. no DB constraint on conversation counts
// either). Free is self-only; family members are a Pro feature
// (2026-09-22, part of giving the subscriptions table an actual gate to
// sell — see docs/08-changelog.md).

export async function listAvatarProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("avatar_profiles")
    .select("*")
    .order("is_self", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

function fieldsToRow(fields) {
  return {
    display_name: fields.displayName?.trim(),
    relationship: fields.relationship?.trim() || null,
    gender: fields.gender || null,
    age: fields.age ?? null,
    build: fields.build || null,
    height_cm: fields.heightCm ?? null,
    weight_kg: fields.weightKg ?? null,
    bust_cm: fields.bustCm ?? null,
    waist_cm: fields.waistCm ?? null,
    hip_cm: fields.hipCm ?? null,
    size_top: fields.sizeTop?.trim() || null,
    size_bottom: fields.sizeBottom?.trim() || null,
    size_shoe: fields.sizeShoe?.trim() || null,
  };
}

export async function createAvatarProfile(fields) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const [{ count, error: countError }, plan] = await Promise.all([
    supabase.from("avatar_profiles").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    getUserPlan(supabase, user.id),
  ]);
  if (countError) throw new Error(countError.message);
  const maxAvatars = limitsFor(plan).maxAvatars;
  if ((count || 0) >= maxAvatars) {
    throw new Error(
      maxAvatars === 1
        ? "Free plan includes one avatar (yourself). Upgrade to helloModa Pro to add family members."
        : `You can have up to ${maxAvatars} avatars (yourself + ${maxAvatars - 1} family members).`
    );
  }

  const row = fieldsToRow(fields);
  if (!row.display_name) throw new Error("A name is required.");

  const { data, error } = await supabase
    .from("avatar_profiles")
    .insert({ ...row, user_id: user.id, is_self: Boolean(fields.isSelf) })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/avatars");
  return data;
}

export async function updateAvatarProfile(id, fields) {
  const supabase = await createClient();
  const row = fieldsToRow(fields);
  if (!row.display_name) throw new Error("A name is required.");

  const { data, error } = await supabase
    .from("avatar_profiles")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/avatars");
  return data;
}

// Deletes the profile row and its generated avatar image (if any) — the
// full "clear retention/deletion path" the risk doc asks for, not just a
// DB row (an orphaned Storage object would otherwise outlive the profile
// a user thought they'd removed).
export async function deleteAvatarProfile(id) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("avatar_profiles")
    .select("avatar_image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("avatar_profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.avatar_image_url) {
    const { error: removeError } = await supabase.storage
      .from("avatar-renders")
      .remove([existing.avatar_image_url]);
    if (removeError) {
      // Row is already gone — this is best-effort cleanup, not worth failing the delete over.
      console.error("Failed to remove avatar render from storage:", removeError.message);
    }
  }

  revalidatePath("/avatars");
}
