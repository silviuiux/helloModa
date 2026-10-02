import { loadAppShellData } from "@/lib/appShellData";
import AppShell from "./AppShell.jsx";
import LandingPage from "./LandingPage.jsx";
import { createClient } from "@/lib/supabase/server";
import { loadShowcaseLooks } from "@/lib/showcaseLooks";

// "/" is public now (src/lib/supabase/middleware.js, 2026-09-21) — a
// signed-out visit renders the marketing LandingPage instead of being
// redirected to /login. A signed-in visit gets the real app below — since
// 2026-10-02 in the "tete" layout (src/components/tete/, formerly
// /design-07), by direct request. The previous layout (ChatView +
// BottomBar) is still AppShell's default branch: dropping `layout="tete"`
// here brings it back. Data loading lives in src/lib/appShellData.js,
// shared with the /design-0X comparison routes.
export default async function HomePage() {
  const { user, props } = await loadAppShellData();
  if (!user) {
    // Signed out: the landing page shows the public showcase looks.
    const showcase = await loadShowcaseLooks(await createClient()).catch(() => []);
    return <LandingPage showcase={showcase} />;
  }
  return <AppShell {...props} layout="tete" />;
}
