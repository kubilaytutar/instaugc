"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  const links = [
    { href: "/feed", label: "Akış", icon: "▶", roles: ["admin", "subadmin"] },
    { href: "/top10", label: "Top 10", icon: "★", roles: ["admin", "subadmin"] },
    { href: "/add-video", label: "Ekle", icon: "+", roles: ["admin", "subadmin"] },
    { href: "/my-videos", label: "Videolarım", icon: "▤", roles: ["creator"] },
    { href: "/admin", label: "Yönetim", icon: "⚙", roles: ["admin"] },
  ].filter((l) => !role || l.roles.includes(role));

  return (
    <nav className="flex-shrink-0 bg-black border-t border-white/8 z-50">
      <div className="flex items-center justify-around py-2 pb-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-all ${
                active ? "text-white" : "text-white/30"
              }`}
            >
              <span className="text-base leading-none">{link.icon}</span>
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
        {/* Çıkış — nav içinde küçük ikon */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-white/20 hover:text-red-400 transition-colors"
        >
          <span className="text-base leading-none">⏻</span>
          <span className="text-[10px]">Çıkış</span>
        </button>
      </div>
    </nav>
  );
}
