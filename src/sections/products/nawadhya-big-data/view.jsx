"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";

export default function NawadhyaBigDataView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <Hero />
      <About />
    </div>
  );
}
