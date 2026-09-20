"use client";

import { useEffect, useRef, useState } from "react";
import GarmentArt from "../GarmentArt.jsx";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md): a real photorealistic image,
// generated on demand via Replicate (src/lib/imageGen.js). Shows the
// illustrated placeholder + a "Generating…" state until it's ready — the
// chat turn itself already rendered instantly, this fills in after.
export default function OutfitHero({ recommendationId, heroPrompt, generatedImageUrl }) {
  const [imageUrl, setImageUrl] = useState(generatedImageUrl || null);
  const [status, setStatus] = useState(generatedImageUrl ? "ready" : "idle");
  const started = useRef(false);

  useEffect(() => {
    if (imageUrl || !recommendationId || !heroPrompt || started.current) return;
    started.current = true;
    setStatus("generating");

    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendationId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setStatus("ready");
        } else {
          setStatus("error");
        }
      })
      .catch((err) => {
        console.error("Outfit image generation failed:", err);
        setStatus("error");
      });
  }, [recommendationId, heroPrompt, imageUrl]);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl2">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <GarmentArt type="look" />
          <span className="glass-circle absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
            {status === "generating" ? "Generating…" : "AI preview"}
          </span>
        </>
      )}
    </div>
  );
}
