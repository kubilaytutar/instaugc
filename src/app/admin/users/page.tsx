"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "subadmin" });
  const [error, setError] = useState("");

  const fetchUsers = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ email: "", password: "", name: "", role: "user" });
      setShowForm(false);
      fetchUsers();
    } else {
      const data = await res.json();
      setError(data.error || "Hata olustu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullaniciyi silmek istediginize emin misiniz?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  if (loading) return <div className="text-zinc-500">Yukleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Kullanicilar</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          {showForm ? "Kapat" : "+ Kullanici Ekle"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-zinc-900 p-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Sifre"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="subadmin">Sub Admin (izler, oylar, video ekler)</option>
            <option value="creator">İçerik Üretici (sadece video ekler)</option>
            <option value="admin">Admin (tam yetki)</option>
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Kaydet
          </button>
        </form>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4"
          >
            <div>
              <p className="font-medium text-white">{user.name}</p>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  user.role === "admin"
                    ? "bg-purple-600/20 text-purple-400"
                    : user.role === "subadmin"
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-emerald-600/20 text-emerald-400"
                }`}
              >
                {user.role === "admin" ? "Admin" : user.role === "subadmin" ? "Sub Admin" : "İçerik Üretici"}
              </span>
              <button
                onClick={() => handleDelete(user.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
