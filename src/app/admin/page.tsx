"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ videos: 0, users: 0, ratings: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/videos").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([videos, users]) => {
      const totalRatings = videos.reduce(
        (acc: number, v: { total_votes: number }) => acc + (v.total_votes || 0),
        0
      );
      const avgScores = videos
        .filter((v: { avg_rating: number | null }) => v.avg_rating !== null)
        .map((v: { avg_rating: number }) => v.avg_rating);
      const overallAvg =
        avgScores.length > 0
          ? (avgScores.reduce((a: number, b: number) => a + b, 0) / avgScores.length).toFixed(1)
          : 0;

      setStats({
        videos: videos.length,
        users: users.length,
        ratings: totalRatings,
        avgScore: Number(overallAvg),
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-zinc-500">Yukleniyor...</div>;

  const cards = [
    { label: "Toplam Video", value: stats.videos, color: "text-purple-400" },
    { label: "Ekip Uyesi", value: stats.users, color: "text-blue-400" },
    { label: "Toplam Oy", value: stats.ratings, color: "text-green-400" },
    { label: "Genel Ortalama", value: stats.avgScore, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-zinc-900 p-4"
          >
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
