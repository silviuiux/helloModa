"use client";

import GarmentArt from "../GarmentArt.jsx";
import Orb from "../Orb.jsx";
import Reveal from "../Reveal.jsx";

// Specimen cards, not feature bullets. Each one renders the actual detail
// live rather than describing it — the corner geometry uses the real
// rounded-bubble-sm/-reply-sm tokens, the type specimens are the real three
// faces, the fallback tile is the real GarmentArt component, and the
// presence card is the real Orb in each of its three states. A bento with
// deliberately uneven spans (7/5, 5/7, 12) so it reads as a composition
// rather than a card row.
function Card({ span, label, title, body, children }) {
  return (
    <Reveal className={`${span} glass-soft grain relative overflow-hidden rounded-xl3 p-7 sm:p-8`}>
      <p className="label text-accent-deep">{label}</p>
      <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-[-0.025em] text-ink sm:text-[26px]">
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
        body="Every bubble, photo and button shares one idea — rounded everywhere but one near-square corner: bottom-left when you speak, top-right when it answers. The shape tells you who's talking, so the interface never needs a label to do it."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="max-w-xs rounded-bubble-sm border border-accent-soft/50 bg-accent-tint/70 px-5 py-3.5">
              <p className="text-[13.5px] leading-relaxed text-ink">Rooftop birthday, Saturday.</p>
            </div>
            <Annotation>square bottom-left</Annotation>
          </div>
          <div className="flex flex-row-reverse items-center gap-4">
            <div className="max-w-xs rounded-bubble-reply-sm border border-accent-soft bg-white/[0.04] px-5 py-3.5">
              <p className="text-[13.5px] leading-relaxed text-ink">On it — give me a second.</p>
            </div>
            <Annotation>square top-right</Annotation>
          </div>
        </div>
      </Card>

      <Card
        span="sm:col-span-5"
        label="Three voices"
        title="Sans, serif, mono."
        body="A sharp geometric sans carries structure, an editorial serif names each look, and anything that behaves like data is monospaced. Nothing is decorative — each face marks a different kind of information."
      >
        <div className="space-y-4">
          <p className="font-script text-[38px] italic leading-none text-ink">Rooftop after dark</p>
          <p className="font-display text-[22px] font-bold tracking-[-0.03em] text-ink">How it works</p>
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
                className="rounded-full border border-line bg-white/[0.04] px-3.5 py-1.5 text-[11px] uppercase tracking-label text-muted"
              >
                {t}
              </span>
            )
          )}
        </div>
      </Card>

      <Card
        span="sm:col-span-12"
        label="Presence"
        title="Alive, not animated."
        body="helloModa is a shape, not a mascot. It breathes while it waits, leans in while you type, and draws itself inward while it styles — every change a slow blend, never a spinner or a bounce."
      >
        <div className="flex flex-wrap items-end gap-x-16 gap-y-10">
          {[
            ["idle", "waiting"],
            ["listening", "you're typing"],
            ["thinking", "styling your look"],
          ].map(([state, caption]) => (
            <div key={state} className="flex items-center gap-5">
              <Orb size={72} state={state} />
              <div>
                <p className="label text-accent-deep">{state}</p>
                <p className="mt-1 text-[13px] text-muted">{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
