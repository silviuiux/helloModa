import GarmentArt from "../GarmentArt.jsx";
import { Heart, Hanger } from "../Icons.jsx";

function RetailerTag({ retailer, source }) {
  if (source === "closet") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
        <Hanger size={12} />
        In your closet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
      <span
        className="inline-block h-0 w-0"
        style={{
          borderTop: "3.5px solid transparent",
          borderBottom: "3.5px solid transparent",
          borderLeft: "6px solid #ff6900",
        }}
      />
      {retailer}
    </span>
  );
}

function ProductCard({ card, onToggleSave, saved }) {
  return (
    <div>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl2">
        <GarmentArt type={card.type} />
        <button
          onClick={() => onToggleSave?.(card)}
          aria-label={saved ? "Saved to wardrobe" : "Save to wardrobe"}
          aria-pressed={saved}
          className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95 ${
            saved ? "bg-accent text-white shadow-soft" : "glass-circle text-ink"
          }`}
        >
          <Heart size={15} />
        </button>
      </div>
      <div className="mt-3">
        <p className="label text-faint">{card.brand}</p>
        <p className="mt-1 text-[14px] font-medium text-ink">{card.name}</p>
        <div className="mt-1">
          <RetailerTag retailer={card.retailer} source={card.source} />
        </div>
      </div>
    </div>
  );
}

export default function RecommendationCards({ cards = [], onToggleSave, savedIds }) {
  if (!cards.length) return null;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
      {cards.map((c) => (
        <ProductCard key={c.id} card={c} onToggleSave={onToggleSave} saved={savedIds?.has(c.id)} />
      ))}
    </div>
  );
}
