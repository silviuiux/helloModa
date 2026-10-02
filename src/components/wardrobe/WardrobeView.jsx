import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Hanger } from "../Icons.jsx";
import WardrobeItemCard from "./WardrobeItemCard.jsx";
import AddItemModal from "./AddItemModal.jsx";
import ClosetStats from "./ClosetStats.jsx";
import { getStyledCounts } from "../../actions/wardrobe.js";
import { wardrobeCategories } from "../../data/seed.js";

export default function WardrobeView({ items, onAdd, onToggleFav, onRemove, onSetPrice, onLogWear }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [styledCounts, setStyledCounts] = useState({});

  // Lazy, one-shot: only needed for the "styled Nx" chip, not the core grid,
  // so it shouldn't hold up first paint or re-run on every filter change.
  useEffect(() => {
    const ids = items.map((it) => it.id);
    if (!ids.length) return;
    getStyledCounts(ids)
      .then(setStyledCounts)
      .catch((err) => console.error("Failed to load styled counts:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const itemsWithStats = useMemo(
    () => items.map((it) => ({ ...it, styledCount: styledCounts[it.id] || 0 })),
    [items, styledCounts]
  );

  const filtered = useMemo(() => {
    return itemsWithStats.filter((it) => {
      const inCat = category === "All" || it.category === category;
      const inFav = !favOnly || it.fav;
      const inQuery =
        !query ||
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        it.brand.toLowerCase().includes(query.toLowerCase());
      return inCat && inFav && inQuery;
    });
  }, [itemsWithStats, category, favOnly, query]);

  const countFor = (c) =>
    c === "All" ? items.length : items.filter((it) => it.category === c).length;

  const meta = "text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45";
  const favCount = items.filter((i) => i.fav).length;

  // Redesigned 2026-10-02 to match the main interface (src/components/tete/):
  // paper-white, serif type, hairlines instead of boxes, photos with soft
  // violet shadows and editorial captions underneath.
  return (
    <div className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fdfcfa] text-[#2b2633]">
      <div className="mx-auto w-full max-w-[1180px] px-6 pb-32 pt-8 sm:px-10 sm:pt-12">
        {/* Header */}
        <p className={meta}>Your wardrobe</p>
        <h1 className="mt-4 font-script text-[44px] leading-[1.02] sm:text-[60px]">
          {items.length} {items.length === 1 ? "piece" : "pieces"},{" "}
          <span className="font-hand text-[#8f78e8]">ready to style.</span>
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-[#2b2633]/60">
          Every look starts here. {favCount ? `${favCount} favourite${favCount === 1 ? "" : "s"} · ` : ""}
          add a photo and helloModa reads the rest.
        </p>

        <ClosetStats items={items} />

        {/* Controls */}
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-b border-[#2b2633]/10 pb-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {wardrobeCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`relative pb-1 text-[14px] transition-colors ${
                  category === c ? "text-[#2b2633]" : "text-[#2b2633]/45 hover:text-[#2b2633]"
                }`}
              >
                {c}
                <span className="ml-1 text-[11px] opacity-60">{countFor(c)}</span>
                {category === c && <span className="absolute inset-x-0 -bottom-[17px] h-px bg-[#8f78e8]" />}
              </button>
            ))}
            <button
              onClick={() => setFavOnly((v) => !v)}
              aria-pressed={favOnly}
              className={`pb-1 text-[14px] transition-colors ${favOnly ? "text-[#e46d92]" : "text-[#2b2633]/45 hover:text-[#2b2633]"}`}
            >
              ♥ Favourites
            </button>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 border-b border-[#2b2633]/15 pb-1 focus-within:border-[#8f78e8]">
              <Search size={15} className="text-[#2b2633]/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-32 bg-transparent text-[14px] placeholder:text-[#2b2633]/35 focus:outline-none sm:w-44"
              />
            </label>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2b2633] px-5 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-[#8f78e8]"
            >
              <Plus size={15} />
              Add a piece
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="grid place-items-center py-28 text-center">
            <Hanger size={32} className="text-[#2b2633]/30" />
            <p className="mt-4 font-script text-[22px] italic text-[#2b2633]/55">
              {items.length ? "Nothing matches that — try another filter." : "Your wardrobe is empty — for now."}
            </p>
            {!items.length && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 text-[14px] text-[#2b2633]/60 underline decoration-[#2b2633]/20 underline-offset-4 hover:text-[#2b2633] hover:decoration-[#8f78e8]"
              >
                Add your first piece
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 lg:grid-cols-4">
            <button
              onClick={() => setModalOpen(true)}
              className="group grid aspect-[4/5] place-items-center rounded-[18px] border border-dashed border-[#8f78e8]/35 bg-white/50 transition-colors hover:border-[#8f78e8] hover:bg-white/80"
            >
              <span className="text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-[#2b2633]/70 shadow-[0_10px_30px_-12px_rgba(90,70,160,0.35)] transition-transform group-hover:scale-105">
                  <Plus size={18} />
                </span>
                <span className="mt-3 block font-hand text-[24px] text-[#8f78e8]">Add a piece</span>
              </span>
            </button>

            {filtered.map((it) => (
              <WardrobeItemCard
                key={it.id}
                item={it}
                onToggleFav={onToggleFav}
                onRemove={onRemove}
                onSetPrice={onSetPrice}
                onLogWear={onLogWear}
              />
            ))}
          </div>
        )}
      </div>

      <AddItemModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={onAdd} />
    </div>
  );
}
