#!/usr/bin/env node
// Checks affiliate product URLs and marks dead ones.
//   node scripts/check-product-links.mjs [--limit 40] [--embedded] [--retailer italist] [--delay 1500] [--dry-run]
// Needs SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL (or .env.local).

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

function argValue(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  return process.argv[i + 1];
}

const { checkProductLinks } = await import(path.join(rootDir, "scripts/lib/checkProductLinks.mjs"));

const summary = await checkProductLinks({
  limit: Number(argValue("--limit", "40")),
  delayMs: Number(argValue("--delay", "1500")),
  embeddedOnly: process.argv.includes("--embedded"),
  retailer: argValue("--retailer", undefined),
  dryRun: process.argv.includes("--dry-run"),
});
console.log(JSON.stringify(summary.counts));
