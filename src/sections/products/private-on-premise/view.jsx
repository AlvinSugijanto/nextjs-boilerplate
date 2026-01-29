"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductHero from "../ProductHero";

export default function PrivateOnPremiseView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <ProductHero
        src="/assets/products/nawadhya-log-monitoring/3.jpg"
        header="Private On-Premise"
        title="Tailored Solutions. Expert Support. Real Results."
        description="We work hand-in-hand with organizations globally to deliver data collection solutions that fit their exact needs. From customized infrastructure and hands-on expert support to focused training and custom feature development, we help teams move faster, operate smarter, and get maximum value from their data."
      />
    </div>
  );
}
