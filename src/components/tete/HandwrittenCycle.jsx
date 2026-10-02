"use client";

import { useEffect, useState } from "react";

// The welcome's cycling occasion ("Dressed for / the first date.") is
// *handwritten* (direct request 2026-10-02): each line is written out
// left-to-right in the hand font (Dancing Script) — a soft-edged mask sweeping
// across the script, paced by the length of the line like a pen would be —
// held for a beat, then fades before the next one is written.
// Under prefers-reduced-motion it simply swaps lines, no writing.
const PER_CHAR = 0.075; // seconds of "writing" per character
const HOLD = 1700; // ms the finished line rests
const FADE = 450; // ms fade-out before the next line

export default function HandwrittenCycle({ lines, className = "" }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(reduce);
    const write = reduce ? 0 : Math.max(0.9, lines[i].length * PER_CHAR) * 1000;
    const t1 = setTimeout(() => setLeaving(true), write + HOLD);
    const t2 = setTimeout(() => {
      setLeaving(false);
      setI((v) => (v + 1) % lines.length);
    }, write + HOLD + FADE);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [i, lines]);

  const dur = Math.max(0.9, lines[i].length * PER_CHAR);
  return (
    <span
      key={i}
      className={`${still ? "" : "tete-write"} inline-block font-hand transition-opacity ${
        leaving ? "opacity-0" : "opacity-100"
      } ${className}`}
      style={{ "--write-dur": `${dur}s`, transitionDuration: `${FADE}ms` }}
    >
      {lines[i]}
    </span>
  );
}
