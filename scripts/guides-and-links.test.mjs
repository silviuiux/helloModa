import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("guide heroes are requested only when the jpg is committed", async () => {
  const { guideHeroPublicPath } = await import("../src/lib/guideHero.js");
  assert.equal(guideHeroPublicPath("beach-wedding"), null);
  assert.equal(guideHeroPublicPath("../etc/passwd"), null);
  const file = path.join(root, "public", "guides", "phase1-switch-hero.jpg");
  fs.writeFileSync(file, "not a real jpeg");
  try {
    assert.equal(guideHeroPublicPath("phase1-switch"), "/guides/phase1-switch-hero.jpg");
  } finally {
    fs.unlinkSync(file);
  }
});

test("product pages are dead only on 404, 410, or a missing-page title", async () => {
  const { classifyProductPage, isDeadProductLink, linkCheckIsDue } = await import("../src/lib/productLinkHealth.js");
  assert.equal(classifyProductPage({ httpStatus: 404, finalUrl: "https://italist.com/products/x", html: "" }), "dead");
  assert.equal(classifyProductPage({ httpStatus: 410, finalUrl: "https://italist.com/p", html: "" }), "dead");
  assert.equal(
    classifyProductPage({
      httpStatus: 200,
      finalUrl: "https://italist.com/404",
      html: "<title>Something</title>",
    }),
    "soft_404"
  );
  assert.equal(
    classifyProductPage({
      httpStatus: 200,
      finalUrl: "https://italist.com/products/sneaker",
      html: "<title>404 Not Found</title><h1>Page not found</h1>",
    }),
    "soft_404"
  );
  assert.equal(
    classifyProductPage({
      httpStatus: 200,
      finalUrl: "https://italist.com/products/sneaker",
      html: "<title>Miu Miu Sneakers</title><p>The colourway you wanted was not found in store.</p>",
    }),
    "ok"
  );
  assert.equal(classifyProductPage({ httpStatus: 429, finalUrl: "https://italist.com/p", html: "" }), "error");
  assert.equal(classifyProductPage({ httpStatus: 503, finalUrl: "https://italist.com/p", html: "" }), "error");
  assert.equal(classifyProductPage({ httpStatus: null, finalUrl: null, html: "" }), "error");
  assert.equal(isDeadProductLink("dead"), true);
  assert.equal(isDeadProductLink("soft_404"), true);
  assert.equal(isDeadProductLink("ok"), false);
  assert.equal(isDeadProductLink(null), false);
  assert.equal(linkCheckIsDue({ link_checked_at: null }), true);
  assert.equal(linkCheckIsDue({ link_status: "ok", link_checked_at: new Date().toISOString() }), false);
  const old = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(linkCheckIsDue({ link_status: "ok", link_checked_at: old }), true);
});
