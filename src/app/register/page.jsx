"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout, { AltLink, FIELD, SUBMIT } from "@/components/auth/AuthLayout.jsx";
import SocialButtons from "@/components/auth/SocialButtons.jsx";
import { registerWithInvite } from "@/actions/auth";
import { track } from "@/lib/analytics";

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
      track("sign_up_submitted", { needs_confirmation: true });
      setStatus("confirm");
      return;
    }

    // Email confirmation is off — the action already set the session cookie.
    track("sign_up_submitted", { needs_confirmation: false });
    router.push("/");
    router.refresh();
  }

  return (
    <AuthLayout
      eyebrow="Private beta"
      title="You're invited."
      accent="Come get dressed."
      intro="Create your account and get your first look in minutes — styled from your own wardrobe, painted on you."
      alt={<AltLink href="/login">Sign in</AltLink>}
    >
      {status === "confirm" ? (
        <p className="font-script text-[22px] italic leading-snug text-[#2b2633]/75">
          Check <span className="not-italic text-[#2b2633]">{email}</span> for a confirmation link, then sign in.
        </p>
      ) : (
        <>
          <SocialButtons />
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite code"
              autoComplete="off"
              className={`${FIELD} font-script !text-[20px] italic tracking-wide`}
            />
            <input
              required
              type="email"
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
              placeholder="Password (8+ characters)"
              autoComplete="new-password"
              minLength={8}
              className={FIELD}
            />
            <button type="submit" disabled={status === "loading"} className={SUBMIT}>
              {status === "loading" ? "Creating your account…" : "Create account"} <span aria-hidden="true">→</span>
            </button>
            {status === "error" && <p className="pt-2 text-[13px] text-[#c2577a]">{error}</p>}
          </form>
          <p className="mt-8 text-[13px] leading-relaxed text-[#2b2633]/45">
            No code? helloModa is invite-only for now — ask whoever sent you here.
          </p>
          <p className="mt-3 text-[13.5px] text-[#2b2633]/55">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2b2633] underline decoration-[#2b2633]/20 underline-offset-4 hover:decoration-[#8f78e8]">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
