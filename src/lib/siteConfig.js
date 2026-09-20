// Single source of truth for the public site URL — used by metadataBase,
// robots.js, sitemap.js, and JSON-LD. Override with NEXT_PUBLIC_SITE_URL if
// the production domain ever changes.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hellomoda.shop";
