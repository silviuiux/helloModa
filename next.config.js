import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Wardrobe photos and product images live in Supabase Storage + affiliate
    // catalog CDNs — allow-list gets extended as real sources are wired up (Phase 1+).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

// Uploads source maps to Sentry at build time so stack traces are readable —
// only actually uploads when SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT are
// set (e.g. in Vercel); silently skipped otherwise, build still succeeds.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
});
