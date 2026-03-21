"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AuthProvider } from "@/components/session-provider";

interface MyVideo {
  id: string;
  title: string;
  uploader_name: string | null;
  source_url: string;
  admin_feedback: string | null;
  created_at: number;
}

function MyVideosContent() {
  const [videos, setVideos] = useState<MyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", sourceUrl: "", uploaderName: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", sourceUrl: "" });

  const fetchVideos = () => {
    fetch("/api/videos")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setVideos(Array.isArray(data) ? data : []); setLoading(false); });
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
      setForm({ title: "", sourceUrl: "", uploaderName: "" });
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

  const startEdit = (v: MyVideo) => {
    setEditingId(v.id);
    setEditForm({ title: v.title, sourceUrl: v.source_url });
  };

  const handleEdit = async (id: string) => {
    const res = await fetch(`/api/videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setEditingId(null);
      fetchVideos();
    }
  };

  return (
    <div className="flex h-full flex-col bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4 border-b border-white/8">
          <div>
            <h1 className="text-lg font-bold text-white">Videolarım</h1>
            <p className="text-xs text-white/30">{videos.length} video</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-red-400/70 hover:text-red-400"
          >
            Çıkış
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-8">
          {/* Yeni video butonu */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            {showForm ? "İptal" : "+ Yeni Video Ekle"}
          </button>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-2 rounded-2xl bg-zinc-900 p-4">
              <input
                type="text"
                placeholder="Video Başlığı *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
              />
              <input
                type="url"
                placeholder="Google Drive Linki *"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Kanal / Kaynak (opsiyonel)"
                value={form.uploaderName}
                onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
              />
              <p className="text-[11px] text-white/25 px-1">
                Drive paylaşımı: "Bağlantıya sahip olan herkes" olmalı
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

          {/* Video listesi */}
          {loading ? (
            <p className="text-sm text-white/30 text-center py-8">Yükleniyor...</p>
          ) : videos.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Henüz video eklemediniz</p>
          ) : (
            <div className="space-y-2">
              {videos.map((v) => (
                <div key={v.id} className="rounded-2xl bg-zinc-900 overflow-hidden">
                  {/* Düzenleme modu */}
                  {editingId === v.id ? (
                    <div className="p-4 space-y-2">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                        placeholder="Başlık"
                      />
                      <input
                        type="url"
                        value={editForm.sourceUrl}
                        onChange={(e) => setEditForm({ ...editForm, sourceUrl: e.target.value })}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
                        placeholder="Drive linki"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(v.id)}
                          className="flex-1 rounded-xl bg-purple-600 py-2 text-xs font-medium text-white"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 rounded-xl bg-white/5 py-2 text-xs text-white/50"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm truncate">{v.title}</p>
                          {v.uploader_name && (
                            <p className="text-xs text-white/30 mt-0.5">{v.uploader_name}</p>
                          )}
                          <p className="text-xs text-white/20 mt-0.5">
                            {new Date(v.created_at).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(v)}
                            className="text-xs text-white/40 hover:text-white/70 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="text-xs text-red-400/60 hover:text-red-400 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      {/* Admin feedback — varsa göster */}
                      {v.admin_feedback && (
                        <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                          <p className="text-[10px] font-semibold text-amber-400/70 uppercase tracking-wide mb-1">
                            Admin Notu
                          </p>
                          <p className="text-sm text-amber-100/80">{v.admin_feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}

export default function MyVideosPage() {
  return (
    <AuthProvider>
      <div className="feed-shell">
        <div className="feed-phone">
          <MyVideosContent />
        </div>
      </div>
    </AuthProvider>
  );
}
