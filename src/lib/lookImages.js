// outfit_recommendations.generated_image_url stores a private Storage path
// (`{user_id}/{recommendation_id}.jpg`) in the `generated-looks` bucket, not
// a public URL — same pattern as wardrobeImages.js/profileImages.js.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function signLookImageUrl(supabase, path) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("generated-looks")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("Failed to sign generated-look image URL:", error.message);
    return null;
  }
  return data.signedUrl;
}
