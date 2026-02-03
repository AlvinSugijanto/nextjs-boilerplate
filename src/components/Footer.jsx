import React from "react";
import { Logo } from "./logo";
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <section className="bg-primary p-8 sm:p-18">
        <div className="flex xl:flex-row gap-12 xl:gap-24 flex-col justify-between text-gray-200">
          <div className="sm:min-w-xs xl:self-center xs:block hidden">
            <Logo width={300} height={300} className="w-48 sm:w-72 h-auto" />
          </div>
          <div className="flex flex-1 flex-col sm:flex-row xl:justify-center gap-16 lg:gap-36 ">
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">PRODUCT</h2>
              <Link href="/nawadhya-big-data">
                <p>Nawadhya Big Data Platform</p>
              </Link>
              <Link href="/nawadhya-log-monitoring">
                <p>Nawadhya Log Monitoring</p>
              </Link>
              <Link href="/nawadhya-os">
                <p>Nawadhya Operating System</p>
              </Link>
              <Link href="/bodhavara-ai-assistant">
                <p>Bodhavara AI Assistant</p>
              </Link>
              <Link href="/private-on-premise">
                <p>Private On-Premise</p>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">SERVICES</h2>
              <Link href="/services">
                <p>Consultant</p>
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-xl text-white">CONTACT</h2>
              <p>padma.nawadhya@bodha.co.id</p>
              <p>bodha.co.id</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Footer;
