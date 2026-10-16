import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // The repo root holds the atlas's own lockfile. Widen this when the game imports ../data or ../src.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
