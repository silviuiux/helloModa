import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { generateOutfitImage } from "@/lib/imageGen";
import { signLookImageUrl } from "@/lib/lookImages";
import { signAvatarRenderUrl } from "@/lib/avatarImages";
import { assertUnderQuota, recordUsage } from "@/lib/usage";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md). Called client-side
// (OutfitHero.jsx) right after a chat turn renders, so the text reply shows
// instantly and the hero image fills in — matches the roadmap's "good
// loading state" exit criterion rather than blocking the whole chat response
// on a ~5-10s generation call.
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
  const recommendationId = body.recommendationId;
  if (!recommendationId) {
    return NextResponse.json({ error: "Missing recommendationId." }, { status: 400 });
  }

  // RLS (owner via message -> conversation) does the real ownership check —
  // a recommendation that isn't this user's simply won't be found.
  const { data: recommendation, error: recError } = await supabase
    .from("outfit_recommendations")
    .select("id, hero_prompt, generated_image_url, avatar_profile_id")
    .eq("id", recommendationId)
    .maybeSingle();
  if (recError) {
    return NextResponse.json({ error: recError.message }, { status: 500 });
  }
  if (!recommendation) {
    return NextResponse.json({ error: "Recommendation not found." }, { status: 404 });
  }

  // Idempotent — a turn revisited later (or a double-fire from the client)
  // reuses the already-generated image instead of paying for a new one.
  if (recommendation.generated_image_url) {
    const imageUrl = await signLookImageUrl(supabase, recommendation.generated_image_url);
    return NextResponse.json({ imageUrl });
  }

  // Checked here, after the idempotent short-circuit above — revisiting an
  // already-generated turn must never cost quota, only an actual new
  // generation should (usage metering, src/lib/usage.js).
  try {
    await assertUnderQuota(supabase, user.id, "image_generation");
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }

  // helloAvatar (docs/03-roadmap.md Phase 3): if this look was generated
  // with a family member selected as the model, use their painted avatar
  // as an img2img reference so the outfit renders on "them," not a
  // generic figure. No avatar selected (the default, unchanged) or that
  // avatar hasn't been painted yet -> falls straight back to the plain
  // text-to-image path below.
  let referenceImageUrl = null;
  if (recommendation.avatar_profile_id) {
    const { data: avatarProfile } = await supabase
      .from("avatar_profiles")
      .select("avatar_image_url")
      .eq("id", recommendation.avatar_profile_id)
      .maybeSingle();
    if (avatarProfile?.avatar_image_url) {
      referenceImageUrl = await signAvatarRenderUrl(supabase, avatarProfile.avatar_image_url);
    }
  }

  let imagePath;
  try {
    const blob = await generateOutfitImage(recommendation.hero_prompt, "4:5", referenceImageUrl);
    imagePath = `${user.id}/${recommendationId}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("generated-looks")
      .upload(imagePath, blob, { contentType: "image/jpeg" });
    if (uploadError) {
      throw new Error(uploadError.message);
    }
  } catch (err) {
    console.error("Outfit image generation failed:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Couldn't generate an image for this look." }, { status: 502 });
  }

  const { error: updateError } = await supabase
    .from("outfit_recommendations")
    .update({ generated_image_url: imagePath })
    .eq("id", recommendationId);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  await recordUsage(supabase, user.id, "image_generation");

  const imageUrl = await signLookImageUrl(supabase, imagePath);
  return NextResponse.json({ imageUrl });
}
