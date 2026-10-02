"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PresenceLight from "./PresenceLight.jsx";
import TiltLook from "./TiltLook.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import { occasions } from "../../data/occasions.js";
import { ArrowRight, Heart, X, User } from "../Icons.jsx";

// design-07 — "Tête-à-tête". A personal, intimate one-to-one with the
// stylist: a bright, airy room with lots of white space, where the
// stylist is a soft pastel haze (PresenceLight), not a chat widget. Minimal chrome, everything interactive:
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
function Welcome({ name, lastConversation, onSelectConversation, onSend, stylingFor }) {
  const [moment, setMoment] = useState({ greeting: "Hello", when: "" });
  // Time-of-day set after mount so server and client markup match.
  useEffect(() => {
    const d = new Date();
    const h = d.getHours();
    const part = h < 5 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 22 ? "evening" : "night";
    const day = d.toLocaleDateString("en-US", { weekday: "long" });
    setMoment({ greeting: part === "night" ? "Still up" : `Good ${part}`, when: `${day} ${part}` });
  }, []);

  return (
    <section
      data-moment
      className="tete-moment mx-auto flex min-h-[88svh] max-w-[620px] flex-col justify-center px-6 pb-16 pt-36 text-center"
    >
      <Whisper className="animate-fade-in">{moment.when || " "}</Whisper>
      <h1
        className="animate-fade-up mt-5 font-script text-[54px] leading-[1.02] tracking-[-0.01em] sm:text-[72px]"
        style={{ color: INK, animationDelay: "120ms" }}
      >
        {moment.greeting}
        {name ? `, ${name}` : ""}.
      </h1>
      <p
        className="animate-fade-up mx-auto mt-5 max-w-md text-[16.5px] leading-[1.7] text-[#2b2633]/60"
        style={{ animationDelay: "260ms" }}
      >
        It&apos;s just the two of us. Tell me where you&apos;re going — I&apos;ll start with what&apos;s already in
        your wardrobe{stylingFor ? `, and dress ${stylingFor} for it` : ""}.
      </p>

      {lastConversation && (
        <button
          onClick={() => onSelectConversation(lastConversation.id)}
          className="animate-fade-up group mx-auto mt-9 text-[14.5px] text-[#2b2633]/55 transition-colors hover:text-[#2b2633]"
          style={{ animationDelay: "380ms" }}
        >
          {/* Conversation titles are the opening message itself (api/chat),
              so quote it back rather than slot it into a sentence. */}
          Last time, you told me{" "}
          <em className="font-script text-[19px] text-[#8f78e8]">“{lastConversation.title}”</em>{" "}
          <span className="whitespace-nowrap underline decoration-[#2b2633]/20 underline-offset-4 group-hover:decoration-[#c9b8ff]">
            Pick it back up →
          </span>
        </button>
      )}

      <div
        className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[14px] text-[#2b2633]/40"
        style={{ animationDelay: "480ms" }}
      >
        <span className="basis-full sm:basis-auto">Or start with</span>
        {OPENERS.map((o, i) => (
          <span key={o.slug} className="flex items-center gap-2">
            <button
              onClick={() => onSend(o.prompt)}
              className="font-script text-[18px] italic text-[#2b2633]/75 transition-colors hover:text-[#8f78e8] sm:text-[19px]"
            >
              {o.label.toLowerCase()}
            </button>
            {i < OPENERS.length - 1 && <span aria-hidden="true">·</span>}
          </span>
        ))}
      </div>
      <p className="animate-fade-in mt-14 hidden text-[12px] text-[#2b2633]/30 sm:block" style={{ animationDelay: "700ms" }}>
        Just start typing — anywhere.
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
