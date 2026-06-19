import { Sliders, Sparkle, Plus } from "../Icons.jsx";
import GarmentArt from "../GarmentArt.jsx";
import { lookContext } from "../../data/seed.js";

function Readout({ label, value }) {
  return (
    <div>
      <p className="label text-faint">{label}</p>
      <p className="mt-1 text-[13.5px] text-ink">{value}</p>
    </div>
  );
}

function LookPiece({ piece, onRemove }) {
  return (
    <div className="group glass relative overflow-hidden rounded-xl">
      <div className="aspect-square">
        <GarmentArt type={piece.type} />
      </div>
      <button
        onClick={() => onRemove(piece.id)}
        aria-label={`Remove ${piece.name}`}
        className="glass-circle absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-ink opacity-0 transition-opacity group-hover:opacity-100"
      >
        <span className="text-[15px] leading-none">×</span>
      </button>
      <div className="bg-white/55 px-2 py-1.5 backdrop-blur-md">
        <p className="truncate text-[10.5px] font-medium text-ink">{piece.brand}</p>
        <p className="truncate text-[10px] text-muted">{piece.name}</p>
      </div>
    </div>
  );
}

export default function LookContextPanel({ look = [], onRemove }) {
  const empty = look.length === 0;

  return (
    <aside className="glass-panel hidden w-[300px] shrink-0 flex-col border-l border-white/40 px-5 py-6 xl:flex scroll-area overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] font-medium text-ink">Look context</h2>
        <button
          aria-label="Adjust context"
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/60 hover:text-accent-deep"
        >
          <Sliders size={18} />
        </button>
      </div>

      {/* Preview: empty state or the assembled pieces */}
      {empty ? (
        <div className="glass relative mt-5 aspect-square overflow-hidden rounded-xl2">
          <GarmentArt type="look" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-paper/95 to-transparent px-3 pb-2.5 pt-10 text-center">
            <p className="text-[12.5px] text-muted">
              Tap <span className="font-medium text-accent-deep">+</span> on a suggestion to build a look
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="label text-muted">Your look</span>
            <span className="label text-accent-deep">
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

      {/* Context readouts — quiet mono HUD labels, no chrome */}
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/40 pt-5">
        <Readout label="Silhouette" value={lookContext.silhouette} />
        <Readout label="Palette" value={lookContext.palette} />
        <Readout label="Risk" value={lookContext.risk} />
        <Readout label="Weather" value={lookContext.weather} />
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2.5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl2 bg-accent px-4 py-3.5 text-[14px] font-medium text-white shadow-soft transition-all duration-200 hover:bg-accent-deep hover:scale-[1.01] active:scale-[0.99]">
          <Sparkle size={17} />
          Generate 3 looks
        </button>
        <button className="glass-soft flex w-full items-center justify-center gap-2 rounded-xl2 px-4 py-3.5 text-[14px] font-medium text-ink transition-colors hover:text-accent-deep">
          <Plus size={17} />
          Add wardrobe item
        </button>
      </div>
    </aside>
  );
}
