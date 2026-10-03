import { createClient } from "@/lib/supabase/server";
import { listConversations } from "@/actions/conversations";
import { listAvatarProfiles } from "@/actions/avatars";
import { signWardrobeItems } from "@/lib/wardrobeImages";
import { signAvatarProfiles } from "@/lib/avatarImages";
import { loadOccasionLooks } from "@/lib/occasionLooks";
import { loadShowcaseLooks } from "@/lib/showcaseLooks";
import { loadConversationCovers, loadNextBooked } from "@/lib/conversationCovers";

// Everything the signed-in app needs on first render, loaded once on the
// server. Shared by "/" and the /design-0X comparison routes so every
// layout starts from exactly the same data. Returns { user: null } when
// signed out — callers decide what that means (landing page vs /login).
export async function loadAppShellData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, props: null };

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

  // The user's own looks win; the public showcase looks fill in the
  // occasions they haven't asked about yet; stock photos after that.
  const [ownLooks, showcase] = await Promise.all([
    loadOccasionLooks(supabase).catch((err) => {
      console.error("Failed to load occasion looks:", err.message);
      return {};
    }),
    loadShowcaseLooks(supabase).catch((err) => {
      console.error("Failed to load showcase looks:", err.message);
      return [];
    }),
  ]);
  const occasionImages = { ...Object.fromEntries(showcase.map((l) => [l.slug, l.url])), ...ownLooks };

  // Hover thumbnails for the conversations the welcome + menu link to, and
  // the next booked look for the welcome's "coming up" line.
  const [conversationCovers, nextBooked] = await Promise.all([
    loadConversationCovers(
      supabase,
      conversations.slice(0, 8).map((c) => c.id)
    ).catch(() => ({})),
    loadNextBooked(supabase).catch(() => null),
  ]);

  // Always land on the welcome screen (docs/09-conversation-design.md) —
  // past conversations are reachable from history, not auto-resumed.
  return {
    user,
    props: {
      initialWardrobe: wardrobeWithImages,
      userId: user.id,
      userEmail: user.email,
      userDisplayName: profile?.display_name,
      initialConversations: conversations,
      initialActiveConversationId: null,
      initialMessages: [],
      initialAvatarProfiles: avatarProfiles,
      occasionImages,
      showcase,
      conversationCovers,
      nextBooked,
    },
  };
}
