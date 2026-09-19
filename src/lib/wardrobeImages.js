// wardrobe_items.image_url stores a private Storage path (`{user_id}/{file}`),
// not a public URL — turn it into a short-lived signed URL server-side,
// wherever wardrobe rows are read. See docs/04-data-model.md.
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function signWardrobeImageUrl(supabase, path) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from("wardrobe-photos")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) {
    console.error("Failed to sign wardrobe image URL:", error.message);
    return null;
  }
  return data.signedUrl;
}

export async function signWardrobeItems(supabase, rows) {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      image_signed_url: await signWardrobeImageUrl(supabase, row.image_url),
    }))
  );
}
