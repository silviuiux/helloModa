import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Refreshes the Supabase auth session on every request and gates access to the
// app behind a signed-in user — helloModa is invite-only/private-beta for now
// (see docs/06-risks-legal.md). Public sign-up stays disabled in the Supabase
// Auth dashboard; users are invited manually until Phase 5. The `/what-to-wear`
// SEO guides plus robots.txt/sitemap.xml are the one deliberate exception —
// public marketing pages, cleared 2026-09-20 (docs/06-risks-legal.md), not an
// oversight.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without these, @supabase/ssr throws inside middleware, which Vercel surfaces
  // as an opaque MIDDLEWARE_INVOCATION_FAILED 500 on every route. Fail loudly and
  // specifically instead — this almost always means the env vars aren't set on
  // the deployment (see .env.local.example / README).
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      "helloModa is misconfigured: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "are not set for this deployment. Add them in Vercel > Settings > Environment Variables " +
        "(see .env.local.example in the repo) and redeploy.",
      { status: 500, headers: { "content-type": "text/plain" } }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/auth");
  const isPublicMarketingRoute =
    path.startsWith("/what-to-wear") || path === "/robots.txt" || path === "/sitemap.xml";

  if (!user && !isAuthRoute && !isPublicMarketingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/login") || path.startsWith("/register"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
