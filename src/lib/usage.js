import { limitsFor } from "./plans";

// Server-only usage metering against the free/Pro caps in plans.js
// (usage_events table, migration `usage_metering`). Calendar-month window
// (resets 1st of month UTC) — simpler to reason about than a rolling
// window and matches how subscription billing periods normally work.

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

// 'pro' only means "has an active subscription row" — there's no real
// checkout yet (see plans.js), so in practice this is always 'free' today.
// Kept as its own function so wiring up real Stripe status later is a
// one-place change, not a hunt through every call site.
export async function getUserPlan(supabase, userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) {
    console.error("Failed to check subscription status, defaulting to free:", error.message);
    return "free";
  }
  return data ? "pro" : "free";
}

// Throws a plain Error with a user-facing message when the caller is over
// quota for `kind` this month — callers turn that into an HTTP 402.
// Doesn't record usage itself (call recordUsage separately, after the
// billable action actually succeeds — see the route comments) so a
// request that fails downstream doesn't still cost the user a slot.
export async function assertUnderQuota(supabase, userId, kind) {
  const plan = await getUserPlan(supabase, userId);
  const limits = limitsFor(plan);
  const limit = kind === "chat_message" ? limits.chatMessagesPerMonth : limits.imageGenerationsPerMonth;
  if (limit === Infinity) return { plan, limit, used: null };

  const { count, error } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", monthStartIso());
  if (error) throw new Error(error.message);

  if ((count || 0) >= limit) {
    const label = kind === "chat_message" ? "styling messages" : "image generations";
    const err = new Error(
      `You've used your ${limit} free ${label} this month. Upgrade to helloModa Pro for unlimited access, or check back next month.`
    );
    err.status = 402;
    throw err;
  }
  return { plan, limit, used: count || 0 };
}

export async function recordUsage(supabase, userId, kind) {
  const { error } = await supabase.from("usage_events").insert({ user_id: userId, kind });
  if (error) console.error(`Failed to record ${kind} usage:`, error.message);
}

// For a "X/Y used this month" summary (profile page) — both kinds at once,
// one round trip each rather than four separate calls.
export async function getUsageSummary(supabase, userId) {
  const plan = await getUserPlan(supabase, userId);
  const limits = limitsFor(plan);
  const since = monthStartIso();

  const [{ count: chatCount }, { count: imageCount }] = await Promise.all([
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "chat_message")
      .gte("created_at", since),
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", "image_generation")
      .gte("created_at", since),
  ]);

  return {
    plan,
    chatMessages: { used: chatCount || 0, limit: limits.chatMessagesPerMonth },
    imageGenerations: { used: imageCount || 0, limit: limits.imageGenerationsPerMonth },
    maxAvatars: limits.maxAvatars,
  };
}
