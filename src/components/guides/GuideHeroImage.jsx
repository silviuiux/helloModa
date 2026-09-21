"use client";

import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";

// Real generated image (scripts/generate-guide-images.mjs) when it exists,
// falling back to the same illustrated placeholder the chat UI uses
// otherwise — never a broken image, and upgrades automatically once the
// script has run, no code change needed either way.
export default function GuideHeroImage({ src, alt, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ImageWithFallback
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        fallback={<GarmentArt type="look" />}
      />
    </div>
  );
}
