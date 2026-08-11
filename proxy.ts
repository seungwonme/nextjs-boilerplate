import type { NextRequest } from "next/server";
import { updateSession } from "@/shared/api";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/protected/:path*"],
};
