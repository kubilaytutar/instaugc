"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const userName = session?.user?.name;

  const links = [
    { href: "/feed", label: "Akış", icon: "▶", roles: ["admin", "subadmin"] },
    { href: "/top10", label: "Top 10", icon: "★", roles: ["admin", "subadmin"] },
    { href: "/add-video", label: "Ekle", icon: "+", roles: ["admin", "subadmin"] },
    { href: "/my-videos", label: "Videolarım", icon: "▤", roles: ["creator"] },
    { href: "/admin", label: "Yönetim", icon: "⚙", roles: ["admin"] },
  ].filter((l) => !role || l.roles.includes(role));

  return (
    <nav className="absolute inset-x-0 bottom-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/8">
      {/* Kullanıcı satırı */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">{userName}</span>
          <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] text-white/30 uppercase tracking-wide">{role}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          Çıkış
        </button>
      </div>

      {/* Nav linkleri */}
      <div className="flex items-center justify-around px-2 pb-4 pt-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs transition-all ${
                active
                  ? "text-white bg-white/10"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="text-base leading-none">{link.icon}</span>
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
