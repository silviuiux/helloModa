import Replicate from "replicate";

// CLIP embeddings via Replicate (krthr/clip-embeddings, clip-vit-large-patch14,
// 768-dim). Text and images land in the same vector space, so a wardrobe
// photo can be embedded directly and compared against a text-embedded
// suggested piece with no intermediate description-writing step. See
// docs/04-data-model.md's "embedding" columns note.
const MODEL = "krthr/clip-embeddings";

export async function embedText(text) {
  const replicate = new Replicate();
  const output = await replicate.run(MODEL, { input: { text } });
  return output.embedding;
}

// imageUrl must be reachable by Replicate's servers — pass a signed Storage
// URL (short expiry is fine, this only needs to live long enough for one
// fetch), never a private path directly.
export async function embedImageUrl(imageUrl) {
  const replicate = new Replicate();
  const output = await replicate.run(MODEL, { input: { image: imageUrl } });
  return output.embedding;
}
