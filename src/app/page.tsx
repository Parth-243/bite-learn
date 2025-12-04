"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
          <span className="text-sm font-semibold text-blue-700">
            ✨ The Future of Learning
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 leading-tight">
          Learn Anything <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            in 60 Seconds
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed">
          Welcome to BiteLearn, the reels-based microlearning platform where
          knowledge is bite-sized, engaging, and instantly actionable. Learn
          complex topics in short, digestible videos.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Link
            href="/learn"
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            I'm a Learner
          </Link>
          <Link
            href="/create"
            className="px-8 py-4 text-lg font-semibold text-blue-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            I'm a Creator
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 pt-16 w-full max-w-2xl">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">1M+</p>
            <p className="text-gray-600 text-sm mt-2">Active Learners</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">50K+</p>
            <p className="text-gray-600 text-sm mt-2">Video Lessons</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">100%</p>
            <p className="text-gray-600 text-sm mt-2">Free to Use</p>
          </div>
        </div>
      </div>
    </div>
  );
}
