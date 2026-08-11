import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { copyCookies } from "./response";
import type { Database } from "./types";

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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Always use getUser() on server-side to validate the Auth token.
  // getSession() is not guaranteed to revalidate the token and should be avoided.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ["/"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Redirect authenticated users away from auth pages (except /auth/confirm)
  if (
    user &&
    request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/auth/confirm")
  ) {
    return redirectWithCookies(request, "/", supabaseResponse);
  }

  // Redirect unauthenticated users to login page (except public routes and auth pages)
  if (
    !user &&
    !isPublicRoute &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    return redirectWithCookies(request, "/auth/login", supabaseResponse);
  }

  return supabaseResponse;
}
