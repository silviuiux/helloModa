// Awin publisher id read from live Italist deep links (`a=` / `awinaffid`
// on awin1.com). It is not a secret — it ships in every outbound link.
// Override with AWIN_PUBLISHER_ID if the publisher account changes.
export const DEFAULT_AWIN_PUBLISHER_ID = "3100896";

export function awinPublisherId() {
  return (process.env.AWIN_PUBLISHER_ID || DEFAULT_AWIN_PUBLISHER_ID).trim();
}

// advertiserId is Awin's merchant id (`m=` / `awinmid`). Italist's was
// confirmed from synced product URLs. Zalando's is the public merchant
// profile for Lounge by Zalando DE — the outlet club, not zalando.com.
export const AWIN_RETAILERS = {
  italist: {
    slug: "italist",
    name: "Italist",
    feedEnv: "AWIN_ITALIST_FEED_URL",
    advertiserId: "127855",
    programmeName: "Italist",
  },
  zalando: {
    slug: "zalando",
    name: "Lounge by Zalando",
    feedEnv: "AWIN_ZALANDO_FEED_URL",
    advertiserId: "13789",
    programmeName: "Lounge by Zalando DE",
    programmeUrl: "https://ui.awin.com/merchant-profile/13789",
  },
};

export function retailerLabel(retailer) {
  if (!retailer) return "";
  return AWIN_RETAILERS[retailer]?.name || retailer;
}

export function zalandoFeedBlockedMessage() {
  const z = AWIN_RETAILERS.zalando;
  return (
    `${z.feedEnv} is not set. Join ${z.programmeName} in Awin ` +
    `(advertiser id ${z.advertiserId}, ${z.programmeUrl}): Advertisers → Join programmes, ` +
    `wait until the programme is approved, then Create-a-Feed with Compression Type gzip ` +
    `and set ${z.feedEnv} in Vercel. That programme is Lounge by Zalando, the outlet club, ` +
    `not the main zalando.com shop. For the full-price catalogue apply separately at ` +
    `https://partner.zalando.com — that feed is not the Awin format this sync expects until ` +
    `a sample exists. Questions: affiliate@zalando.de.`
  );
}

export function isAwinTrackingUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== "www.awin1.com" && host !== "awin1.com" && !host.endsWith(".awin1.com")) return false;
  const publisher = parsed.searchParams.get("a") || parsed.searchParams.get("awinaffid");
  const merchant = parsed.searchParams.get("m") || parsed.searchParams.get("awinmid");
  const product = parsed.searchParams.get("p");
  const dest = parsed.searchParams.get("ued");
  return Boolean(publisher && (merchant || product || dest));
}

// Keep a feed's own aw_deep_link. If a row only has the merchant URL,
// wrap it so the click still carries this publisher's Awin id. Returns
// null when the URL can't be made into a tracking link — callers drop
// the row rather than store an untracked retailer URL.
export function ensureAwinTrackingUrl(url, retailerSlug) {
  if (!url) return null;
  if (isAwinTrackingUrl(url)) return url;
  const retailer = AWIN_RETAILERS[retailerSlug];
  if (!retailer?.advertiserId) return null;
  let dest;
  try {
    dest = new URL(url);
  } catch {
    return null;
  }
  if (dest.protocol !== "http:" && dest.protocol !== "https:") return null;
  const wrapped = new URL("https://www.awin1.com/cread.php");
  wrapped.searchParams.set("awinmid", retailer.advertiserId);
  wrapped.searchParams.set("awinaffid", awinPublisherId());
  wrapped.searchParams.set("ued", dest.toString());
  return wrapped.toString();
}
