"use client";

import { useEffect, useRef, useState } from "react";

// Hand-rolled scroll-reveal (IntersectionObserver + the existing
// animate-fade-up keyframe, tailwind.config.js) rather than a new animation
// dependency — matches this codebase's established no-dependency-UI
// preference (see the occasion/guide carousels). Fires once, then stays
// visible; respects prefers-reduced-motion by skipping the animation
// entirely rather than forcing motion on someone who's opted out.
export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ animationDelay: visible ? `${delay}ms` : undefined }}
      className={`${visible ? "animate-fade-up" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}
