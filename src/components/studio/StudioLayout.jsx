"use client";

import { useEffect, useRef, useState } from "react";
import SideMenu from "./SideMenu.jsx";
import LookCard from "./LookCard.jsx";
import Orb from "../Orb.jsx";
import ThinkingLine from "../chat/ThinkingLine.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import { ArrowRight } from "../Icons.jsx";
import { occasions } from "../../data/occasions.js";
import { cardToWardrobeItem } from "../../lib/look.js";

// Design exploration, branch design/chat-studio-sidebar — "Studio".
// Layout: collapsible side menu (SideMenu.jsx) holding every action, and a
// calm, neutral workspace beside it — a slim header with the current
// look's name, a centred column of look cards, and a docked composer that
// is only a composer (no nav icons around it any more).

const PROMPTS = [
  "Black-tie gala on Saturday — but I hate heels",
  "Beach weekend, carry-on only. What do I pack?",
  "Presenting to the leadership team on Thursday",
  "First date at a wine bar, not too try-hard",
];

const COLLAPSE_KEY = "hm.studio.sidebarCollapsed";

function firstName(userDisplayName, userEmail) {
  if (userDisplayName) return userDisplayName;
  if (!userEmail) return null;
  const cleaned = userEmail.split("@")[0].replace(/[._-]+/g, " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : null;
}

function Welcome({ name, onPrompt }) {
  const [greeting, setGreeting] = useState("Hello");
  const [showAll, setShowAll] = useState(false);
  // Time-of-day greeting set after mount, so server and client markup match.
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  const tiles = showAll ? occasions : occasions.slice(0, 6);

  return (
    <div className="animate-fade-up pb-10 pt-10 sm:pt-16">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[44px]">
        {greeting}
        {name ? `, ${name}` : ""}.
      </h1>
      <p className="mt-2 max-w-lg text-[15.5px] leading-relaxed text-muted">
        What are we dressing for? Tell me the occasion, the vibe or the weather — I&apos;ll build the look from
        your wardrobe and paint it on you.
      </p>

      <div className="mt-10 flex items-baseline justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-faint">Start from an occasion</h2>
        <button onClick={() => setShowAll((v) => !v)} className="text-[13px] font-medium text-accent-deep hover:underline">
          {showAll ? "Show fewer" : `Show all ${occasions.length}`}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((o) => (
          <button key={o.slug} onClick={() => onPrompt(o.prompt)} className="group text-left">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f1eff5]">
              <PlaceholderImage
                src={`/occasions/${o.slug}-hero.jpg`}
                seed={o.slug}
                width={600}
                height={450}
                className="transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <p className="mt-2 text-[14px] font-medium text-ink">{o.label}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.12em] text-faint">Or ask something specific</h2>
      <div className="mt-3 divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[14.5px] text-ink transition-colors hover:bg-accent-tint/50"
          >
            {p}
            <ArrowRight size={15} className="shrink-0 text-faint transition-colors group-hover:text-accent-deep" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({ onSend, sending, setComposing }) {
  const [value, setValue] = useState("");
  const hasDraft = value.trim().length > 0;
  useEffect(() => setComposing?.(hasDraft), [hasDraft, setComposing]);

  function submit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending) return;
    onSend(text);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl px-4 pb-5 sm:px-8">
      <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white py-2 pl-5 pr-2 shadow-[0_12px_40px_-24px_rgba(30,26,46,0.45)] transition-colors focus-within:border-accent">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={sending}
          placeholder={sending ? "Styling your look…" : "Describe the occasion, the vibe, the weather…"}
          className="h-11 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!hasDraft || sending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-white transition-colors hover:bg-accent-deep disabled:bg-black/[0.08] disabled:text-faint"
        >
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}

export default function StudioLayout({ shell }) {
  const {
    view,
    wardrobe,
    messages,
    thinking,
    isSwitching,
    onSend,
    conversations,
    activeConversationId,
    userEmail,
    userDisplayName,
    setComposing,
    wardrobeActions,
  } = shell;

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  // Remembered per browser — a convenience, never required.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // storage unavailable — default expanded
    }
  }, []);
  function toggleCollapsed() {
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      } catch {
        // ignore
      }
      return !v;
    });
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length === 0 && !thinking) el.scrollTo({ top: 0 });
    else el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const savedIds = new Set(
    wardrobe
      .filter((it) => typeof it.id === "string" && it.id.startsWith("saved-"))
      .map((it) => it.id.slice("saved-".length))
  );
  function handleToggleSave(piece) {
    if (savedIds.has(piece.id)) wardrobeActions.onRemove(`saved-${piece.id}`);
    else wardrobeActions.onAdd(cardToWardrobeItem(piece));
  }

  const activeTitle =
    view === "wardrobe"
      ? "Wardrobe"
      : conversations.find((c) => c.id === activeConversationId)?.title || (messages.length ? "Current look" : "New look");
  const name = firstName(userDisplayName, userEmail);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f6f3] font-sans text-ink">
      {/* Desktop: persistent, collapsible */}
      <div className="hidden md:flex">
        <SideMenu shell={shell} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </div>

      {/* Mobile: off-canvas drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="animate-fade-in absolute inset-0 bg-ink/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative h-full animate-fade-in">
            <SideMenu shell={shell} mobile onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-[#f7f6f3]/80 px-4 backdrop-blur sm:px-8">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-black/[0.04] md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{activeTitle}</h1>
          {thinking && (
            <span className="flex items-center gap-2 text-[12.5px] font-medium text-accent-deep">
              <Orb size={16} mini state="thinking" />
              Styling…
            </span>
          )}
        </header>

        {view === "wardrobe" ? (
          <div key="wardrobe" className="animate-fade-in flex min-h-0 flex-1 flex-col">
            <WardrobeView
              items={wardrobe}
              onAdd={wardrobeActions.onAdd}
              onToggleFav={wardrobeActions.onToggleFav}
              onRemove={wardrobeActions.onRemove}
              onSetPrice={wardrobeActions.onSetPrice}
              onLogWear={wardrobeActions.onLogWear}
            />
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
                {messages.length === 0 && !isSwitching ? (
                  <Welcome name={name} onPrompt={onSend} />
                ) : (
                  <div className="space-y-10 py-10">
                    {messages.map((m) =>
                      m.role === "user" ? (
                        <div key={m.id} className="animate-fade-up flex justify-end">
                          <p className="max-w-md rounded-2xl rounded-br-md bg-ink px-5 py-3 text-[15px] leading-relaxed text-white">
                            {m.text}
                          </p>
                        </div>
                      ) : !m.title && !m.heroPrompt ? (
                        <div key={m.id} className="animate-fade-up flex items-start gap-3">
                          <Orb size={22} mini className="mt-2" />
                          <p className="max-w-md rounded-2xl rounded-tl-md border border-black/[0.06] bg-white px-5 py-3 text-[15px] leading-relaxed text-ink">
                            {m.narrative}
                          </p>
                        </div>
                      ) : (
                        <LookCard
                          key={m.id}
                          message={m}
                          onQuickReply={onSend}
                          onToggleSave={handleToggleSave}
                          savedIds={savedIds}
                        />
                      )
                    )}
                    {thinking && <ThinkingLine />}
                  </div>
                )}
              </div>
            </div>
            <Composer onSend={onSend} sending={thinking} setComposing={setComposing} />
          </>
        )}
      </div>
    </div>
  );
}
