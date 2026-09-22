"use client";

import PlaceholderImage from "../PlaceholderImage.jsx";
import { occasions } from "../../data/occasions.js";

// Full-bleed proof-of-breadth: the actual 20 occasions from
// src/data/occasions.js, not a marketing list written separately that
// could drift from what the product really covers. Track renders the set
// twice so the -50% keyframe loops on an invisible seam.
export default function OccasionMarquee() {
  const track = [...occasions, ...occasions];

  return (
    // No edge-fade overlays: they'd need to match the page's radial
    // gradient exactly at this scroll position, and a hardcoded stop just
    // paints a visible band. Full-bleed means letting it run off the edge.
    <div className="relative w-full overflow-hidden py-2">
      <div className="animate-marquee flex w-max gap-4 hover:[animation-play-state:paused]">
        {track.map((o, i) => (
          // 4:5 at 300px, close to the real carousel card's proportions.
          <div
            key={`${o.slug}-${i}`}
            className="group relative aspect-[4/5] w-[300px] shrink-0 overflow-hidden rounded-bubble border border-line shadow-soft"
          >
            <PlaceholderImage src={`/occasions/${o.slug}-hero.jpg`} seed={o.slug} width={600} height={750} />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{ background: "linear-gradient(to top, rgba(30,26,46,0.7), transparent)" }}
            />
            <span className="absolute bottom-3 left-4 text-[12.5px] font-medium text-white">
              {o.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
