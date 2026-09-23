"use client";

import Orb from "../Orb.jsx";

// Design exploration (branch design/chat-editorial): a magazine nameplate
// in place of the app's usual large hero orb — "fashion magazine mixed
// with secondary AI elements." The orb still lives here, but small, like a
// printer's mark next to a masthead rather than the page's centrepiece.
export default function EditorialMasthead() {
  const issue = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <div className="mx-auto w-full max-w-content px-4 pt-10 sm:px-6">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <Orb size={26} mini />
          <span className="editorial-headline text-[28px] leading-none tracking-[-0.01em] text-ink">
            helloModa
          </span>
        </div>
        <span className="editorial-caption hidden text-right sm:block">
          N° 001 — Personal Styling Edition
          <br />
          {issue}
        </span>
      </div>
      <div className="editorial-rule editorial-rule--heavy mt-4" />
      <div className="editorial-rule mt-[3px]" />
    </div>
  );
}
