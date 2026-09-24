"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Orb from "../Orb.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import RecommendationCards from "../chat/RecommendationCards.jsx";
import WardrobeView from "../wardrobe/WardrobeView.jsx";
import { useOutfitImage } from "../../lib/useOutfitImage.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import { occasions } from "../../data/occasions.js";
import {
  Plus,
  Hanger,
  History,
  Share,
  User,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Refresh,
  X,
  Chat,
} from "../Icons.jsx";

// Design exploration, branch design/chat-fitting-room — "Fitting Room".
// A split screen instead of a single scrolling thread: a dark, narrow
// conversation pane on the left (the dialogue, compact), and a large
// light "canvas" on the right that shows one look at a time, full-bleed —
// the selected look, or the latest by default. Clicking any look in the
// transcript puts it on the canvas. The actions live in a slim toolbar at
// the top of the conversation pane. On phones the canvas stacks on top.

function ToolButton({ icon: Icon, label, onClick, href, active, badge }) {
  const cls = `relative grid h-9 w-9 place-items-center rounded-lg transition-colors ${
    active ? "bg-white text-[#131117]" : "text-white/55 hover:bg-white/10 hover:text-white"
  }`;
  const inner = (
    <>
      <Icon size={17} />
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );
  return href ? (
    <Link href={href} aria-label={label} title={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} aria-label={label} title={label} className={cls}>
      {inner}
    </button>
  );
}

function Toolbar({ shell, onShare }) {
  const { view, setView, wardrobe, onNewChat, avatarProfiles, activeAvatarId, onSelectAvatar, userEmail, onSignOut, thinking } =
    shell;
  const [menu, setMenu] = useState(null); // "avatar" | "account" | null
  const active = avatarProfiles?.find((a) => a.id === activeAvatarId);

  return (
    <div className="relative flex h-14 shrink-0 items-center gap-1 border-b border-white/[0.07] px-3">
      <div className="mr-auto flex items-center gap-2 pl-1">
        <Orb size={22} mini state={thinking ? "thinking" : "idle"} />
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">helloModa</span>
      </div>
      <ToolButton icon={Plus} label="New look" onClick={onNewChat} />
      <ToolButton icon={Chat} label="Stylist" active={view === "chat"} onClick={() => setView("chat")} />
      <ToolButton
        icon={Hanger}
        label="Wardrobe"
        active={view === "wardrobe"}
        badge={wardrobe.length}
        onClick={() => setView("wardrobe")}
      />
      <ToolButton icon={History} label="Style journal" href="/outfits" />
      <ToolButton icon={Share} label="Share this look" onClick={onShare} />
      {avatarProfiles?.length > 0 && (
        <button
          onClick={() => setMenu((m) => (m === "avatar" ? null : "avatar"))}
          aria-label="Styling for"
          title={active ? `Styling for ${active.display_name}` : "Styling for: no avatar"}
          className="ml-1 grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20"
        >
          {active?.avatar_image_signed_url ? (
            <img src={active.avatar_image_signed_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <User size={15} className="text-white/70" />
          )}
        </button>
      )}
      <button
        onClick={() => setMenu((m) => (m === "account" ? null : "account"))}
        aria-label="Account"
        className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-accent text-[12px] font-semibold uppercase text-white"
      >
        {userEmail?.[0] || "?"}
      </button>

      {menu && (
        <div className="absolute right-3 top-full z-40 mt-2 w-60 rounded-xl border border-white/10 bg-[#1d1a23] p-1.5 shadow-2xl">
          {menu === "avatar" ? (
            <>
              <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Styling for</p>
              {[{ id: null, label: "No avatar" }, ...avatarProfiles.map((a) => ({ id: a.id, label: a.is_self ? "Myself" : a.display_name }))].map(
                (o) => (
                  <button
                    key={o.id || "none"}
                    onClick={() => {
                      onSelectAvatar(o.id);
                      setMenu(null);
                    }}
                    className={`block w-full rounded-lg px-2.5 py-2 text-left text-[13.5px] ${
                      o.id === (activeAvatarId || null) ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {o.label}
                  </button>
                )
              )}
            </>
          ) : (
            <>
              <p className="truncate px-2.5 py-1.5 text-[12px] text-white/40">{userEmail}</p>
              <Link href="/profile" className="block rounded-lg px-2.5 py-2 text-[13.5px] text-white/70 hover:bg-white/5 hover:text-white">
                Profile
              </Link>
              <Link href="/avatars" className="block rounded-lg px-2.5 py-2 text-[13.5px] text-white/70 hover:bg-white/5 hover:text-white">
                Avatars
              </Link>
              <form action={onSignOut}>
                <button type="submit" className="block w-full rounded-lg px-2.5 py-2 text-left text-[13.5px] text-white/70 hover:bg-white/5 hover:text-white">
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// One stylist turn in the transcript: a compact tile. It owns the
// generation hook (so every look gets painted, selected or not) and
// reports its image state up for the canvas.
function LookTile({ message, index, selected, onSelect, onImage }) {
  const img = useOutfitImage({
    recommendationId: message.recommendationId,
    heroPrompt: message.heroPrompt,
    generatedImageUrl: message.generatedImageUrl,
  });
  useEffect(() => {
    onImage(message.id, img);
  }, [message.id, img.imageUrl, img.settled, img.errorMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      onClick={() => onSelect(message.id)}
      className={`animate-fade-up group flex w-full gap-3.5 rounded-2xl p-3 text-left transition-colors ${
        selected ? "bg-white/[0.09] ring-1 ring-white/15" : "hover:bg-white/[0.05]"
      }`}
    >
      <span className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-lg bg-white/10">
        {img.imageUrl ? (
          <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : img.settled ? (
          <PlaceholderImage seed={message.recommendationId || message.id} width={120} height={150} />
        ) : (
          <span className="grid h-full w-full place-items-center">
            <Orb size={20} mini state="thinking" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent-soft">
          Look {String(index).padStart(2, "0")}
          {selected && " · on canvas"}
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-semibold text-white">{message.title}</span>
        <span className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-white/55">{message.narrative}</span>
      </span>
    </button>
  );
}

function Canvas({ look, lookIndex, image, onSend, onToggleSave, savedIds, onShare }) {
  const [showPieces, setShowPieces] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setShowPieces(false);
    setLoaded(false);
  }, [look?.id]);

  if (!look) {
    // Nothing styled yet: the canvas is a mosaic of occasions to start from.
    return (
      <div className="scroll-area h-full overflow-y-auto bg-[#ece9f1] p-6 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">The fitting room</p>
        <h2 className="mt-3 max-w-xl font-display text-[40px] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-ink sm:text-[64px]">
          Pick an occasion. Try it on.
        </h2>
        <div className="mt-8 columns-2 gap-3 sm:gap-4 lg:columns-4">
          {occasions.slice(0, 12).map((o, i) => (
            <button
              key={o.slug}
              onClick={() => onSend(o.prompt)}
              className={`group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-white sm:mb-4 ${["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]", "aspect-square"][i % 4]}`}
            >
              <PlaceholderImage
                src={`/occasions/${o.slug}-hero.jpg`}
                seed={o.slug}
                width={500}
                height={700}
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-left text-[13px] font-semibold text-white">
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#1a1720]">
      {image?.imageUrl ? (
        <img
          key={image.imageUrl}
          src={image.imageUrl}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : image?.settled ? (
        <div className="absolute inset-0">
          <PlaceholderImage seed={look.recommendationId || look.id} width={1200} height={1400} />
        </div>
      ) : (
        <div className="skeleton-organic animate-shimmer absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <Orb size={72} state="thinking" />
            <span className="text-[13px] font-medium text-muted">Painting your look…</span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-6 pt-32 sm:px-10 sm:pb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          Look {String(lookIndex).padStart(2, "0")}
        </p>
        <h2 className="mt-2 max-w-3xl font-display text-[40px] font-extrabold uppercase leading-[0.9] tracking-[-0.04em] text-white sm:text-[72px]">
          {look.title}
        </h2>
        {image?.errorMessage && <p className="mt-3 text-[13px] text-white/80">{image.errorMessage}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button aria-label="Good match" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25">
            <ThumbsUp size={17} />
          </button>
          <button aria-label="Not for me" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25">
            <ThumbsDown size={17} />
          </button>
          <button className="flex h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-[13.5px] font-medium text-white backdrop-blur hover:bg-white/25">
            <Refresh size={16} /> Restyle
          </button>
          <button onClick={onShare} className="flex h-11 items-center gap-2 rounded-full bg-white/15 px-5 text-[13.5px] font-medium text-white backdrop-blur hover:bg-white/25">
            <Share size={16} /> Share
          </button>
          {look.pieces?.length > 0 && (
            <button
              onClick={() => setShowPieces(true)}
              className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-semibold text-ink hover:bg-accent-tint"
            >
              <Hanger size={16} /> The pieces ({look.pieces.length})
            </button>
          )}
        </div>
      </div>

      {showPieces && (
        <div className="animate-fade-in absolute inset-y-0 right-0 z-20 flex w-full max-w-md flex-col bg-[#f7f6f3] shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
            <p className="text-[15px] font-semibold text-ink">The pieces</p>
            <button onClick={() => setShowPieces(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-black/5">
              <X size={17} />
            </button>
          </div>
          <div className="scroll-area flex-1 overflow-y-auto p-6 [&>div]:!grid-cols-2">
            <RecommendationCards cards={look.pieces} onToggleSave={onToggleSave} savedIds={savedIds} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FittingRoomLayout({ shell }) {
  const { view, wardrobe, messages, thinking, onSend, setComposing, shareText, wardrobeActions } = shell;
  const [selectedId, setSelectedId] = useState(null);
  const [images, setImages] = useState({});
  const [value, setValue] = useState("");
  const scrollRef = useRef(null);

  const looks = useMemo(() => messages.filter((m) => m.role === "ai" && (m.title || m.heroPrompt)), [messages]);
  const latestLookId = looks[looks.length - 1]?.id;

  // A new look arriving always takes the canvas.
  useEffect(() => {
    setSelectedId(latestLookId || null);
  }, [latestLookId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const hasDraft = value.trim().length > 0;
  useEffect(() => setComposing?.(hasDraft), [hasDraft, setComposing]);

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

  const selected = looks.find((l) => l.id === selectedId) || null;
  const selectedIndex = selected ? looks.indexOf(selected) + 1 : 0;
  const lastQuickReplies = looks[looks.length - 1]?.quickReplies || [];
  let lookCounter = 0;

  return (
    <div className="flex h-screen w-full flex-col-reverse overflow-hidden bg-[#131117] font-sans md:flex-row">
      {/* Conversation pane */}
      <section className="flex min-h-0 flex-1 flex-col md:w-[420px] md:flex-none md:border-r md:border-white/[0.07]">
        <Toolbar shell={shell} onShare={share} />

        <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <div className="animate-fade-up px-2 pt-6">
              <p className="text-[26px] font-semibold leading-tight tracking-[-0.03em] text-white">
                What are we dressing for?
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/50">
                Describe the occasion here — the look lands on the canvas, built from your wardrobe first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="animate-fade-up flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white/[0.1] px-4 py-2.5 text-[14px] leading-relaxed text-white/90">
                        {m.text}
                      </p>
                    </div>
                  );
                }
                if (!m.title && !m.heroPrompt) {
                  return (
                    <p key={m.id} className="animate-fade-up rounded-2xl bg-[#2a1f2a] px-4 py-2.5 text-[13.5px] leading-relaxed text-[#ffc9d6]">
                      {m.narrative}
                    </p>
                  );
                }
                lookCounter += 1;
                return (
                  <LookTile
                    key={m.id}
                    message={m}
                    index={lookCounter}
                    selected={m.id === selectedId}
                    onSelect={(id) => {
                      setSelectedId(id);
                    }}
                    onImage={(id, img) => setImages((prev) => (prev[id]?.imageUrl === img.imageUrl && prev[id]?.settled === img.settled ? prev : { ...prev, [id]: img }))}
                  />
                );
              })}
              {thinking && (
                <div className="flex items-center gap-3 px-3 py-2 text-[13.5px] text-white/60">
                  <Orb size={20} mini state="thinking" /> Styling your look…
                </div>
              )}
            </div>
          )}
        </div>

        {lastQuickReplies.length > 0 && !thinking && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {lastQuickReplies.map((q) => (
              <button
                key={q}
                onClick={() => onSend(q)}
                className="shrink-0 rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] text-white/70 hover:border-white/40 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="shrink-0 p-4 pt-2">
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.07] py-1.5 pl-4 pr-1.5 ring-1 ring-white/10 focus-within:ring-accent">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={thinking}
              placeholder={thinking ? "Styling your look…" : "Describe the occasion…"}
              className="h-10 flex-1 bg-transparent text-[14.5px] text-white placeholder:text-white/35 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!hasDraft || thinking}
              className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-deep disabled:bg-white/10 disabled:text-white/30"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* Canvas pane */}
      <section className="h-[46vh] shrink-0 md:h-auto md:min-w-0 md:flex-1">
        {view === "wardrobe" ? (
          <div className="flex h-full flex-col overflow-hidden bg-[#f5f3fa]">
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
          <Canvas
            look={selected}
            lookIndex={selectedIndex}
            image={selected ? images[selected.id] : null}
            onSend={onSend}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
            onShare={share}
          />
        )}
      </section>
    </div>
  );
}
