import { Sparkle, Chat, Hanger, Dress } from "./Icons.jsx";
import { styleMemory } from "../data/seed.js";

function NavItem({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl2 px-4 py-3 text-left text-[15px] transition-colors duration-200 ${
        active
          ? "bg-ink text-paper"
          : "text-muted hover:bg-lav-100 hover:text-ink"
      }`}
    >
      <Icon size={19} />
      <span className="font-medium">{label}</span>
      {count != null && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium ${
            active ? "bg-paper/15 text-paper" : "bg-lav-200 text-muted"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ view, setView, wardrobeCount }) {
  return (
    <aside className="hidden w-[270px] shrink-0 flex-col border-r border-line bg-lav-50 px-5 pb-5 pt-6 md:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-lav-300 text-ink">
          <Sparkle size={17} />
        </span>
        <span className="label text-muted">helloModa</span>
      </div>

      {/* Style memory card */}
      <div className="mt-6 rounded-xl2 bg-paper p-5 text-center shadow-soft ring-1 ring-line">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lav-100 text-accent">
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
      <nav className="mt-6 space-y-1.5">
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

      {/* Today's intent */}
      <div className="mt-auto rounded-xl2 border border-dashed border-lav-300 bg-lav-100/60 p-4">
        <p className="label text-accent">Today&rsquo;s intent</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {styleMemory.intent}
        </p>
      </div>
    </aside>
  );
}
