"use client";

import { useEffect, useRef, useState } from "react";
import PlaceholderImage from "../PlaceholderImage.jsx";

// design-07: a few occasion photographs living in the white space around
// the welcome as organic blobs. At rest each is only a faded pastel shape
// — blurred, washed out, nearly part of the paper. As the pointer comes
// near, it *reveals*: the blur clears, colour floods back, the shape
// swells a little and its occasion name surfaces. Click to start styling
// for that occasion. Their outlines never stop reshaping (eight
// border-radius values drifting independently) and they float slowly.
// On touch screens there's no hover, so they take turns revealing.
//
// Layering matters (see the orb square-clip fix in the changelog): the
// float/scale transform sits on the outer element, the morphing
// border-radius + overflow clip on the middle one, and the blur/colour
// filter only on the image inside — a filter or transform on the clipping
// element itself makes browsers drop the rounded clip and show a square.

// Positions in % of the welcome section, chosen to sit in the margins
// around the centred text. On phones there are no margins, so three of
// them (`m`) sit in a loose row under the text instead.
const SLOTS = [
  { left: 7, top: 15, w: 14, m: { left: 6, top: 66 } },
  { left: 80, top: 9, w: 12, m: { left: 38, top: 71 } },
  { left: 14, top: 55, w: 11, m: null },
  { left: 75, top: 38, w: 15, m: { left: 69, top: 65 } },
  { left: 29, top: 7, w: 8, m: null },
];
const TINTS = ["#e6dcff", "#ffe1d6", "#dce8ff", "#f9dbe7", "#efe6ff"];

export default function BlobGallery({ items, images = {}, onPick, cta = "Style this →" }) {
  const rootRef = useRef(null);
  const outerRefs = useRef([]);
  const clipRefs = useRef([]);
  const imgRefs = useRef([]);
  const washRefs = useRef([]);
  const capRefs = useRef([]);
  const [touch, setTouch] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    let raf = 0;
    let px = -9999;
    let py = -9999;
    let lastMove = performance.now();
    const reveal = SLOTS.map(() => 0);
    const focused = SLOTS.map(() => false);
    const start = performance.now();

    function onMove(e) {
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
    }
    function onLeave() {
      px = py = -9999;
    }
    const onFocusIn = (e) => {
      const i = outerRefs.current.indexOf(e.target.closest("[data-blob]"));
      if (i >= 0) focused[i] = true;
    };
    const onFocusOut = (e) => {
      const i = outerRefs.current.indexOf(e.target.closest("[data-blob]"));
      if (i >= 0) focused[i] = false;
    };

    function frame(now) {
      const t = (now - start) / 1000;
      SLOTS.forEach((s, i) => {
        const outer = outerRefs.current[i];
        const clip = clipRefs.current[i];
        if (!outer || !clip) return;
        const ph = i * 1.7;
        // Target reveal: pointer proximity on desktop, a slow round-robin
        // on touch, full while keyboard-focused.
        let target = 0;
        if (isTouch) {
          const turn = Math.floor(t / 4.5) % SLOTS.length;
          target = turn === i ? 1 : 0;
        } else {
          const r = clip.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const d = Math.hypot(px - cx, py - cy) - r.width * 0.45;
          target = Math.max(0, Math.min(1, 1 - d / 220));
          // Idle invitation: after a few still seconds, one blob at a time
          // half-reveals, hinting that they're there to be explored.
          if (now - lastMove > 5000) {
            const turn = Math.floor(t / 5) % SLOTS.length;
            if (turn === i) target = Math.max(target, 0.55 * Math.sin(((t % 5) / 5) * Math.PI));
          }
        }
        if (focused[i]) target = 1;
        reveal[i] += (target - reveal[i]) * (target > reveal[i] ? 0.09 : 0.04);
        // A floor of 0.14 so at rest you can just make out a photograph.
        const v = 0.14 + reveal[i] * 0.86;

        const fx = Math.sin(t * 0.21 + ph) * 10 + Math.sin(t * 0.13 + ph * 2) * 6;
        const fy = Math.cos(t * 0.17 + ph) * 12;
        outer.style.transform = `translate3d(${fx}px, ${fy}px, 0) scale(${(0.94 + v * 0.14).toFixed(4)})`;
        const k = (j) => (50 + (20 - v * 6) * Math.sin(t * (0.22 + j * 0.05) + ph + j * 1.9)).toFixed(1);
        clip.style.borderRadius = `${k(0)}% ${k(1)}% ${k(2)}% ${k(3)}% / ${k(4)}% ${k(5)}% ${k(6)}% ${k(7)}%`;
        // Feathered edge: at rest the shape dissolves into the paper; as
        // it reveals, the edge firms up. (A mask is safe on the clipping
        // element — only filters/transforms break the rounded clip.)
        const solid = (38 + v * 52).toFixed(1);
        const mask = `radial-gradient(closest-side, #000 ${solid}%, transparent 100%)`;
        clip.style.maskImage = mask;
        clip.style.webkitMaskImage = mask;

        const img = imgRefs.current[i];
        if (img) img.style.filter = `blur(${((1 - v) * 10).toFixed(2)}px) saturate(${(0.15 + v * 0.85).toFixed(3)})`;
        const wash = washRefs.current[i];
        if (wash) wash.style.opacity = String((0.9 * (1 - v)).toFixed(3));
        const cap = capRefs.current[i];
        if (cap) {
          cap.style.opacity = String(Math.max(0, (v - 0.35) / 0.65).toFixed(3));
          cap.style.transform = `translateY(${((1 - v) * 8).toFixed(1)}px)`;
        }
      });
      if (!still) raf = requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    if (still) frame(start);
    else raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0">
      {SLOTS.map((s, i) => {
        const item = items[i];
        if (!item || (narrow && !s.m)) return null;
        const pos = narrow ? s.m : s;
        return (
          <button
            key={item.slug}
            data-blob
            ref={(el) => (outerRefs.current[i] = el)}
            onClick={() => onPick(item)}
            aria-label={`Style me for: ${item.label}`}
            className="pointer-events-auto absolute outline-none"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: narrow ? "25vw" : `clamp(${touch ? 92 : 110}px, ${s.w}vw, 230px)`,
              willChange: "transform",
            }}
          >
            <span
              ref={(el) => (clipRefs.current[i] = el)}
              className="relative block aspect-[4/5] overflow-hidden"
              style={{
                borderRadius: "50%",
                maskImage: "radial-gradient(closest-side, #000 38%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(closest-side, #000 38%, transparent 100%)",
              }}
            >
              <span ref={(el) => (imgRefs.current[i] = el)} className="absolute inset-[-8%] block">
                {/* The user's own generated look for this occasion when they have
                    one (src/lib/occasionLooks.js), else the stock photo. */}
                <PlaceholderImage
                  src={images[item.slug] || `/occasions/${item.slug}-hero.jpg`}
                  seed={item.slug}
                  width={460}
                  height={575}
                />
              </span>
              <span
                ref={(el) => (washRefs.current[i] = el)}
                className="absolute inset-0 block"
                style={{ background: TINTS[i] }}
              />
            </span>
            <span
              ref={(el) => (capRefs.current[i] = el)}
              className="mt-2 block text-center font-script text-[15px] italic leading-tight text-[#2b2633] opacity-0 sm:mt-3 sm:text-[17px]"
            >
              {item.label}
              <span className="mt-0.5 block font-sans text-[10px] not-italic uppercase tracking-[0.2em] text-[#2b2633]/45">
                {cta}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
