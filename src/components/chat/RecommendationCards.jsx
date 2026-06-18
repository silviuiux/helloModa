import { GarmentIcon } from "../../lib/iconMap.jsx";

export default function RecommendationCards({ cards = [] }) {
  if (!cards.length) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.id}
          className="group overflow-hidden rounded-xl2 border border-line bg-paper transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
        >
          {/* Swatch preview */}
          <div className="grid h-20 place-items-center bg-lav-100 text-ink/30">
            <GarmentIcon name={c.icon} size={26} />
          </div>
          <div className="p-3">
            <p className="label text-faint">{c.role}</p>
            <p className="mt-1 text-[13px] font-medium leading-tight text-ink">
              {c.name}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] text-muted">{c.price}</span>
              <span
                className={`label rounded-full px-2 py-0.5 text-[9px] ${
                  c.source === "closet"
                    ? "bg-accent-tint text-accent"
                    : "bg-lav-100 text-muted"
                }`}
              >
                {c.source === "closet" ? "Closet" : "Shop"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
