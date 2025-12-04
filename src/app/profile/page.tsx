"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  avatar_url?: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  video_url: string;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          setError(`Failed to load profile: ${fetchError.message}`);
          return;
        }

        if (data) {
          setProfile(data as Profile);
          setFormData({
            full_name: data.full_name || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Fetch user's videos
  useEffect(() => {
    if (!user || !profile) return;

    const fetchVideos = async () => {
      try {
        setLoadingVideos(true);

        const { data, error: fetchError } = await supabase
          .from("videos")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching videos:", fetchError);
          return;
        }

        if (data) {
          setVideos(data as Video[]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [user, profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setSaveMessage(null);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
        })
        .eq("id", user.id);

      if (updateError) {
        setSaveMessage({
          type: "error",
          text: `Failed to save profile: ${updateError.message}`,
        });
        return;
      }

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: formData.full_name,
              avatar_url: formData.avatar_url,
            }
          : null
      );

      setSaveMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setEditMode(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSaveMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
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
          <p className="text-gray-600 font-semibold">Loading profile...</p>
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
            Please log in to view your profile
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be logged in to access your profile information.
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

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Profile loaded
  if (profile) {
    const createdAt = new Date(profile.created_at);
    const formattedDate = createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const roleBadgeColor =
      profile.role === "creator"
        ? "bg-purple-100 text-purple-800"
        : "bg-blue-100 text-blue-800";

    return (
      <div className="w-full min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {editMode ? (
              // Edit Form
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Avatar URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      saveMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            ) : (
              // Display Profile Info
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <p className="text-gray-900 text-lg">
                    {profile.full_name || "No name set"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 text-lg">{profile.email}</p>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="inline-block">
                    <span
                      className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize ${roleBadgeColor}`}
                    >
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Member Since
                  </label>
                  <p className="text-gray-900 text-lg">{formattedDate}</p>
                </div>

                {/* Avatar URL Display */}
                {profile.avatar_url && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Avatar
                    </label>
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Back to Feed Button */}
            <div className="mt-8">
              <Link
                href="/feed"
                className="block w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Back to Feed
              </Link>
            </div>
          </div>

          {/* My Uploads Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Uploads
            </h2>

            {profile.role === "learner" ? (
              // Learner message
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">
                  You are a learner. Switch to a creator account to upload
                  videos.
                </p>
              </div>
            ) : loadingVideos ? (
              // Loading videos
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
                <p className="text-gray-600">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              // No videos
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">
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
              // Videos List
              <div className="space-y-4">
                {videos.map((video) => {
                  const videoDate = new Date(video.created_at);
                  const formattedVideoDate = videoDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  const levelBadgeColor =
                    video.level === "beginner"
                      ? "bg-green-100 text-green-800"
                      : video.level === "intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800";

                  return (
                    <div
                      key={video.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {video.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {video.topic}
                        </span>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${levelBadgeColor}`}
                        >
                          {video.level}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {formattedVideoDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
