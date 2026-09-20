import Link from "next/link";
import { Sparkle } from "../Icons.jsx";

// Shared chrome for the public /what-to-wear pages — deliberately not
// AppShell (no bottom bar, no auth-only UI). Public marketing pages, cleared
// 2026-09-20, see docs/06-risks-legal.md.
export default function GuideLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <header className="mx-auto flex max-w-content items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white shadow-soft">
            <Sparkle size={15} />
          </span>
          <span className="font-display text-[18px] font-medium text-ink">helloModa</span>
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-accent px-4 py-2 text-[13.5px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.03]"
        >
          Try helloModa
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
