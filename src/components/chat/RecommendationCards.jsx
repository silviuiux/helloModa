import GarmentArt from "../GarmentArt.jsx";
import { Heart, Plus, Refresh, Hanger, Check } from "../Icons.jsx";
import { priceParts } from "../../lib/format.js";

function RetailerTag({ retailer, source }) {
  if (source === "closet") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
        <Hanger size={13} />
        In your closet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink">
      <span
        className="inline-block h-0 w-0"
        style={{
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: "7px solid #ff6900",
        }}
      />
      {retailer}
    </span>
  );
}

function CircleBtn({ icon: Icon, label, onClick, filled, title }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={title || label}
      aria-pressed={filled}
      className={`grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95 ${
        filled ? "bg-accent text-white shadow-soft" : "glass-circle text-ink"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function ProductCard({ card, onSwap, onToggleSave, onToggleLook, saved, inLook }) {
  const price = priceParts(card.price);
  return (
    <div className="group glass relative aspect-[3/4] overflow-hidden rounded-xl2">
      {/* full-bleed figure (fades when swapped) */}
      <div key={`${card.brand}-${card.name}`} className="animate-fade-up absolute inset-0">
        <GarmentArt type={card.type} />
      </div>

      {/* edge controls */}
      <div className="absolute left-2 top-2 flex gap-1.5">
        <CircleBtn icon={Refresh} label="Swap suggestion" onClick={() => onSwap?.(card.id)} />
        <CircleBtn
          icon={Heart}
          label={saved ? "Saved to wardrobe" : "Save to wardrobe"}
          filled={saved}
          onClick={() => onToggleSave?.(card)}
        />
      </div>
      <div className="absolute right-2 top-2">
        <CircleBtn
          icon={inLook ? Check : Plus}
          label={inLook ? "Remove from look" : "Add to look"}
          filled={inLook}
          onClick={() => onToggleLook?.(card)}
        />
      </div>

      {/* frosted label overlay */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.82) 28%, rgba(255,255,255,0))" }}>
        <p className="font-display text-[14px] font-semibold uppercase tracking-tight text-ink">
          {card.brand}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-muted">
          {card.name}
          {price && (
            <> · {price.whole}<sup className="text-[9px]">{price.cents}</sup> lei</>
          )}
        </p>
        <div className="mt-1.5">
          <RetailerTag retailer={card.retailer} source={card.source} />
        </div>
      </div>
    </div>
  );
}

export default function RecommendationCards({
  cards = [],
  onSwap,
  onToggleSave,
  onToggleLook,
  savedIds,
  lookIds,
}) {
  if (!cards.length) return null;
  return (
    <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
      {cards.map((c) => (
        <ProductCard
          key={c.id}
          card={c}
          onSwap={onSwap}
          onToggleSave={onToggleSave}
          onToggleLook={onToggleLook}
          saved={savedIds?.has(c.id)}
          inLook={lookIds?.has(c.id)}
        />
      ))}
    </div>
  );
}
