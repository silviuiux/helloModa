"use client";

import Orb from "../Orb.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Reveal from "../Reveal.jsx";

// "What you get" — benefit cards, each carrying a small live specimen of
// the real feature rather than an icon: the avatar's measurement-driven
// likeness (helloAvatar, src/components/avatars/), the closet numbers
// (ClosetStats.jsx — values here are an illustrative example, labelled as
// such), the style journal (VibeCard.jsx), shopping honesty (Awin-matched
// products, docs/05-integrations-affiliates.md) and the orb's three real
// states. Every claim here is true of the shipped product — copy rewrite
// 2026-09-22 (docs/10-copy-deck.md). A bento with deliberately uneven spans
// (7/5, 5/7, 12) so it reads as a composition rather than a card row.
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

function Chip({ children }) {
  return (
    <span className="rounded-full border border-line bg-white/60 px-3.5 py-1.5 text-[11px] uppercase tracking-label text-muted">
      {children}
    </span>
  );
}

export default function DetailHighlights() {
  return (
    <div className="grid gap-5 sm:grid-cols-12">
      <Card
        span="sm:col-span-7"
        label="helloAvatar"
        title="See it on you, not on a model."
        body="Add a photo and your measurements once. helloModa paints a watercolour avatar with your face, hair and real build — not a default slim-and-athletic body — and dresses it in every look it styles for you. The photo is deleted as soon as the painting is done."
      >
        <div className="flex items-end gap-5">
          <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-xl2 shadow-soft">
            <PlaceholderImage seed="avatar-specimen" width={320} height={400} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip>178 cm</Chip>
            <Chip>Average build</Chip>
            <Chip>Wavy hair</Chip>
            <Chip>Size M / 32</Chip>
          </div>
        </div>
      </Card>

      <Card
        span="sm:col-span-5"
        label="Closet insights"
        title="Know what your clothes really cost."
        body="Add what you paid and log when you wear something. helloModa shows your cost per wear, what your wardrobe is worth, and the pieces you never reach for — so the next purchase is a smarter one."
      >
        <div className="grid grid-cols-3 gap-3 border-t border-line pt-5">
          {[
            ["€1,240", "wardrobe value"],
            ["€4", "avg. cost / wear"],
            ["6", "never worn"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display text-[24px] font-bold tracking-[-0.03em] text-ink">{v}</p>
              <p className="label mt-1.5 leading-[1.6] text-faint">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          <Annotation>example closet</Annotation>
        </p>
      </Card>

      <Card
        span="sm:col-span-5"
        label="Style journal"
        title="Every look, kept."
        body="Each look you're styled lands in your journal with its painting and its story. Come back before the next wedding, the next trip, the next Tuesday — and restyle it in one message."
      >
        <div className="flex items-end gap-3">
          {["journal-a", "journal-b", "journal-c"].map((seed, i) => (
            <div
              key={seed}
              className="relative aspect-[4/5] w-20 overflow-hidden rounded-xl2 shadow-soft"
              style={{ transform: `translateY(${i === 1 ? -8 : 0}px)` }}
            >
              <PlaceholderImage seed={seed} width={200} height={250} />
            </div>
          ))}
          <p className="ml-2 font-script text-[26px] leading-none text-ink">Vineyard, golden hour</p>
        </div>
      </Card>

      <Card
        span="sm:col-span-7"
        label="Honest shopping"
        title="It only sends you shopping when it has to."
        body="The look is styled first, from what you own. Only if something is genuinely missing does helloModa point to one real product from a real shop, at its real price. Some links earn helloModa a small commission — that never decides what gets recommended."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Chip>Your closet first</Chip>
          <Chip>One piece, max</Chip>
          <Chip>Real retailers</Chip>
          <Chip>Real prices</Chip>
          <Chip>No sponsored picks</Chip>
        </div>
      </Card>

      <Card
        span="sm:col-span-12"
        label="Always listening"
        title="A stylist that feels present."
        body="helloModa isn't a chat box with a logo. It breathes while it waits, leans in while you type, and gathers itself while it styles — so you always know it's with you, without a spinner in sight."
      >
        <div className="flex flex-wrap items-end gap-x-16 gap-y-10">
          {[
            ["idle", "ready when you are"],
            ["listening", "hearing you out"],
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
