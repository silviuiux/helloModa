"use client";

import { useState } from "react";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Orb from "../Orb.jsx";
import { occasions } from "../../data/occasions.js";

const EXAMPLE_PROMPTS = [
  "Black-tie gala on Saturday — but I hate heels",
  "Beach weekend, carry-on only. What do I pack?",
  "Presenting to the leadership team on Thursday",
  "First date at a wine bar, not too try-hard",
];

const STICKY_COLORS = ["", "--pink", "--mint", "--sky"];
const TAPE_COLORS = ["", "--violet", "--pink"];
const ROTATIONS = [-4, 3, -2.5, 5, -3, 2, -5, 4, -1.5, 3.5, -2, 4.5];
const LIFTS = [0, 16, -8, 10, -6, 18, -4, 8, -12, 6, -10, 14];

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

// Design exploration (branch design/chat-moodboard): "completely fashion-
// focused, with cut-out images and a moodboard-like interface." Everything
// here reads as pinned to a corkboard — torn-edge photos (globals.css's
// `.moodboard-torn`, an honest styling effect, not real background
// removal — see that section's note), washi tape, a small rotated note for
// the greeting, sticky notes for the prompts, a fabric-swatch dot per card.
// Rotation/lift come from fixed arrays cycled by index, not Math.random,
// so server and client render identical markup.
export default function EmptyState({ userDisplayName, userEmail, onPrompt, orbState = "idle" }) {
  const name = userDisplayName || firstNameFromEmail(userEmail);
  // Lazy initializer — shuffles once per mount, not on every render. All 20
  // occasions (src/data/occasions.js) render, just reordered.
  const [cards] = useState(() => shuffle(occasions));

  return (
    <div className="flex w-full flex-col pb-10 pt-12 sm:pb-16">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <div
          className="moodboard-frame relative inline-block animate-fade-up"
          style={{ transform: "rotate(-1.5deg)" }}
        >
          <span className="moodboard-tape" />
          <div className="px-4 pt-2">
            <div className="flex items-center gap-2.5">
              <Orb size={30} state={orbState} mini />
              <span className="moodboard-stamp px-3 py-1">Your stylist is in</span>
            </div>
            <h1 className="moodboard-marker mt-3 text-[44px] leading-[0.95] text-ink sm:text-[58px]">
              hello{name ? `, ${name}` : ""}.<br />
              what are we dressing for?
            </h1>
          </div>
          <div className="moodboard-frame__caption max-w-sm px-4">
            <p className="font-sans text-[14px] leading-relaxed text-muted">
              Tell me the occasion, the vibe or the weather. I&apos;ll build the look from your
              wardrobe, paint it on you, and only suggest something new if it&apos;s genuinely
              missing.
            </p>
          </div>
        </div>
      </div>

      {/* The collage — pinned, torn-edge photos at scattered angles,
          horizontally scrollable so all 20 occasions stay reachable
          without turning the page into one very tall board. */}
      <div
        className="animate-fade-up scroll-area mt-16 flex w-full items-center gap-9 overflow-x-auto overflow-y-visible py-10 pl-4 pr-4 sm:pl-6 sm:pr-6"
        style={{ animationDelay: "200ms" }}
      >
        {cards.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => onPrompt(c.prompt)}
            className="group w-[52vw] shrink-0 text-left transition-transform duration-300 ease-out hover:!rotate-0 hover:!translate-y-0 sm:w-[240px]"
            style={{
              transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg) translateY(${LIFTS[i % LIFTS.length]}px)`,
            }}
          >
            <div className="moodboard-frame relative">
              <span className={`moodboard-tape moodboard-tape${TAPE_COLORS[i % TAPE_COLORS.length]}`} />
              <div className="moodboard-torn relative aspect-[4/5] w-full overflow-hidden">
                <PlaceholderImage
                  src={`/occasions/${c.slug}-hero.jpg`}
                  seed={c.slug}
                  width={480}
                  height={600}
                />
              </div>
              <div className="moodboard-frame__caption flex items-center gap-2 px-1">
                <span
                  className="moodboard-swatch shrink-0"
                  style={{ background: ["#8b6cf0", "#f4a5c5", "#7ab2eb", "#6ed5a8", "#e8b94a"][i % 5] }}
                />
                <span className="moodboard-marker flex-1 truncate text-[19px] leading-none text-ink">
                  {c.label}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div
        className="animate-fade-up mx-auto mt-10 flex w-full max-w-content flex-wrap gap-5 px-4 sm:px-6"
        style={{ animationDelay: "360ms" }}
      >
        {EXAMPLE_PROMPTS.map((p, i) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className={`moodboard-sticky moodboard-sticky${STICKY_COLORS[i % STICKY_COLORS.length]} max-w-[220px] px-4 py-3.5 text-left transition-transform duration-300 hover:!rotate-0`}
            style={{ transform: `rotate(${ROTATIONS[(i + 5) % ROTATIONS.length] * 0.5}deg)` }}
          >
            <span className="moodboard-marker text-[17px] leading-tight text-ink">{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
