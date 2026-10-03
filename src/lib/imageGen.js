import Replicate from "replicate";
import { fal } from "@fal-ai/client";

// Phase 2 "Magic Mirror" — see docs/03-roadmap.md. Generates an outfit-in-scene
// image from the stylist's heroPrompt. The one place that calls out to an
// image provider.
//
// Provider switch (2026-10-03): IMAGE_PROVIDER=fal | replicate (default
// replicate, so nothing changes until it's flipped). Both run the same Flux
// models — flux-dev for text-to-image, Flux Kontext dev for keeping an
// avatar's likeness, flux-dev img2img as Kontext's fallback — so the look
// should match; fal is cheaper and mostly faster (pre-warmed, ~1–3 s cold
// starts vs Replicate's 8–60 s on idle models). If the chosen provider
// fails and the other one is configured too (its key is set), the request
// falls back to it rather than failing the look. Every call logs
// `[imageGen] provider=… step=… ms=…` so real latency can be compared in the
// Vercel logs; scripts/compare-image-providers.mjs runs the same prompt on
// both side by side.
const PROVIDER = (process.env.IMAGE_PROVIDER || "replicate").toLowerCase() === "fal" ? "fal" : "replicate";

const REPLICATE_MODEL = "black-forest-labs/flux-dev";
// Used only when an avatar is selected (helloAvatar, docs/03-roadmap.md
// Phase 3) — an image-EDITING model, not plain img2img: given a reference
// photo and an instruction, it's built to keep the same subject (face,
// hair, body) while changing context/clothing, which is a much closer
// match to "same face/hair/body type" than flux-dev's generic img2img
// below ever could be — that one just nudges the output toward the
// reference's rough structure/coloring, nothing more. A failure here
// falls back to that img2img path rather than failing the whole feature.
const REPLICATE_KONTEXT_MODEL = "black-forest-labs/flux-kontext-dev";

const FAL_MODEL = "fal-ai/flux/dev";
const FAL_KONTEXT_MODEL = "fal-ai/flux-kontext/dev";
const FAL_IMG2IMG_MODEL = "fal-ai/flux/dev/image-to-image";

function configured(provider) {
  return provider === "fal" ? Boolean(process.env.FAL_KEY) : Boolean(process.env.REPLICATE_API_TOKEN);
}

// "4:5" -> pixel size for fal's flux-dev (multiples of 16, long side ~1152).
function falImageSize(aspectRatio) {
  const [w, h] = aspectRatio.split(":").map(Number);
  const scale = 1152 / Math.max(w, h);
  const round16 = (n) => Math.max(256, Math.round((n * scale) / 16) * 16);
  return { width: round16(w), height: round16(h) };
}

async function bufferFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't download generated image (${res.status}).`);
  return Buffer.from(await res.arrayBuffer());
}

async function replicateBuffer(output) {
  if (!output) throw new Error("Replicate returned no output.");
  return Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
}

async function falBuffer(result) {
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error("fal returned no image.");
  return bufferFromUrl(url);
}

// The three operations this app needs, per provider. Each returns a jpeg
// Buffer or throws.
const PROVIDERS = {
  replicate: {
    async textToImage({ prompt, aspectRatio }) {
      const [output] = await new Replicate().run(REPLICATE_MODEL, {
        input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg", num_outputs: 1 },
      });
      return replicateBuffer(output);
    },
    async edit({ prompt, imageUrl, aspectRatio }) {
      const [output] = await new Replicate().run(REPLICATE_KONTEXT_MODEL, {
        input: { prompt, input_image: imageUrl, aspect_ratio: aspectRatio, output_format: "jpg" },
      });
      return replicateBuffer(output);
    },
    async img2img({ prompt, imageUrl, strength }) {
      const [output] = await new Replicate().run(REPLICATE_MODEL, {
        input: { prompt, image: imageUrl, prompt_strength: strength, output_format: "jpg", num_outputs: 1 },
      });
      return replicateBuffer(output);
    },
  },
  fal: {
    // fal's client reads FAL_KEY from the environment. "regular"
    // acceleration is fal's quality-preserving speed-up.
    async textToImage({ prompt, aspectRatio }) {
      const result = await fal.subscribe(FAL_MODEL, {
        input: {
          prompt,
          image_size: falImageSize(aspectRatio),
          num_images: 1,
          output_format: "jpeg",
          acceleration: "regular",
        },
      });
      return falBuffer(result);
    },
    async edit({ prompt, imageUrl, aspectRatio }) {
      const result = await fal.subscribe(FAL_KONTEXT_MODEL, {
        input: {
          prompt,
          image_url: imageUrl,
          resolution_mode: aspectRatio,
          num_images: 1,
          output_format: "jpeg",
          acceleration: "regular",
        },
      });
      return falBuffer(result);
    },
    async img2img({ prompt, imageUrl, strength }) {
      const result = await fal.subscribe(FAL_IMG2IMG_MODEL, {
        input: { prompt, image_url: imageUrl, strength, num_images: 1, output_format: "jpeg", acceleration: "regular" },
      });
      return falBuffer(result);
    },
  },
};

async function timed(provider, step, fn) {
  const t0 = Date.now();
  try {
    const out = await fn();
    console.log(`[imageGen] provider=${provider} step=${step} ms=${Date.now() - t0}`);
    return out;
  } catch (err) {
    console.error(`[imageGen] provider=${provider} step=${step} failed after ms=${Date.now() - t0}:`, err?.message || err);
    throw err;
  }
}

// Runs `task(providerName)` on the chosen provider; if that throws and the
// other provider has a key configured, tries it once before giving up.
// `prefer` overrides IMAGE_PROVIDER (used by the comparison script).
async function withFallback(task, prefer = PROVIDER) {
  const primary = configured(prefer) ? prefer : prefer === "fal" ? "replicate" : "fal";
  const secondary = primary === "fal" ? "replicate" : "fal";
  try {
    return await task(primary);
  } catch (err) {
    if (!configured(secondary)) throw err;
    console.error(`[imageGen] ${primary} failed — falling back to ${secondary}.`);
    return task(secondary);
  }
}

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
// time it ran). Callers: /api/generate-image passes "4:5" (OutfitHero.jsx's
// portrait hero image, back to portrait 2026-09-22 after a brief 3:2
// landscape stint 2026-09-21), scripts/generate-guide-images.mjs and
// scripts/generate-occasion-images.mjs pass "4:5" (their portrait cards).
//
// `referenceImageUrl` (helloAvatar, docs/03-roadmap.md Phase 3): when the
// user picked a family member's avatar as the model, pass its signed
// watercolor-portrait URL here. Tries Flux Kontext first (KONTEXT_MODEL
// above) — an editing model that keeps the same person while changing
// their outfit/scene, which is what "same face, same hair, same body
// type" actually needs (direct request 2026-09-22, after plain img2img
// turned out too loose to hold a consistent face across generations). If
// that call fails for any reason (a bad param, a model-availability
// hiccup — this integration hasn't been exercised against a real
// Replicate account yet, see docs/08-changelog.md's 2026-09-22 entry) this
// falls back to flux-dev's own img2img (`image` + `prompt_strength`) so a
// Kontext problem degrades to today's looser-but-working reference instead
// of failing the whole generation. Omit referenceImageUrl entirely for the
// plain text-to-image path (no avatar selected — unchanged).
export async function generateOutfitImage(prompt, aspectRatio, referenceImageUrl, { provider } = {}) {
  if (!aspectRatio) {
    throw new Error("generateOutfitImage requires an aspectRatio matching the display crop.");
  }
  const scenePrompt = `${STYLE_DIRECTIVE} Scene: ${prompt}`;

  return withFallback(async (name) => {
    const p = PROVIDERS[name];
    if (referenceImageUrl) {
      try {
        return await timed(name, "kontext", () =>
          p.edit({
            prompt:
              `${scenePrompt}. Keep this exact same person — same face, same hairstyle and hair ` +
              `color, same body type and skin tone as the reference image. Only their outfit and ` +
              `the surrounding scene should change.`,
            imageUrl: referenceImageUrl,
            aspectRatio,
          })
        );
      } catch {
        console.error(`[imageGen] ${name} Kontext failed — falling back to flux-dev img2img.`);
      }
      return timed(name, "img2img", () => p.img2img({ prompt: scenePrompt, imageUrl: referenceImageUrl, strength: 0.82 }));
    }
    return timed(name, "text2img", () => p.textToImage({ prompt: scenePrompt, aspectRatio }));
  }, provider);
}

// helloAvatar's own generation step: a full-body watercolor figure from the
// vision-derived appearance brief (avatarDescriber.js) plus real profile
// data (avatarBuild.js) — never from the photo itself, which never reaches
// this file. Portrait, plain background, neutral standing pose —
// deliberately generic-scene so it works as a base figure for later img2img
// outfit generations above.
//
// man/boy -> male, woman/girl -> female. "adult"/"child" (no gender on
// file) has no sex word — nothing to assert either way.
const SEX_WORD = { man: "male", boy: "male", woman: "female", girl: "female" };

// Body realism is a direct, explicit instruction here (2026-09-22): Flux,
// like most of these models, defaults toward slim/athletic figures unless
// told firmly otherwise, which would silently misrepresent anyone whose
// real build/BMI isn't that — so `buildPhrase` is stated as a requirement,
// not a suggestion, and repeated at the end of the prompt (recency helps
// it hold against the model's own bias) rather than trusted to one mention.
//
// Gender gets the same front-AND-back treatment for the same reason
// (caught 2026-09-22: a selected "Man" was still painted as a woman). Two
// causes, both addressed here: (1) it was stated only once, well into the
// prompt, after ~40 words of style/pose text — Flux weights earlier tokens
// more heavily (see STYLE_DIRECTIVE's own comment above), so a single
// mid-prompt mention is weak; (2) "editorial fashion illustration" is a
// genre whose training data skews heavily toward female figures, which can
// outweigh a weak gender signal even when Flux "reads" it correctly. Fixed
// by leading with an unambiguous subject clause before the style directive
// even starts, and restating it plainly at the end — the same primacy +
// recency pairing already proven for the style/build instructions.
export async function generateAvatarPortrait({ appearance, subjectPhrase, buildPhrase }) {
  const sexWord = SEX_WORD[subjectPhrase];
  const subjectClause = sexWord ? `a ${sexWord} ${subjectPhrase}` : `a ${subjectPhrase}`;

  const prompt =
    `Portrait of ${subjectClause}, ${buildPhrase}. ` +
    `${STYLE_DIRECTIVE} Full-body fashion-illustration figure, standing in a relaxed neutral pose, ` +
    `facing forward, plain soft neutral studio background, simple bodysuit or minimal base clothing ` +
    `— this is a base model figure for later outfit visualization, not a finished outfit. ` +
    `${appearance} ` +
    `Reminder, both required: this figure is ${subjectClause}${sexWord ? ` (${sexWord}, not the opposite sex)` : ""}, ` +
    `with a ${buildPhrase} — painted realistically, not slimmer or more toned than described.`;

  return withFallback((name) => timed(name, "avatar", () => PROVIDERS[name].textToImage({ prompt, aspectRatio: "3:4" })));
}
