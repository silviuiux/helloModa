"use client";

import Link from "next/link";
import { Sparkle, Hanger, History, Bookmark, ArrowRight } from "@/components/Icons.jsx";
import GarmentArt from "@/components/GarmentArt.jsx";
import Reveal from "@/components/landing/Reveal.jsx";
import LandingChatDemo from "@/components/landing/LandingChatDemo.jsx";

const STEPS = [
  {
    type: "top",
    title: "Describe the occasion",
    body: "A wedding, a big interview, a rooftop party at 9pm — tell helloModa what's coming up and what mood you're going for.",
  },
  {
    type: "dress",
    title: "Styled from your closet first",
    body: "helloModa reaches for what you already own before suggesting anything new — \"Shop Your Closet\" is the whole point, not an afterthought.",
  },
  {
    type: "look",
    title: "See it, then fill the gaps",
    body: "A real generated visualization of the outfit in its setting, plus exactly what's missing — no vague suggestions, no fabricated prices.",
  },
];

const FEATURES = [
  {
    icon: Hanger,
    title: "Your closet, actually used",
    body: "Every recommendation checks your real wardrobe first. CLIP-embedded similarity search means it's matching on how a piece actually looks, not just a category label.",
  },
  {
    icon: Sparkle,
    title: "Real generated visualization",
    body: "Not a mood board — an actual image of the outfit in its setting, generated per turn, cached so revisiting a conversation never regenerates.",
  },
  {
    icon: Bookmark,
    title: "20+ real-life occasions",
    body: "From wedding guest to a 90's throwback party — broad enough for actual life, not just one launch niche.",
  },
  {
    icon: History,
    title: "Every outfit, revisitable",
    body: "Past conversations live in your outfit history — cover image, pieces, and the ability to pick the thread back up, not a dead archive.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-6 sm:px-6">
        <span className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white shadow-soft">
            <Sparkle size={15} />
          </span>
          <span className="font-display text-[18px] font-medium text-ink">helloModa</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-[13.5px] font-medium text-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-accent px-4 py-2 text-[13.5px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.03]"
          >
            Request access
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-content px-4 pb-20 pt-[12vh] text-center sm:px-6 sm:pb-28">
        <p className="text-[13.5px] font-medium uppercase tracking-label text-accent-deep">
          Invite-only private beta
        </p>
        <h1 className="mt-4 font-script text-[56px] leading-[0.95] text-ink sm:text-[84px]">
          hello, let's get you dressed
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-muted">
          Describe an occasion and helloModa styles a real look from your closet — then shows you,
          with a real generated image, exactly what to add.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.03]"
          >
            Request access
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="rounded-full px-6 py-3 text-[14px] font-medium text-ink transition-colors hover:text-accent-deep"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <h2 className="font-script text-[36px] leading-none text-ink sm:text-[44px]">how it works</h2>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 120}>
              <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-bubble shadow-soft">
                <GarmentArt type={step.type} />
              </div>
              <h3 className="mt-5 text-[17px] font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Live demo, inside a browser-frame mockup */}
      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <Reveal className="text-center">
          <h2 className="font-script text-[36px] leading-none text-ink sm:text-[44px]">see it in action</h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-muted">
            This is a real turn from the app, replayed here — no account needed to try it.
          </p>
        </Reveal>
        <Reveal delay={150} className="mx-auto mt-10 max-w-3xl">
          <div className="glass overflow-hidden rounded-xl3 shadow-lift">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </div>
            <div className="p-4 sm:p-6">
              <LandingChatDemo />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100} className="glass-soft flex items-start gap-4 rounded-xl3 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-tint text-accent-deep">
                <f.icon size={18} />
              </span>
              <div>
                <h3 className="text-[16px] font-medium text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-content px-4 py-20 sm:px-6">
        <Reveal className="glass rounded-xl3 px-6 py-14 text-center sm:px-14">
          <h2 className="font-script text-[40px] leading-none text-ink sm:text-[52px]">
            ready when you are
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            Private beta, invite-only for now — request access and we'll get you in.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.03]"
          >
            Request access
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </section>

      <footer className="mx-auto max-w-content px-4 pb-10 pt-6 text-[12.5px] text-faint sm:px-6">
        <p>
          helloModa — a conversational AI stylist.{" "}
          <Link href="/what-to-wear" className="text-accent-deep hover:underline">
            Browse occasion guides
          </Link>
        </p>
      </footer>
    </div>
  );
}
