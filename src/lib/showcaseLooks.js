// A few generated looks shown to everyone — the landing page and, as a
// fallback, the signed-in welcome's occasion blobs. The whitelist lives in
// the `showcase_looks` table; a storage policy makes exactly those objects
// in the private `generated-looks` bucket readable by anon/authenticated,
// so they can be signed here without any user session. All were generated
// without an avatar (no one's likeness). See docs/08-changelog.md
// 2026-10-02. Add or remove one by inserting/deleting a row.
const SHOWCASE_TTL_SECONDS = 60 * 60 * 6;

export async function loadShowcaseLooks(supabase) {
  const { data: rows, error } = await supabase
    .from("showcase_looks")
    .select("path, slug, title, position")
    .order("position", { ascending: true });
  if (error || !rows?.length) return [];

  const { data: signed, error: signError } = await supabase.storage
    .from("generated-looks")
    .createSignedUrls(
      rows.map((r) => r.path),
      SHOWCASE_TTL_SECONDS
    );
  if (signError || !signed) return [];

  const urlByPath = new Map(signed.filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
  return rows
    .filter((r) => urlByPath.has(r.path))
    .map((r) => ({ slug: r.slug, title: r.title, url: urlByPath.get(r.path) }));
}
