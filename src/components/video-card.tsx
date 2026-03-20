"use client";

import { useState, useCallback, useEffect } from "react";
import { GDrivePlayer } from "./gdrive-player";

interface Comment {
  id: string;
  text: string;
  user_name: string;
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
    user_comment?: string | null;
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
  const [commentText, setCommentText] = useState(video.user_comment ?? "");
  const [commentSent, setCommentSent] = useState(!!video.user_comment);
  const [sending, setSending] = useState(false);

  // Load comments lazily when opened
  useEffect(() => {
    if (!commentsOpen || comments.length > 0) return;
    fetch(`/api/comments?videoId=${video.id}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []));
  }, [commentsOpen, video.id, comments.length]);

  const handleRate = useCallback(
    async (score: number) => {
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
    },
    [video.id, onRate]
  );

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
      setCommentSent(true);
      setComments((prev) => {
        const exists = prev.find((c) => c.user_name === data.userName);
        if (exists) return prev.map((c) => c.user_name === data.userName ? { ...c, text: data.text } : c);
        return [...prev, { id: Date.now().toString(), text: data.text, user_name: data.userName }];
      });
    }
    setSending(false);
  }, [video.id, commentText, sending]);

  return (
    <div className="snap-item relative h-[100dvh] w-full flex-shrink-0 overflow-hidden bg-black">
      {/* Full-screen video */}
      <GDrivePlayer fileId={video.drive_file_id} isActive={isActive} />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* TOP: source + title + avg badge */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-5">
        <div className="flex-1 pr-3">
          {video.uploader_name && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Kaynak: {video.uploader_name}
            </p>
          )}
          <h2 className="text-lg font-black leading-tight text-white drop-shadow-lg">
            {video.title}
          </h2>
        </div>
        {avgRating !== null && (
          <div className="flex-shrink-0 rounded-2xl bg-purple-600 px-3 py-2 text-center shadow-lg shadow-purple-600/40">
            <p className="text-2xl font-black text-white leading-none">{avgRating}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-purple-200">Ort Puan</p>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE COMMENTS */}
      {commentsOpen && (
        <div
          className="absolute inset-x-4 z-20 overflow-hidden rounded-2xl bg-zinc-900/90 backdrop-blur-md"
          style={{ top: "50%", transform: "translateY(-50%)", maxHeight: "40%" }}
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Ekip Yorumları ({comments.length})
            </span>
            <button
              onClick={() => setCommentsOpen(false)}
              className="text-zinc-500 hover:text-white text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "calc(40vh - 40px)" }}>
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-500">Henüz yorum yok</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {c.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">{c.user_name}</p>
                    <p className="text-sm text-zinc-200 leading-snug">{c.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BOTTOM PANEL */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-24 pt-2 space-y-3">

        {/* Rating */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {selected ? `Puanın: ${selected}/10` : "Puan Ver"}
            </span>
            <div className="flex items-center gap-3">
              {totalVotes > 0 && !selected && (
                <span className="text-xs text-zinc-500">{totalVotes} oy · ort {avgRating}</span>
              )}
              {totalVotes > 0 && selected && (
                <span className="text-xs text-zinc-500">ort {avgRating} · {totalVotes} oy</span>
              )}
              {/* Toggle comments button */}
              <button
                onClick={() => setCommentsOpen(!commentsOpen)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  commentsOpen ? "bg-cyan-600/30 text-cyan-400" : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <span>💬</span>
                <span>Yorumlar</span>
              </button>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                className={`flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-90 ${
                  selected === score
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : selected !== null && score < selected
                    ? "bg-purple-900/50 text-purple-400"
                    : "bg-zinc-800/90 text-zinc-300"
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Comment input */}
        <div className="flex items-center gap-2 rounded-2xl bg-zinc-800/90 px-4 py-2.5 backdrop-blur-sm">
          <input
            type="text"
            value={commentText}
            onChange={(e) => { setCommentText(e.target.value); setCommentSent(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Yorum bırak..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim() || sending}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm text-white disabled:opacity-30 transition-colors"
          >
            {sending ? "…" : commentSent ? "✓" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
