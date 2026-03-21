export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (role === "creator") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) return NextResponse.json({ error: "videoId required" }, { status: 400 });

  const result = db.all(sql`
    SELECT c.id, c.text, c.created_at, u.name as user_name, u.id as user_id
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.video_id = ${videoId}
    ORDER BY c.created_at ASC
  `);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (role === "creator") {
    return NextResponse.json({ error: "İçerik üreticileri yorum yapamaz" }, { status: 403 });
  }

  const { videoId, text } = await req.json();
  if (!videoId || !text?.trim()) {
    return NextResponse.json({ error: "videoId and text required" }, { status: 400 });
  }

  const userId = session.user.id;
  const now = Date.now();

  db.run(sql`
    INSERT INTO comments (id, user_id, video_id, text, created_at, updated_at)
    VALUES (${createId()}, ${userId}, ${videoId}, ${text.trim()}, ${now}, ${now})
  `);

  return NextResponse.json({ success: true, userId, userName: session.user.name, text: text.trim() });
}
