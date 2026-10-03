#!/usr/bin/env node
// Side-by-side check before flipping IMAGE_PROVIDER (2026-10-03): runs the
// same look prompt through Replicate and fal (src/lib/imageGen.js), twice
// each — the first call can include a cold start, the second shows warm
// speed — and prints the timings. The images are saved next to each other
// so the watercolour look can be compared by eye.
//
//   REPLICATE_API_TOKEN=... FAL_KEY=... node scripts/compare-image-providers.mjs
//   (or with both keys in .env.local)
//
// Optional: an avatar image URL as the first argument tests the
// likeness-keeping path (Flux Kontext) instead of plain text-to-image.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import os from "node:os";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

// Minimal .env.local loader — same as the other scripts, no dotenv dependency.
const envPath = path.join(rootDir, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
for (const key of ["REPLICATE_API_TOKEN", "FAL_KEY"]) {
  if (!process.env[key]) {
    console.error(`${key} is not set (checked env and .env.local) — both providers are needed to compare.`);
    process.exit(1);
  }
}

const { generateOutfitImage } = await import(path.join(rootDir, "src/lib/imageGen.js"));

const referenceImageUrl = process.argv[2] || undefined;
const prompt =
  "A friend's rooftop birthday at golden hour in the city: an ivory silk slip dress under a camel " +
  "wool wrap coat worn over the shoulders, black kitten heels, small gold hoops.";
const outDir = path.join(os.tmpdir(), "hellomoda-provider-compare");
mkdirSync(outDir, { recursive: true });

const results = [];
for (const provider of ["replicate", "fal"]) {
  for (const run of [1, 2]) {
    const t0 = Date.now();
    try {
      const buf = await generateOutfitImage(prompt, "4:5", referenceImageUrl, { provider });
      const ms = Date.now() - t0;
      const file = path.join(outDir, `${provider}-${run}.jpg`);
      writeFileSync(file, buf);
      results.push({ provider, run, seconds: (ms / 1000).toFixed(1), file });
    } catch (err) {
      results.push({ provider, run, seconds: "failed", file: err.message });
    }
  }
}
console.table(results);
console.log(`Images saved in ${outDir}`);
