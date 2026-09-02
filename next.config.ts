import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.31.174"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
