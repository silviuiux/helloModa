import Link from "next/link";
import Orb from "../Orb.jsx";

// Shared chrome for the public /what-to-wear pages — deliberately not
// AppShell (no bottom bar, no auth-only UI). Public marketing pages, cleared
// 2026-09-20, see docs/06-risks-legal.md.
export default function GuideLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full"
    >
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Orb size={22} mini />
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink">helloModa</span>
        </Link>
        <Link
          href="/register"
          className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-semibold text-canvas transition-colors hover:bg-accent-deep"
        >
          Join the beta
        </Link>
      </header>

      <main className="mx-auto max-w-content px-4 pb-20 sm:px-6">{children}</main>

      <footer className="mx-auto max-w-content px-4 pb-10 pt-6 text-[12.5px] text-faint sm:px-6">
        <p>
          helloModa — a conversational AI stylist.{" "}
          <Link href="/what-to-wear" className="text-accent-deep hover:underline">
            More occasion guides
          </Link>
        </p>
      </footer>
    </div>
  );
}
