"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons.jsx";
import Orb from "@/components/Orb.jsx";
import Reveal from "@/components/Reveal.jsx";
import StickyStage from "@/components/landing/StickyStage.jsx";
import OccasionMarquee from "@/components/landing/OccasionMarquee.jsx";
import DetailHighlights from "@/components/landing/DetailHighlights.jsx";
import LandingChatDemo from "@/components/landing/LandingChatDemo.jsx";

// Public marketing page for signed-out visitors (src/app/page.jsx branches
// on auth; signed-in users get the real app at this same path).
//
// Design brief, 2026-09-22 redesign: "organic intelligence" — a dark,
// minimalist, sharply-set page whose one warm, living element is the orb
// (helloModa's presence, the same component the app uses). Immersive-object
// hero: a single dramatic visual with annotations radiating off it on
// hairlines, a massive tight-tracked headline anchored left, exactly one
// primary action per viewport.
//
// Everything asserted here is true of the shipped product — no invented
// customer logos, testimonials or metrics.

const FACTS = [
  { value: "20", label: "occasions covered out of the box" },
  { value: "1", label: "styled look per turn, never a product wall" },
  { value: "EU", label: "Frankfurt — where your data stays" },
  { value: "0", label: "invented prices or fake retailers" },
];

const ORB_CYCLE = ["idle", "listening", "thinking"];

function useScrollPast(threshold = 24) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    function onScroll() {
      setPast(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

function useParallax(factor = 0.06) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function measure() {
      frame = 0;
      setOffset(window.scrollY * factor);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [factor]);
  return offset;
}

// Cycles the hero orb through its three real states so a visitor sees it
// breathe, listen and think without doing anything. Paused when the user
// has asked for reduced motion.
function useOrbCycle(interval = 3200) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % ORB_CYCLE.length), interval);
    return () => clearInterval(id);
  }, [interval]);
  return ORB_CYCLE[i];
}

function Wordmark({ size = 22 }) {
  return (
    <span className="flex items-center gap-2.5">
      <Orb size={size} mini />
      <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink">helloModa</span>
    </span>
  );
}

function PrimaryCta({ children = "Request an invite", className = "" }) {
  return (
    <Link
      href="/register"
      className={`inline-flex items-center gap-2 rounded-[10px] bg-accent px-7 py-3.5 text-[15px] font-semibold text-canvas transition-colors hover:bg-accent-deep ${className}`}
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

function Nav() {
  const scrolled = useScrollPast();
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <Wordmark />
        <nav className="flex items-center gap-6">
          <Link href="/what-to-wear" className="hidden text-[13.5px] text-muted transition-colors hover:text-ink sm:block">
            Occasion guides
          </Link>
          <a href="#try" className="hidden text-[13.5px] text-muted transition-colors hover:text-ink sm:block">
            Try it
          </a>
          <Link href="/login" className="text-[13.5px] text-muted transition-colors hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-semibold text-canvas transition-colors hover:bg-accent-deep"
          >
            Request an invite
          </Link>
        </nav>
      </div>
    </header>
  );
}

// One annotation off the orb: text, a hairline, and a violet dot sitting on
// the orb's edge — the NASA-poster callout pattern. `side` decides which way
// the line runs; `x`/`y` are the dot's position inside the orb box.
function Callout({ side, x, y, index, title, children }) {
  const left = side === "left";
  return (
    <div
      className="absolute hidden -translate-y-1/2 items-center gap-3 lg:flex"
      style={left ? { right: `calc(100% - ${x}px)`, top: y } : { left: x, top: y }}
    >
      {!left && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
      {!left && <span className="h-px w-16 bg-accent-soft" />}
      <div className={`w-48 ${left ? "text-right" : ""}`}>
        <p className="label text-faint">{index}</p>
        <p className="mt-1.5 text-[14px] font-medium leading-snug text-ink">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{children}</p>
      </div>
      {left && <span className="h-px w-16 bg-accent-soft" />}
      {left && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
    </div>
  );
}

// Where a dot at height fraction `f` of the orb box touches the orb's ring
// (globals.css `.orb__ring`, inset -12% — 12% of the *diameter* on each
// side, so the ring's radius is 1.24x the body's).
function edgePoint(size, f, side) {
  const r = size / 2;
  const ring = r * 1.24;
  const y = size * f;
  const dx = Math.sqrt(Math.max(0, ring * ring - (y - r) * (y - r)));
  return { x: side === "left" ? r - dx : r + dx, y };
}

const CALLOUTS = [
  { side: "left", f: 0.28, index: "01", title: "Starts in your closet", body: "Styles from what you own first." },
  { side: "left", f: 0.72, index: "02", title: "One look per turn", body: "A direction, not a product wall." },
  { side: "right", f: 0.3, index: "03", title: "Painted, not stock", body: "Every look rendered in watercolour." },
  { side: "right", f: 0.7, index: "04", title: "Names one piece to buy", body: "Only when your closet can't." },
];

const HERO_ORB = 320;

function HeroObject() {
  const state = useOrbCycle();
  const offset = useParallax(0.06);
  return (
    <div
      className="relative mx-auto h-[240px] w-[240px] sm:h-[320px] sm:w-[320px]"
      style={{ transform: `translateY(${-offset}px)` }}
    >
      {/* Absolutely centred with translate+scale composed in one transform:
          a bare scale() doesn't shrink the layout box, so a 320px orb in a
          240px grid cell overflowed from the start edge on phones. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-100">
        <Orb size={HERO_ORB} state={state} />
      </div>

      {CALLOUTS.map((c) => {
        const { x, y } = edgePoint(HERO_ORB, c.f, c.side);
        return (
          <Callout key={c.index} side={c.side} x={x} y={y} index={c.index} title={c.title}>
            {c.body}
          </Callout>
        );
      })}

      <div className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-2 sm:-bottom-[72px]">
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
        <span className="label whitespace-nowrap text-faint">
          state: <span key={state} className="animate-word-in inline-block text-accent-deep">{state}</span>
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    // overflow-x-CLIP, not hidden: `hidden` turns this into a scroll
    // container, which silently breaks `position: sticky` for the
    // scrollytelling stage. `clip` contains overhangs without a scroll box.
    <div className="app-canvas min-h-screen w-full overflow-x-clip">
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      {/* Vertical composition: the orb and its callouts own the upper
          band; the massive headline anchors bottom-left, body + the one
          CTA sit bottom-right. Side-by-side collided the left callouts
          with a 100px headline. */}
      <section className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pb-14 pt-28 sm:pb-16">
        <div className="animate-fade-in flex flex-1 items-center justify-center" style={{ animationDelay: "150ms" }}>
          <HeroObject />
        </div>

        <div className="mt-24 grid items-end gap-10 lg:grid-cols-[1fr_minmax(320px,400px)] lg:gap-16">
          <div>
            <p className="label animate-fade-up text-accent">Private beta — invite only</p>
            <h1
              className="animate-fade-up mt-6 font-display text-[44px] font-extrabold leading-[0.9] tracking-[-0.045em] text-ink sm:text-[84px] lg:text-[100px]"
              style={{ animationDelay: "120ms" }}
            >
              <span className="mb-2 block font-script text-[0.46em] font-normal italic tracking-[-0.01em] text-muted">
                hello —
              </span>
              you already own <br className="hidden sm:inline" />
              the outfit<span className="text-accent">.</span>
            </h1>
          </div>
          <div className="animate-fade-up lg:pb-3" style={{ animationDelay: "260ms" }}>
            <p className="text-[16.5px] leading-[1.65] text-muted">
              helloModa is a conversational AI stylist. Tell it what&apos;s coming up — it styles a
              real look from the clothes already in your wardrobe, paints you a picture of it, and
              names the one piece worth buying.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <PrimaryCta />
              <p className="text-[13.5px] text-muted">
                Have an invite?{" "}
                <Link href="/login" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────────────── */}
      <section className="border-y border-line">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 px-6 sm:grid-cols-4">
          {FACTS.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 80}
              className={`py-10 sm:py-12 ${i > 0 ? "sm:border-l sm:border-line sm:pl-8" : ""}`}
            >
              <p className="font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] text-ink sm:text-[48px]">
                {f.value}
              </p>
              <p className="label mt-4 max-w-[190px] leading-[1.7] text-faint">{f.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Positioning statement ────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-[1400px] px-6 py-36 sm:py-52">
        <Reveal>
          <p className="label text-accent">The difference</p>
          <h2 className="mt-8 max-w-5xl font-display text-[36px] font-bold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[64px]">
            Most styling apps are a shop with advice bolted on.{" "}
            <span className="text-faint">
              helloModa starts inside your wardrobe, and only goes shopping when it{" "}
              <span className="font-script font-normal italic tracking-normal text-muted">has to.</span>
            </span>
          </h2>
        </Reveal>
      </section>

      {/* ── Scrollytelling stage ─────────────────────────────────────── */}
      <StickyStage />

      {/* ── Occasion breadth ─────────────────────────────────────────── */}
      <section className="py-36 sm:py-52">
        <Reveal className="mx-auto mb-16 grid max-w-[1400px] gap-6 px-6 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-end">
          <div>
            <p className="label text-accent">Range</p>
            <h2 className="mt-6 max-w-2xl font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[56px]">
              Twenty occasions, ready before you ask.
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">
            Weddings and interviews, yes — but also the rooftop birthday, the 90&apos;s throwback
            party, the pumpkin-patch date. Anything you&apos;d actually get dressed for.
          </p>
        </Reveal>
        <OccasionMarquee />
      </section>

      {/* ── Craft details ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-36 sm:pb-52">
        <Reveal className="mb-16">
          <p className="label text-accent">Details</p>
          <h2 className="mt-6 max-w-2xl font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[56px]">
            The small decisions, on purpose.
          </h2>
        </Reveal>
        <DetailHighlights />
      </section>

      {/* ── Interactive demo ─────────────────────────────────────────── */}
      <section id="try" className="mx-auto max-w-[1400px] scroll-mt-24 px-6 pb-36 sm:pb-52">
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,340px)_1fr] lg:gap-20">
          <Reveal>
            <p className="label text-accent">Try it</p>
            <h2 className="mt-6 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">
              Have a go, no account needed.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              Pick an occasion and watch a real turn play out — the same components the signed-in
              app renders, replayed here.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <LandingChatDemo />
          </Reveal>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-36 sm:pb-52">
        <Reveal className="glass grain relative overflow-hidden rounded-xl3 px-8 py-20 sm:px-20 sm:py-28">
          <div className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-90 md:block">
            <Orb size={420} />
          </div>
          <div className="relative max-w-xl">
            <p className="label text-accent">Invite only, for now</p>
            <h2 className="mt-7 font-display text-[48px] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink sm:text-[80px]">
              come get
              <br />
              <span className="font-script font-normal italic tracking-[-0.01em]">dressed.</span>
            </h2>
            <p className="mt-7 max-w-md text-[15.5px] leading-relaxed text-muted">
              helloModa is in private beta while the styling gets sharper. Request an invite and
              we&apos;ll open a seat.
            </p>
            <PrimaryCta className="mt-10" />
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-muted">
              A conversational AI stylist that starts in your wardrobe. Part of helloCorp.
            </p>
          </div>
          <div>
            <p className="label text-faint">Product</p>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li><Link href="/what-to-wear" className="text-muted hover:text-ink">Occasion guides</Link></li>
              <li><a href="#try" className="text-muted hover:text-ink">Try it</a></li>
            </ul>
          </div>
          <div>
            <p className="label text-faint">Account</p>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li><Link href="/login" className="text-muted hover:text-ink">Sign in</Link></li>
              <li><Link href="/register" className="text-muted hover:text-ink">Request an invite</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <p className="label mx-auto max-w-[1400px] px-6 py-6 text-faint">
            © helloModa — private beta · data hosted in the EU
          </p>
        </div>
      </footer>
    </div>
  );
}
