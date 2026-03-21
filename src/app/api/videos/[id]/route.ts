export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractDriveFileId } from "@/lib/gdrive";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = (session.user as { role: string }).role;
  const userId = session.user.id;

  // Creator sadece kendi videolarını düzenleyebilir
  if (role === "creator") {
    const video = await db.select().from(videos).where(
      and(eq(videos.id, id), eq(videos.uploadedById as any, userId))
    ).get();
    if (!video) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (role !== "admin" && role !== "subadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.title) updates.title = body.title;
  if (body.uploaderName !== undefined) updates.uploaderName = body.uploaderName;
  if (body.description !== undefined) updates.description = body.description;
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
  if (role === "admin" && body.isActive !== undefined) updates.isActive = body.isActive;
  if (role === "admin" && body.adminFeedback !== undefined) updates.adminFeedback = body.adminFeedback;

  if (body.sourceUrl) {
    const driveFileId = extractDriveFileId(body.sourceUrl);
    if (!driveFileId) return NextResponse.json({ error: "Geçersiz Google Drive URL" }, { status: 400 });
    updates.sourceUrl = body.sourceUrl;
    updates.driveFileId = driveFileId;
  }

  await db.update(videos).set(updates).where(eq(videos.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = (session.user as { role: string }).role;
  const userId = session.user.id;

  if (role === "creator") {
    const video = await db.select().from(videos).where(
      and(eq(videos.id, id), eq(videos.uploadedById as any, userId))
    ).get();
    if (!video) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.update(videos).set({ isActive: false, updatedAt: new Date() }).where(eq(videos.id, id));
  return NextResponse.json({ success: true });
}
