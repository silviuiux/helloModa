"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkle } from "@/components/Icons.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Invite-only: this venture is low-profile for now (docs/06-risks-legal.md).
        // Public sign-up is disabled in the Supabase Auth dashboard, so only
        // pre-invited emails will actually receive a usable magic link.
        shouldCreateUser: false,
      },
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div
      className="grid min-h-screen place-items-center p-6"
      style={{
        background:
          "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <div className="glass w-full max-w-sm rounded-xl3 p-7 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-soft">
          <Sparkle size={18} />
        </span>
        <h1 className="mt-4 font-display text-[24px] font-medium text-ink">helloModa</h1>
        <p className="mt-1.5 text-[13.5px] text-muted">
          Private beta — sign in with your invited email.
        </p>

        {status === "sent" ? (
          <p className="mt-6 text-[14px] text-ink">
            Check <span className="font-medium">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
            <input
              required
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl2 border border-line bg-white/70 px-4 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="h-11 w-full rounded-xl2 bg-accent text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p className="text-[13px] text-red-500">
                {error || "That email isn't invited yet — ping Silviu."}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
