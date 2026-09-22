"use client";

import { useRef } from "react";
import { useScrollProgress } from "../../lib/useScrollProgress.js";
import { SCENES } from "./StageVisuals.jsx";

// The page's centrepiece: the product stays pinned while the narrative
// scrolls past it, and the pinned surface actually changes per step — you
// watch helloModa work without clicking anything. (Research is consistent
// that product-forward, real-UI heroes out-convert illustration; this is
// that idea taken the whole way.)
//
// Desktop gets the pinned treatment. Below `sm` it degrades to a plain
// stacked sequence — pinned scrollytelling on a phone fights the user's
// scroll and is a well-known mobile anti-pattern. Both branches render
// from the same STEPS array, so the story can't drift between them.
const STEPS = [
  {
    kicker: "Tell it",
    title: "Say where you're going, like you'd tell a friend.",
    body: "A rooftop birthday at 9pm. A vineyard wedding in June. A first-round interview on Tuesday. No style quiz, no filters, no forty questions — just the occasion, in your own words.",
  },
  {
    kicker: "Your closet",
    title: "It shops your wardrobe first.",
    body: "Snap your clothes once and helloModa learns them by how they actually look — colour, cut, texture — not by a label you had to type. Every look starts there. Buying something new is the last resort, not the point.",
  },
  {
    kicker: "The look",
    title: "One confident look, painted on you.",
    body: "Not a mood board, not twelve products in a grid — one decisive outfit, explained the way a good stylist would. Then it's painted in watercolour on your own avatar, so you see it on you before you get dressed.",
  },
  {
    kicker: "The gap",
    title: "And the one piece worth buying — if any.",
    body: "Open the look to see what came from your wardrobe and what, if anything, is genuinely missing. When it does suggest something, it's a real product from a real shop, at its real price. No sponsored picks, no endless scroll.",
  },
  {
    kicker: "Your journal",
    title: "Every look, kept — and still open.",
    body: "Each look lands in your style journal with its painting. Open any of them to pick the conversation back up — swap the shoes, dress it down, restyle it for next time.",
  },
];

// Fixed height rather than an aspect ratio: the frame has to fit inside a
// pinned 100vh viewport alongside the nav, and a 4:3 box at this column
// width blows straight past the fold on a laptop.
function StageFrame({ children, className = "" }) {
  return (
    // rounded-xl3 below `sm`, the speaker-corner `rounded-bubble` only on
    // the full pinned desktop stage.
    <div
      className={`glass relative w-full overflow-hidden rounded-xl3 shadow-lift sm:rounded-bubble ${className}`}
    >
      {children}
    </div>
  );
}

export default function StickyStage() {
  const ref = useRef(null);
  const progress = useScrollProgress(ref);
  const active = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));

  return (
    <>
      {/* Desktop: pinned stage */}
      <section
        ref={ref}
        className="relative hidden sm:block"
        style={{ height: `${STEPS.length * 100}vh` }}
        aria-label="How helloModa works"
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-[minmax(260px,320px)_1fr] items-center gap-12 px-6 lg:gap-20">
            {/* Narrative rail */}
            <div className="relative">
              <div className="absolute bottom-2 left-0 top-2 w-px bg-line" aria-hidden="true">
                <div
                  className="w-px bg-accent transition-[height] duration-500 ease-out"
                  style={{ height: `${((active + 1) / STEPS.length) * 100}%` }}
                />
              </div>
              <ol className="space-y-7 pl-7">
                {STEPS.map((step, i) => {
                  const isActive = i === active;
                  return (
                    <li
                      key={step.kicker}
                      className="transition-all duration-500"
                      style={{
                        opacity: isActive ? 1 : 0.25,
                        transform: `translateY(${isActive ? 0 : 4}px)`,
                      }}
                    >
                      <p className="label text-accent-deep">
                        {String(i + 1).padStart(2, "0")} — {step.kicker}
                      </p>
                      <h3 className="mt-2 font-display text-[21px] font-semibold tracking-[-0.03em] leading-tight text-ink">
                        {step.title}
                      </h3>
                      <div
                        className="grid transition-all duration-500"
                        style={{
                          gridTemplateRows: isActive ? "1fr" : "0fr",
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <p className="overflow-hidden text-[13.5px] leading-relaxed text-muted">
                          <span className="mt-2 block">{step.body}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Pinned stage */}
            <StageFrame className="h-[min(66vh,560px)]">
              {SCENES.map((Scene, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-all duration-700 ease-out"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: `scale(${i === active ? 1 : 0.98})`,
                    pointerEvents: i === active ? "auto" : "none",
                  }}
                  aria-hidden={i !== active}
                >
                  <Scene />
                </div>
              ))}
            </StageFrame>
          </div>
        </div>
      </section>

      {/* Mobile: the same story, stacked */}
      <section className="space-y-20 px-4 sm:hidden" aria-label="How helloModa works">
        {STEPS.map((step, i) => {
          const Scene = SCENES[i];
          return (
            <div key={step.kicker}>
              <p className="label text-accent-deep">
                {String(i + 1).padStart(2, "0")} — {step.kicker}
              </p>
              <h3 className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] leading-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">{step.body}</p>
              {/* Content-sized here rather than a fixed height: the five
                  scenes have genuinely different natural heights on a
                  narrow screen, and pinning them all to one number either
                  clips the tall ones or strands the short ones. */}
              <div className="mt-6">
                <StageFrame>
                  <Scene />
                </StageFrame>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
