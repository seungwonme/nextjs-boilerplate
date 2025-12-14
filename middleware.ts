import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/profile", "/settings"];
const authPaths = ["/sign-in", "/sign-up"];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  if (sessionCookie && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect non-logged-in users to sign-in page
  if (
    !sessionCookie &&
    protectedPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
