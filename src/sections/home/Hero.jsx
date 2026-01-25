"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LightningEffects from "@/components/LightningEffects";

const Hero = () => {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25, // delay antar gambar
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const imageItem = [
    "/assets/home/scheduler2.png",
    "/assets/home/hdfs3.png",
    "/assets/home/layout1.png",
    "/assets/home/sjnotebook.png",
  ];

  return (
    <>
      <section className="relative h-[110vh] w-full" id="home">
        <div className="relative h-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/assets/home/hero.jpg"
              alt="Home Hero"
              fill
              className="object-cover sm:object-center object-[10%_60%]"
              priority
            />
            {/* optional overlay biar kontras */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <LightningEffects />

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="max-w-6xl mx-auto text-center text-white"
              >
                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold mb-6 leading-tight">
                  We Build, Scale, and Power Big Data Platforms
                </h1>

                {/* Subheading */}
                <p className="text-base sm:text-xl md:text-2xl text-gray-200 mb-10 max-w-5xl mx-auto leading-relaxed tracking-wide">
                  Nawadhya enables organizations to run data-driven applications
                  at scale through reliable PaaS and SaaS solutions built on
                  high performance collaborative framework.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            margin: "-150px", // 🔥 trigger setelah scroll lebih dalam
          }}
          className=" absolute left-0 z-20 -bottom-32 sm:-bottom-48 md:-bottom-64 lg:-bottom-96 xl:-bottom-140 grid grid-cols-2 gap-4 items-start"
        >
          {imageItem.map((src, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Image
                src={src}
                alt="scheduler"
                width={650}
                height={800}
                className={`rotate-[5deg] shadow-2xl rounded-xl pointer-events-none flex-1 w-full ${index > 1 ? "opacity-20" : ""}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
