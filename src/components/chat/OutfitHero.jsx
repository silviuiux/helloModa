import GarmentArt from "../GarmentArt.jsx";

// Stand-in for a real generated outfit-in-scene image. Deliberately labeled
// as a preview, not final imagery — real generation (SDXL via a hosted
// provider) is a separate later step, not silently faked here.
// See docs/09-conversation-design.md.
export default function OutfitHero({ title }) {
  return (
    <div className="relative h-64 overflow-hidden rounded-xl3 sm:h-72">
      <GarmentArt type="look" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.85), transparent)" }}
      />
      <span className="glass-circle absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
        AI preview
      </span>
      {title && (
        <span className="absolute bottom-3 left-4 right-4 font-script text-[42px] leading-none text-ink">
          {title}
        </span>
      )}
    </div>
  );
}
