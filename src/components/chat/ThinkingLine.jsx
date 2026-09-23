"use client";

import { useEffect, useRef, useState } from "react";
import Orb from "../Orb.jsx";

// Fashion-flavored synonyms for "thinking" — cycles while the stylist works,
// instead of a static label. Purely decorative text, no meaning attached to
// order or timing. See docs/09-conversation-design.md.
const PHRASES = [
  "Styling",
  "Curating",
  "Draping",
  "Layering",
  "Accessorizing",
  "Cross-referencing your closet",
  "Consulting the moodboard",
  "Pairing silhouettes",
  "Auditioning fabrics",
  "Reading the room",
  "Sketching the look",
  "Pulling references",
  "Finding the anchor piece",
  "Balancing proportions",
  "Weighing textures",
  "Scouting palettes",
  "Editing the rack",
  "Checking the light",
  "Tailoring the fit",
  "Steaming out the wrinkles",
  "Raiding your wardrobe",
  "Checking the dress code",
  "Mixing the paints",
];

// The orb in its thinking state carries the "working" signal; the phrase
// beside it dissolves into the next one (blur-resolve, not a hard swap) so
// the whole thing reads as one continuous, calm motion rather than a
// ticking status line. Never a spinner.
// `editorial` (design exploration, branch design/chat-editorial): only
// ChatView.jsx passes this — LandingChatDemo stays on the shipped look.
export default function ThinkingLine({ className = "", editorial = false }) {
  const startIndex = useRef(Math.floor(Math.random() * PHRASES.length));
  const [index, setIndex] = useState(startIndex.current);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 1900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`animate-fade-up flex items-center gap-4 ${className}`}>
      <Orb size={editorial ? 20 : 30} state="thinking" mini />
      <p
        key={index}
        className={
          editorial
            ? "animate-word-in editorial-caption"
            : "animate-word-in text-[15px] leading-relaxed text-muted"
        }
        aria-live="polite"
      >
        {PHRASES[index]}
        <span className="text-accent">…</span>
      </p>
    </div>
  );
}
