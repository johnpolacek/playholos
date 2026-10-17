// Where Earth's leads sit in the sky, for "What doesn't fit?": the three real leads, and every star where any game's
// planet hunters can feel a world by 2040. Catalog stars by Gliese or HIP name from ../data/stars.json (HYG), the rest
// by Gaia id from the census in ../.cache/gcns-100ly.csv (python3 calcs/fetch_hosts.py fetches it). Distances are the
// game's. Writes lib/game/leads.json. Run from game/: node scripts/leads.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const round = (n, k) => +n.toFixed(k);
const key = (s) => s.replace(/\s/g, "");
const catalog = new Map();
for (const s of JSON.parse(readFileSync("../data/stars.json", "utf8")))
  for (const k of [s.gl, s.name, s.hip && `HIP ${s.hip}`]) if (k && !catalog.has(key(k))) catalog.set(key(k), s);
const census = new Map();
const [head, ...rows] = readFileSync("../.cache/gcns-100ly.csv", "utf8").trim().split("\n");
const col = head.split(",");
for (const r of rows) {
  const c = r.split(",");
  census.set(c[col.indexOf("GaiaEDR3")], [+c[col.indexOf("RA_ICRS")] / 15, +c[col.indexOf("DE_ICRS")]]);
}

/** Right ascension in hours, declination in degrees, distance in ly. */
const out = {};
for (const [shown, gl] of [
  ["82 Eridani", "Gl 139"],
  ["Fomalhaut", "Gl 881"],
  ["Luyten's Star", "Gl 273"],
]) {
  const s = catalog.get(key(gl));
  out[shown] = [round(s.ra, 4), round(s.dec, 3), round(s.distance, 2)];
}
const missing = [];
for (const f of readdirSync("data/worlds")) {
  const world = JSON.parse(gunzipSync(readFileSync(`data/worlds/${f}`)).toString("utf8"));
  for (const { star: id } of world.finds) {
    const s = world.stars[id];
    if (out[s.shown]) continue;
    const at =
      census.get(id) ?? (catalog.get(key(s.name)) && [catalog.get(key(s.name)).ra, catalog.get(key(s.name)).dec]);
    if (at) out[s.shown] = [round(at[0], 4), round(at[1], 3), s.d];
    else missing.push(s.shown);
  }
}
writeFileSync("lib/game/leads.json", JSON.stringify(out));
console.log(Object.keys(out).length, "stars", missing.length ? `missing: ${missing.join(", ")}` : "");
