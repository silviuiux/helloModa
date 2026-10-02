import { occasions } from "@/data/occasions";
import { signLookImageUrl } from "@/lib/lookImages";

// The welcome's occasion blobs (src/components/tete/BlobGallery.jsx) show
// the signed-in user's *own* generated look for an occasion when they've
// asked for it before — matched on the exact occasion prompt they sent
// (src/data/occasions.js) — instead of the stock photo. Per user and
// RLS-scoped on purpose: generated looks live in a private bucket and can
// carry someone's avatar likeness, so they're never shown to anyone else.
// Returns { [slug]: signedUrl }, newest look per occasion.
export async function loadOccasionLooks(supabase) {
  const slugByPrompt = new Map(occasions.map((o) => [o.prompt, o.slug]));

  const { data: asks, error: asksError } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at")
    .eq("role", "user")
    .in("content", [...slugByPrompt.keys()]);
  if (asksError || !asks?.length) return {};

  // A conversation's occasion is the first occasion prompt asked in it.
  const slugByConversation = new Map();
  for (const a of [...asks].sort((x, y) => x.created_at.localeCompare(y.created_at))) {
    if (!slugByConversation.has(a.conversation_id)) {
      slugByConversation.set(a.conversation_id, slugByPrompt.get(a.content));
    }
  }

  const { data: replies, error: repliesError } = await supabase
    .from("messages")
    .select("id, conversation_id")
    .eq("role", "assistant")
    .in("conversation_id", [...slugByConversation.keys()]);
  if (repliesError || !replies?.length) return {};
  const conversationByMessage = new Map(replies.map((m) => [m.id, m.conversation_id]));

  const { data: recs, error: recsError } = await supabase
    .from("outfit_recommendations")
    .select("message_id, generated_image_url, created_at")
    .in("message_id", [...conversationByMessage.keys()])
    .not("generated_image_url", "is", null)
    .order("created_at", { ascending: false });
  if (recsError || !recs?.length) return {};

  const pathBySlug = new Map();
  for (const r of recs) {
    const slug = slugByConversation.get(conversationByMessage.get(r.message_id));
    if (slug && !pathBySlug.has(slug)) pathBySlug.set(slug, r.generated_image_url);
  }

  const entries = await Promise.all(
    [...pathBySlug].map(async ([slug, path]) => [slug, await signLookImageUrl(supabase, path)])
  );
  return Object.fromEntries(entries.filter(([, url]) => url));
}
