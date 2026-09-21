"use client";

import { useEffect, useState } from "react";

// Returns 0..1 progress of an element through the viewport, for
// scroll-driven ("scrollytelling") sections — see
// src/components/landing/StickyStage.jsx.
//
// 0 = the element's top just hit the top of the viewport, 1 = its bottom
// just reached the bottom. Pair it with a tall parent (e.g. h-[400vh]) and
// a `sticky top-0 h-screen` child: the child stays pinned while progress
// runs 0 -> 1, which is what lets the pinned visual change as you scroll.
//
// rAF-throttled with a passive listener rather than a scroll library —
// matches this codebase's hand-rolled-UI preference and keeps the landing
// page's JS budget small (page speed is a conversion factor, not a detail).
export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    function measure() {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)));
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}
