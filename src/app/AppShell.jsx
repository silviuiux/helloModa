"use client";

import { useState, useTransition } from "react";
import TopBar from "@/components/TopBar.jsx";
import ChatView from "@/components/chat/ChatView.jsx";
import WardrobeView from "@/components/wardrobe/WardrobeView.jsx";
import { addWardrobeItem, toggleWardrobeFavorite, removeWardrobeItem } from "@/actions/wardrobe";
import { getConversationMessages } from "@/actions/conversations";
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

export default function AppShell({
  initialWardrobe,
  userEmail,
  userDisplayName,
  initialConversations,
  initialActiveConversationId,
  initialMessages,
}) {
  const [view, setView] = useState("chat");
  const [wardrobe, setWardrobe] = useState(initialWardrobe.map(dbRowToItem));
  const [conversations, setConversations] = useState(initialConversations || []);
  const [activeConversationId, setActiveConversationId] = useState(initialActiveConversationId);
  const [messages, setMessages] = useState(initialMessages || []);
  const [isSwitching, startSwitching] = useTransition();

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

  function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
  }

  function handleSelectConversation(id) {
    if (id === activeConversationId) return;
    startSwitching(async () => {
      setActiveConversationId(id);
      try {
        const msgs = await getConversationMessages(id);
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load conversation:", err);
        setMessages([]);
      }
    });
  }

  // Called by ChatView once a message round-trip creates a new conversation.
  function handleConversationCreated(id, title) {
    setActiveConversationId(id);
    setConversations((prev) => [{ id, title, created_at: new Date().toISOString() }, ...prev]);
  }

  return (
    <div
      className="relative flex h-screen w-full flex-col overflow-hidden font-sans text-ink"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <TopBar
        view={view}
        setView={setView}
        wardrobeCount={wardrobe.length}
        userEmail={userEmail}
        onSignOut={signOut}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
      <main className="relative flex min-h-0 flex-1 flex-col">
        {view === "chat" ? (
          <ChatView
            wardrobe={wardrobe}
            onWardrobeAdd={handleAdd}
            onWardrobeRemove={removeItem}
            conversationId={activeConversationId}
            messages={messages}
            setMessages={setMessages}
            onConversationCreated={handleConversationCreated}
            isSwitching={isSwitching}
            userEmail={userEmail}
            userDisplayName={userDisplayName}
          />
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
  );
}
