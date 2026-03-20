"use client";

import { useState, useCallback } from "react";

interface RatingButtonsProps {
  videoId: string;
  initialScore: number | null;
  avgRating: number | null;
  totalVotes: number;
  onRate: (videoId: string, score: number) => void;
}

export function RatingButtons({
  videoId,
  initialScore,
  avgRating,
  totalVotes,
  onRate,
}: RatingButtonsProps) {
  const [selected, setSelected] = useState<number | null>(initialScore);

  const handleRate = useCallback(
    (score: number) => {
      setSelected(score);
      onRate(videoId, score);
    },
    [videoId, onRate]
  );

  return (
    <div className="space-y-2">
      {/* Stats */}
      <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
        <span>
          {avgRating !== null ? `Ortalama: ${avgRating}` : "Henuz oy yok"}
        </span>
        <span>{totalVotes} oy</span>
      </div>

      {/* Rating buttons */}
      <div className="flex justify-between gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <button
            key={score}
            onClick={() => handleRate(score)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all active:scale-90 ${
              selected === score
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );
}
