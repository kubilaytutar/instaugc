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
  const [showRating, setShowRating] = useState(false);
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
    setTimeout(() => setShowRating(false), 600);
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
    <div className="snap-item relative h-[100dvh] w-full flex-shrink-0 bg-black">
      {/* Tam ekran video */}
      <GDrivePlayer fileId={video.drive_file_id} isActive={isActive} />

      {/* Alt gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Sol alt: başlık + kaynak (TikTok tarzı) */}
      <div className="absolute left-0 bottom-28 z-10 px-4 pr-20">
        <p className="text-sm font-bold text-white drop-shadow-lg">{video.title}</p>
        {video.uploader_name && (
          <p className="text-xs text-white/60 mt-0.5">@{video.uploader_name}</p>
        )}
      </div>

      {/* Sağ: dikey aksiyon butonları (TikTok/Reels tarzı) */}
      <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
        {/* Puan butonu */}
        <button
          onClick={() => setShowRating(!showRating)}
          className="flex flex-col items-center"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
            selected ? "bg-white" : "bg-white/20 backdrop-blur-sm"
          }`}>
            <span className={`text-base font-black ${selected ? "text-black" : "text-white"}`}>
              {selected || "★"}
            </span>
          </div>
          <span className="text-[10px] text-white/70 mt-1">
            {avgRating !== null && totalVotes > 0 ? `${avgRating}` : "Puan"}
          </span>
        </button>

        {/* Yorum butonu */}
        <button
          onClick={() => setCommentsOpen(true)}
          className="flex flex-col items-center"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-lg">💬</span>
          </div>
          <span className="text-[10px] text-white/70 mt-1">Yorum</span>
        </button>

        {/* Oy sayısı */}
        {totalVotes > 0 && (
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-bold text-white">{totalVotes}</span>
            </div>
            <span className="text-[10px] text-white/70 mt-1">Oy</span>
          </div>
        )}
      </div>

      {/* Puan seçim paneli (tıklanınca açılır) */}
      {showRating && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
          onClick={() => setShowRating(false)}
        >
          <div
            className="rounded-3xl bg-zinc-900/95 backdrop-blur-xl p-5 mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-sm font-semibold text-white mb-4">
              {selected ? `Puanın: ${selected} / 10` : "Bu videoya kaç puan verirsin?"}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleRate(score)}
                  className={`h-12 w-12 rounded-2xl text-base font-bold transition-all active:scale-90 ${
                    selected === score
                      ? "bg-white text-black scale-110"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Yorumlar paneli (altan açılır, TikTok tarzı) */}
      {commentsOpen && (
        <div
          className="absolute inset-0 z-20 flex items-end bg-black/50"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-zinc-950 border-t border-white/10 mb-14"
            style={{ maxHeight: "55dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-sm font-semibold text-white">
                Yorumlar {comments.length > 0 && `(${comments.length})`}
              </span>
              <button onClick={() => setCommentsOpen(false)} className="text-white/30 text-xl leading-none">×</button>
            </div>

            {/* Yorum listesi */}
            <div className="overflow-y-auto px-4 py-3 space-y-4" style={{ maxHeight: "calc(60dvh - 110px)" }}>
              {comments.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-6">Henüz yorum yok</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                      {c.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/40">{c.user_name}</p>
                      <p className="text-sm text-white/80 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Yorum yaz */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Yorum ekle..."
                className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim() || sending}
                className="h-9 w-9 flex-shrink-0 rounded-full bg-white flex items-center justify-center disabled:opacity-20"
              >
                <span className="text-black text-sm font-bold">↑</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
