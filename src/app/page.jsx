import { loadAppShellData } from "@/lib/appShellData";
import AppShell from "./AppShell.jsx";
import LandingPage from "./LandingPage.jsx";

// "/" is public now (src/lib/supabase/middleware.js, 2026-09-21) — a
// signed-out visit renders the marketing LandingPage instead of being
// redirected to /login. A signed-in visit still gets the real app below,
// unchanged. Data loading lives in src/lib/appShellData.js, shared with the
// /design-0X comparison routes.
export default async function HomePage() {
  const { user, props } = await loadAppShellData();
  if (!user) return <LandingPage />;
  return <AppShell {...props} />;
}
