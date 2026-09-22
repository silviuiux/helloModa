"use client";

import PlaceholderImage from "../PlaceholderImage.jsx";

// Real generated image (scripts/generate-guide-images.mjs) when it exists,
// falling back to a placeholder photo seeded on the path — never a broken
// image, and upgrades automatically once the script has run.
export default function GuideHeroImage({ src, alt, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <PlaceholderImage src={src} seed={src} alt={alt} width={1000} height={1250} />
    </div>
  );
}
