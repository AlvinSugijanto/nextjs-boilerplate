"use client";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LightningEffects from "@/components/LightningEffects";

const Hero = () => {
  return (
    <>
      <section className="relative h-screen w-full" id="home">
        {/* ⭐ overflow-hidden HANYA untuk background & content */}
        <div className="relative h-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/assets/home/hero.jpg"
              alt="BMW Hero"
              fill
              className="object-cover sm:object-center object-[10%_60%]"
              priority
            />
            {/* optional overlay biar kontras */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <LightningEffects />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center mt-8">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="max-w-6xl mx-auto text-center text-white"
              >
                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold mb-6 leading-tight">
                  We Build, Scale, and Power Big Data Platforms
                </h1>

                {/* Subheading */}
                <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto">
                  Nawadhya enables organizations to run data-driven applications
                  at scale through reliable PaaS and SaaS solutions built on
                  high performance collaborative framework.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
        </div>

        {/* ⭐ INI KUNCI: gambar diletakkan DI LUAR overflow-hidden */}
        <div className="absolute -bottom-64 left-0 z-20 flex items-center justify-center gap-8">
          <Image
            src="/assets/home/scheduler2.png"
            alt="scheduler"
            width={650}
            height={650}
            className="rotate-[4deg] shadow-2xl rounded-xl pointer-events-none flex-1 w-full "
          />
          <Image
            src="/assets/home/scheduler2.png"
            alt="scheduler"
            width={650}
            height={650}
            className="rotate-[4deg] shadow-2xl rounded-xl pointer-events-none flex-1 w-full mt-48"
          />
        </div>
      </section>
    </>
  );
};

export default Hero;
