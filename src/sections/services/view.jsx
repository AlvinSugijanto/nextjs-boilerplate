"use client";

import About from "@/sections/home/About";
import Hero from "@/sections/home/Hero";
import React, { useState, useEffect, useRef, useMemo } from "react";
import ProductHero from "../products/ProductHero";
import Card from "@/components/Card";
import Image from "next/image";
import { description } from "@/components/chart/pie-donut-chart";

export default function ServicesView() {
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
        header="Services"
        title="Consultation"
        description="Our consulting team brings deep, hands-on experience in guiding organizations to architect, implement, and run large-scale applications. We help customers build systems designed for global reach, high availability, and consistent performance."
        imageClass={""}
      />

      {/* section 1 */}
      <section className="py-24 px-12">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Dedicated Expert Support
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {cardItem.map((item, index) => (
            <Card item={item} index={index} key={item.title} />
          ))}
        </div>
      </section>

      {/* section 2 */}
      <section className="py-16 px-12 bg-primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 ">
          <div className="flex flex-col gap-8">
            <p className="text-base sm:text-lg tracking-[0.3em] uppercase underline underline-offset-8 text-white">
              Services
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white">
              Our Consulting
              <br />
              <p className="mt-2">Services</p>
            </h1>
          </div>
          <div className="flex flex-col gap-8">
            <h2 className="text-xl sm:text-2xl text-white">
              Big Data Advisory
            </h2>
            <p className="text-sm sm:text-base text-white font-light">
              Our Big Data specialists work closely with organizations to
              support architecture design, system integration, and ongoing
              operations. With hands-on experience deploying complex data
              platforms alongside leading enterprise technologies, we help
              ensure scalable and reliable outcomes.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <h2 className="text-xl sm:text-2xl text-white">
              Search & Analytics Advisory
            </h2>
            <p className="text-sm sm:text-base text-white font-light">
              Our search and analytics experts provide guidance across solution
              design, integration, and operational execution. Drawing on
              extensive real-world implementation experience, we help
              organizations deploy and operate search and analytics platforms
              with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* section 3 */}
      <section className="py-24 px-12">
        <div className="flex flex-col gap-6">
          <p className="text-lg tracking-[0.3em] uppercase underline underline-offset-8 ">
            APPROACH
          </p>
          <h1 className="text-3xl font-semibold ">Our Approaches</h1>
        </div>
        <div className="flex flex-col lg:flex-row w-full mt-8 gap-16">
          <div className="hidden lg:block relative max-w-xl h-180 w-full">
            <Image
              src="/assets/services/2.jpg"
              alt="Our Approaches"
              fill
              className="object-cover rounded-3xl "
              priority
            />

            <div className="absolute inset-0 bg-[rgba(93,195,174,0.25)] rounded-3xl" />
          </div>
          <div className="flex flex-col flex-1 gap-8">
            {approachesItem.map((item, index) => (
              <div className="flex gap-4 mt-4 items-start" key={item.title}>
                <div className="h-10 w-10 shrink-0 rounded-full border border-[#354C64] flex items-center justify-center text-lg font-medium">
                  {index + 1}
                </div>
                <div className="flex flex-col gap-4 mt-1">
                  <h2 className="text-2xl font-semibold ">{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* section 4 */}
      <section className="pb-12 px-12">
        <div className="bg-[#E4F0FF] rounded-xl p-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-semibold text-center mb-8">
              High-Performance Collaborative Framework
            </h1>
            <p className="text-sm sm:text-base text-center mb-2">
              Choosing a high-performance collaborative framework is a bold,
              future-ready move—but executing it effectively requires clarity
              and the right strategy. Nawadhya works closely with organizations
              to define the optimal collaboration framework, support confident
              decision-making, and clearly communicate its business value to
              executive leadership.
            </p>
            <p className="text-sm sm:text-base text-center">
              High-performance collaborative frameworks bring powerful
              advantages, including cost efficiency, accelerated innovation,
              seamless cross-team collaboration, and enterprise-grade
              capabilities such as scalability, performance, security,
              reliability, and ease of management. These strengths enable
              organizations to move faster, work smarter, and scale with
              confidence across diverse use cases.
            </p>
          </div>
          <div className="h-0.5 bg-gray-400 max-w-[50%] mx-auto my-12"></div>
          <div className="flex flex-col lg:flex-row items-start gap-20">
            <h1 className="text-xl sm:text-2xl font-medium leading-relaxed tracking-wide">
              Our high-performance collaborative
              <br />
              framework strategy engagements
              <br />
              typically include:
            </h1>
            <div className="flex-1 flex-col gap-8 flex">
              {frameworkItem.map((item) => (
                <div key={item.title}>
                  <h3 className="text-lg sm:text-xl font-medium mb-4">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* section 4 */}
    </div>
  );
}
