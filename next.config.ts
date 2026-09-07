import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // evita o Next confundir o package-lock.json solto em C:\Users\marke
  turbopack: { root: process.cwd() },
};

export default nextConfig;
