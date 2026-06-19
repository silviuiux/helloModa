import { Sliders, Sparkle, Plus } from "../Icons.jsx";
import GarmentArt from "../GarmentArt.jsx";
import { lookContext } from "../../data/seed.js";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl2 bg-paper px-4 py-3 ring-1 ring-line">
      <span className="text-[13.5px] text-muted">{label}</span>
      <span className="text-[13.5px] font-medium text-ink">{value}</span>
    </div>
  );
}

function LookPiece({ piece, onRemove }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-line">
      <div className="aspect-square">
        <GarmentArt type={piece.type} />
      </div>
      <button
        onClick={() => onRemove(piece.id)}
        aria-label={`Remove ${piece.name}`}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-paper text-ink opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
      >
        <span className="text-[15px] leading-none">×</span>
      </button>
      <div className="bg-paper px-2 py-1.5">
        <p className="truncate text-[10.5px] font-medium text-ink">{piece.brand}</p>
        <p className="truncate text-[10px] text-muted">{piece.name}</p>
      </div>
    </div>
  );
}

export default function LookContextPanel({ look = [], onRemove }) {
  const empty = look.length === 0;

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

      {/* Preview: empty state or the assembled pieces */}
      {empty ? (
        <div className="relative mt-5 aspect-square overflow-hidden rounded-xl2 ring-1 ring-line">
          <GarmentArt type="look" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper/95 to-transparent px-3 pb-2.5 pt-10 text-center">
            <p className="text-[12.5px] text-muted">
              Tap <span className="font-medium text-ink">+</span> on a suggestion to build a look
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="label text-muted">Your look</span>
            <span className="label text-accent">
              {look.length} {look.length === 1 ? "piece" : "pieces"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {look.map((piece) => (
              <LookPiece key={piece.id} piece={piece} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}

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
