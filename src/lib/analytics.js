"use client";

import posthog from "posthog-js";

// Product analytics — Phase 0 exit criterion ("Wire Sentry + PostHog"), done
// 2026-09-20. Initialized once, client-side only. With NEXT_PUBLIC_POSTHOG_KEY
// unset, this stays a safe no-op (same pattern as other not-yet-configured
// integrations in this project) rather than erroring.
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // App Router navigations are client-side, not full page loads — pageviews
    // are captured manually in PostHogPageview.jsx instead.
    capture_pageview: false,
    person_profiles: "identified_only",
  });
}

const enabled = () => typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

// Funnel events that actually matter for the "describe an occasion -> get
// styled" wedge (docs/03-roadmap.md) — not just pageviews.
export function track(event, properties) {
  if (!enabled()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId, properties) {
  if (!enabled()) return;
  posthog.identify(userId, properties);
}

export { posthog };
