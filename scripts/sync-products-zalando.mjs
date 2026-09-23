#!/usr/bin/env node
// Syncs Zalando's Awin product datafeed into the `products` table, exactly
// like scripts/sync-products-italist.mjs — copy of that file with a new
// retailer slug + feed env var, per its own comment inviting that. See
// docs/05-integrations-affiliates.md's "Ingestion pipeline".
//
// Zalando is reachable two ways (docs/05-integrations-affiliates.md's
// networks table): as an Awin advertiser (same feed shape this script
// expects), or via Zalando's own direct Partner Program
// (partner.zalando.com), which may give better data access — apply to both
// and use whichever approves first / has the better feed. Either way this
// is affiliate-program-gated data, not an open catalog: there's no
// "non-affiliate" Zalando product feed. Get the Awin feed URL from the Awin
// dashboard -> Zalando advertiser page -> Datafeeds, or productdata.awin.com's
// "Create-a-Feed" tool. It embeds your publisher auth token, so treat
// AWIN_ZALANDO_FEED_URL like a secret (don't paste it into chat/commit it —
// same rule as the Replicate token).
//
// Run manually (nightly cron/scheduled job later):
//   node scripts/sync-products-zalando.mjs [--limit 50] [--embed-limit 400]
// or with .env.local already populated (AWIN_ZALANDO_FEED_URL,
// SUPABASE_SERVICE_ROLE_KEY):
//   node scripts/sync-products-zalando.mjs
//
// Costs real money (one Replicate CLIP call per new/changed product) — use
// --limit while testing against a fresh feed. --embed-limit caps how many
// products get embedded in this one run (default 400, matching the cron
// route's default so a serverless invocation stays inside its time limit) —
// run this script manually with a large --embed-limit (or just run it
// several times back to back) for an initial full backfill rather than
// waiting on ~400/night from cron alone; there's no serverless time cap
// here, so a single long-running manual pass can clear the whole backlog.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const envPath = path.join(rootDir, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

if (!process.env.AWIN_ZALANDO_FEED_URL) {
  console.error("AWIN_ZALANDO_FEED_URL is not set (checked env and .env.local). Aborting.");
  process.exit(1);
}

const { syncAwinProducts } = await import(path.join(rootDir, "scripts/lib/syncAwinProducts.mjs"));

const limitArg = process.argv.indexOf("--limit");
const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : undefined;
const embedLimitArg = process.argv.indexOf("--embed-limit");
const embedLimit = embedLimitArg !== -1 ? parseInt(process.argv[embedLimitArg + 1], 10) : undefined;

await syncAwinProducts({
  retailer: "zalando",
  feedUrl: process.env.AWIN_ZALANDO_FEED_URL,
  limit,
  ...(embedLimit != null ? { embedLimit } : {}),
});
