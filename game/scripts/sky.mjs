// The sky around Sol for "Where things stand": every catalog star within 50 ly, by right ascension and distance, and
// the twelve stars Earth sent messages to. From ../data/stars.json (HYG and Gaia, see data/HYG-LICENSE.txt).
// Writes lib/game/sky.json. Run from game/: node scripts/sky.mjs
import { readFileSync, writeFileSync } from "node:fs";

const stars = JSON.parse(readFileSync("../data/stars.json", "utf8"));
const near = stars.filter((s) => s.distance <= 50 && s.distance > 0.1);
const round = (n, k) => +n.toFixed(k);

// Earth's message targets, as calcs/knocks.py names them, matched to the catalog by Gliese number.
// Two are missing from it: their positions are SIMBAD's.
const GL = {
  Altair: "Gl 768", "47 Ursae Majoris": "Gl 407", "Gliese 49": "Gl 49", "Gliese 208": "Gl 208", "55 Cancri": "Gl 324A",
  "Gliese 581": "Gl 581", "TZ Arietis": "Gl 83.1", "Kappa¹ Ceti": "Gl 137", "Gliese 526": "Gl 526", "Luyten's Star": "Gl 273",
};
const SIMBAD = { "HD 10307": [1.6964, 41.55], "Teegarden's Star": [2.8836, 12.5] };
const targets = {};
for (const [name, gl] of Object.entries(GL)) {
  const s = stars.find((x) => x.gl === gl);
  targets[name] = [round(s.ra, 4), round(s.distance, 2)];
}
Object.assign(targets, SIMBAD);

writeFileSync(
  "lib/game/sky.json",
  JSON.stringify({ stars: near.map((s) => [round(s.ra, 3), round(s.distance, 2), round(s.mag, 1)]), targets }),
);
console.log(near.length, "stars,", Object.keys(targets).length, "targets");
