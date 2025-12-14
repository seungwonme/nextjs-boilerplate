import { NextResponse } from "next/server";
import { getSession } from "@/shared/lib/auth-server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
  });
}
