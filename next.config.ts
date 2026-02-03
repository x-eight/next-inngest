import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "ffmpeg-static": "commonjs ffmpeg-static",
      });
    }
    return config;
  },
  turbopack: {
    // Turbopack handles externals differently, but serverExternalPackages works for both
  },
  serverExternalPackages: ["ffmpeg-static"],
};

export default nextConfig;