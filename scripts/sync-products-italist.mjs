#!/usr/bin/env node
// Syncs Italist's Awin product datafeed into the `products` table so real
// catalog items can be matched against outfit suggestions (docs/05-
// integrations-affiliates.md's "Ingestion pipeline"). Shared logic lives in
// scripts/lib/syncAwinProducts.mjs — adding the next approved advertiser is
// a copy of this file with a new retailer slug + feed env var.
//
// Get the feed URL: Awin dashboard -> Italist advertiser page -> Datafeeds,
// or productdata.awin.com's "Create-a-Feed" tool. It embeds your publisher
// auth token, so treat AWIN_ITALIST_FEED_URL like a secret (don't paste it
// into chat/commit it — same rule as the Replicate token).
//
// Run manually (nightly cron/scheduled job later):
//   node scripts/sync-products-italist.mjs [--limit 50]
// or with .env.local already populated (AWIN_ITALIST_FEED_URL,
// SUPABASE_SERVICE_ROLE_KEY):
//   node scripts/sync-products-italist.mjs
//
// Costs real money (one Replicate CLIP call per new/changed product) — use
// --limit while testing against a fresh feed.

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

if (!process.env.AWIN_ITALIST_FEED_URL) {
  console.error("AWIN_ITALIST_FEED_URL is not set (checked env and .env.local). Aborting.");
  process.exit(1);
}

const { syncAwinProducts } = await import(path.join(rootDir, "scripts/lib/syncAwinProducts.mjs"));

const limitArg = process.argv.indexOf("--limit");
const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : undefined;

await syncAwinProducts({
  retailer: "italist",
  feedUrl: process.env.AWIN_ITALIST_FEED_URL,
  limit,
});
