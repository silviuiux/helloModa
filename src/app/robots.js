import { SITE_URL } from "@/lib/siteConfig.js";

// The public /what-to-wear guides and the marketing landing page at "/"
// (signed-out visitors only — src/app/page.jsx, 2026-09-21) are the
// exceptions; everything else is private-beta, authenticated app, not
// meant to be crawled or indexed. "/$" (not plain "/") anchors to the exact
// root URL only, so it doesn't accidentally allow every authenticated
// sub-path a blanket "/" would.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/$", "/what-to-wear"],
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
