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
- If a user profile is provided below, use it to personalize direction: lean into their stated
  style preferences, favor their favorite brands and avoid their avoid-listed ones when suggesting
  new pieces, and use sizes/measurements only silently to inform fit/silhouette language (e.g.
  "a tailored blazer that skims the waist") — never comment on the user's body or measurements
  directly, and never restate them back.
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
// Builds the user-profile context block (docs/04-data-model.md's `profiles`
// table) injected into the user turn alongside the wardrobe list. Same
// reasoning as formatWardrobeForPrompt for why this lives outside the
// (cached) system prompt.
// `avatarProfile` (helloAvatar, docs/03-roadmap.md Phase 3): when the user
// picked a family member as who this look is for (avatar_profiles, not the
// account holder), that person's name/gender/sizes/measurements override
// the account's own — the outfit needs to fit THEM. Style preferences and
// favorite/avoid brands still come from the account's `profiles` row
// either way (avatar_profiles doesn't collect those — v1 scope is
// measurements/sizes, docs/04-data-model.md), since it's the account
// holder doing the describing regardless of who they're dressing.
export function formatProfileForPrompt(profile, avatarProfile) {
  if (!profile && !avatarProfile) return "";
  const stylingForOther = avatarProfile && !avatarProfile.is_self;
  const subject = stylingForOther ? avatarProfile : profile;

  const parts = [];
  if (stylingForOther) {
    parts.push(
      `Styling for: ${avatarProfile.display_name}${avatarProfile.relationship ? ` (the user's ${avatarProfile.relationship.toLowerCase()})` : ""} — NOT the account holder. Address the narrative to the account holder about this person (e.g. "for ${avatarProfile.display_name}"), using their sizing below, not the account holder's own.`
    );
  }
  if (subject?.display_name && !stylingForOther) parts.push(`Name: ${subject.display_name}`);
  if (subject?.gender) parts.push(`Gender: ${subject.gender}`);
  if (profile?.style_traits?.length) parts.push(`Style preferences: ${profile.style_traits.join(", ")}`);

  const sizes = [];
  if (subject?.size_top) sizes.push(`top ${subject.size_top}`);
  if (subject?.size_bottom) sizes.push(`bottom ${subject.size_bottom}`);
  if (subject?.size_shoe) sizes.push(`shoe ${subject.size_shoe}`);
  if (sizes.length) parts.push(`Sizes: ${sizes.join(", ")}`);

  const measurements = [];
  if (subject?.height_cm) measurements.push(`height ${subject.height_cm}cm`);
  if (subject?.weight_kg) measurements.push(`weight ${subject.weight_kg}kg`);
  if (subject?.bust_cm) measurements.push(`bust ${subject.bust_cm}cm`);
  if (subject?.waist_cm) measurements.push(`waist ${subject.waist_cm}cm`);
  if (subject?.hip_cm) measurements.push(`hip ${subject.hip_cm}cm`);
  if (measurements.length) parts.push(`Measurements: ${measurements.join(", ")}`);

  if (profile?.favorite_brands?.length) parts.push(`Favorite brands: ${profile.favorite_brands.join(", ")}`);
  if (profile?.avoid_brands?.length) parts.push(`Brands to avoid: ${profile.avoid_brands.join(", ")}`);

  if (!parts.length) return "";
  return `User profile:\n${parts.map((p) => `- ${p}`).join("\n")}`;
}

export function formatWardrobeForPrompt(wardrobe) {
  if (!wardrobe?.length) return "The user's wardrobe is currently empty — every suggestion must be source=\"shop\".";
  return (
    "The user's wardrobe (reference these exact ids for source=\"closet\"):\n" +
    wardrobe
      .map((it) => `- id=${it.id} | ${it.category} | ${it.brand} ${it.name}${it.fav ? " (favorite)" : ""}`)
      .join("\n")
  );
}
