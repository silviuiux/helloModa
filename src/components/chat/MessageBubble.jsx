import { useState } from "react";
import OutfitHero from "./OutfitHero.jsx";
import RecommendationCards from "./RecommendationCards.jsx";
import ThinkingLine from "./ThinkingLine.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { ThumbsUp, ThumbsDown, Hanger } from "../Icons.jsx";

export default function MessageBubble({ message, onToggleSave, savedIds, onQuickReply }) {
  const [showPieces, setShowPieces] = useState(false);
  const isUser = message.role === "user";
  const { imageUrl, settled } = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });

  if (isUser) {
    return (
      <div className="animate-fade-up">
        <div className="ml-auto max-w-md rounded-bubble border border-accent-soft/50 bg-accent-tint/70 px-5 py-3.5 backdrop-blur-md sm:max-w-lg">
          <p className="text-[15px] leading-relaxed text-ink">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      {message.title && (
        <h2 className="font-script text-[52px] leading-[0.9] text-ink sm:text-[60px]">
          {message.title}
        </h2>
      )}
      {message.narrative && (
        <p className="max-w-2xl text-[16px] leading-relaxed text-ink">{message.narrative}</p>
      )}

      {!settled ? (
        <ThinkingLine />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-[1.3fr,1fr] sm:items-end">
            <OutfitHero imageUrl={imageUrl} />
            <div className="flex flex-col items-start gap-4 sm:items-end">
              <div className="flex items-center gap-1 text-faint">
                <ToolbarBtn icon={ThumbsUp} label="Good match" />
                <ToolbarBtn icon={ThumbsDown} label="Not for me" />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <button className="rounded-bubble border border-line px-5 py-2 text-[11px] font-medium uppercase tracking-label text-muted transition-colors hover:border-accent-soft hover:text-ink">
                  Retry
                </button>
                {message.pieces?.length > 0 && (
                  <button
                    onClick={() => setShowPieces((v) => !v)}
                    className="flex items-center gap-1.5 rounded-bubble bg-accent px-5 py-2 text-[11px] font-medium uppercase tracking-label text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02]"
                  >
                    <Hanger size={13} />
                    {showPieces ? "Hide Items" : "Find Outfit"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {showPieces && (
            <RecommendationCards cards={message.pieces} onToggleSave={onToggleSave} savedIds={savedIds} />
          )}

          {message.quickReplies?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {message.quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => onQuickReply?.(q)}
                  className="glass-soft rounded-bubble px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-accent-deep"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label }) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-white/60 hover:text-accent-deep"
    >
      <Icon size={16} />
    </button>
  );
}
