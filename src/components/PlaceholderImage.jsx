"use client";

import ImageWithFallback from "./ImageWithFallback.jsx";
import { placeholderSrc } from "../lib/placeholder.js";

// Real image first (`src`, e.g. a generated look or /occasions/{slug}-hero.jpg),
// then a deterministic placeholder photo (src/lib/placeholder.js), then —
// only if both fail, e.g. offline — a soft violet plate. Never a broken
// image icon, never an empty box.
export default function PlaceholderImage({ src, seed, width = 800, height = 1000, alt = "", className = "" }) {
  const imgClass = `h-full w-full object-cover ${className}`;
  const placeholder = (
    <ImageWithFallback
      src={placeholderSrc(seed, width, height)}
      alt={alt}
      className={imgClass}
      fallback={<div className="h-full w-full bg-gradient-to-br from-accent-tint via-hair to-accent-soft/50" />}
    />
  );
  if (!src) return placeholder;
  return <ImageWithFallback src={src} alt={alt} className={imgClass} fallback={placeholder} />;
}
