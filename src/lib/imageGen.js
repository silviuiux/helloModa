import Replicate from "replicate";

// Phase 2 "Magic Mirror" — see docs/03-roadmap.md. Generates an outfit-in-scene
// image from the stylist's heroPrompt. Swappable later (fal.ai/Magnific are
// documented alternatives in docs/02-tech-stack.md) since this is the one
// place that calls out to a generation provider.
const MODEL = "black-forest-labs/flux-dev";

// Used only when an avatar is selected (helloAvatar, docs/03-roadmap.md
// Phase 3) — an image-EDITING model, not plain img2img: given a reference
// photo and an instruction, it's built to keep the same subject (face,
// hair, body) while changing context/clothing, which is a much closer
// match to "same face/hair/body type" than flux-dev's generic img2img
// (`prompt_strength`) below ever could be — that one just nudges the
// output toward the reference's rough structure/coloring, nothing more.
// Kept as a separate model constant so a bad call here can fail closed
// into the existing img2img path rather than the whole feature.
const KONTEXT_MODEL = "black-forest-labs/flux-kontext-dev";

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
export async function generateOutfitImage(prompt, aspectRatio, referenceImageUrl) {
  if (!aspectRatio) {
    throw new Error("generateOutfitImage requires an aspectRatio matching the display crop.");
  }
  const replicate = new Replicate(); // reads REPLICATE_API_TOKEN from env

  if (referenceImageUrl) {
    try {
      const [output] = await replicate.run(KONTEXT_MODEL, {
        input: {
          prompt:
            `${STYLE_DIRECTIVE} Scene: ${prompt}. Keep this exact same person — same face, same ` +
            `hairstyle and hair color, same body type and skin tone as the reference image. Only ` +
            `their outfit and the surrounding scene should change.`,
          input_image: referenceImageUrl,
          aspect_ratio: aspectRatio,
          output_format: "jpg",
        },
      });
      if (output) {
        return Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
      }
      console.error("Flux Kontext returned no output — falling back to flux-dev img2img.");
    } catch (err) {
      console.error("Flux Kontext generation failed — falling back to flux-dev img2img:", err);
    }
  }

  const input = {
    prompt: `${STYLE_DIRECTIVE} Scene: ${prompt}`,
    output_format: "jpg",
    num_outputs: 1,
  };
  if (referenceImageUrl) {
    input.image = referenceImageUrl;
    input.prompt_strength = 0.82;
  } else {
    input.aspect_ratio = aspectRatio;
  }

  const [output] = await replicate.run(MODEL, { input });

  if (!output) {
    throw new Error("Replicate returned no output.");
  }

  return Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
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
  const replicate = new Replicate();
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

  const [output] = await replicate.run(MODEL, {
    input: {
      prompt,
      aspect_ratio: "3:4",
      output_format: "jpg",
      num_outputs: 1,
    },
  });

  if (!output) {
    throw new Error("Replicate returned no output.");
  }

  return Buffer.from(await output.blob().then((b) => b.arrayBuffer()));
}
