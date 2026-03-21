"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AuthProvider } from "@/components/session-provider";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/videos", label: "Videolar" },
  { href: "/admin/users", label: "Kullanıcılar" },
  { href: "/admin/results", label: "Sonuçlar" },
];

function AdminTabNav() {
  const pathname = usePathname();
  return (
    <>
      {adminLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link key={link.href} href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs transition-colors ${
              active ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="feed-shell">
        <div className="feed-phone overflow-y-auto">
          <header className="sticky top-0 z-50 border-b border-white/8 bg-black/95 backdrop-blur-lg">
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/admin" className="text-base font-bold text-white">
                Admin
              </Link>
              <div className="flex items-center gap-2">
                <Link href="/feed" className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/40 hover:text-white/70">
                  Akışa Dön
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-red-400/60 hover:text-red-400">
                  Çıkış
                </button>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto px-4 pb-2 no-scrollbar">
              <AdminTabNav />
            </div>
          </header>
          <main className="px-4 py-4">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
