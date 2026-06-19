import { useState } from "react";
import { ArrowRight } from "../Icons.jsx";
import { composerPrompts } from "../../data/seed.js";

export default function Composer({ onSend, disabled = false }) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    if (disabled) return;
    const text = value.trim();
    if (!text) return;
    onSend?.(text);
    setValue("");
  }

  return (
    <div className="border-t border-white/40 px-6 py-4 sm:px-8">
      <div className="mb-3 flex flex-wrap gap-2">
        {composerPrompts.map((p) => (
          <button
            key={p}
            onClick={() => !disabled && onSend?.(p)}
            disabled={disabled}
            className="glass-soft rounded-full px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:text-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-3">
        <div
          className={`glass flex flex-1 items-center rounded-full px-5 transition-opacity focus-within:border-accent/60 ${
            disabled ? "opacity-60" : ""
          }`}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={
              disabled
                ? "helloModa is styling your look…"
                : "Ask for a look, refine a silhouette, or upload a closet item…"
            }
            className="h-12 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          aria-label="Send"
          disabled={disabled}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white shadow-soft transition-all duration-200 hover:bg-accent-deep hover:scale-[1.04] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
