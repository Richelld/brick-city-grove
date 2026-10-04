import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Builds a small self-contained server (.next/standalone/server.js) for Azure App Service.
  // The GitHub workflow zips it up and Azure starts it with: node server.js
  output: "standalone",
};

export default nextConfig;
