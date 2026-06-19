import RecommendationCards from "./RecommendationCards.jsx";
import GarmentArt from "../GarmentArt.jsx";
import { Heart, Bookmark, Dots } from "../Icons.jsx";

export default function MessageBubble({
  message,
  onSwap,
  onToggleSave,
  onToggleLook,
  savedIds,
  lookIds,
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="animate-fade-up">
        <div className="ml-auto max-w-[78%] rounded-xl3 rounded-tr-lg border border-accent-soft/50 bg-accent-tint/70 px-5 py-4 backdrop-blur-md">
          <p className="label mb-1.5 text-accent-deep/80">You</p>
          <p className="text-[15.5px] leading-relaxed text-ink">{message.text}</p>
        </div>
      </div>
    );
  }

  const hero = message.hero;

  return (
    <div className="animate-fade-up">
      <div className="glass mr-auto max-w-[92%] overflow-hidden rounded-xl3 rounded-tl-lg">
        {/* Editorial hero */}
        {hero && (
          <div className="relative h-48">
            <GarmentArt type="look" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper/90 to-transparent" />
            {message.title && (
              <span className="absolute bottom-3 left-4 font-display text-[20px] font-medium text-ink">
                {message.title}
              </span>
            )}
          </div>
        )}

        <div className="px-5 py-4">
          <p className="label mb-2 text-accent-deep">helloModa AI</p>
          <p className="text-[15.5px] leading-relaxed text-ink">{message.text}</p>
          <RecommendationCards
            cards={message.cards}
            onSwap={(cardId) => onSwap?.(message.id, cardId)}
            onToggleSave={onToggleSave}
            onToggleLook={onToggleLook}
            savedIds={savedIds}
            lookIds={lookIds}
          />
          {message.followup && (
            <div className="mt-4 rounded-xl2 border border-accent-soft/40 bg-accent-tint/60 px-4 py-3">
              <p className="text-[13.5px] leading-relaxed text-muted">
                {message.followup}
              </p>
            </div>
          )}

          {/* Response toolbar */}
          <div className="mt-4 flex items-center gap-1 border-t border-white/50 pt-3 text-faint">
            <ToolbarBtn icon={Heart} label="Love" />
            <ToolbarBtn icon={Bookmark} label="Save look" />
            <ToolbarBtn icon={Dots} label="More" />
          </div>
        </div>
      </div>
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
