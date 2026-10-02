"use client";

import Link from "next/link";
import PaperPage, { META } from "../tete/PaperPage.jsx";

// Sign in / register in the main interface's style (2026-10-02): the same
// paper room, a serif headline, hairline fields instead of boxed inputs and
// the app's dark pill button. One quiet column, centred in the viewport.
export const FIELD =
  "block h-12 w-full border-0 border-b border-[#2b2633]/15 bg-transparent px-0 text-[16px] text-[#2b2633] placeholder:text-[#2b2633]/35 transition-colors focus:border-[#8f78e8] focus:outline-none focus:ring-0";
export const SUBMIT =
  "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2b2633] text-[14.5px] font-medium text-white transition-colors hover:bg-[#8f78e8] disabled:opacity-60";

export default function AuthLayout({ eyebrow, title, accent, intro, children, alt }) {
  return (
    <PaperPage right={alt}>
      <div className="mx-auto flex min-h-[100svh] max-w-[420px] flex-col justify-center px-6 pb-16 pt-28">
        <p className={`animate-fade-in ${META}`}>{eyebrow}</p>
        <h1 className="animate-fade-up mt-5 font-script text-[48px] leading-[1] sm:text-[60px]">
          {title}
          {accent && (
            <>
              <br />
              <span className="font-hand text-[#8f78e8]">{accent}</span>
            </>
          )}
        </h1>
        {intro && (
          <p className="animate-fade-up mt-5 text-[15px] leading-[1.7] text-[#2b2633]/60" style={{ animationDelay: "120ms" }}>
            {intro}
          </p>
        )}
        <div className="animate-fade-up mt-10" style={{ animationDelay: "220ms" }}>
          {children}
        </div>
      </div>
    </PaperPage>
  );
}

export function AltLink({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
    >
      {children}
    </Link>
  );
}
