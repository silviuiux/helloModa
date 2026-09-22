import GarmentArt from "../GarmentArt.jsx";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md): a real photorealistic image,
// generated on demand via Replicate (src/lib/imageGen.js). Purely
// presentational — generation is kicked off + tracked by useOutfitImage
// (src/lib/useOutfitImage.js); the caller (MessageBubble) only renders this
// once that hook reports "settled", so this never needs its own loading
// state or badge.
export default function OutfitHero({ imageUrl, errorMessage }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-bubble">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <GarmentArt type="look" />
      )}
      {/* Only ever set once generation has settled with no image — most
          commonly now the free-plan quota message (src/lib/usage.js), but
          any other failure reads the same way rather than looking broken. */}
      {errorMessage && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-10"
          style={{ background: "linear-gradient(to top, rgba(20,16,24,0.75), transparent)" }}
        >
          <p className="pointer-events-auto text-[12.5px] leading-snug text-white/90">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
