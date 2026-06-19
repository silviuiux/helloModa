import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatView from "./components/chat/ChatView.jsx";
import WardrobeView from "./components/wardrobe/WardrobeView.jsx";
import { Sparkle, Chat, Hanger } from "./components/Icons.jsx";
import { wardrobeItems as seedWardrobe } from "./data/seed.js";

function MobileBar({ view, setView }) {
  return (
    <div className="glass-soft flex items-center gap-2 border-b border-white/40 px-4 py-2.5 md:hidden">
      <span className="mr-auto flex items-center gap-2 text-ink">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white">
          <Sparkle size={14} />
        </span>
        <span className="label text-muted">helloModa</span>
      </span>
      <button
        onClick={() => setView("chat")}
        className={`grid h-9 w-9 place-items-center rounded-full ${
          view === "chat" ? "bg-accent text-white" : "text-muted"
        }`}
        aria-label="Chat"
      >
        <Chat size={18} />
      </button>
      <button
        onClick={() => setView("wardrobe")}
        className={`grid h-9 w-9 place-items-center rounded-full ${
          view === "wardrobe" ? "bg-accent text-white" : "text-muted"
        }`}
        aria-label="Wardrobe"
      >
        <Hanger size={18} />
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("chat"); // "chat" | "wardrobe"
  const [wardrobe, setWardrobe] = useState(seedWardrobe);

  function addWardrobeItem(item) {
    setWardrobe((prev) => [item, ...prev]);
  }
  function toggleFav(id) {
    setWardrobe((prev) =>
      prev.map((it) => (it.id === id ? { ...it, fav: !it.fav } : it))
    );
  }
  function removeItem(id) {
    setWardrobe((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden p-3 font-sans text-ink sm:p-5 lg:p-7"
      style={{ background: "radial-gradient(120% 95% at 18% 6%, #f4f2fa 0%, #e9e5f3 48%, #e0dbef 100%)" }}>
      {/* ambient HUD orbs */}
      <div className="pointer-events-none absolute -left-24 -top-28 h-[26rem] w-[26rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #c3b0f7, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full opacity-45 blur-3xl"
        style={{ background: "radial-gradient(circle, #b69bf2, transparent 70%)" }} />

      <div className="glass relative mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-xl3 sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3.5rem)]">
        <Sidebar view={view} setView={setView} wardrobeCount={wardrobe.length} />
        <main className="relative flex min-w-0 flex-1 flex-col">
          <MobileBar view={view} setView={setView} />
          {view === "chat" ? (
            <ChatView
              wardrobe={wardrobe}
              onWardrobeAdd={addWardrobeItem}
              onWardrobeRemove={removeItem}
            />
          ) : (
            <WardrobeView
              items={wardrobe}
              onAdd={addWardrobeItem}
              onToggleFav={toggleFav}
              onRemove={removeItem}
            />
          )}
        </main>
      </div>
    </div>
  );
}
