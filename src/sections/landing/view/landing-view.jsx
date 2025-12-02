"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  BarChart3,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import ThemeToggle from "@/components/layout/theme-toggle";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Navbar from "../navbar";
import Hero from "../hero";

const randomUsers = [
  "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/49.jpg",
  "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/92.jpg",
  "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/74.jpg",
  "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/8.jpg",
];

export default function LandingView() {
  // hooks
  const router = useRouter();
  const { theme } = useTheme();

  // state
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      if (theme === "system") {
        setIsDark(mediaQuery.matches);
      } else {
        setIsDark(theme === "dark");
      }
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 ${
        isDark
          ? "dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      {/* Navigation */}
      <Navbar isDark={isDark} scrolled={scrolled} />

      {/* Hero Section */}
      <Hero randomUsers={randomUsers} />

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Fitur{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful
              </span>
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola project dengan efisien
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="w-7 h-7" />,
                title: "Multi-Dashboard",
                description:
                  "Dashboard CEO untuk overview semua project dan dashboard detail per project",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                title: "Deadline Tracking",
                description:
                  "Pantau semua deadline dengan notifikasi otomatis dan visual timeline",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: <Activity className="w-7 h-7" />,
                title: "Change Log",
                description:
                  "Catat dan lacak semua perubahan dalam project secara real-time",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "Team Collaboration",
                description:
                  "Kolaborasi tim dengan akses berbeda untuk setiap role",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                title: "Analytics & Reports",
                description:
                  "Insight mendalam dengan grafik dan laporan komprehensif",
                color: "from-orange-500 to-yellow-500",
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Secure & Reliable",
                description:
                  "Data aman dengan backup otomatis dan enkripsi end-to-end",
                color: "from-green-500 to-teal-500",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-16 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Mengapa Tim Memilih ProjectFlow?
              </h2>
              <div className="space-y-4">
                {[
                  "Real-time monitoring untuk semua project",
                  "Interface yang intuitif dan mudah digunakan",
                  "Notifikasi otomatis untuk deadline mendekat",
                  "Log lengkap untuk audit dan tracking",
                  "Mobile responsive untuk akses dimana saja",
                  "Integrasi dengan tools favorit Anda",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="text-white">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-black/40 p-5 space-y-3">
                <div className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Recent Activities
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last 24 hours
                  </span>
                </div>
                {[
                  {
                    action: "Project deadline updated",
                    project: "Website Redesign",
                    time: "2 min ago",
                    icon: Clock,
                    color: "blue",
                  },
                  {
                    action: "New task assigned",
                    project: "Mobile App Dev",
                    time: "15 min ago",
                    icon: Users,
                    color: "green",
                  },
                  {
                    action: "Status changed to Done",
                    project: "Marketing Campaign",
                    time: "1 hour ago",
                    icon: CheckCircle,
                    color: "purple",
                  },
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 bg-${activity.color}-100 dark:bg-${activity.color}-900/30 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <activity.icon
                        className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.project}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Siap Meningkatkan Produktivitas Tim?
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Bergabung dengan ribuan tim yang sudah menggunakan ProjectFlow
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
              Hubungi Sales
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Tidak perlu kartu kredit • Gratis 14 hari • Cancel kapan saja
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">ProjectFlow</span>
              </div>
              <p className="text-gray-400 text-xs">
                Platform manajemen project yang intuitif dan powerful
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Roadmap"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Documentation", "Help Center", "API", "Status"],
              },
            ].map((column, i) => (
              <div key={i} className="space-y-3">
                <h5 className="font-semibold">{column.title}</h5>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors text-xs"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-xs">
            <p>&copy; 2025 ProjectFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
