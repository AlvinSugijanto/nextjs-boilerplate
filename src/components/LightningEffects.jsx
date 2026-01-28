"use client";
import React from "react";

const LightningEffects = ({ type }) => {
  if (type === "horizontal") {
    return (
      <>
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
          className="absolute inset-0"
          style={{
            background: `
        linear-gradient(
          to top,
          #354C64 0%,
          transparent 50%,
          #354C64 100%
        )
      `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
        linear-gradient(
          to top,
          #354C64 0%,
          transparent 40%,
          transparent 60%,
          #354C64 100%
        )
      `,
          }}
        />

        <div className="absolute inset-0 bg-[#354C64]/50" />
      </>
    );
  } else {
    return (
      <>
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

        {/* antara ini */}
        {/* base background color */}
        <div className="absolute inset-0 bg-primary z-10" />

        <div
          className="absolute inset-0 bg-gradient-to-tr 
  from-primary from-[40%] 
  to-transparent to-[100%] 
  z-20"
        />

        {/* atau ini */}

        {/* <div
          className="absolute inset-0 bg-gradient-to-r 
  from-primary from-[40%] 
  to-transparent to-[100%] 
  z-20"
        />

        <div
          className="absolute inset-0 bg-gradient-to-t 
  from-primary from-[0%] 
  to-transparent to-[25%] 
  z-20"
        /> */}
      </>
    );
  }
};

export default LightningEffects;
