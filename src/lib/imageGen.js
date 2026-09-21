import Replicate from "replicate";

// Phase 2 "Magic Mirror" — see docs/03-roadmap.md. Generates an outfit-in-scene
// image from the stylist's heroPrompt. Swappable later (fal.ai/Magnific are
// documented alternatives in docs/02-tech-stack.md) since this is the one
// place that calls out to a generation provider.
const MODEL = "black-forest-labs/flux-dev";

// The house visual style, prepended to every heroPrompt — this is the one
// place to tune "what a generated look actually looks like." Currently:
// watercolor rendering with realistic detail kept in the outfit itself
// (per direct request 2026-09-20). Edit this string and redeploy to change
// the style; no other code needs to change.
//
// Goes FIRST, not appended after the scene description — Flux (like most
// diffusion prompt encoders) weights earlier tokens more heavily, and a
// trailing style clause lost outright to a heroPrompt written as vivid
// photographic scene description (verified against a real generation
// 2026-09-20: fully photorealistic, zero watercolor quality). Also worded
// more forcefully ("NOT a photograph") since Flux's photorealism bias is
// strong. If this still doesn't hold consistently once you see a few more
// real generations, the next step up is a watercolor-tuned LoRA on
// Replicate layered on top of Flux (not done here — see docs/02-tech-stack.md).
const STYLE_DIRECTIVE =
  "Watercolor fashion illustration — NOT a photograph. Hand-painted with visible brushstrokes, " +
  "translucent color washes, and visible watercolor paper texture across the entire image, " +
  "especially the background, lighting, and clothing fabric. Soft painterly edges throughout. " +
  "Despite the painted medium, render the face, hands, and the outfit's fit and fabric folds " +
  "with careful, realistic detail — as if a highly skilled watercolor artist painted from a " +
  "real photograph. Editorial fashion illustration, elegant, soft natural light.";

// Returns a Buffer (jpeg) of the generated image, or throws. `aspectRatio`
// MUST match the display container's actual crop — a mismatch gets
// object-cover-cropped and can cut the subject off (caught 2026-09-21, the
// chat hero image briefly hardcoded "3:2" here for every caller, silently
// setting up the same bug for the then-portrait guide-image script next
// time it ran). Callers: /api/generate-image passes "3:2" (MessageBubble.jsx's
// side-by-side turn layout), scripts/generate-guide-images.mjs and
// scripts/generate-occasion-images.mjs pass "4:5" (their portrait cards).
export async function generateOutfitImage(prompt, aspectRatio) {
  if (!aspectRatio) {
    throw new Error("generateOutfitImage requires an aspectRatio matching the display crop.");
  }
  const replicate = new Replicate(); // reads REPLICATE_API_TOKEN from env

  const [output] = await replicate.run(MODEL, {
    input: {
      prompt: `${STYLE_DIRECTIVE} Scene: ${prompt}`,
      aspect_ratio: aspectRatio,
      output_format: "jpg",
      num_outputs: 1,
    },
  });

  if (!output) {
    throw new Error("Replicate returned no output.");
  }

  return Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
}
