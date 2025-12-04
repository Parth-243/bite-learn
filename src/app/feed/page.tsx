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
          return;
        }

        if (data) {
          setVideos(data as Video[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <svg
              className="animate-spin h-12 w-12 text-white"
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
          </div>
          <p className="text-white text-lg font-semibold">Loading feed…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg font-semibold">
            No videos available yet
          </p>
        </div>
      </div>
    );
  }

  // Feed with reels
  return (
    <div className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {videos.map((video) => (
        <div key={video.id} className="snap-start">
          <ReelCard
            id={video.id}
            videoUrl={video.video_url}
            title={video.title}
            creator="Creator"
            likes={0}
          />
        </div>
      ))}
    </div>
  );
}
