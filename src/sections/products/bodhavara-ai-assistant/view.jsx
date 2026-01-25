"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductHero from "../ProductHero";

export default function BodhavaraAIAssistantView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <ProductHero
        src="/assets/products/bodhavara-ai-assistant/4.jpg"
        // src="/assets/products/bodhavara-ai-assistant/1 - Copy (2).jpg"
        title="Bodhavara AI Assistant"
        description={
          <div className="flex flex-col gap-4">
            <p>
              Build conversational search applications using retrieval-augmented
              generation (RAG) and intelligent agents, with support for machine
              learning models that improve search accuracy through semantic
              understanding.
            </p>
            <p>
              Models can be deployed directly within your own cluster or
              integrated with models hosted on external platforms, giving you
              full flexibility in how you run and scale your workloads.
            </p>
            <p>
              These models convert text into vector embeddings to enable
              semantic search and also power advanced capabilities such as text
              generation and question answering.
            </p>
          </div>
        }
        imageClass={""}
      />
    </div>
  );
}
