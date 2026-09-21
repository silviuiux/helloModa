import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { syncAwinProducts } from "../../../../../scripts/lib/syncAwinProducts.mjs";

export const maxDuration = 300;

// Nightly Awin catalog sync for Italist (docs/05-integrations-affiliates.md),
// triggered by Vercel Cron (see vercel.json's "crons" entry) rather than run
// manually via scripts/sync-products-italist.mjs. Same underlying pipeline —
// this route is just the scheduled trigger for it.
//
// Vercel signs cron requests with `Authorization: Bearer $CRON_SECRET`
// (automatically, once CRON_SECRET is set as an env var) — reject anything
// else so this can't be used to burn Replicate credits by hitting the URL
// directly.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.AWIN_ITALIST_FEED_URL) {
    return NextResponse.json({ error: "AWIN_ITALIST_FEED_URL is not set." }, { status: 500 });
  }

  try {
    const result = await syncAwinProducts({
      retailer: "italist",
      feedUrl: process.env.AWIN_ITALIST_FEED_URL,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Italist product sync failed:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
