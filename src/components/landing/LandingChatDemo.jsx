"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "../chat/MessageBubble.jsx";
import ThinkingLine from "../chat/ThinkingLine.jsx";

// A scripted replay, not a real chat session — no /api/chat or Replicate
// calls, safe for anonymous public traffic and zero cost per pageview
// (direct decision 2026-09-21, given the app's invite-only/private-beta
// posture, docs/06-risks-legal.md). Reuses the real MessageBubble.jsx so
// the demo looks exactly like the real product, not a mockup of it — a
// turn with no recommendationId/heroPrompt never triggers useOutfitImage's
// fetch, so this is genuinely inert, not just rate-limited.
//
// Copy for "Rooftop birthday" is lifted near-verbatim from a real turn the
// product actually generated (screenshot supplied 2026-09-21) — the rest
// written to match that same voice, not invented from nothing.
const SCRIPTS = {
  "rooftop-birthday": {
    prompt: "It's a friend's rooftop birthday party this weekend, evening in the city.",
    reply: {
      id: "demo-rooftop",
      role: "ai",
      title: "Rooftop after dark",
      narrative:
        "City rooftops at night are all silhouette and shadow, so we're keeping it graphic and easy: your Pull&Bear Honda tee worn loose over the faded black denim shorts, anchored by the black AF1s so the whole thing reads sharp instead of casual-by-accident. The one addition is an unstructured camp-collar overshirt in soft sand — left open, sleeves pushed, it adds the layer you'll want once the wind picks up after sunset and gives the look a quieter, more tailored edge. A slim leather strap watch or a single chain is all the jewelry this needs.",
      heroPrompt: null,
      recommendationId: null,
      generatedImageUrl: null,
      quickReplies: [
        "Swap the shorts for long trousers",
        "Make it more edgy and all-black",
        "Show me a lighter layer for warm weather",
        "What shoes if the rooftop gets dressy?",
      ],
      pieces: [
        { id: "demo-1a", brand: "Pull&Bear", name: "Graphic tee", type: "top", source: "shop", retailer: "Suggested" },
        { id: "demo-1b", brand: "Levi's", name: "Faded black denim shorts", type: "bottoms", source: "shop", retailer: "Suggested" },
        { id: "demo-1c", brand: "Nike", name: "Air Force 1", type: "shoe", source: "shop", retailer: "Suggested" },
        { id: "demo-1d", brand: "COS", name: "Camp-collar overshirt", type: "outerwear", source: "shop", retailer: "Suggested" },
      ],
    },
  },
  "networking-mixer": {
    prompt: "I have a networking mixer after work, want to look sharp but approachable.",
    reply: {
      id: "demo-networking",
      role: "ai",
      title: "Composed, not corporate",
      narrative:
        "A networking mixer rewards the guy who looks composed without looking like he tried — so we build around your gray cotton tee, clean and soft, layered under an unstructured oatmeal blazer that reads intentional without a tie in sight. Dark indigo jeans keep it grounded, and clean white leather sneakers say approachable over stiff. Roll the blazer sleeves once, keep the tee tucked loosely, and you're dressed for the room without dressing past it.",
      heroPrompt: null,
      recommendationId: null,
      generatedImageUrl: null,
      quickReplies: [
        "Make it more formal",
        "I'd rather wear a shirt, not a tee",
        "What if it's an outdoor rooftop mixer?",
        "Suggest one accessory to add",
      ],
      pieces: [
        { id: "demo-2a", brand: "Uniqlo", name: "Gray cotton tee", type: "top", source: "shop", retailer: "Suggested" },
        { id: "demo-2b", brand: "COS", name: "Unstructured oatmeal blazer", type: "outerwear", source: "shop", retailer: "Suggested" },
        { id: "demo-2c", brand: "Everlane", name: "Dark indigo jeans", type: "bottoms", source: "shop", retailer: "Suggested" },
        { id: "demo-2d", brand: "Common Projects", name: "Clean white sneakers", type: "shoe", source: "shop", retailer: "Suggested" },
      ],
    },
  },
};

export default function LandingChatDemo() {
  const [turns, setTurns] = useState([]);
  const [pending, setPending] = useState(false);
  const [used, setUsed] = useState(new Set());
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function play(key) {
    if (pending) return;
    const script = SCRIPTS[key];
    if (!script) return;
    setUsed((prev) => new Set(prev).add(key));
    setTurns((prev) => [...prev, { id: `demo-user-${key}`, role: "user", text: script.prompt }]);
    setPending(true);
    timeoutRef.current = setTimeout(() => {
      setTurns((prev) => [...prev, script.reply]);
      setPending(false);
    }, 1100);
  }

  const starters = Object.entries(SCRIPTS).filter(([key]) => !used.has(key));

  return (
    <div className="glass rounded-xl3 p-5 sm:p-8">
      <div className="min-h-[120px] space-y-10">
        {turns.length === 0 && (
          <p className="py-6 text-center text-[13.5px] text-muted">
            Tap an occasion below to see helloModa style it — this is a real turn from the app,
            replayed here.
          </p>
        )}
        {turns.map((t) => (
          <MessageBubble key={t.id} message={t} onToggleSave={() => {}} savedIds={new Set()} onQuickReply={() => {}} />
        ))}
        {pending && <ThinkingLine />}
      </div>

      {starters.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
          {starters.map(([key, s]) => (
            <button
              key={key}
              onClick={() => play(key)}
              disabled={pending}
              className="glass-soft rounded-bubble-sm px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-accent-deep disabled:opacity-50"
            >
              {s.prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
