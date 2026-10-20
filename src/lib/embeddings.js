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

// Replicate drops accounts under $5 of credit to 6 predictions/minute with
// a burst of 1 (seen on the Italist cron since 2026-09-24). The message
// includes retry_after. Parse it so a 429 waits and retries instead of
// failing the product and leaving the embedding backlog stuck.
export function retryDelaySeconds(err) {
  const msg = String(err?.message || err || "");
  const fromJson = msg.match(/retry_after"\s*:\s*(\d+)/);
  if (fromJson) return Number(fromJson[1]);
  const fromText = msg.match(/resets in ~(\d+)s/);
  if (fromText) return Number(fromText[1]);
  return 8;
}

function isThrottle(err) {
  const status = err?.response?.status ?? err?.status;
  if (status === 429) return true;
  return /429|Too Many Requests|throttled/i.test(String(err?.message || ""));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// After the first 429, later CLIP calls in this process wait out the
// window so a concurrency-8 cron doesn't spend the whole invocation on
// rejected bursts. Calls that aren't throttled still run together.
let clipGate = Promise.resolve();
let spacedUntil = 0;

async function withClipSlot(fn) {
  const ticket = clipGate.then(async () => {
    const wait = spacedUntil - Date.now();
    if (wait > 0) await sleep(wait);
  });
  clipGate = ticket.then(
    () => {},
    () => {}
  );
  await ticket;
  try {
    return await fn();
  } catch (err) {
    if (isThrottle(err)) {
      const delayMs = Math.min(30, Math.max(1, retryDelaySeconds(err))) * 1000;
      spacedUntil = Math.max(spacedUntil, Date.now() + delayMs);
    }
    throw err;
  }
}

async function runClip(input) {
  const replicate = new Replicate();
  const ref = await resolveModelRef(replicate);
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const output = await withClipSlot(() => replicate.run(ref, { input }));
      if (!Array.isArray(output?.embedding)) {
        throw new Error(`Unexpected CLIP output from ${ref}: ${JSON.stringify(output).slice(0, 200)}`);
      }
      return output.embedding;
    } catch (err) {
      if (!isThrottle(err) || attempt === maxAttempts) throw err;
      console.warn(
        `[embeddings] Replicate rate-limited (attempt ${attempt}/${maxAttempts}). ` +
          `Accounts under $5 credit are capped at 6 requests/minute. ` +
          `Waiting ${retryDelaySeconds(err)}s before retry.`
      );
    }
  }
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
