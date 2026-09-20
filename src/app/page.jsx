import { createClient } from "@/lib/supabase/server";
import { listConversations } from "@/actions/conversations";
import { signWardrobeItems } from "@/lib/wardrobeImages";
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
  const wardrobeWithImages = wardrobe ? await signWardrobeItems(supabase, wardrobe) : [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const conversations = await listConversations().catch((err) => {
    console.error("Failed to load conversations:", err.message);
    return [];
  });

  // Always land on the welcome screen (docs/09-conversation-design.md) — past
  // conversations are reachable via the top bar's History dropdown, not
  // auto-resumed.
  return (
    <AppShell
      initialWardrobe={wardrobeWithImages}
      userId={user?.id}
      userEmail={user?.email}
      userDisplayName={profile?.display_name}
      initialConversations={conversations}
      initialActiveConversationId={null}
      initialMessages={[]}
    />
  );
}
