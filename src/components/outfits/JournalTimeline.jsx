"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PaperPage, { META } from "../tete/PaperPage.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import { Heart } from "../Icons.jsx";
import { setLookDate, setLookKept } from "@/actions/conversations";

// The style journal as a timeline (direct request 2026-10-02). Every look
// worth remembering (src/actions/conversations.js listJournalLooks) on one
// line through time:
//   - give a look a date: on or after today it's *booked* for that day,
//     before today it's *worn* — so a booked look quietly becomes worn
//     once its day has passed;
//   - "Coming up" sits at the top (soonest first), then a Today marker,
//     then the past (newest first) — worn looks on the day they were worn,
//     undated ones on the day they were styled.
// Dates are plain calendar days (YYYY-MM-DD), compared in the viewer's
// local time, so the timeline renders after mount to avoid a server/client
// "today" mismatch.

const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const LONG = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });

function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "booked", label: "Coming up" },
  { id: "worn", label: "Worn" },
  { id: "kept", label: "Kept" },
];

function DateControl({ look, today, onDate }) {
  const inputRef = useRef(null);
  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
      el.click();
    }
  }
  const link = "text-[12.5px] text-[#2b2633]/55 underline decoration-[#2b2633]/15 underline-offset-4 transition-colors hover:text-[#2b2633] hover:decoration-[#8f78e8]";
  return (
    <span className="relative flex flex-wrap items-center gap-x-4 gap-y-2">
      <input
        ref={inputRef}
        type="date"
        aria-label={`Date for ${look.title}`}
        value={look.eventDate || ""}
        onChange={(e) => onDate(e.target.value || null)}
        className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
      />
      <button onClick={openPicker} className={link}>
        {look.eventDate ? "Change the date" : "Book it for a day"}
      </button>
      {!look.eventDate && (
        <button onClick={() => onDate(today)} className={link}>
          Wore it today
        </button>
      )}
      {look.eventDate && (
        <button onClick={() => onDate(null)} className={link}>
          Clear
        </button>
      )}
    </span>
  );
}

function Entry({ look, today, home, onDate, onKeep }) {
  const status = look.eventDate
    ? look.eventDate >= today
      ? { tone: "booked", text: look.eventDate === today ? "Booked for today" : `Booked for ${LONG.format(fromISO(look.eventDate))}` }
      : { tone: "worn", text: `Worn on ${LONG.format(fromISO(look.eventDate))}` }
    : { tone: "styled", text: `Styled on ${LONG.format(new Date(look.createdAt))}` };

  return (
    <article className="animate-fade-up relative grid grid-cols-[88px_1fr] gap-5 sm:grid-cols-[150px_1fr] sm:gap-8">
      <Link
        href={`${home}?conversation=${look.conversationId}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-[16px] bg-[#f3eff8] shadow-[0_30px_60px_-36px_rgba(90,70,160,0.45),0_0_0_1px_rgba(43,38,51,0.04)]"
        aria-label={`Open ${look.title}`}
      >
        <PlaceholderImage
          src={look.coverImageUrl || undefined}
          seed={look.id}
          width={300}
          height={375}
          className="transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {look.kept && (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/85 text-[#e46d92]">
            <Heart size={11} fill="currentColor" />
          </span>
        )}
      </Link>
      <div className="min-w-0 self-center">
        <p
          className={`text-[10.5px] font-medium uppercase tracking-[0.2em] ${
            status.tone === "booked" ? "text-[#8f78e8]" : status.tone === "worn" ? "text-[#c2577a]/80" : "text-[#2b2633]/40"
          }`}
        >
          {status.text}
        </p>
        <h3 className="mt-2 font-script text-[26px] leading-[1.1] sm:text-[32px]">{look.title}</h3>
        {look.conversationTitle && (
          <p className="mt-1.5 truncate font-script text-[16px] italic text-[#2b2633]/45">
            “{look.conversationTitle.replace(/\.{3}$/, "…")}”
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <DateControl look={look} today={today} onDate={onDate} />
          <button
            onClick={() => onKeep(!look.kept)}
            aria-pressed={look.kept}
            className={`flex items-center gap-1.5 text-[12.5px] transition-colors ${
              look.kept ? "text-[#e46d92]" : "text-[#2b2633]/45 hover:text-[#2b2633]"
            }`}
          >
            <Heart size={12} fill={look.kept ? "currentColor" : "none"} />
            {look.kept ? "Kept" : "Keep"}
          </button>
          <Link
            href={`${home}?conversation=${look.conversationId}`}
            className="text-[12.5px] text-[#2b2633]/45 transition-colors hover:text-[#8f78e8]"
          >
            Open →
          </Link>
        </div>
      </div>
    </article>
  );
}

function Marker({ children, accent = false }) {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <span
        className={`relative z-10 block h-2.5 w-2.5 rounded-full ${
          accent ? "bg-[#8f78e8] shadow-[0_0_14px_4px_rgba(185,164,255,0.55)]" : "bg-[#2b2633]/15"
        }`}
      />
      <span className={accent ? `${META} !text-[#8f78e8]` : META}>{children}</span>
    </div>
  );
}

export default function JournalTimeline({ looks: initial, home = "/" }) {
  const [looks, setLooks] = useState(initial);
  const [today, setToday] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => setToday(localISO(new Date())), []);

  function patch(id, change) {
    setLooks((prev) => prev.map((l) => (l.id === id ? { ...l, ...change } : l)));
  }
  async function onDate(look, date) {
    const before = look.eventDate;
    patch(look.id, { eventDate: date });
    try {
      await setLookDate(look.id, date);
    } catch (err) {
      console.error("Failed to set look date:", err);
      patch(look.id, { eventDate: before });
    }
  }
  async function onKeep(look, kept) {
    patch(look.id, { kept });
    try {
      await setLookKept(look.id, kept);
    } catch (err) {
      console.error("Failed to keep look:", err);
      patch(look.id, { kept: !kept });
    }
  }

  const { upcoming, past } = useMemo(() => {
    if (!today) return { upcoming: [], past: [] };
    const visible = looks.filter((l) => {
      if (filter === "booked") return l.eventDate && l.eventDate >= today;
      if (filter === "worn") return l.eventDate && l.eventDate < today;
      if (filter === "kept") return l.kept;
      return true;
    });
    const up = visible
      .filter((l) => l.eventDate && l.eventDate >= today)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    const key = (l) => l.eventDate || localISO(new Date(l.createdAt));
    const rest = visible
      .filter((l) => !(l.eventDate && l.eventDate >= today))
      .sort((a, b) => key(b).localeCompare(key(a)) || b.createdAt.localeCompare(a.createdAt));
    return { upcoming: up, past: rest };
  }, [looks, today, filter]);

  // Group the past by month so the line has landmarks.
  const pastGroups = useMemo(() => {
    const out = [];
    for (const l of past) {
      const d = l.eventDate ? fromISO(l.eventDate) : new Date(l.createdAt);
      const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
      if (!out.length || out[out.length - 1].label !== label) out.push({ label, looks: [] });
      out[out.length - 1].looks.push(l);
    }
    return out;
  }, [past]);

  const backLink = (
    <Link
      href={home}
      className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
    >
      Back to styling
    </Link>
  );

  return (
    <PaperPage home={home} right={backLink} center={today && <span className={META}>{LONG.format(fromISO(today))}</span>}>
      <div className="mx-auto max-w-[760px] px-6 pb-40 pt-32 sm:pt-40">
        <p className={META}>Your style journal</p>
        <h1 className="mt-5 font-script text-[48px] leading-[1] sm:text-[68px]">
          Every look, <span className="font-hand text-[#8f78e8]">on its day.</span>
        </h1>
        <p className="mt-6 max-w-lg text-[15.5px] leading-[1.7] text-[#2b2633]/60">
          Give a look a date to book it for an occasion. Once the day has passed, it’s marked as
          worn — so the journal fills itself in.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-[13px] transition-colors ${
                filter === f.id ? "bg-[#2b2633] text-white" : "bg-white/60 text-[#2b2633]/60 ring-1 ring-[#2b2633]/10 hover:text-[#2b2633]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {initial.length === 0 ? (
          <p className="mt-16 font-script text-[22px] italic text-[#2b2633]/50">
            No looks yet. Tell helloModa where you’re going — your first one lands here.
          </p>
        ) : !today ? null : upcoming.length + past.length === 0 ? (
          <p className="mt-16 font-script text-[20px] italic text-[#2b2633]/45">Nothing here yet.</p>
        ) : (
          <div className="relative mt-14">
            {/* The line through time */}
            <span aria-hidden="true" className="absolute bottom-0 left-[4.5px] top-2 w-px bg-gradient-to-b from-[#8f78e8]/40 via-[#2b2633]/10 to-transparent" />

            {upcoming.length > 0 && (
              <section className="pb-6">
                <Marker accent>Coming up</Marker>
                <div className="mt-6 space-y-12 pl-8 sm:pl-10">
                  {upcoming.map((l) => (
                    <Entry key={l.id} look={l} today={today} home={home} onDate={(d) => onDate(l, d)} onKeep={(k) => onKeep(l, k)} />
                  ))}
                </div>
              </section>
            )}

            <div className="py-6">
              <Marker accent>Today · {DAY.format(fromISO(today))}</Marker>
            </div>

            {pastGroups.map((g) => (
              <section key={g.label} className="pb-8">
                <Marker>{g.label}</Marker>
                <div className="mt-6 space-y-12 pl-8 sm:pl-10">
                  {g.looks.map((l) => (
                    <Entry key={l.id} look={l} today={today} home={home} onDate={(d) => onDate(l, d)} onKeep={(k) => onKeep(l, k)} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PaperPage>
  );
}
