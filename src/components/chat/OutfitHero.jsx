import GarmentArt from "../GarmentArt.jsx";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md): a real photorealistic image,
// generated on demand via Replicate (src/lib/imageGen.js). Purely
// presentational — generation is kicked off + tracked by useOutfitImage
// (src/lib/useOutfitImage.js); the caller (MessageBubble) only renders this
// once that hook reports "settled", so this never needs its own loading
// state or badge.
export default function OutfitHero({ imageUrl }) {
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-bubble">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <GarmentArt type="look" />
      )}
    </div>
  );
}
