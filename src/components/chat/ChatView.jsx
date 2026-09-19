import { useRef, useState, useEffect, useMemo } from "react";
import { Sparkle, Rain, Bag } from "../Icons.jsx";
import MessageBubble from "./MessageBubble.jsx";
import Composer from "./Composer.jsx";
import LookContextPanel from "./LookContextPanel.jsx";
import { lookContext } from "../../data/seed.js";
import { pickAlternative, cardToWardrobeItem } from "../../lib/look.js";

function Chip({ icon: Icon, children }) {
  return (
    <span className="glass-soft inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] text-muted">
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

function TypingBubble() {
  return (
    <div className="animate-fade-up">
      <div className="glass mr-auto inline-flex items-center gap-3 rounded-xl3 rounded-tl-lg px-5 py-4">
        <span className="label text-accent-deep">helloModa AI</span>
        <span className="flex items-center gap-1">
          <Dot delay="0ms" />
          <Dot delay="180ms" />
          <Dot delay="360ms" />
        </span>
        <span className="text-[13px] text-muted">styling your look…</span>
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-faint"
      style={{ animation: "hm-blink 1.2s ease-in-out infinite", animationDelay: delay }}
    />
  );
}

export default function ChatView({
  wardrobe = [],
  onWardrobeAdd,
  onWardrobeRemove,
  conversationId,
  messages,
  setMessages,
  onConversationCreated,
  isSwitching = false,
}) {
  const [thinking, setThinking] = useState(false);
  const [look, setLook] = useState([]);
  const scrollRef = useRef(null);

  // Saved = present in wardrobe under its derived id.
  const savedIds = useMemo(() => {
    const ids = new Set();
    wardrobe.forEach((it) => {
      if (typeof it.id === "string" && it.id.startsWith("saved-")) {
        ids.add(it.id.slice("saved-".length));
      }
    });
    return ids;
  }, [wardrobe]);

  const lookIds = useMemo(() => new Set(look.map((c) => c.id)), [look]);

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
            text: data.error || "Something went wrong. Please try again.",
          },
        ]);
        return;
      }

      // Replace the optimistic user bubble with the real (DB-backed) one, then
      // append the assistant reply.
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
          text: "Couldn't reach the server. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  // Re-roll a single suggestion in place — still swaps against the static
  // mock catalog (src/data/seed.js) since there's no real product catalog
  // yet (docs/05-integrations-affiliates.md, Phase 1+). Local-only, not persisted.
  function handleSwap(messageId, cardId) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id !== messageId
          ? m
          : { ...m, cards: m.cards.map((c) => (c.id === cardId ? pickAlternative(c) : c)) }
      )
    );
  }

  // Heart → toggle the piece in the wardrobe favorites.
  function handleToggleSave(card) {
    if (savedIds.has(card.id)) {
      onWardrobeRemove?.(`saved-${card.id}`);
    } else {
      onWardrobeAdd?.(cardToWardrobeItem(card));
    }
  }

  // + → toggle the piece in the assembled look.
  function handleToggleLook(card) {
    setLook((prev) =>
      prev.some((c) => c.id === card.id)
        ? prev.filter((c) => c.id !== card.id)
        : [...prev, card]
    );
  }

  function removeFromLook(id) {
    setLook((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Center column */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <h1 className="font-display text-[26px] font-medium leading-tight text-ink">
              Evening capsule assistant
            </h1>
            <p className="mt-1 text-[13.5px] text-muted">
              AI stylist · remembers wardrobe, fit notes, and taste boundaries
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-tint px-3.5 py-2 text-[12.5px] font-medium text-accent-deep">
            <Sparkle size={14} />
            Context on
          </span>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="mb-6 flex flex-wrap gap-2.5">
            <Chip icon={Bag}>Occasion: {lookContext.occasion}</Chip>
            <Chip icon={Rain}>{lookContext.weather}</Chip>
            <Chip>Budget: {lookContext.budget}</Chip>
          </div>

          {messages.length === 0 && !isSwitching ? (
            <div className="grid place-items-center py-20 text-center text-muted">
              <p className="text-[15px]">
                Describe an occasion, and helloModa will style a look from your closet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onSwap={handleSwap}
                  onToggleSave={handleToggleSave}
                  onToggleLook={handleToggleLook}
                  savedIds={savedIds}
                  lookIds={lookIds}
                />
              ))}
              {thinking && <TypingBubble />}
            </div>
          )}
        </div>

        <Composer onSend={handleSend} disabled={thinking} />
      </section>

      <LookContextPanel look={look} onRemove={removeFromLook} />

      <style>{`
        @keyframes hm-blink {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-1px); }
        }
      `}</style>
    </div>
  );
}
