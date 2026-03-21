export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role: string }).role;
  if (role === "creator") {
    return NextResponse.json({ error: "İçerik üreticileri oy veremez" }, { status: 403 });
  }

  const { videoId, score } = await req.json();
  if (!videoId || !score || score < 1 || score > 10) {
    return NextResponse.json({ error: "Geçersiz videoId veya puan (1-10)" }, { status: 400 });
  }

  const email = session.user.email!;
  const dbUser = db.select().from(users).where(eq(users.email, email)).get();
  if (!dbUser) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const userId = dbUser.id;
  const now = Date.now();

  db.run(sql`
    INSERT INTO ratings (id, user_id, video_id, score, created_at, updated_at)
    VALUES (${createId()}, ${userId}, ${videoId}, ${score}, ${now}, ${now})
    ON CONFLICT(user_id, video_id)
    DO UPDATE SET score = ${score}, updated_at = ${now}
  `);

  const stats = db.get<{ avg_rating: number; total_votes: number }>(sql`
    SELECT ROUND(AVG(score), 2) as avg_rating, COUNT(*) as total_votes
    FROM ratings WHERE video_id = ${videoId}
  `);

  return NextResponse.json({
    videoId,
    score,
    avgRating: stats?.avg_rating ?? 0,
    totalVotes: stats?.total_votes ?? 0,
  });
}
