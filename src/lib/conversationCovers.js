import { signLookImageUrl } from "@/lib/lookImages";

// Latest generated image per conversation, for the cursor-following
// thumbnails on "Continue …" / "Pick up where we left off" links
// (src/components/tete/CursorThumb.jsx). Only the handful of conversations
// those links show — not the whole history. RLS-scoped.
export async function loadConversationCovers(supabase, conversationIds) {
  if (!conversationIds.length) return {};
  const { data: replies, error } = await supabase
    .from("messages")
    .select("id, conversation_id")
    .eq("role", "assistant")
    .in("conversation_id", conversationIds);
  if (error || !replies?.length) return {};
  const conversationByMessage = new Map(replies.map((m) => [m.id, m.conversation_id]));

  const { data: recs, error: recsError } = await supabase
    .from("outfit_recommendations")
    .select("message_id, generated_image_url, created_at")
    .in("message_id", [...conversationByMessage.keys()])
    .not("generated_image_url", "is", null)
    .order("created_at", { ascending: false });
  if (recsError || !recs?.length) return {};

  const pathByConversation = new Map();
  for (const r of recs) {
    const id = conversationByMessage.get(r.message_id);
    if (id && !pathByConversation.has(id)) pathByConversation.set(id, r.generated_image_url);
  }
  const entries = await Promise.all(
    [...pathByConversation].map(async ([id, path]) => [id, await signLookImageUrl(supabase, path)])
  );
  return Object.fromEntries(entries.filter(([, url]) => url));
}

// The soonest look booked for today or later (style journal dates), shown
// on the welcome as a gentle "coming up" reminder. `today` is the server's
// UTC date — at worst a few hours off at the edges of a day, which only
// decides whether a just-passed booking still shows; null if none.
export async function loadNextBooked(supabase) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("outfit_recommendations")
    .select("id, title, event_date, generated_image_url, messages(conversation_id)")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1);
  if (error || !data?.length) return null;
  const r = data[0];
  return {
    id: r.id,
    title: r.title || "Your look",
    eventDate: r.event_date,
    conversationId: r.messages?.conversation_id || null,
    imageUrl: r.generated_image_url ? await signLookImageUrl(supabase, r.generated_image_url) : null,
  };
}
