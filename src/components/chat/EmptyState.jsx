"use client";

import { useState } from "react";
import PlaceholderImage from "../PlaceholderImage.jsx";
import { occasions } from "../../data/occasions.js";

const EXAMPLE_PROMPTS = [
  "Black-tie gala on Saturday — but I hate heels",
  "Beach weekend, carry-on only. What do I pack?",
  "Presenting to the leadership team on Thursday",
  "First date at a wine bar, not too try-hard",
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

// Design exploration (branch design/chat-editorial): "fashion magazine
// mixed with secondary AI elements." The orb moved to EditorialMasthead.jsx
// as a small signature mark — this component carries the actual weight of
// the page in print-editorial language instead: a serif headline set like
// a magazine cover line, occasion cards restyled as a numbered photo
// spread (portrait crop, caption below the image rather than overlaid, a
// hairline rule between them, an index number), and the example prompts as
// an "in this issue" list of underlined text-links rather than pill chips.
export default function EmptyState({ userDisplayName, userEmail, onPrompt }) {
  const name = userDisplayName || firstNameFromEmail(userEmail);
  // Lazy initializer — shuffles once per mount, not on every render. All 20
  // occasions (src/data/occasions.js) render, just reordered.
  const [cards] = useState(() => shuffle(occasions));

  return (
    <div className="flex w-full flex-col pb-10 pt-14 sm:pb-16">
      <div className="mx-auto w-full max-w-content px-4 sm:px-6">
        <p className="editorial-caption animate-fade-up" style={{ animationDelay: "80ms" }}>
          The styling brief
        </p>
        <h1
          className="editorial-headline animate-fade-up mt-4 text-[56px] leading-[0.98] text-ink sm:text-[96px]"
          style={{ animationDelay: "160ms" }}
        >
          hello{name ? `, ${name}` : ""}.
          <br />
          <span className="italic text-muted">what are we dressing for?</span>
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-md font-sans text-[15px] leading-relaxed text-muted"
          style={{ animationDelay: "260ms" }}
        >
          Tell me the occasion, the vibe or the weather. I&apos;ll build the look from your
          wardrobe, paint it on you, and only suggest something new if it&apos;s genuinely
          missing.
        </p>
      </div>

      {/* Deliberately full-bleed, matching the shipped page's reasoning:
          scrolling reveals the spread edge-to-edge instead of stopping at
          the centered column, while the first card still starts flush with
          the content container's left edge. */}
      <div
        className="animate-fade-up scroll-area mt-14 flex w-full gap-8 overflow-x-auto py-2 pl-4 pr-4 sm:pl-6 sm:pr-6"
        style={{ animationDelay: "360ms" }}
      >
        {cards.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => onPrompt(c.prompt)}
            className="group w-[62vw] shrink-0 text-left sm:w-[280px]"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-paper">
              <PlaceholderImage
                src={`/occasions/${c.slug}-hero.jpg`}
                seed={c.slug}
                width={700}
                height={933}
                className="grayscale-[15%] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
              />
            </div>
            <div className="editorial-rule mt-3" />
            <div className="mt-2.5 flex items-baseline justify-between gap-3">
              <span className="editorial-caption shrink-0 text-accent-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate font-sans text-[13.5px] font-medium text-ink">
                {c.label}
              </span>
              <span className="editorial-caption shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                style me
              </span>
            </div>
          </button>
        ))}
      </div>

      <div
        className="animate-fade-up mx-auto mt-16 w-full max-w-content px-4 sm:px-6"
        style={{ animationDelay: "440ms" }}
      >
        <p className="editorial-caption">In this issue</p>
        <div className="editorial-rule mt-3" />
        <ul className="mt-1 divide-y divide-[rgba(30,26,46,0.12)]">
          {EXAMPLE_PROMPTS.map((p, i) => (
            <li key={p}>
              <button
                onClick={() => onPrompt(p)}
                className="group flex w-full items-center gap-4 py-3.5 text-left"
              >
                <span className="editorial-caption shrink-0 text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-sans text-[14.5px] text-ink transition-colors group-hover:text-accent-deep">
                  {p}
                </span>
                <span className="editorial-caption shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  ask →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
