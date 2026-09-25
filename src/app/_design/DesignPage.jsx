import { redirect } from "next/navigation";
import { loadAppShellData } from "@/lib/appShellData";
import { DESIGN_ROUTES } from "@/lib/designRoutes";
import AppShell from "../AppShell.jsx";
import DesignSwitcher from "./DesignSwitcher.jsx";

// Shared body of /design-01, /design-02, /design-03: the real signed-in app
// (same server data as "/", same AppShell state and handlers — chat, image
// generation, history, avatars, wardrobe, quotas), rendered in one of the
// alternative layouts for side-by-side comparison with main.
export const designMetadata = {
  title: "helloModa — design comparison",
  robots: { index: false, follow: false },
};

export default async function DesignPage({ slug }) {
  const design = DESIGN_ROUTES.find((d) => d.slug === slug);
  const { user, props } = await loadAppShellData();
  // Middleware already sends signed-out visitors to /login; this is a
  // belt-and-braces guard for the server render.
  if (!user) redirect("/login");

  return (
    <>
      <AppShell {...props} layout={design.layout} basePath={`/${slug}`} />
      <DesignSwitcher current={slug} />
    </>
  );
}
