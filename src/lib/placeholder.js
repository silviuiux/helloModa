// Placeholder photography for every slot that doesn't have a real image yet
// (occasion/guide art before generation has run, a look before its painting
// exists, an unmatched "shop" piece). Direct request 2026-09-22: photos, not
// the vector garment illustrations used before.
//
// Picsum (picsum.photos) serves a deterministic photo per seed, so the same
// card always shows the same picture across renders and reloads. The photos
// are generic, not fashion-specific — they're stand-ins. This file is the
// one place the source is defined: to switch to a curated set, drop files
// in public/placeholders/ and return those paths here instead.
export function placeholderSrc(seed, width = 800, height = 1000) {
  const key = encodeURIComponent(`hellomoda-${seed ?? "look"}`);
  return `https://picsum.photos/seed/${key}/${width}/${height}`;
}
