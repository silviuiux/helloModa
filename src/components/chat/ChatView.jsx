import { useRef, useState, useEffect } from "react";
import { Sparkle, Rain, Bag } from "../Icons.jsx";
import MessageBubble from "./MessageBubble.jsx";
import Composer from "./Composer.jsx";
import LookContextPanel from "./LookContextPanel.jsx";
import { seedMessages, lookContext } from "../../data/seed.js";

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lav-100 px-3.5 py-1.5 text-[12.5px] text-muted">
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

export default function ChatView() {
  const [messages, setMessages] = useState(seedMessages);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSend(text) {
    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    const aiMsg = {
      id: `a-${Date.now()}`,
      role: "ai",
      title: "A refined direction",
      hero: ["#e4e2f0", "#d7d4e9"],
      text: "Noted. I'll keep your tailoring-forward, soft-neutral signature and weigh that against tonight's gallery dinner and the light rain. Here's a refined direction.",
      cards: [
        { id: `r-${Date.now()}-1`, name: "Ivory sheer knit", role: "Top layer", source: "shop", icon: "shirt", price: "$118" },
        { id: `r-${Date.now()}-2`, name: "Satin micro bag", role: "Accent", source: "closet", icon: "bag", price: "In closet" },
        { id: `r-${Date.now()}-3`, name: "Sculptural flats", role: "Footing", source: "closet", icon: "shoe", price: "In closet" },
      ],
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
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
          {/* Context chips */}
          <div className="mb-6 flex flex-wrap gap-2.5">
            <Chip icon={Bag}>Occasion: {lookContext.occasion}</Chip>
            <Chip icon={Rain}>{lookContext.weather}</Chip>
            <Chip>Budget: {lookContext.budget}</Chip>
          </div>

          <div className="space-y-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        </div>

        <Composer onSend={handleSend} />
      </section>

      <LookContextPanel />
    </div>
  );
}
