import { Sparkle, Chat, Hanger, Dress, Plus } from "./Icons.jsx";
import { styleMemory } from "../data/seed.js";

function NavItem({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl2 px-4 py-3 text-left text-[15px] transition-colors duration-200 ${
        active
          ? "bg-accent text-white shadow-soft"
          : "text-muted hover:bg-white/50 hover:text-ink"
      }`}
    >
      <Icon size={19} />
      <span className="font-medium">{label}</span>
      {count != null && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${
            active ? "bg-white/25 text-white" : "bg-white/60 text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ConversationList({ conversations, activeConversationId, onSelect, onNewChat }) {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-1">
        <p className="label text-faint">Conversations</p>
        <button
          onClick={onNewChat}
          aria-label="New chat"
          title="New chat"
          className="grid h-6 w-6 place-items-center rounded-full text-muted transition-colors hover:bg-white/60 hover:text-accent-deep"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="scroll-area mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-1 text-[12.5px] text-faint">No conversations yet.</p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full truncate rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${
                c.id === activeConversationId
                  ? "bg-accent-tint text-accent-deep"
                  : "text-muted hover:bg-white/50 hover:text-ink"
              }`}
              title={c.title}
            >
              {c.title || "Untitled"}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
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
    <aside className="glass-panel hidden w-[270px] shrink-0 flex-col border-r border-white/40 px-5 pb-5 pt-6 md:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white shadow-soft">
          <Sparkle size={17} />
        </span>
        <span className="label text-muted">helloModa</span>
      </div>

      {/* Style memory card */}
      <div className="glass mt-6 shrink-0 rounded-xl2 p-5 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-tint text-accent-deep">
          <Dress size={24} />
        </span>
        <h2 className="mt-3 font-display text-[19px] font-medium text-ink">
          Style memory
        </h2>
        <p className="mx-auto mt-2 max-w-[18ch] text-[12.5px] leading-relaxed text-muted">
          {styleMemory.traits.join(" · ")}
        </p>
      </div>

      {/* Nav */}
      <nav className="mt-6 shrink-0 space-y-1.5">
        <NavItem
          active={view === "chat"}
          icon={Chat}
          label="Chat"
          onClick={() => setView("chat")}
        />
        <NavItem
          active={view === "wardrobe"}
          icon={Hanger}
          label="Wardrobe"
          count={wardrobeCount}
          onClick={() => setView("wardrobe")}
        />
      </nav>

      {view === "chat" ? (
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={onSelectConversation}
          onNewChat={onNewChat}
        />
      ) : (
        <div className="mt-4 shrink-0 rounded-xl2 border border-dashed border-accent-soft bg-white/40 p-4">
          <p className="label text-accent-deep">Today&rsquo;s intent</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{styleMemory.intent}</p>
        </div>
      )}

      {/* Account */}
      {userEmail && (
        <div className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t border-white/40 px-1 pt-4">
          <span className="truncate text-[12px] text-faint" title={userEmail}>
            {userEmail}
          </span>
          {onSignOut && (
            <form action={onSignOut}>
              <button
                type="submit"
                className="shrink-0 text-[12px] font-medium text-muted hover:text-accent-deep"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      )}
    </aside>
  );
}
