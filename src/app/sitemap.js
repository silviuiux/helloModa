import { guides } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";

// Only the public /what-to-wear guides — the rest of the app is
// authenticated and shouldn't be indexed.
export default function sitemap() {
  return [
    { url: `${SITE_URL}/what-to-wear`, changeFrequency: "monthly", priority: 0.8 },
    ...guides.map((g) => ({
      url: `${SITE_URL}/what-to-wear/${g.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
