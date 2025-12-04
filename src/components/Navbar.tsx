"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: App Name */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-blue-600 transition-all duration-200">
              BiteLearn
            </h1>
          </Link>

          {/* Right: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {!loading && !user ? (
              <>
                {/* Not logged in */}
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Home
                </Link>
                <Link
                  href="/feed"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Feed
                </Link>
              </>
            ) : (
              <>
                {/* Logged in */}
                <Link
                  href="/feed"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Feed
                </Link>
                <Link
                  href="/upload"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Right: Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!loading && !user ? (
              <>
                {/* Not logged in */}
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Logged in */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                >
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
