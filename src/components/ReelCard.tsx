"use client";

import { useRef } from "react";

interface ReelCardProps {
  id: string;
  videoUrl: string;
  title: string;
  creator: string;
  likes: number;
}

export default function ReelCard({
  id,
  videoUrl,
  title,
  creator,
  likes,
}: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse tags from title if they exist (e.g., "React Hooks #react #javascript")
  const hashtagRegex = /#[\w]+/g;
  const tags = title.match(hashtagRegex)?.map((tag) => tag.substring(1)) || [];

  // Clean title by removing hashtags
  const cleanTitle = title.replace(hashtagRegex, "").trim();

  return (
    <div className="w-full h-screen snap-center flex items-center justify-center">
      <div className="rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black flex flex-col overflow-hidden w-full max-w-[430px] h-[90vh]">
        {/* Video Area */}
        <div className="relative w-full aspect-[9/16] bg-black overflow-hidden flex-shrink-0">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            loop
            controls
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-zinc-900/50 to-black overflow-y-auto">
          {/* Title and Creator */}
          <div className="space-y-2 pb-4">
            <h2 className="text-lg font-bold text-white truncate">
              {cleanTitle}
            </h2>
            <p className="text-sm text-gray-400">{creator}</p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-4">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-gray-200 hover:bg-white/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Likes */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-sm font-semibold text-white">
                {likes.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
