"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AuthProvider } from "@/components/session-provider";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/videos", label: "Videolar" },
  { href: "/admin/users", label: "Kullanicilar" },
  { href: "/admin/results", label: "Sonuclar" },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="min-h-[100dvh] bg-zinc-950">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-lg font-bold text-white">
            InstaPuan <span className="text-xs text-purple-400">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
            >
              Akisa Don
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
            >
              Cikis
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto px-4 pb-2 no-scrollbar">
          {adminLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-purple-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-[100dvh] bg-zinc-950">
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="text-lg font-bold text-white">
              InstaPuan <span className="text-xs text-purple-400">Admin</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/feed"
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Akisa Don
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
              >
                Cikis
              </button>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto px-4 pb-2 no-scrollbar">
            <AdminTabNav />
          </div>
        </header>

        <main className="px-4 py-6">{children}</main>
      </div>
    </AuthProvider>
  );
}

function AdminTabNav() {
  const pathname = usePathname();
  return (
    <>
      {adminLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-purple-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
