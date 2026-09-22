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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5 sm:px-8">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.03em] leading-tight text-ink">
            Wardrobe
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {items.length} pieces · {items.filter((i) => i.fav).length} favorites · the
            closet helloModa styles from
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="glass-soft flex h-11 items-center gap-2 rounded-full px-4">
            <Search size={16} className="text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your wardrobe…"
              className="w-36 bg-transparent text-[14px] text-ink placeholder:text-faint focus:outline-none sm:w-48"
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-11 items-center gap-1.5 rounded-[12px] bg-accent px-4 text-[14px] font-semibold text-canvas transition-colors hover:bg-accent-deep"
          >
            <Plus size={17} />
            Add item
          </button>
        </div>
      </header>

      <ClosetStats items={items} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-6 py-3.5 sm:px-8">
        {wardrobeCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
              category === c
                ? "bg-accent text-canvas shadow-soft"
                : "glass-soft text-muted hover:text-accent-deep"
            }`}
          >
            {c}
            <span className="ml-1.5 opacity-60">{countFor(c)}</span>
          </button>
        ))}
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`ml-auto rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
            favOnly
              ? "bg-accent text-canvas shadow-soft"
              : "glass-soft text-muted hover:text-accent-deep"
          }`}
        >
          Favorites only
        </button>
      </div>

      {/* Grid */}
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {filtered.length === 0 ? (
          <div className="grid place-items-center py-24 text-center text-muted">
            <Hanger size={36} />
            <p className="mt-3 text-[15px]">Your wardrobe is empty — for now. Add a few pieces and every look starts with them.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 text-[14px] font-medium text-accent-deep hover:underline"
            >
              Add your first piece
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {/* Upload tile */}
            <button
              onClick={() => setModalOpen(true)}
              className="group grid aspect-[3/4] place-items-center rounded-xl2 border border-dashed border-accent-soft bg-white/60 text-muted backdrop-blur-md transition-colors hover:border-accent hover:bg-white/70 hover:text-accent-deep"
            >
              <span className="text-center">
                <span className="glass-circle mx-auto grid h-12 w-12 place-items-center rounded-full transition-transform group-hover:scale-105">
                  <Plus size={22} />
                </span>
                <span className="mt-2.5 block text-[13px] font-medium">Add piece</span>
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
