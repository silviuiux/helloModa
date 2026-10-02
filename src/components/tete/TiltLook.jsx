"use client";

import { useEffect, useRef, useState } from "react";
import PlaceholderImage from "../PlaceholderImage.jsx";
import { Heart } from "../Icons.jsx";

const EUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

// design-07 "Tête-à-tête": the look as a photograph you can handle.
// - It *develops*: the painting arrives as soft, over-exposed mist and
//   slowly resolves to full colour (globals.css `.tete-develop`).
// - It tilts toward the pointer, with a glint that follows it.
// - Tap turns it over to the pieces (shop links, save to wardrobe);
//   double-tap keeps it, with a small heart. Both also exist as plain
//   buttons under the photo (LookMoment), so nothing is gesture-only.
// Flip/keep state lives in the parent so those buttons can drive it.
export default function TiltLook({
  image,
  seed,
  title,
  pieces = [],
  flipped,
  onFlip,
  liked,
  onKeep,
  onToggleSave,
  savedIds,
}) {
  const tiltRef = useRef(null);
  const imgRef = useRef(null);
  const clickTimer = useRef(null);
  const reduceMotion = useRef(false);
  const [bursts, setBursts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // A look from history is in the server HTML, so its image can finish
  // loading before React hydrates and attaches onLoad — check directly too,
  // or it would stay "developing" forever.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [image?.imageUrl]);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => clearTimeout(clickTimer.current);
  }, []);

  function onPointerMove(e) {
    if (reduceMotion.current || e.pointerType === "touch") return;
    const el = tiltRef.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 11).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
  }
  function onPointerLeave() {
    if (tiltRef.current) tiltRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  function burst(x, y) {
    const id = `${Date.now()}-${Math.random()}`;
    setBursts((b) => [...b, { id, x, y }]);
    setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 1000);
  }

  // Single tap turns it over; a second tap within 260ms keeps it instead.
  function onClick(e) {
    if (e.target.closest("a,button")) return;
    const r = tiltRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onKeep();
      burst(x, y);
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      if (pieces.length) onFlip();
    }, 260);
  }

  function onKeyDown(e) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (pieces.length) onFlip();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[min(340px,36svh)]" style={{ perspective: "1100px" }}>
      <div
        ref={tiltRef}
        role="button"
        tabIndex={0}
        aria-label={pieces.length ? `${title}: press to ${flipped ? "see the photo" : "see the pieces"}` : title}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className="group relative aspect-[4/5] w-full cursor-pointer select-none outline-none transition-transform duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#c9b8ff]/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fdfcfa] rounded-[22px]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
          style={{ transformStyle: "preserve-3d", transform: `rotateY(${flipped ? 180 : 0}deg)` }}
        >
          {/* Front: the photograph */}
          <div
            className={`tete-face absolute inset-0 overflow-hidden rounded-[22px] bg-[#f3eff8] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.35),0_0_0_1px_rgba(43,38,51,0.04)] ${
              flipped ? "pointer-events-none" : ""
            }`}
          >
            {image?.imageUrl ? (
              <img
                ref={imgRef}
                src={image.imageUrl}
                alt={title || ""}
                draggable={false}
                onLoad={() => setLoaded(true)}
                data-done={loaded ? "1" : "0"}
                className="tete-develop h-full w-full object-cover"
              />
            ) : image?.settled ? (
              <PlaceholderImage seed={seed} width={680} height={850} />
            ) : (
              <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_45%,rgba(185,164,255,0.22),rgba(255,214,196,0.12)_45%,transparent_70%)]">
                <div className="flex flex-col items-center gap-4">
                  <span className="tete-breathe block h-3 w-3 rounded-full bg-[#8f78e8] shadow-[0_0_24px_6px_rgba(185,164,255,0.45)]" />
                  <span className="font-script text-[19px] italic text-[#2b2633]/60">developing your look…</span>
                </div>
              </div>
            )}

            {/* Glint that follows the pointer */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)",
                mixBlendMode: "soft-light",
              }}
            />

            {liked && (
              <span className="animate-fade-in absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-[#e46d92] backdrop-blur-md">
                <Heart size={16} fill="currentColor" />
              </span>
            )}
            {image?.errorMessage && (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-12 text-[12.5px] leading-snug text-white/85">
                {image.errorMessage}
              </p>
            )}
          </div>

          {/* Back: the pieces */}
          <div
            className={`tete-face scroll-area absolute inset-0 overflow-y-auto rounded-[22px] bg-white p-5 text-[#1e1a2e] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.35),0_0_0_1px_rgba(43,38,51,0.04)] ${
              flipped ? "" : "pointer-events-none"
            }`}
            style={{ transform: "rotateY(180deg)" }}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#8a8094]">The pieces</p>
            <p className="mt-1 font-script text-[26px] leading-tight">{title}</p>
            <ul className="mt-4 space-y-3">
              {pieces.map((p) => {
                const saved = savedIds?.has(p.id);
                const linked = p.matched && p.productUrl;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f3eff8]">
                      <PlaceholderImage src={linked ? p.imageUrl : undefined} seed={`${p.type}-${p.name}`} width={88} height={112} />
                    </span>
                    <span className="min-w-0 flex-1">
                      {p.brand && (
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8094]">{p.brand}</span>
                      )}
                      <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                      <span className="block text-[12px] text-[#6b6680]">
                        {p.source === "closet" ? (
                          "Already in your wardrobe"
                        ) : linked ? (
                          <a
                            href={p.productUrl}
                            target="_blank"
                            rel="noopener nofollow sponsored"
                            className="underline decoration-[#c9b8ff] underline-offset-2 hover:text-[#6a4bd8]"
                          >
                            {p.retailer || "Shop"}
                            {p.price != null ? ` · ${EUR.format(p.price)}` : ""} ↗
                          </a>
                        ) : (
                          "Worth finding"
                        )}
                      </span>
                    </span>
                    {p.source !== "closet" && (
                      <button
                        onClick={() => onToggleSave?.(p)}
                        aria-label={saved ? "Saved to wardrobe" : "Save to wardrobe"}
                        aria-pressed={saved}
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                          saved ? "bg-[#1e1a2e] text-[#e46d92]" : "bg-[#f3eff8] text-[#6b6680] hover:text-[#1e1a2e]"
                        }`}
                      >
                        <Heart size={14} fill={saved ? "currentColor" : "none"} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-5 text-center text-[11px] text-[#8a8094]">Tap anywhere to turn it back</p>
          </div>
        </div>

        {bursts.map((b) => (
          <span
            key={b.id}
            className="tete-heart pointer-events-none absolute text-[#e46d92]"
            style={{ left: b.x, top: b.y }}
          >
            <Heart size={44} fill="currentColor" />
          </span>
        ))}
      </div>
    </div>
  );
}
