"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PresenceLight from "./PresenceLight.jsx";
import TiltLook from "./TiltLook.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import BlobGallery from "./BlobGallery.jsx";
import HandwrittenCycle from "./HandwrittenCycle.jsx";
import CursorThumb from "./CursorThumb.jsx";
import AboutSections from "./AboutSections.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import { occasions } from "../../data/occasions.js";
import { ArrowRight, Heart, X, User } from "../Icons.jsx";

// design-07 — "Tête-à-tête". A one-to-one with the stylist in a bright,
// airy room with lots of white space: a minimal welcome with occasion
// photos drifting as organic blobs that reveal on hover (BlobGallery),
// soft colour washes behind (PresenceLight), and the conversation set
// large, without chat-widget chrome. Minimal chrome, everything interactive:
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

// ── The welcome ──────────────────────────────────────────────────────────
// Back to the clean, centred light version (direct request 2026-10-02),
// without "intimate" copy: a date line, a serif headline whose italic last
// line cycles through occasions, one line of what helloModa does, and a
// few occasion photographs drifting in the margins as organic blobs that
// reveal on hover (BlobGallery).
const COVER_LINES = [
  "the first date.",
  "the big interview.",
  "the black-tie gala.",
  "the rooftop birthday.",
  "the weekend away.",
  "the garden party.",
  "whatever's next.",
];

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// "today", "tomorrow", "Saturday", or "9 Oct" for further out.
function bookedWhen(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((day - today) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff < 7) return day.toLocaleDateString("en-GB", { weekday: "long" });
  return day.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// The landing page's explanations, under the welcome. Open when you
// arrive; once a conversation starts they fold away under a toggle title
// so the thread stays the focus (direct request 2026-10-02).
function AboutPanel({ showcase, folded }) {
  const [open, setOpen] = useState(!folded);
  useEffect(() => setOpen(!folded), [folded]);
  return (
    <section id="about" data-moment className="tete-moment scroll-mt-20">
      <div className="mx-auto max-w-[620px] px-6 text-center">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="group inline-flex items-center gap-3 py-6 text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45 transition-colors hover:text-[#8f78e8]"
        >
          <span className="h-px w-8 bg-[#2b2633]/15 transition-all group-hover:w-12 group-hover:bg-[#8f78e8]/50" />
          {open ? "About helloModa" : "How helloModa works"}
          <span className={`inline-block transition-transform duration-300 ${open ? "rotate-180" : ""}`}>⌄</span>
          <span className="h-px w-8 bg-[#2b2633]/15 transition-all group-hover:w-12 group-hover:bg-[#8f78e8]/50" />
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <AboutSections showcase={showcase} />
        </div>
      </div>
    </section>
  );
}

function Welcome({ lastConversation, onSelectConversation, onSend, stylingFor, occasionImages = {}, covers = {}, nextBooked = null }) {
  const [touch, setTouch] = useState(false);
  // Data order on the server, shuffled after mount — no hydration mismatch.
  const [picks, setPicks] = useState(occasions.slice(0, 5));

  useEffect(() => {
    // Occasions the user already has a generated look for come first, so
    // the blobs show their own looks wherever possible.
    const mine = shuffled(occasions.filter((o) => occasionImages[o.slug]));
    const rest = shuffled(occasions.filter((o) => !occasionImages[o.slug]));
    setPicks([...mine, ...rest].slice(0, 5));
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  return (
    <section data-moment className="tete-moment relative min-h-[100svh] w-full">
      <BlobGallery items={picks} images={occasionImages} onPick={(o) => onSend(o.prompt)} />
      <div className="pointer-events-none relative mx-auto flex min-h-[100svh] max-w-[620px] flex-col justify-center px-6 pb-24 pt-28 text-center sm:pt-32">
        <h1
          className="animate-fade-up font-script text-[52px] leading-[1] tracking-[-0.01em] text-[#2b2633] sm:text-[76px]"
          style={{ animationDelay: "120ms" }}
        >
          Dressed for
          <br />
          <span className="inline-block min-h-[2.1em] sm:min-h-0">
            <HandwrittenCycle lines={COVER_LINES} className="leading-[1.15] text-[#8f78e8] sm:whitespace-nowrap" />
          </span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-6 max-w-md text-balance text-[15.5px] leading-[1.7] text-[#2b2633]/60"
          style={{ animationDelay: "260ms" }}
        >
          Name the occasion. Looks start in your own wardrobe
          {stylingFor ? ` — styling ${stylingFor} today` : ""}.
        </p>
        {(lastConversation || nextBooked) && (
          <div className="animate-fade-up pointer-events-auto mx-auto mt-8 flex max-w-full flex-col items-center gap-2.5" style={{ animationDelay: "380ms" }}>
            {/* The next look you've booked in the style journal, if any —
                hover shows it beside the cursor. */}
            {nextBooked && (
              <CursorThumb
                src={nextBooked.imageUrl}
                onClick={() => nextBooked.conversationId && onSelectConversation(nextBooked.conversationId)}
                className="tete-link max-w-full truncate text-[14px] text-[#2b2633]/60"
              >
                <span className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#8f78e8]">Coming up · {bookedWhen(nextBooked.eventDate)}</span>{" "}
                <span className="font-script text-[17px] italic text-[#2b2633]/80">{nextBooked.title}</span>
              </CursorThumb>
            )}
            {lastConversation && (
              <CursorThumb
                src={covers[lastConversation.id]}
                onClick={() => onSelectConversation(lastConversation.id)}
                className="tete-link max-w-full truncate text-[14px] text-[#2b2633]/50 hover:text-[#2b2633]"
              >
                Continue “{lastConversation.title.replace(/\.{3}$/, "…")}” →
              </CursorThumb>
            )}
          </div>
        )}
        <p className="animate-fade-in mt-10 text-[12px] text-[#2b2633]/35 sm:mt-12" style={{ animationDelay: "700ms" }}>
          {touch ? "Tap a shape for an idea" : "Hover the shapes for ideas"} — or just start typing.
        </p>
      </div>
      {/* Scroll cue to the explanations below. */}
      <a
        href="#about"
        className="animate-fade-in absolute bottom-[22vh] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/35 transition-colors hover:text-[#8f78e8] sm:flex"
        style={{ animationDelay: "1200ms" }}
      >
        What is helloModa
        <span className="tete-nudge text-[14px]">↓</span>
      </a>
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
      <div className="text-center">
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
            className="mx-auto mt-6 max-w-[32rem] text-pretty text-left text-[16.5px] leading-[1.8] text-[#2b2633]/75"
          />
        )}
      </div>

      {/* The photograph comes *after* the words (direct request 2026-10-02):
          you read the title and the reasoning while it's still developing. */}
      <div
        className="animate-fade-up mt-14"
        style={{ animationDelay: message.fresh ? `${Math.max(300, after - 400)}ms` : "0ms" }}
      >
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
                className="group flex w-full items-baseline justify-center gap-3 py-1.5 font-script text-[19px] italic text-[#2b2633]/55 transition-colors hover:text-[#2b2633]"
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

function ThinkingMoment({ pieces = 0 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % THINKING_LINES.length), 2300);
    return () => clearInterval(id);
  }, []);
  return (
    <section data-moment className="tete-moment mx-auto flex max-w-[620px] flex-col items-center px-6 py-24">
      <span className="tete-breathe block h-3 w-3 rounded-full bg-[#8f78e8] shadow-[0_0_28px_8px_rgba(185,164,255,0.45)]" />
      <p key={i} className="animate-word-in mt-6 font-script text-[22px] italic text-[#2b2633]/60" aria-live="polite">
        {/* First line names the real wardrobe size — it's looking at *your* clothes. */}
        {i === 0 && pieces > 1 ? `Looking through your ${pieces} pieces…` : THINKING_LINES[i]}
      </p>
    </section>
  );
}

// ── The composer ────────────────────────────────────────────────────────
function Composer({ inputRef, onSend, thinking, setComposing, energyRef, suggestions, modKey }) {
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
        {/* The field: a soft paper card so it reads as the place to write
            (direct request 2026-10-02 — "make the input more evident"),
            glowing violet while focused (globals.css .tete-field). The
            breathing dot is the stylist, listening; the bar along the
            bottom fills as you write and runs while it thinks. */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="tete-field relative flex cursor-text items-end gap-3 rounded-[28px] bg-white/85 py-2.5 pl-5 pr-2.5 shadow-[0_22px_50px_-30px_rgba(90,70,160,0.5),0_0_0_1px_rgba(43,38,51,0.08)] backdrop-blur-xl"
        >
          <span
            aria-hidden="true"
            className={`mb-[17px] block h-2 w-2 shrink-0 rounded-full bg-[#8f78e8] shadow-[0_0_12px_3px_rgba(185,164,255,0.55)] ${thinking || hasDraft ? "" : "tete-breathe"}`}
          />
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Tell the stylist where you're going"
            placeholder={thinking ? "Styling…" : "Tell me where you're going…"}
            className="tete-caret block max-h-[170px] min-h-[44px] w-full resize-none bg-transparent py-2 font-script text-[20px] italic leading-snug placeholder:text-[#2b2633]/40 focus:outline-none sm:text-[24px]"
            style={{ color: INK }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              send();
            }}
            aria-label="Send"
            disabled={!hasDraft || thinking}
            className={`mb-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-300 ${
              hasDraft && !thinking
                ? "bg-[#2b2633] text-[#fdfcfa] hover:bg-[#8f78e8]"
                : "bg-[#2b2633]/[0.06] text-[#2b2633]/30"
            }`}
          >
            <ArrowRight size={16} />
          </button>
          <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px overflow-hidden">
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#8f78e8] to-transparent transition-[width] duration-500 ease-out"
              style={{ width: `${thinking ? 100 : fill}%`, opacity: thinking ? 0.6 : 0.85 }}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-5 text-[11px] text-[#2b2633]/35">
          {hasDraft ? (
            <span>↵ to send · ⇧↵ new line</span>
          ) : (
            <>
              {suggestions.length > 0 && <span className="[@media(hover:none)]:hidden">⇥ for a suggestion</span>}
              <span className="hidden sm:inline">{modKey} for everything else</span>
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
  const big =
    "tete-menu-item block w-full py-1.5 text-left font-script text-[30px] leading-tight text-[#2b2633]/80 transition-colors hover:text-[#2b2633] sm:text-[34px]";

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
                  {/* Hover: that conversation's last look follows the cursor. */}
                  <CursorThumb
                    src={shell.conversationCovers?.[c.id]}
                    onClick={go(() => onSelectConversation(c.id))}
                    className={`block w-full truncate py-1 text-left font-script text-[19px] italic transition-[color,transform] duration-300 hover:translate-x-1.5 ${
                      c.id === activeConversationId ? "text-[#8f78e8]" : "text-[#2b2633]/50 hover:text-[#2b2633]"
                    }`}
                  >
                    {(c.title || "Untitled look").replace(/\.{3}$/, "…")}
                  </CursorThumb>
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
  // Day and date, centred in the header. Set after mount so server and
  // client markup match; short form on phones so it clears the wordmark.
  const [today, setToday] = useState({ long: "", short: "" });
  const [modKey, setModKey] = useState("⌘K");
  useEffect(() => {
    if (!/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) setModKey("Ctrl K");
    const d = new Date();
    setToday({
      long: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
      short: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    });
  }, []);

  const name = firstName(userDisplayName, userEmail);
  const activeAvatar = avatarProfiles?.find((a) => a.id === activeAvatarId) || null;
  const stylingFor = activeAvatar && !activeAvatar.is_self ? activeAvatar.display_name : null;
  const lastConversation = messages.length === 0 ? conversations.find((c) => c.title) || null : null;

  const looks = useMemo(() => messages.filter((m) => m.role === "ai" && (m.title || m.heroPrompt)), [messages]);
  const latestLook = looks[looks.length - 1];
  const suggestions = latestLook?.quickReplies?.length ? latestLook.quickReplies : OPENERS.map((o) => o.prompt);

  // The browser tab tells you what's happening while you're elsewhere:
  // "Styling…" while it works, then the look's title once it lands.
  useEffect(() => {
    const base = "helloModa";
    if (thinking) document.title = `Styling… · ${base}`;
    else if (latestLook?.title && latestLook.fresh) document.title = `${latestLook.title} · ${base}`;
    else document.title = base;
  }, [thinking, latestLook]);

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
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-[#fdfcfa] from-50% to-transparent"
      />
      {/* Top: just a name and a way into everything else. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-7">
        <span className="pointer-events-auto flex items-center gap-2.5 font-script text-[22px] italic text-[#2b2633]/80">
          <span className="tete-breathe block h-2 w-2 rounded-full bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.5)]" />
          helloModa
        </span>
        <span className="animate-fade-in absolute left-1/2 top-[33px] -translate-x-1/2 whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">
          <span className="sm:hidden">{today.short}</span>
          <span className="hidden sm:inline">{today.long}</span>
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
          <kbd className="hidden font-sans text-[11px] text-[#2b2633]/30 sm:inline">{modKey}</kbd>
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
          occasionImages={shell.occasionImages}
          covers={shell.conversationCovers}
          nextBooked={shell.nextBooked}
        />

        <AboutPanel showcase={shell.showcase || []} folded={messages.length > 0 || isSwitching} />

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

        {thinking && <ThinkingMoment pieces={wardrobe.length} />}
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
          modKey={modKey}
        />
      )}

      {menuOpen && <Menu shell={shell} onClose={() => setMenuOpen(false)} />}

      {view === "wardrobe" && (
        <div className="animate-fade-in fixed inset-0 z-40 flex flex-col bg-[#fdfcfa]">
          <div className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-7">
            <span className="flex items-center gap-2.5 font-script text-[22px] italic text-[#2b2633]/80">
              <span className="tete-breathe block h-2 w-2 rounded-full bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.5)]" />
              helloModa
            </span>
            <button
              onClick={() => setView("chat")}
              className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
            >
              Back to styling
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
