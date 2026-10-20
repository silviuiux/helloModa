import GuideHeroArt from "./GuideHeroArt.jsx";

// `src` is set only by guideHeroPublicPath(), which checks that the
// generated jpg is on disk. When it is null this renders the committed
// SVG and does not request /guides/{slug}-hero.jpg.
export default function GuideHeroImage({ src, alt, palette, className = "" }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
      ) : (
        <GuideHeroArt palette={palette} title={alt} />
      )}
    </div>
  );
}
