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
    <div className="snap-item relative h-[100dvh] w-full flex-shrink-0 overflow-hidden bg-black">
      {/* Video */}
      <GDrivePlayer fileId={video.drive_file_id} isActive={isActive} />

      {/* Gradient — sadece altta */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

      {/* Üst bilgi */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-10">
        <div className="flex-1 pr-3">
          {video.uploader_name && (
            <p className="mb-0.5 text-xs font-medium text-white/60">{video.uploader_name}</p>
          )}
          <h2 className="text-base font-bold leading-tight text-white drop-shadow-md line-clamp-2">
            {video.title}
          </h2>
        </div>

        {avgRating !== null && totalVotes > 0 && (
          <div className="flex-shrink-0 rounded-2xl bg-black/40 backdrop-blur-md px-3 py-2 text-center">
            <p className="text-xl font-black text-white leading-none">{avgRating}</p>
            <p className="text-[9px] text-white/40 mt-0.5">{totalVotes} oy</p>
          </div>
        )}
      </div>

      {/* Alt panel */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-20 space-y-2">

        {/* Puan butonları */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-medium text-white/50">
              {selected ? `Puanın: ${selected} / 10` : "Puan ver"}
            </span>
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              <span>💬</span>
              <span>{comments.length > 0 ? comments.length : "Yorum"}</span>
            </button>
          </div>

          <div className="flex gap-[5px]">
            {[1,2,3,4,5,6,7,8,9,10].map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                className={`flex h-10 flex-1 items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 active:scale-90 ${
                  selected === score
                    ? "bg-white text-black shadow-lg shadow-white/20"
                    : selected !== null && score <= selected
                    ? "bg-white/20 text-white"
                    : "bg-white/8 text-white/40 hover:bg-white/15"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Yorum inputu */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Yorum ekle..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim() || sending}
            className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-full bg-white text-xs text-black font-bold disabled:opacity-20 transition-all"
          >
            {sending ? "·" : "↑"}
          </button>
        </div>
      </div>

      {/* Yorumlar paneli (slide-up) */}
      {commentsOpen && (
        <div
          className="absolute inset-0 z-30 flex items-end"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 pb-24"
            style={{ maxHeight: "60dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                Yorumlar {comments.length > 0 && <span className="text-white/40 font-normal">({comments.length})</span>}
              </span>
              <button onClick={() => setCommentsOpen(false)} className="text-white/40 hover:text-white text-xl leading-none">
                ×
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "calc(60dvh - 120px)" }}>
              {comments.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">Henüz yorum yok</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                      {c.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/60 mb-0.5">{c.user_name}</p>
                      <p className="text-sm text-white/90">{c.text}</p>
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
