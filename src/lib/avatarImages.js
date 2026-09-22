// avatar_profiles.avatar_image_url stores a private Storage path
// (`{user_id}/{avatar_profile_id}.jpg`) in the `avatar-renders` bucket, not
// a public URL — same pattern as wardrobeImages.js/lookImages.js/profileImages.js.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function signAvatarRenderUrl(supabase, path) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("avatar-renders")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("Failed to sign avatar render URL:", error.message);
    return null;
  }
  return data.signedUrl;
}

export async function signAvatarProfiles(supabase, rows) {
  return Promise.all(
    (rows || []).map(async (row) => ({
      ...row,
      avatar_image_signed_url: await signAvatarRenderUrl(supabase, row.avatar_image_url),
    }))
  );
}
