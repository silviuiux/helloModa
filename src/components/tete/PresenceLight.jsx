"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the room's atmosphere, kept deliberately quiet
// so the welcome's blob photographs (BlobGallery) are the only "objects":
// three wide, heavily blurred colour washes (lilac, peach, sky) wandering
// and breathing on their own slow rhythms, and a soft brightening at the
// centre. No pointer-following. Typing makes it swell and stir a little
// (`energyRef`, fed by the composer, decays every frame); while the
// stylist is thinking it moves faster. One requestAnimationFrame loop
// writing straight to the DOM; a single still frame under
// prefers-reduced-motion.

// Slow, never-repeating wander from summed sines with unrelated periods.
const wander = (t, f, ph) => Math.sin(t * f[0] + ph) * 0.6 + Math.sin(t * f[1] + ph * 1.7) * 0.4;

const FIELDS = [
  { w: "92vmax", h: "80vmax", c: "rgba(196,178,255,0.42)", c2: "rgba(196,178,255,0.14)", f: [0.031, 0.047], amp: [70, 50], ph: 0.3, off: [0, 0] },
  { w: "70vmax", h: "58vmax", c: "rgba(255,200,182,0.38)", c2: "rgba(255,200,182,0.12)", f: [0.023, 0.041], amp: [140, 90], ph: 2.1, off: [-14, -4] },
  { w: "66vmax", h: "62vmax", c: "rgba(186,214,255,0.36)", c2: "rgba(186,214,255,0.1)", f: [0.019, 0.037], amp: [160, 110], ph: 4.4, off: [16, 6] },
];

export default function PresenceLight({ energyRef, thinking }) {
  const fieldRefs = useRef([]);
  const heartRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    // Motion time runs at a variable rate (thinking stirs it) without
    // anything jumping, so it's integrated rather than derived.
    let mt = 0;
    let last = performance.now();
    const start = last;

    function frame(now) {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const energy = energyRef.current;
      energyRef.current = energy * 0.955;
      const isThinking = thinkingRef.current;
      mt += dt * (1 + energy * 2 + (isThinking ? 1.6 : 0));
      const breathe = isThinking ? 0.06 * Math.sin(t * 2.2) : 0.03 * Math.sin(t * 0.5);

      FIELDS.forEach((n, i) => {
        const el = fieldRefs.current[i];
        if (!el) return;
        const nx = wander(mt, n.f, n.ph) * n.amp[0];
        const ny = wander(mt, [n.f[1], n.f[0]], n.ph + 1) * n.amp[1];
        const sc = 1 + breathe * (1 - i * 0.25) + energy * 0.1 + 0.06 * Math.sin(mt * n.f[0] * 3 + n.ph);
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0) rotate(${(wander(mt, n.f, n.ph + 3) * 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      });

      if (heartRef.current) {
        heartRef.current.style.transform = `scale(${(1 + breathe * 1.5 + energy * 0.25).toFixed(4)})`;
        heartRef.current.style.opacity = String(Math.min(1, 0.7 + energy * 0.3 + (isThinking ? 0.2 : 0)));
      }

      if (!still) raf = requestAnimationFrame(frame);
    }

    if (still) {
      frame(start);
      return;
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [energyRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-[42%] h-0 w-0">
        {FIELDS.map((n, i) => (
          <div
            key={i}
            ref={(el) => (fieldRefs.current[i] = el)}
            className="absolute"
            style={{
              left: `calc(${n.w} / -2 + ${n.off[0]}vmax)`,
              top: `calc(${n.h} / -2 + ${n.off[1]}vmax)`,
              width: n.w,
              height: n.h,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${n.c}, ${n.c2} 45%, rgba(253,252,250,0) 75%)`,
              filter: "blur(18px)",
              willChange: "transform",
            }}
          />
        ))}

        {/* Where the stylist "is": a soft brightening, no edge. */}
        <div
          ref={heartRef}
          className="absolute rounded-full"
          style={{
            left: "-24vmin",
            top: "-24vmin",
            width: "48vmin",
            height: "48vmin",
            background: "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
            filter: "blur(12px)",
            willChange: "transform, opacity",
          }}
        />
      </div>
      {/* Edges dissolve to paper-white: the room is open, not closed in. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 42%, rgba(253,252,250,0) 55%, rgba(253,252,250,0.8))" }}
      />
    </div>
  );
}
