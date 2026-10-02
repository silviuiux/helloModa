import { useState } from "react";
import { GarmentIcon } from "../../lib/iconMap.jsx";
import { Heart, X, Check, Sparkle } from "../Icons.jsx";

// Decide icon tone based on swatch darkness for legibility.
function isDark(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

// One piece in the wardrobe, in the main interface's style (2026-10-02): the
// photo (or a colour swatch with the garment icon) with a soft violet
// shadow, and an editorial caption underneath — category, name, brand —
// then the closet analytics in one quiet line: log a wear, how often
// helloModa styled it, and price / cost-per-wear (docs/03-roadmap.md,
// Phase 3), kept right where you decide what to wear.
export default function WardrobeItemCard({ item, onToggleFav, onRemove, onSetPrice, onLogWear }) {
  const dark = isDark(item.color);
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
  const quiet = "text-[12px] text-[#2b2633]/45 transition-colors hover:text-[#2b2633]";

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#f3eff8] shadow-[0_30px_60px_-36px_rgba(90,70,160,0.45),0_0_0_1px_rgba(43,38,51,0.04)] transition-transform duration-500 group-hover:-translate-y-1">
        {item.image ? (
          <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: item.color }}>
            <div className={`opacity-60 ${dark ? "text-white" : "text-[#2b2633]"}`}>
              <GarmentIcon name={item.icon} size={48} />
            </div>
          </div>
        )}
        <button
          onClick={() => onToggleFav(item.id)}
          aria-label={item.fav ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={item.fav}
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 backdrop-blur-md transition-all ${
            item.fav ? "text-[#e46d92] opacity-100" : "text-[#2b2633]/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          }`}
        >
          <Heart size={14} fill={item.fav ? "currentColor" : "none"} />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="absolute left-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-[#2b2633]/60 opacity-0 backdrop-blur-md transition-opacity hover:text-[#c2577a] focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-3.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#2b2633]/40">{item.category}</p>
        <p className="mt-1 truncate font-script text-[20px] leading-tight text-[#2b2633]">{item.name}</p>
        {item.brand && <p className="mt-0.5 truncate text-[12.5px] text-[#2b2633]/50">{item.brand}</p>}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1">
          <button onClick={() => onLogWear(item.id)} title="Log a wear" className={`flex items-center gap-1 ${quiet}`}>
            <Check size={11} />
            {item.wearCount > 0 ? `Worn ${item.wearCount}×` : "Log a wear"}
          </button>
          {item.styledCount > 0 && (
            <span className="flex items-center gap-1 text-[12px] text-[#2b2633]/35" title="Times helloModa styled this piece">
              <Sparkle size={10} />
              {item.styledCount}×
            </span>
          )}
          {editingPrice ? (
            <form onSubmit={savePrice} className="flex items-center">
              <input
                autoFocus
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onBlur={savePrice}
                aria-label="Purchase price in euros"
                className="w-20 border-0 border-b border-[#8f78e8] bg-transparent px-0 py-0 text-[12px] text-[#2b2633] focus:outline-none focus:ring-0"
              />
            </form>
          ) : item.priceCents != null ? (
            <button onClick={() => setEditingPrice(true)} className="text-[12px] text-[#8f78e8]" title="Edit purchase price">
              {costPerWear != null ? `${EUR.format(costPerWear / 100)}/wear` : EUR.format(item.priceCents / 100)}
            </button>
          ) : (
            <button onClick={() => setEditingPrice(true)} className={quiet}>
              + price
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
