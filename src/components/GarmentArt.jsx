// Editorial garment illustrations used to fill image placeholders.
// Self-contained SVG (no external images) — each type gets a dark plate and
// a flat-lay silhouette drawn as fine light linework with amber detail dots,
// so fallbacks read as deliberate technical drawings, not empty boxes.

// Dark warm plates, a barely-there hue shift per type so a grid of them
// isn't a flat wall (2026-09-22 dark redesign — these were light lavender).
const GRADIENTS = {
  top: ["#1d1a16", "#131110"],
  bottoms: ["#1a1a1c", "#121214"],
  dress: ["#1f1917", "#141110"],
  outerwear: ["#191b1b", "#111313"],
  shoe: ["#201b15", "#15120e"],
  bag: ["#1c1917", "#131110"],
  accessory: ["#221c13", "#16130d"],
  look: ["#221c14", "#12100d"],
};

// Each path is drawn in a 120 x 160 viewBox, centered around x=60.
const SHAPES = {
  top: (
    <>
      <path d="M40 40 L55 31 q5 4 10 0 L80 40 L93 56 L83 67 L78 60 L78 104 Q60 110 42 104 L42 60 L37 67 L27 56 Z" />
      <path d="M55 31 q5 8 10 0" className="stroke" />
      <path d="M42 60 L42 100 M78 60 L78 100" className="stroke" />
    </>
  ),
  bottoms: (
    <>
      <path d="M42 34 H78 L80 50 L74 132 H62 L60 78 L58 132 H46 L40 50 Z" />
      <path d="M42 40 H78" className="stroke" />
      <path d="M60 50 V126" className="stroke" />
    </>
  ),
  dress: (
    <>
      <path d="M45 34 L54 27 q6 5 12 0 L75 34 L70 45 L70 56 Q90 104 85 138 Q60 147 35 138 Q30 104 50 56 L50 45 Z" />
      <path d="M54 27 q6 9 12 0" className="stroke" />
      <path d="M50 56 Q60 60 70 56" className="stroke" />
    </>
  ),
  outerwear: (
    <>
      <path d="M40 36 L54 29 L60 40 L66 29 L80 36 L92 56 L83 66 L80 60 L80 128 H40 L40 60 L37 66 L28 56 Z" />
      <path d="M54 29 L60 40 L66 29" className="stroke" />
      <path d="M60 40 V126" className="stroke" />
      <circle cx="60" cy="74" r="1.6" className="dot" />
      <circle cx="60" cy="92" r="1.6" className="dot" />
    </>
  ),
  shoe: (
    <>
      <path d="M28 92 Q28 80 44 80 L66 80 Q74 80 80 86 L90 96 Q94 100 88 104 L40 104 Q28 104 28 96 Z" />
      <path d="M44 80 L42 96 M54 81 L52 97 M64 83 L62 99" className="stroke" />
    </>
  ),
  bag: (
    <>
      <path d="M42 64 H78 L84 92 Q84 124 60 124 Q36 124 36 92 Z" />
      <path d="M48 64 Q48 44 60 44 Q72 44 72 64" className="stroke nofill" />
      <path d="M42 76 H78" className="stroke" />
    </>
  ),
  accessory: (
    <>
      <circle cx="48" cy="78" r="15" className="stroke nofill" />
      <circle cx="78" cy="92" r="11" className="stroke nofill" />
      <circle cx="48" cy="62" r="2.4" className="dot" />
      <circle cx="78" cy="80" r="2.2" className="dot" />
    </>
  ),
  look: (
    <>
      <path d="M40 30 L52 24 q8 4 16 0 L80 30 L75 40 L75 50 Q90 92 86 120 Q60 128 34 120 Q30 92 45 50 L45 40 Z" />
      <path d="M52 24 q8 7 16 0" className="stroke" />
    </>
  ),
};

const ALIAS = {
  shirt: "top",
  knit: "top",
  hanger: "outerwear",
  trousers: "bottoms",
  shorts: "bottoms",
  skirt: "bottoms",
  sparkle: "accessory",
  jewelry: "accessory",
};

// `bare` drops the gradient plate and light spot and renders only the
// silhouette, for callers that supply their own background — see
// landing/EditorialPlate.jsx, which layers several silhouettes over one
// shared colour story. `strength` scales the ink so a silhouette can read
// at hero scale without being repainted.
export default function GarmentArt({ type = "top", className = "", bare = false, strength = 1 }) {
  const key = SHAPES[type] ? type : ALIAS[type] || "top";
  const [a, b] = GRADIENTS[key] || GRADIENTS.top;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={bare ? undefined : { background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)` }}
    >
      {!bare && (
        /* soft light spot for depth */
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(212,168,83,0.16), transparent 70%)" }}
        />
      )}
      <svg
        viewBox="0 0 120 160"
        className="absolute inset-0 m-auto h-[78%] w-[78%]"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          style={{
            fill: `rgba(236,232,225,${0.06 * strength})`,
            stroke: `rgba(236,232,225,${0.22 * strength})`,
            strokeWidth: 0.8,
          }}
        >
          {SHAPES[key]}
        </g>
        <style>{`
          svg .stroke{ fill:none; stroke:rgba(236,232,225,${0.34 * strength}); stroke-width:1; stroke-linecap:round; stroke-linejoin:round; }
          svg .nofill{ fill:none; }
          svg .dot{ fill:rgba(212,168,83,${0.75 * strength}); }
        `}</style>
      </svg>
    </div>
  );
}
