import { z } from "zod";

// Contract for POST /api/wardrobe/tag — a vision call that turns a wardrobe
// photo into prefilled AddItemModal fields. See docs/03-roadmap.md's Phase 1
// "Digital closet" item and docs/04-data-model.md's `wardrobe_items`.
export const WardrobeTagSchema = z.object({
  name: z
    .string()
    .describe("Short descriptive name for the piece, e.g. 'Ivory sheer knit' or 'Black leather ankle boots'"),
  category: z
    .enum(["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories"])
    .describe("Best-fit wardrobe category for this item"),
  colorHex: z
    .string()
    .describe("Approximate hex code of the item's dominant color, e.g. '#1c1a17'"),
  brand: z
    .string()
    .nullable()
    .describe(
      "Brand name ONLY if a logo or label is clearly legible in the photo. Null otherwise — never guess a brand from style alone."
    ),
});

export const WARDROBE_TAG_SYSTEM_PROMPT = `You are a fashion cataloging assistant for helloModa's digital closet. Given a single photo of one clothing/accessory item, identify its attributes precisely and concisely for a wardrobe database entry. Only report a brand when a logo or label is actually visible and legible — otherwise return null; never infer a brand from silhouette or style alone.`;
