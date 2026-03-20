import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashSync } from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const allUsers = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt })
    .from(users);

  return NextResponse.json(allUsers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password, name, role } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Email, şifre ve isim gerekli" }, { status: 400 });
  }

  const validRoles = ["admin", "subadmin", "creator"];
  const userRole = validRoles.includes(role) ? role : "subadmin";

  const now = new Date();
  try {
    await db.insert(users).values({
      id: createId(),
      email,
      passwordHash: hashSync(password, 10),
      name,
      role: userRole as "admin" | "subadmin" | "creator",
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    return NextResponse.json({ error: "Bu email zaten kullanımda" }, { status: 409 });
  }

  return NextResponse.json({ email, name, role: userRole }, { status: 201 });
}
