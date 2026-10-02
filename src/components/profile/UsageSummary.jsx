function Meter({ label, used, limit }) {
  const unlimited = limit === Infinity;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const atLimit = !unlimited && used >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] text-[#2b2633]">{label}</span>
        <span className={`text-[12.5px] ${atLimit ? "font-medium text-[#c2577a]" : "text-[#2b2633]/50"}`}>
          {unlimited ? `${used} used` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="mt-2 h-px overflow-hidden bg-[#2b2633]/10">
          <div
            className={`h-full ${atLimit ? "bg-[#c2577a]" : "bg-[#8f78e8]"}`}
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
    <section className="border-t border-[#2b2633]/10 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-script text-[30px] leading-none text-[#2b2633]">This month</h2>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#8f78e8]">{usage.plan === "pro" ? "Pro" : "Free"}</span>
      </div>
      <div className="mt-4 space-y-4">
        <Meter label="Styling messages" used={usage.chatMessages.used} limit={usage.chatMessages.limit} />
        <Meter label="Image generations" used={usage.imageGenerations.used} limit={usage.imageGenerations.limit} />
      </div>
      {usage.plan === "free" && (
        <p className="mt-4 text-[12px] text-[#2b2633]/40">
          Free plan — resets on the 1st. helloModa Pro (coming soon) adds unlimited styling and
          image generations, plus family avatars.
        </p>
      )}
    </section>
  );
}
