"use client";

import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";
import EditorialPlate from "./EditorialPlate.jsx";
import { Hanger, Check, Sparkle } from "../Icons.jsx";

// The five scenes that play inside StickyStage's pinned frame. They mirror
// the real product surfaces (EmptyState's occasion cards, the wardrobe
// grid, a MessageBubble turn, RecommendationCards, an /outfits row) using
// the same design tokens and the same rounded-bubble corner language —
// composed at stage scale rather than importing the app components
// verbatim, whose type sizes are tuned for a 1160px content column.
//
// Real generated photography drops in automatically wherever a
// public/occasions/{slug}-hero.jpg exists (scripts/generate-occasion-
// images.mjs); until then every slot falls back to the GarmentArt
// illustration, same as the rest of the app.

function Frame({ children }) {
  return <div className="h-full w-full p-6 sm:p-8">{children}</div>;
}

// Small tiles use rounded-xl2, matching what the real WardrobeItemCard and
// RecommendationCards use. rounded-bubble is for large surfaces (the hero
// photo, the occasion cards); chat bubbles and buttons use rounded-bubble-sm
// (tailwind.config.js).
function Tile({ slug, type, label, matched }) {
  return (
    <div className="relative min-w-0">
      <div
        className={`relative aspect-square overflow-hidden rounded-xl2 shadow-soft transition-all duration-500 ${
          matched ? "ring-2 ring-accent ring-offset-2 ring-offset-paper/60" : ""
        }`}
      >
        <ImageWithFallback
          src={slug ? `/occasions/${slug}-hero.jpg` : undefined}
          alt=""
          className="h-full w-full object-cover"
          fallback={<GarmentArt type={type} />}
        />
        {matched && (
          <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-canvas shadow-soft">
            <Check size={11} />
          </span>
        )}
      </div>
      {label && (
        <p className="mt-2 truncate text-[11.5px] font-medium text-ink">{label}</p>
      )}
    </div>
  );
}

// 01 — the occasion goes in.
export function SceneOccasion() {
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center">
        <p className="label text-faint">the welcome screen</p>
        <div className="mt-5 grid max-w-[600px] grid-cols-3 gap-3 sm:gap-4">
          <Tile slug="rooftop-birthday" type="outerwear" label="Rooftop birthday" />
          <Tile slug="wedding-guest" type="dress" label="Wedding guest" />
          <Tile slug="big-interview" type="bottoms" label="Big interview" />
        </div>
        <div className="mt-7 max-w-sm rounded-bubble-sm border border-accent-soft/50 bg-accent-tint/70 px-5 py-3.5 backdrop-blur-md">
          <p className="text-[13.5px] leading-relaxed text-ink">
            It&apos;s a friend&apos;s rooftop birthday party this weekend, evening in the city.
          </p>
        </div>
      </div>
    </Frame>
  );
}

// 02 — it reads the closet before it reads a catalogue.
export function SceneCloset() {
  const closet = [
    { type: "top", label: "Graphic tee", matched: true },
    { type: "bottoms", label: "Black denim shorts", matched: true },
    { type: "shoe", label: "Air Force 1", matched: true },
    { type: "outerwear", label: "Wool coat" },
    { type: "bag", label: "Canvas tote" },
    { type: "dress", label: "Slip dress" },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center">
        <div className="flex items-baseline justify-between">
          <p className="label text-faint">your wardrobe</p>
          <p className="label hidden text-accent-deep sm:block">3 of 6 matched</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {closet.map((c) => (
            <Tile key={c.label} type={c.type} label={c.label} matched={c.matched} />
          ))}
        </div>
        <p className="mt-7 flex items-center gap-2 text-[13px] text-muted">
          <Hanger size={14} />
          Matched on how the pieces actually look — not a category label.
        </p>
      </div>
    </Frame>
  );
}

// 03 — one direction, rendered the way the app renders it.
export function SceneLook() {
  return (
    <Frame>
      <div className="grid h-full grid-cols-1 items-center gap-7 sm:grid-cols-2">
        <div className="relative aspect-[3/2] overflow-hidden rounded-bubble shadow-lift">
          <EditorialPlate
            src="/occasions/rooftop-birthday-hero.jpg"
            palette="dusk"
            shapes={["top", "bottoms", "outerwear"]}
          />
        </div>
        <div>
          <h3 className="font-script text-[40px] leading-[0.9] text-ink">Rooftop after dark</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
            City rooftops at night are all silhouette and shadow, so we&apos;re keeping it graphic
            and easy: your tee worn loose over the faded black denim shorts, anchored by the black
            AF1s so the whole thing reads sharp instead of casual-by-accident.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-bubble-sm border border-line px-4 py-1.5 text-[10px] font-medium uppercase tracking-label text-muted">
              Retry
            </span>
            <span className="flex items-center gap-1.5 rounded-bubble-sm bg-accent px-4 py-1.5 text-[10px] font-medium uppercase tracking-label text-canvas shadow-soft">
              <Hanger size={11} />
              Find outfit
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// 04 — the gap, named.
export function SceneGap() {
  const pieces = [
    { type: "outerwear", label: "Camp-collar overshirt", note: "The one to add" },
    { type: "top", label: "Graphic tee", note: "In your closet" },
    { type: "bottoms", label: "Denim shorts", note: "In your closet" },
    { type: "shoe", label: "Air Force 1", note: "In your closet" },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center">
        <p className="label text-faint">find outfit — expanded</p>
        <div className="mt-5 grid max-w-[680px] grid-cols-2 gap-4 sm:grid-cols-4">
          {pieces.map((p, i) => (
            <div key={p.label} className="min-w-0">
              <div
                className={`relative aspect-[3/4] overflow-hidden rounded-xl2 shadow-soft ${
                  i === 0 ? "ring-2 ring-accent ring-offset-2 ring-offset-paper/60" : ""
                }`}
              >
                <GarmentArt type={p.type} />
              </div>
              <p className="mt-2 truncate text-[11.5px] font-medium leading-tight text-ink">
                {p.label}
              </p>
              <p
                className={`mt-0.5 truncate text-[9.5px] uppercase tracking-label ${
                  i === 0 ? "text-accent-deep" : "text-faint"
                }`}
              >
                {p.note}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-7 text-[13px] text-muted">
          Three you own, one worth buying. No fabricated prices, no wall of products.
        </p>
      </div>
    </Frame>
  );
}

// 05 — it keeps.
export function SceneHistory() {
  const rows = [
    {
      slug: "rooftop-birthday",
      title: "Rooftop after dark",
      palette: "dusk",
      shapes: ["top", "outerwear"],
    },
    {
      slug: "networking-mixer",
      title: "Composed, not corporate",
      palette: "slate",
      shapes: ["outerwear", "bottoms"],
    },
    {
      slug: "wedding-guest",
      title: "Vineyard, golden hour",
      palette: "sand",
      shapes: ["dress", "bag"],
    },
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col justify-center">
        <p className="label text-faint">hello—outfits</p>
        <div className="mt-4 divide-y divide-line">
          {rows.map((r) => (
            <div key={r.title} className="flex items-center gap-5 py-4">
              <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden rounded-xl2 shadow-soft">
                <EditorialPlate
                  src={`/occasions/${r.slug}-hero.jpg`}
                  palette={r.palette}
                  shapes={r.shapes}
                  showSwatches={false}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-script text-[26px] leading-none text-ink">{r.title}</h4>
                <p className="mt-1.5 truncate text-[12.5px] text-muted">
                  Tap to pick the conversation back up where it stopped.
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-2 text-[13px] text-muted">
          <Sparkle size={14} />
          Every look you&apos;ve ever been given, still editable.
        </p>
      </div>
    </Frame>
  );
}

export const SCENES = [SceneOccasion, SceneCloset, SceneLook, SceneGap, SceneHistory];
