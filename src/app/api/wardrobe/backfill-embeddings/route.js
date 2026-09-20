import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { signWardrobeImageUrl } from "@/lib/wardrobeImages";
import { embedText, embedImageUrl } from "@/lib/embeddings";

// One-off maintenance endpoint: embeds any of the signed-in user's wardrobe
// items that predate the embedding pipeline (src/actions/wardrobe.js embeds
// new items automatically). Trigger manually, signed into the app:
//   fetch('/api/wardrobe/backfill-embeddings', { method: 'POST' }).then(r => r.json()).then(console.log)
// RLS scopes the select to the caller's own items — no explicit user_id filter needed.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: items, error } = await supabase
    .from("wardrobe_items")
    .select("id, name, brand, category, image_url")
    .is("embedding", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let embedded = 0;
  let failed = 0;
  for (const item of items || []) {
    try {
      const embedding = item.image_url
        ? await embedImageUrl(await signWardrobeImageUrl(supabase, item.image_url))
        : await embedText(`${item.brand || "Unbranded"} ${item.name}, ${item.category}`);
      const { error: updateError } = await supabase
        .from("wardrobe_items")
        .update({ embedding })
        .eq("id", item.id);
      if (updateError) throw new Error(updateError.message);
      embedded++;
    } catch (err) {
      console.error(`Failed to backfill embedding for wardrobe item ${item.id}:`, err);
      Sentry.captureException(err);
      failed++;
    }
  }

  return NextResponse.json({ embedded, failed, total: items?.length || 0 });
}
