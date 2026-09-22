// Plan definitions — the one place free-vs-Pro limits are tuned. No real
// paid tier exists yet (no Stripe integration, docs/07-costs-budget.md's
// "subscriptions" table has never had a row written to it) — this ships the
// metering/enforcement so cost is bounded starting now, and so there's an
// actual gate to sell once checkout exists. Everyone is "free" until then.
export const PLANS = {
  free: {
    // Picked to be generous enough to genuinely try the product, capped
    // enough to bound worst-case per-user Claude/Replicate spend — a
    // starting point, not a tuned number (no real usage data yet to tune
    // against, same caveat as the product-match similarity threshold in
    // src/app/api/chat/route.js).
    chatMessagesPerMonth: 30,
    imageGenerationsPerMonth: 10,
    maxAvatars: 1, // self only
  },
  pro: {
    chatMessagesPerMonth: Infinity,
    imageGenerationsPerMonth: Infinity,
    maxAvatars: 4, // self + 3 family, matching the existing hard cap
  },
};

export function limitsFor(plan) {
  return PLANS[plan] || PLANS.free;
}
