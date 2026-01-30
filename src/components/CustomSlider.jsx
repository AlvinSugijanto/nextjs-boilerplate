import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";

import "swiper/css";
import "swiper/css/navigation";

const CustomSlider = ({ list }) => {
  return (
    <>
      {/* Swiper Container */}
      <div className="relative">
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          slidesPerView={3}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="benefits-swiper"
        >
          {list.map((item, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="h-full">
                <Card item={item} index={index} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            className="swiper-button-prev-custom w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="swiper-button-next-custom w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .benefits-swiper .swiper-slide {
          height: auto;
          display: flex;
        }

        .benefits-swiper .swiper-slide > div {
          width: 100%;
        }

        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default CustomSlider;
