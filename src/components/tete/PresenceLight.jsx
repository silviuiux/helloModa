"use client";

import { useEffect, useRef } from "react";

// design-07 "Tête-à-tête": the stylist's presence, as a small pastel solar
// system in a bright, airy room rather than an avatar or an orb widget.
//  - the sun: a soft luminous heart of a few blurred blobs that drift apart
//    and back together (its outline is never a circle), in a lilac corona,
//    inside three nebulae — lilac, peach, sky — each wandering on its own;
//  - planets: soft glowing bodies on tilted elliptical orbits, seen at an
//    angle, so they pass *behind* the sun (smaller, dimmer) and swing in
//    front of it (larger, brighter). Each orbit wobbles on its own slow,
//    never-repeating loop (summed sines with random frequencies), so the
//    paths drift instead of tracing the same ellipse forever. One planet
//    carries a moon; faint rings trace the current orbits;
//  - dust: tiny motes drifting slowly in a wide halo.
// It ignores the pointer entirely (direct request: following the cursor felt
// mechanical). The system wanders on its own slow, never-repeating path and
// everything is soft-edged — a blurred, shape-shifting sun, hazy planets
// with fading trails, rings barely there. It swells and spins up with each
// keystroke (`energyRef`, fed by the composer, decays every frame) and
// quickens while the stylist is thinking.
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

const TRAIL = 4; // ghost copies per planet — a soft comet tail

// Slow, never-repeating wander from summed sines with unrelated periods.
const wander = (t, f, ph) => Math.sin(t * f[0] + ph) * 0.6 + Math.sin(t * f[1] + ph * 1.7) * 0.4;

const NEBULAE = [
  { w: "92vmax", h: "80vmax", c: "rgba(196,178,255,0.5)", c2: "rgba(196,178,255,0.18)", f: [0.031, 0.047], amp: [70, 50], ph: 0.3 },
  { w: "70vmax", h: "58vmax", c: "rgba(255,200,182,0.42)", c2: "rgba(255,200,182,0.14)", f: [0.023, 0.041], amp: [140, 90], ph: 2.1 },
  { w: "66vmax", h: "62vmax", c: "rgba(186,214,255,0.4)", c2: "rgba(186,214,255,0.12)", f: [0.019, 0.037], amp: [160, 110], ph: 4.4 },
];

// The sun's heart: a few blurred blobs orbiting each other loosely.
const HEART = [
  { size: 13, c: "rgba(255,255,255,0.95)", r: 1.2, f: 0.11, ph: 0 },
  { size: 11, c: "rgba(221,208,255,0.85)", r: 2.4, f: -0.08, ph: 2 },
  { size: 10, c: "rgba(255,222,210,0.7)", r: 2.8, f: 0.07, ph: 4 },
];

export default function PresenceLight({ energyRef, thinking }) {
  const nebulaRefs = useRef([]);
  const sunRef = useRef(null);
  const heartRefs = useRef([]);
  const ringsRef = useRef([]);
  const planetsRef = useRef([]);
  const trailsRef = useRef([]);
  const moonRef = useRef(null);
  const dustRef = useRef([]);
  const thinkingRef = useRef(thinking);

  useEffect(() => {
    thinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    const sun = sunRef.current;
    if (!sun) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    // On a narrow phone the orbits may run past the edges — that's the
    // point; squeezing them into the width made the system look cramped.
    const measure = () => Math.min(window.innerWidth * 1.3, window.innerHeight) / 100;
    let unit = measure();
    // Orbital time runs at a variable rate (typing / thinking spin it up)
    // without the planets jumping, so it's integrated rather than derived.
    let orbitT = 0;
    let last = performance.now();
    const start = last;
    function onResize() {
      unit = measure();
    }

    function frame(now) {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const energy = energyRef.current;
      energyRef.current = energy * 0.955;
      const isThinking = thinkingRef.current;
      const breathe = isThinking ? 0.08 * Math.sin(t * 2.6) : 0.035 * Math.sin(t * 0.6);
      orbitT += dt * (0.26 + energy * 1.2 + (isThinking ? 0.45 : 0));

      // The whole system drifts on its own — a slow, lazy figure that
      // never quite repeats.
      const sx = wander(t, [0.043, 0.071], 0.8) * 34;
      const sy = wander(t, [0.037, 0.059], 2.3) * 22;

      NEBULAE.forEach((n, i) => {
        const el = nebulaRefs.current[i];
        if (!el) return;
        const nx = wander(t, n.f, n.ph) * n.amp[0];
        const ny = wander(t, [n.f[1], n.f[0]], n.ph + 1) * n.amp[1];
        const sc = 1 + breathe * (1 - i * 0.25) + energy * 0.12 + 0.06 * Math.sin(t * n.f[0] * 3 + n.ph);
        el.style.transform = `translate3d(${nx}px, ${ny}px, 0) rotate(${(wander(t, n.f, n.ph + 3) * 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      });

      sun.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${1 + energy * 0.3 + breathe * 1.4})`;
      sun.style.opacity = String(Math.min(1, 0.8 + energy * 0.2 + (isThinking ? 0.1 : 0)));
      HEART.forEach((h, i) => {
        const el = heartRefs.current[i];
        if (!el) return;
        const a = t * h.f * (isThinking ? 3 : 1) + h.ph;
        const r = h.r * unit * (1 + energy * 0.8 + 0.3 * Math.sin(t * 0.3 + h.ph));
        el.style.transform = `translate3d(${Math.cos(a) * r}px, ${Math.sin(a) * r * 0.8}px, 0) scale(${1 + 0.12 * Math.sin(t * 0.5 + h.ph)})`;
      });

      const spread = 1 + energy * 0.16 + (isThinking ? 0.05 * Math.sin(t * 1.7) : 0);
      const sizeK = Math.min(1, Math.max(0.72, unit / 9));
      const place = (p, th, tt) => {
        const a = p.a * unit * spread * (1 + 0.07 * Math.sin(tt * p.wa[0] + p.wp[0]) + 0.04 * Math.sin(tt * p.wa[1] + p.wp[1]));
        const b = a * p.ratio * (1 + 0.12 * Math.sin(tt * p.wt[1] + p.wp[3]));
        const tilt = p.tilt + 9 * Math.sin(tt * p.wt[0] + p.wp[2]);
        const rad = (tilt * Math.PI) / 180;
        const ex = a * Math.cos(th);
        const ey = b * Math.sin(th);
        return { a, b, tilt, x: sx + ex * Math.cos(rad) - ey * Math.sin(rad), y: sy + ex * Math.sin(rad) + ey * Math.cos(rad) };
      };

      SYSTEM.planets.forEach((p, i) => {
        const th = p.phase + orbitT * p.speed;
        const pos = place(p, th, t);
        const depth = (Math.sin(th) + 1) / 2; // 0 = far side, 1 = near side
        const scale = (0.62 + depth * 0.6) * sizeK;
        const z = depth < 0.5 ? "1" : "3"; // passes behind the sun

        const ring = ringsRef.current[i];
        if (ring) {
          ring.setAttribute("rx", pos.a.toFixed(1));
          ring.setAttribute("ry", pos.b.toFixed(1));
          ring.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${pos.tilt.toFixed(2)})`);
        }
        const el = planetsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`;
          el.style.opacity = String(0.45 + depth * 0.55);
          el.style.zIndex = z;
          el.style.filter = `blur(${(0.6 + (1 - depth) * 1.8).toFixed(2)}px)`;
        }
        // Fading ghosts a little further back along the orbit.
        for (let k = 0; k < TRAIL; k++) {
          const g = trailsRef.current[i * TRAIL + k];
          if (!g) continue;
          const back = (k + 1) * 0.09 * Math.sign(p.speed);
          const gp = place(p, th - back, t);
          g.style.transform = `translate3d(${gp.x}px, ${gp.y}px, 0) scale(${scale * (1 - (k + 1) * 0.14)})`;
          g.style.opacity = String((0.45 + depth * 0.55) * (0.32 - k * 0.07));
          g.style.zIndex = z;
        }
        if (p.moon && moonRef.current) {
          const mt = orbitT * 2.6;
          const mr = p.size * 2 * scale;
          moonRef.current.style.transform = `translate3d(${pos.x + Math.cos(mt) * mr}px, ${pos.y + Math.sin(mt) * mr * 0.55}px, 0) scale(${scale})`;
          moonRef.current.style.zIndex = z;
          moonRef.current.style.opacity = String(0.4 + depth * 0.5);
        }
      });

      SYSTEM.dust.forEach((d, i) => {
        const el = dustRef.current[i];
        if (!el) return;
        const th = d.phase + t * d.speed;
        const rr = d.rad * unit;
        el.style.transform = `translate3d(${sx * 0.5 + Math.cos(th) * rr}px, ${sy * 0.5 + Math.sin(th) * rr * d.ratio + Math.sin(t * 0.4 + d.bob) * 10}px, 0)`;
        el.style.opacity = String(0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.5 + d.bob)));
      });

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
      <div className="absolute left-1/2 top-[38%] h-0 w-0">
        {NEBULAE.map((n, i) => (
          <div
            key={i}
            ref={(el) => (nebulaRefs.current[i] = el)}
            className="absolute"
            style={{
              left: `calc(${n.w} / -2 + ${(i - 1) * 9}vmax)`,
              top: `calc(${n.h} / -2 + ${i === 0 ? 0 : -6 + i * 4}vmax)`,
              width: n.w,
              height: n.h,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${n.c}, ${n.c2} 45%, rgba(253,252,250,0) 75%)`,
              filter: "blur(18px)",
              willChange: "transform",
            }}
          />
        ))}

        {/* Orbit rings — barely-there, blurred hairlines that follow each orbit's wobble. */}
        <svg className="absolute overflow-visible" style={{ left: 0, top: 0, width: 1, height: 1, zIndex: 0, filter: "blur(0.6px)" }}>
          {SYSTEM.planets.map((p, i) => (
            <ellipse
              key={i}
              ref={(el) => (ringsRef.current[i] = el)}
              cx="0"
              cy="0"
              rx={p.a * 8}
              ry={p.a * 8 * p.ratio}
              fill="none"
              stroke="rgba(143,120,232,0.09)"
              strokeWidth="1.2"
            />
          ))}
        </svg>

        {/* The sun: a wide corona around a heart of drifting, blurred blobs. */}
        <div ref={sunRef} className="absolute" style={{ left: 0, top: 0, zIndex: 2, willChange: "transform, opacity" }}>
          <div
            className="absolute rounded-full"
            style={{
              left: "-20vmin",
              top: "-20vmin",
              width: "40vmin",
              height: "40vmin",
              background: "radial-gradient(closest-side, rgba(214,200,255,0.7), rgba(214,200,255,0.22) 55%, rgba(214,200,255,0) 100%)",
              filter: "blur(10px)",
            }}
          />
          {HEART.map((h, i) => (
            <div
              key={i}
              ref={(el) => (heartRefs.current[i] = el)}
              className="absolute"
              style={{
                left: `-${h.size / 2}vmin`,
                top: `-${h.size / 2}vmin`,
                width: `${h.size}vmin`,
                height: `${h.size}vmin`,
                borderRadius: "50%",
                background: `radial-gradient(closest-side, ${h.c}, rgba(255,255,255,0) 100%)`,
                filter: "blur(7px)",
                mixBlendMode: "screen",
                willChange: "transform",
              }}
            />
          ))}
        </div>

        {SYSTEM.planets.map((p, i) =>
          Array.from({ length: TRAIL }, (_, k) => (
            <div
              key={`${i}-t${k}`}
              ref={(el) => (trailsRef.current[i * TRAIL + k] = el)}
              className="absolute rounded-full"
              style={{
                left: -p.size / 2,
                top: -p.size / 2,
                width: p.size,
                height: p.size,
                background: `radial-gradient(closest-side, ${p.colors[1]}, transparent)`,
                filter: "blur(3px)",
                opacity: 0,
                willChange: "transform, opacity",
              }}
            />
          ))
        )}
        {SYSTEM.planets.map((p, i) => (
          <div
            key={i}
            ref={(el) => (planetsRef.current[i] = el)}
            className="absolute rounded-full"
            // Drawn 2.4x the body size with a pure gradient glow — no hard
            // edge and no box-shadow halo (that read as a hollow ring).
            style={{
              left: -p.size * 1.2,
              top: -p.size * 1.2,
              width: p.size * 2.4,
              height: p.size * 2.4,
              background: `radial-gradient(closest-side, ${p.colors[0]} 0%, ${p.colors[1]} 30%, ${p.colors[1]}55 55%, ${p.colors[1]}00 100%)`,
              opacity: 0,
              willChange: "transform, opacity, filter",
            }}
          />
        ))}
        <div
          ref={moonRef}
          className="absolute rounded-full"
          style={{
            left: -4,
            top: -4,
            width: 8,
            height: 8,
            background: "radial-gradient(closest-side, #fff, #d6cbff 60%, rgba(214,203,255,0))",
            filter: "blur(1px)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />

        {SYSTEM.dust.map((d, i) => (
          <span
            key={i}
            ref={(el) => (dustRef.current[i] = el)}
            className="absolute rounded-full"
            style={{
              left: -d.size,
              top: -d.size,
              width: d.size * 2,
              height: d.size * 2,
              background: `radial-gradient(closest-side, ${i % 2 ? "rgba(159,134,240,0.8)" : "rgba(255,185,158,0.85)"}, transparent)`,
              filter: "blur(0.6px)",
              opacity: 0,
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
