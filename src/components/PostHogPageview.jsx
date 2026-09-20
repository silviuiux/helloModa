"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { track } from "../lib/analytics.js";

// Manual pageview capture (see analytics.js — capture_pageview is off since
// App Router navigations don't fire a real page load). Needs a Suspense
// boundary around it wherever it's rendered (useSearchParams requirement).
export default function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams.toString();
    track("$pageview", { $current_url: query ? `${pathname}?${query}` : pathname });
  }, [pathname, searchParams]);

  return null;
}
