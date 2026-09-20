import Replicate from "replicate";
import sharp from "sharp";

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
  "skilled watercolorist painted a real photograph. Editorial, painterly, elegant, soft natural " +
  "light. Composed with generous empty space toward the edges of the frame, like an unfinished " +
  "watercolor painting on paper — the subject sits within the frame, not cropped by it.";

// Feathers the image's edges to transparent (a soft elliptical vignette,
// not a hard rectangle) and composites it onto solid white — guarantees the
// "doesn't reach the photo edge, watercolor-like margins" look regardless of
// what the model actually draws, since prompt wording alone is unreliable
// for a compositional instruction like this (per direct request 2026-09-20).
// Tune the gradient stop (currently 58%) to make the painted area bigger/
// smaller relative to the white margin.
async function applyWatercolorMargin(buffer) {
  const image = sharp(buffer);
  const { width, height } = await image.metadata();

  const maskSvg = `<svg width="${width}" height="${height}">
    <defs>
      <radialGradient id="fade" cx="50%" cy="50%" r="50%">
        <stop offset="58%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#fade)"/>
  </svg>`;

  // .png() here is load-bearing: without an explicit alpha-capable format,
  // toBuffer() falls back to the source's jpeg encoding and silently drops
  // the alpha channel (flattening the faded edges to black instead of
  // leaving them transparent for the white composite below).
  const faded = await image
    .ensureAlpha()
    .composite([{ input: Buffer.from(maskSvg), blend: "dest-in" }])
    .png()
    .toBuffer();

  return sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite([{ input: faded }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

// Returns a Buffer (jpeg) of the generated image, or throws.
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

  const raw = Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
  return applyWatercolorMargin(raw);
}
