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
  composing = false,
}) {
  const orbState = thinking ? "thinking" : composing ? "listening" : "idle";
  const scrollRef = useRef(null);
  const prevCountRef = useRef(0);

  const savedIds = new Set(
    wardrobe
      .filter((it) => typeof it.id === "string" && it.id.startsWith("saved-"))
      .map((it) => it.id.slice("saved-".length))
  );

  // Smooth-animate the common case (a message or the thinking indicator was
  // just added/removed during a live session — exactly one at a time), but
  // jump instantly when a whole conversation loads at once (switching in
  // BottomBar's history dropdown, or via /outfits — see
  // ConversationFromQuery.jsx): animating a long scroll through history
  // someone didn't just write would look worse, not better. Direct request
  // 2026-09-21 — the instant jump on every send/reply read as jarring.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Nothing in the thread yet: stay at the top, where the greeting and
    // the orb are. (Scrolling to the bottom here used to push the whole
    // welcome out of view on first load, leaving only the prompt chips.)
    if (messages.length === 0 && !thinking) {
      prevCountRef.current = 0;
      el.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const isBulkLoad = Math.abs(messages.length - prevCountRef.current) > 1;
    prevCountRef.current = messages.length;
    el.scrollTo({ top: el.scrollHeight, behavior: isBulkLoad ? "auto" : "smooth" });
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
      <EmptyState
        userEmail={userEmail}
        userDisplayName={userDisplayName}
        onPrompt={onQuickReply}
        orbState={orbState}
      />
      {hasMessages && (
        <div className="mx-auto w-full max-w-content space-y-32 px-4 pb-[33vh] pt-32 sm:px-6">
          {/* A hairline + mono marker between the welcome and the thread,
              so the conversation reads as starting somewhere. */}
          <div className="animate-fade-in flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="label text-faint">conversation</span>
            <span className="h-px flex-1 bg-line" />
          </div>
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
