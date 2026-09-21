"use client";

import { useState } from "react";
import Link from "next/link";
import GarmentArt from "../GarmentArt.jsx";
import RecommendationCards from "../chat/RecommendationCards.jsx";
import { ChevronDown } from "../Icons.jsx";

// Clicking the cover/title area continues the conversation (navigates to
// /?conversation=<id>, picked up by ConversationFromQuery.jsx in AppShell);
// the chevron is a separate control that only expands the pieces preview
// in place, so browsing past looks doesn't require leaving this page.
// Direct request 2026-09-21.
export default function OutfitHistoryRow({ row, onSavePiece, savedIds }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-10">
      <div className="flex w-full items-start gap-6 sm:items-center">
        <Link
          href={`/?conversation=${row.id}`}
          className="flex min-w-0 flex-1 items-start gap-6 sm:items-center"
        >
          <div className="relative aspect-[3/2] w-40 shrink-0 overflow-hidden rounded-bubble sm:w-56">
            {row.coverImageUrl ? (
              <img src={row.coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <GarmentArt type="look" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-script text-[28px] leading-none text-ink sm:text-[34px]">
              {row.title}
            </h2>
            {row.narrative && (
              <p className="mt-2 line-clamp-2 max-w-xl text-[13.5px] leading-relaxed text-muted">
                {row.narrative}
              </p>
            )}
          </div>
        </Link>
        {row.pieces.length > 0 && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide pieces" : "Show pieces"}
            className="grid h-9 w-9 shrink-0 place-items-center self-start rounded-full text-muted transition-colors hover:bg-white/60 hover:text-ink sm:self-center"
          >
            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {open && row.pieces.length > 0 && (
        <div className="mt-8">
          <RecommendationCards cards={row.pieces} onToggleSave={onSavePiece} savedIds={savedIds} />
        </div>
      )}
    </div>
  );
}
