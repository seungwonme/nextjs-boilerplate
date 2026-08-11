import { getAuth } from "@/shared/lib/auth-server";

type AuthRouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: AuthRouteContext) {
  return getAuth().handler().GET(request, context);
}

export async function POST(request: Request, context: AuthRouteContext) {
  return getAuth().handler().POST(request, context);
}
