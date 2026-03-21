"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoCard } from "./video-card";

interface VideoData {
  id: string;
  title: string;
  drive_file_id: string;
  uploader_name: string | null;
  avg_rating: number | null;
  total_votes: number;
  user_rating: number | null;
  user_comment: string | null;
}

export function VideoFeed() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setVideos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Video fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Intersection observer to track active video
  useEffect(() => {
    const container = containerRef.current;
    if (!container || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    container.querySelectorAll("[data-index]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos]);

  const handleRate = useCallback(
    async (videoId: string, score: number) => {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, score }),
      });

      if (res.ok) {
        const data = await res.json();
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? {
                  ...v,
                  user_rating: score,
                  avg_rating: data.avgRating,
                  total_votes: data.totalVotes,
                }
              : v
          )
        );
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="text-white/30 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <div className="text-center text-white/30">
          <p className="text-base">Henüz video yok</p>
          <p className="text-xs mt-1 text-white/20">Admin tarafından video eklenmesini bekleyin</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="snap-container no-scrollbar h-[100dvh] overflow-y-scroll bg-black"
    >
      {videos.map((video, index) => (
        <div key={video.id} data-index={index}>
          <VideoCard
            video={video}
            isActive={Math.abs(activeIndex - index) <= 1}
            onRate={handleRate}
          />
        </div>
      ))}
    </div>
  );
}
