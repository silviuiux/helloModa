import GarmentArt from "../GarmentArt.jsx";
import { Heart, Plus, Refresh, Hanger, Check } from "../Icons.jsx";
import { priceParts } from "../../lib/format.js";

function RetailerTag({ retailer, source }) {
  if (source === "closet") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
        <Hanger size={15} />
        In your closet
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
      <span
        className="inline-block h-0 w-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: "8px solid #ff6900",
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
      className={`grid h-9 w-9 place-items-center rounded-full shadow-soft transition-transform hover:scale-105 active:scale-95 ${
        filled ? "bg-accent text-paper" : "bg-paper text-ink"
      }`}
    >
      <Icon size={17} />
    </button>
  );
}

function ProductCard({ card, onSwap, onToggleSave, onToggleLook, saved, inLook }) {
  const price = priceParts(card.price);
  return (
    <div className="group">
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl2">
        {/* key forces a soft fade when the product is swapped */}
        <div key={`${card.brand}-${card.name}`} className="animate-fade-up h-full w-full">
          <GarmentArt type={card.type} />
        </div>
        {/* bottom-left controls */}
        <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
          <CircleBtn icon={Refresh} label="Swap suggestion" onClick={() => onSwap?.(card.id)} />
          <CircleBtn
            icon={Heart}
            label={saved ? "Saved to wardrobe" : "Save to wardrobe"}
            filled={saved}
            onClick={() => onToggleSave?.(card)}
          />
        </div>
        {/* bottom-right add to look */}
        <div className="absolute bottom-2.5 right-2.5">
          <CircleBtn
            icon={inLook ? Check : Plus}
            label={inLook ? "Remove from look" : "Add to look"}
            filled={inLook}
            onClick={() => onToggleLook?.(card)}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3">
        <p className="font-display text-[15px] font-semibold uppercase tracking-tight text-ink">
          {card.brand}
        </p>
        <p className="mt-0.5 text-[13.5px] text-muted">{card.name}</p>
        {price ? (
          <p className="mt-2 text-[15px] font-medium text-ink">
            {price.whole}
            <sup className="text-[10px] font-medium">{price.cents}</sup> lei
          </p>
        ) : (
          <p className="mt-2 text-[14px] text-muted">Already yours</p>
        )}
        <div className="mt-2.5">
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
