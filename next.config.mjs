/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/**", // allow all paths from jsdelivr
      },
    ],
  },
};

export default nextConfig;
