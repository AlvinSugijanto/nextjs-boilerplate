import React from "react";
import { Logo } from "./logo";

const Footer = () => {
  return (
    <>
      <section className="bg-primary p-8 sm:p-18">
        <div className="flex xl:flex-row gap-12 xl:gap-24 flex-col justify-between text-gray-200">
          <div className="sm:min-w-xs xl:self-center">
            <Logo width={300} height={300} className="w-48 sm:w-72 h-auto" />
          </div>
          <div className="flex flex-1 flex-col sm:flex-row xl:justify-center gap-16 lg:gap-36 ">
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">PRODUCT</h2>
              <p className="text-gray-200">Nawadhya Big Data Platform</p>
              <p>Nawadhya Log Monitoring</p>
              <p>Nawadhya Operating System</p>
              <p>Bodhavara AI Assistant</p>
              <p>Private On-Premise</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">SERVICES</h2>
              <p>Consultant</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">CONTACT</h2>
              <p>amir@bodha.co.id</p>
              <p>+62 821-2256-0783</p>
              <p>bodha.co.id</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Footer;
