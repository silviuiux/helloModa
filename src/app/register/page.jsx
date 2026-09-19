"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkle } from "@/components/Icons.jsx";
import SocialButtons from "@/components/auth/SocialButtons.jsx";
import { registerWithInvite } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | confirm
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const result = await registerWithInvite({ email, password, inviteCode });

    if (result.error) {
      setStatus("error");
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      // Email confirmation is on — wait for the user to click the link.
      setStatus("confirm");
      return;
    }

    // Email confirmation is off — the action already set the session cookie.
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="grid min-h-screen place-items-center p-6"
      style={{
        background:
          "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <div className="glass w-full max-w-sm rounded-xl3 p-7">
        <div className="text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-soft">
            <Sparkle size={18} />
          </span>
          <h1 className="mt-4 font-display text-[24px] font-medium text-ink">helloModa</h1>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Invite-only private beta — create your account.
          </p>
        </div>

        <div className="mt-6">
          {status === "confirm" ? (
            <p className="text-center text-[14px] text-ink">
              Check <span className="font-medium">{email}</span> for a confirmation link, then
              sign in.
            </p>
          ) : (
            <>
              <SocialButtons />

              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <input
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Invite code"
                  autoComplete="off"
                  className="label h-11 w-full rounded-xl2 border border-dashed border-accent-soft bg-accent-tint/40 px-4 text-[13px] tracking-normal text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-xl2 border border-line bg-white/70 px-4 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)"
                  autoComplete="new-password"
                  minLength={8}
                  className="h-11 w-full rounded-xl2 border border-line bg-white/70 px-4 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-11 w-full rounded-xl2 bg-accent text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep disabled:opacity-60"
                >
                  {status === "loading" ? "Creating account…" : "Create account"}
                </button>
                {status === "error" && <p className="text-[13px] text-red-500">{error}</p>}
              </form>

              <p className="mt-5 text-center text-[13px] text-muted">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-accent-deep hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
