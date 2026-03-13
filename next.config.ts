import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "www.coin-database.com" },
      { protocol: "https", hostname: "www.coindatabase.com" },
    ],
  },
};

export default nextConfig;
