import GarmentArt from "../GarmentArt.jsx";
import ImageWithFallback from "../ImageWithFallback.jsx";
import { Heart, Hanger } from "../Icons.jsx";

const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

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

// A real Awin-matched product (docs/05-integrations-affiliates.md) gets a
// real photo and an outbound link straight to the retailer — everything
// else (closet pieces, unmatched AI "shop" guesses) stays exactly as
// before, no photo, no link, since there's nowhere real to send anyone.
// The link wraps only the image (an <a>), not the whole card, so the save
// button stays its own separate control rather than nested interactive
// elements inside the anchor.
function ProductCard({ card, onToggleSave, saved }) {
  const isMatched = card.matched && card.productUrl;

  return (
    <div>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl2">
        {isMatched ? (
          <a href={card.productUrl} target="_blank" rel="noopener nofollow sponsored" className="absolute inset-0 block">
            <ImageWithFallback
              src={card.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              fallback={<GarmentArt type={card.type} />}
            />
          </a>
        ) : (
          <GarmentArt type={card.type} />
        )}
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
        <div className="mt-1 flex items-center justify-between gap-2">
          <RetailerTag retailer={card.retailer} source={card.source} />
          {card.price != null && (
            <span className="shrink-0 text-[12.5px] font-medium text-ink">{EUR.format(card.price)}</span>
          )}
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
