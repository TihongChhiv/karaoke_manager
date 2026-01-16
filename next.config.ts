import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/app/WebDevProject2',
  assetPrefix: '/app/WebDevProject2',

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
