export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { extractDriveFileId } from "@/lib/gdrive";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role: string }).role;
    const userId = session.user.id;

    // Creator sadece kendi videolarını görür, puan/yorum bilgisi olmadan
    if (role === "creator") {
      const result = db.all(sql`
        SELECT id, title, drive_file_id, source_url, uploader_name, sort_order, is_active, created_at
        FROM videos
        WHERE uploaded_by_id = ${userId} AND is_active = 1
        ORDER BY created_at DESC
      `);
      return NextResponse.json(result);
    }

    // admin + subadmin: tüm videolar + puan bilgisi
    const result = db.all(sql`
      SELECT
        v.*,
        ROUND(AVG(r.score), 2) as avg_rating,
        COUNT(r.id) as total_votes,
        (SELECT r2.score FROM ratings r2 WHERE r2.video_id = v.id AND r2.user_id = ${userId}) as user_rating,
        (SELECT c.text FROM comments c WHERE c.video_id = v.id AND c.user_id = ${userId}) as user_comment
      FROM videos v
      LEFT JOIN ratings r ON r.video_id = v.id
      WHERE v.is_active = 1
      GROUP BY v.id
      ORDER BY v.sort_order ASC, v.created_at DESC
    `);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/videos error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  // admin, subadmin ve creator video ekleyebilir
  if (!["admin", "subadmin", "creator"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, sourceUrl, uploaderName, description, sortOrder } = body;

  if (!title || !sourceUrl) {
    return NextResponse.json({ error: "Title and sourceUrl required" }, { status: 400 });
  }

  const driveFileId = extractDriveFileId(sourceUrl);
  if (!driveFileId) {
    return NextResponse.json({ error: "Geçersiz Google Drive URL" }, { status: 400 });
  }

  const now = new Date();
  const video = {
    id: createId(),
    title,
    driveFileId,
    sourceUrl,
    storageType: "GDRIVE" as const,
    uploaderName: uploaderName || session.user.name || null,
    uploadedById: session.user.id,
    description: description || null,
    sortOrder: sortOrder || 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(videos).values(video);

  return NextResponse.json(video, { status: 201 });
}
