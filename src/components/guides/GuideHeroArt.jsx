// Committed stand-in for a guide hero until public/guides/{slug}-hero.jpg
// exists. Inline SVG only — the page does not request an image file.
// Each guide's palette (src/data/guides.js) tints the washes so the cards
// don't all look identical.
export default function GuideHeroArt({ palette = [], title = "" }) {
  const swatches = (palette.length ? palette : ["#e7dfd4", "#c9bfe0", "#8f78e8"]).slice(0, 5);
  const [a, b, c, d] = [swatches[0], swatches[1] || swatches[0], swatches[2] || swatches[0], swatches[3]];

  return (
    <svg viewBox="0 0 800 1000" className="h-full w-full" role="img" aria-label={title || "Occasion"}>
      <rect width="800" height="1000" fill="#f6f1ea" />
      <ellipse cx="230" cy="280" rx="270" ry="210" fill={a} opacity="0.9" />
      <ellipse cx="560" cy="460" rx="250" ry="290" fill={b} opacity="0.72" />
      <ellipse cx="330" cy="760" rx="310" ry="230" fill={c} opacity="0.5" />
      {d ? <ellipse cx="640" cy="170" rx="150" ry="120" fill={d} opacity="0.55" /> : null}
      <g fill="#2b2633" opacity="0.38">
        <circle cx="400" cy="310" r="42" />
        <path d="M352 360c-18 18-36 48-44 86 28 8 52 8 92 0-8-38-26-68-44-86h-4z" />
        <path d="M338 470c-46 70-62 210-58 340h58c-2-90 8-170 28-230 18 62 28 142 30 230h62c8-140-8-270-58-340-16 28-36 46-62 46s-46-18-62-46z" />
      </g>
    </svg>
  );
}
