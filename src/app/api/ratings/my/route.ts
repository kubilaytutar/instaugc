export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ratings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRatings = await db
    .select({
      videoId: ratings.videoId,
      score: ratings.score,
    })
    .from(ratings)
    .where(eq(ratings.userId, session.user.id));

  return NextResponse.json(userRatings);
}
