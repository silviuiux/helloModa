import { z } from "zod";

// Shape of one structured stylist reply. Mirrors the UI's message shape
// (src/components/chat/MessageBubble.jsx, RecommendationCards.jsx) so the
// route handler's output plugs straight into the existing components.
export const StylistReplySchema = z.object({
  title: z
    .string()
    .describe("Short evocative name for this outfit direction, e.g. 'The relaxed gallery column'"),
  text: z
    .string()
    .describe("2-4 sentence stylist narration explaining the outfit direction, in a warm, editorial voice"),
  cards: z
    .array(
      z.object({
        brand: z.string().describe("Brand name"),
        name: z.string().describe("Short product/piece name, e.g. 'Sheer rib knit'"),
        type: z.enum(["top", "bottoms", "dress", "outerwear", "shoe", "bag", "accessory"]),
        source: z
          .enum(["closet", "shop"])
          .describe(
            "'closet' ONLY if this reuses an item from the provided wardrobe list (in which case wardrobeItemId must be that item's exact id). 'shop' for a new piece you're suggesting to buy."
          ),
        wardrobeItemId: z
          .string()
          .nullable()
          .describe("Exact id from the provided wardrobe list when source='closet'. Null when source='shop'. Never invent an id."),
      })
    )
    .min(1)
    .max(4)
    .describe("2-4 pieces that make up the outfit"),
  followup: z
    .string()
    .nullable()
    .describe("One short clarifying question to ask next (comfort/budget/drama/weather tradeoffs), or null if none"),
});

export const STYLIST_SYSTEM_PROMPT = `You are the helloModa AI stylist: a warm, editorial personal styling assistant.
A user describes an occasion, mood, or need. You respond with ONE outfit direction.

Rules:
- Prioritize pieces already in the user's wardrobe (provided below) before suggesting new purchases — this is core to the product ("Shop Your Closet").
- When you reuse a wardrobe piece, set source="closet" and wardrobeItemId to its exact id from the list. Never invent an id or use one not in the list.
- When you suggest something new to buy, set source="shop" and wardrobeItemId=null. Do not invent specific real retailer names or prices — helloModa's product catalog isn't wired up yet, so describe the piece generically (brand can be a plausible style descriptor, not a claim about a real product).
- Keep the outfit to 2-4 pieces: a hero/anchor piece plus supporting pieces.
- Write in a confident, specific, editorial voice — reference the occasion, weather, or mood the user gave you.
- End with a short, genuinely useful clarifying question when it would help (comfort vs. drama vs. budget vs. weather protection), otherwise leave followup null.`;

// Builds the wardrobe list block injected into the user turn so Claude can
// reference real ids. Kept separate from the system prompt (system prompt
// caches; wardrobe content doesn't change turn-to-turn as often but isn't
// stable enough to be worth its own cache breakpoint at this scale).
export function formatWardrobeForPrompt(wardrobe) {
  if (!wardrobe?.length) return "The user's wardrobe is currently empty — every suggestion must be source=\"shop\".";
  return (
    "The user's wardrobe (reference these exact ids for source=\"closet\"):\n" +
    wardrobe
      .map((it) => `- id=${it.id} | ${it.category} | ${it.brand} ${it.name}${it.fav ? " (favorite)" : ""}`)
      .join("\n")
  );
}
