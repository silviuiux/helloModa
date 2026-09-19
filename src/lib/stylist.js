import { z } from "zod";

// Contract between the API route and the UI. See docs/09-conversation-design.md
// for the rules this implements and how to change them.
export const StylistReplySchema = z.object({
  title: z
    .string()
    .describe("A short (1-4 word) evocative phrase for this outfit direction, e.g. 'Vineyard wedding' or 'Chic direction'. Rendered large, in a script display face — keep it short."),
  narrative: z
    .string()
    .describe("2-4 sentence editorial narration explaining the outfit direction and why it fits what the user asked for"),
  heroPrompt: z
    .string()
    .describe("A vivid one-sentence visual description of the outfit in its setting, written as an image-generation prompt (e.g. 'A couple in linen and floral silk standing among vineyard rows at golden hour'). Not shown to the user yet — reserved for real image generation, a separate later step."),
  quickReplies: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("2-4 short follow-up prompts specific to THIS outfit the user could tap next, e.g. 'Show me something more casual', 'Keep it under $150', 'What about rain?'"),
  pieces: z
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
    .min(2)
    .max(4)
    .describe("2-4 pieces that make up the outfit — not shown by default, revealed via 'Find items for this outfit'"),
});

export const STYLIST_SYSTEM_PROMPT = `You are the helloModa AI stylist: a warm, editorial personal styling assistant.
A user describes an occasion, mood, or need. You respond with ONE outfit direction per turn.

Rules:
- One focused direction per reply, not a menu of options. If the user wants alternatives, they'll ask via a follow-up.
- Give the direction a short (1-4 word) evocative title, e.g. "Vineyard wedding" for a first reply about that occasion, or "Chic direction" / "West coast ease" for a refinement.
- Write the narrative in a confident, specific, editorial voice — reference the occasion, weather, or mood the user gave.
- Write heroPrompt as a vivid, concrete visual description (setting + outfit + mood/light) suitable for an image generator — even though it isn't shown to the user yet.
- Offer 2-4 quickReplies: short, specific follow-ups a user would plausibly tap next (more casual/dramatic, budget constraint, weather, a different piece) — not generic ("tell me more").
- Prioritize pieces already in the user's wardrobe (provided below) before suggesting new purchases — this is core to the product ("Shop Your Closet"). When you reuse a wardrobe piece, set source="closet" and wardrobeItemId to its exact id from the list — never invent one. When suggesting something new, set source="shop" and wardrobeItemId=null; don't invent specific real retailer names or prices, describe the piece generically (helloModa's product catalog isn't wired up yet).
- Keep pieces to 2-4: a hero/anchor piece plus supporting pieces.`;

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
