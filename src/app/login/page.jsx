"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Orb from "@/components/Orb.jsx";
import SocialButtons from "@/components/auth/SocialButtons.jsx";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setStatus("error");
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="grid min-h-screen place-items-center p-6"
    >
      <div className="glass w-full max-w-sm rounded-xl3 p-7">
        <div className="text-center">
          <div className="mx-auto grid w-fit place-items-center py-2">
            <Orb size={48} />
          </div>
          <h1 className="mt-5 font-display text-[24px] font-semibold tracking-[-0.03em] text-ink">helloModa</h1>
          <p className="mt-1.5 text-[13.5px] text-muted">Private beta — sign in to continue.</p>
        </div>

        <div className="mt-6">
          <SocialButtons />

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <input
              required
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 w-full rounded-xl2 border border-line bg-white/60 px-4 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="h-11 w-full rounded-xl2 border border-line bg-white/60 px-4 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-11 w-full rounded-xl2 bg-accent text-[14px] font-medium text-canvas shadow-soft transition-all hover:bg-accent-deep disabled:opacity-60"
            >
              {status === "loading" ? "Signing in…" : "Sign in"}
            </button>
            {status === "error" && <p className="text-[13px] text-red-500">{error}</p>}
          </form>

          <p className="mt-5 text-center text-[13px] text-muted">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-accent-deep hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
