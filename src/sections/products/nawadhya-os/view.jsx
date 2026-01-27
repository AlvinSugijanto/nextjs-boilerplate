"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

import Image from "next/image";
import LightningEffects from "@/components/LightningEffects";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "@/components/Card";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function NawadhyaOSView() {
  return (
    <div
      className={`min-h-screen text-sm transition-colors duration-300 overflow-hidden`}
    >
      <Hero />
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
                {imageItem.map((src) => (
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
              Nawadhya Operating Systems
            </h2>
            <div className="text-sm sm:text-base ">
              Nawadhya OS is a comprehensive, ready-to-deploy solution that
              integrates hardware and software into a single, streamlined
              platform. It unifies hyperconverged capabilities such as compute
              virtualization and distributed storage, while enabling flexible,
              on-demand deployment of applications for cloud management,
              disaster recovery, security, and other critical business
              functions.
              <br />
              <br />
              Equipped with a built-in operations and maintenance platform
              powered by advanced intelligent algorithms, Nawadhya OS is
              designed to support a wide range of deployment scenarios—from core
              data centers to remote branch offices—delivering a solution that
              is converged, intelligent, and highly reliable.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
