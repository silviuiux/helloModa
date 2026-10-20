import fs from "node:fs";
import path from "node:path";

// Switch for /what-to-wear heroes.
//
// scripts/generate-guide-images.mjs writes public/guides/{slug}-hero.jpg
// (needs REPLICATE_API_TOKEN — do not run it while credit is reserved for
// the user test). This helper returns that public path only when the file
// is actually in the build. Callers must render GuideHeroArt when this is
// null, and must not point an <img> or a metadata URL at the missing jpg.
export function guideHeroFilename(slug) {
  return `${slug}-hero.jpg`;
}

export function guideHeroPublicPath(slug) {
  if (!slug || typeof slug !== "string" || slug.includes("/") || slug.includes("..") || slug.includes("\\")) {
    return null;
  }
  const file = path.join(process.cwd(), "public", "guides", guideHeroFilename(slug));
  return fs.existsSync(file) ? `/guides/${guideHeroFilename(slug)}` : null;
}
