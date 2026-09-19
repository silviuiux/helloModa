import { createClient } from "@/lib/supabase/server";
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

  return <AppShell initialWardrobe={wardrobe || []} userEmail={user?.email} />;
}
