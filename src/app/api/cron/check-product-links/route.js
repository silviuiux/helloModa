import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { checkProductLinks } from "../../../../../scripts/lib/checkProductLinks.mjs";
import { LINK_CHECK_BATCH, LINK_CHECK_DELAY_MS } from "@/lib/productLinkHealth";

export const maxDuration = 300;

// Re-checks affiliate links a batch at a time (vercel.json). Embedded
// products first. Dead and soft-404 rows drop out of match_products.
// One GET every LINK_CHECK_DELAY_MS, identified User-Agent, so a run of
// LINK_CHECK_BATCH stays well inside maxDuration and doesn't hammer the
// retailer. 404/410 and "page not found" titles are unavailable; 429 and
// 5xx stay linkable and are retried the next day.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { counts } = await checkProductLinks({
      limit: LINK_CHECK_BATCH,
      delayMs: LINK_CHECK_DELAY_MS,
    });
    return NextResponse.json({ ok: true, ...counts });
  } catch (err) {
    console.error("Product link check failed:", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
