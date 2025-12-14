import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { files } from "@/entities/file";
import { db } from "@/shared/api/db";
import { deleteObject, getDownloadPresignedUrl } from "@/shared/api/storage";
import { getSession } from "@/shared/lib/auth-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const fileKey = key.join("/");

  // 본인 파일만 접근 가능하도록 체크
  if (!fileKey.startsWith(`uploads/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const presignedUrl = await getDownloadPresignedUrl(fileKey);

  // presigned URL로 리다이렉트
  return NextResponse.redirect(presignedUrl);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const fileKey = key.join("/");

  // 본인 파일만 삭제 가능하도록 체크
  if (!fileKey.startsWith(`uploads/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // R2에서 삭제
  await deleteObject(fileKey);

  // DB에서 삭제
  await db.delete(files).where(eq(files.key, fileKey));

  return NextResponse.json({ success: true });
}
