"use client";

import { useEffect, useState } from "react";

// A server-rendered `<img src>` starts loading during HTML parsing, before
// React hydrates and attaches the `onError` listener — on a fast local 404
// the error fires and is lost before anything is listening, so a fallback
// would silently never appear (this exact bug, caught and fixed 2026-09-20
// in GuideHeroImage.jsx). Deferring `src` to a client-only effect
// guarantees the load (and any error) happens after the listener is live.
// Shared by GuideHeroImage.jsx and EmptyState.jsx's occasion cards — don't
// re-inline this fix a third time, reuse this.
export default function ImageWithFallback({ src, alt = "", className = "", fallback }) {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setResolvedSrc(src);
    setErrored(false);
  }, [src]);

  if (resolvedSrc && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolvedSrc} alt={alt} className={className} onError={() => setErrored(true)} />
    );
  }
  return fallback;
}
