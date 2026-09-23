"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Home,
  Chat,
  Hanger,
  History,
  Share,
  User,
  ArrowRight,
  Plus,
} from "./Icons.jsx";
import Orb from "./Orb.jsx";

function IconButton({ active, icon: Icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
        active ? "bg-accent text-canvas" : "glass-circle text-muted hover:text-ink"
      }`}
    >
      <Icon size={18} />
      {badge != null && badge > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-semibold text-canvas">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

// Generic click-outside-to-close dropdown shell, opens upward (bar is at the
// bottom of the screen).
function Dropdown({ trigger, children, align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {trigger(() => setOpen((v) => !v), open)}
      {open && (
        <div
          className={`glass absolute bottom-full z-30 mb-2 w-72 rounded-xl2 p-2 shadow-lift ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

// Hovering the icon previews the quick-switch list (same panel the old
// click-to-toggle version showed); clicking it navigates straight to the
// full /outfits history page instead of toggling the panel. Direct request
// 2026-09-21 — a deliberate split of "peek" (hover) vs "go there" (click),
// not the generic click-toggle Dropdown other menus use.
function ConversationMenu({ conversations, activeConversationId, onSelect, onNewChat }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/outfits"
        aria-label="Outfit history"
        className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
          open ? "bg-white/85 text-ink" : "glass-circle text-muted hover:text-ink"
        }`}
      >
        <History size={18} />
        {conversations.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-semibold text-canvas">
            {conversations.length > 99 ? "99+" : conversations.length}
          </span>
        )}
      </Link>
      {open && (
        <div className="glass absolute bottom-full left-0 z-30 mb-2 w-72 rounded-xl2 p-2 shadow-lift">
          <button
            onClick={() => {
              onNewChat();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-accent-deep hover:bg-accent-tint/60"
          >
            <Plus size={15} />
            New chat
          </button>
          <div className="scroll-area mt-1 max-h-72 space-y-0.5 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="px-3 py-2 text-[12.5px] text-faint">No looks yet — your first one starts here.</p>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelect(c.id);
                    setOpen(false);
                  }}
                  className={`w-full truncate rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                    c.id === activeConversationId
                      ? "bg-accent-tint text-accent-deep"
                      : "text-muted hover:bg-white/70 hover:text-ink"
                  }`}
                  title={c.title}
                >
                  {c.title || "Untitled"}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// helloAvatar (docs/03-roadmap.md Phase 3): who the next generated outfit
// is modeled on. Only shown once at least one avatar exists (self or
// family) — nothing to pick otherwise, and this shouldn't clutter the bar
// for accounts that haven't set one up. "No avatar" is always the first
// option — picking it goes back to today's plain generation, no reference
// figure.
function AvatarMenu({ avatarProfiles, activeAvatarId, onSelectAvatar }) {
  if (!avatarProfiles?.length) return null;
  const active = avatarProfiles.find((a) => a.id === activeAvatarId) || null;

  return (
    <Dropdown
      trigger={(toggle, open) => (
        <button
          onClick={toggle}
          aria-label="Styling for"
          title={active ? `Styling for ${active.display_name}` : "Styling for: no avatar"}
          className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full transition-colors ${
            open ? "bg-white/85" : "glass-circle"
          }`}
        >
          {active?.avatar_image_signed_url ? (
            <img src={active.avatar_image_signed_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <User size={18} className="text-muted" />
          )}
        </button>
      )}
    >
      {(close) => (
        <div className="px-1 py-1">
          <p className="px-2 py-1.5 text-[11px] uppercase tracking-label text-faint">Styling for</p>
          <button
            onClick={() => {
              onSelectAvatar(null);
              close();
            }}
            className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13.5px] transition-colors ${
              !activeAvatarId ? "bg-accent-tint font-medium text-accent-deep" : "text-muted hover:bg-white/70 hover:text-ink"
            }`}
          >
            No avatar
          </button>
          {avatarProfiles.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                onSelectAvatar(a.id);
                close();
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] transition-colors ${
                a.id === activeAvatarId ? "bg-accent-tint font-medium text-accent-deep" : "text-muted hover:bg-white/70 hover:text-ink"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white/70">
                {a.avatar_image_signed_url ? (
                  <img src={a.avatar_image_signed_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={12} className="text-faint" />
                )}
              </span>
              {a.is_self ? "Myself" : a.display_name}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

function AccountMenu({ userEmail, onSignOut }) {
  if (!userEmail) return null;
  return (
    <Dropdown
      align="right"
      trigger={(toggle, open) => (
        <button
          onClick={toggle}
          aria-label="Account"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
            open ? "bg-white/85 text-ink" : "glass-circle text-muted hover:text-ink"
          }`}
        >
          <User size={18} />
        </button>
      )}
    >
      {() => (
        <div className="px-1 py-1">
          <p className="truncate px-2 py-1.5 text-[12.5px] text-faint" title={userEmail}>
            {userEmail}
          </p>
          <Link
            href="/profile"
            className="block w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium text-muted hover:bg-white/70 hover:text-accent-deep"
          >
            Profile
          </Link>
          <Link
            href="/avatars"
            className="block w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium text-muted hover:bg-white/70 hover:text-accent-deep"
          >
            Avatars
          </Link>
          <form action={onSignOut}>
            <button
              type="submit"
              className="mt-0.5 w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium text-muted hover:bg-white/70 hover:text-accent-deep"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </Dropdown>
  );
}

// Shares the most recent outfit direction as plain text — real Web Share API
// (or clipboard fallback) sharing the actual title/narrative, not a link to
// anything (there's no public/shareable conversation page yet).
function ShareButton({ shareText }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = shareText || "Styled by helloModa — the AI stylist that starts in your closet.";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, title: "helloModa" });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently no-op, nothing to fall further back to
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this outfit"
      title={copied ? "Copied!" : "Share"}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full glass-circle text-muted transition-colors hover:text-ink"
    >
      <Share size={18} />
    </button>
  );
}

// Replaces the old top bar + in-chat composer: every control lives in one
// bar, anchored to the bottom of the screen — see docs/09-conversation-design.md.
export default function BottomBar({
  view,
  setView,
  wardrobeCount,
  userEmail,
  onSignOut,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onSend,
  sending = false,
  shareText,
  avatarProfiles = [],
  activeAvatarId,
  onSelectAvatar,
  onDraftChange,
}) {
  const [value, setValue] = useState("");
  const hasDraft = value.trim().length > 0;

  // Lets the welcome orb (EmptyState) "listen" while someone is typing.
  useEffect(() => {
    onDraftChange?.(hasDraft);
  }, [hasDraft, onDraftChange]);

  function submit(e) {
    e.preventDefault();
    if (sending) return;
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  }

  const orbState = sending ? "thinking" : hasDraft ? "listening" : "idle";

  const navIcons = (
    <>
      <IconButton icon={Home} label="New chat" onClick={onNewChat} />
      <IconButton active={view === "chat"} icon={Chat} label="Chat" onClick={() => setView("chat")} />
      <IconButton
        active={view === "wardrobe"}
        icon={Hanger}
        label="Wardrobe"
        badge={wardrobeCount}
        onClick={() => setView("wardrobe")}
      />
    </>
  );

  const utilityIcons = (
    <>
      <ConversationMenu
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={onSelectConversation}
        onNewChat={onNewChat}
      />
      <AvatarMenu avatarProfiles={avatarProfiles} activeAvatarId={activeAvatarId} onSelectAvatar={onSelectAvatar} />
      <ShareButton shareText={shareText} />
      <AccountMenu userEmail={userEmail} onSignOut={onSignOut} />
    </>
  );

  return (
    // No hard bar edge: the controls float over a fade from the canvas, so
    // the thread appears to dissolve under the composer rather than being
    // cut off by a panel.
    <div
      className="relative z-20 -mt-10 shrink-0 px-3 pb-4 pt-10 sm:px-5 sm:pb-5"
      style={{
        background:
          view === "chat"
            ? "linear-gradient(to top, #efe8da 55%, rgba(239,232,218,0))"
            : "linear-gradient(to top, #f5f3fa 55%, rgba(245,243,250,0))",
      }}
    >
      <div className="mx-auto flex max-w-content flex-col gap-2 sm:flex-row sm:items-center">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">{navIcons}</div>

        <form onSubmit={submit} className="order-first flex flex-1 items-center sm:order-none sm:mx-1">
          <div
            className={
              view === "chat"
                ? `moodboard-card-field flex h-14 flex-1 items-center gap-3 rounded-lg pl-4 pr-2 transition-[box-shadow,border-color] duration-500 ${
                    sending ? "border-ink/40" : ""
                  }`
                : `glass flex h-14 flex-1 items-center gap-3 rounded-[18px] pl-4 pr-2 transition-[box-shadow,border-color] duration-500 focus-within:border-accent-soft focus-within:shadow-glow ${
                    sending ? "border-accent-soft" : ""
                  }`
            }
          >
            <Orb size={22} mini state={orbState} />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={sending}
              placeholder={sending ? "styling your look…" : "Where are you going? An occasion, a mood, the weather…"}
              className={
                view === "chat"
                  ? "moodboard-marker h-full flex-1 bg-transparent text-[19px] text-ink placeholder:font-sans placeholder:text-[14px] placeholder:text-faint focus:outline-none disabled:cursor-not-allowed"
                  : "h-full flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:cursor-not-allowed"
              }
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={sending || !hasDraft}
              className={
                view === "chat"
                  ? `moodboard-stamp shrink-0 px-4 py-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
                      hasDraft && !sending ? "moodboard-stamp--filled" : ""
                    }`
                  : `grid h-10 w-10 shrink-0 place-items-center rounded-[12px] transition-all duration-300 disabled:cursor-not-allowed ${
                      hasDraft && !sending
                        ? "bg-accent text-canvas hover:bg-accent-deep"
                        : "bg-white/60 text-faint"
                    }`
              }
            >
              {view === "chat" ? "Send" : <ArrowRight size={16} />}
            </button>
          </div>
        </form>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">{utilityIcons}</div>

        {/* Mobile: icons collapse into one row below the input, evenly split. */}
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <div className="flex items-center gap-2">{navIcons}</div>
          <div className="flex items-center gap-2">{utilityIcons}</div>
        </div>
      </div>
    </div>
  );
}
