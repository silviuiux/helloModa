import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import {
  StylistReplySchema,
  STYLIST_SYSTEM_PROMPT,
  formatWardrobeForPrompt,
  formatProfileForPrompt,
} from "@/lib/stylist";

// Model choice: claude-opus-5 (current default per house policy). Swappable
// to claude-sonnet-5 here alone if per-message cost becomes a concern at
// real volume — see docs/07-costs-budget.md.
const MODEL = "claude-opus-5";
const HISTORY_TURNS = 10;

const CATEGORY_TO_TYPE = {
  Tops: "top",
  Bottoms: "bottoms",
  Dresses: "dress",
  Outerwear: "outerwear",
  Shoes: "shoe",
  Bags: "bag",
  Accessories: "accessory",
};

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });
  }
  const conversationId = body.conversationId || null;
  const avatarProfileId = body.avatarProfileId || null;

  // Resolve/verify the conversation server-side — never trust a client-passed
  // conversationId without checking it actually belongs to this user (RLS
  // would also block a cross-user write, but a clean 404 beats a silent RLS
  // no-op here).
  let conversation;
  let isNewConversation = false;
  if (conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title")
      .eq("id", conversationId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    conversation = data;
  } else {
    const title = message.length > 60 ? `${message.slice(0, 57)}...` : message;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id, title")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conversation = data;
    isNewConversation = true;
  }

  const { data: wardrobe, error: wardrobeError } = await supabase
    .from("wardrobe_items")
    .select("id, name, brand, category, is_favorite")
    .order("created_at", { ascending: false });
  if (wardrobeError) {
    return NextResponse.json({ error: wardrobeError.message }, { status: 500 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Failed to load profile for chat context:", profileError.message);
  }

  // RLS (owner-only) makes a cross-user id just come back null here — no
  // separate ownership check needed before using it.
  let avatarProfile = null;
  if (avatarProfileId) {
    const { data, error: avatarError } = await supabase
      .from("avatar_profiles")
      .select("id, is_self, display_name, relationship, gender, height_cm, weight_kg, bust_cm, waist_cm, hip_cm, size_top, size_bottom, size_shoe")
      .eq("id", avatarProfileId)
      .maybeSingle();
    if (avatarError) console.error("Failed to load avatar profile for chat context:", avatarError.message);
    avatarProfile = data || null;
  }

  const { data: priorMessages, error: priorError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })
    .limit(HISTORY_TURNS);
  if (priorError) {
    return NextResponse.json({ error: priorError.message }, { status: 500 });
  }

  const { data: userMessageRow, error: userMessageError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversation.id, role: "user", content: message })
    .select("id")
    .single();
  if (userMessageError) {
    return NextResponse.json({ error: userMessageError.message }, { status: 500 });
  }

  const contextBlock = [formatProfileForPrompt(profile, avatarProfile), formatWardrobeForPrompt(wardrobe)]
    .filter(Boolean)
    .join("\n\n");
  const apiMessages = [
    ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `${contextBlock}\n\nUser: ${message}`,
    },
  ];

  const client = new Anthropic();
  let parsed;
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      system: STYLIST_SYSTEM_PROMPT,
      messages: apiMessages,
      output_config: { format: zodOutputFormat(StylistReplySchema) },
    });
    if (!response.parsed_output) {
      return NextResponse.json(
        { error: "The stylist's reply couldn't be parsed. Try rephrasing." },
        { status: 502 }
      );
    }
    parsed = response.parsed_output;
  } catch (err) {
    console.error("Claude request failed:", err);
    Sentry.captureException(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Stylist AI isn't configured (missing/invalid API key)." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The stylist is a little overwhelmed — try again in a moment." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Stylist AI error: ${err.message}` }, { status: 502 });
    }
    return NextResponse.json({ error: "Couldn't reach the stylist AI." }, { status: 502 });
  }

  // Defensive: never trust a model-returned wardrobeItemId at face value.
  const wardrobeById = new Map((wardrobe || []).map((w) => [w.id, w]));
  const pieces = parsed.pieces.map((p) => {
    const wardrobeItem = p.source === "closet" ? wardrobeById.get(p.wardrobeItemId) : null;
    return wardrobeItem
      ? { source: "closet", wardrobeItem }
      : { source: "shop", brand: p.brand, name: p.name, type: p.type };
  });

  const { data: assistantMessageRow, error: assistantMessageError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversation.id, role: "assistant", content: parsed.narrative })
    .select("id")
    .single();
  if (assistantMessageError) {
    return NextResponse.json({ error: assistantMessageError.message }, { status: 500 });
  }

  const { data: recommendationRow, error: recommendationError } = await supabase
    .from("outfit_recommendations")
    .insert({
      message_id: assistantMessageRow.id,
      title: parsed.title,
      hero_prompt: parsed.heroPrompt,
      quick_replies: parsed.quickReplies,
      avatar_profile_id: avatarProfile?.id || null,
    })
    .select("id")
    .single();
  if (recommendationError) {
    return NextResponse.json({ error: recommendationError.message }, { status: 500 });
  }

  const itemRows = pieces.map((p) =>
    p.source === "closet"
      ? { recommendation_id: recommendationRow.id, wardrobe_item_id: p.wardrobeItem.id }
      : {
          recommendation_id: recommendationRow.id,
          suggested_brand: p.brand,
          suggested_name: p.name,
          suggested_category: p.type,
        }
  );
  const { data: insertedItems, error: itemsError } = await supabase
    .from("outfit_recommendation_items")
    .insert(itemRows)
    .select("id, wardrobe_item_id, suggested_brand, suggested_name, suggested_category");
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const uiPieces = insertedItems.map((it) => {
    if (it.wardrobe_item_id) {
      const w = wardrobeById.get(it.wardrobe_item_id);
      return {
        id: it.id,
        brand: w.brand,
        name: w.name,
        type: CATEGORY_TO_TYPE[w.category] || "top",
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
  });

  return NextResponse.json({
    conversationId: conversation.id,
    conversationTitle: isNewConversation ? conversation.title : undefined,
    userMessage: { id: userMessageRow.id, role: "user", text: message },
    message: {
      id: assistantMessageRow.id,
      role: "ai",
      title: parsed.title,
      narrative: parsed.narrative,
      heroPrompt: parsed.heroPrompt,
      recommendationId: recommendationRow.id,
      generatedImageUrl: null,
      quickReplies: parsed.quickReplies,
      pieces: uiPieces,
    },
  });
}
