import Link from "next/link";
import PaperPage from "../tete/PaperPage.jsx";

// Shared chrome for the public /what-to-wear pages — deliberately not
// AppShell (no auth-only UI). Public marketing pages, cleared 2026-09-20,
// see docs/06-risks-legal.md. Since 2026-10-02 in the main interface's
// style (PaperPage: paper-white, colour washes, serif + hand type).
export default function GuideLayout({ children }) {
  return (
    <PaperPage
      right={
        <Link
          href="/register"
          className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
        >
          Join the beta
        </Link>
      }
    >
      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">{children}</div>
      <footer className="border-t border-[#2b2633]/10">
        <p className="mx-auto max-w-[1100px] px-6 py-8 text-[13px] text-[#2b2633]/50 sm:px-10">
          helloModa — the AI stylist that starts in your wardrobe.{" "}
          <Link href="/what-to-wear" className="text-[#2b2633] underline decoration-[#2b2633]/20 underline-offset-4 hover:decoration-[#8f78e8]">
            More occasion guides
          </Link>
        </p>
      </footer>
    </PaperPage>
  );
}
