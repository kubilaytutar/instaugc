export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role: string }).role;
    if (role === "creator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = db.all(sql`
      SELECT
        v.id, v.title, v.drive_file_id, v.uploader_name,
        ROUND(AVG(r.score), 2) as avg_rating,
        COUNT(r.id) as total_votes
      FROM videos v
      INNER JOIN ratings r ON r.video_id = v.id
      WHERE v.is_active = 1
      GROUP BY v.id
      HAVING total_votes > 0
      ORDER BY avg_rating DESC, total_votes DESC
      LIMIT 10
    `);

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/leaderboard error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
