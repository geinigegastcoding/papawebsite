import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512] },
  output: "standalone",
};

export default nextConfig;
