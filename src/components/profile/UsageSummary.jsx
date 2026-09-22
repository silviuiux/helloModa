function Meter({ label, used, limit }) {
  const unlimited = limit === Infinity;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const atLimit = !unlimited && used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-ink">{label}</span>
        <span className={`text-[12.5px] ${atLimit ? "font-medium text-red-500" : "text-muted"}`}>
          {unlimited ? `${used} used` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div
            className={`h-full rounded-full ${atLimit ? "bg-red-400" : "bg-accent"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Free/Pro usage this calendar month (src/lib/usage.js) — surfaced here so
// hitting a quota (a plain error message from /api/chat or
// /api/generate-image) isn't the first time anyone learns a limit exists.
// No real checkout yet (docs/08-changelog.md, 2026-09-22) — "Upgrade" has
// nowhere to send anyone yet, so this only shows the numbers, not a button.
export default function UsageSummary({ usage }) {
  if (!usage) return null;

  return (
    <section className="glass rounded-xl3 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">This month</h2>
        <span className="label text-accent-deep">{usage.plan === "pro" ? "Pro" : "Free"}</span>
      </div>
      <div className="mt-4 space-y-4">
        <Meter label="Styling messages" used={usage.chatMessages.used} limit={usage.chatMessages.limit} />
        <Meter label="Image generations" used={usage.imageGenerations.used} limit={usage.imageGenerations.limit} />
      </div>
      {usage.plan === "free" && (
        <p className="mt-4 text-[11.5px] text-faint">
          Free plan — resets on the 1st. helloModa Pro (coming soon) adds unlimited styling and
          image generations, plus family avatars.
        </p>
      )}
    </section>
  );
}
