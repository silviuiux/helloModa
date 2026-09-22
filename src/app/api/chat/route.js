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
import { matchProducts } from "@/lib/productMatching";

// Model choice: claude-opus-5 (current default per house policy). Swappable
// to claude-sonnet-5 here alone if per-message cost becomes a concern at
// real volume — see docs/07-costs-budget.md.
const MODEL = "claude-opus-5";
const HISTORY_TURNS = 10;

// Awin product matching (docs/05-integrations-affiliates.md) — how confident
// a pgvector cosine-similarity hit has to be before a "shop" suggestion
// resolves to a real, buyable product instead of staying an honest AI text
// guess. Picked without real match data to calibrate against — the synced
// Italist catalog has no embeddings populated in production yet (checked
// directly against Supabase 2026-09-22: 0 of 25,100 rows), so this number
// is a reasonable CLIP-similarity starting point, not a tuned value. Revisit
// once there's real embedding data to eyeball good vs. bad matches against.
const PRODUCT_MATCH_MIN_SIMILARITY = 0.26;

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
  // "shop" pieces get one shot at resolving to a real, buyable product
  // (Awin-synced catalog) before falling back to the honest AI text guess
  // this app has always shown — never a live retailer API call in the
  // request path (docs/05-integrations-affiliates.md), just a pgvector
  // lookup against the pre-synced `products` cache. Deliberately NOT
  // filtered by category: verified directly against the real Italist data
  // that its own category strings ("Sneakers", "Shirts", "Clothing
  // Accessories") don't line up with this app's top/bottoms/dress/...
  // enum, and that mismatch would only get worse across different
  // retailers' own taxonomies — semantic similarity on the description
  // alone is the more robust filter across advertisers.
  const pieces = await Promise.all(
    parsed.pieces.map(async (p) => {
      const wardrobeItem = p.source === "closet" ? wardrobeById.get(p.wardrobeItemId) : null;
      if (wardrobeItem) return { source: "closet", wardrobeItem };

      let product = null;
      try {
        const [top] = await matchProducts(supabase, `${p.brand} ${p.name}`.trim(), { limit: 1 });
        if (top && top.similarity >= PRODUCT_MATCH_MIN_SIMILARITY) product = top;
      } catch (err) {
        console.error("Product match failed, falling back to AI suggestion:", err);
      }
      return product
        ? { source: "shop", type: p.type, product }
        : { source: "shop", brand: p.brand, name: p.name, type: p.type };
    })
  );

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

  const itemRows = pieces.map((p) => {
    if (p.source === "closet") {
      return { recommendation_id: recommendationRow.id, wardrobe_item_id: p.wardrobeItem.id };
    }
    if (p.product) {
      return { recommendation_id: recommendationRow.id, product_id: p.product.id };
    }
    return {
      recommendation_id: recommendationRow.id,
      suggested_brand: p.brand,
      suggested_name: p.name,
      suggested_category: p.type,
    };
  });
  const { data: insertedItems, error: itemsError } = await supabase
    .from("outfit_recommendation_items")
    .insert(itemRows)
    .select("id, wardrobe_item_id, product_id, suggested_brand, suggested_name, suggested_category");
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Zips back up with `pieces` by index — safe here because both arrays
  // come from the same single-statement INSERT...RETURNING above, which
  // preserves row order; `it.product_id` alone isn't enough to rebuild the
  // full product (brand/price/image/etc.) without a second query, and the
  // matched row is already sitting in memory from the match above.
  const uiPieces = insertedItems.map((it, i) => {
    const p = pieces[i];
    if (p.source === "closet") {
      const w = p.wardrobeItem;
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
    if (p.product) {
      return {
        id: it.id,
        brand: p.product.brand,
        name: p.product.name,
        type: p.type || "top",
        price: p.product.price_cents != null ? p.product.price_cents / 100 : null,
        currency: p.product.currency || "EUR",
        retailer: p.product.retailer,
        source: "shop",
        productUrl: p.product.product_url,
        imageUrl: p.product.image_url,
        matched: true,
      };
    }
    return {
      id: it.id,
      brand: p.brand,
      name: p.name,
      type: p.type || "top",
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
