import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { AvatarAppearanceSchema, AVATAR_DESCRIBER_SYSTEM_PROMPT } from "@/lib/avatarDescriber";
import { AVATAR_CONSENT_TEXT_VERSION } from "@/lib/avatarConsent";
import { suggestBuildFromBMI, buildPromptPhrase } from "@/lib/avatarBuild";
import { generateAvatarPortrait } from "@/lib/imageGen";
import { signAvatarRenderUrl } from "@/lib/avatarImages";
import { assertUnderQuota, recordUsage } from "@/lib/usage";

const VISION_MODEL = "claude-opus-5";
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BASE64_LENGTH = 7_000_000;

// helloAvatar generation (docs/03-roadmap.md Phase 3, docs/06-risks-legal.md
// #3). The reference photo lives only in this request's memory: it arrives
// as base64 in the POST body, goes straight into one Claude vision call
// below, and is never written to Storage, the database, or logs — nothing
// downstream of the vision call ever sees the raw photo, only the short
// text description it returns. That's the "photo deleted immediately after
// generation" retention decision (2026-09-22), taken to its strongest form:
// never persisted at all, not stored-then-deleted.
export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { avatarProfileId, imageBase64, mediaType, consent } = body;
  if (!avatarProfileId || !imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Missing avatar profile or photo." }, { status: 400 });
  }
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Photo is too large." }, { status: 400 });
  }
  // The consent checkbox is enforced client-side too (AvatarConsent.jsx
  // disables the generate button until checked), but this is the real gate
  // — a request that skipped or spoofed the client never gets this far.
  if (consent !== true) {
    return NextResponse.json({ error: "Consent is required before generating an avatar." }, { status: 400 });
  }

  const { data: avatarProfile, error: profileError } = await supabase
    .from("avatar_profiles")
    .select("id, is_self, display_name, gender, age, build, height_cm, weight_kg")
    .eq("id", avatarProfileId)
    .maybeSingle();
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }
  if (!avatarProfile) {
    // RLS (owner-only) makes another user's profile id 404 here too, not a 403 — fine either way.
    return NextResponse.json({ error: "Avatar profile not found." }, { status: 404 });
  }

  // Shares the image_generation quota with outfit-hero generations
  // (src/lib/usage.js) — same Replicate-generation cost shape, and this
  // route isn't idempotent like /api/generate-image (every "Try again"
  // repaint is a fresh paid call), so it needs its own check every time.
  try {
    await assertUnderQuota(supabase, user.id, "image_generation");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }

  const client = new Anthropic();
  let appearance;
  try {
    const response = await client.messages.parse({
      model: VISION_MODEL,
      max_tokens: 400,
      system: AVATAR_DESCRIBER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: "Describe this person for a watercolor fashion-illustration avatar." },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(AvatarAppearanceSchema) },
    });
    if (!response.parsed_output) {
      return NextResponse.json({ error: "Couldn't read that photo. Try another." }, { status: 502 });
    }
    appearance = response.parsed_output;
  } catch (err) {
    console.error("Avatar appearance description failed:", err);
    Sentry.captureException(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Avatar generation isn't configured (missing/invalid API key)." }, { status: 500 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "A little overwhelmed — try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "Couldn't read that photo right now." }, { status: 502 });
  }
  // imageBase64 goes out of scope here — nothing further in this request holds it.

  // Age only ever decides child vs adult phrasing here — never surfaced as
  // a number (avatarDescriber.js's schema comment says the same for the
  // vision step; kept consistent end to end).
  const isChild = typeof avatarProfile.age === "number" && avatarProfile.age < 18;
  const genderWord = avatarProfile.gender === "Man" ? (isChild ? "boy" : "man") : isChild ? "girl" : "woman";
  const subjectPhrase = avatarProfile.gender ? genderWord : isChild ? "child" : "adult";

  const buildKey = avatarProfile.build || suggestBuildFromBMI(avatarProfile.height_cm, avatarProfile.weight_kg);
  const buildPhrase = buildPromptPhrase(buildKey) || "average, proportionate build";

  const appearanceSentence =
    `${appearance.hair} hair` +
    (appearance.hairTexture ? `, ${appearance.hairTexture} texture` : "") +
    (appearance.facialHair && appearance.facialHair.toLowerCase() !== "none" ? `, ${appearance.facialHair}` : "") +
    `, ${appearance.skinTone} skin tone.`;

  let imagePath;
  try {
    const blob = await generateAvatarPortrait({
      appearance: appearanceSentence,
      subjectPhrase,
      buildPhrase,
    });
    imagePath = `${user.id}/${avatarProfileId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatar-renders")
      .upload(imagePath, blob, { contentType: "image/jpeg", upsert: true });
    if (uploadError) {
      throw new Error(uploadError.message);
    }
  } catch (err) {
    console.error("Avatar portrait generation failed:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Couldn't paint an avatar right now." }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from("avatar_profiles")
    .update({
      avatar_image_url: imagePath,
      consent_attested_at: new Date().toISOString(),
      consent_text_version: AVATAR_CONSENT_TEXT_VERSION,
      updated_at: new Date().toISOString(),
    })
    .eq("id", avatarProfileId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  await recordUsage(supabase, user.id, "image_generation");

  const imageUrl = await signAvatarRenderUrl(supabase, imagePath);
  return NextResponse.json({ imageUrl });
}
