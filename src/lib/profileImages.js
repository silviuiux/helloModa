// profiles.avatar_url stores a private Storage path (`{user_id}/{file}`) in
// the `avatars` bucket, not a public URL — same pattern as
// wardrobeImages.js, kept separate since it's a different bucket.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function signAvatarUrl(supabase, path) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("Failed to sign avatar URL:", error.message);
    return null;
  }
  return data.signedUrl;
}
