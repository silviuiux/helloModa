"use client";

import GarmentArt from "../GarmentArt.jsx";
import Reveal from "./Reveal.jsx";

// Specimen cards, not feature bullets. Each one renders the actual detail
// live rather than describing it — the corner geometry uses the real
// rounded-bubble-sm/-reply-sm tokens (small-element scale — see
// tailwind.config.js), the type specimens are the real three faces, the
// fallback tile is the real GarmentArt component. A bento with deliberately
// uneven spans (7/5, 5/7) so it reads as a composition rather than a
// four-up card row.
function Card({ span, label, title, body, children }) {
  return (
    <Reveal className={`${span} glass-soft grain relative overflow-hidden rounded-xl3 p-7 sm:p-8`}>
      <p className="label text-accent-deep">{label}</p>
      <h3 className="mt-3 font-display text-[22px] font-medium leading-tight text-ink sm:text-[26px]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-muted">{body}</p>
      <div className="mt-7">{children}</div>
    </Reveal>
  );
}

function Annotation({ children }) {
  return (
    <span className="label flex items-center gap-2 text-faint">
      <span className="h-px w-5 bg-line" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function DetailHighlights() {
  return (
    <div className="grid gap-5 sm:grid-cols-12">
      <Card
        span="sm:col-span-7"
        label="Geometry"
        title="Every corner is round but one."
        body="Every bubble, photo and button shares the same idea — rounded everywhere but one edge, square bottom-left when you speak, square top-right when it answers. Large photos get a full 128px curve; text and buttons get a smaller one, so a short message never reads as a pill."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="max-w-xs rounded-bubble-sm border border-accent-soft/50 bg-accent-tint/70 px-5 py-3.5">
              <p className="text-[13.5px] leading-relaxed text-ink">Rooftop birthday, Saturday.</p>
            </div>
            <Annotation>square bottom-left</Annotation>
          </div>
          <div className="flex flex-row-reverse items-center gap-4">
            <div className="max-w-xs rounded-bubble-reply-sm border border-accent-soft bg-white/60 px-5 py-3.5">
              <p className="text-[13.5px] leading-relaxed text-ink">On it — give me a second.</p>
            </div>
            <Annotation>square top-right</Annotation>
          </div>
        </div>
      </Card>

      <Card
        span="sm:col-span-5"
        label="Three voices"
        title="Script, serif, mono."
        body="A handwritten face names the look, an editorial serif carries structure, and anything that behaves like data is monospaced. Nothing is decorative — each face marks a different kind of information."
      >
        <div className="space-y-4">
          <p className="font-script text-[34px] leading-none text-ink">Rooftop after dark</p>
          <p className="font-display text-[20px] font-medium text-ink">How it works</p>
          <p className="label text-muted">03 — the look</p>
        </div>
      </Card>

      <Card
        span="sm:col-span-5"
        label="Graceful degradation"
        title="It never shows you a broken frame."
        body="Photography is generated per look and cached. Until an image exists, you get a drawn garment in the right silhouette — a deliberate illustration, never an empty box or a spinner."
      >
        <div className="flex items-end gap-4">
          <div className="relative aspect-square w-28 overflow-hidden rounded-xl2 shadow-soft">
            <GarmentArt type="dress" />
          </div>
          <div className="relative aspect-square w-28 overflow-hidden rounded-xl2 shadow-soft">
            <GarmentArt type="outerwear" />
          </div>
          <Annotation>fallback, not failure</Annotation>
        </div>
      </Card>

      <Card
        span="sm:col-span-7"
        label="House style"
        title="One painted look, not stock photography."
        body="Every generated image runs through the same watercolour directive — visible brushwork and paper texture, with the fit and fabric of the outfit still rendered precisely. It's defined in exactly one place in the codebase, so the whole product shifts together when it changes."
      >
        <div className="flex flex-wrap items-center gap-3">
          {["Hand-painted", "Visible brushwork", "Paper texture", "Precise fit", "Soft natural light"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-line bg-white/50 px-3.5 py-1.5 text-[11px] uppercase tracking-label text-muted"
              >
                {t}
              </span>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
