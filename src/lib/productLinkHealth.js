// Classifies the page an affiliate link lands on. Title and the first h1
// only — a product description that happens to contain "not found" must
// not mark a live page dead.
const SOFT_404 = [
  "404 not found",
  "page not found",
  "page doesn't exist",
  "page does not exist",
  "no longer available",
  "product is no longer",
  "product unavailable",
  "this item is not available",
  "sorry, we couldn't find",
  "sorry, we could not find",
];

export function isDeadProductLink(status) {
  return status === "dead" || status === "soft_404";
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function pageHeadingText(html) {
  const title = decodeEntities((String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const h1 = decodeEntities((String(html).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
  return `${title}\n${h1}`.slice(0, 500);
}

function looksMissing(text) {
  const hay = text.toLowerCase();
  return SOFT_404.some((phrase) => hay.includes(phrase));
}

function pathLooksMissing(finalUrl) {
  try {
    const path = new URL(finalUrl).pathname.toLowerCase().replace(/\/+$/, "");
    // Italist answers a gone SKU with HTTP 200 on the store root
    // (title "Italist | Designer Fashion from Italy"), not a 404.
    if (path === "" || path === "/search" || path.startsWith("/search/")) return true;
    return path === "/404" || path.endsWith("/404") || path.includes("/not-found");
  } catch {
    return false;
  }
}

// status: ok | dead | soft_404 | error
export function classifyProductPage({ httpStatus, finalUrl, html }) {
  if (httpStatus == null) return "error";
  if (httpStatus === 404 || httpStatus === 410) return "dead";
  if (httpStatus === 408 || httpStatus === 429 || httpStatus >= 500) return "error";
  const heading = pageHeadingText(html || "");
  if (looksMissing(heading) || pathLooksMissing(finalUrl)) return "soft_404";
  if (httpStatus >= 200 && httpStatus < 300) return "ok";
  return "error";
}

export const LINK_CHECK_USER_AGENT = "helloModa-link-check/1.0 (+https://www.hellomoda.online)";
export const LINK_CHECK_DELAY_MS = 1500;
export const LINK_CHECK_BATCH = 40;

const OK_RECHECK_MS = 14 * 24 * 60 * 60 * 1000;
const DEAD_RECHECK_MS = 7 * 24 * 60 * 60 * 1000;
const ERROR_RECHECK_MS = 24 * 60 * 60 * 1000;

export function linkCheckIsDue(row, now = Date.now()) {
  if (!row?.link_checked_at) return true;
  const checked = new Date(row.link_checked_at).getTime();
  if (Number.isNaN(checked)) return true;
  const age = now - checked;
  if (row.link_status === "error") return age >= ERROR_RECHECK_MS;
  if (row.link_status === "dead" || row.link_status === "soft_404") return age >= DEAD_RECHECK_MS;
  if (row.link_status === "ok") return age >= OK_RECHECK_MS;
  return true;
}
