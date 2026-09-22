import { useState } from "react";
import GarmentArt from "../GarmentArt.jsx";
import Orb from "../Orb.jsx";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md): the generated look, via
// Replicate (src/lib/imageGen.js). Generation is kicked off + tracked by
// useOutfitImage (src/lib/useOutfitImage.js); this component only renders
// the three states the caller hands it:
//
//   pending  -> a dark plate with a slow warm light sweep and the orb in its
//               thinking state (organic skeleton, never a spinner)
//   image    -> the painting, which resolves in from a blur once it has
//               actually loaded (not the moment the URL arrives, which would
//               flash an empty box first)
//   neither  -> the GarmentArt illustration, plus the failure reason if
//               there was one (most often now the free-plan quota message)
export default function OutfitHero({ imageUrl, pending = false, errorMessage }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-bubble border border-line bg-paper">
      {pending && !imageUrl && (
        <div className="skeleton-organic animate-shimmer absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-5">
            <Orb size={64} state="thinking" />
            <span className="label text-faint">painting the look</span>
          </div>
        </div>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-1000 ease-out ${
            loaded ? "scale-100 opacity-100 blur-0" : "scale-[1.03] opacity-0 blur-xl"
          }`}
        />
      )}

      {!pending && !imageUrl && <GarmentArt type="look" />}

      {errorMessage && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5 pt-12"
          style={{ background: "linear-gradient(to top, rgba(15,14,12,0.92), transparent)" }}
        >
          <p className="pointer-events-auto text-[12.5px] leading-snug text-ink/90">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
