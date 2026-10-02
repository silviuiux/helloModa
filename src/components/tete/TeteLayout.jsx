"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PresenceLight from "./PresenceLight.jsx";
import TiltLook from "./TiltLook.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import { occasions } from "../../data/occasions.js";
import { ArrowRight, Heart, X, User } from "../Icons.jsx";

// design-07 — "Tête-à-tête". A one-to-one with the stylist in a bright,
// airy room with lots of white space: an editorial cover to start from
// (Welcome), slow organic forms drifting in the background (PresenceLight),
// and the conversation set large, without chat-widget chrome. Minimal chrome, everything interactive:
//  - type anywhere: any key focuses the composer; words appear large, in
//    a handwritten-feeling serif, and the line beneath fills as you write;
//    every keystroke makes the light lean in. Tab borrows one of the
//    stylist's suggestions so you can edit it before sending.
//  - depth of field: the moment you're reading is sharp, the rest of the
//    conversation softens and dims with distance (hover brings it back).
//  - each look is a photograph you can handle (TiltLook): it develops,
//    tilts, turns over to its pieces, and double-tap keeps it.
//  - everything else sits behind one quiet menu (⌘K / Ctrl+K).
// Same `shell` contract as the other /design-0X layouts: identical data,
// sending, image generation, quotas, history, avatars and wardrobe.

const INK = "#2b2633";
const OPENERS = ["rooftop-birthday", "first-date", "big-interview"]
  .map((slug) => occasions.find((o) => o.slug === slug))
  .filter(Boolean);

const THINKING_LINES = [
  "Looking through your wardrobe…",
  "Thinking about the light there…",
  "Trying something on you…",
  "Weighing one more detail…",
  "Almost — let me get this right…",
];

function firstName(userDisplayName, userEmail) {
  if (userDisplayName) return userDisplayName.split(" ")[0];
  if (!userEmail) return null;
  const cleaned = userEmail.split("@")[0].replace(/[._-]+/g, " ").trim().split(" ")[0];
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : null;
}

function streamTiming(text) {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const step = Math.min(34, 2600 / Math.max(1, words));
  return { step, total: Math.round(words * step) };
}

function Streamed({ text, fresh, className }) {
  if (!fresh) return <p className={className}>{text}</p>;
  const { step } = streamTiming(text);
  let i = 0;
  return (
    <p className={className}>
      {text.split(/(\s+)/).map((w, k) =>
        /^\s+$/.test(w) ? (
          w
        ) : (
          <span key={k} className="animate-word-in inline-block" style={{ animationDelay: `${i++ * step}ms` }}>
            {w}
          </span>
        )
      )}
    </p>
  );
}

function Whisper({ children, className = "" }) {
  return (
    <p className={`text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/40 ${className}`}>{children}</p>
  );
}

// ── The welcome: an editorial cover ─────────────────────────────────────
// Direct request 2026-10-02: no "intimate" copy — a magazine-cover hero
// instead, with the occasion carousels the main app once had. A masthead
// line, an oversized serif headline whose last line cycles through
// occasions, a short standfirst, then two image rows: a scroll-snap
// carousel of every occasion (tap one to start) and a slow marquee of
// things people actually ask.
const COVER_LINES = [
  "the first date.",
  "the big interview.",
  "the black-tie gala.",
  "the rooftop birthday.",
  "the weekend away.",
  "the garden party.",
  "whatever's next.",
];

const ASKS = [
  { q: "Black-tie gala on Saturday — but I hate heels", slug: "black-tie-event" },
  { q: "Beach weekend, carry-on only. What do I pack?", slug: "weekend-trip" },
  { q: "Presenting to the leadership team on Thursday", slug: "big-interview" },
  { q: "First date at a wine bar, not too try-hard", slug: "first-date" },
  { q: "My sister's garden wedding, it might rain", slug: "garden-party" },
  { q: "Gallery opening, I want to look effortless", slug: "museum-date" },
];

const EDGE = "max(1.5rem, calc((100vw - 1240px) / 2 + 2.5rem))";

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Welcome({ name, lastConversation, onSelectConversation, onSend, stylingFor }) {
  const [dateLine, setDateLine] = useState("");
  const [line, setLine] = useState(0);
  // Data order on the server, shuffled after mount — no hydration mismatch.
  const [cards, setCards] = useState(occasions);
  const railRef = useRef(null);

  useEffect(() => {
    const d = new Date();
    setDateLine(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }));
    setCards(shuffled(occasions));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setLine((v) => (v + 1) % COVER_LINES.length), 2800);
    return () => clearInterval(id);
  }, []);

  // Reordering keyed cards makes scroll-snap hold on to the card it had
  // snapped to (now at the far end) — start from the beginning instead.
  useEffect(() => {
    if (railRef.current) railRef.current.scrollLeft = 0;
  }, [cards]);

  function page(dir) {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: "smooth" });
  }

  const meta = "text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45";
  const asks = [...ASKS, ...ASKS];

  return (
    <section data-moment className="tete-moment w-full pb-10 pt-24 sm:pt-28">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        {/* Masthead */}
        <div className={`animate-fade-in flex items-center justify-between border-b border-[#2b2633]/10 pb-3 ${meta}`}>
          <span>The Edit{name ? ` · for ${name}` : ""}</span>
          <span className="hidden sm:inline">{dateLine || " "}</span>
          <span>Nº {String(occasions.length).padStart(2, "0")} occasions</span>
        </div>

        {/* Full-width cover line; the last line cycles through occasions and
            never wraps on desktop, so nothing below it jumps. */}
        <h1
          className="animate-fade-up mt-10 font-script text-[clamp(52px,8vw,128px)] leading-[0.92] tracking-[-0.02em] text-[#2b2633] sm:mt-14"
          style={{ animationDelay: "100ms" }}
        >
          Dressed for
          <br />
          <span key={line} className="animate-word-in inline-block min-h-[1.84em] italic text-[#8f78e8] sm:min-h-0 sm:whitespace-nowrap">
            {COVER_LINES[line]}
          </span>
        </h1>

        <div
          className="animate-fade-up mt-10 grid gap-8 border-t border-[#2b2633]/10 pt-6 sm:grid-cols-[minmax(0,420px)_1fr] sm:gap-16"
          style={{ animationDelay: "240ms" }}
        >
          <div>
            <p className={meta}>The brief</p>
            <p className="mt-3 text-[15.5px] leading-[1.7] text-[#2b2633]/70">
              Name the occasion, the weather or the mood. Each look starts in your own wardrobe, is
              painted on you, and only reaches for something new when it&apos;s genuinely missing
              {stylingFor ? ` — styling ${stylingFor} today` : ""}.
            </p>
          </div>
          {lastConversation && (
            <button
              onClick={() => onSelectConversation(lastConversation.id)}
              className="group block min-w-0 text-left sm:justify-self-end sm:text-right"
            >
              <span className={meta}>Continue where you left off</span>
              <span className="mt-2 block max-w-[440px] truncate font-script text-[22px] italic text-[#2b2633]/80 transition-colors group-hover:text-[#8f78e8]">
                {lastConversation.title} →
              </span>
            </button>
          )}
        </div>

        {/* Carousel header */}
        <div className="mt-16 flex items-end justify-between border-b border-[#2b2633]/10 pb-3 sm:mt-20">
          <p className={meta}>The occasions<span className="hidden sm:inline"> — tap one to begin</span></p>
          <div className="flex gap-2">
            {[
              [-1, "Previous occasions", "←"],
              [1, "More occasions", "→"],
            ].map(([dir, label, glyph]) => (
              <button
                key={dir}
                onClick={() => page(dir)}
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full text-[15px] text-[#2b2633]/60 ring-1 ring-[#2b2633]/10 transition-colors hover:bg-white hover:text-[#2b2633]"
              >
                {glyph}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel 1: every occasion, full-bleed, scroll-snap. */}
      <div
        ref={railRef}
        className="scroll-area mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] sm:gap-7"
        // Lines the first card up with the 1240px column, then runs full-bleed.
        style={{ paddingInline: EDGE, scrollPaddingInline: EDGE }}
      >
        {cards.map((c, i) => (
          <button
            key={c.slug}
            onClick={() => onSend(c.prompt)}
            className="group w-[62vw] shrink-0 snap-start text-left sm:w-[300px]"
          >
            <span className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-[#f3eff8] shadow-[0_30px_60px_-40px_rgba(90,70,160,0.45)]">
              <PlaceholderImage
                src={`/occasions/${c.slug}-hero.jpg`}
                seed={c.slug}
                width={600}
                height={750}
                className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </span>
            <span className={`mt-4 flex items-baseline justify-between ${meta}`}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span className="opacity-0 transition-opacity group-hover:opacity-100">Style this →</span>
            </span>
            <span className="mt-1 block font-script text-[24px] leading-tight text-[#2b2633] sm:text-[26px]">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Carousel 2: what people ask — a slow marquee of pull quotes. */}
      <div className="mx-auto mt-14 max-w-[1240px] px-6 sm:px-10">
        <p className={`border-b border-[#2b2633]/10 pb-3 ${meta}`}>Overheard — or ask your own</p>
      </div>
      <div className="relative mt-6 w-full overflow-hidden">
        <div className="animate-marquee flex w-max gap-5 hover:[animation-play-state:paused]">
          {asks.map((a, i) => (
            <button
              key={`${a.slug}-${i}`}
              onClick={() => onSend(a.q)}
              tabIndex={i >= ASKS.length ? -1 : 0}
              aria-hidden={i >= ASKS.length ? "true" : undefined}
              className="group relative aspect-[3/2] w-[300px] shrink-0 overflow-hidden rounded-[16px] text-left"
            >
              <PlaceholderImage
                src={`/occasions/${a.slug}-hero.jpg`}
                seed={`ask-${a.slug}`}
                width={600}
                height={400}
                className="transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-[#2b2633]/70 via-[#2b2633]/15 to-transparent" />
              <span className="absolute inset-x-4 bottom-3.5 font-script text-[19px] italic leading-snug text-white">
                “{a.q}”
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-[1240px] px-6 text-[12px] text-[#2b2633]/35 sm:px-10">
        Or just start typing — anywhere.
      </p>
    </section>
  );
}

// ── One stylist look ────────────────────────────────────────────────────
function LookMoment({ message, isLatest, onSend, onKeepLook, onToggleSave, savedIds }) {
  const image = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });
  const [flipped, setFlipped] = useState(false);
  // Kept looks persist (outfit_recommendations.kept_at) and show up in the
  // style journal's Kept section — AppShell owns the optimistic update.
  const liked = Boolean(message.kept);
  const setKept = (value) => onKeepLook?.(message.recommendationId, value);
  const pieces = message.pieces || [];
  const after = message.fresh ? streamTiming(message.narrative).total + 300 : 0;

  async function share() {
    const text = `${message.title} — ${message.narrative}\n\nStyled by helloModa.`;
    try {
      if (navigator.share) await navigator.share({ text, title: message.title });
      else await navigator.clipboard.writeText(text);
    } catch {
      // cancelled / unavailable
    }
  }

  const action = "text-[11px] font-medium uppercase tracking-[0.2em] transition-colors";

  return (
    <section data-moment className="tete-moment mx-auto max-w-[620px] px-6 py-24">
      <div className="animate-fade-up">
        <TiltLook
          image={image}
          seed={message.recommendationId || message.id}
          title={message.title}
          pieces={pieces}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          liked={liked}
          onKeep={() => !liked && setKept(true)}
          onToggleSave={onToggleSave}
          savedIds={savedIds}
        />
        <p className="mt-4 text-center text-[11.5px] text-[#2b2633]/30">
          {pieces.length ? "Turn it over for the pieces · double-tap to keep it" : "Double-tap to keep it"}
        </p>
      </div>

      <div className="mt-14 text-center">
        {message.title && (
          <h2
            className="animate-fade-up font-script text-[42px] leading-[1.02] sm:text-[52px]"
            style={{ color: INK, animationDelay: message.fresh ? "150ms" : "0ms" }}
          >
            {message.title}
          </h2>
        )}
        {message.narrative && (
          <Streamed
            text={message.narrative}
            fresh={message.fresh}
            className="mx-auto mt-5 max-w-[34rem] text-left text-[16.5px] leading-[1.8] text-[#2b2633]/75 sm:text-center"
          />
        )}
      </div>

      {image.settled && (
        <div
          className="animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          style={{ animationDelay: `${after}ms` }}
        >
          <button
            onClick={() => setKept(!liked)}
            aria-pressed={liked}
            className={`${action} flex items-center gap-1.5 ${liked ? "text-[#e46d92]" : "text-[#2b2633]/45 hover:text-[#2b2633]"}`}
          >
            <Heart size={13} fill={liked ? "currentColor" : "none"} />
            {liked ? "Kept" : "Keep"}
          </button>
          {pieces.length > 0 && (
            <button onClick={() => setFlipped((f) => !f)} className={`${action} text-[#2b2633]/45 hover:text-[#2b2633]`}>
              {flipped ? "The photo" : `The pieces (${pieces.length})`}
            </button>
          )}
          <button
            onClick={() => onSend("Restyle this — show me a different direction for the same occasion.")}
            className={`${action} text-[#2b2633]/45 hover:text-[#2b2633]`}
          >
            Restyle
          </button>
          <button onClick={share} className={`${action} text-[#2b2633]/45 hover:text-[#2b2633]`}>
            Share
          </button>
        </div>
      )}

      {image.settled && message.quickReplies?.length > 0 && (
        <ul className="mx-auto mt-12 max-w-md space-y-1">
          {message.quickReplies.map((q, i) => (
            <li key={q} className="animate-fade-up" style={{ animationDelay: `${after + 150 + i * 90}ms` }}>
              <button
                onClick={() => onSend(q)}
                className="group flex w-full items-baseline justify-center gap-3 py-1.5 font-script text-[19px] italic text-[#2b2633]/40 transition-colors hover:text-[#2b2633]"
              >
                <span className="text-[13px] not-italic text-[#c9b8ff]/0 transition-colors group-hover:text-[#c9b8ff]">→</span>
                {q}
              </button>
            </li>
          ))}
          {isLatest && (
            <li className="pt-2 text-center text-[11.5px] text-[#2b2633]/25 [@media(hover:none)]:hidden">
              or press Tab to borrow one
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function ThinkingMoment() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % THINKING_LINES.length), 2300);
    return () => clearInterval(id);
  }, []);
  return (
    <section data-moment className="tete-moment mx-auto flex max-w-[620px] flex-col items-center px-6 py-24">
      <span className="tete-breathe block h-3 w-3 rounded-full bg-[#8f78e8] shadow-[0_0_28px_8px_rgba(185,164,255,0.45)]" />
      <p key={i} className="animate-word-in mt-6 font-script text-[22px] italic text-[#2b2633]/60" aria-live="polite">
        {THINKING_LINES[i]}
      </p>
    </section>
  );
}

// ── The composer ────────────────────────────────────────────────────────
function Composer({ inputRef, onSend, thinking, setComposing, energyRef, suggestions }) {
  const [value, setValue] = useState("");
  const [ghost, setGhost] = useState(null);
  const suggestionIndex = useRef(-1);
  const hasDraft = value.trim().length > 0;

  useEffect(() => setComposing?.(hasDraft), [hasDraft, setComposing]);

  // Grow with the text, up to ~4 lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 170)}px`;
  }, [value, inputRef]);

  function send() {
    const text = value.trim();
    if (!text || thinking) return;
    setGhost({ id: Date.now(), text });
    onSend(text);
    setValue("");
    suggestionIndex.current = -1;
    energyRef.current = 1;
    setTimeout(() => setGhost(null), 800);
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "Tab" && !e.shiftKey && suggestions.length && (!value.trim() || suggestions.includes(value))) {
      e.preventDefault();
      suggestionIndex.current = (suggestionIndex.current + 1) % suggestions.length;
      setValue(suggestions[suggestionIndex.current]);
      energyRef.current = Math.min(1, energyRef.current + 0.3);
      return;
    }
    if (e.key === "Escape") {
      setValue("");
      e.currentTarget.blur();
      return;
    }
    if (e.key.length === 1) energyRef.current = Math.min(1, energyRef.current + 0.16);
  }

  const fill = hasDraft ? Math.min(100, 6 + value.length * 1.4) : 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#fdfcfa] from-50% via-[#fdfcfa]/85 to-transparent pt-24">
      <div className="pointer-events-auto relative mx-auto max-w-[680px] px-6 pb-6 sm:pb-8">
        {ghost && (
          <p
            key={ghost.id}
            className="tete-send pointer-events-none absolute inset-x-6 bottom-16 text-center font-script text-[26px] italic"
            style={{ color: INK }}
          >
            {ghost.text}
          </p>
        )}
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Tell the stylist where you're going"
            placeholder={thinking ? "…" : "Tell me where you're going…"}
            // Symmetric room for the send button only once there's a draft,
            // so the placeholder fits one line on a phone and centred text
            // never shifts sideways when the button appears.
            className={`tete-caret block max-h-[170px] min-h-[44px] w-full resize-none bg-transparent py-1.5 text-center font-script text-[24px] italic leading-snug placeholder:text-[#2b2633]/25 focus:outline-none sm:text-[28px] ${
              hasDraft ? "px-12" : "px-0"
            }`}
            style={{ color: INK }}
          />
          <button
            onClick={send}
            aria-label="Send"
            disabled={!hasDraft || thinking}
            className={`absolute bottom-1 right-0 grid h-10 w-10 place-items-center rounded-full transition-all duration-300 ${
              hasDraft && !thinking
                ? "scale-100 bg-[#2b2633] text-[#fdfcfa] opacity-100"
                : "pointer-events-none scale-75 bg-transparent text-transparent opacity-0"
            }`}
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="relative mt-2 h-px bg-[#2b2633]/[0.08]">
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c9b8ff] to-transparent transition-[width] duration-500 ease-out"
            style={{ width: `${thinking ? 100 : fill}%`, opacity: thinking ? 0.5 : 0.9 }}
          />
        </div>
        <div className="mt-2.5 flex justify-center gap-5 text-[11px] text-[#2b2633]/25">
          {hasDraft ? (
            <span>↵ to send · ⇧↵ new line</span>
          ) : (
            <>
              {suggestions.length > 0 && <span className="[@media(hover:none)]:hidden">⇥ for a suggestion</span>}
              <span className="hidden sm:inline">⌘K for everything else</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── The menu: everything that isn't the conversation ───────────────────
function Menu({ shell, onClose }) {
  const {
    setView,
    wardrobe,
    onNewChat,
    conversations,
    activeConversationId,
    onSelectConversation,
    avatarProfiles,
    activeAvatarId,
    onSelectAvatar,
    shareText,
    journalHref,
    onSignOut,
    userEmail,
  } = shell;
  const go = (fn) => () => {
    fn();
    onClose();
  };
  async function share() {
    const text = shareText || "Styled by helloModa — the AI stylist that starts in your closet.";
    try {
      if (navigator.share) await navigator.share({ text, title: "helloModa" });
      else await navigator.clipboard.writeText(text);
    } catch {
      // cancelled / unavailable
    }
  }
  const big = "block w-full py-1.5 text-left font-script text-[30px] leading-tight text-[#2b2633]/80 transition-colors hover:text-[#2b2633] sm:text-[34px]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="animate-fade-in fixed inset-0 z-50 overflow-y-auto bg-[#fdfcfa]/80 backdrop-blur-2xl"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close menu"
        className="fixed right-5 top-5 grid h-10 w-10 place-items-center rounded-full text-[#2b2633]/60 hover:text-[#2b2633]"
      >
        <X size={20} />
      </button>
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-8 py-20" onClick={(e) => e.stopPropagation()}>
        <button onClick={go(onNewChat)} className={big}>
          A new conversation
        </button>
        <button onClick={go(() => setView("wardrobe"))} className={big}>
          Your wardrobe <span className="text-[18px] text-[#2b2633]/35">{wardrobe.length}</span>
        </button>
        <Link href={journalHref || "/outfits"} className={big}>
          Your style journal
        </Link>
        <button onClick={go(share)} className={big}>
          Share this look
        </button>

        {avatarProfiles?.length > 0 && (
          <>
            <Whisper className="mt-10">Styling for</Whisper>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ id: null, label: "No avatar" }, ...avatarProfiles.map((a) => ({ id: a.id, label: a.is_self ? "Myself" : a.display_name }))].map(
                (o) => (
                  <button
                    key={o.id || "none"}
                    onClick={() => onSelectAvatar(o.id)}
                    className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                      o.id === (activeAvatarId || null)
                        ? "bg-[#2b2633] text-[#fdfcfa]"
                        : "bg-[#2b2633]/[0.06] text-[#2b2633]/60 hover:text-[#2b2633]"
                    }`}
                  >
                    {o.label}
                  </button>
                )
              )}
            </div>
          </>
        )}

        {conversations.length > 0 && (
          <>
            <Whisper className="mt-10">Pick up where we left off</Whisper>
            <ul className="mt-2">
              {conversations.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={go(() => onSelectConversation(c.id))}
                    className={`block w-full truncate py-1 text-left font-script text-[19px] italic transition-colors ${
                      c.id === activeConversationId ? "text-[#8f78e8]" : "text-[#2b2633]/50 hover:text-[#2b2633]"
                    }`}
                  >
                    {c.title || "Untitled look"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-[#2b2633]/40">
          <Link href="/profile" className="hover:text-[#2b2633]">
            Profile
          </Link>
          <Link href="/avatars" className="hover:text-[#2b2633]">
            Avatars
          </Link>
          {userEmail && (
            <form action={onSignOut}>
              <button type="submit" className="hover:text-[#2b2633]">
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeteLayout({ shell }) {
  const {
    view,
    setView,
    wardrobe,
    messages,
    thinking,
    isSwitching,
    onSend,
    setComposing,
    conversations,
    activeConversationId,
    onSelectConversation,
    userEmail,
    userDisplayName,
    avatarProfiles,
    activeAvatarId,
    wardrobeActions,
  } = shell;

  const energyRef = useRef(0);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const name = firstName(userDisplayName, userEmail);
  const activeAvatar = avatarProfiles?.find((a) => a.id === activeAvatarId) || null;
  const stylingFor = activeAvatar && !activeAvatar.is_self ? activeAvatar.display_name : null;
  const lastConversation = messages.length === 0 ? conversations.find((c) => c.title) || null : null;

  const looks = useMemo(() => messages.filter((m) => m.role === "ai" && (m.title || m.heroPrompt)), [messages]);
  const latestLook = looks[looks.length - 1];
  const suggestions = latestLook?.quickReplies?.length ? latestLook.quickReplies : OPENERS.map((o) => o.prompt);

  // Type anywhere → the composer. ⌘K/Ctrl+K → menu. Esc closes things.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenuOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      const t = e.target;
      const inField = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      // Already handled (e.g. Space flipping a focused look), or a space that
      // would only ever type a leading blank — leave focus where it is.
      if (inField || menuOpen || view !== "chat" || e.defaultPrevented || e.key === " ") return;
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, view]);

  // Depth of field: each moment's sharpness and brightness follow its
  // distance from a focus line ~42% down the viewport. Written straight to
  // the DOM in one rAF per scroll — no re-renders.
  const applyFocus = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const focusY = box.top + box.height * 0.42;
    root.querySelectorAll("[data-moment]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const nearest = Math.max(r.top, Math.min(focusY, r.bottom));
      const f = Math.max(0, 1 - Math.abs(nearest - focusY) / (box.height * 0.55));
      el.style.opacity = String(0.16 + 0.84 * f);
      el.style.filter = f > 0.9 ? "none" : `blur(${((1 - f) * 2.6).toFixed(2)}px)`;
    });
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    let raf = 0;
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), applyFocus()));
    };
    schedule();
    root.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [applyFocus, messages.length, thinking]);

  // Bring the newest moment up to the focus line as it arrives.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (messages.length === 0 && !thinking) {
      root.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const moments = root.querySelectorAll("[data-moment]");
    const last = moments[moments.length - 1];
    if (last) root.scrollTo({ top: Math.max(0, last.offsetTop - root.clientHeight * 0.16), behavior: "smooth" });
  }, [messages.length, thinking]);

  const savedIds = new Set(
    wardrobe
      .filter((it) => typeof it.id === "string" && it.id.startsWith("saved-"))
      .map((it) => it.id.slice("saved-".length))
  );
  function handleToggleSave(piece) {
    if (savedIds.has(piece.id)) wardrobeActions.onRemove(`saved-${piece.id}`);
    else wardrobeActions.onAdd(cardToWardrobeItem(piece));
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#fdfcfa] font-sans" style={{ color: INK }}>
      <PresenceLight energyRef={energyRef} thinking={thinking} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#fdfcfa] from-30% to-transparent"
      />
      {/* Top: just a name and a way into everything else. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-7">
        <span className="pointer-events-auto flex items-center gap-2.5 font-script text-[22px] italic text-[#2b2633]/80">
          <span className="tete-breathe block h-2 w-2 rounded-full bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.5)]" />
          helloModa
        </span>
        <button
          onClick={() => setMenuOpen(true)}
          className="pointer-events-auto flex items-center gap-3 rounded-full py-1 pl-1 pr-4 text-[12.5px] text-[#2b2633]/55 bg-white/60 ring-1 ring-[#2b2633]/[0.07] backdrop-blur-md transition-colors hover:text-[#2b2633] hover:ring-[#2b2633]/20"
        >
          <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-[#2b2633]/[0.08]">
            {activeAvatar?.avatar_image_signed_url ? (
              <img src={activeAvatar.avatar_image_signed_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={15} />
            )}
          </span>
          Menu
          <kbd className="hidden font-sans text-[11px] text-[#2b2633]/30 sm:inline">⌘K</kbd>
        </button>
      </header>

      {/* The conversation */}
      <main ref={scrollRef} className="scroll-area relative z-10 h-full overflow-y-auto pb-[42vh] [scrollbar-width:none]">
        <Welcome
          name={name}
          lastConversation={lastConversation}
          onSelectConversation={onSelectConversation}
          onSend={onSend}
          stylingFor={stylingFor}
        />

        {isSwitching && messages.length === 0 && (
          <p className="text-center font-script text-[20px] italic text-[#2b2633]/40">Finding our conversation…</p>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <section key={m.id} data-moment className="tete-moment mx-auto max-w-[620px] px-6 pt-28 text-center">
                <Whisper>You</Whisper>
                <p className="animate-fade-up mt-3 font-script text-[26px] italic leading-snug text-[#8f78e8]/85 sm:text-[30px]">
                  “{m.text}”
                </p>
              </section>
            );
          }
          if (!m.title && !m.heroPrompt) {
            return (
              <section key={m.id} data-moment className="tete-moment mx-auto max-w-[640px] px-6 py-10 text-center">
                <p className="animate-fade-up font-script text-[21px] italic leading-snug text-[#c2577a]/85">{m.narrative}</p>
              </section>
            );
          }
          return (
            <LookMoment
              key={m.id}
              message={m}
              isLatest={m.id === latestLook?.id}
              onSend={onSend}
              onKeepLook={shell.onKeepLook}
              onToggleSave={handleToggleSave}
              savedIds={savedIds}
            />
          );
        })}

        {thinking && <ThinkingMoment />}
      </main>

      {/* A whisper of grain, so the white reads as paper, not screen. */}
      <div aria-hidden="true" className="tete-grain pointer-events-none fixed inset-0 z-[15]" />

      {view === "chat" && (
        <Composer
          inputRef={inputRef}
          onSend={onSend}
          thinking={thinking}
          setComposing={setComposing}
          energyRef={energyRef}
          suggestions={suggestions}
        />
      )}

      {menuOpen && <Menu shell={shell} onClose={() => setMenuOpen(false)} />}

      {view === "wardrobe" && (
        <div className="animate-fade-in fixed inset-0 z-40 flex flex-col bg-[#f5f3fa] text-ink">
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            <p className="font-script text-[26px] italic">Your wardrobe</p>
            <button
              onClick={() => setView("chat")}
              aria-label="Back to the conversation"
              className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <WardrobeView
              items={wardrobe}
              onAdd={wardrobeActions.onAdd}
              onToggleFav={wardrobeActions.onToggleFav}
              onRemove={wardrobeActions.onRemove}
              onSetPrice={wardrobeActions.onSetPrice}
              onLogWear={wardrobeActions.onLogWear}
            />
          </div>
        </div>
      )}
    </div>
  );
}
