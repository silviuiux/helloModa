#!/usr/bin/env node
// Generates the real hero image for each /what-to-wear guide (house
// watercolor style, same STYLE_DIRECTIVE the chat uses — src/lib/imageGen.js)
// and saves it as a static file the page serves directly, no Storage/signing
// needed since this is public marketing content, not per-user data.
//
// Run once after adding/changing a guide's heroImagePrompt:
//   REPLICATE_API_TOKEN=... node scripts/generate-guide-images.mjs
// or with .env.local already populated:
//   node scripts/generate-guide-images.mjs
//
// Only regenerates guides that don't already have an image, unless --force
// is passed. Costs real money (Replicate, ~$0.025/image) — cheap for 9
// guides, but this is why it's a script you run deliberately, not something
// that runs automatically.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Minimal .env.local loader — avoids adding a dotenv dependency for a
// one-off script.
const envPath = path.join(rootDir, ".env.local");
if (existsSync(envPath) && !process.env.REPLICATE_API_TOKEN) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

if (!process.env.REPLICATE_API_TOKEN) {
  console.error("REPLICATE_API_TOKEN is not set (checked env and .env.local). Aborting.");
  process.exit(1);
}

const { guides } = await import(path.join(rootDir, "src/data/guides.js"));
const { generateOutfitImage } = await import(path.join(rootDir, "src/lib/imageGen.js"));

const outDir = path.join(rootDir, "public/guides");
mkdirSync(outDir, { recursive: true });

const force = process.argv.includes("--force");

for (const guide of guides) {
  const outPath = path.join(outDir, `${guide.slug}-hero.jpg`);
  if (existsSync(outPath) && !force) {
    console.log(`skip  ${guide.slug} (already exists — pass --force to regenerate)`);
    continue;
  }
  process.stdout.write(`gen   ${guide.slug} ... `);
  try {
    const buffer = await generateOutfitImage(guide.heroImagePrompt, "4:5");
    writeFileSync(outPath, buffer);
    console.log("done");
  } catch (err) {
    console.log("FAILED");
    console.error(err);
  }
}

console.log("\nAll done. Commit public/guides/*.jpg to keep them in the repo.");
