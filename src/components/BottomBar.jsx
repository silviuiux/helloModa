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

function IconButton({ active, icon: Icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
        active ? "bg-accent text-white shadow-soft" : "glass-circle text-muted hover:text-ink"
      }`}
    >
      <Icon size={18} />
      {badge != null && badge > 0 && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent-deep px-1 text-[9.5px] font-medium text-white">
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
          open ? "bg-white/70 text-ink" : "glass-circle text-muted hover:text-ink"
        }`}
      >
        <History size={18} />
        {conversations.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent-deep px-1 text-[9.5px] font-medium text-white">
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
              <p className="px-3 py-2 text-[12.5px] text-faint">No conversations yet.</p>
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
                      : "text-muted hover:bg-white/60 hover:text-ink"
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
            open ? "bg-white/70 text-ink" : "glass-circle text-muted hover:text-ink"
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
            className="block w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium text-muted hover:bg-white/60 hover:text-accent-deep"
          >
            Profile
          </Link>
          <form action={onSignOut}>
            <button
              type="submit"
              className="mt-0.5 w-full rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium text-muted hover:bg-white/60 hover:text-accent-deep"
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
    const text = shareText || "Check out helloModa — an AI stylist that shops your closet.";
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
}) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    if (sending) return;
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  }

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
      <ShareButton shareText={shareText} />
      <AccountMenu userEmail={userEmail} onSignOut={onSignOut} />
    </>
  );

  return (
    <div className="glass-soft shrink-0 border-t border-white/40 px-3 py-3 sm:px-5">
      <div className="mx-auto flex max-w-content flex-col gap-2 sm:flex-row sm:items-center">
        <div className="hidden shrink-0 items-center gap-2 sm:flex">{navIcons}</div>

        <form onSubmit={submit} className="order-first flex flex-1 items-center sm:order-none sm:mx-1">
          <div
            className={`glass flex h-11 flex-1 items-center rounded-full px-5 transition-opacity ${
              sending ? "opacity-60" : ""
            }`}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={sending}
              placeholder={sending ? "helloModa is styling your look…" : "Describe an occasion…"}
              className="h-full flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={sending}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white transition-all hover:bg-accent-deep hover:scale-[1.05] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight size={16} />
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
