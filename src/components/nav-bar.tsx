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
    { href: "/add-video", label: "Video Ekle", icon: "+", roles: ["admin", "subadmin", "creator"] },
    { href: "/my-videos", label: "Videolarım", icon: "🎬", roles: ["creator"] },
    { href: "/admin", label: "Admin", icon: "⚙", roles: ["admin"] },
  ].filter((l) => !role || l.roles.includes(role));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur-lg">
      {/* Kullanıcı bilgisi + çıkış */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-1.5">
        <span className="text-xs text-zinc-500">
          {userName} <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{role}</span>
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Çıkış Yap
        </button>
      </div>
      {/* Navigasyon */}
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
                active ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className={`text-lg leading-none ${link.icon === "+" ? "text-2xl font-bold" : ""}`}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
