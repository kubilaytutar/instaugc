"use client";

import { useState, useCallback, useEffect } from "react";
import { GDrivePlayer } from "./gdrive-player";

interface Comment {
  id: string;
  text: string;
  user_name: string;
  created_at: number;
}

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    drive_file_id: string;
    uploader_name: string | null;
    avg_rating: number | null;
    total_votes: number;
    user_rating: number | null;
  };
  isActive: boolean;
  onRate: (videoId: string, score: number) => void;
}

export function VideoCard({ video, isActive, onRate }: VideoCardProps) {
  const [selected, setSelected] = useState<number | null>(video.user_rating);
  const [avgRating, setAvgRating] = useState(video.avg_rating);
  const [totalVotes, setTotalVotes] = useState(video.total_votes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!commentsOpen) return;
    fetch(`/api/comments?videoId=${video.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setComments(Array.isArray(data) ? data : []));
  }, [commentsOpen, video.id]);

  const handleRate = useCallback(async (score: number) => {
    setSelected(score);
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, score }),
    });
    if (res.ok) {
      const data = await res.json();
      setAvgRating(data.avgRating);
      setTotalVotes(data.totalVotes);
      onRate(video.id, score);
    }
  }, [video.id, onRate]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, text: commentText }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [
        ...prev,
        { id: Date.now().toString(), text: data.text, user_name: data.userName, created_at: Date.now() },
      ]);
      setCommentText("");
    }
    setSending(false);
  }, [video.id, commentText, sending]);

  return (
    <div className="snap-item h-full w-full flex-shrink-0 flex flex-col bg-black">
      {/* Video alanı — kalan yeri doldurur */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <GDrivePlayer fileId={video.drive_file_id} isActive={isActive} />

        {/* Başlık overlay (videonun üstünde) */}
        <div className="absolute inset-x-0 top-0 z-10 px-3 pt-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-2">
              {video.uploader_name && (
                <p className="text-[11px] text-white/50">{video.uploader_name}</p>
              )}
              <h2 className="text-sm font-bold text-white drop-shadow-md line-clamp-1">
                {video.title}
              </h2>
            </div>
            {avgRating !== null && totalVotes > 0 && (
              <div className="rounded-xl bg-black/50 backdrop-blur-sm px-2.5 py-1.5 text-center">
                <p className="text-lg font-black text-white leading-none">{avgRating}</p>
                <p className="text-[8px] text-white/40">{totalVotes} oy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kontrol alanı — sabit, scroll etmez */}
      <div
        className="flex-shrink-0 bg-black px-3 py-2 space-y-2 border-t border-white/5"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Puan butonları */}
        <div className="flex items-center justify-between mb-1 px-0.5">
          <span className="text-[11px] text-white/40">
            {selected ? `Puanın: ${selected}/10` : "Puan ver"}
          </span>
          <button
            onClick={() => setCommentsOpen(true)}
            className="text-[11px] text-white/40 hover:text-white/70"
          >
            💬 {comments.length > 0 ? comments.length : "Yorum"}
          </button>
        </div>

        <div className="flex gap-[4px]">
          {[1,2,3,4,5,6,7,8,9,10].map((score) => (
            <button
              key={score}
              onClick={() => handleRate(score)}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                selected === score
                  ? "bg-white text-black"
                  : selected !== null && score <= selected
                  ? "bg-white/20 text-white"
                  : "bg-white/8 text-white/40"
              }`}
            >
              {score}
            </button>
          ))}
        </div>

        {/* Yorum inputu */}
        <div className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Yorum ekle..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim() || sending}
            className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-white text-black text-xs font-bold disabled:opacity-20"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Yorumlar slide-up panel */}
      {commentsOpen && (
        <div className="absolute inset-0 z-30 flex items-end" onClick={() => setCommentsOpen(false)}>
          <div
            className="w-full rounded-t-2xl bg-zinc-950 border-t border-white/10 pb-4"
            style={{ maxHeight: "55%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-sm font-semibold text-white">
                Yorumlar {comments.length > 0 && `(${comments.length})`}
              </span>
              <button onClick={() => setCommentsOpen(false)} className="text-white/30 hover:text-white text-lg">×</button>
            </div>
            <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "calc(55vh - 60px)" }}>
              {comments.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-4">Henüz yorum yok</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                      {c.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-white/40">{c.user_name}</p>
                      <p className="text-sm text-white/80">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
