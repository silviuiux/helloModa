"use server";

import { createClient } from "@/lib/supabase/server";
import { signLookImageUrl } from "@/lib/lookImages";

const CATEGORY_TO_TYPE = {
  Tops: "top",
  Bottoms: "bottoms",
  Dresses: "dress",
  Outerwear: "outerwear",
  Shoes: "shoe",
  Bags: "bag",
  Accessories: "accessory",
};

// Shared by getConversationMessages and listOutfitHistory — one
// outfit_recommendation_items row -> the card shape RecommendationCards.jsx expects.
function mapRecommendationItem(it) {
  if (it.wardrobe_items) {
    return {
      id: it.id,
      brand: it.wardrobe_items.brand,
      name: it.wardrobe_items.name,
      type: CATEGORY_TO_TYPE[it.wardrobe_items.category] || "top",
      price: null,
      retailer: "Closet",
      source: "closet",
    };
  }
  return {
    id: it.id,
    brand: it.suggested_brand,
    name: it.suggested_name,
    type: it.suggested_category || "top",
    price: null,
    retailer: "Suggested",
    source: "shop",
  };
}

export async function listConversations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// Loads one conversation's messages and reassembles them into the UI's
// message shape (src/components/chat/MessageBubble.jsx — see
// docs/09-conversation-design.md for the turn contract). Resolves
// closet-sourced pieces against the *current* wardrobe_items row (name/brand
// may have changed since the message was sent) rather than freezing a copy.
export async function getConversationMessages(conversationId) {
  const supabase = await createClient();

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (messagesError) throw new Error(messagesError.message);
  if (!messages?.length) return [];

  const assistantIds = messages.filter((m) => m.role === "assistant").map((m) => m.id);
  if (!assistantIds.length) {
    return messages.map((m) => ({ id: m.id, role: "user", text: m.content }));
  }

  const { data: recs, error: recsError } = await supabase
    .from("outfit_recommendations")
    .select("id, message_id, title, hero_prompt, quick_replies, generated_image_url")
    .in("message_id", assistantIds);
  if (recsError) throw new Error(recsError.message);

  const recIds = (recs || []).map((r) => r.id);
  let items = [];
  if (recIds.length) {
    const { data, error: itemsError } = await supabase
      .from("outfit_recommendation_items")
      .select(
        "id, recommendation_id, suggested_brand, suggested_name, suggested_category, wardrobe_items(id, name, brand, category)"
      )
      .in("recommendation_id", recIds);
    if (itemsError) throw new Error(itemsError.message);
    items = data || [];
  }

  return Promise.all(messages.map(async (m) => {
    if (m.role === "user") {
      return { id: m.id, role: "user", text: m.content };
    }
    const rec = (recs || []).find((r) => r.message_id === m.id);
    const pieces = rec
      ? items.filter((it) => it.recommendation_id === rec.id).map(mapRecommendationItem)
      : [];
    return {
      id: m.id,
      role: "ai",
      title: rec?.title || null,
      narrative: m.content,
      heroPrompt: rec?.hero_prompt || null,
      recommendationId: rec?.id || null,
      generatedImageUrl: rec?.generated_image_url ? await signLookImageUrl(supabase, rec.generated_image_url) : null,
      quickReplies: rec?.quick_replies || [],
      pieces,
    };
  }));
}

// Powers /outfits — one row per conversation, summarized by its most recent
// outfit recommendation (the one whose generated image becomes the row's
// cover photo). A conversation with no recommendation yet (e.g. abandoned
// after the first message, before a reply landed) is skipped — nothing to
// show as a row.
export async function listOutfitHistory() {
  const supabase = await createClient();

  const conversations = await listConversations();
  if (!conversations.length) return [];
  const conversationIds = conversations.map((c) => c.id);

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, conversation_id, content, created_at")
    .in("conversation_id", conversationIds)
    .eq("role", "assistant")
    .order("created_at", { ascending: false });
  if (messagesError) throw new Error(messagesError.message);
  if (!messages?.length) return [];

  const { data: recs, error: recsError } = await supabase
    .from("outfit_recommendations")
    .select("id, message_id, title, generated_image_url")
    .in(
      "message_id",
      messages.map((m) => m.id)
    );
  if (recsError) throw new Error(recsError.message);
  const recByMessageId = new Map((recs || []).map((r) => [r.message_id, r]));

  // messages are already newest-first — keep the first (=latest) message
  // per conversation that actually has a matching recommendation.
  const latestByConversation = new Map();
  for (const m of messages) {
    if (latestByConversation.has(m.conversation_id)) continue;
    const rec = recByMessageId.get(m.id);
    if (rec) latestByConversation.set(m.conversation_id, { message: m, rec });
  }

  const recIds = [...latestByConversation.values()].map((v) => v.rec.id);
  let itemsByRec = new Map();
  if (recIds.length) {
    const { data: items, error: itemsError } = await supabase
      .from("outfit_recommendation_items")
      .select(
        "id, recommendation_id, suggested_brand, suggested_name, suggested_category, wardrobe_items(id, name, brand, category)"
      )
      .in("recommendation_id", recIds);
    if (itemsError) throw new Error(itemsError.message);
    for (const it of items || []) {
      if (!itemsByRec.has(it.recommendation_id)) itemsByRec.set(it.recommendation_id, []);
      itemsByRec.get(it.recommendation_id).push(it);
    }
  }

  const rows = await Promise.all(
    conversations.map(async (c) => {
      const entry = latestByConversation.get(c.id);
      if (!entry) return null;
      const { message, rec } = entry;
      return {
        id: c.id,
        title: c.title || rec.title || "Untitled outfit",
        narrative: message.content,
        coverImageUrl: rec.generated_image_url
          ? await signLookImageUrl(supabase, rec.generated_image_url)
          : null,
        pieces: (itemsByRec.get(rec.id) || []).map(mapRecommendationItem),
      };
    })
  );

  return rows.filter(Boolean);
}
