"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Profile {
  id: string;
  role: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  creator_id: string;
}

export default function NewMicroCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    level: "beginner",
  });

  // Fetch user profile on mount
  useEffect(() => {
    if (!authLoading && user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            setProfile(data);
          }
        } catch (err) {
          console.error("Unexpected error:", err);
        } finally {
          setProfileLoading(false);
        }
      };

      fetchProfile();
    } else if (!authLoading && !user) {
      setProfileLoading(false);
    }
  }, [user, authLoading]);

  // Fetch creator's videos
  useEffect(() => {
    if (!user || !profile || profile.role !== "creator") return;

    const fetchVideos = async () => {
      try {
        setVideosLoading(true);

        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching videos:", error);
          return;
        }

        if (data) {
          setVideos(data as Video[]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [user, profile]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoToggle = (videoId: string) => {
    setSelectedVideos((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      // Validation
      if (!user) {
        setError("User not authenticated");
        setSubmitting(false);
        return;
      }

      if (!formData.title.trim()) {
        setError("Please enter a course title");
        setSubmitting(false);
        return;
      }

      if (selectedVideos.length === 0) {
        setError("Please select at least one video for the course");
        setSubmitting(false);
        return;
      }

      // Insert micro-course
      const { data: courseData, error: courseError } = await supabase
        .from("micro_courses")
        .insert([
          {
            creator_id: user.id,
            title: formData.title,
            description: formData.description,
            topic: formData.topic,
            level: formData.level,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (courseError) {
        setError(`Failed to create course: ${courseError.message}`);
        setSubmitting(false);
        return;
      }

      if (!courseData) {
        setError("Course creation failed: No data returned");
        setSubmitting(false);
        return;
      }

      // Insert micro-course videos with positions
      const microCourseVideos = selectedVideos.map((videoId, index) => ({
        micro_course_id: courseData.id,
        video_id: videoId,
        position: index + 1,
        created_at: new Date().toISOString(),
      }));

      const { error: videosError } = await supabase
        .from("micro_course_videos")
        .insert(microCourseVideos);

      if (videosError) {
        setError(`Failed to add videos to course: ${videosError.message}`);
        setSubmitting(false);
        return;
      }

      // Success
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        topic: "",
        level: "beginner",
      });
      setSelectedVideos([]);

      // Redirect to micro-courses page after 2 seconds
      setTimeout(() => {
        router.push("/micro-courses");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please log in to create a micro-course
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to create micro-courses.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Not a creator state
  if (profile && profile.role !== "creator") {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Only creators can build micro-courses
          </h1>
          <p className="text-gray-600 mb-8">
            Your account is set as a learner. Please switch to a creator account
            to create micro-courses.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Creator form
  return (
    <div className="w-full min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Micro-Course
          </h1>
          <p className="text-gray-600">
            Combine your videos into a structured learning path
          </p>
        </div>

        {/* Main Layout: Form on left, Videos on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-semibold">
                  ✓ Micro-course created successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Course Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                  placeholder="e.g., React Fundamentals"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none placeholder-gray-500"
                  placeholder="Describe what learners will learn"
                />
              </div>

              {/* Topic */}
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                  placeholder="e.g., Web Development"
                />
              </div>

              {/* Level */}
              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Videos Selected Count */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-semibold">
                  {selectedVideos.length} video(s) selected
                </p>
                {selectedVideos.length === 0 && (
                  <p className="text-blue-700 text-sm mt-1">
                    Select at least one video to create the course
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || success || selectedVideos.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    <span>Creating Course...</span>
                  </>
                ) : success ? (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>Course Created</span>
                  </>
                ) : (
                  <span>Create Micro-Course</span>
                )}
              </button>
            </form>
          </div>

          {/* Videos Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Select Videos
            </h2>

            {videosLoading ? (
              <div className="text-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"
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
                <p className="text-gray-600">Loading your videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">
                  You haven't uploaded any videos yet.
                </p>
                <Link
                  href="/upload"
                  className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Upload Your First Video
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={video.id}
                        checked={selectedVideos.includes(video.id)}
                        onChange={() => handleVideoToggle(video.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={video.id}
                          className="block text-sm font-semibold text-gray-900 cursor-pointer"
                        >
                          {video.title}
                        </label>
                        {video.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {video.topic && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {video.topic}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                              video.level === "beginner"
                                ? "bg-green-100 text-green-800"
                                : video.level === "intermediate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {video.level}
                          </span>
                        </div>
                      </div>
                      {selectedVideos.includes(video.id) && (
                        <div className="text-blue-600 font-semibold text-sm">
                          #{selectedVideos.indexOf(video.id) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
