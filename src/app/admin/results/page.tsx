"use client";

import { useEffect, useState, useCallback } from "react";

interface VideoResult {
  id: string;
  title: string;
  uploader_name: string | null;
  avg_rating: number | null;
  total_votes: number;
}

interface Comment {
  id: string;
  text: string;
  user_name: string;
  created_at: number;
}

interface VideoComments {
  [videoId: string]: Comment[];
}

export default function AdminResultsPage() {
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [comments, setComments] = useState<VideoComments>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a: VideoResult, b: VideoResult) => {
          const aRating = a.avg_rating ?? 0;
          const bRating = b.avg_rating ?? 0;
          if (bRating !== aRating) return bRating - aRating;
          return b.total_votes - a.total_votes;
        });
        setVideos(sorted);
        setLoading(false);
      });
  }, []);

  const loadComments = useCallback(async (videoId: string) => {
    if (comments[videoId]) {
      setExpanded(expanded === videoId ? null : videoId);
      return;
    }
    const res = await fetch(`/api/comments?videoId=${videoId}`);
    const data = await res.json();
    setComments((prev) => ({ ...prev, [videoId]: data }));
    setExpanded(videoId);
  }, [comments, expanded]);

  const copyAllFeedback = () => {
    const lines: string[] = [];
    lines.push("INSTAPUAN - VIDEO DEGERLENDIRME SONUCLARI");
    lines.push("==========================================");
    lines.push("");
    videos.slice(0, 10).forEach((v, i) => {
      lines.push(`${i + 1}. ${v.title}${v.uploader_name ? ` (@${v.uploader_name})` : ""}`);
      lines.push(`   Puan: ${v.avg_rating ?? "-"} / 10  |  Oy: ${v.total_votes}`);
      if (comments[v.id]?.length) {
        lines.push("   Yorumlar:");
        comments[v.id].forEach((c) => {
          lines.push(`   - ${c.user_name}: ${c.text}`);
        });
      }
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    const rows = ["Sira,Baslik,Yukleyen,Ortalama Puan,Toplam Oy"];
    videos.forEach((v, i) => {
      rows.push(`${i + 1},"${v.title}","${v.uploader_name || ""}",${v.avg_rating ?? 0},${v.total_votes}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instapuan-sonuclar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-zinc-500">Yukleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Sonuclar</h2>
        <div className="flex gap-2">
          <button
            onClick={copyAllFeedback}
            className="rounded-xl bg-purple-700/50 px-3 py-2 text-xs text-purple-300 hover:bg-purple-700/70"
          >
            {copied ? "✓ Kopyalandi!" : "⎘ Feedbacki Kopyala"}
          </button>
          <button
            onClick={exportCSV}
            className="rounded-xl bg-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
          >
            CSV Indir
          </button>
        </div>
      </div>

      {/* Top 10 */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-600/10 p-4 ring-1 ring-purple-500/20">
        <h3 className="mb-3 text-sm font-semibold text-purple-400">En Iyi 10 Video</h3>
        <div className="space-y-2">
          {videos.slice(0, 10).map((video, index) => (
            <div key={video.id}>
              <button
                onClick={() => loadComments(video.id)}
                className="w-full rounded-xl bg-black/30 p-3 text-left transition-colors hover:bg-black/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index < 3 ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{video.title}</p>
                      {video.uploader_name && (
                        <p className="text-xs text-zinc-500">@{video.uploader_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-purple-400">{video.avg_rating ?? "-"}</p>
                      <p className="text-xs text-zinc-500">{video.total_votes} oy</p>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {expanded === video.id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Comments */}
              {expanded === video.id && (
                <div className="ml-9 mt-1 space-y-1 rounded-xl bg-zinc-900/50 p-3">
                  {!comments[video.id] ? (
                    <p className="text-xs text-zinc-500">Yukleniyor...</p>
                  ) : comments[video.id].length === 0 ? (
                    <p className="text-xs text-zinc-500">Henuz yorum yok</p>
                  ) : (
                    comments[video.id].map((c) => (
                      <div key={c.id} className="rounded-lg bg-zinc-800/50 px-3 py-2">
                        <p className="text-xs font-medium text-purple-400">{c.user_name}</p>
                        <p className="text-sm text-zinc-300">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Remaining videos */}
      {videos.length > 10 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-400">Diger Videolar</h3>
          <div className="space-y-1">
            {videos.slice(10).map((video, index) => (
              <div key={video.id}>
                <button
                  onClick={() => loadComments(video.id)}
                  className="w-full rounded-xl bg-zinc-900 p-3 text-left hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs text-zinc-600">{index + 11}</span>
                      <p className="text-sm text-zinc-300">{video.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-400">{video.avg_rating ?? "-"}</p>
                      <p className="text-xs text-zinc-600">{video.total_votes} oy</p>
                      <span className="text-xs text-zinc-700">{expanded === video.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {expanded === video.id && (
                  <div className="ml-8 mt-1 space-y-1 rounded-xl bg-zinc-900/50 p-3">
                    {!comments[video.id] ? (
                      <p className="text-xs text-zinc-500">Yukleniyor...</p>
                    ) : comments[video.id].length === 0 ? (
                      <p className="text-xs text-zinc-500">Henuz yorum yok</p>
                    ) : (
                      comments[video.id].map((c) => (
                        <div key={c.id} className="rounded-lg bg-zinc-800/50 px-3 py-2">
                          <p className="text-xs font-medium text-purple-400">{c.user_name}</p>
                          <p className="text-sm text-zinc-300">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
