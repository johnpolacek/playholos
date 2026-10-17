import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The map strip is the atlas's own scene, so the game reads ../src, ../assets and ../data.
  compiler: { define: { __LINE_ART__: "true" } },
  // The Mind's route reads the seed's world and the senders' voice banks from disk, and the Earth route the world, so they ship with them.
  outputFileTracingIncludes: {
    "/api/mind": ["./data/worlds/*.json.gz", "./data/reactions.json", "../data/voices/*.json"],
    "/api/earth": ["./data/worlds/*.json.gz"],
  },
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
