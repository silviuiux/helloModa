import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { WardrobeTagSchema, WARDROBE_TAG_SYSTEM_PROMPT } from "@/lib/wardrobeTagger";

const MODEL = "claude-opus-5";
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Base64-encoded, so this caps the actual photo around ~5MB — plenty after
// the client-side resize AddItemModal does before calling this route.
const MAX_BASE64_LENGTH = 7_000_000;

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

  const { imageBase64, mediaType } = body;
  if (!imageBase64 || !mediaType) {
    return NextResponse.json({ error: "Missing image." }, { status: 400 });
  }
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Photo is too large." }, { status: 400 });
  }

  const client = new Anthropic();
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 512,
      system: WARDROBE_TAG_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: "Identify this wardrobe item's attributes." },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(WardrobeTagSchema) },
    });
    if (!response.parsed_output) {
      return NextResponse.json({ error: "Couldn't read that photo. Try another." }, { status: 502 });
    }
    return NextResponse.json({ tags: response.parsed_output });
  } catch (err) {
    console.error("Wardrobe photo tagging failed:", err);
    Sentry.captureException(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Photo tagging isn't configured (missing/invalid API key)." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "A little overwhelmed — try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "Couldn't analyze the photo right now." }, { status: 502 });
  }
}
