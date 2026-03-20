import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    return NextResponse.next();
  }

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (req.auth.user as { role?: string })?.role;

  // Admin only
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Feed / top10 / add-video: admin + subadmin only
  if (
    pathname.startsWith("/feed") ||
    pathname.startsWith("/top10") ||
    pathname.startsWith("/add-video")
  ) {
    if (role === "creator") return NextResponse.redirect(new URL("/my-videos", req.url));
  }

  // Creator's page: creator + admin only
  if (pathname.startsWith("/my-videos")) {
    if (role === "subadmin") return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|manifest.json).*)"],
};
