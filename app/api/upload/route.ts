import { type NextRequest, NextResponse } from "next/server";
import { getUploadPresignedUrl } from "@/shared/api/storage";
import { auth } from "@/shared/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await request.json();
  const ext = filename.split(".").pop();
  const key = `uploads/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const presignedUrl = await getUploadPresignedUrl(key, contentType);

  return NextResponse.json({
    presignedUrl,
    key,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  });
}
