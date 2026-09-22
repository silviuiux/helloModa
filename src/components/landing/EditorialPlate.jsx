"use client";

import PlaceholderImage from "../PlaceholderImage.jsx";

// A large editorial image slot on the landing page: the real generated
// photograph when public/occasions/{slug}-hero.jpg exists
// (scripts/generate-occasion-images.mjs), otherwise a placeholder photo
// seeded on that path (src/lib/placeholder.js) — so each slot keeps the
// same stand-in until the real image replaces it, with no code change.
// Until 2026-09-22 the fallback was a composition of vector garment
// silhouettes; replaced with photos by direct request.
//
// The palette swatches are the look's colour story, borrowed from the same
// vocabulary as src/data/guides.js's `palette` field.
const PALETTES = {
  dusk: ["#efe8f6", "#d8cdee", "#bfb0e4", "#8c6ae2"],
  sand: ["#f6f1e8", "#e8dcc8", "#d9c7a8", "#b79b74"],
  vine: ["#f2f2ec", "#dfe3d2", "#c3cdb4", "#8fa07c"],
  slate: ["#f1f2f6", "#dfe2ec", "#c4c9dd", "#8e95b4"],
};

export default function EditorialPlate({ src, palette = "dusk", showSwatches = true, className = "" }) {
  const colors = PALETTES[palette] || PALETTES.dusk;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <PlaceholderImage src={src} seed={src} width={1200} height={800} />
      {showSwatches && (
        <div className="absolute bottom-4 left-5 flex items-center gap-1.5">
          {colors.map((c) => (
            <span
              key={c}
              className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/70 shadow-soft"
              style={{ background: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
