import { GarmentIcon } from "../../lib/iconMap.jsx";
import { Heart, Dots } from "../Icons.jsx";

// Decide icon/text tone based on swatch darkness for legibility.
function isDark(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export default function WardrobeItemCard({ item, onToggleFav, onRemove }) {
  const dark = isDark(item.color);
  const tone = dark ? "text-white/90" : "text-ink/70";

  return (
    <div className="group overflow-hidden rounded-xl2 border border-line bg-paper shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-panel">
      {/* Swatch */}
      <div
        className="relative grid aspect-[4/5] place-items-center"
        style={{ backgroundColor: item.color }}
      >
        <div className={`opacity-80 ${tone}`}>
          <GarmentIcon name={item.icon} size={46} />
        </div>

        <button
          onClick={() => onToggleFav(item.id)}
          aria-label={item.fav ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full backdrop-blur-sm transition-colors ${
            item.fav
              ? "bg-accent text-paper"
              : "bg-black/15 text-white/85 hover:bg-black/30"
          }`}
        >
          <Heart size={15} />
        </button>

        <button
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
          className="absolute left-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/15 text-white/85 opacity-0 backdrop-blur-sm transition-all hover:bg-black/30 group-hover:opacity-100"
        >
          <Dots size={15} />
        </button>
      </div>

      {/* Meta */}
      <div className="px-3.5 py-3">
        <p className="label text-faint">{item.category}</p>
        <p className="mt-1 truncate text-[14px] font-medium text-ink">{item.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-muted">{item.brand}</span>
          {item.tags?.[0] && (
            <span className="rounded-full bg-lav-100 px-2 py-0.5 text-[10.5px] text-muted">
              {item.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
