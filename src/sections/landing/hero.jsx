import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, Play } from "lucide-react";
import { BarChartComponents } from "@/components/chart";
import MiniMultiBarChart from "@/components/chart/mini-multi-bar-chart";
import ClientOnly from "@/components/client-only";

const sampleData = [
  { name: "Project A", budget: 4000, actual: 2400 },
  { name: "Project B", budget: 3000, actual: 1398 },
  { name: "Project C", budget: 2000, actual: 9800 },
  { name: "Project D", budget: 2780, actual: 3908 },
];

const series = [
  { key: "budget", color: "#2563eb" },
  { key: "actual", color: "#22c55e" },
];

export default function Hero({ randomUsers = [] }) {
  const router = useRouter();
  return (
    <section className="pt-28 pb-16 px-6 min-h-[70vh] flex flex-col justify-center items-center">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                🚀 Manage Projects Better
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Track Every
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Deadline
              </span>
              <br />
              With Confidence
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Dashboard intuitif untuk memantau semua project, deadline, dan
              perubahan dalam satu platform. User-friendly dan powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                onClick={() => router.push("/auth/login")}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center space-x-6 pt-3">
              <div className="flex -space-x-2">
                {randomUsers.map((user, i) => (
                  <div
                    key={user}
                    className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white dark:border-gray-900"
                  >
                    <img
                      src={user}
                      alt={`user avatar ${i}`}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <span className="text-white text-[8px] font-medium">
                    999+
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-bold text-gray-900 dark:text-white">
                    10,000+
                  </span>{" "}
                  teams already using
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-3xl opacity-20 animate-pulse" />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-black/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Dashboard Overview
                </h3>
                <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                  Live
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Active Projects",
                    value: "45",
                    trend: "+12%",
                    color: "#3B82F6", // blue
                  },
                  {
                    label: "On Track",
                    value: "38",
                    trend: "+8%",
                    color: "#6366F1", // indigo
                  },
                  {
                    label: "At Risk",
                    value: "7",
                    trend: "-5%",
                    color: "#8B5CF6", // violet
                  },
                  {
                    label: "Upcoming",
                    value: "14",
                    trend: "+3%",
                    color: "#06B6D4", // cyan
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 space-y-1.5"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{
                        color: stat.color,
                      }}
                    >
                      {stat.trend}
                    </p>
                  </div>
                ))}
              </div>
              <div className="h-48 w-full rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3">
                <ClientOnly>
                  <div className="w-full h-full">
                    <MiniMultiBarChart
                      data={sampleData}
                      series={series}
                      height={160}
                    />
                  </div>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
