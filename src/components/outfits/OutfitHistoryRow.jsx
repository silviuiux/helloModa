"use client";

import { useState } from "react";
import GarmentArt from "../GarmentArt.jsx";
import RecommendationCards from "../chat/RecommendationCards.jsx";
import { ChevronDown } from "../Icons.jsx";

export default function OutfitHistoryRow({ row, onSavePiece, savedIds }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-10">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-6 text-left sm:items-center"
      >
        <div className="relative aspect-[3/2] w-40 shrink-0 overflow-hidden rounded-bubble sm:w-56">
          {row.coverImageUrl ? (
            <img src={row.coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <GarmentArt type="look" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-script text-[28px] leading-none text-ink sm:text-[34px]">
              {row.title}
            </h2>
            <ChevronDown
              size={16}
              className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            />
          </div>
          {row.narrative && (
            <p className="mt-2 line-clamp-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
              {row.narrative}
            </p>
          )}
        </div>
      </button>

      {open && row.pieces.length > 0 && (
        <div className="mt-8">
          <RecommendationCards cards={row.pieces} onToggleSave={onSavePiece} savedIds={savedIds} />
        </div>
      )}
    </div>
  );
}
