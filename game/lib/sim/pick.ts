// Simulation mode's systems you can tap, on the dials stop: each natural warm world and each old mind within 326 ly.
// A first tap flies to it, a second opens what we know of it, kept apart: what is measured, and what the dials drew.
// Pure, from the draw. 2026-11-02.
import { far, round } from "@/lib/about/dials";
import { skyBasis } from "../../../src/coordinates.js";
import { RUNGS, type NaturalWorld } from "./draw-worlds.ts";
import type { DrawnMinds } from "./draw-minds.ts";

type Vec = [number, number, number];
const PC_LY = 3.2616;

export interface Pickable {
  id: string;
  pos: Vec;
  d: number;
  /** Its name on the map. */
  title: string;
  /** What is measured, and what the dials drew, as lines. */
  real: string[];
  drawn: string[];
}

const KIND: Record<string, string> = {
  M: "a red dwarf",
  K: "an orange K-type star",
  G: "a yellow G-type star, like the Sun",
  F: "a white F-type star",
  A: "a white A-type star",
};

/** What Gaia's magnitude and color say a star is, roughly: its color, and a white dwarf where it is faint for one. */
function starKind(mag: number, bv: number, ly: number): string {
  if (!Number.isFinite(bv)) return "a star";
  const abs = mag - 5 * Math.log10(ly / PC_LY) + 5;
  if (abs > 9.5 && bv < 0.6) return "a white dwarf, the cooled core of a dead star";
  return bv < 0.3 ? "a hot white star" : bv < 0.6 ? "a white F-type star" : bv < 0.82 ? "a yellow G-type star, like the Sun" : bv < 1.4 ? "an orange K-type star" : "a red dwarf";
}
const eye = (mag: number) => (mag < 6 ? "Bright enough to see without a telescope." : "Too faint to see without a telescope.");
const gyr = (g: number) => `${g.toFixed(1)} billion years`;

const LIFE: Record<string, string> = {
  [RUNGS[0]]: "Bare rock: its star stripped its air away.",
  [RUNGS[1]]: "It kept its air, but life never started.",
  [RUNGS[2]]: "Life holds on, as microbes hidden from view.",
  [RUNGS[3]]: "Life has filled its air with oxygen, which a big enough telescope could read.",
  [RUNGS[4]]: "Animals and forests.",
  [RUNGS[5]]: "Life began there, and died.",
  [RUNGS[6]]: "Born too far out, it is still frozen.",
};

export function pickablesOf(m: DrawnMinds, worlds: NaturalWorld[], names: Record<string, string>, starOf: Record<string, { mag: number; bv: number }>): Pickable[] {
  const out: Pickable[] = [];
  for (const w of worlds) {
    const r = skyBasis(w.ra * 15, w.dec).radial.multiplyScalar(w.d);
    out.push({
      id: `world-${w.star}`,
      pos: [r.x, r.y, r.z],
      d: w.d,
      title: w.name,
      real: [
        `${w.name}, ${far(w.d)} away.`,
        `${KIND[w.kind] ?? "A star"}, ${w.lum < 0.01 ? w.lum.toPrecision(1) : w.lum.toPrecision(2)} times the Sun’s light.`.replace(/^./, (c) => c.toUpperCase()),
        w.agePublished ? `About ${gyr(w.age)} old, by ${w.ageBy}.` : "Its age is not yet measured.",
        w.planets ? `${w.planets} known ${w.planets === 1 ? "planet" : "planets"}.` : "No planets known yet.",
      ],
      drawn: [
        `A rocky world ${w.radius.toFixed(1)} times Earth’s width, ${w.a.toPrecision(2)} AU from its star, in its warm zone.`,
        LIFE[w.rung] ?? w.rung,
        ...(w.agePublished ? [] : [`Its star drawn ${gyr(w.age)} old.`]),
        "Too small and dim for any telescope we have to see.",
      ],
    });
  }
  for (const o of m.old) {
    if (o.d > 326) continue;
    const s = starOf[o.id];
    const name = names[o.id];
    const maker = m.watcher.maker === o.id;
    out.push({
      id: o.id,
      pos: o.pos,
      d: o.d,
      title: name ?? `${round(o.d)} ly`,
      real: [
        `${name ? `${name}, ` : "A star "}${far(o.d)} away, in Gaia’s census.`,
        ...(s ? [`${starKind(s.mag, s.bv, o.d).replace(/^./, (c) => c.toUpperCase())}.`, eye(s.mag)] : []),
      ],
      drawn: [
        `A mind woke here ${round(o.age)} years before us.`,
        o.asleep
          ? `It sleeps, folded small in the cold ${round(o.restAU ?? 0)} AU from its star.`
          : `Awake, its warm glow of ${o.glowW?.toPrecision(2)} watts stays under what our sky surveys can catch.`,
        ...(maker ? [`It sent the watcher that waits near Earth, at ${m.watcher.place}.`] : []),
      ],
    });
  }
  return out;
}
