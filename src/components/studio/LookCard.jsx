"use client";

import { useState } from "react";
import Orb from "../Orb.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import RecommendationCards from "../chat/RecommendationCards.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { ThumbsUp, ThumbsDown, Refresh, Hanger } from "../Icons.jsx";

// Design exploration, branch design/chat-studio-sidebar: one stylist turn
// as a single card — image on the left, the look's title, story and
// actions on the right, the pieces folding out inside the same card. Uses
// the same useOutfitImage hook as main's MessageBubble, so generation,
// quotas and errors behave identically.
export default function LookCard({ message, onQuickReply, onToggleSave, savedIds }) {
  const [showPieces, setShowPieces] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { imageUrl, settled, errorMessage } = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });

  return (
    <div className="animate-fade-up">
      <article className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_20px_50px_-30px_rgba(30,26,46,0.35)]">
        <div className="grid md:grid-cols-[300px_1fr]">
          <div className="relative aspect-[4/5] bg-[#f1eff5] md:aspect-auto md:min-h-[400px]">
            {!settled && !imageUrl && (
              <div className="skeleton-organic animate-shimmer absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <Orb size={48} state="thinking" />
                  <span className="text-[12px] font-medium text-faint">Painting your look…</span>
                </div>
              </div>
            )}
            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
            {settled && !imageUrl && (
              <div className="absolute inset-0">
                <PlaceholderImage seed={message.recommendationId || message.id} width={600} height={750} />
              </div>
            )}
            {errorMessage && (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-10 text-[12px] leading-snug text-white">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[12px] font-medium text-faint">
              <Orb size={16} mini state={settled ? "idle" : "thinking"} />
              helloModa · your look
            </div>
            {message.title && (
              <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink">{message.title}</h2>
            )}
            {message.narrative && <p className="mt-3 text-[15px] leading-[1.7] text-ink/80">{message.narrative}</p>}

            {settled && (
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                <button aria-label="Good match" className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.08] text-muted transition-colors hover:border-accent hover:text-accent-deep">
                  <ThumbsUp size={16} />
                </button>
                <button aria-label="Not for me" className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.08] text-muted transition-colors hover:border-accent hover:text-accent-deep">
                  <ThumbsDown size={16} />
                </button>
                <button className="flex h-10 items-center gap-2 rounded-full border border-black/[0.08] px-4 text-[13px] font-medium text-muted transition-colors hover:border-accent hover:text-accent-deep">
                  <Refresh size={15} />
                  Restyle
                </button>
                {message.pieces?.length > 0 && (
                  <button
                    onClick={() => setShowPieces((v) => !v)}
                    className="flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-accent-deep"
                  >
                    <Hanger size={15} />
                    {showPieces ? "Hide pieces" : `See the pieces (${message.pieces.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {settled && showPieces && (
          <div className="animate-fade-up border-t border-black/[0.06] p-6 sm:p-8">
            <RecommendationCards cards={message.pieces} onToggleSave={onToggleSave} savedIds={savedIds} />
          </div>
        )}
      </article>

      {settled && message.quickReplies?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {message.quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => onQuickReply?.(q)}
              className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-[13px] text-muted transition-colors hover:border-accent hover:text-accent-deep"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
