"use client";

import { useEffect, useState } from "react";
import GarmentArt from "../GarmentArt.jsx";

// Real generated image (scripts/generate-guide-images.mjs) when it exists,
// falling back to the same illustrated placeholder the chat UI uses
// otherwise — never a broken image, and upgrades automatically once the
// script has run, no code change needed either way.
//
// The `src` is only set client-side, after mount, rather than rendered into
// the server HTML directly. A server-rendered `<img src>` starts loading
// during HTML parsing, before React hydrates and attaches the onError
// listener — on a fast local 404 the error fires and is lost before
// anything is listening, so the fallback silently never appears. Mounting
// with no src, then setting it in an effect, guarantees the load (and any
// error) happens after the listener is live.
export default function GuideHeroImage({ src, alt, className = "" }) {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setResolvedSrc(src);
    setErrored(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {resolvedSrc && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <GarmentArt type="look" />
      )}
    </div>
  );
}
