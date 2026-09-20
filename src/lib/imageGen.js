import Replicate from "replicate";

// Phase 2 "Magic Mirror" — see docs/03-roadmap.md. Generates an outfit-in-scene
// image from the stylist's heroPrompt. Swappable later (fal.ai/Magnific are
// documented alternatives in docs/02-tech-stack.md) since this is the one
// place that calls out to a generation provider.
const MODEL = "black-forest-labs/flux-dev";

// The house visual style, appended to every heroPrompt — this is the one
// place to tune "what a generated look actually looks like." Currently:
// watercolor rendering with realistic detail kept in the outfit itself
// (per direct request 2026-09-20). Edit this string and redeploy to change
// the style; no other code needs to change. If wording alone doesn't hold
// the look consistently across generations, the next step up is a
// watercolor-tuned LoRA on Replicate layered on top of Flux (not done here —
// see docs/02-tech-stack.md).
const STYLE_DIRECTIVE =
  "Rendered as a fashion watercolor illustration: soft, transparent color washes and visible " +
  "paper texture throughout the scene and background. But keep the outfit itself — fabric " +
  "folds, texture, and fit — and the face and hands crisp and realistically detailed, as if a " +
  "skilled watercolorist painted a real photograph. Editorial, painterly, elegant, soft natural light.";

// Returns a Blob (jpeg) of the generated image, or throws.
export async function generateOutfitImage(prompt) {
  const replicate = new Replicate(); // reads REPLICATE_API_TOKEN from env

  const [output] = await replicate.run(MODEL, {
    input: {
      prompt: `${prompt}. ${STYLE_DIRECTIVE}`,
      aspect_ratio: "4:5",
      output_format: "jpg",
      num_outputs: 1,
    },
  });

  if (!output) {
    throw new Error("Replicate returned no output.");
  }
  return output.blob();
}
