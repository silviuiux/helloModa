import RecommendationCards from "./RecommendationCards.jsx";
import { Dress, Heart, Bookmark, Dots } from "../Icons.jsx";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="animate-fade-up">
        <div className="ml-auto max-w-[78%] rounded-xl3 rounded-tr-lg bg-lav-100 px-5 py-4">
          <p className="label mb-1.5 text-muted/80">You</p>
          <p className="text-[15.5px] leading-relaxed text-ink">{message.text}</p>
        </div>
      </div>
    );
  }

  const hero = message.hero;

  return (
    <div className="animate-fade-up">
      <div className="mr-auto max-w-[92%] overflow-hidden rounded-xl3 rounded-tl-lg bg-paper shadow-soft ring-1 ring-line">
        {/* Editorial hero placeholder */}
        {hero && (
          <div
            className="relative grid h-44 place-items-center"
            style={{ background: `linear-gradient(135deg, ${hero[0]}, ${hero[1]})` }}
          >
            <div className="text-ink/25">
              <Dress size={52} />
            </div>
            {message.title && (
              <span className="absolute bottom-3 left-4 font-display text-[19px] font-medium text-ink/80">
                {message.title}
              </span>
            )}
          </div>
        )}

        <div className="px-5 py-4">
          <p className="label mb-2 text-accent">helloModa AI</p>
          <p className="text-[15.5px] leading-relaxed text-ink">{message.text}</p>
          <RecommendationCards cards={message.cards} />
          {message.followup && (
            <div className="mt-4 rounded-xl2 bg-lav-100 px-4 py-3">
              <p className="text-[13.5px] leading-relaxed text-muted">
                {message.followup}
              </p>
            </div>
          )}

          {/* Response toolbar */}
          <div className="mt-4 flex items-center gap-1 border-t border-line pt-3 text-faint">
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
    <button className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] transition-colors hover:bg-lav-100 hover:text-ink">
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}
