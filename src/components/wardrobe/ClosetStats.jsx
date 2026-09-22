const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Stat({ value, label, hint }) {
  return (
    <div className="min-w-[120px]">
      <p className="font-display text-[19px] font-semibold tracking-[-0.03em] leading-none text-ink">{value}</p>
      <p className="label mt-1.5 text-faint">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

// Closet analytics summary (docs/03-roadmap.md, Phase 3) — three numbers
// derived entirely from wardrobe_items.price_cents/wear_count, both
// optional/user-entered, so every stat here degrades to a plain "—" instead
// of a broken calculation when that data isn't there yet.
export default function ClosetStats({ items }) {
  if (items.length === 0) return null;

  const priced = items.filter((it) => it.priceCents != null);
  const wardrobeValueCents = priced.reduce((sum, it) => sum + it.priceCents, 0);

  const worn = priced.filter((it) => it.wearCount > 0);
  const avgCostPerWearCents = worn.length
    ? Math.round(worn.reduce((sum, it) => sum + it.priceCents / it.wearCount, 0) / worn.length)
    : null;

  const neverWorn = items.filter((it) => it.wearCount === 0).length;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line bg-white/60 px-6 py-4 sm:px-8">
      <Stat
        value={priced.length ? EUR.format(wardrobeValueCents / 100) : "—"}
        label="Wardrobe value"
        hint={priced.length ? `${priced.length} of ${items.length} priced` : "Add a price to a piece to see this"}
      />
      <Stat
        value={avgCostPerWearCents != null ? EUR.format(avgCostPerWearCents / 100) : "—"}
        label="Avg. cost / wear"
        hint={worn.length ? `across ${worn.length} logged piece${worn.length === 1 ? "" : "s"}` : "Log a wear to see this"}
      />
      <Stat value={neverWorn} label="Never logged worn" hint={neverWorn ? "candidates to re-style or let go" : "everything's had a turn"} />
    </div>
  );
}
