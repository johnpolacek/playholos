import TARGETS from "../../data/targets.json";
import PLACED from "./leads.json";
import { type Lead, skyId, starName } from "./leads";
import { leadsNamed, onMap } from "./named-leads";
import type { Stop } from "@/lib/flight";

// What the map can show of the places our talk names, past our leads, 2026-11-08: any star within 50 ly by name, two
// places side by side when the Will asks about both, and the map's own stops when the Will asks for one, as the
// Milky Way. Read from the words by code, as our leads are, so the map never shows a place no one named.

/** A place on the map: its name as words give it, and where it is, light-years from Sol in the atlas frame. */
export interface Place {
  name: string;
  pos: [number, number, number];
  lead?: Lead;
}

/** Right ascension in hours, declination in degrees, and light-years, to the atlas frame: Galactic X, Galactic Z,
 *  minus Galactic Y, as src/coordinates.js turns them, written out here so the talk needn't load three.js. */
function atlasAt(raH: number, decDeg: number, ly: number): [number, number, number] {
  const ra = (raH * 15 * Math.PI) / 180,
    dec = (decDeg * Math.PI) / 180;
  const [x, y, z] = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  return [
    ly * (-0.0548755604 * x - 0.8734370902 * y - 0.4838350155 * z),
    ly * (-0.867666149 * x - 0.1980763734 * y + 0.4559837762 * z),
    -ly * (0.4941094279 * x - 0.44482963 * y + 0.7469822445 * z),
  ];
}

const plain = (s: string) => s.replace(/[’']/g, "'");
const escaped = (s: string) => plain(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Names too like ordinary words to read as stars. */
const NOT_STARS = new Set(["Gar"]);
/** The stars by the names words give them. A pair's first star stands for both, as "Alpha Centauri". */
const STARS: { name: string; said: string; pos: [number, number, number] }[] = [
  ...TARGETS.filter((t) => !NOT_STARS.has(t.name)).map((t) => ({ name: t.name, said: t.name, pos: atlasAt(t.ra, t.dec, t.d) })),
  ...TARGETS.filter((t) => / A$/.test(t.name)).map((t) => ({ name: t.name.slice(0, -2), said: t.name.slice(0, -2), pos: atlasAt(t.ra, t.dec, t.d) })),
];

/** Where a lead is, or null for one the map has no place for. */
export function leadPos(lead: Lead): [number, number, number] | null {
  const at = (PLACED as unknown as Record<string, [number, number, number]>)[skyId(lead.star)] ?? lead.at;
  return at ? atlasAt(...at) : null;
}

/** Where each name first comes in these words, -1 for not at all. Case counts, so a star named like a word isn't read
 *  in the word. Until `done`, a name at the very end may still be growing, as "Gliese 1" into "Gliese 15". */
const firstAt = (text: string, name: string) => text.search(new RegExp(`(?<![\\w-])${escaped(name)}(?![\\w-]|[,.]?\\d)(?=.)`, "s"));

/** The places named in these words, first named first: our leads the map can show, and the stars within 50 ly. A star
 *  that is also a lead comes as the lead. */
export function placesNamed(words: string, leads: Lead[], done: boolean): Place[] {
  const text = plain(words) + (done ? " " : "");
  const found: { place: Place; at: number }[] = [];
  const named = leadsNamed(words, leads, done).filter(onMap);
  for (const lead of named) {
    const pos = leadPos(lead);
    if (!pos) continue;
    const names = [lead.star, starName(lead.star)].map(plain);
    const at = Math.min(...names.map((n) => firstAt(text, n)).filter((a) => a >= 0), text.length);
    found.push({ place: { name: starName(lead.star), pos, lead }, at });
  }
  const near = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.05;
  for (const s of STARS) {
    const at = firstAt(text, s.said);
    if (at < 0) continue;
    // A lead at the same star, or the same star by its pair's name, is already here.
    if (found.some((f) => near(f.place.pos, s.pos) && (f.place.lead || Math.abs(f.at - at) < s.said.length + 3))) continue;
    found.push({ place: { name: s.name, pos: s.pos }, at });
  }
  // "Alpha Centauri A" is named once, not also as "Alpha Centauri".
  const kept = found.sort((a, b) => a.at - b.at).filter((f, i, all) => !all.some((g, j) => j < i && near(g.place.pos, f.place.pos)));
  return kept.map((f) => f.place);
}

/** The map's stops by the words that ask for them, nearest first, so "the planets past Earth" is the Solar System. */
const STOP_WORDS: [Stop, RegExp][] = [
  ["solar", /\b(solar system|the planets|our planets|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Voyager|Kuiper belt|Oort cloud)\b/i],
  ["stars", /\b(nearby stars|nearest stars|stars near us|our neighborhood|the stars around us)\b/i],
  ["galaxy", /\b(Milky Way|our galaxy|the galaxy|whole galaxy)\b/i],
  ["group", /\b(Andromeda|Local Group|other galaxies|Magellanic|Triangulum)\b/i],
];

/** The stop the Will's words ask for, the first they name, or null. */
export function stopNamed(words: string): Stop | null {
  let best: { stop: Stop; at: number } | null = null;
  for (const [stop, re] of STOP_WORDS) {
    const at = words.search(re);
    if (at >= 0 && (!best || at < best.at)) best = { stop, at };
  }
  return best?.stop ?? null;
}
