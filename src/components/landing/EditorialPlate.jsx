"use client";

import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";

// GarmentArt was drawn for small square cards — one faint silhouette
// letterboxed inside a 120x160 viewBox. Blown up to a hero-scale landscape
// slot it reads as an empty gradient, which is exactly wrong on a page
// whose whole brief is "big pictures".
//
// So: large slots get a composed plate instead — a real colour story, two
// or three overlapping silhouettes at editorial scale, light blooms and
// grain. It's openly an illustration rather than a fake photograph, and it
// swaps itself out for real generated photography the moment
// public/occasions/{slug}-hero.jpg exists (scripts/generate-occasion-
// images.mjs), same graceful-upgrade pattern as the rest of the app.

// Colour stories borrowed from the same vocabulary as src/data/guides.js's
// `palette` field, so the landing page and the guides feel related.
// Dark, warm-graded versions (2026-09-22 redesign) — the three plate stops
// stay near-black so the plates sit in the page's colour temperature; the
// fourth stop is the story's own hue, used only for the low bloom and the
// swatch dots.
const PALETTES = {
  dusk: ["#221c22", "#171317", "#0f0d0f", "#a0869a"],
  sand: ["#241e15", "#18140e", "#100e0a", "#c9a46a"],
  vine: ["#1b1e16", "#12150f", "#0d0f0b", "#8fa07c"],
  slate: ["#1a1d22", "#121418", "#0d0e11", "#8e95b4"],
};

export default function EditorialPlate({
  src,
  palette = "dusk",
  shapes = ["dress", "outerwear"],
  showSwatches = true,
  className = "",
}) {
  const colors = PALETTES[palette] || PALETTES.dusk;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <ImageWithFallback
        src={src}
        alt=""
        className="h-full w-full object-cover"
        fallback={
          <div
            className="grain relative h-full w-full"
            style={{
              background: `linear-gradient(145deg, ${colors[0]} 0%, ${colors[1]} 45%, ${colors[2]} 100%)`,
            }}
          >
            {/* light blooms — depth, so the plate isn't a flat wash */}
            <div
              className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-70"
              style={{ background: "radial-gradient(circle, rgba(212,168,83,0.22), transparent 70%)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full opacity-50"
              style={{ background: `radial-gradient(circle, ${colors[3]}44, transparent 70%)` }}
            />

            {/* Overlapping silhouettes at editorial scale — a styled
                flat-lay, not one stretched icon. Each panel is pinned to
                the 3:4 ratio of GarmentArt's own viewBox, otherwise
                preserveAspectRatio letterboxes the garment into a small
                shape floating in dead space. Slight overlap and opposing
                rotation give it the arranged-by-hand feel. `bare` so they
                share the plate's colour story rather than each bringing
                its own background. */}
            <div className="absolute inset-0 flex items-center justify-center">
              {shapes.map((shape, i) => (
                <div
                  key={`${shape}-${i}`}
                  className="relative aspect-[3/4] h-[84%]"
                  style={{
                    marginLeft: i === 0 ? 0 : "-4%",
                    transform: `translateY(${i % 2 === 0 ? "2%" : "-4%"}) rotate(${
                      (i - (shapes.length - 1) / 2) * 5
                    }deg)`,
                  }}
                >
                  <GarmentArt type={shape} bare strength={i === 0 ? 1.9 : 1.45} />
                </div>
              ))}
            </div>

            {showSwatches && (
              <div className="absolute bottom-4 left-5 flex items-center gap-1.5">
                {colors.map((c) => (
                  <span
                    key={c}
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-white/20"
                    style={{ background: c }}
                  />
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
