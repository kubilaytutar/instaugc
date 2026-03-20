"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/components/session-provider";
import { NavBar } from "@/components/nav-bar";

function AddVideoContent() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", sourceUrl: "", uploaderName: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/feed");
    } else {
      const data = await res.json();
      setError(data.error || "Hata oluştu");
    }
  };

  return (
    <div className="flex h-[100dvh] justify-center bg-zinc-950">
      <div className="relative h-full w-full max-w-[430px] overflow-y-auto pb-24 pt-6 px-4">
        <h1 className="mb-6 text-xl font-bold text-white">Video Ekle</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Video Başlığı *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="url"
            placeholder="Google Drive Linki *"
            value={form.sourceUrl}
            onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
            required
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Kaynak / Yükleyen (opsiyonel)"
            value={form.uploaderName}
            onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <textarea
            placeholder="Açıklama (opsiyonel)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />

          <div className="rounded-2xl bg-zinc-900 p-3 text-xs text-zinc-500">
            💡 Google Drive videosunun paylaşım ayarı <strong className="text-zinc-300">"Bağlantıya sahip olan herkes görüntüleyebilir"</strong> olmalıdır.
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-purple-700"
          >
            {loading ? "Ekleniyor..." : "Video Ekle"}
          </button>
        </form>
      </div>
      <NavBar />
    </div>
  );
}

export default function AddVideoPage() {
  return (
    <AuthProvider>
      <AddVideoContent />
    </AuthProvider>
  );
}
