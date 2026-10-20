import test from "node:test";
import assert from "node:assert/strict";

test("image generation names the missing keys instead of calling a provider", async () => {
  delete process.env.FAL_KEY;
  delete process.env.REPLICATE_API_TOKEN;
  const { generateOutfitImage } = await import("../src/lib/imageGen.js");
  await assert.rejects(
    () => generateOutfitImage("an ivory silk slip dress", "4:5"),
    (err) => {
      assert.equal(err.name, "ImageProviderConfigError");
      assert.equal(err.status, 503);
      assert.match(err.message, /FAL_KEY/);
      assert.match(err.message, /REPLICATE_API_TOKEN/);
      assert.match(err.message, /IMAGE_PROVIDER=fal/);
      return true;
    }
  );
});

test("fal flux-dev sizes stay inside one billed megapixel", async () => {
  const { falImageSize } = await import("../src/lib/imageGen.js");
  for (const ratio of ["4:5", "3:4", "1:1"]) {
    const { width, height } = falImageSize(ratio);
    assert.equal(width % 16, 0, ratio);
    assert.equal(height % 16, 0, ratio);
    assert.ok(width * height <= 1_000_000, `${ratio} is ${width}x${height}`);
    assert.ok(width >= 256 && height >= 256);
  }
  const portrait = falImageSize("4:5");
  assert.ok(portrait.height > portrait.width);
});

test("Awin links keep existing tracking and wrap bare merchant URLs", async () => {
  const { ensureAwinTrackingUrl, isAwinTrackingUrl, zalandoFeedBlockedMessage } = await import(
    "../src/lib/awinRetailers.js"
  );
  const existing = "https://www.awin1.com/pclick.php?p=46091887691&a=3100896&m=127855";
  assert.equal(ensureAwinTrackingUrl(existing, "italist"), existing);
  assert.equal(isAwinTrackingUrl(existing), true);

  const wrapped = new URL(ensureAwinTrackingUrl("https://www.zalando.de/nike-air-force-1.html", "zalando"));
  assert.equal(wrapped.hostname, "www.awin1.com");
  assert.equal(wrapped.pathname, "/cread.php");
  assert.equal(wrapped.searchParams.get("awinmid"), "13789");
  assert.equal(wrapped.searchParams.get("awinaffid"), "3100896");
  assert.equal(wrapped.searchParams.get("ued"), "https://www.zalando.de/nike-air-force-1.html");

  assert.equal(ensureAwinTrackingUrl("not a url", "zalando"), null);
  assert.equal(ensureAwinTrackingUrl("https://example.com/p", "unknown-shop"), null);

  const blocked = zalandoFeedBlockedMessage();
  assert.match(blocked, /AWIN_ZALANDO_FEED_URL/);
  assert.match(blocked, /13789/);
  assert.match(blocked, /partner\.zalando\.com/);
  assert.match(blocked, /Lounge by Zalando/);
});

test("price formatting uses the product currency", async () => {
  const { formatPrice } = await import("../src/lib/format.js");
  assert.match(formatPrice(254.51, "USD"), /254\.51/);
  assert.match(formatPrice(254.51, "USD"), /US\$|\$/);
  assert.match(formatPrice(10, "EUR"), /€|EUR/);
  assert.match(formatPrice(10, "nope"), /€|EUR/);
});

test("Replicate 429 retry delay is read from the error body", async () => {
  const { retryDelaySeconds } = await import("../src/lib/embeddings.js");
  const err = new Error(
    'Request failed with status 429: {"detail":"throttled","status":429,"retry_after":7}'
  );
  assert.equal(retryDelaySeconds(err), 7);
  assert.equal(retryDelaySeconds(new Error("rate limit resets in ~4s")), 4);
  assert.equal(retryDelaySeconds(new Error("nope")), 8);
});
