"use client";

import { useEffect, useState } from "react";
import ReelCard from "@/components/ReelCard";
import { supabase } from "@/lib/supabaseClient";

interface Video {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  tags: string[] | null;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  created_at: string;
  creator_name?: string;
}

export default function Feed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (fetchError) {
          setError(`Failed to load videos: ${fetchError.message}`);
          console.error("Fetch error:", fetchError);
          return;
        }

        if (data) {
          // Fetch creator names for each video
          const videosWithCreators = await Promise.all(
            data.map(async (video: any) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", video.creator_id)
                .single();

              return {
                ...video,
                creator_name: profile?.full_name || "Creator",
              };
            })
          );

          setVideos(videosWithCreators);
          console.log("Videos loaded:", videosWithCreators);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMsg);
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-white mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-300 text-lg font-semibold">Loading feed…</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg font-semibold">
            No videos available yet
          </p>
        </div>
      </main>
    );
  }

  // Feed with reels - Instagram Reels style centered layout
  return (
    <main className="min-h-screen bg-[#050510] text-white flex justify-center">
      <div className="w-full max-w-[430px] px-3 py-4 space-y-4 overflow-y-auto snap-y snap-mandatory">
        {videos.map((video) => (
          <section key={video.id} className="snap-start flex justify-center">
            <ReelCard
              id={video.id}
              videoUrl={video.video_url}
              title={video.title}
              creator={video.creator_name || "Creator"}
              likes={0}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
