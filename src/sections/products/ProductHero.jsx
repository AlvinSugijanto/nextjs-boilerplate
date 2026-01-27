"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LightningEffects from "@/components/LightningEffects";

const ProductHero = ({
  src,
  header = "Product",
  title,
  description,
  imageClass,
  lightningType = "vertical",
}) => {
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
          <div
            className={`absolute inset-0 ${lightningType === "vertical" ? "z-20" : ""}`}
          >
            <Image
              src={src}
              alt="Home Hero"
              fill
              className={`object-cover  ${imageClass}`}
              priority
            />
            {/* <div className="absolute inset-0 bg-black/50" /> */}
          </div>

          <LightningEffects type={lightningType} />

          {/* Content */}
          <div className="max-w-5xl mx-auto px-6 absolute bottom-2 left-2 md:bottom-4 md:left-4 lg:bottom-8 lg:left-8 text-white z-50">
            <div className="flex flex-col gap-8 mb-16 xs:mb-20">
              <p className="text-lg tracking-[0.3em] uppercase underline underline-offset-8">
                {header}
              </p>
              {title && (
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-semibold ">
                  {title}
                </h2>
              )}
              <div className="text-sm sm:text-base">{description}</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductHero;
