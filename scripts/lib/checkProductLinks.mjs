// Follows each product's Awin URL to the retailer and records whether the
// final page is still there. One request at a time, with a pause between
// them. Embedded rows go first because those are the ones chat can match.
//
// Recheck: errors after 1 day, dead/soft-404 after 7 days, ok after 14 days.
// Transient failures (timeout, 429, 5xx) are stored as "error" and stay
// linkable — only dead and soft_404 are hidden from match_products.

import { createClient } from "@supabase/supabase-js";
import {
  LINK_CHECK_BATCH,
  LINK_CHECK_DELAY_MS,
  LINK_CHECK_USER_AGENT,
  classifyProductPage,
  linkCheckIsDue,
  pageHeadingText,
} from "../../src/lib/productLinkHealth.js";

const READ_BYTES = 24_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function inspectProductUrl(url, { timeoutMs = 20_000 } = {}) {
  if (!url) return { link_status: "error", link_http_status: null, finalUrl: null, title: "" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": LINK_CHECK_USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    let html = "";
    if (res.body) {
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      while (received < READ_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
        received += value.length;
      }
      reader.cancel().catch(() => {});
      html = Buffer.concat(chunks).toString("utf8");
    }
    const link_status = classifyProductPage({ httpStatus: res.status, finalUrl: res.url, html });
    return {
      link_status,
      link_http_status: res.status,
      finalUrl: res.url,
      title: pageHeadingText(html).split("\n")[0].slice(0, 180),
    };
  } catch (err) {
    return { link_status: "error", link_http_status: null, finalUrl: null, title: "", error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function selectDue(supabase, { retailer, embedded, limit }) {
  let query = supabase
    .from("products")
    .select("id, product_url, link_status, link_checked_at")
    .order("link_checked_at", { ascending: true, nullsFirst: true })
    .limit(Math.max(limit * 4, limit));
  if (retailer) query = query.eq("retailer", retailer);
  if (embedded) query = query.not("embedding", "is", null);
  else query = query.is("embedding", null);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).filter((row) => linkCheckIsDue(row)).slice(0, limit);
}

export async function checkProductLinks({
  limit = LINK_CHECK_BATCH,
  delayMs = LINK_CHECK_DELAY_MS,
  embeddedOnly = false,
  retailer,
  dryRun = false,
} = {}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — required to update products past RLS.");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let rows = await selectDue(supabase, { retailer, embedded: true, limit });
  if (!embeddedOnly && rows.length < limit) {
    const rest = await selectDue(supabase, { retailer, embedded: false, limit: limit - rows.length });
    rows = rows.concat(rest);
  }

  const counts = { checked: 0, ok: 0, dead: 0, soft_404: 0, error: 0 };
  const results = [];
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs);
    const row = rows[i];
    const inspected = await inspectProductUrl(row.product_url);
    counts.checked++;
    counts[inspected.link_status] = (counts[inspected.link_status] || 0) + 1;
    const checkedAt = new Date().toISOString();
    if (!dryRun) {
      const { error } = await supabase
        .from("products")
        .update({
          link_status: inspected.link_status,
          link_http_status: inspected.link_http_status,
          link_checked_at: checkedAt,
        })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
    }
    results.push({ id: row.id, ...inspected });
    console.log(
      `[links] ${inspected.link_status} http=${inspected.link_http_status ?? "-"} ${inspected.title || inspected.error || ""}`
    );
  }
  return { counts, results };
}
