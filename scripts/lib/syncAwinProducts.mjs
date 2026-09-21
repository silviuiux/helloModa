// Shared logic for syncing one Awin advertiser's product datafeed into the
// `products` table (docs/04-data-model.md, docs/05-integrations-affiliates.md).
// Per-retailer scripts (e.g. scripts/sync-products-italist.mjs) just call
// syncAwinProducts() with a retailer slug + feed URL — same pipeline for
// every advertiser, since Awin's "Create-a-Feed" output columns are the same
// shape regardless of merchant.

import { gunzipSync } from "node:zlib";
import { createClient } from "@supabase/supabase-js";
import { embedImageUrl, embedText } from "../../src/lib/embeddings.js";

// Awin lets publishers name their own feed columns in "Create-a-Feed," so we
// accept a few common aliases per field rather than assuming one exact set.
const FIELD_ALIASES = {
  externalId: ["aw_product_id", "merchant_product_id", "product_id"],
  name: ["product_name", "name"],
  brand: ["brand_name", "brand"],
  category: ["merchant_category", "category_name", "category"],
  price: ["search_price", "display_price", "store_price"],
  currency: ["currency"],
  productUrl: ["aw_deep_link", "merchant_deep_link"],
  imageUrl: ["aw_image_url", "merchant_image_url", "large_image"],
};

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] != null && row[key] !== "") return row[key];
  }
  return null;
}

// Minimal RFC4180-ish CSV/TSV parser (quoted fields, embedded delimiters and
// newlines) — no dependency, mirrors this repo's other one-off scripts.
// Delimiter is auto-detected from the header line (Awin feeds are
// configurable as comma or tab separated).
function parseDelimited(text) {
  const delimiter = text.slice(0, text.indexOf("\n")).includes("\t") ? "\t" : ",";
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

function toProductRecord(row, retailer) {
  const externalId = pick(row, FIELD_ALIASES.externalId);
  const name = pick(row, FIELD_ALIASES.name);
  const productUrl = pick(row, FIELD_ALIASES.productUrl);
  if (!externalId || !name || !productUrl) return null;

  const priceRaw = pick(row, FIELD_ALIASES.price);
  const priceCents = priceRaw != null ? Math.round(parseFloat(priceRaw) * 100) : null;

  return {
    retailer,
    affiliate_network: "awin",
    external_id: externalId,
    brand: pick(row, FIELD_ALIASES.brand),
    name,
    category: pick(row, FIELD_ALIASES.category),
    price_cents: Number.isFinite(priceCents) ? priceCents : null,
    currency: pick(row, FIELD_ALIASES.currency) || "EUR",
    product_url: productUrl,
    image_url: pick(row, FIELD_ALIASES.imageUrl),
    last_synced_at: new Date().toISOString(),
  };
}

export async function syncAwinProducts({ retailer, feedUrl, limit }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required to write past RLS.");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(`[${retailer}] fetching feed...`);
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  // Awin's Create-a-Feed always compresses (gzip or zip, no "none" option).
  // fetch() doesn't auto-decompress this — it's a downloadable file, not
  // HTTP transport-encoding — so detect it ourselves via the gzip magic
  // bytes (1f 8b) rather than trusting the compression setting was gzip.
  // Zip isn't handled (multi-entry archive, needs a real zip lib) — if the
  // feed was generated with zip compression, regenerate it with gzip.
  const isGzip = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  const isZip = buffer.length > 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (isZip) {
    throw new Error(
      "Feed is zip-compressed, which this script doesn't unpack — regenerate the feed in " +
        "Awin's Create-a-Feed tool with Compression Type set to gzip instead."
    );
  }
  const text = (isGzip ? gunzipSync(buffer) : buffer).toString("utf8");

  let rows = parseDelimited(text);
  if (limit) rows = rows.slice(0, limit);
  console.log(`[${retailer}] ${rows.length} rows in feed`);

  const records = rows.map((r) => toProductRecord(r, retailer)).filter(Boolean);
  console.log(`[${retailer}] ${records.length} rows had the required fields (id/name/url)`);

  const BATCH_SIZE = 500;
  let upserted = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "retailer,external_id" });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
    upserted += batch.length;
    console.log(`[${retailer}] upserted ${upserted}/${records.length}`);
  }

  console.log(`[${retailer}] embedding new/changed products (this is the slow, costly part)...`);
  const { data: unembedded, error: selectError } = await supabase
    .from("products")
    .select("id, name, brand, category, image_url")
    .eq("retailer", retailer)
    .is("embedding", null);
  if (selectError) throw new Error(selectError.message);

  let embedded = 0;
  let failed = 0;
  for (const product of unembedded || []) {
    try {
      const embedding = product.image_url
        ? await embedImageUrl(product.image_url)
        : await embedText(`${product.brand || ""} ${product.name} ${product.category || ""}`.trim());
      const { error: updateError } = await supabase
        .from("products")
        .update({ embedding })
        .eq("id", product.id);
      if (updateError) throw new Error(updateError.message);
      embedded++;
    } catch (err) {
      console.error(`  embedding failed for product ${product.id}:`, err.message);
      failed++;
    }
  }

  console.log(`[${retailer}] done. upserted=${records.length} embedded=${embedded} failed=${failed}`);
  return { upserted: records.length, embedded, failed };
}
