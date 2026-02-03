"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductHero from "../products/ProductHero";
import Card from "@/components/Card";
import Image from "next/image";
import { description } from "@/components/chart/pie-donut-chart";
import { Globe, Mail, Phone } from "lucide-react";

export default function ContactView() {
  const cardItem = [
    {
      title: "Proven Expert Team",
      description:
        "Nawadhya is powered by a dedicated team of data technology specialists with deep, hands-on experience across diverse industries and real-world production environments. Our experts bring practical insight from supporting complex use cases at scale",
    },
    {
      title: "Always-On Support",
      description:
        "Nawadhya provides 24x7 technical support delivered by experienced operations teams. With round-the-clock access to expert assistance, organizations can rely on consistent performance, rapid issue resolution, and uninterrupted operations.",
    },
    {
      title: "Deep Operational Experience",
      description:
        "Partnering with Nawadhya means tapping into over 100 million node hours of platform management and operational expertise. This depth of experience ensures stable deployments, optimized performance, and confidence in running mission-critical data workloads.",
    },
  ];

  const approachesItem = [
    {
      title: "Assess",
      description:
        "We help you assess and identify the most suitable data management technologies to effectively bring your ideas to life.",
    },
    {
      title: "Architect",
      description:
        "After establishing the technology foundation, we design scalable data models and efficient processing workflows tailored to your application needs.",
    },
    {
      title: "Implement",
      description:
        "We support the planning and execution of your deployment infrastructure, along with establishing the right operational frameworks and processes.",
    },
    {
      title: "Optimize",
      description:
        "To ensure sustainable operations, we provide guidance on monitoring, maintenance, and best practices that keep your platform running reliably and efficiently.",
    },
    {
      title: "Consulting Engagement Options",
      description:
        "Our consulting team collaborates with customers through flexible delivery models, including fixed-price and time-and-material engagements. We also offer a selection of structured, fixed-price consulting packages with clearly defined scopes, deliverables, and statements of work to ensure transparency and predictable outcomes.",
    },
  ];

  const frameworkItem = [
    {
      title: "Environment Analysis",
      description:
        "Understanding business drivers, technical ecosystems, and organizational goals to define clear collaboration requirements.",
    },
    {
      title: "Framework Readiness Assessment",
      description:
        "Evaluating organizational readiness and maturity using a structured assessment to establish a strong foundation for adoption.",
    },
    {
      title: "Adoption Roadmap & Planning",
      description:
        "Delivering tailored recommendations and a clear, actionable roadmap to ensure sustainable, effective, and scalable implementation.",
    },
  ];

  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <ProductHero
        src="/assets/products/consultation/1.jpg"
        header="Contact"
        title=""
        description={
          <div className="flex flex-col gap-6">
            <p>
              For organizations of any scale,{" "}
              <span>
                <b>PT. Bodha Padma Nawadhya</b>
              </span>{" "}
              provides an integrated platform for deploying, managing, and
              monitoring end-to-end data infrastructure. We help organizations
              reduce operational complexity, allowing teams to focus on building
              innovative, customer-centric solutions that drive measurable
              business impact. For inquiries, partnerships, or further
              information, please contact us through the details below.
            </p>
            <div className="flex gap-2">
              <Mail />
              <p>padma.nawadhya@bodha.co.id</p>
            </div>

            <div className="flex gap-2">
              <Globe />
              <p>bodha.co.id</p>
            </div>
          </div>
        }
        lightningType="horizontal"
      />
    </div>
  );
}
