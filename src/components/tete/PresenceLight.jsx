"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the room's atmosphere. No dots, no orbits, no
// pointer-following (all three were direct "too much" feedback) — just
// large, irregular, faded shapes drifting slowly through the paper-white
// background, blended into it rather than sitting on top of it:
//  - three wide colour fields (lilac, peach, sky) that wander and breathe;
//  - six big organic forms whose outlines keep reshaping (an 8-value
//    border-radius morphing on summed sines), heavily blurred and
//    multiplied into the page so they read as light and shadow on paper,
//    not as objects;
//  - a soft brightening at the centre where the stylist "is".
// Typing makes everything swell and stir a little (`energyRef`, fed by the
// composer, decays every frame); while the stylist is thinking the forms
// move faster. One requestAnimationFrame loop writing straight to the DOM
// — no React re-renders per frame. A single still frame under
// prefers-reduced-motion.

// Slow, never-repeating wander from summed sines with unrelated periods.
const wander = (t, f, ph) => Math.sin(t * f[0] + ph) * 0.6 + Math.sin(t * f[1] + ph * 1.7) * 0.4;

const FIELDS = [
  { w: "92vmax", h: "80vmax", c: "rgba(196,178,255,0.42)", c2: "rgba(196,178,255,0.14)", f: [0.031, 0.047], amp: [70, 50], ph: 0.3, off: [0, 0] },
  { w: "70vmax", h: "58vmax", c: "rgba(255,200,182,0.38)", c2: "rgba(255,200,182,0.12)", f: [0.023, 0.041], amp: [140, 90], ph: 2.1, off: [-14, -4] },
  { w: "66vmax", h: "62vmax", c: "rgba(186,214,255,0.36)", c2: "rgba(186,214,255,0.1)", f: [0.019, 0.037], amp: [160, 110], ph: 4.4, off: [16, 6] },
];

// Seeded so server and client agree; every visit has the same weather.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const TINTS = ["#d9ccff", "#ffd6c7", "#cfe0ff", "#f6d0e0", "#e6dcff", "#f4e2c8"];

const FORMS = (() => {
  const r = rng(71002);
  return Array.from({ length: 6 }, (_, i) => ({
    size: 26 + r() * 30, // vmin
    tint: TINTS[i % TINTS.length],
    home: [(r() - 0.5) * 80, (r() - 0.5) * 70], // vw / vh from centre
    amp: [8 + r() * 14, 6 + r() * 12], // vw / vh of wander
    f: [0.012 + r() * 0.02, 0.018 + r() * 0.025],
    morph: 0.05 + r() * 0.07,
    spin: (r() - 0.5) * 0.03,
    ph: r() * 6.28,
    opacity: 0.45 + r() * 0.3,
  }));
})();

export default function PresenceLight({ energyRef, thinking }) {
  const fieldRefs = useRef([]);
  const formRefs = useRef([]);
  const heartRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let vw = window.innerWidth / 100;
    let vh = window.innerHeight / 100;
    // Motion time runs at a variable rate (thinking stirs it) without
    // anything jumping, so it's integrated rather than derived.
    let mt = 0;
    let last = performance.now();
    const start = last;
    function onResize() {
      vw = window.innerWidth / 100;
      vh = window.innerHeight / 100;
    }

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

      FORMS.forEach((b, i) => {
        const el = formRefs.current[i];
        if (!el) return;
        const x = (b.home[0] + wander(mt, b.f, b.ph) * b.amp[0]) * vw;
        const y = (b.home[1] + wander(mt, [b.f[1], b.f[0]], b.ph + 2) * b.amp[1]) * vh;
        // Eight radii drifting independently: the outline is never the
        // same shape twice, and never a circle.
        const k = (j) => (50 + 22 * Math.sin(mt * b.morph * (1 + j * 0.23) + b.ph + j * 1.9)).toFixed(1);
        el.style.borderRadius = `${k(0)}% ${k(1)}% ${k(2)}% ${k(3)}% / ${k(4)}% ${k(5)}% ${k(6)}% ${k(7)}%`;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(mt * b.spin * 57.3).toFixed(2)}deg) scale(${(1 + energy * 0.08 + breathe).toFixed(4)})`;
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
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
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

        {FORMS.map((b, i) => (
          <div
            key={i}
            ref={(el) => (formRefs.current[i] = el)}
            className="absolute"
            style={{
              left: `-${b.size / 2}vmin`,
              top: `-${b.size / 2}vmin`,
              width: `${b.size}vmin`,
              height: `${b.size}vmin`,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${b.tint}, ${b.tint}aa 45%, ${b.tint}00 100%)`,
              filter: "blur(30px)",
              opacity: b.opacity,
              mixBlendMode: "multiply",
              willChange: "transform, border-radius",
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
