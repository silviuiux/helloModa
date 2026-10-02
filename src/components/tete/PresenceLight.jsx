"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the stylist's presence, as a soft pastel haze in
// a bright, airy room rather than an avatar or an orb widget. A wide
// lilac/peach bloom, a cooler sky-blue drift trailing behind it and a small
// luminous core, all drifting gently toward the pointer (it turns to face
// you), swelling with each keystroke (`energyRef`, fed by the
// composer, decays every frame) and breathing faster while it's thinking.
// One requestAnimationFrame loop writing transforms straight to the DOM —
// no React re-renders per frame. Static under prefers-reduced-motion.
export default function PresenceLight({ energyRef, thinking }) {
  const bloomRef = useRef(null);
  const coreRef = useRef(null);
  const driftRef = useRef(null);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const bloom = bloomRef.current;
    const core = coreRef.current;
    const drift = driftRef.current;
    if (!bloom || !core || !drift) return;
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
      bloom.style.opacity = String(Math.min(1, 0.75 + energy * 0.25 + (isThinking ? 0.15 : 0)));
      core.style.transform = `translate3d(${x * 1.5}px, ${y * 1.5}px, 0) scale(${1 + energy * 0.4 + breathe * 1.6})`;
      // The sky drift lags and counter-sways, so the haze never sits still.
      drift.style.transform = `translate3d(${-x * 0.6 + Math.sin(t * 0.21) * 60}px, ${-y * 0.4 + Math.cos(t * 0.17) * 40}px, 0) scale(${1 + breathe * 0.8})`;
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
              "radial-gradient(closest-side, rgba(196,178,255,0.42), rgba(255,206,190,0.26) 40%, rgba(253,252,250,0) 72%)",
            opacity: 0.75,
            willChange: "transform, opacity",
          }}
        />
        <div
          ref={driftRef}
          className="absolute rounded-full"
          style={{
            left: "-10vmax",
            top: "-30vmax",
            width: "70vmax",
            height: "60vmax",
            background: "radial-gradient(closest-side, rgba(186,214,255,0.32), rgba(186,214,255,0) 70%)",
            willChange: "transform",
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
              "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(214,200,255,0.55) 50%, rgba(214,200,255,0) 80%)",
            filter: "blur(10px)",
            opacity: 0.55,
            willChange: "transform, opacity",
          }}
        />
      </div>
      {/* Edges dissolve to paper-white: the room is open, not closed in. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 38%, rgba(253,252,250,0) 55%, rgba(253,252,250,0.85))" }}
      />
    </div>
  );
}
