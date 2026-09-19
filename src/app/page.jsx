import { createClient } from "@/lib/supabase/server";
import { listConversations, getConversationMessages } from "@/actions/conversations";
import AppShell from "./AppShell.jsx";

// Auth is already enforced by middleware (src/middleware.js) — an unauthenticated
// request never reaches here. This just loads the signed-in user's real data.
export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: wardrobe, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load wardrobe:", error.message);
  }

  const conversations = await listConversations().catch((err) => {
    console.error("Failed to load conversations:", err.message);
    return [];
  });
  const activeConversationId = conversations[0]?.id || null;
  const initialMessages = activeConversationId
    ? await getConversationMessages(activeConversationId).catch((err) => {
        console.error("Failed to load messages:", err.message);
        return [];
      })
    : [];

  return (
    <AppShell
      initialWardrobe={wardrobe || []}
      userEmail={user?.email}
      initialConversations={conversations}
      initialActiveConversationId={activeConversationId}
      initialMessages={initialMessages}
    />
  );
}
