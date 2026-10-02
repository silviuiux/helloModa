"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the stylist's presence, as light in a dim room
// rather than an avatar or an orb widget. A wide lilac/rose bloom and a
// small bright core, both drifting gently toward the pointer (it turns to
// face you), swelling with each keystroke (`energyRef`, fed by the
// composer, decays every frame) and breathing faster while it's thinking.
// One requestAnimationFrame loop writing transforms straight to the DOM —
// no React re-renders per frame. Static under prefers-reduced-motion.
export default function PresenceLight({ energyRef, thinking }) {
  const bloomRef = useRef(null);
  const coreRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const bloom = bloomRef.current;
    const core = coreRef.current;
    if (!bloom || !core) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const start = performance.now();

    function onMove(e) {
      tx = (e.clientX - window.innerWidth / 2) * 0.12;
      ty = (e.clientY - window.innerHeight * 0.38) * 0.1;
    }

    function frame(now) {
      const t = (now - start) / 1000;
      x += (tx - x) * 0.035;
      y += (ty - y) * 0.035;
      const energy = energyRef.current;
      energyRef.current = energy * 0.955;
      const isThinking = thinkingRef.current;
      const breathe = isThinking ? 0.09 * Math.sin(t * 3.4) : 0.035 * Math.sin(t * 0.85);

      bloom.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + breathe + energy * 0.22})`;
      bloom.style.opacity = String(Math.min(1, 0.6 + energy * 0.35 + (isThinking ? 0.2 : 0)));
      core.style.transform = `translate3d(${x * 1.5}px, ${y * 1.5}px, 0) scale(${1 + energy * 0.4 + breathe * 1.6})`;
      core.style.opacity = String(Math.min(1, 0.55 + energy * 0.45 + (isThinking ? 0.25 : 0)));
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [energyRef]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-1/2 top-[38%] h-0 w-0">
        <div
          ref={bloomRef}
          className="absolute rounded-full"
          style={{
            left: "-45vmax",
            top: "-45vmax",
            width: "90vmax",
            height: "90vmax",
            background:
              "radial-gradient(closest-side, rgba(185,164,255,0.24), rgba(255,159,190,0.09) 42%, rgba(12,10,13,0) 70%)",
            opacity: 0.6,
            willChange: "transform, opacity",
          }}
        />
        <div
          ref={coreRef}
          className="absolute rounded-full"
          style={{
            left: "-10vmin",
            top: "-10vmin",
            width: "20vmin",
            height: "20vmin",
            background:
              "radial-gradient(closest-side, rgba(240,234,255,0.5), rgba(185,164,255,0.22) 52%, rgba(185,164,255,0) 78%)",
            filter: "blur(8px)",
            opacity: 0.55,
            willChange: "transform, opacity",
          }}
        />
      </div>
      {/* Vignette: the room closes in at the edges. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 95% at 50% 38%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65))" }}
      />
    </div>
  );
}
