import { useState } from "react";
import OutfitHero from "./OutfitHero.jsx";
import RecommendationCards from "./RecommendationCards.jsx";
import { Heart, Refresh, Hanger } from "../Icons.jsx";

export default function MessageBubble({ message, onToggleSave, savedIds, onQuickReply }) {
  const [showPieces, setShowPieces] = useState(false);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="animate-fade-up">
        <div className="ml-auto max-w-md rounded-xl3 rounded-tr-lg border border-accent-soft/50 bg-accent-tint/70 px-5 py-3.5 backdrop-blur-md sm:max-w-lg">
          <p className="text-[15px] leading-relaxed text-ink">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid gap-8 sm:grid-cols-2 sm:items-start">
        <OutfitHero />
        <div className="flex flex-col">
          {message.title && (
            <h2 className="font-script text-[52px] leading-[0.9] text-ink sm:text-[60px]">
              {message.title}
            </h2>
          )}
          <p className="mt-4 text-[16px] leading-relaxed text-ink">{message.narrative}</p>

          {message.pieces?.length > 0 && (
            <button
              onClick={() => setShowPieces((v) => !v)}
              className="mt-5 flex items-center gap-1.5 self-start text-[13px] font-medium text-accent-deep hover:underline"
            >
              <Hanger size={14} />
              {showPieces ? "Hide items" : "Find items for this outfit"}
            </button>
          )}

          <div className="mt-6 flex items-center gap-1 text-faint">
            <ToolbarBtn icon={Heart} label="Love" />
            <ToolbarBtn icon={Refresh} label="Retry" />
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
              className="glass-soft rounded-full px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-accent-deep"
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
    <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] transition-colors hover:bg-white/60 hover:text-accent-deep">
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}
