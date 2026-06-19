// Editorial garment illustrations used to fill image placeholders.
// Self-contained SVG (no external images) — each type gets a soft gradient
// background and a stylized flat-lay silhouette so cards feel "shot", not empty.

const GRADIENTS = {
  top: ["#f2f1f7", "#e4e1ee"],
  bottoms: ["#f3f1f7", "#e6e1f0"],
  dress: ["#f4f3f8", "#e7e4f0"],
  outerwear: ["#f1f2f6", "#e2e4ee"],
  shoe: ["#f5f2ed", "#ebe4da"],
  bag: ["#f3f1f7", "#e7e1ee"],
  accessory: ["#f6f2ea", "#efe6d8"],
  look: ["#f4f3f8", "#ded8ec"],
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

export default function GarmentArt({ type = "top", className = "" }) {
  const key = SHAPES[type] ? type : ALIAS[type] || "top";
  const [a, b] = GRADIENTS[key] || GRADIENTS.top;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: `linear-gradient(150deg, ${a} 0%, ${b} 100%)` }}
    >
      {/* soft light spot for depth */}
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-50"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)" }}
      />
      <svg
        viewBox="0 0 120 160"
        className="absolute inset-0 m-auto h-[78%] w-[78%]"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          style={{
            fill: "rgba(70,66,96,0.14)",
          }}
        >
          {SHAPES[key]}
        </g>
        <style>{`
          svg .stroke{ fill:none; stroke:rgba(70,66,96,0.22); stroke-width:1.4; stroke-linecap:round; stroke-linejoin:round; }
          svg .nofill{ fill:none; }
          svg .dot{ fill:rgba(70,66,96,0.24); }
        `}</style>
      </svg>
    </div>
  );
}
