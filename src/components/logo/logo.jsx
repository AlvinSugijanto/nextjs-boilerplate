"use client";

import { Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Logo = ({ width = 200, height = 200, ...props }) => {
  const router = useRouter();

  return (
    <Link href={"/"}>
      <Image
        {...props}
        src={"/logo/logo.png"}
        width={width}
        height={height}
        style={{
          cursor: "pointer",
        }}
        alt="Logo"
      />
    </Link>
  );
};

export default Logo;
