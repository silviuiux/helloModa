"use client";

import Link from "next/link";
import { useState } from "react";
import Orb from "../Orb.jsx";
import { Plus, Chat, Hanger, History, Share, User, ChevronDown } from "../Icons.jsx";

// Design exploration, branch design/chat-studio-sidebar: every action that
// lived in the floating bottom bar on main (new chat, chat/wardrobe
// switch, history, avatar picker, share, account) moves into one
// collapsible side menu. Expanded: a 280px panel with labels, the "styling
// for" avatar picker and the recent-looks list inline. Collapsed: a 76px
// icon rail (labels become tooltips). On phones it's an off-canvas drawer
// opened from the header, always shown expanded.

function RailItem({ icon: Icon, label, active, collapsed, onClick, href, badge }) {
  const cls = `group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors ${
    active ? "bg-accent-tint text-accent-deep" : "text-muted hover:bg-black/[0.04] hover:text-ink"
  } ${collapsed ? "justify-center px-0" : ""}`;
  const inner = (
    <>
      <span className="relative grid h-5 w-5 shrink-0 place-items-center">
        <Icon size={19} />
        {badge > 0 && collapsed && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && badge > 0 && (
        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold text-muted">{badge}</span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} title={collapsed ? label : undefined} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button onClick={onClick} title={collapsed ? label : undefined} className={cls}>
      {inner}
    </button>
  );
}

function SectionLabel({ children }) {
  return <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{children}</p>;
}

function ShareItem({ shareText, collapsed }) {
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    const text = shareText || "Styled by helloModa — the AI stylist that starts in your closet.";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text, title: "helloModa" });
      } catch {
        // cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }
  return <RailItem icon={Share} label={copied ? "Copied" : "Share this look"} collapsed={collapsed} onClick={handleShare} />;
}

export default function SideMenu({ shell, collapsed, onToggleCollapsed, onNavigate, mobile = false }) {
  const {
    view,
    setView,
    wardrobe,
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    userEmail,
    onSignOut,
    shareText,
    avatarProfiles,
    activeAvatarId,
    onSelectAvatar,
    thinking,
  } = shell;
  const isCollapsed = mobile ? false : collapsed;
  const go = (fn) => () => {
    fn();
    onNavigate?.();
  };

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-black/[0.06] bg-white transition-[width] duration-300 ease-out ${
        isCollapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className={`flex h-16 shrink-0 items-center gap-2.5 px-4 ${isCollapsed ? "justify-center px-0" : ""}`}>
        <Orb size={26} mini state={thinking ? "thinking" : "idle"} />
        {!isCollapsed && <span className="flex-1 text-[16px] font-semibold tracking-[-0.02em] text-ink">helloModa</span>}
        {!mobile && (
          <button
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
            title={isCollapsed ? "Expand menu" : "Collapse menu"}
            className={`grid h-8 w-8 place-items-center rounded-lg text-faint transition-colors hover:bg-black/[0.04] hover:text-ink ${
              isCollapsed ? "absolute left-[60px] top-4 z-10 border border-black/[0.06] bg-white shadow-sm" : ""
            }`}
          >
            <ChevronDown size={16} className={isCollapsed ? "-rotate-90" : "rotate-90"} />
          </button>
        )}
      </div>

      <div className="px-3">
        <button
          onClick={go(onNewChat)}
          title={isCollapsed ? "New look" : undefined}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-semibold text-white transition-colors hover:bg-accent-deep`}
        >
          <Plus size={17} />
          {!isCollapsed && "New look"}
        </button>
      </div>

      <div className="scroll-area mt-2 flex-1 overflow-y-auto px-3 pb-4">
        {!isCollapsed && <SectionLabel>Studio</SectionLabel>}
        <div className={`space-y-0.5 ${isCollapsed ? "mt-3" : ""}`}>
          <RailItem icon={Chat} label="Stylist" active={view === "chat"} collapsed={isCollapsed} onClick={go(() => setView("chat"))} />
          <RailItem
            icon={Hanger}
            label="Wardrobe"
            active={view === "wardrobe"}
            collapsed={isCollapsed}
            badge={wardrobe.length}
            onClick={go(() => setView("wardrobe"))}
          />
          <RailItem icon={History} label="Style journal" collapsed={isCollapsed} href={shell.journalHref || "/outfits"} />
        </div>

        {avatarProfiles?.length > 0 && (
          <>
            {!isCollapsed ? <SectionLabel>Styling for</SectionLabel> : <div className="mx-3 my-3 h-px bg-black/[0.06]" />}
            <div className={isCollapsed ? "flex flex-col items-center gap-2" : "flex flex-wrap gap-2 px-2"}>
              {!isCollapsed && (
                <button
                  onClick={() => onSelectAvatar(null)}
                  className={`h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors ${
                    !activeAvatarId ? "bg-ink text-white" : "bg-black/[0.04] text-muted hover:text-ink"
                  }`}
                >
                  No avatar
                </button>
              )}
              {avatarProfiles
                .filter((a) => !isCollapsed || a.id === activeAvatarId)
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelectAvatar(a.id)}
                    title={a.is_self ? "Myself" : a.display_name}
                    className={`flex h-8 items-center rounded-full text-[12.5px] font-medium transition-colors ${
                      a.id === activeAvatarId ? "bg-ink text-white" : "bg-black/[0.04] text-muted hover:text-ink"
                    } ${isCollapsed ? "w-8 justify-center ring-2 ring-accent ring-offset-2" : "gap-2 pl-1 pr-3"}`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
                      {a.avatar_image_signed_url ? (
                        <img src={a.avatar_image_signed_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User size={12} className="text-faint" />
                      )}
                    </span>
                    {!isCollapsed && (a.is_self ? "Myself" : a.display_name)}
                  </button>
                ))}
            </div>
          </>
        )}

        {!isCollapsed && (
          <>
            <SectionLabel>Recent looks</SectionLabel>
            <div className="space-y-0.5">
              {conversations.length === 0 ? (
                <p className="px-3 py-1.5 text-[13px] text-faint">No looks yet.</p>
              ) : (
                conversations.slice(0, 12).map((c) => (
                  <button
                    key={c.id}
                    onClick={go(() => onSelectConversation(c.id))}
                    title={c.title}
                    className={`block w-full truncate rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors ${
                      c.id === activeConversationId
                        ? "bg-black/[0.05] font-medium text-ink"
                        : "text-muted hover:bg-black/[0.03] hover:text-ink"
                    }`}
                  >
                    {c.title || "Untitled look"}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 space-y-0.5 border-t border-black/[0.06] p-3">
        <ShareItem shareText={shareText} collapsed={isCollapsed} />
        <RailItem icon={User} label="Profile & avatars" collapsed={isCollapsed} href="/profile" />
        {userEmail && (
          <form action={onSignOut}>
            <button
              type="submit"
              title={isCollapsed ? `Sign out (${userEmail})` : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-black/[0.04] ${
                isCollapsed ? "justify-center px-0" : ""
              }`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-tint text-[12px] font-semibold uppercase text-accent-deep">
                {userEmail[0]}
              </span>
              {!isCollapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-ink">{userEmail}</span>
                  <span className="block text-[11.5px] text-faint">Sign out</span>
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
