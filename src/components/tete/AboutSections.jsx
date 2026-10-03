"use client";

import { useRef } from "react";
import Link from "next/link";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Reveal from "../Reveal.jsx";
import { occasions } from "../../data/occasions.js";

// What helloModa is and how it works — the landing page's explanations,
// shared by the signed-out landing page (src/app/LandingPage.jsx) and the
// app's welcome (TeteLayout.jsx, where they collapse under a toggle once a
// conversation starts). `showcase` = the public generated looks
// (src/lib/showcaseLooks.js).

const meta = "text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45";
const INK = "#2b2633";

const STEPS = [
  {
    n: "01",
    title: "Tell it where you’re going.",
    body: "A wedding in June, a first date, a Monday that matters — in your own words, or pick an occasion.",
  },
  {
    n: "02",
    title: "It starts in your wardrobe.",
    body: "Every look is built from what you already own first, then painted on you so you can see it before you get dressed.",
  },
  {
    n: "03",
    title: "Then, the perfect match.",
    body: "When a look needs one more piece, helloModa finds the one that completes it — from brands you’ll love, at a fit and price that make sense.",
  },
];

// A look card with the app's photograph treatment (TiltLook): it tilts
// toward the pointer with a soft glint. No flip/keep here — just to look at.
function LookCard({ look, label }) {
  const ref = useRef(null);
  function onMove(e) {
    if (e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`);
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "none";
  }
  return (
    <figure className="w-[68vw] shrink-0 snap-start sm:w-[240px] xl:w-[260px]" style={{ perspective: "1000px" }}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#f3eff8] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.4),0_0_0_1px_rgba(43,38,51,0.04)] transition-transform duration-200 ease-out"
      >
        <PlaceholderImage src={look.url} seed={look.slug} width={560} height={700} />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)",
            mixBlendMode: "soft-light",
          }}
        />
      </div>
      <figcaption className="mt-4 text-center">
        <span className={meta}>{label}</span>
        <span className="mt-1 block font-script text-[24px] leading-tight" style={{ color: INK }}>
          {look.title}
        </span>
      </figcaption>
    </figure>
  );
}

export default function AboutSections({ showcase = [] }) {
  const labelFor = (slug) => occasions.find((o) => o.slug === slug)?.label || "";
  return (
    <>
        {/* ── Positioning: wardrobe first, then the perfect match ───── */}
        <section className="mx-auto max-w-[760px] px-6 py-32 text-center sm:py-44">
          <Reveal>
            <p className={meta}>Why helloModa</p>
            <h2 className="mt-8 font-script text-[40px] leading-[1.08] sm:text-[60px]">
              Your wardrobe first.
              <br />
              <span className="font-hand text-[#8f78e8]">Then, the perfect match.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-balance text-[16px] leading-[1.75] text-[#2b2633]/65">
              Most mornings you already own the outfit — you just can’t see it yet. helloModa
              styles what’s in your closet, and when a look really needs one more piece, it brings
              you the brand and the fit that complete it. One considered piece, never a product wall.
            </p>
          </Reveal>
        </section>

        {/* ── The looks: real generated paintings ──────────────────── */}
        {showcase.length > 0 && (
          <section id="looks" className="scroll-mt-24 pb-32 sm:pb-44">
            <Reveal className="mx-auto max-w-[760px] px-6 text-center">
              <p className={meta}>The looks</p>
              <h2 className="mt-6 font-script text-[36px] leading-[1.1] sm:text-[52px]">
                Painted for the person asking.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-balance text-[15.5px] leading-[1.7] text-[#2b2633]/60">
                Every answer comes with a look painted fresh for that occasion. These are real ones
                helloModa made — with your own avatar, it paints them on you.
              </p>
            </Reveal>
            <div
              className="scroll-area mt-14 snap-x snap-mandatory overflow-x-auto px-6 pb-6 [scrollbar-width:none]"
              style={{ scrollPaddingInline: "1.5rem" }}
            >
              {/* w-max + mx-auto: centred when the row fits, scrollable
                  from its first card when it doesn't (justify-center on
                  an overflowing flex row hides its start). */}
              <div className="mx-auto flex w-max gap-6 sm:gap-8">
                {showcase.map((look) => (
                  <LookCard key={look.slug} look={look} label={labelFor(look.slug)} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="how" className="mx-auto max-w-[1040px] scroll-mt-24 px-6 pb-32 sm:pb-44">
          <Reveal className="text-center">
            <p className={meta}>How it works</p>
          </Reveal>
          <div className="mt-12 grid gap-14 sm:grid-cols-3 sm:gap-10">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="border-t border-[#2b2633]/10 pt-6">
                <p className={meta}>{s.n}</p>
                <h3 className="mt-3 font-script text-[28px] leading-[1.15]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.7] text-[#2b2633]/60">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Occasions ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[900px] px-6 pb-32 text-center sm:pb-44">
          <Reveal>
            <p className={meta}>Twenty occasions, or your own words</p>
            <p className="mt-8 font-script text-[22px] italic leading-[1.9] text-[#2b2633]/55 sm:text-[26px]">
              {occasions.map((o, i) => (
                <span key={o.slug}>
                  {o.label.toLowerCase()}
                  {i < occasions.length - 1 && <span className="mx-2 not-italic text-[#8f78e8]/50">·</span>}
                </span>
              ))}
            </p>
            <Link
              href="/what-to-wear"
              className="mt-10 inline-block text-[14px] text-[#2b2633]/55 underline decoration-[#2b2633]/15 underline-offset-4 transition-colors hover:text-[#2b2633] hover:decoration-[#8f78e8]"
            >
              Browse the occasion guides →
            </Link>
          </Reveal>
        </section>

    </>
  );
}
