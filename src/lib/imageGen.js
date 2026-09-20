import Replicate from "replicate";

// Phase 2 "Magic Mirror" — see docs/03-roadmap.md. Generates a photorealistic
// outfit-in-scene image from the stylist's heroPrompt. Swappable later (fal.ai/
// Magnific are documented alternatives in docs/02-tech-stack.md) since this is
// the one place that calls out to a generation provider.
const MODEL = "black-forest-labs/flux-dev";

// Returns a Blob (jpeg) of the generated image, or throws.
export async function generateOutfitImage(prompt) {
  const replicate = new Replicate(); // reads REPLICATE_API_TOKEN from env

  const [output] = await replicate.run(MODEL, {
    input: {
      prompt: `${prompt}. Editorial fashion photography, natural lighting, photorealistic, high detail.`,
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
