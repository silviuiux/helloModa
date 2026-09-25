import Link from "next/link";
import { DESIGN_ROUTES } from "@/lib/designRoutes";

// A small floating pill on the comparison routes only: jump between the
// three designs and the current main app without retyping URLs. Plain
// links, so each route loads fresh from the same server data.
export default function DesignSwitcher({ current }) {
  const items = [{ slug: "", name: "Main" }, ...DESIGN_ROUTES];
  return (
    <nav
      aria-label="Compare designs"
      className="fixed left-1/2 top-3 z-[60] hidden -translate-x-1/2 items-center gap-1 rounded-full bg-[#1e1a2e]/85 p-1 text-[12px] font-medium shadow-lg ring-1 ring-white/10 backdrop-blur-md md:flex"
    >
      {items.map((d) => {
        const active = d.slug === current;
        return (
          <Link
            key={d.slug || "main"}
            href={`/${d.slug}`}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active ? "bg-white text-[#1e1a2e]" : "text-white/70 hover:text-white"
            }`}
          >
            {d.slug ? `${d.slug.slice(-2)} · ${d.name}` : d.name}
          </Link>
        );
      })}
    </nav>
  );
}
