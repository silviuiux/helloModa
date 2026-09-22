import Replicate from "replicate";

// CLIP embeddings via Replicate (krthr/clip-embeddings, clip-vit-large-patch14,
// 768-dim). Text and images land in the same vector space, so a wardrobe
// photo can be embedded directly and compared against a text-embedded
// suggested piece with no intermediate description-writing step. See
// docs/04-data-model.md's "embedding" columns note.
//
// Always called with a pinned version ("owner/name:version"). A bare
// "owner/name" makes the client use /models/{owner}/{name}/predictions,
// which Replicate only serves for its *official* models — krthr/clip-
// embeddings is a community model, so every call failed. Found 2026-09-22:
// 0 of 25,100 synced products and 0 of 8 wardrobe items had ever been
// embedded, with the errors swallowed per item. The version comes from
// REPLICATE_CLIP_VERSION when set (pin it for reproducible vectors), else
// the model's latest version, looked up once per server instance.
const OWNER = "krthr";
const NAME = "clip-embeddings";

let versionPromise = null;

function resolveModelRef(replicate) {
  if (process.env.REPLICATE_CLIP_VERSION) {
    return Promise.resolve(`${OWNER}/${NAME}:${process.env.REPLICATE_CLIP_VERSION}`);
  }
  if (!versionPromise) {
    versionPromise = replicate.models
      .get(OWNER, NAME)
      .then((model) => {
        const id = model?.latest_version?.id;
        if (!id) throw new Error(`No latest version found for ${OWNER}/${NAME} on Replicate.`);
        return `${OWNER}/${NAME}:${id}`;
      })
      .catch((err) => {
        versionPromise = null; // don't cache a failure — retry on the next call
        throw err;
      });
  }
  return versionPromise;
}

async function runClip(input) {
  const replicate = new Replicate();
  const ref = await resolveModelRef(replicate);
  const output = await replicate.run(ref, { input });
  if (!Array.isArray(output?.embedding)) {
    throw new Error(`Unexpected CLIP output from ${ref}: ${JSON.stringify(output).slice(0, 200)}`);
  }
  return output.embedding;
}

export async function embedText(text) {
  return runClip({ text });
}

// imageUrl must be reachable by Replicate's servers — pass a signed Storage
// URL (short expiry is fine, this only needs to live long enough for one
// fetch), never a private path directly.
export async function embedImageUrl(imageUrl) {
  return runClip({ image: imageUrl });
}
