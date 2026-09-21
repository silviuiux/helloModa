"use client";

import { useEffect, useRef, useState } from "react";

// Kicks off Phase 2 "Magic Mirror" generation (POST /api/generate-image) and
// tracks its status. Split out of OutfitHero.jsx so the chat turn (docs/09-
// conversation-design.md) can show a single "thinking…" line while this is
// in flight instead of a placeholder box — see MessageBubble.jsx.
export function useOutfitImage({ recommendationId, heroPrompt, generatedImageUrl }) {
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

  // No image was ever expected (e.g. an error message with no recommendation)
  // — treat that the same as "ready" so callers don't wait on it forever.
  const settled = !recommendationId || !heroPrompt || status === "ready" || status === "error";

  return { imageUrl, status, settled };
}
