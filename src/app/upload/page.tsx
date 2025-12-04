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

export default function Upload() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    level: "beginner",
    tags: "",
    videoFile: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      videoFile: file,
    }));
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

      if (!formData.videoFile) {
        setError("Please select a video file");
        setSubmitting(false);
        return;
      }

      if (!profile || profile.role !== "creator") {
        setError("Only creators can upload videos");
        setSubmitting(false);
        return;
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileName = formData.videoFile.name;
      const filePath = `reels/${user.id}/${timestamp}-${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, formData.videoFile);

      if (uploadError) {
        setError(`Storage upload failed: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      if (!uploadData) {
        setError("Upload failed: No data returned");
        setSubmitting(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      const videoUrl = urlData.publicUrl;

      // Parse tags
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Insert into videos table
      const { error: dbError } = await supabase.from("videos").insert([
        {
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          topic: formData.topic,
          level: formData.level,
          tags: tagsArray,
          video_url: videoUrl,
          thumbnail_url: null, // Can be added later
          duration_seconds: 0, // Can be calculated from video later
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        setError(`Database insert failed: ${dbError.message}`);
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
        tags: "",
        videoFile: null,
      });

      // Redirect to feed after 2 seconds
      setTimeout(() => {
        router.push("/feed");
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
            Please log in to upload content
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to upload videos to BiteLearn.
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
            Only creators can upload videos
          </h1>
          <p className="text-gray-600 mb-8">
            Your account is set as a learner. Please switch to a creator account
            to upload content.
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

  // Creator upload form
  return (
    <div className="w-full min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upload Video
          </h1>
          <p className="text-gray-600">
            Share your knowledge with the BiteLearn community
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-semibold">
                ✓ Video uploaded successfully! Redirecting to feed...
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
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., React Hooks Explained"
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
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Describe what your video is about"
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
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., react, javascript, hooks"
              />
            </div>

            {/* Video File */}
            <div>
              <label
                htmlFor="videoFile"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Video File
              </label>
              <input
                id="videoFile"
                type="file"
                name="videoFile"
                onChange={handleFileChange}
                accept="video/*"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {formData.videoFile && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  Selected: {formData.videoFile.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || success}
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
                  <span>Uploading...</span>
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
                  <span>Upload Complete</span>
                </>
              ) : (
                <span>Upload Video</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
