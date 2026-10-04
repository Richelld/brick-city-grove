import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Builds a small self-contained server (.next/standalone/server.js) for Azure App Service.
  // The GitHub workflow zips it up and Azure starts it with: node server.js
  output: "standalone",
  experimental: {
    serverActions: {
      // Business sign-up can include a photo (up to 4 MB, see lib/photos.ts) plus form fields.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
