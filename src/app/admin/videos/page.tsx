"use client";

import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  drive_file_id: string;
  source_url: string;
  uploader_name: string | null;
  admin_feedback: string | null;
  sort_order: number;
  is_active: boolean;
  avg_rating: number | null;
  total_votes: number;
  created_at: number;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", sourceUrl: "", uploaderName: "", description: "", sortOrder: 0 });
  const [error, setError] = useState("");
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  const fetchVideos = () => {
    fetch("/api/videos")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setVideos(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", sourceUrl: "", uploaderName: "", description: "", sortOrder: 0 });
      setShowForm(false);
      fetchVideos();
    } else {
      const data = await res.json();
      setError(data.error || "Hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu videoyu silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    fetchVideos();
  };

  const openFeedback = (v: Video) => {
    setFeedbackId(v.id);
    setFeedbackText(v.admin_feedback || "");
  };

  const saveFeedback = async () => {
    if (!feedbackId) return;
    setSavingFeedback(true);
    const res = await fetch(`/api/videos/${feedbackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminFeedback: feedbackText }),
    });
    setSavingFeedback(false);
    if (res.ok) {
      setFeedbackId(null);
      fetchVideos();
    }
  };

  if (loading) return <div className="text-white/30 py-8 text-center text-sm">Yükleniyor...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Videolar <span className="text-sm font-normal text-white/30">({videos.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          {showForm ? "Kapat" : "+ Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-zinc-900 p-4">
          <input type="text" placeholder="Video Başlığı *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none" />
          <input type="url" placeholder="Google Drive Linki *" value={form.sourceUrl}
            onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} required
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none" />
          <input type="text" placeholder="Yükleyen / Kaynak" value={form.uploaderName}
            onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none" />
          <input type="number" placeholder="Sıralama (0 = otomatik)" value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700">
            Ekle
          </button>
        </form>
      )}

      <div className="space-y-2">
        {videos.map((video, index) => (
          <div key={video.id} className="rounded-2xl bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/20">#{index + 1}</span>
                  <p className="truncate text-sm font-medium text-white">{video.title}</p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-white/30">
                  {video.uploader_name && <span>{video.uploader_name}</span>}
                  <span>{video.avg_rating !== null ? `★ ${video.avg_rating}` : "oy yok"}</span>
                  <span>{video.total_votes} oy</span>
                </div>
                {video.admin_feedback && (
                  <p className="mt-1 text-xs text-amber-400/60 truncate">📝 {video.admin_feedback}</p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-3">
                <button onClick={() => openFeedback(video)} className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors">
                  Feedback
                </button>
                <button onClick={() => handleDelete(video.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">
                  Sil
                </button>
              </div>
            </div>

            {/* Feedback paneli */}
            {feedbackId === video.id && (
              <div className="px-4 pb-4 border-t border-white/5">
                <p className="text-xs text-amber-400/60 font-medium mt-3 mb-2">Creator'a Gösterilecek Admin Notu</p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Bu video hakkında içerik üreticisine not yaz..."
                  rows={3}
                  className="w-full rounded-xl bg-white/5 border border-amber-500/20 px-3 py-2.5 text-sm text-white placeholder-white/25 focus:border-amber-500/40 focus:outline-none resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveFeedback}
                    disabled={savingFeedback}
                    className="flex-1 rounded-xl bg-amber-500/20 border border-amber-500/30 py-2 text-xs font-medium text-amber-300 disabled:opacity-50"
                  >
                    {savingFeedback ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                  <button
                    onClick={() => setFeedbackId(null)}
                    className="flex-1 rounded-xl bg-white/5 py-2 text-xs text-white/40"
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
