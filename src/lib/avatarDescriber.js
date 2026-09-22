import { z } from "zod";

// Contract for POST /api/avatar/generate's vision step. This is the ONE
// place a helloAvatar reference photo is ever looked at — the photo itself
// is never stored (docs/08-changelog.md, 2026-09-22 entry) or passed on
// anywhere else; this call turns it into a short illustrator's brief and
// the photo is discarded the moment this returns. Deliberately asks for
// general physical presentation for a fashion illustration, not an
// identifying description — no facial-feature detail, no attempt at
// recognition, nothing that functions as a biometric template.
export const AvatarAppearanceSchema = z.object({
  build: z
    .string()
    .describe("Brief, respectful description of apparent build/height impression for fit purposes, e.g. 'average height, slim build' or 'tall, athletic build'"),
  hair: z
    .string()
    .describe("Hair color, length, and style in a few words, e.g. 'shoulder-length wavy dark brown'"),
  skinTone: z
    .string()
    .describe("Apparent skin tone in plain, neutral, non-stereotyping descriptive terms an illustrator would use, e.g. 'medium warm' or 'deep'"),
});

export const AVATAR_DESCRIBER_SYSTEM_PROMPT = `You are briefing a fashion illustrator who will paint a stylized watercolor figure to model outfits — you are NOT identifying or recognizing a person. From this one reference photo, write a brief, respectful, general physical-presentation description an illustrator needs to paint a figure that reads as "this person" in a watercolor portrait: apparent build/height impression, hair color/length/style, and skin tone in plain neutral terms. Do not describe facial features in identifying detail (exact face shape, eye shape, nose, distinguishing marks) — keep this to the level of detail a clothing catalog model brief would use, not a forensic or biometric description. Never mention age as a specific number, only broad presentation if relevant to sizing (e.g. "adult", "child").`;
