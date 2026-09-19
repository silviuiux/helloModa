"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Gates /register behind a shared invite code (docs/06-risks-legal.md —
// low-profile/private-beta posture). INVITE_CODE is a server-only env var
// (never NEXT_PUBLIC_*), so it's never shipped to the client bundle. This is
// a single shared secret, not a per-invite tracked code — fine for a solo
// private beta; revisit with a real invite_codes table if/when that matters.
export async function registerWithInvite({ email, password, inviteCode }) {
  const expected = process.env.INVITE_CODE;
  if (!expected) {
    return { error: "Registration is temporarily closed (no invite code configured)." };
  }
  if (!inviteCode || inviteCode.trim().toUpperCase() !== expected.trim().toUpperCase()) {
    return { error: "That invite code isn't valid." };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") || `https://${headersList.get("host")}`;

  const supabase = await createClient();
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/confirm` },
    });

    if (error) {
      // supabase-js surfaces a transport-level failure (e.g. a non-JSON error
      // page from an outage or a network/proxy block) as an AuthError whose
      // message is the raw parse failure, rather than throwing — catch that
      // case too so it never reaches the user as parser internals.
      const isTransportFailure = /is not valid JSON|Failed to fetch|network/i.test(
        error.message
      );
      return {
        error: isTransportFailure
          ? "Couldn't reach the server. Please try again in a moment."
          : error.message,
      };
    }

    return { needsConfirmation: !session };
  } catch (err) {
    // Network/transport failure talking to Supabase (vs. an auth error, which
    // signUp() returns rather than throws) — surface a clean message instead
    // of an unhandled exception reaching the client as a raw parse failure.
    console.error("registerWithInvite: signUp request failed:", err);
    return { error: "Couldn't reach the server. Please try again in a moment." };
  }
}
