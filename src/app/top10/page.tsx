"use client";

import { useEffect, useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { AuthProvider } from "@/components/session-provider";
import { getDriveThumbnailUrl } from "@/lib/gdrive";

interface LeaderboardItem {
  id: string;
  title: string;
  drive_file_id: string;
  uploader_name: string | null;
  avg_rating: number;
  total_votes: number;
}

function Top10Content() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-white/30 text-sm">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-black pb-20 pt-10">
      <div className="px-4">
        <h1 className="mb-5 text-center text-xl font-bold text-white">Top 10</h1>

        {items.length === 0 ? (
          <p className="text-center text-white/30 text-sm mt-8">Henüz yeterli oy verilmedi</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  index === 0 ? "bg-yellow-500/10 ring-1 ring-yellow-500/20"
                  : index === 1 ? "bg-white/5 ring-1 ring-white/10"
                  : index === 2 ? "bg-amber-700/10 ring-1 ring-amber-700/20"
                  : "bg-white/3"
                }`}
              >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? "bg-yellow-500 text-black"
                  : index === 1 ? "bg-white/40 text-black"
                  : index === 2 ? "bg-amber-700 text-white"
                  : "bg-white/10 text-white/40"
                }`}>
                  {index + 1}
                </div>

                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
                  <img src={getDriveThumbnailUrl(item.drive_file_id)} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  {item.uploader_name && <p className="text-xs text-white/30">{item.uploader_name}</p>}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-white">{item.avg_rating}</p>
                  <p className="text-[10px] text-white/30">{item.total_votes} oy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NavBar />
    </div>
  );
}

export default function Top10Page() {
  return (
    <AuthProvider>
      <div className="feed-shell">
        <div className="feed-phone">
          <Top10Content />
        </div>
      </div>
    </AuthProvider>
  );
}
