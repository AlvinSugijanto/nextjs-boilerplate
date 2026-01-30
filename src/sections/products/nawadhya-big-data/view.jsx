"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

import Image from "next/image";
import LightningEffects from "@/components/LightningEffects";
import CustomSlider from "@/components/CustomSlider";

export default function NawadhyaBigDataView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <Hero />

      <About />
      <Slider />
    </div>
  );
}

const Hero = () => {
  const imageItem = [
    "/assets/products/nawadhya-big-data/1.png",
    "/assets/products/nawadhya-big-data/2.png",
    "/assets/products/nawadhya-big-data/3.png",
    "/assets/products/nawadhya-big-data/4.png",
    "/assets/products/nawadhya-big-data/5.png",
    "/assets/products/nawadhya-big-data/6.png",
    "/assets/products/nawadhya-big-data/7.png",
  ];

  return (
    <>
      <section className="relative h-[110vh] w-full" id="home">
        <div className="relative h-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 left-48 pointer-events-none">
            {/* Image collage */}
            <div className="relative w-full h-full z-20">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-4 scale-100 rotate-6 ">
                {/* Image 1 */}
                {imageItem.map((src, index) => (
                  <div
                    className="relative w-[600px] h-[300px] overflow-hidden shadow-2xl translate-y-15 "
                    key={src}
                  >
                    <Image
                      src={src}
                      alt="Dashboard 1"
                      fill
                      className="object-fit"
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LightningEffects type={"vertical"} />
        </div>

        {/* content */}
        <div className="max-w-5xl mx-auto px-6 absolute bottom-2 left-2 md:bottom-4 md:left-4 lg:bottom-8 lg:left-8 text-white z-[50]">
          <div className="flex flex-col gap-4 xs:gap-8 mb-16 xs:mb-20">
            <p className="text-lg tracking-[0.3em] uppercase underline underline-offset-8 md:block hidden ">
              PRODUCT
            </p>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-semibold ">
              Nawadhya Big Data Platform
            </h2>
            <div className="text-xs xs:text-sm sm:text-base ">
              The Nawadhya Big Data Platform is an enterprise-scale data
              platform designed to support the storage, processing, and analysis
              of large volumes of data across multiple formats and sources. It
              enables organizations to manage complex, data-intensive workloads
              with high performance, scalability, and operational efficiency.
              <br />
              <br />
              Built on a proven distributed data architecture, the platform
              provides a resilient foundation for analytics, data integration,
              and large-scale data processing. Its modular design allows
              enterprises to scale seamlessly while maintaining reliability,
              governance, and cost control.
              <br />
              <br />
              Nawadhya delivers value through comprehensive platform operations,
              expert technical support, and professional services. Our offerings
              include platform implementation, managed services, training, and
              partner enablement—ensuring long-term stability and continuous
              optimization of enterprise data environments.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const About = () => {
  return (
    <section className="py-24 px-12">
      <div className="flex flex-col lg:flex-row w-full gap-16 items-end">
        <div className="hidden lg:block relative max-w-lg h-160 w-full">
          <Image
            src="/assets/products/nawadhya-big-data/bg.jpg"
            alt="About"
            fill
            className="object-cover rounded-3xl "
            priority
          />

          <div className="absolute inset-0 bg-[rgba(93,195,174,0.25)] rounded-3xl" />
        </div>
        <div className="flex flex-col flex-1 gap-8 text-center lg:text-right">
          <p className="text-2xl tracking-[0.3em] uppercase underline underline-offset-8">
            ABOUT
          </p>
          <p className="text-xl md:text-2xl xl:text-[25px] leading-relaxed">
            Technology moves fast, and building analytics platforms in-house
            takes time and expertise. While analytics and AI promise impact,
            execution is the real challenge.
          </p>

          <p className="text-xl md:text-2xl xl:text-[25px] leading-relaxed">
            The{" "}
            <span className="font-semibold">Nawadhya Big Data Platform</span>{" "}
            removes complexity by delivering a proven, production-ready
            analytics foundation—helping organizations unlock insights faster,
            reduce risk, and turn data into competitive advantage.
          </p>
        </div>
      </div>
    </section>
  );
};

const Slider = () => {
  const benefits = [
    {
      number: "1",
      title: "Advanced Technology",
      description:
        "Nawadhya leverages best-in-class big data technologies combined with continuous innovation from our dedicated R&D team. This ensures a future-ready platform that is reliable, flexible, and aligned with enterprise requirements—while remaining adaptable to local business needs.",
    },
    {
      number: "2",
      title: "Reliability",
      description:
        "Designed and continuously enhanced by Nawadhya's R&D team, the platform is built to meet the operational and regulatory demands of the Indonesian market. Rigorous improvements ensure consistent performance, stability, and long-term reliability for enterprise workloads. This commitment makes the Nawadhya Big Data Platform a trusted solution for organizations that depend on data for critical operations.",
    },
    {
      number: "3",
      title: "Technical Support",
      description:
        "Nawadhya provides expert technical support backed by an experienced R&D and operations team. Our support services are available based on defined service levels, ensuring customers receive timely, reliable assistance whenever and wherever it is needed.",
    },
    {
      number: "4",
      title: "Simple Licensing",
      description:
        "The Nawadhya Big Data Platform delivers a straightforward and transparent licensing model. This simplicity enables organizations to plan costs accurately and scale their data capabilities without unexpected expenses or complex pricing structures.",
    },
  ];

  return (
    <section className="py-24 px-4 xs:px-12">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm tracking-[0.3em] uppercase text-gray-500 mb-4">
          BENEFIT
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
          Benefits of Nawadhya Big Data Platform
        </h2>
      </div>

      <CustomSlider list={benefits} />
    </section>
  );
};
