import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { syncAwinProducts } from "../../../../../scripts/lib/syncAwinProducts.mjs";
import { zalandoFeedBlockedMessage } from "@/lib/awinRetailers";

export const maxDuration = 300;

// Nightly Awin catalog sync for Zalando (docs/05-integrations-affiliates.md),
// triggered by Vercel Cron (see vercel.json's "crons" entry) rather than run
// manually via scripts/sync-products-zalando.mjs. Same underlying pipeline
// as sync-products-italist/route.js — this route is just the scheduled
// trigger for it.
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

  // Not an error until the programme is joined. A 500 here fired every night
  // (vercel.json cron) with no feed to sync. The body says exactly which
  // Awin action is still outstanding.
  if (!process.env.AWIN_ZALANDO_FEED_URL) {
    return NextResponse.json({ ok: true, skipped: true, reason: zalandoFeedBlockedMessage() });
  }

  try {
    const result = await syncAwinProducts({
      retailer: "zalando",
      feedUrl: process.env.AWIN_ZALANDO_FEED_URL,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Zalando product sync failed:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
