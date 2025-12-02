import React from "react";
import { useRouter } from "next/navigation";

import ThemeToggle from "@/components/layout/theme-toggle";
import { Logo } from "@/components/logo";

export default function Navbar({ scrolled, isDark }) {
  const router = useRouter();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark
            ? "bg-gray-900/80 backdrop-blur-lg shadow-lg shadow-black/20"
            : "bg-white/80 backdrop-blur-lg shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 xl:px-0 py-3 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center space-x-6">
          <a
            href="#features"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#benefits"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Benefits
          </a>
          <a
            href="#pricing"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Pricing
          </a>
          <ThemeToggle />
          <button
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => router.push("/auth/login")}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
