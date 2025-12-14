import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { files } from "@/entities/file";
import { db } from "@/shared/api/db";
import { getSession } from "@/shared/lib/auth-server";

// 파일 목록 조회
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userFiles = await db
    .select()
    .from(files)
    .where(eq(files.userId, session.user.id))
    .orderBy(files.createdAt);

  // 최신순 정렬
  const sortedFiles = userFiles.reverse();

  return NextResponse.json(sortedFiles);
}

// 파일 메타데이터 저장
export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, key, type, size } = await request.json();

  const [file] = await db
    .insert(files)
    .values({
      id,
      userId: session.user.id,
      name,
      key,
      type,
      size,
    })
    .returning();

  return NextResponse.json(file);
}
