"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PresenceLight from "@/components/tete/PresenceLight.jsx";
import BlobGallery from "@/components/tete/BlobGallery.jsx";
import HandwrittenCycle from "@/components/tete/HandwrittenCycle.jsx";
import PlaceholderImage from "@/components/PlaceholderImage.jsx";
import Reveal from "@/components/Reveal.jsx";
import { occasions } from "@/data/occasions";

// Public page for signed-out visitors (src/app/page.jsx branches on auth;
// signed-in users get the app at this same path).
//
// Redesigned 2026-10-02 to match the main interface (src/components/tete/):
// paper-white, lots of air, serif type, the same slow colour washes
// (PresenceLight) and the same occasion blobs that reveal on hover
// (BlobGallery) — here filled with real looks helloModa generated
// (`showcase`, src/lib/showcaseLooks.js), so a visitor sees what the
// paintings actually look like. Copy is brand-friendly: the wardrobe comes
// first, and when a look needs one more piece helloModa finds the right
// match from the brands you'd actually wear.
//
// Everything asserted here is true of the shipped product — no invented
// customer logos, testimonials or metrics.

const INK = "#2b2633";

const COVER_LINES = [
  "the first date.",
  "the big interview.",
  "the vineyard wedding.",
  "the rooftop birthday.",
  "the weekend away.",
  "the festival.",
  "whatever's next.",
];

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

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const meta = "text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45";

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 font-script text-[22px] italic text-[#2b2633]/85">
      <span className="tete-breathe block h-2 w-2 rounded-full bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.5)]" />
      helloModa
    </span>
  );
}

function JoinButton({ className = "", children = "Join the beta" }) {
  return (
    <Link
      href="/register"
      className={`inline-flex items-center gap-2 rounded-full bg-[#2b2633] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#8f78e8] ${className}`}
    >
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

function Nav() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#fdfcfa] from-45% to-transparent"
      />
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-7">
        <Link href="/" aria-label="helloModa home">
          <Wordmark />
        </Link>
        <nav className="absolute left-1/2 top-[30px] hidden -translate-x-1/2 items-center gap-8 md:flex">
          <a href="#looks" className={`${meta} transition-colors hover:text-[#2b2633]`}>
            The looks
          </a>
          <a href="#how" className={`${meta} transition-colors hover:text-[#2b2633]`}>
            How it works
          </a>
          <Link href="/what-to-wear" className={`${meta} transition-colors hover:text-[#2b2633]`}>
            Occasion guides
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[13px] text-[#2b2633]/60 transition-colors hover:text-[#2b2633]">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
          >
            Join the beta
          </Link>
        </div>
      </header>
    </>
  );
}

// The hero mirrors the app's welcome: the same headline and the same
// blobs, which here hold real generated looks.
function Hero({ images }) {
  const [touch, setTouch] = useState(false);
  const [picks, setPicks] = useState(() => occasions.slice(0, 5));

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
    const withLook = shuffled(occasions.filter((o) => images[o.slug]));
    const rest = shuffled(occasions.filter((o) => !images[o.slug]));
    setPicks([...withLook, ...rest].slice(0, 5));
  }, [images]);

  return (
    <section className="relative min-h-[100svh] w-full">
      <BlobGallery
        items={picks}
        images={images}
        cta="See the looks ↓"
        onPick={() => document.getElementById("looks")?.scrollIntoView({ behavior: "smooth" })}
      />
      <div className="pointer-events-none relative mx-auto flex min-h-[100svh] max-w-[680px] flex-col justify-center px-6 pb-24 pt-28 text-center sm:pt-32">
        <p className={`animate-fade-in ${meta}`}>Your AI stylist · private beta</p>
        <h1
          className="animate-fade-up mt-6 font-script text-[52px] leading-[1] tracking-[-0.01em] sm:text-[84px]"
          style={{ color: INK, animationDelay: "120ms" }}
        >
          Dressed for
          <br />
          <span className="inline-block min-h-[2.1em] sm:min-h-0">
            <HandwrittenCycle lines={COVER_LINES} className="leading-[1.15] text-[#8f78e8] sm:whitespace-nowrap" />
          </span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-7 max-w-lg text-balance text-[16px] leading-[1.7] text-[#2b2633]/65"
          style={{ animationDelay: "260ms" }}
        >
          Tell helloModa where you’re going. It styles you from your own wardrobe, paints the look
          on you — and finds the perfect match for anything it’s missing.
        </p>
        <div
          className="animate-fade-up pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-5"
          style={{ animationDelay: "380ms" }}
        >
          <JoinButton />
          <Link
            href="/login"
            className="text-[14px] text-[#2b2633]/55 underline decoration-[#2b2633]/15 underline-offset-4 transition-colors hover:text-[#2b2633] hover:decoration-[#8f78e8]"
          >
            I have an account
          </Link>
        </div>
        <p className="animate-fade-in mt-12 text-[12px] text-[#2b2633]/35" style={{ animationDelay: "700ms" }}>
          {touch ? "Each shape is a look helloModa painted" : "Hover the shapes — each one is a look helloModa painted"}
        </p>
      </div>
    </section>
  );
}

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

export default function LandingPage({ showcase = [] }) {
  const energyRef = useRef(0);
  const images = Object.fromEntries(showcase.map((l) => [l.slug, l.url]));
  const labelFor = (slug) => occasions.find((o) => o.slug === slug)?.label || "";

  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#fdfcfa] font-sans" style={{ color: INK }}>
      <PresenceLight energyRef={energyRef} thinking={false} />
      <div aria-hidden="true" className="tete-grain pointer-events-none fixed inset-0 z-[15]" />
      <Nav />

      <main className="relative z-10">
        <Hero images={images} />

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

        {/* ── Closing ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[760px] px-6 pb-36 text-center sm:pb-48">
          <Reveal>
            <p className={meta}>Private beta</p>
            <h2 className="mt-7 font-script text-[56px] leading-[0.95] sm:text-[88px]">
              Come get <span className="font-hand text-[#8f78e8]">dressed.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-md text-balance text-[15.5px] leading-[1.7] text-[#2b2633]/60">
              helloModa is invite-only while we refine the styling. Got a code? You’re one step away.
              No code yet? Ask whoever sent you here — they can pass theirs on.
            </p>
            <JoinButton className="mt-10" />
          </Reveal>
        </section>

        <footer className="border-t border-[#2b2633]/10">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
            <Wordmark />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#2b2633]/55">
              <Link href="/what-to-wear" className="hover:text-[#2b2633]">
                Occasion guides
              </Link>
              <Link href="/login" className="hover:text-[#2b2633]">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-[#2b2633]">
                Join with an invite
              </Link>
            </nav>
            <p className={meta}>© helloModa · data stored in the EU</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
