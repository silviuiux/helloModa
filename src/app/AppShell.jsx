"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar.jsx";
import ChatView from "@/components/chat/ChatView.jsx";
import WardrobeView from "@/components/wardrobe/WardrobeView.jsx";
import { Sparkle, Chat, Hanger } from "@/components/Icons.jsx";
import { addWardrobeItem, toggleWardrobeFavorite, removeWardrobeItem } from "@/actions/wardrobe";
import { signOut } from "@/actions/auth";

const ICON_BY_CATEGORY = {
  Tops: "shirt",
  Bottoms: "hanger",
  Dresses: "dress",
  Outerwear: "hanger",
  Shoes: "shoe",
  Bags: "bag",
  Accessories: "sparkle",
};

// DB row (docs/04-data-model.md `wardrobe_items`) -> the shape the existing UI expects.
function dbRowToItem(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    color: row.color_hex || "#e4e2f0",
    icon: ICON_BY_CATEGORY[row.category] || "hanger",
    tags: row.tags || [],
    fav: row.is_favorite,
  };
}

function MobileBar({ view, setView, wardrobeCount }) {
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

// The wardrobe view is real, DB-backed data (per-user, via RLS) — new accounts
// start empty. Chat still runs on seed data until the LLM is wired up in Phase 1
// (docs/03-roadmap.md).
export default function AppShell({ initialWardrobe, userEmail }) {
  const [view, setView] = useState("chat");
  const [wardrobe, setWardrobe] = useState(initialWardrobe.map(dbRowToItem));

  async function handleAdd(item) {
    const tempId = item.id;
    setWardrobe((prev) => [item, ...prev]);
    try {
      const saved = await addWardrobeItem({
        name: item.name,
        brand: item.brand,
        category: item.category,
        color: item.color,
        tags: item.tags,
      });
      setWardrobe((prev) => prev.map((w) => (w.id === tempId ? dbRowToItem(saved) : w)));
    } catch (err) {
      console.error("Failed to save wardrobe item:", err);
      setWardrobe((prev) => prev.filter((w) => w.id !== tempId));
    }
  }

  async function toggleFav(id) {
    const current = wardrobe.find((it) => it.id === id);
    if (!current) return;
    const nextFav = !current.fav;
    setWardrobe((prev) => prev.map((it) => (it.id === id ? { ...it, fav: nextFav } : it)));
    try {
      await toggleWardrobeFavorite(id, nextFav);
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setWardrobe((prev) => prev.map((it) => (it.id === id ? { ...it, fav: !nextFav } : it)));
    }
  }

  async function removeItem(id) {
    const removed = wardrobe.find((it) => it.id === id);
    setWardrobe((prev) => prev.filter((it) => it.id !== id));
    try {
      await removeWardrobeItem(id);
    } catch (err) {
      console.error("Failed to remove item:", err);
      if (removed) setWardrobe((prev) => [removed, ...prev]);
    }
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden p-3 font-sans text-ink sm:p-5 lg:p-7"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -left-24 -top-28 h-[26rem] w-[26rem] rounded-full opacity-[0.34] blur-3xl"
        style={{ background: "radial-gradient(circle, #cdbef7, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 h-[30rem] w-[30rem] rounded-full opacity-[0.34] blur-3xl"
        style={{ background: "radial-gradient(circle, #bba8f2, transparent 70%)" }}
      />

      <div className="glass relative mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-xl3 sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3.5rem)]">
        <Sidebar
          view={view}
          setView={setView}
          wardrobeCount={wardrobe.length}
          userEmail={userEmail}
          onSignOut={signOut}
        />
        <main className="relative flex min-w-0 flex-1 flex-col">
          <MobileBar view={view} setView={setView} wardrobeCount={wardrobe.length} />
          {view === "chat" ? (
            <ChatView wardrobe={wardrobe} onWardrobeAdd={handleAdd} onWardrobeRemove={removeItem} />
          ) : (
            <WardrobeView
              items={wardrobe}
              onAdd={handleAdd}
              onToggleFav={toggleFav}
              onRemove={removeItem}
            />
          )}
        </main>
      </div>
    </div>
  );
}
