"use client";

import { Activity } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Logo = ({ width = 200, height = 200, ...props }) => {
  const router = useRouter();

  return (
    <Image
      {...props}
      src={"/logo/logo.png"}
      width={width}
      height={height}
      onClick={() => router.push("/")}
      alt="Logo"
    />
  );
};

export default Logo;
