"use client";

import { useEffect, useState } from "react";

interface Video {
  id: string;
  title: string;
  drive_file_id: string;
  source_url: string;
  uploader_name: string | null;
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
  const [form, setForm] = useState({
    title: "",
    sourceUrl: "",
    uploaderName: "",
    description: "",
    sortOrder: 0,
  });
  const [error, setError] = useState("");

  const fetchVideos = () => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => {
        setVideos(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVideos();
  }, []);

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
      setError(data.error || "Hata olustu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu videoyu silmek istediginize emin misiniz?")) return;
    await fetch(`/api/videos/${id}`, { method: "DELETE" });
    fetchVideos();
  };

  if (loading) return <div className="text-zinc-500">Yukleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Videolar <span className="text-sm font-normal text-zinc-500">({videos.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          {showForm ? "Kapat" : "+ Video Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-zinc-900 p-4">
          <input
            type="text"
            placeholder="Video Basligi"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="Google Drive Linki"
            value={form.sourceUrl}
            onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Yukleyen Kisi"
            value={form.uploaderName}
            onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <textarea
            placeholder="Aciklama (opsiyonel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none resize-none"
          />
          <input
            type="number"
            placeholder="Siralama (0 = otomatik)"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-500">
            Not: Google Drive videolarinin paylasim ayari &quot;Baglantiya sahip olan herkes gorebilir&quot; olmalidir.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Video Ekle
          </button>
        </form>
      )}

      <div className="space-y-2">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">#{index + 1}</span>
                <p className="truncate font-medium text-white">{video.title}</p>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                {video.uploader_name && <span>@{video.uploader_name}</span>}
                <span>
                  {video.avg_rating !== null ? `★ ${video.avg_rating}` : "Oy yok"}
                </span>
                <span>{video.total_votes} oy</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(video.id)}
              className="ml-3 flex-shrink-0 text-xs text-red-400 hover:text-red-300"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
