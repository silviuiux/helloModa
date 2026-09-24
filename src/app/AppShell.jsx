"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import ConversationFromQuery from "@/components/ConversationFromQuery.jsx";
import FittingRoomLayout from "@/components/fitting/FittingRoomLayout.jsx";
import {
  addWardrobeItem,
  toggleWardrobeFavorite,
  removeWardrobeItem,
  setWardrobeItemPrice,
  logWardrobeItemWear,
} from "@/actions/wardrobe";
import { getConversationMessages } from "@/actions/conversations";
import { signOut } from "@/actions/auth";
import { identifyUser, track } from "@/lib/analytics";

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
    color: row.color_hex || "#2c2925",
    icon: ICON_BY_CATEGORY[row.category] || "hanger",
    tags: row.tags || [],
    fav: row.is_favorite,
    image: row.image_signed_url || null,
    priceCents: row.price_cents ?? null,
    wearCount: row.wear_count ?? 0,
    lastWornAt: row.last_worn_at || null,
  };
}

export default function AppShell({
  initialWardrobe,
  userId,
  userEmail,
  userDisplayName,
  initialConversations,
  initialActiveConversationId,
  initialMessages,
  initialAvatarProfiles,
}) {
  const [view, setView] = useState("chat");
  const [wardrobe, setWardrobe] = useState(initialWardrobe.map(dbRowToItem));
  const [conversations, setConversations] = useState(initialConversations || []);
  const [activeConversationId, setActiveConversationId] = useState(initialActiveConversationId);
  const [messages, setMessages] = useState(initialMessages || []);
  const [thinking, setThinking] = useState(false);
  // True while the composer has text in it — the welcome orb "listens".
  const [composing, setComposing] = useState(false);
  const [isSwitching, startSwitching] = useTransition();
  const [avatarProfiles] = useState(initialAvatarProfiles || []);
  // Defaults to "styling for myself" (or nothing, if no avatar is set up
  // yet) — a family member has to be actively picked each session, never
  // silently assumed.
  const [activeAvatarId, setActiveAvatarId] = useState(
    () => (initialAvatarProfiles || []).find((a) => a.is_self)?.id || null
  );

  useEffect(() => {
    if (userId) identifyUser(userId, { email: userEmail });
  }, [userId, userEmail]);

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
        imagePath: item.imagePath,
        priceCents: item.priceCents,
      });
      setWardrobe((prev) => prev.map((w) => (w.id === tempId ? dbRowToItem(saved) : w)));
      track("wardrobe_item_added", { category: item.category, has_photo: Boolean(item.imagePath) });
    } catch (err) {
      console.error("Failed to save wardrobe item:", err);
      setWardrobe((prev) => prev.filter((w) => w.id !== tempId));
    } finally {
      // The temp item's `image` is a local blob: URL (AddItemModal.jsx) handed
      // off for the optimistic card — safe to free once it's been swapped for
      // the server-confirmed signed URL (or dropped on failure).
      if (item.image?.startsWith("blob:")) URL.revokeObjectURL(item.image);
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

  async function setPrice(id, priceCents) {
    const current = wardrobe.find((it) => it.id === id);
    if (!current) return;
    const previous = current.priceCents;
    setWardrobe((prev) => prev.map((it) => (it.id === id ? { ...it, priceCents } : it)));
    try {
      await setWardrobeItemPrice(id, priceCents);
    } catch (err) {
      console.error("Failed to update price:", err);
      setWardrobe((prev) => prev.map((it) => (it.id === id ? { ...it, priceCents: previous } : it)));
    }
  }

  async function logWear(id) {
    const current = wardrobe.find((it) => it.id === id);
    if (!current) return;
    const now = new Date().toISOString();
    setWardrobe((prev) =>
      prev.map((it) => (it.id === id ? { ...it, wearCount: it.wearCount + 1, lastWornAt: now } : it))
    );
    try {
      await logWardrobeItemWear(id);
      track("wardrobe_item_worn", { category: current.category });
    } catch (err) {
      console.error("Failed to log wear:", err);
      setWardrobe((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, wearCount: current.wearCount, lastWornAt: current.lastWornAt } : it
        )
      );
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
    setView("chat");
  }

  function handleSelectConversation(id) {
    if (id === activeConversationId) return;
    setView("chat");
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

  // The composer lives in the global bottom bar now, not inside ChatView —
  // sending from any view (e.g. while on Wardrobe) switches to Chat.
  async function handleSend(text) {
    if (thinking) return;
    setView("chat");
    const tempId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", text }]);
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId, message: text, avatarProfileId: activeAvatarId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: "ai", title: null, narrative: data.error || "That one didn't go through — mind sending it again?" },
        ]);
        return;
      }

      // `fresh` makes MessageBubble stream the narrative in word by word —
      // only for a reply that just arrived, never for loaded history.
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        { ...data.message, fresh: true },
      ]);
      track("chat_message_sent", { is_new_conversation: !activeConversationId });

      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
        setConversations((prev) => [
          { id: data.conversationId, title: data.conversationTitle, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "ai", title: null, narrative: "I can't reach helloModa right now. Check your connection and try again." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const lastAiMessage = [...messages].reverse().find((m) => m.role === "ai" && m.title);
  const shareText = lastAiMessage
    ? `${lastAiMessage.title} — ${lastAiMessage.narrative}\n\nStyled by helloModa.`
    : undefined;

  // Design exploration, branch design/chat-fitting-room: the whole signed-in surface is
  // handed to one layout component as a single `shell` bundle — the same
  // state and handlers as main (sending, history, avatars, wardrobe), only
  // the layout around them changes. Nothing below this line touches data.
  const shell = {
    view,
    setView,
    wardrobe,
    messages,
    thinking,
    isSwitching,
    composing,
    setComposing,
    onSend: handleSend,
    conversations,
    activeConversationId,
    onSelectConversation: handleSelectConversation,
    onNewChat: handleNewChat,
    userEmail,
    userDisplayName,
    onSignOut: signOut,
    shareText,
    avatarProfiles,
    activeAvatarId,
    onSelectAvatar: setActiveAvatarId,
    wardrobeActions: {
      onAdd: handleAdd,
      onToggleFav: toggleFav,
      onRemove: removeItem,
      onSetPrice: setPrice,
      onLogWear: logWear,
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <ConversationFromQuery onConversationId={handleSelectConversation} />
      </Suspense>
      <FittingRoomLayout shell={shell} />
    </>
  );
}
