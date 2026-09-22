import { useState } from "react";
import { GarmentIcon } from "../../lib/iconMap.jsx";
import { Heart, Dots, Check, Sparkle } from "../Icons.jsx";

// Decide icon/text tone based on swatch darkness for legibility.
function isDark(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

// Closet analytics (docs/03-roadmap.md, Phase 3) lives inline on the card
// rather than behind a detail view — cost-per-wear only changes anyone's
// behavior if it's visible right where they're deciding what to wear.
export default function WardrobeItemCard({ item, onToggleFav, onRemove, onSetPrice, onLogWear }) {
  const dark = isDark(item.color);
  const tone = dark ? "text-ink/90" : "text-canvas/70";
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(
    item.priceCents != null ? (item.priceCents / 100).toString() : ""
  );

  function savePrice(e) {
    e.preventDefault();
    const parsed = parseFloat(priceInput);
    onSetPrice(item.id, Number.isFinite(parsed) && priceInput.trim() ? Math.round(parsed * 100) : null);
    setEditingPrice(false);
  }

  const costPerWear =
    item.priceCents != null && item.wearCount > 0 ? Math.round(item.priceCents / item.wearCount) : null;

  return (
    <div className="group glass relative aspect-[3/4] overflow-hidden rounded-xl2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* full-bleed photo, or a color swatch + icon when there isn't one */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: item.color }}>
          <div className={`opacity-70 ${tone}`}>
            <GarmentIcon name={item.icon} size={52} />
          </div>
        </div>
      )}

      {/* edge controls */}
      <button
        onClick={() => onToggleFav(item.id)}
        aria-label={item.fav ? "Remove from favorites" : "Add to favorites"}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full transition-colors ${
          item.fav ? "bg-accent text-canvas shadow-soft" : "bg-canvas/70 text-ink backdrop-blur-md"
        }`}
      >
        <Heart size={15} />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
        className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-canvas/70 text-ink opacity-0 backdrop-blur-md transition-all group-hover:opacity-100"
      >
        <Dots size={15} />
      </button>

      {/* frosted label overlay */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-14"
        style={{ background: "linear-gradient(to top, rgba(15,14,12,0.96) 62%, rgba(15,14,12,0))" }}>
        <p className="label text-faint">{item.category}</p>
        <p className="mt-0.5 truncate text-[13.5px] font-medium text-ink">{item.name}</p>
        <p className="mt-0.5 text-[12px] text-muted">{item.brand}</p>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
          <button
            onClick={() => onLogWear(item.id)}
            title="Log a wear"
            className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-accent-deep"
          >
            <Check size={11} />
            {item.wearCount > 0 ? `Worn ${item.wearCount}×` : "Log a wear"}
          </button>

          {item.styledCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-faint" title="Times helloModa styled this piece">
              <Sparkle size={10} />
              {item.styledCount}×
            </span>
          )}

          {editingPrice ? (
            <form onSubmit={savePrice} className="flex min-w-0 items-center gap-1">
              <input
                autoFocus
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onBlur={savePrice}
                className="w-16 rounded-md border border-line bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-ink outline-none focus:border-accent"
              />
            </form>
          ) : item.priceCents != null ? (
            <button
              onClick={() => setEditingPrice(true)}
              className="shrink-0 truncate text-[11px] font-medium text-accent-deep"
              title="Edit purchase price"
            >
              {costPerWear != null ? `${EUR.format(costPerWear / 100)}/wear` : EUR.format(item.priceCents / 100)}
            </button>
          ) : (
            <button
              onClick={() => setEditingPrice(true)}
              className="shrink-0 text-[11px] text-faint underline decoration-dotted underline-offset-2 hover:text-accent-deep"
            >
              + Add price
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
