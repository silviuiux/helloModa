import { SITE_URL } from "@/lib/siteConfig.js";

// Everything except the public /what-to-wear guides is private-beta,
// authenticated app — not meant to be crawled or indexed.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/what-to-wear",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
