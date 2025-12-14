import { type NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/profile", "/settings", "/account"];
const authPaths = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Neon Auth session cookie
  const sessionCookie = request.cookies.get("neon_auth_session");
  const hasSession = !!sessionCookie?.value;

  // Redirect logged-in users away from auth pages
  if (hasSession && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect non-logged-in users to sign-in page
  if (!hasSession && protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
