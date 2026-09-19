import { useState } from "react";
import { ArrowRight } from "../Icons.jsx";

// Static suggestion chips live in EmptyState.jsx (first-time prompts) and
// per-turn quickReplies (AI-authored follow-ups, in MessageBubble.jsx) —
// see docs/09-conversation-design.md. Composer itself is just the input now.
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
    <div className="border-t border-white/40 px-4 py-4 sm:px-6">
      <form onSubmit={submit} className="mx-auto flex max-w-2xl items-center gap-3">
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
              disabled ? "helloModa is styling your look…" : "Describe an occasion…"
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
