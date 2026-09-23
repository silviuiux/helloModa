// Ambient organic life behind a surface: wandering violet cells, spores
// drifting upward, and hairline filaments flowing sideways
// (globals.css `.organic-*`). Purely decorative and pointer-transparent.
//
// variant "page"  — fixed behind a whole page (LandingPage, AppShell);
//                   large, very slow, very faint.
// variant "plate" — fills its (relative, overflow-hidden) parent, e.g. the
//                   image-generation skeleton; smaller, quicker, denser, so
//                   the wait itself looks alive.
//
// Positions come from a fixed pseudo-random sequence (not Math.random), so
// server and client render identical markup.
function rand(i, salt) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const CELL_COLORS = [
  "rgba(167, 137, 244, 0.22)",
  "rgba(212, 200, 251, 0.5)",
  "rgba(255, 255, 255, 0.85)",
  "rgba(139, 108, 240, 0.14)",
  "rgba(236, 214, 255, 0.45)",
];

const CONFIG = {
  page: { cells: 5, spores: 22, cellSize: [34, 58], unit: "vmax", cellDur: [55, 90], sporeDur: [28, 48], filaments: 3 },
  plate: { cells: 4, spores: 12, cellSize: [55, 85], unit: "%", cellDur: [9, 16], sporeDur: [7, 13], filaments: 2 },
  // design/chat-moodboard: a few slow dust motes, no cells/filaments — the
  // collage itself carries the page, this is just a trace of ambient life.
  dust: { cells: 0, spores: 7, cellSize: [0, 0], unit: "vmax", cellDur: [60, 60], sporeDur: [50, 80], filaments: 0 },
};

// A soft sine wave spanning two tile widths so translateX(-50%) loops
// seamlessly.
function wavePath(amp, periods, y) {
  const w = 2400;
  const step = w / (periods * 2);
  let d = `M0 ${y}`;
  for (let i = 0; i < periods * 2; i++) {
    const cy = i % 2 === 0 ? y - amp : y + amp;
    d += ` Q${step * i + step / 2} ${cy} ${step * (i + 1)} ${y}`;
  }
  return d;
}

export default function OrganicField({ variant = "page", className = "" }) {
  const c = CONFIG[variant] || CONFIG.page;
  const fixed = variant === "page" || variant === "dust";

  return (
    <div
      className={`organic-field ${className}`}
      style={fixed ? { position: "fixed" } : undefined}
      aria-hidden="true"
    >
      {Array.from({ length: c.cells }, (_, i) => {
        const size = c.cellSize[0] + rand(i, 1) * (c.cellSize[1] - c.cellSize[0]);
        const color = CELL_COLORS[i % CELL_COLORS.length];
        return (
          <span
            key={`c${i}`}
            className="organic-cell"
            style={{
              width: `${size}${c.unit}`,
              height: `${size * (0.62 + rand(i, 2) * 0.3)}${c.unit}`,
              left: `${rand(i, 3) * 100 - size / (c.unit === "%" ? 2 : 4)}%`,
              top: `${rand(i, 4) * 100 - 20}%`,
              background: `radial-gradient(closest-side, ${color}, transparent)`,
              "--dur": `${c.cellDur[0] + rand(i, 5) * (c.cellDur[1] - c.cellDur[0])}s`,
              "--delay": `${-rand(i, 6) * c.cellDur[1]}s`,
            }}
          />
        );
      })}

      {Array.from({ length: c.filaments }, (_, i) => (
        <svg
          key={`f${i}`}
          className="organic-filament"
          style={{
            top: `${22 + i * 26 + rand(i, 7) * 10}%`,
            height: 80,
            "--dur": `${(fixed ? 70 : 14) + i * (fixed ? 25 : 5)}s`,
            animationDirection: i % 2 ? "reverse" : "normal",
            opacity: fixed ? 0.35 : 0.7,
          }}
          viewBox="0 0 2400 80"
          preserveAspectRatio="none"
        >
          <path
            d={wavePath(14 + i * 8, 3 + i, 40)}
            fill="none"
            stroke={i === 1 ? "rgba(255,255,255,0.9)" : "rgba(139,108,240,0.28)"}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}

      {Array.from({ length: c.spores }, (_, i) => {
        const s = 1.5 + rand(i, 8) * 3;
        const dur = c.sporeDur[0] + rand(i, 9) * (c.sporeDur[1] - c.sporeDur[0]);
        return (
          <span
            key={`s${i}`}
            className={`organic-spore ${i % 3 === 0 ? "organic-spore--light" : ""}`}
            style={{
              width: s,
              height: s,
              left: `${rand(i, 10) * 100}%`,
              top: `${70 + rand(i, 11) * 35}%`,
              "--dur": `${dur}s`,
              "--delay": `${-rand(i, 12) * dur}s`,
              "--sway": `${(rand(i, 13) - 0.5) * (fixed ? 160 : 60)}px`,
              "--rise": fixed ? "-90vh" : "-420px",
            }}
          />
        );
      })}
    </div>
  );
}
