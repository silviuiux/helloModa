"use client";

import { useRef } from "react";
import Link from "next/link";
import PresenceLight from "./PresenceLight.jsx";

// Shared chrome for the pages around the app — style journal, sign in,
// register — so they sit in the same room as the main interface
// (src/components/tete/): paper-white, the slow colour washes, a whisper
// of grain, the wordmark top-left and a fade under the header.
export const META = "text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45";
export const INK = "#2b2633";

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 font-script text-[22px] italic text-[#2b2633]/85">
      <span className="tete-breathe block h-2 w-2 rounded-full bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.5)]" />
      helloModa
    </span>
  );
}

export default function PaperPage({ children, home = "/", center = null, right = null }) {
  const energyRef = useRef(0);
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[#fdfcfa] font-sans" style={{ color: INK }}>
      <PresenceLight energyRef={energyRef} thinking={false} />
      <div aria-hidden="true" className="tete-grain pointer-events-none fixed inset-0 z-[15]" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-[#fdfcfa] from-45% to-transparent"
      />
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-7">
        <Link href={home} aria-label="helloModa home">
          <Wordmark />
        </Link>
        {center && <div className="absolute left-1/2 top-[30px] hidden -translate-x-1/2 sm:block">{center}</div>}
        <div className="flex items-center gap-4">{right}</div>
      </header>
      <main className="relative z-10">{children}</main>
    </div>
  );
}
