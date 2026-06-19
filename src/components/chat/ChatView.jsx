import { useRef, useState, useEffect, useMemo } from "react";
import { Sparkle, Rain, Bag } from "../Icons.jsx";
import MessageBubble from "./MessageBubble.jsx";
import Composer from "./Composer.jsx";
import LookContextPanel from "./LookContextPanel.jsx";
import { seedMessages, lookContext } from "../../data/seed.js";
import { pickAlternative, cardToWardrobeItem } from "../../lib/look.js";

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lav-100 px-3.5 py-1.5 text-[12.5px] text-muted">
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

function TypingBubble() {
  return (
    <div className="animate-fade-up">
      <div className="mr-auto inline-flex items-center gap-3 rounded-xl3 rounded-tl-lg bg-paper px-5 py-4 shadow-soft ring-1 ring-line">
        <span className="label text-accent">helloModa AI</span>
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

export default function ChatView({ wardrobe = [], onWardrobeAdd, onWardrobeRemove }) {
  const [messages, setMessages] = useState(seedMessages);
  const [thinking, setThinking] = useState(false);
  const [look, setLook] = useState([]);
  const scrollRef = useRef(null);
  const timers = useRef([]);

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

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleSend(text) {
    if (thinking) return;
    const stamp = Date.now();
    setMessages((prev) => [...prev, { id: `u-${stamp}`, role: "user", text }]);
    setThinking(true);

    const delay = 1400 + Math.random() * 1100;
    const t = setTimeout(() => {
      const aiMsg = {
        id: `a-${stamp}`,
        role: "ai",
        title: "A refined direction",
        hero: true,
        text: "Noted. I'll keep your tailoring-forward, soft-neutral signature and weigh that against tonight's gallery dinner and the light rain. Here's a refined direction.",
        cards: [
          { id: `r-${stamp}-1`, brand: "COS", name: "Sheer rib knit", type: "top", price: 159.99, retailer: "Zalando", source: "shop" },
          { id: `r-${stamp}-2`, brand: "By Far", name: "Satin micro bag", type: "bag", price: null, retailer: "Closet", source: "closet" },
          { id: `r-${stamp}-3`, brand: "The Row", name: "Sculptural flats", type: "shoe", price: null, retailer: "Closet", source: "closet" },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setThinking(false);
    }, delay);
    timers.current.push(t);
  }

  // Re-roll a single suggestion in place.
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
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-tint px-3.5 py-2 text-[12.5px] font-medium text-accent">
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
