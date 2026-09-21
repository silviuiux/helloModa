"use client";

import { useState } from "react";
import Link from "next/link";
import { Home } from "../Icons.jsx";
import { addWardrobeItem } from "../../actions/wardrobe.js";
import { cardToWardrobeItem } from "../../lib/look.js";
import OutfitHistoryRow from "./OutfitHistoryRow.jsx";

export default function OutfitHistoryList({ rows }) {
  // Session-only "saved" feedback for the heart button — mirrors the same
  // simplification AppShell.jsx's chat view already has (see
  // ChatView.jsx's savedIds), not a durable per-card marker. This page has
  // no shared wardrobe state to check against (it's a standalone route, not
  // part of AppShell), so a save here is a fire-and-forget add rather than
  // a toggle.
  const [savedIds, setSavedIds] = useState(new Set());

  async function handleSave(card) {
    if (savedIds.has(card.id)) return;
    setSavedIds((prev) => new Set(prev).add(card.id));
    try {
      const item = cardToWardrobeItem(card);
      await addWardrobeItem({
        name: item.name,
        brand: item.brand,
        category: item.category,
        color: item.color,
        tags: item.tags,
        imagePath: null,
      });
    } catch (err) {
      console.error("Failed to save piece to wardrobe:", err);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-16 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to helloModa"
          className="glass-circle grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink"
        >
          <Home size={17} />
        </Link>
        <h1 className="font-script text-[40px] leading-none text-ink sm:text-[52px]">
          hello—Outfits
        </h1>
      </div>

      {rows.length === 0 ? (
        <p className="text-[14px] text-muted">
          No outfits yet — start a conversation and your looks will show up here.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {rows.map((row) => (
            <OutfitHistoryRow key={row.id} row={row} onSavePiece={handleSave} savedIds={savedIds} />
          ))}
        </div>
      )}
    </div>
  );
}
