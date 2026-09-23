import { useState } from "react";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Orb from "../Orb.jsx";
import OrganicField from "../OrganicField.jsx";

// Phase 2 "Magic Mirror" (docs/03-roadmap.md): the generated look, via
// Replicate (src/lib/imageGen.js). Generation is kicked off + tracked by
// useOutfitImage (src/lib/useOutfitImage.js); this component only renders
// the three states the caller hands it:
//
//   pending  -> a lavender plate with a slow light sweep, drifting
//               organic cells and spores (OrganicField), and the orb in its
//               thinking state (organic skeleton, never a spinner)
//   image    -> the painting, which resolves in from a blur once it has
//               actually loaded (not the moment the URL arrives, which would
//               flash an empty box first)
//   neither  -> a placeholder photo (src/lib/placeholder.js, seeded per
//               message so it's stable), plus the failure reason if there
//               was one (most often the free-plan quota message)
//
// `editorial` (design exploration, branch design/chat-editorial): swaps
// the rounded glass-ish frame for a sharp-cornered hairline one, and turns
// off the ambient organic field in the skeleton, matching that direction's
// "secondary AI elements" brief — only the orb + caption carry the
// working state, not decorative motion.
export default function OutfitHero({ imageUrl, pending = false, errorMessage, seed, editorial = false }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative aspect-[4/5] w-full overflow-hidden bg-paper ${
        editorial ? "border border-ink/20" : "rounded-bubble border border-line"
      }`}
    >
      {pending && !imageUrl && (
        <div className="skeleton-organic animate-shimmer absolute inset-0 grid place-items-center">
          {!editorial && <OrganicField variant="plate" />}
          <div className="relative flex flex-col items-center gap-5">
            <Orb size={64} state="thinking" />
            <span className={editorial ? "editorial-caption" : "label text-faint"}>painting your look</span>
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

      {!pending && !imageUrl && <PlaceholderImage seed={seed} width={800} height={1000} />}

      {errorMessage && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-5 pt-12"
          style={{ background: "linear-gradient(to top, rgba(30,26,46,0.82), transparent)" }}
        >
          <p className="pointer-events-auto text-[12.5px] leading-snug text-white/90">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
