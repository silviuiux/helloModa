"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Orb from "../Orb.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import RecommendationCards from "../chat/RecommendationCards.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import { occasions } from "../../data/occasions.js";
import { ArrowRight, Heart, ThumbsDown, Refresh, Hanger, Share, History, User, Plus, X } from "../Icons.jsx";

// Design exploration, branch design/chat-feed — "Feed".
// The conversation as a vertical, snap-scrolling feed of full-screen look
// cards (the social-feed pattern) instead of a thread: every stylist look
// is one screen, the image is the whole card, and your prompt rides on it
// as a small pill. Actions sit in a floating vertical column on the side of
// each card; navigation lives in a thin floating top bar; the composer is a
// floating pill that's always there. On desktop each card is a centred
// portrait panel over a blurred copy of its own image.

const HERO = occasions.find((o) => o.slug === "rooftop-birthday") || occasions[0];

function ActionButton({ icon: Icon, label, onClick, active }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-1.5">
      <span
        className={`grid h-12 w-12 place-items-center rounded-full backdrop-blur-md transition-colors ${
          active ? "bg-white text-ink" : "bg-black/35 text-white ring-1 ring-white/25 group-hover:bg-black/55"
        }`}
      >
        <Icon size={20} />
      </span>
      <span className="text-[11px] font-semibold text-white drop-shadow">{label}</span>
    </button>
  );
}

function Backdrop({ imageUrl, seed }) {
  return (
    <div className="absolute inset-0 hidden overflow-hidden md:block" aria-hidden="true">
      <div className="absolute inset-0 scale-110 opacity-60 blur-3xl">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <PlaceholderImage seed={seed} width={400} height={500} />
        )}
      </div>
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}

// The frame every card shares: full-screen on phones, a centred portrait
// panel (4:5) with the action column beside it on desktop.
function CardFrame({ backdrop, children, actions }) {
  return (
    <section className="relative flex h-[100svh] snap-start items-center justify-center overflow-hidden bg-[#0d0c10]">
      {backdrop}
      <div className="relative flex h-full w-full items-center justify-center md:gap-6 md:py-20">
        <div className="relative h-full w-full overflow-hidden md:aspect-[4/5] md:h-full md:w-auto md:rounded-[28px] md:shadow-2xl">
          {children}
        </div>
        {actions && (
          <div className="absolute bottom-40 right-3 z-10 flex flex-col gap-4 md:static md:self-end md:pb-4">{actions}</div>
        )}
      </div>
    </section>
  );
}

function PromptPill({ text }) {
  if (!text) return null;
  return (
    <p className="absolute left-4 right-20 top-20 z-10 line-clamp-2 w-fit max-w-[85%] rounded-2xl bg-black/40 px-4 py-2 text-[13.5px] leading-snug text-white ring-1 ring-white/20 backdrop-blur-md md:left-6 md:top-6">
      <span className="font-semibold text-white/60">You · </span>
      {text}
    </p>
  );
}

function LookCard({ message, prompt, index, total, onSend, onToggleSave, savedIds, onShare }) {
  const [expanded, setExpanded] = useState(false);
  const [showPieces, setShowPieces] = useState(false);
  const [liked, setLiked] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const { imageUrl, settled, errorMessage } = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });
  const seed = message.recommendationId || message.id;

  return (
    <CardFrame
      backdrop={<Backdrop imageUrl={imageUrl} seed={seed} />}
      actions={
        settled && (
          <>
            <ActionButton icon={Heart} label="Love it" active={liked === true} onClick={() => setLiked(liked === true ? null : true)} />
            <ActionButton icon={ThumbsDown} label="Not me" active={liked === false} onClick={() => setLiked(liked === false ? null : false)} />
            <ActionButton icon={Refresh} label="Restyle" />
            {message.pieces?.length > 0 && (
              <ActionButton icon={Hanger} label={`Pieces ${message.pieces.length}`} onClick={() => setShowPieces(true)} />
            )}
            <ActionButton icon={Share} label="Share" onClick={onShare} />
          </>
        )
      }
    >
      <div className="absolute inset-0 bg-[#1a1720]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {settled && !imageUrl && <PlaceholderImage seed={seed} width={900} height={1125} />}
        {!settled && !imageUrl && (
          <div className="skeleton-organic animate-shimmer grid h-full w-full place-items-center">
            <div className="flex flex-col items-center gap-4">
              <Orb size={72} state="thinking" />
              <span className="text-[13px] font-medium text-muted">Painting your look…</span>
            </div>
          </div>
        )}
      </div>

      <PromptPill text={prompt} />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-5 pb-28 pr-20 pt-40 md:px-8 md:pb-8 md:pr-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Look {String(index).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </p>
        <h2 className="mt-2 text-[34px] font-bold leading-[0.95] tracking-[-0.035em] text-white md:text-[40px]">{message.title}</h2>
        {message.narrative && (
          <button onClick={() => setExpanded((v) => !v)} className="mt-3 block text-left">
            <span className={`text-[14.5px] leading-relaxed text-white/85 ${expanded ? "" : "line-clamp-3"}`}>{message.narrative}</span>
            <span className="mt-1 block text-[12.5px] font-semibold text-white/60">{expanded ? "Less" : "More"}</span>
          </button>
        )}
        {errorMessage && <p className="mt-2 text-[12.5px] text-[#ffc9d6]">{errorMessage}</p>}
        {settled && message.quickReplies?.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {message.quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => onSend(q)}
                className="shrink-0 rounded-full bg-white/15 px-3.5 py-1.5 text-[12.5px] font-medium text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/25"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {showPieces && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={() => setShowPieces(false)}>
          <div
            className="animate-fade-up max-h-[75%] overflow-hidden rounded-t-[28px] bg-[#f7f6f3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <p className="text-[16px] font-semibold text-ink">The pieces</p>
              <button onClick={() => setShowPieces(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-muted">
                <X size={16} />
              </button>
            </div>
            <div className="scroll-area max-h-[60vh] overflow-y-auto px-6 pb-8 pt-2 [&>div]:!grid-cols-2">
              <RecommendationCards cards={message.pieces} onToggleSave={onToggleSave} savedIds={savedIds} />
            </div>
          </div>
        </div>
      )}
    </CardFrame>
  );
}

function TopBar({ shell, onOpenWardrobe }) {
  const { onNewChat, wardrobe, avatarProfiles, activeAvatarId, onSelectAvatar, userEmail, onSignOut, thinking } = shell;
  const [menu, setMenu] = useState(null);
  const btn = "grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-black/55";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 bg-gradient-to-b from-black/50 to-transparent px-4 pb-8 pt-4 md:px-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/35 py-1.5 pl-1.5 pr-4 ring-1 ring-white/20 backdrop-blur-md">
        <Orb size={26} mini state={thinking ? "thinking" : "idle"} />
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">helloModa</span>
      </div>
      <div className="pointer-events-auto relative flex items-center gap-2">
        <button onClick={onNewChat} aria-label="New look" title="New look" className={btn}>
          <Plus size={18} />
        </button>
        <button onClick={onOpenWardrobe} aria-label="Wardrobe" title="Wardrobe" className={`${btn} relative`}>
          <Hanger size={18} />
          {wardrobe.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
              {wardrobe.length}
            </span>
          )}
        </button>
        <Link href={shell.journalHref || "/outfits"} aria-label="Style journal" title="Style journal" className={btn}>
          <History size={18} />
        </Link>
        <button onClick={() => setMenu((m) => (m ? null : "me"))} aria-label="Account" className={`${btn} overflow-hidden`}>
          <User size={18} />
        </button>
        {menu && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl">
            {avatarProfiles?.length > 0 && (
              <>
                <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Styling for</p>
                {[{ id: null, label: "No avatar" }, ...avatarProfiles.map((a) => ({ id: a.id, label: a.is_self ? "Myself" : a.display_name }))].map(
                  (o) => (
                    <button
                      key={o.id || "none"}
                      onClick={() => onSelectAvatar(o.id)}
                      className={`block w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] ${
                        o.id === (activeAvatarId || null) ? "bg-accent-tint font-medium text-accent-deep" : "text-muted hover:bg-black/[0.04]"
                      }`}
                    >
                      {o.label}
                    </button>
                  )
                )}
                <div className="my-1.5 h-px bg-black/[0.06]" />
              </>
            )}
            <p className="truncate px-2.5 py-1 text-[12px] text-faint">{userEmail}</p>
            <Link href="/profile" className="block rounded-xl px-2.5 py-2 text-[13.5px] text-muted hover:bg-black/[0.04]">
              Profile
            </Link>
            <Link href="/avatars" className="block rounded-xl px-2.5 py-2 text-[13.5px] text-muted hover:bg-black/[0.04]">
              Avatars
            </Link>
            <form action={onSignOut}>
              <button type="submit" className="block w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] text-muted hover:bg-black/[0.04]">
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FeedLayout({ shell }) {
  const { view, setView, wardrobe, messages, thinking, onSend, setComposing, shareText, wardrobeActions, userDisplayName } = shell;
  const [value, setValue] = useState("");
  const scrollRef = useRef(null);
  const hasDraft = value.trim().length > 0;
  useEffect(() => setComposing?.(hasDraft), [hasDraft, setComposing]);

  // A new look (or the thinking card) scrolls into view as the next card.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || (messages.length === 0 && !thinking)) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  function submit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || thinking) return;
    onSend(text);
    setValue("");
  }
  async function share() {
    const text = shareText || "Styled by helloModa — the AI stylist that starts in your closet.";
    try {
      if (navigator.share) await navigator.share({ text, title: "helloModa" });
      else await navigator.clipboard.writeText(text);
    } catch {
      // cancelled / unavailable
    }
  }

  const savedIds = new Set(
    wardrobe
      .filter((it) => typeof it.id === "string" && it.id.startsWith("saved-"))
      .map((it) => it.id.slice("saved-".length))
  );
  function handleToggleSave(piece) {
    if (savedIds.has(piece.id)) wardrobeActions.onRemove(`saved-${piece.id}`);
    else wardrobeActions.onAdd(cardToWardrobeItem(piece));
  }

  // Pair each stylist reply with the prompt that asked for it.
  const cards = [];
  let lastPrompt = null;
  for (const m of messages) {
    if (m.role === "user") lastPrompt = m.text;
    else if (!m.title && !m.heroPrompt) cards.push({ kind: "note", message: m, prompt: lastPrompt });
    else cards.push({ kind: "look", message: m, prompt: lastPrompt });
    if (m.role !== "user") lastPrompt = null;
  }
  const lookTotal = cards.filter((c) => c.kind === "look").length;
  let lookIndex = 0;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0c10] font-sans">
      <TopBar shell={shell} onOpenWardrobe={() => setView("wardrobe")} />

      <div ref={scrollRef} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none]">
        {/* Card 0: the welcome */}
        <CardFrame backdrop={<Backdrop seed={HERO.slug} />}>
          <div className="absolute inset-0">
            <PlaceholderImage src={`/occasions/${HERO.slug}-hero.jpg`} seed={HERO.slug} width={900} height={1125} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-28 md:px-8 md:pb-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {userDisplayName ? `Hi ${userDisplayName}` : "Your stylist is in"}
            </p>
            <h1 className="mt-3 text-[46px] font-bold leading-[0.92] tracking-[-0.04em] text-white md:text-[54px]">
              What are we dressing for?
            </h1>
            <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-white/75">
              Every look lands here as its own card — built from your wardrobe, painted on you. Swipe up through them.
            </p>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {occasions.slice(0, 10).map((o) => (
                <button
                  key={o.slug}
                  onClick={() => onSend(o.prompt)}
                  className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-[13px] font-medium text-white ring-1 ring-white/25 backdrop-blur hover:bg-white/30"
                >
                  {o.label}
                </button>
              ))}
            </div>
            {cards.length > 0 && <p className="mt-5 text-[12px] font-medium text-white/50">↓ {cards.length} in this conversation</p>}
          </div>
        </CardFrame>

        {cards.map((c) => {
          if (c.kind === "note") {
            return (
              <CardFrame key={c.message.id}>
                <div className="grid h-full w-full place-items-center bg-[#1a1720] p-8">
                  <div className="max-w-sm text-center">
                    <Orb size={40} mini className="mx-auto" />
                    <p className="mt-5 text-[17px] leading-relaxed text-white/85">{c.message.narrative}</p>
                  </div>
                </div>
                <PromptPill text={c.prompt} />
              </CardFrame>
            );
          }
          lookIndex += 1;
          return (
            <LookCard
              key={c.message.id}
              message={c.message}
              prompt={c.prompt}
              index={lookIndex}
              total={lookTotal}
              onSend={onSend}
              onToggleSave={handleToggleSave}
              savedIds={savedIds}
              onShare={share}
            />
          );
        })}

        {thinking && (
          <CardFrame>
            <div className="skeleton-organic animate-shimmer grid h-full w-full place-items-center">
              <div className="flex flex-col items-center gap-4">
                <Orb size={80} state="thinking" />
                <span className="text-[13.5px] font-medium text-muted">Styling your next look…</span>
              </div>
            </div>
          </CardFrame>
        )}
      </div>

      {/* Floating composer */}
      <form onSubmit={submit} className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 md:pb-6">
        <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full bg-black/45 py-1.5 pl-5 pr-1.5 ring-1 ring-white/20 backdrop-blur-xl focus-within:ring-white/50">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={thinking}
            placeholder={thinking ? "Styling your look…" : "Where are you going?"}
            className="h-11 flex-1 bg-transparent text-[15px] text-white placeholder:text-white/50 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!hasDraft || thinking}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-accent-tint disabled:bg-white/20 disabled:text-white/40"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </form>

      {/* Wardrobe as a full-screen sheet over the feed */}
      {view === "wardrobe" && (
        <div className="animate-fade-in fixed inset-0 z-50 flex flex-col bg-[#f5f3fa]">
          <div className="flex h-14 shrink-0 items-center justify-between px-4">
            <p className="text-[15px] font-semibold text-ink">Wardrobe</p>
            <button onClick={() => setView("chat")} aria-label="Close wardrobe" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-muted">
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
