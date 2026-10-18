import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { appleIcon } from "./app/apple-icon.tsx";
import { card } from "./app/card.tsx";
import { countDoc, renderDoc } from "./lib/about/docs.ts";

// The seeds' worlds are gzipped JSON. Opened as the Worker is built, so it holds them as plain modules.
const worlds: Plugin = {
  name: "holos-worlds",
  async load(id) {
    if (id.endsWith(".json.gz")) return `export default JSON.parse(${JSON.stringify(gunzipSync(await readFile(id)).toString("utf8"))})`;
  },
};

// The about pages' docs: HOLOS_*.md?doc is the doc rendered, and ?stats its counts, both from the markdown at the
// repo root.
const docs: Plugin = {
  name: "holos-docs",
  enforce: "pre",
  async load(id) {
    const [file, query] = id.split("?");
    if (!file.endsWith(".md") || (query !== "doc" && query !== "stats")) return;
    this.addWatchFile(file);
    const markdown = await readFile(file, "utf8");
    if (query === "doc") return `export default ${JSON.stringify(renderDoc(markdown))}`;
    const { sources, sections } = countDoc(markdown);
    return `export const sources = ${sources};\nexport const sections = ${sections};`;
  },
};

// The card a shared link shows and the phone's home screen icon, drawn as the client is built, and by the dev server
// at the same addresses.
const IMAGES: Record<string, () => Promise<Uint8Array>> = { "/og-image.png": card, "/apple-touch-icon.png": appleIcon };
const images: Plugin = {
  name: "holos-images",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const draw = IMAGES[req.url ?? ""];
      if (!draw) return next();
      res.setHeader("Content-Type", "image/png");
      res.end(await draw());
    });
  },
  applyToEnvironment: (environment) => environment.name === "client",
  async generateBundle() {
    for (const [path, draw] of Object.entries(IMAGES)) this.emitFile({ type: "asset", fileName: path.slice(1), source: await draw() });
  },
};

// The client is built to static files, and worker/ is built beside it as the Worker that serves them and the API.
// The game's scene reads the atlas's ephemeris, stars and galaxies from ../src, ../assets and ../data.
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), worlds, docs, images],
  resolve: { alias: { "@": import.meta.dirname } },
  server: { fs: { allow: [".."] } },
});
