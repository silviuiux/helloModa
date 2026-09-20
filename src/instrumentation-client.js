// Client-side Sentry init — Phase 0 exit criterion ("Wire Sentry + PostHog"),
// done 2026-09-20. Set NEXT_PUBLIC_SENTRY_DSN to actually send events; with
// it unset the SDK stays loaded but inert (no events sent, no crash).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Free-tier-friendly sampling — raise once real traffic/budget justifies it.
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

// Lets Sentry trace App Router client-side navigations, not just full loads.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
