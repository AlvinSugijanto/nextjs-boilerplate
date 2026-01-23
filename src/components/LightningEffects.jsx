"use client";
import React from "react";

const LightningEffects = () => {
  return (
    <>
      <div className="absolute inset-0 bg-[#354C64]/55" />

      {/* Green Overlay */}
      <div
        className="absolute -top-[350px] -left-96 w-[1000px] h-[1000px] z-50"
        style={{
          background:
            "radial-gradient(circle, rgba(93,195,174,0.4) 10%, rgba(93,195,174,0) 60%)",
        }}
      />

      {/* Red Overlay */}
      <div
        className="absolute -top-[450px] -right-[500px] w-[1000px] h-[1000px] z-50"
        style={{
          background:
            "radial-gradient(circle, rgba(212,61,80,0.4) 10%, rgba(212,61,80,0) 60%)",
        }}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 z=[50]"
        style={{
          background: `
      linear-gradient(
        to top,
        #354C64 5%,
        transparent 45%,
        transparent 55%,
        #354C64 95%
      )
    `,
        }}
      />
    </>
  );
};

export default LightningEffects;
