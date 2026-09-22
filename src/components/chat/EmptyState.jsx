"use client";

import { useState } from "react";
import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";
import Orb from "../Orb.jsx";
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

// The welcome — and the hero of every conversation, since ChatView keeps it
// mounted above the thread (direct request 2026-09-21). The orb is
// helloModa's presence: it breathes at rest, swells while you type in the
// composer (`orbState="listening"`, wired through AppShell), and tightens
// into its thinking state while a reply is being made.
export default function EmptyState({ userDisplayName, userEmail, onPrompt, orbState = "idle" }) {
  const name = userDisplayName || firstNameFromEmail(userEmail);
  // Lazy initializer — shuffles once per mount, not on every render. All 20
  // occasions (src/data/occasions.js) render, just reordered.
  const [cards] = useState(() => shuffle(occasions));

  return (
    <div className="flex w-full flex-col pb-10 pt-[16vh] sm:pb-16">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <div className="animate-fade-up">
          <Orb size={104} state={orbState} />
        </div>
        <p className="label animate-fade-up mt-12 text-accent" style={{ animationDelay: "120ms" }}>
          helloModa — your stylist
        </p>
        <h1
          className="animate-fade-up mt-5 font-display text-[52px] font-semibold leading-[0.95] tracking-[-0.035em] text-ink sm:text-[84px]"
          style={{ animationDelay: "200ms" }}
        >
          hello{name ? `, ${name}` : ""}.
          <br />
          <span className="font-script text-[0.92em] font-normal italic tracking-[-0.01em] text-muted">
            what are we dressing for?
          </span>
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-sm text-[15px] leading-relaxed text-muted"
          style={{ animationDelay: "280ms" }}
        >
          Describe an occasion and I&apos;ll style a look from your closet — plus the one piece
          worth adding.
        </p>
      </div>

      {/* Deliberately full-bleed — not wrapped in max-w-content, so scrolling
          reveals cards edge-to-edge instead of stopping at the centered
          column. The first card still starts flush with the 1160px
          container's left edge. Card sizing (1:1, ~2.25 cards across the
          content column, 16px gap) is a direct request from 2026-09-21 —
          unchanged in the 2026-09-22 redesign, only restyled. */}
      <div
        className="animate-fade-up scroll-area mt-14 flex w-full gap-4 overflow-x-auto py-2 pl-4 pr-4 sm:pl-6 sm:pr-6"
        style={{ animationDelay: "360ms" }}
      >
        {cards.map((c) => (
          <button
            key={c.slug}
            onClick={() => onPrompt(c.prompt)}
            className="group relative aspect-square w-[78vw] shrink-0 overflow-hidden rounded-bubble border border-line bg-paper transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-accent-soft sm:w-[508px]"
          >
            <ImageWithFallback
              src={`/occasions/${c.slug}-hero.jpg`}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              fallback={<GarmentArt type={c.type} />}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
              style={{ background: "linear-gradient(to top, rgba(15,14,12,0.85), transparent)" }}
            />
            <span className="absolute bottom-4 left-5 text-[14px] font-medium text-ink">{c.label}</span>
            <span className="label absolute bottom-[18px] right-5 text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              style this →
            </span>
          </button>
        ))}
      </div>

      <div
        className="animate-fade-up mx-auto mt-16 flex w-full max-w-content flex-wrap gap-2 px-4 sm:px-6"
        style={{ animationDelay: "440ms" }}
      >
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="shrink-0 whitespace-nowrap rounded-bubble-sm border border-line bg-paper/60 px-4 py-2 text-[13px] text-muted transition-colors hover:border-accent-soft hover:text-ink"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
