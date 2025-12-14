import { NextResponse } from "next/server";
import { getUploadPresignedUrl } from "@/shared/api/storage";
import { getSession } from "@/shared/lib/auth-server";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await request.json();
  const ext = filename.split(".").pop();
  const key = `uploads/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  const presignedUrl = await getUploadPresignedUrl(key, contentType);

  // 비공개 버킷: /api/files/[key]로 접근 (presigned URL 리다이렉트)
  // 공개 버킷: R2_PUBLIC_URL 직접 사용
  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `/api/files/${key}`;

  return NextResponse.json({
    presignedUrl,
    key,
    publicUrl,
  });
}
