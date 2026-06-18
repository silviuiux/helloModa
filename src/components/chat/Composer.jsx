import { useState } from "react";
import { ArrowRight } from "../Icons.jsx";
import { composerPrompts } from "../../data/seed.js";

export default function Composer({ onSend }) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  }

  return (
    <div className="border-t border-line bg-canvas px-6 py-4 sm:px-8">
      <div className="mb-3 flex flex-wrap gap-2">
        {composerPrompts.map((p) => (
          <button
            key={p}
            onClick={() => onSend?.(p)}
            className="rounded-full border border-line bg-lav-50 px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:border-accent/40 hover:text-ink"
          >
            {p}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-3">
        <div className="flex flex-1 items-center rounded-full border border-line bg-paper px-5 shadow-soft focus-within:border-accent/50">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask for a look, refine a silhouette, or upload a closet item…"
            className="h-12 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
          />
        </div>
        <button
          type="submit"
          aria-label="Send"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-200 hover:scale-[1.04] active:scale-95"
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
