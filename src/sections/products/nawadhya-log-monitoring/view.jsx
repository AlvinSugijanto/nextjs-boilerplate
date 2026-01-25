"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductHero from "../ProductHero";

export default function NawadhyaLogMonitoringView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <ProductHero
        src="/assets/products/nawadhya-log-monitoring/1.jpg"
        title="Nawadhya Log Monitoring"
        description="Nawadhya Log Platform is a powerful log analytics engine powered
                by Elasticsearch, enabling organizations to search, analyze, and
                gain real-time insights from large volumes of log data. Once
                logs are ingested into Elasticsearch, users can perform fast and
                flexible full-text searches with advanced capabilities."
      />
    </div>
  );
}
