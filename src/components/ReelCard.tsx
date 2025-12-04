"use client";

import { useEffect, useRef, useState } from "react";

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
  const reelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // IntersectionObserver for autoplay/pause
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          // Reel is in viewport - play
          videoRef.current.play().catch(() => {
            // Handle autoplay policy restrictions
            console.log("Autoplay prevented");
          });
          setIsPlaying(true);
        } else {
          // Reel is out of viewport - pause
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of reel is visible
      }
    );

    if (reelRef.current) {
      observer.observe(reelRef.current);
    }

    return () => {
      if (reelRef.current) {
        observer.unobserve(reelRef.current);
      }
    };
  }, []);

  // Handle video metadata and progress tracking
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && duration > 0) {
      const currentProgress = (videoRef.current.currentTime / duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        console.log("Replay prevented");
      });
    }
  };

  return (
    <div
      ref={reelRef}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden snap-center"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        playsInline
        muted
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
      />

      {/* Overlay Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 z-10">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-4">{creator}</p>
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-red-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-white font-semibold">
            {likes.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
          <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
