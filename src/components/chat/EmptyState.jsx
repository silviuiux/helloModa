"use client";

import { useState } from "react";
import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";
import { occasions } from "../../data/occasions.js";

const EXAMPLE_PROMPTS = [
  "What should I wear to a black-tie gala?",
  "Help me pack for a beach weekend",
  "I need an outfit for a work presentation",
  "Something for a first date, not too much",
];

function firstNameFromEmail(email) {
  if (!email) return null;
  const local = email.split("@")[0];
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Fisher-Yates — plain array.sort(() => Math.random() - 0.5) skews order in
// practice, this doesn't.
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function EmptyState({ userDisplayName, userEmail, onPrompt }) {
  const name = userDisplayName || firstNameFromEmail(userEmail);
  // Lazy initializer — shuffles once per mount, not on every render. All 20
  // occasions (src/data/occasions.js) render, just reordered, same as the
  // original 7-card version — the carousel scrolls, nothing is dropped.
  const [cards] = useState(() => shuffle(occasions));

  return (
    <div className="flex w-full flex-col items-center pb-10 pt-[33vh] text-center sm:pb-16">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <h1 className="font-script text-[48px] leading-[0.9] text-ink sm:text-[64px]">
          hello{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-[14px] font-medium text-accent-deep">this is helloModa</p>
        <p className="mx-auto mt-1 max-w-sm text-[14px] leading-relaxed text-muted">
          Describe an occasion, and I'll style a look from your closet — plus what to add.
        </p>
      </div>

      {/* Deliberately full-bleed — not wrapped in max-w-content like the
          rest of this component, so scrolling reveals cards edge-to-edge
          instead of stopping at the centered content column. Sized so
          ~2.25 cards fit the viewport width (direct request 2026-09-21). */}
      <div className="scroll-area mt-9 flex w-full gap-4 overflow-x-auto py-2 pl-4 pr-4 sm:pl-6 sm:pr-6">
        {cards.map((c) => (
          <button
            key={c.slug}
            onClick={() => onPrompt(c.prompt)}
            className="group relative aspect-[4/5] w-[44vw] shrink-0 overflow-hidden rounded-bubble shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <ImageWithFallback
              src={`/occasions/${c.slug}-hero.jpg`}
              alt=""
              className="h-full w-full object-cover"
              fallback={<GarmentArt type={c.type} />}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{ background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)" }}
            />
            <span className="absolute bottom-3 left-3 text-[13px] font-medium text-ink">
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mx-auto mt-32 flex w-full max-w-content flex-wrap justify-center gap-2 px-4 sm:px-6">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="glass-soft shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] text-muted transition-colors hover:text-accent-deep"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
