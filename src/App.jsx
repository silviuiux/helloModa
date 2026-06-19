import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatView from "./components/chat/ChatView.jsx";
import WardrobeView from "./components/wardrobe/WardrobeView.jsx";
import { Sparkle, Chat, Hanger } from "./components/Icons.jsx";
import { wardrobeItems as seedWardrobe } from "./data/seed.js";

function MobileBar({ view, setView }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-lav-50 px-4 py-2.5 md:hidden">
      <span className="mr-auto flex items-center gap-2 text-ink">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-lav-300 text-ink">
          <Sparkle size={14} />
        </span>
        <span className="label text-muted">helloModa</span>
      </span>
      <button
        onClick={() => setView("chat")}
        className={`grid h-9 w-9 place-items-center rounded-full ${
          view === "chat" ? "bg-ink text-paper" : "text-muted"
        }`}
        aria-label="Chat"
      >
        <Chat size={18} />
      </button>
      <button
        onClick={() => setView("wardrobe")}
        className={`grid h-9 w-9 place-items-center rounded-full ${
          view === "wardrobe" ? "bg-ink text-paper" : "text-muted"
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
    <div className="min-h-screen w-full bg-[#ecebf2] p-3 sm:p-5 lg:p-7 font-sans text-ink">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3.5rem)] max-w-[1480px] overflow-hidden rounded-xl3 bg-canvas shadow-lift ring-1 ring-line">
        <Sidebar view={view} setView={setView} wardrobeCount={wardrobe.length} />
        <main className="relative flex min-w-0 flex-1 flex-col bg-canvas">
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
