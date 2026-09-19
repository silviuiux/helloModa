import GarmentArt from "../GarmentArt.jsx";

// Stand-in for a real generated outfit-in-scene image. Deliberately labeled
// as a preview, not final imagery — real generation (SDXL via a hosted
// provider) is a separate later step, not silently faked here.
// See docs/09-conversation-design.md.
export default function OutfitHero() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl2">
      <GarmentArt type="look" />
      <span className="glass-circle absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        AI preview
      </span>
    </div>
  );
}
