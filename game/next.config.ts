import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The map strip is the atlas's own scene, so the game reads ../src, ../assets and ../data.
  compiler: { define: { __LINE_ART__: "true" } },
  turbopack: {
    root: path.join(__dirname, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
