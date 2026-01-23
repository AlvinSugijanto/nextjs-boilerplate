"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

import Navbar from "../../../components/Navbar";
import { Logo } from "@/components/logo";
import { useTheme } from "next-themes";
import ClientOnly from "@/components/client-only";
import Hero from "../Hero";
import About from "../About";

export default function LandingView() {
  const { resolvedTheme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);

  const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

  return (
    <ClientOnly>
      <div className={`min-h-screen text-sm transition-colors duration-300 `}>
        <Hero />
        <About />
      </div>
    </ClientOnly>
  );
}
