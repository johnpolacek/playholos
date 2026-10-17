import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Mind's route reads the seed's world and the senders' voice banks from disk, and the Earth route the world, so they ship with them.
  outputFileTracingIncludes: {
    "/api/mind": ["./data/worlds/*.json.gz", "./data/reactions.json", "../data/voices/*.json"],
    "/api/earth": ["./data/worlds/*.json.gz"],
  },
  // The game's scene reads the atlas's ephemeris, stars and galaxies from ../src, ../assets and ../data.
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
