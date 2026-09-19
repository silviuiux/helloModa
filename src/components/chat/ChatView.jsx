import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import Composer from "./Composer.jsx";
import EmptyState from "./EmptyState.jsx";
import { cardToWardrobeItem } from "../../lib/look.js";

function ThinkingLine() {
  return (
    <p className="animate-fade-up font-script text-[22px] text-accent-deep">thinking…</p>
  );
}

// See docs/09-conversation-design.md for the rules this implements: one
// outfit direction per turn, no sidebar, narrow editorial column.
export default function ChatView({
  wardrobe = [],
  onWardrobeAdd,
  onWardrobeRemove,
  conversationId,
  messages,
  setMessages,
  onConversationCreated,
  isSwitching = false,
  userEmail,
  userDisplayName,
}) {
  const [thinking, setThinking] = useState(false);
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

  async function handleSend(text) {
    if (thinking) return;
    const tempId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", text }]);
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "ai",
            title: null,
            narrative: data.error || "Something went wrong. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.message,
      ]);

      if (!conversationId && data.conversationId) {
        onConversationCreated?.(data.conversationId, data.conversationTitle);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ai",
          title: null,
          narrative: "Couldn't reach the server. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleToggleSave(piece) {
    if (savedIds.has(piece.id)) {
      onWardrobeRemove?.(`saved-${piece.id}`);
    } else {
      onWardrobeAdd?.(cardToWardrobeItem(piece));
    }
  }

  const hasMessages = messages.length > 0 || isSwitching;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto">
        {!hasMessages ? (
          <EmptyState userEmail={userEmail} userDisplayName={userDisplayName} onPrompt={handleSend} />
        ) : (
          <div className="mx-auto w-full max-w-content space-y-5 px-4 py-6 sm:px-6">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onToggleSave={handleToggleSave}
                savedIds={savedIds}
                onQuickReply={handleSend}
              />
            ))}
            {thinking && <ThinkingLine />}
          </div>
        )}
      </div>

      <Composer onSend={handleSend} disabled={thinking} />
    </div>
  );
}
