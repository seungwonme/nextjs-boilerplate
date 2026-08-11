import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server.js";
import { getSupabaseEnv } from "../../config/index.ts";
import { copyCookies } from "./response.ts";

function redirectWithCookies(
  request: NextRequest,
  pathname: string,
  source: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);

  copyCookies(source.cookies.getAll(), ({ name, value, ...options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

export async function updateSession(
  request: NextRequest,
  createClient: typeof createServerClient = createServerClient,
  resolveEnv: typeof getSupabaseEnv = getSupabaseEnv,
) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { publishableKey, url } = resolveEnv();

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Always use getUser() on server-side to validate the Auth token.
  // getSession() is not guaranteed to revalidate the token and should be avoided.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(request, "/auth/login", supabaseResponse);
  }

  return supabaseResponse;
}
