"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthLayout, { AltLink, FIELD, SUBMIT } from "@/components/auth/AuthLayout.jsx";
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
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back."
      accent="Where to next?"
      alt={<AltLink href="/register">Join the beta</AltLink>}
    >
      <SocialButtons />
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          required
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className={FIELD}
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className={FIELD}
        />
        <button type="submit" disabled={status === "loading"} className={SUBMIT}>
          {status === "loading" ? "Signing in…" : "Sign in"} <span aria-hidden="true">→</span>
        </button>
        {status === "error" && <p className="pt-2 text-[13px] text-[#c2577a]">{error}</p>}
      </form>
      <p className="mt-8 text-[13.5px] text-[#2b2633]/55">
        Have an invite code?{" "}
        <Link href="/register" className="text-[#2b2633] underline decoration-[#2b2633]/20 underline-offset-4 hover:decoration-[#8f78e8]">
          Create your account
        </Link>
      </p>
    </AuthLayout>
  );
}
