import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isBriefingArea = path.startsWith("/dashboard/briefings");
  const isBriefingSignIn = path.startsWith("/briefing-sign-in");

  if (isBriefingArea && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/briefing-sign-in";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isBriefingSignIn && user) {
    const nextPath = request.nextUrl.searchParams.get("next") || "/dashboard/briefings";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return response;
}
