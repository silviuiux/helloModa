import { useState } from "react";
import OutfitHero from "./OutfitHero.jsx";
import RecommendationCards from "./RecommendationCards.jsx";
import Orb from "../Orb.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { ThumbsUp, ThumbsDown, Hanger } from "../Icons.jsx";

// Per-word delay, capped so a long narrative still finishes in ~2.5s.
// Shared by StreamedText and MessageBubble (whose controls wait for it).
function streamTiming(text) {
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const step = Math.min(32, 2400 / Math.max(1, wordCount));
  return { step, total: Math.round(wordCount * step) };
}

// Streams text in word by word (blur-resolve per word). Only used for a
// reply that just arrived (`message.fresh`) — replaying the effect on every
// message when a past conversation loads would be slow and tiresome.
function StreamedText({ text, className }) {
  const words = text.split(/(\s+)/);
  const { step } = streamTiming(text);
  let wordIndex = 0;
  return (
    <p className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return w;
        const delay = wordIndex++ * step;
        return (
          <span key={i} className="animate-word-in inline-block" style={{ animationDelay: `${delay}ms` }}>
            {w}
          </span>
        );
      })}
    </p>
  );
}

export default function MessageBubble({ message, onToggleSave, savedIds, onQuickReply }) {
  const [showPieces, setShowPieces] = useState(false);
  const isUser = message.role === "user";
  const { imageUrl, settled, errorMessage } = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });

  // For a fresh reply the turn unfolds in order: title, then the narrative
  // streams, and only then do the actions and suggestions surface — they
  // shouldn't appear under a sentence that's still being written.
  const afterStream = message.fresh ? streamTiming(message.narrative).total + 250 : 0;

  if (isUser) {
    // Left-aligned, amber-warmed, near-square bottom-left corner — the
    // opposite speaker corner from helloModa's replies, so who's talking
    // reads from shape alone.
    return (
      <div className="animate-fade-up">
        <div className="max-w-md rounded-bubble-sm border border-accent-soft/60 bg-accent-tint px-5 py-3.5 sm:max-w-lg">
          <p className="text-[15px] leading-relaxed text-ink">{message.text}</p>
        </div>
      </div>
    );
  }

  // A text-only assistant turn (no outfit direction — currently just the
  // network/API error fallbacks in AppShell.jsx, including the free-plan
  // quota message) gets the mirrored outlined bubble instead of the full
  // image+title+narrative layout below.
  if (!message.title && !message.heroPrompt) {
    return (
      <div className="animate-fade-up flex items-start justify-end gap-3">
        <div className="max-w-md rounded-bubble-reply-sm border border-line bg-paper/80 px-5 py-3.5 sm:max-w-lg">
          <p className="text-[15px] leading-relaxed text-ink">{message.narrative}</p>
        </div>
        <Orb size={22} mini className="mt-2.5" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-8">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-start sm:gap-12">
        <OutfitHero imageUrl={imageUrl} pending={!settled} errorMessage={settled ? errorMessage : null} />

        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Orb size={18} mini state={settled ? "idle" : "thinking"} />
            <span className="label text-faint">helloModa</span>
          </div>

          {message.title && (
            <h2
              className="animate-fade-up mt-5 font-script text-[54px] leading-[0.92] tracking-[-0.01em] text-ink sm:text-[64px]"
              style={{ animationDelay: message.fresh ? "120ms" : "0ms" }}
            >
              {message.title}
            </h2>
          )}

          {message.narrative &&
            (message.fresh ? (
              <StreamedText text={message.narrative} className="mt-5 text-[16px] leading-[1.7] text-ink/85" />
            ) : (
              <p className="mt-5 text-[16px] leading-[1.7] text-ink/85">{message.narrative}</p>
            ))}

          {settled && (
            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-2"
              style={{ animationDelay: `${afterStream}ms` }}
            >
              <ToolbarBtn icon={ThumbsUp} label="Good match" />
              <ToolbarBtn icon={ThumbsDown} label="Not for me" />
              <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
              <button className="rounded-bubble-sm border border-line px-5 py-2 text-[11px] font-medium uppercase tracking-label text-muted transition-colors hover:border-accent-soft hover:text-ink">
                Retry
              </button>
              {message.pieces?.length > 0 && (
                <button
                  onClick={() => setShowPieces((v) => !v)}
                  className="flex items-center gap-1.5 rounded-bubble-sm bg-accent px-5 py-2 text-[11px] font-semibold uppercase tracking-label text-canvas transition-all hover:bg-accent-deep"
                >
                  <Hanger size={13} />
                  {showPieces ? "Hide pieces" : "Find outfit"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {settled && showPieces && (
        <div className="animate-fade-up">
          <RecommendationCards cards={message.pieces} onToggleSave={onToggleSave} savedIds={savedIds} />
        </div>
      )}

      {settled && message.quickReplies?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.quickReplies.map((q, i) => (
            <button
              key={q}
              onClick={() => onQuickReply?.(q)}
              style={{ animationDelay: `${afterStream + 120 + i * 70}ms` }}
              className="animate-fade-up rounded-bubble-sm border border-line bg-paper/60 px-4 py-2 text-[13px] text-muted transition-colors hover:border-accent-soft hover:text-ink"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ icon: Icon, label }) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-white/[0.06] hover:text-accent-deep"
    >
      <Icon size={16} />
    </button>
  );
}
