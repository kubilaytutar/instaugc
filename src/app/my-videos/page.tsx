"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AuthProvider } from "@/components/session-provider";

interface MyVideo {
  id: string;
  title: string;
  uploader_name: string | null;
  source_url: string;
  created_at: number;
}

function MyVideosContent() {
  const [videos, setVideos] = useState<MyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", sourceUrl: "", uploaderName: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchVideos = () => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((data) => { setVideos(data); setLoading(false); });
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (res.ok) {
      setForm({ title: "", sourceUrl: "", uploaderName: "", description: "" });
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

  return (
    <div className="flex h-[100dvh] justify-center bg-black">
      <div className="flex h-full w-full max-w-[430px] flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">InstaPuan</h1>
            <p className="text-xs text-zinc-500">İçerik Yönetimi</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700"
          >
            Çıkış
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Add button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700"
          >
            {showForm ? "İptal" : "+ Yeni Video Ekle"}
          </button>

          {/* Add form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-zinc-900 p-4">
              <input
                type="text"
                placeholder="Video Başlığı *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Google Drive Linki *"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                required
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Kaynak / Kanal adı (opsiyonel)"
                value={form.uploaderName}
                onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-zinc-500">
                💡 Paylaşım: "Bağlantıya sahip olan herkes görüntüleyebilir" olmalı
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Ekleniyor..." : "Kaydet"}
              </button>
            </form>
          )}

          {/* Video list */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Videolarım ({videos.length})
            </p>
            {loading ? (
              <p className="text-sm text-zinc-500">Yükleniyor...</p>
            ) : videos.length === 0 ? (
              <p className="text-sm text-zinc-500">Henüz video eklemediniz</p>
            ) : (
              <div className="space-y-2">
                {videos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white text-sm">{v.title}</p>
                      {v.uploader_name && (
                        <p className="text-xs text-zinc-500">@{v.uploader_name}</p>
                      )}
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {new Date(v.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="ml-3 text-xs text-red-400 hover:text-red-300"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyVideosPage() {
  return (
    <AuthProvider>
      <MyVideosContent />
    </AuthProvider>
  );
}
