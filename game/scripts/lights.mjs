// Earth's night lights for "Who we are": where the people are, from the atlas's night map (Solar System Scope,
// CC BY 4.0, after NASA's Black Marble). Writes lib/game/lights.json as [lat, lon, brightness 1-9] triples.
// Run from game/: node scripts/lights.mjs
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const W = 720, H = 360, FLOOR = 20;
const { data } = await sharp("../assets/earth_nightmap.jpg").resize(W, H, { kernel: "cubic" }).greyscale().raw().toBuffer({ resolveWithObject: true });
const out = [];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const v = data[y * W + x];
    if (v < FLOOR) continue;
    const lat = 90 - ((y + 0.5) / H) * 180, lon = ((x + 0.5) / W) * 360 - 180;
    out.push([+lat.toFixed(1), +lon.toFixed(1), Math.min(9, 1 + Math.floor(((v - FLOOR) / (255 - FLOOR)) * 9))]);
  }
writeFileSync("lib/game/lights.json", JSON.stringify(out));
console.log(out.length, "lights");
