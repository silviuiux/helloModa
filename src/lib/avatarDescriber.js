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
  hair: z
    .string()
    .describe("Hair color and length in a few words, e.g. 'shoulder-length dark brown'"),
  hairTexture: z
    .string()
    .describe("Hair texture/type, e.g. 'straight', 'wavy', 'curly', 'coily', or 'bald'"),
  facialHair: z
    .string()
    .describe("Facial hair if any is visible, e.g. 'full beard', 'stubble', 'mustache', 'clean-shaven', or 'none' (use 'none' when not applicable, e.g. photo shows a woman or child)"),
  skinTone: z
    .string()
    .describe("Apparent skin tone in plain, neutral, non-stereotyping descriptive terms an illustrator would use, e.g. 'medium warm' or 'deep'"),
});

export const AVATAR_DESCRIBER_SYSTEM_PROMPT = `You are briefing a fashion illustrator who will paint a stylized watercolor figure to model outfits — you are NOT identifying or recognizing a person. From this one reference photo, write a brief, respectful, general physical-presentation description an illustrator needs to paint a figure that reads as "this person" in a watercolor portrait: hair color/length/texture, facial hair if any, and skin tone in plain neutral terms. Body build and age group are supplied separately by the user, not inferred by you — do not describe body shape or estimate age here. Do not describe facial features in identifying detail (exact face shape, eye shape, nose, distinguishing marks) — keep this to the level of detail a clothing catalog model brief would use, not a forensic or biometric description.`;
