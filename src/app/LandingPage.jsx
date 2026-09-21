"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkle, ArrowRight, Hanger } from "@/components/Icons.jsx";
import EditorialPlate from "@/components/landing/EditorialPlate.jsx";
import Reveal from "@/components/landing/Reveal.jsx";
import StickyStage from "@/components/landing/StickyStage.jsx";
import OccasionMarquee from "@/components/landing/OccasionMarquee.jsx";
import DetailHighlights from "@/components/landing/DetailHighlights.jsx";
import LandingChatDemo from "@/components/landing/LandingChatDemo.jsx";

// Public marketing page for signed-out visitors (src/app/page.jsx branches
// on auth; signed-in users get the real app at this same path).
//
// Design brief, 2026-09-21: editorial atelier — helloModa's established
// light/warm/lavender identity and script display face, composed with the
// structural discipline of an editorial spread: typographic authority,
// monospaced data labels, asymmetric splits instead of centred stacks,
// uneven bento spans, 140px+ section rhythm, glass materiality.
//
// Conversion structure follows current SaaS landing-page practice: exactly
// one primary action per viewport (the secondary path is a text link, not a
// competing button), trust signals before the first feature, real product
// UI rather than illustration, and a single story that unfolds on scroll
// instead of a stack of unrelated sections.
//
// Everything asserted here is true of the shipped product — no invented
// customer logos, no fabricated testimonials, no metrics we don't have, and
// nothing claimed for the affiliate catalogue, which isn't wired into chat
// yet (docs/05-integrations-affiliates.md).

const FACTS = [
  { value: "20", label: "occasions covered out of the box" },
  { value: "1", label: "styled look per turn, never a product wall" },
  { value: "EU", label: "Frankfurt — where your data stays" },
  { value: "0", label: "invented prices or fake retailers" },
];

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

function Nav() {
  const scrolled = useScrollPast();
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-line/70" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white shadow-soft">
            <Sparkle size={15} />
          </span>
          <span className="font-display text-[18px] font-medium text-ink">helloModa</span>
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="/what-to-wear"
            className="hidden text-[13.5px] text-muted transition-colors hover:text-ink sm:block"
          >
            Occasion guides
          </Link>
          <Link
            href="/login"
            className="text-[13.5px] text-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-bubble bg-accent px-5 py-2 text-[13px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep"
          >
            Request an invite
          </Link>
        </div>
      </div>
    </header>
  );
}

// The hero's product visual: a real turn, layered — user bubble overlapping
// the look card, a mono annotation floating off the opposite corner. Built
// from the same tokens as the app so it reads as the product, not a render
// of it.
function HeroVisual() {
  const offset = useParallax(0.05);
  return (
    <div className="relative" style={{ transform: `translateY(${-offset}px)` }}>
      <div className="glass grain relative overflow-hidden rounded-xl3 p-6 shadow-lift sm:p-8">
        <div className="relative aspect-[3/2] overflow-hidden rounded-bubble shadow-soft">
          <EditorialPlate
            src="/occasions/rooftop-birthday-hero.jpg"
            palette="dusk"
            shapes={["top", "bottoms", "outerwear"]}
          />
        </div>
        <h3 className="mt-6 font-script text-[38px] leading-[0.9] text-ink sm:text-[46px]">
          Rooftop after dark
        </h3>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
          City rooftops at night are all silhouette and shadow, so we&apos;re keeping it graphic and
          easy: your tee worn loose over the faded black denim shorts, anchored by the black AF1s.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <span className="rounded-bubble border border-line px-4 py-1.5 text-[10px] font-medium uppercase tracking-label text-muted">
            Retry
          </span>
          <span className="flex items-center gap-1.5 rounded-bubble bg-accent px-4 py-1.5 text-[10px] font-medium uppercase tracking-label text-white">
            <Hanger size={11} />
            Find outfit
          </span>
        </div>
      </div>

      <div className="absolute -left-4 -top-6 max-w-[280px] rounded-bubble border border-accent-soft/50 bg-accent-tint px-5 py-3.5 shadow-panel backdrop-blur-md sm:-left-10">
        <p className="text-[13.5px] leading-relaxed text-ink">
          It&apos;s a friend&apos;s rooftop birthday party this weekend, evening in the city.
        </p>
      </div>

      <div className="absolute -bottom-5 -right-2 hidden items-center gap-2 rounded-full border border-line bg-paper/80 px-4 py-2 shadow-soft backdrop-blur-md sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="label text-muted">3 of 4 pieces already yours</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    // overflow-x-CLIP, not hidden: `hidden` turns this into a scroll
    // container, which silently breaks `position: sticky` for the
    // scrollytelling stage (the pinned panel just scrolls away and you get
    // 500vh of empty page). `clip` contains the hero's overhanging bubble
    // without creating a scroll box.
    <div
      className="min-h-screen w-full overflow-x-clip"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-28 pt-16 sm:pb-40 sm:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-24">
          <div>
            <p className="label text-accent-deep">Private beta — invite only</p>
            <p className="mt-6 font-script text-[44px] leading-none text-ink sm:text-[56px]">
              hello,
            </p>
            <h1 className="mt-1 font-display text-[52px] font-medium leading-[0.92] tracking-[-0.02em] text-ink sm:text-[76px] lg:text-[88px]">
              you already own
              <br />
              the outfit.
            </h1>
            <p className="mt-7 max-w-md text-[16.5px] leading-relaxed text-muted">
              helloModa is a conversational AI stylist. Tell it what&apos;s coming up — it styles a
              real look from the clothes already in your wardrobe, paints you a picture of it, and
              names the one piece worth buying.
            </p>
            <div className="mt-9">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-bubble bg-accent px-7 py-3.5 text-[15px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep"
              >
                Request an invite
                <ArrowRight size={16} />
              </Link>
              <p className="mt-4 text-[13.5px] text-muted">
                Already have one?{" "}
                <Link href="/login" className="text-accent-deep underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────────────── */}
      <section className="border-y border-line/70">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-6 sm:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} className="py-9 sm:py-11">
              <p className="font-display text-[34px] font-medium leading-none text-ink sm:text-[40px]">
                {f.value}
              </p>
              <p className="label mt-3 max-w-[180px] leading-[1.7] text-faint">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Positioning statement ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 py-32 sm:py-44">
        <Reveal>
          <p className="label text-accent-deep">The difference</p>
          <h2 className="mt-7 max-w-4xl font-display text-[34px] font-medium leading-[1.15] tracking-[-0.015em] text-ink sm:text-[54px]">
            Most styling apps are a shop with advice bolted on.{" "}
            <span className="text-faint">
              helloModa starts inside your wardrobe, and only goes shopping when it has to.
            </span>
          </h2>
        </Reveal>
      </section>

      {/* ── Scrollytelling stage ─────────────────────────────────────── */}
      <StickyStage />

      {/* ── Occasion breadth ─────────────────────────────────────────── */}
      <section className="py-32 sm:py-44">
        <Reveal className="mx-auto mb-14 max-w-[1400px] px-6">
          <p className="label text-accent-deep">Range</p>
          <h2 className="mt-5 max-w-2xl font-display text-[32px] font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[46px]">
            Twenty occasions, ready before you ask.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
            Weddings and interviews, yes — but also the rooftop birthday, the 90&apos;s throwback
            party, the pumpkin-patch date. Anything you&apos;d actually get dressed for.
          </p>
        </Reveal>
        <OccasionMarquee />
      </section>

      {/* ── Craft details ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-32 sm:pb-44">
        <Reveal className="mb-14">
          <p className="label text-accent-deep">Details</p>
          <h2 className="mt-5 max-w-2xl font-display text-[32px] font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[46px]">
            The small decisions, on purpose.
          </h2>
        </Reveal>
        <DetailHighlights />
      </section>

      {/* ── Interactive demo ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 pb-32 sm:pb-44">
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,340px)_1fr] lg:gap-20">
          <Reveal>
            <p className="label text-accent-deep">Try it</p>
            <h2 className="mt-5 font-display text-[32px] font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[42px]">
              Have a go, no account needed.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
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
      <section className="mx-auto max-w-[1400px] px-6 pb-32 sm:pb-44">
        <Reveal className="glass grain relative overflow-hidden rounded-xl3 px-8 py-20 sm:px-20 sm:py-28">
          <div className="max-w-xl">
            <p className="label text-accent-deep">Invite only, for now</p>
            <h2 className="mt-6 font-script text-[52px] leading-[0.9] text-ink sm:text-[72px]">
              come get dressed
            </h2>
            <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-muted">
              helloModa is in private beta while the styling gets sharper. Request an invite and
              we&apos;ll open a seat.
            </p>
            <Link
              href="/register"
              className="mt-9 inline-flex items-center gap-2 rounded-bubble bg-accent px-7 py-3.5 text-[15px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep"
            >
              Request an invite
              <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white">
              <Sparkle size={13} />
            </span>
            <span className="text-[13.5px] text-muted">
              helloModa — a conversational AI stylist. Part of helloCorp.
            </span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/what-to-wear" className="text-[13px] text-muted hover:text-ink">
              Occasion guides
            </Link>
            <Link href="/login" className="text-[13px] text-muted hover:text-ink">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
