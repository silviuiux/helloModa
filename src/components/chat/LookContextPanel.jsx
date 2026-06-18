import { Sliders, Sparkle, Plus, Dress } from "../Icons.jsx";
import { lookContext } from "../../data/seed.js";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl2 bg-paper px-4 py-3 ring-1 ring-line">
      <span className="text-[13.5px] text-muted">{label}</span>
      <span className="text-[13.5px] font-medium text-ink">{value}</span>
    </div>
  );
}

export default function LookContextPanel() {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border-l border-line bg-lav-50 px-5 py-6 xl:flex scroll-area overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] font-medium text-ink">Look context</h2>
        <button
          aria-label="Adjust context"
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <Sliders size={18} />
        </button>
      </div>

      {/* Preview canvas */}
      <div className="mt-5 grid aspect-square place-items-center rounded-xl2 border border-dashed border-lav-300 bg-lav-100/60 text-center">
        <div className="text-accent/60">
          <Dress size={40} />
          <p className="mt-2 text-[12.5px] text-muted">Outfit preview canvas</p>
        </div>
      </div>

      {/* Context rows */}
      <div className="mt-5 space-y-2.5">
        <Row label="Silhouette" value={lookContext.silhouette} />
        <Row label="Palette" value={lookContext.palette} />
        <Row label="Risk" value={lookContext.risk} />
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2.5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-ink px-4 py-3.5 text-[14px] font-medium text-paper transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
          <Sparkle size={17} />
          Generate 3 looks
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl2 border border-line bg-paper px-4 py-3.5 text-[14px] font-medium text-ink transition-colors hover:border-accent/40">
          <Plus size={17} />
          Add wardrobe item
        </button>
      </div>
    </aside>
  );
}
