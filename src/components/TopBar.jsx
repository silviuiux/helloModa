"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle, Chat, Hanger, History, ChevronDown, Plus, User } from "./Icons.jsx";

function NavButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${
        active ? "bg-accent text-white shadow-soft" : "text-muted hover:bg-white/60 hover:text-ink"
      }`}
    >
      <Icon size={17} />
      <span className="hidden sm:inline">{label}</span>
      {count != null && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-medium ${
            active ? "bg-white/25 text-white" : "bg-white/70 text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Generic click-outside-to-close dropdown shell.
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
          className={`glass absolute top-full z-30 mt-2 w-72 rounded-xl2 p-2 shadow-lift ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function ConversationMenu({ conversations, activeConversationId, onSelect, onNewChat }) {
  return (
    <Dropdown
      align="right"
      trigger={(toggle, open) => (
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
            open ? "bg-white/70 text-ink" : "text-muted hover:bg-white/60 hover:text-ink"
          }`}
        >
          <History size={16} />
          <span className="hidden md:inline">History</span>
          <ChevronDown size={14} />
        </button>
      )}
    >
      {(close) => (
        <>
          <button
            onClick={() => {
              onNewChat();
              close();
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
                    close();
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
        </>
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
          className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
            open ? "bg-white/70 text-ink" : "glass-circle text-muted hover:text-ink"
          }`}
        >
          <User size={16} />
        </button>
      )}
    >
      {() => (
        <div className="px-1 py-1">
          <p className="truncate px-2 py-1.5 text-[12.5px] text-faint" title={userEmail}>
            {userEmail}
          </p>
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

export default function TopBar({
  view,
  setView,
  wardrobeCount,
  userEmail,
  onSignOut,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
}) {
  return (
    <header className="glass-soft sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b border-white/40 px-4 py-3 sm:px-6">
      <span className="flex shrink-0 items-center gap-2 pr-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white shadow-soft">
          <Sparkle size={15} />
        </span>
        <span className="label hidden text-muted sm:inline">helloModa</span>
      </span>

      <nav className="flex items-center gap-1">
        <NavButton active={view === "chat"} icon={Chat} label="Chat" onClick={() => setView("chat")} />
        <NavButton
          active={view === "wardrobe"}
          icon={Hanger}
          label="Wardrobe"
          count={wardrobeCount}
          onClick={() => setView("wardrobe")}
        />
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {view === "chat" && (
          <ConversationMenu
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelect={onSelectConversation}
            onNewChat={onNewChat}
          />
        )}
        <AccountMenu userEmail={userEmail} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
