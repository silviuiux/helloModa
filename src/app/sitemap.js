import { guides } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";

// The public /what-to-wear guides plus "/" itself (the marketing landing
// page for signed-out visitors, 2026-09-21) — the rest of the app is
// authenticated and shouldn't be indexed.
export default function sitemap() {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/what-to-wear`, changeFrequency: "monthly", priority: 0.8 },
    ...guides.map((g) => ({
      url: `${SITE_URL}/what-to-wear/${g.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
