import { createClient } from "@/lib/supabase/server";
import { listConversations } from "@/actions/conversations";
import { listAvatarProfiles } from "@/actions/avatars";
import { signWardrobeItems } from "@/lib/wardrobeImages";
import { signAvatarProfiles } from "@/lib/avatarImages";
import AppShell from "./AppShell.jsx";
import LandingPage from "./LandingPage.jsx";

// "/" is public now (src/lib/supabase/middleware.js, 2026-09-21) — a
// signed-out visit renders the marketing LandingPage instead of being
// redirected to /login. A signed-in visit still gets the real app below,
// unchanged.
export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

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

  const avatarRows = await listAvatarProfiles().catch((err) => {
    console.error("Failed to load avatar profiles:", err.message);
    return [];
  });
  const avatarProfiles = await signAvatarProfiles(supabase, avatarRows);

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
      initialAvatarProfiles={avatarProfiles}
    />
  );
}
