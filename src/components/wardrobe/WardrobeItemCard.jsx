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
    <div className="group glass relative aspect-[3/4] overflow-hidden rounded-xl2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* full-bleed swatch */}
      <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: item.color }}>
        <div className={`opacity-70 ${tone}`}>
          <GarmentIcon name={item.icon} size={52} />
        </div>
      </div>

      {/* edge controls */}
      <button
        onClick={() => onToggleFav(item.id)}
        aria-label={item.fav ? "Remove from favorites" : "Add to favorites"}
        className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full transition-colors ${
          item.fav ? "bg-accent text-white shadow-soft" : "glass-circle text-ink"
        }`}
      >
        <Heart size={15} />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Remove item"
        className="glass-circle absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full text-ink opacity-0 transition-all group-hover:opacity-100"
      >
        <Dots size={15} />
      </button>

      {/* frosted label overlay */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.82) 28%, rgba(255,255,255,0))" }}>
        <p className="label text-faint">{item.category}</p>
        <p className="mt-0.5 truncate text-[13.5px] font-medium text-ink">{item.name}</p>
        <p className="mt-0.5 text-[12px] text-muted">{item.brand}</p>
      </div>
    </div>
  );
}
