"use client";

import { useEffect, useRef, useState } from "react";

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
];

export default function ThinkingLine() {
  const startIndex = useRef(Math.floor(Math.random() * PHRASES.length));
  const [index, setIndex] = useState(startIndex.current);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % PHRASES.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <p
      key={index}
      className="animate-fade-up mt-4 text-[15px] leading-relaxed text-accent-deep"
      aria-live="polite"
    >
      {PHRASES[index]}…
    </p>
  );
}
