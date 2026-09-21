import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble.jsx";
import EmptyState from "./EmptyState.jsx";
import ThinkingLine from "./ThinkingLine.jsx";
import { cardToWardrobeItem } from "../../lib/look.js";

// See docs/09-conversation-design.md: one outfit direction per turn, no
// containers, generous spacing, EmptyState as a persistent hero (not just
// an empty-state). The composer lives in BottomBar.jsx now — this
// component only displays messages; sending is owned by AppShell.
export default function ChatView({
  wardrobe = [],
  onWardrobeAdd,
  onWardrobeRemove,
  messages,
  thinking,
  onQuickReply,
  isSwitching = false,
  userEmail,
  userDisplayName,
}) {
  const scrollRef = useRef(null);

  const savedIds = new Set(
    wardrobe
      .filter((it) => typeof it.id === "string" && it.id.startsWith("saved-"))
      .map((it) => it.id.slice("saved-".length))
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  function handleToggleSave(piece) {
    if (savedIds.has(piece.id)) {
      onWardrobeRemove?.(`saved-${piece.id}`);
    } else {
      onWardrobeAdd?.(cardToWardrobeItem(piece));
    }
  }

  const hasMessages = messages.length > 0 || isSwitching;

  return (
    <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto">
      {/* Always mounted, not just on the true empty state — "the hero of
          each conversation" per direct request 2026-09-21: greeting,
          occasion cards, and example prompts stay reachable by scrolling up
          even mid-conversation, instead of disappearing after the first
          message. */}
      <EmptyState userEmail={userEmail} userDisplayName={userDisplayName} onPrompt={onQuickReply} />
      {hasMessages && (
        <div className="mx-auto w-full max-w-content space-y-32 px-4 pb-[33vh] pt-32 sm:px-6">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              onToggleSave={handleToggleSave}
              savedIds={savedIds}
              onQuickReply={onQuickReply}
            />
          ))}
          {thinking && <ThinkingLine />}
        </div>
      )}
    </div>
  );
}
