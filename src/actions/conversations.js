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

// Shared by getConversationMessages — one
// outfit_recommendation_items row -> the card shape RecommendationCards.jsx
// expects. `products` (real Awin-matched pieces, docs/05-integrations-
// affiliates.md) don't carry this app's own top/bottoms/dress/... type —
// their `category` is the retailer's own taxonomy string ("Sneakers",
// "Shirts") — so `type` here is only a placeholder-seed hint for the
// rare case a matched product has no image, not used for filtering.
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
  if (it.products) {
    return {
      id: it.id,
      brand: it.products.brand,
      name: it.products.name,
      type: "top",
      price: it.products.price_cents != null ? it.products.price_cents / 100 : null,
      currency: it.products.currency || "EUR",
      retailer: it.products.retailer,
      source: "shop",
      productUrl: it.products.product_url,
      imageUrl: it.products.image_url,
      matched: true,
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
    .select("id, message_id, title, hero_prompt, quick_replies, generated_image_url, kept_at")
    .in("message_id", assistantIds);
  if (recsError) throw new Error(recsError.message);

  const recIds = (recs || []).map((r) => r.id);
  let items = [];
  if (recIds.length) {
    const { data, error: itemsError } = await supabase
      .from("outfit_recommendation_items")
      .select(
        "id, recommendation_id, suggested_brand, suggested_name, suggested_category, wardrobe_items(id, name, brand, category), products(id, brand, name, retailer, price_cents, currency, product_url, image_url)"
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
      kept: Boolean(rec?.kept_at),
      pieces,
    };
  }));
}

// "Keep" on a look (/design-07): pins that one recommendation into the
// style journal's Kept section. RLS on outfit_recommendations (owner via
// message -> conversation) is what stops anyone keeping someone else's look.
export async function setLookKept(recommendationId, kept) {
  if (!recommendationId) throw new Error("Missing recommendation.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outfit_recommendations")
    .update({ kept_at: kept ? new Date().toISOString() : null })
    .eq("id", recommendationId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Look not found.");
}

// Style journal timeline (2026-10-02): put a look on a day. A date on or
// after today reads as "booked", an earlier one as "worn"; null clears it.
// RLS (owner via message -> conversation) scopes the update.
export async function setLookDate(recommendationId, date) {
  if (!recommendationId) throw new Error("Missing look.");
  if (date != null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("outfit_recommendations")
    .update({ event_date: date })
    .eq("id", recommendationId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Look not found.");
}

// Powers the /outfits timeline: every look worth remembering — the latest
// look of each conversation, plus any look that was kept or given a date
// (even an earlier one in a thread). One entry per look, unsorted; the
// timeline orders them by date.
export async function listJournalLooks() {
  const supabase = await createClient();

  const conversations = await listConversations();
  if (!conversations.length) return [];
  const conversationById = new Map(conversations.map((c) => [c.id, c]));

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, conversation_id, created_at")
    .in("conversation_id", [...conversationById.keys()])
    .eq("role", "assistant");
  if (messagesError) throw new Error(messagesError.message);
  if (!messages?.length) return [];
  const messageById = new Map(messages.map((m) => [m.id, m]));

  const { data: recs, error: recsError } = await supabase
    .from("outfit_recommendations")
    .select("id, message_id, title, generated_image_url, kept_at, event_date, created_at")
    .in("message_id", [...messageById.keys()]);
  if (recsError) throw new Error(recsError.message);

  const latestByConversation = new Map();
  for (const r of recs || []) {
    const conversationId = messageById.get(r.message_id)?.conversation_id;
    const current = latestByConversation.get(conversationId);
    if (!current || r.created_at > current.created_at) latestByConversation.set(conversationId, r);
  }
  const latestIds = new Set([...latestByConversation.values()].map((r) => r.id));
  const chosen = (recs || []).filter((r) => latestIds.has(r.id) || r.kept_at || r.event_date);
  if (!chosen.length) return [];

  const { data: items } = await supabase
    .from("outfit_recommendation_items")
    .select("recommendation_id")
    .in("recommendation_id", chosen.map((r) => r.id));
  const pieceCount = new Map();
  for (const it of items || []) pieceCount.set(it.recommendation_id, (pieceCount.get(it.recommendation_id) || 0) + 1);

  return Promise.all(
    chosen.map(async (r) => {
      const conversationId = messageById.get(r.message_id).conversation_id;
      return {
        id: r.id,
        conversationId,
        conversationTitle: conversationById.get(conversationId)?.title || null,
        title: r.title || "Untitled look",
        createdAt: r.created_at,
        eventDate: r.event_date,
        kept: Boolean(r.kept_at),
        pieces: pieceCount.get(r.id) || 0,
        coverImageUrl: r.generated_image_url ? await signLookImageUrl(supabase, r.generated_image_url) : null,
      };
    })
  );
}
