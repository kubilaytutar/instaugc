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
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <span className="text-zinc-500">Yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black pb-24 pt-4">
      <div className="px-4">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          Top 10
        </h1>

        {items.length === 0 ? (
          <p className="text-center text-zinc-500">
            Henuz yeterli oy verilmedi
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 ring-1 ring-yellow-500/30"
                    : index === 1
                    ? "bg-gradient-to-r from-zinc-400/20 to-zinc-300/10 ring-1 ring-zinc-400/30"
                    : index === 2
                    ? "bg-gradient-to-r from-amber-700/20 to-amber-600/10 ring-1 ring-amber-700/30"
                    : "bg-zinc-900"
                }`}
              >
                {/* Rank */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-zinc-400 text-black"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                  <img
                    src={getDriveThumbnailUrl(item.drive_file_id)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {item.title}
                  </p>
                  {item.uploader_name && (
                    <p className="text-xs text-zinc-500">
                      @{item.uploader_name}
                    </p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-400">
                    {item.avg_rating}
                  </p>
                  <p className="text-xs text-zinc-500">{item.total_votes} oy</p>
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
      <Top10Content />
    </AuthProvider>
  );
}
