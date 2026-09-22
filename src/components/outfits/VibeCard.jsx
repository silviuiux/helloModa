"use client";

import Link from "next/link";
import GarmentArt from "../GarmentArt.jsx";
import { Hanger } from "../Icons.jsx";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

// One entry in the Style Journal grid — a big editorial tile (same scale as
// EmptyState.jsx's occasion cards, so it takes the large-surface
// rounded-bubble token, not the small-element rounded-bubble-sm).
// The whole card is one link back into the conversation (/?conversation=<id>,
// ConversationFromQuery.jsx) where the full turn — including the per-piece
// save/heart actions RecommendationCards already has — is still there; this
// card doesn't duplicate that interaction, just gets you back to it.
export default function VibeCard({ row }) {
  return (
    <Link
      href={`/?conversation=${row.id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-bubble shadow-soft transition-transform hover:-translate-y-1"
    >
      {row.coverImageUrl ? (
        <img
          src={row.coverImageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <GarmentArt type="look" />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, rgba(15,14,12,0.85), transparent)" }}
      />
      {row.pieces.length > 0 && (
        <span className="label absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-ink/90 backdrop-blur-sm">
          <Hanger size={11} />
          {row.pieces.length}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {row.createdAt && (
          <p className="label text-ink/70">{DATE_FORMAT.format(new Date(row.createdAt))}</p>
        )}
        <h3 className="mt-1 font-script text-[26px] leading-none text-ink sm:text-[30px]">
          {row.title}
        </h3>
      </div>
    </Link>
  );
}
