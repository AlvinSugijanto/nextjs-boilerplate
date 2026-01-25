"use client";
import Card from "@/components/Card";
import React from "react";

const About = () => {
  const cardItem = [
    {
      title: "Future-Proof Architecture",
      description:
        "Nawadhya is built entirely on high performance collaborative framework, ensuring strategic independence from vendor lock-in. This approach enables organizations to scale sustainably, control long-term costs, and adapt quickly to evolving data and business requirements.",
    },
    {
      title: "Local Execution, Enterprise Assurance",
      description:
        "With product development and 24x7 operational support based in Indonesia, Nawadhya delivers enterprise-grade reliability with local accountability. Our teams provide continuous platform availability, risk mitigation, and operational continuity for mission-critical data workloads.",
    },
    {
      title: "Unified Multi-Technology Data Platform",
      description:
        "Nawadhya offers a unified platform that integrates multiple Big Data technologies to support the full data lifecycle. From ingestion to analytics, we enable faster time-to-value while maintaining governance, performance, and service consistency at scale.",
    },
  ];

  return (
    <>
      {/* ABOUT SECTION */}
      <section className="py-16">
        <div className="relative z-50 max-w-5xl px-4 sm:px-16 mx-auto pt-8 sm:pt-16 md:pt-32 lg:pt-64 xl:pt-80 text-center">
          <p className="text-3xl tracking-[0.2em] underline underline-offset-8 font-light">
            ABOUT
          </p>

          <h2 className="mt-16 text-2xl md:text-3xl xl:text-5xl font-semibold">
            What We Do?
          </h2>

          <p className="mt-8 text-lg">
            Nawadhya enables organizations to operate scalable and secure high
            performance collaborative framework Big Data platforms through
            enterprise-ready SaaS solutions.
          </p>

          <p className="mt-8 text-lg">
            With deep domain expertise and 24x7 local operational support,
            Nawadhya ensures the reliability, performance, and continuity of Big
            Data platforms across the enterprise.
          </p>
        </div>
      </section>

      {/* WHY NAWADHYA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="mb-8 sm:mb-20">
            <p className="text-sm tracking-[0.3em] uppercase text-gray-500">
              Why Nawadhya?
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-semibold ">
              Strategic Differentiation
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {cardItem.map((item, index) => (
              <Card item={item} index={index} key={item.title} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
