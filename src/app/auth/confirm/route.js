import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the "Confirm signup" email link (?token_hash=...&type=signup).
// Distinct from /auth/callback, which handles the PKCE "code" flow — Supabase's
// default confirmation email template uses token_hash, not a code.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
