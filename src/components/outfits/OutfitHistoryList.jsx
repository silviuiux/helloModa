"use client";

import Link from "next/link";
import { Home } from "../Icons.jsx";
import Reveal from "../Reveal.jsx";
import VibeCard from "./VibeCard.jsx";

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

// Groups rows into "September 2026" / "August 2026" / ... buckets, newest
// first — rows arrive already sorted newest-first from listOutfitHistory(),
// so this only needs to notice when the month changes, not re-sort.
function groupByMonth(rows) {
  const groups = [];
  let current = null;
  for (const row of rows) {
    const key = row.createdAt ? MONTH_FORMAT.format(new Date(row.createdAt)) : "Undated";
    if (!current || current.key !== key) {
      current = { key, rows: [] };
      groups.push(current);
    }
    current.rows.push(row);
  }
  return groups;
}

export default function OutfitHistoryList({ rows }) {
  const groups = groupByMonth(rows);

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-4 flex items-center gap-3">
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
      <p className="mb-14 text-[14px] text-muted">
        Your style journal — every look, kept.
      </p>

      {rows.length === 0 ? (
        <p className="text-[14px] text-muted">
          No outfits yet — start a conversation and your looks will show up here.
        </p>
      ) : (
        <div className="space-y-14">
          {groups.map((group) => (
            <section key={group.key}>
              <p className="label mb-5 text-faint">{group.key}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                {group.rows.map((row, i) => (
                  <Reveal key={row.id} delay={(i % 6) * 60}>
                    <VibeCard row={row} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
