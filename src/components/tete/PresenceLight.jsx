"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the stylist's presence, as a small pastel solar
// system in a bright, airy room rather than an avatar or an orb widget.
//  - the sun: a luminous pearl core in a lilac corona, inside a wide
//    lilac/peach bloom, with a cooler sky-blue haze trailing behind;
//  - planets: soft glowing bodies on tilted elliptical orbits, seen at an
//    angle, so they pass *behind* the sun (smaller, dimmer) and swing in
//    front of it (larger, brighter). Each orbit wobbles on its own slow,
//    never-repeating loop (summed sines with random frequencies), so the
//    paths drift instead of tracing the same ellipse forever. One planet
//    carries a moon; faint rings trace the current orbits;
//  - dust: tiny motes drifting slowly in a wide halo.
// The whole system leans toward the pointer (it turns to face you), swells
// and spins up with each keystroke (`energyRef`, fed by the composer,
// decays every frame) and quickens while the stylist is thinking.
// One requestAnimationFrame loop writing transforms straight to the DOM —
// no React re-renders per frame. A single still frame under
// prefers-reduced-motion.

const PALETTE = [
  ["#ffffff", "#c9b8ff"], // pearl / lilac
  ["#fff4ee", "#ffb99e"], // peach
  ["#f4f8ff", "#a9c8ff"], // sky
  ["#fff0f5", "#f59bbb"], // rose
  ["#fbf8ff", "#9f86f0"], // violet
  ["#fffaf0", "#f3cf8e"], // champagne
];

// Seeded so server and client agree and every visit has the same "sky",
// while still looking random.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function makeSystem() {
  const r = rng(20261002);
  const planets = Array.from({ length: 7 }, (_, i) => {
    const a = 13 + i * 5.2 + r() * 3; // semi-major axis, in vmin
    return {
      a,
      ratio: 0.32 + r() * 0.26, // b/a — how steeply we see the orbit
      tilt: -28 + r() * 56, // degrees
      speed: (0.9 + r() * 0.5) * Math.pow(13 / a, 1.5) * (r() > 0.2 ? 1 : -1), // Kepler-ish
      phase: r() * Math.PI * 2,
      size: 9 + r() * 16 - i * 0.6, // px
      colors: PALETTE[Math.floor(r() * PALETTE.length)],
      // the random loop: slow perturbations of radius and tilt
      wa: [0.05 + r() * 0.08, 0.11 + r() * 0.1],
      wt: [0.03 + r() * 0.05, 0.07 + r() * 0.06],
      wp: [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28],
      moon: i === 3,
    };
  });
  const dust = Array.from({ length: 26 }, () => ({
    rad: 18 + r() * 46, // vmin
    ratio: 0.45 + r() * 0.5,
    speed: (0.012 + r() * 0.03) * (r() > 0.5 ? 1 : -1),
    phase: r() * Math.PI * 2,
    size: 1.5 + r() * 2.5,
    bob: r() * 6.28,
  }));
  return { planets, dust };
}

const SYSTEM = makeSystem();

export default function PresenceLight({ energyRef, thinking }) {
  const bloomRef = useRef(null);
  const sunRef = useRef(null);
  const driftRef = useRef(null);
  const ringsRef = useRef([]);
  const planetsRef = useRef([]);
  const moonRef = useRef(null);
  const dustRef = useRef([]);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const bloom = bloomRef.current;
    const sun = sunRef.current;
    const drift = driftRef.current;
    if (!bloom || !sun || !drift) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    // On a narrow phone the orbits may run past the edges — that's the
    // point; squeezing them into the width made the system look cramped.
    const measure = () => Math.min(window.innerWidth * 1.3, window.innerHeight) / 100;
    let unit = measure();
    // Orbital time runs at a variable rate (typing / thinking spin it up)
    // without the planets jumping, so it's integrated rather than derived.
    let orbitT = 0;
    let last = performance.now();
    const start = last;

    function onMove(e) {
      tx = (e.clientX - window.innerWidth / 2) * 0.12;
      ty = (e.clientY - window.innerHeight * 0.38) * 0.1;
    }
    function onResize() {
      unit = measure();
    }

    function frame(now) {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      x += (tx - x) * 0.035;
      y += (ty - y) * 0.035;
      const energy = energyRef.current;
      energyRef.current = energy * 0.955;
      const isThinking = thinkingRef.current;
      const breathe = isThinking ? 0.09 * Math.sin(t * 3.4) : 0.035 * Math.sin(t * 0.85);
      orbitT += dt * (0.32 + energy * 1.4 + (isThinking ? 0.55 : 0));

      bloom.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + breathe + energy * 0.22})`;
      bloom.style.opacity = String(Math.min(1, 0.85 + energy * 0.15 + (isThinking ? 0.1 : 0)));
      // The sky haze lags and counter-sways, so the light never sits still.
      drift.style.transform = `translate3d(${-x * 0.6 + Math.sin(t * 0.21) * 60}px, ${-y * 0.4 + Math.cos(t * 0.17) * 40}px, 0) scale(${1 + breathe * 0.8})`;

      const sx = x * 1.5;
      const sy = y * 1.5;
      sun.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${1 + energy * 0.35 + breathe * 1.4})`;
      sun.style.opacity = String(Math.min(1, 0.85 + energy * 0.15));

      const spread = 1 + energy * 0.16 + (isThinking ? 0.05 * Math.sin(t * 1.7) : 0);
      SYSTEM.planets.forEach((p, i) => {
        const a = p.a * unit * spread * (1 + 0.07 * Math.sin(t * p.wa[0] + p.wp[0]) + 0.04 * Math.sin(t * p.wa[1] + p.wp[1]));
        const b = a * p.ratio * (1 + 0.12 * Math.sin(t * p.wt[1] + p.wp[3]));
        const tilt = p.tilt + 9 * Math.sin(t * p.wt[0] + p.wp[2]);
        const rad = (tilt * Math.PI) / 180;
        const th = p.phase + orbitT * p.speed;
        const ex = a * Math.cos(th);
        const ey = b * Math.sin(th);
        const px = sx + ex * Math.cos(rad) - ey * Math.sin(rad);
        const py = sy + ex * Math.sin(rad) + ey * Math.cos(rad);
        const depth = (Math.sin(th) + 1) / 2; // 0 = far side, 1 = near side
        const scale = (0.62 + depth * 0.6) * Math.min(1, Math.max(0.72, unit / 9));

        const ring = ringsRef.current[i];
        if (ring) {
          ring.setAttribute("rx", a.toFixed(1));
          ring.setAttribute("ry", b.toFixed(1));
          ring.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${tilt.toFixed(2)})`);
        }
        const el = planetsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${scale})`;
          el.style.opacity = String(0.5 + depth * 0.5);
          el.style.zIndex = depth < 0.5 ? "1" : "3"; // passes behind the sun
          el.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 4).toFixed(2)}px)` : "none";
        }
        if (p.moon && moonRef.current) {
          const mt = orbitT * 3.1;
          const mr = p.size * 1.9 * scale;
          moonRef.current.style.transform = `translate3d(${px + Math.cos(mt) * mr}px, ${py + Math.sin(mt) * mr * 0.55}px, 0) scale(${scale})`;
          moonRef.current.style.zIndex = el?.style.zIndex || "3";
          moonRef.current.style.opacity = String(0.45 + depth * 0.5);
        }
      });

      SYSTEM.dust.forEach((d, i) => {
        const el = dustRef.current[i];
        if (!el) return;
        const th = d.phase + t * d.speed;
        const rr = d.rad * unit;
        el.style.transform = `translate3d(${x * 0.5 + Math.cos(th) * rr}px, ${y * 0.5 + Math.sin(th) * rr * d.ratio + Math.sin(t * 0.4 + d.bob) * 8}px, 0)`;
        el.style.opacity = String(0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.6 + d.bob)));
      });

      if (!still) raf = requestAnimationFrame(frame);
    }

    if (still) {
      frame(start);
      return;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
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
              "radial-gradient(closest-side, rgba(196,178,255,0.5), rgba(255,206,190,0.3) 40%, rgba(253,252,250,0) 72%)",
            opacity: 0.85,
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
            background: "radial-gradient(closest-side, rgba(186,214,255,0.36), rgba(186,214,255,0) 70%)",
            willChange: "transform",
          }}
        />

        {/* Orbit rings — hairlines that follow each orbit's wobble. */}
        <svg className="absolute overflow-visible" style={{ left: 0, top: 0, width: 1, height: 1, zIndex: 0 }}>
          {SYSTEM.planets.map((p, i) => (
            <ellipse
              key={i}
              ref={(el) => (ringsRef.current[i] = el)}
              cx="0"
              cy="0"
              rx={p.a * 8}
              ry={p.a * 8 * p.ratio}
              fill="none"
              stroke="rgba(143,120,232,0.16)"
              strokeWidth="1"
              strokeDasharray={i % 3 === 1 ? "2 6" : undefined}
            />
          ))}
        </svg>

        {/* The sun: corona + luminous pearl core. */}
        <div ref={sunRef} className="absolute" style={{ left: 0, top: 0, zIndex: 2, willChange: "transform, opacity" }}>
          <div
            className="absolute rounded-full"
            style={{
              left: "-17vmin",
              top: "-17vmin",
              width: "34vmin",
              height: "34vmin",
              background: "radial-gradient(closest-side, rgba(214,200,255,0.75), rgba(214,200,255,0.25) 55%, rgba(214,200,255,0) 100%)",
              filter: "blur(6px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: "-5.5vmin",
              top: "-5.5vmin",
              width: "11vmin",
              height: "11vmin",
              background: "radial-gradient(circle at 38% 34%, #ffffff, #f1ebff 40%, #c9b8ff 78%, #b39cf7)",
              boxShadow: "0 0 40px 12px rgba(255,255,255,0.9), 0 0 90px 30px rgba(185,164,255,0.45)",
            }}
          />
        </div>

        {SYSTEM.planets.map((p, i) => (
          <div
            key={i}
            ref={(el) => (planetsRef.current[i] = el)}
            className="absolute rounded-full"
            style={{
              left: -p.size / 2,
              top: -p.size / 2,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle at 35% 32%, ${p.colors[0]}, ${p.colors[1]} 72%)`,
              boxShadow: `0 0 ${p.size * 1.2}px ${p.size * 0.25}px ${p.colors[1]}66`,
              willChange: "transform, opacity",
            }}
          />
        ))}
        <div
          ref={moonRef}
          className="absolute rounded-full"
          style={{
            left: -3,
            top: -3,
            width: 6,
            height: 6,
            background: "radial-gradient(circle at 35% 32%, #fff, #d6cbff)",
            boxShadow: "0 0 8px 2px rgba(201,184,255,0.6)",
            willChange: "transform, opacity",
          }}
        />

        {SYSTEM.dust.map((d, i) => (
          <span
            key={i}
            ref={(el) => (dustRef.current[i] = el)}
            className="absolute rounded-full"
            style={{
              left: -d.size / 2,
              top: -d.size / 2,
              width: d.size,
              height: d.size,
              background: i % 2 ? "rgba(159,134,240,0.7)" : "rgba(255,185,158,0.75)",
              boxShadow: "0 0 6px rgba(255,255,255,0.9)",
            }}
          />
        ))}
      </div>
      {/* Edges dissolve to paper-white: the room is open, not closed in. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 38%, rgba(253,252,250,0) 55%, rgba(253,252,250,0.85))" }}
      />
    </div>
  );
}
