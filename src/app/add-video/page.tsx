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

  const inputCls = "w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/25 focus:border-white/30 focus:outline-none";

  return (
    <div className="h-full overflow-y-auto bg-black pb-20 pt-10 px-4">
      <h1 className="mb-5 text-xl font-bold text-white">Video Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" placeholder="Video Başlığı *" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} />
        <input type="url" placeholder="Google Drive Linki *" value={form.sourceUrl}
          onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} required className={inputCls} />
        <input type="text" placeholder="Kaynak / Yükleyen (opsiyonel)" value={form.uploaderName}
          onChange={(e) => setForm({ ...form, uploaderName: e.target.value })} className={inputCls} />
        <textarea placeholder="Açıklama (opsiyonel)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
          className={`${inputCls} resize-none`} />
        <p className="text-[11px] text-white/20 px-1">
          Drive paylaşımı: "Bağlantıya sahip olan herkes" olmalı
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-2xl bg-white text-black py-3 text-sm font-semibold disabled:opacity-50">
          {loading ? "Ekleniyor..." : "Video Ekle"}
        </button>
      </form>
      <NavBar />
    </div>
  );
}

export default function AddVideoPage() {
  return (
    <AuthProvider>
      <div className="feed-shell">
        <div className="feed-phone">
          <AddVideoContent />
        </div>
      </div>
    </AuthProvider>
  );
}
