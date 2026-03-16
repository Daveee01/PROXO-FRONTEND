import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok.io",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;
