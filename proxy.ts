import type { NextRequest } from "next/server";
import { getAuth } from "@/shared/lib/auth-server";

export default function proxy(request: NextRequest) {
  return getAuth().middleware({ loginUrl: "/auth/sign-in" })(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/account/:path*",
  ],
};
