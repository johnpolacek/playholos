// Reach: spreading out into the Galaxy, probes first. At Year 0 there is nothing to send yet, so the tab shows how far
// we have gone and the two roads to the nearest star. Each can be queued before Begin, last in line. One queued is
// dated where the plan has it, and one not yet as if queued now, with this game's thought. Queued, a road can slow
// what is before it: see slows(). Distances at Year 0 are HOLOS_GAME_CONCEPT.md's. Built 2026-10-18.
import { ordersOf, pacedName, schedule } from "./plan";
import type { Plan } from "./types";
import { type Order, pace } from "@/lib/sim/works";

export const LY_AU = 63241;
const AU_KM = 149597870.7;
/** One hour of light, in AU: 499 light-seconds to the AU. */
export const LIGHT_HOUR_AU = 3600 / 499;

/** The near end of the line out: about 15,000 km, Earth up close. */
export const NEAR_AU = 1e-4;

/** From Earth outward: the Moon, the Sun, Neptune, and our farthest craft at Year 0. */
export const MARKS: { name: string; au: number; craft?: boolean }[] = [
  { name: "Earth", au: NEAR_AU },
  { name: "Moon", au: 384400 / AU_KM },
  { name: "Sun", au: 1 },
  { name: "Neptune", au: 30 },
  { name: "New Horizons", au: 100, craft: true },
  { name: "Voyager 1", au: 220, craft: true },
];

/** The nearest star system, as calcs/early_game.py's long roads have it. */
export const NEAREST = { name: "Alpha Centauri", ly: 4.32 };

/** Light-time, for the line's ticks. */
export const LIGHT: [label: string, au: number][] = [
  ["light-second", 1 / 499],
  ["light-minute", 60 / 499],
  ["light-hour", LIGHT_HOUR_AU],
  ["light-day", 24 * LIGHT_HOUR_AU],
  ["light-year", LY_AU],
];

/** The map's zoom, log10 of the km across half its short side, that frames a distance with room to spare. The line
 *  on the page and the map share it, so a place on one is a view on the other. */
export const zoomFor = (au: number) => Math.log10(1.4 * AU_KM * au);
export const auFor = (zoom: number) => 10 ** zoom / (1.4 * AU_KM);

/** Voyager 1 moves out at about 17 km/s, 3.6 AU a Year. */
export const VOYAGER_AU_PER_YEAR = 3.6;

export interface Road {
  name: string;
  /** Its place in our order, from 1, or null while it is not queued. */
  n: number | null;
  /** What we build first, and what flies. */
  build: string;
  craft: string;
  /** The Year the build is done, the craft leaves, it arrives, and its word reaches us. Null past the horizon. */
  done: number | null;
  leaves: number | null;
  arrives: number | null;
  home: number | null;
}

/** Each road where the plan has it, or else begun at Year `from`, last in line.
 *  Sails fly at a fifth of light speed, as Starshot's design. A flyby probe is built 12 Years after the yard, and flies
 *  at an eighth, as Daedalus. Its word comes home at light speed. */
export function roads(plan: Plan, scale: number, from = 0): Road[] {
  const { orders, aside } = ordersOf(plan);
  const doneOf = (work: string) => {
    const more: Order[] = plan.builds.includes(work) ? [] : [{ y: from, begin: pacedName(work) }];
    return pace([...orders, ...more], 200, { scale, aside }).done[pacedName(work)] ?? null;
  };
  const road = (name: string, build: string, craft: string, wait: number, speed: number): Road => {
    const done = doneOf(build);
    const leaves = done === null ? null : done + wait;
    const arrives = leaves === null ? null : leaves + NEAREST.ly / speed;
    const n = plan.builds.indexOf(build) + 1 || null;
    return { name, n, build, craft, done, leaves, arrives, home: arrives === null ? null : arrives + NEAREST.ly };
  };
  return [road("By sail", "Laser Sail Array", "Sails", 0, 0.2), road("By probe", "Probe Yard", "A flyby probe", 12, 1 / 8)];
}

/** The queued build a work slows most, and by how many Years, against the plan without it. Each work in line gets its
 *  want in turn before any is pushed past it, so a work with a large want, even last, takes the push from those before
 *  it. Null when it slows nothing by a tenth of a Year. */
export function slows(plan: Plan, scale: number, work: string): { name: string; by: number } | null {
  const others = plan.builds.filter((b) => b !== work);
  const without = schedule({ ...plan, builds: others }, scale);
  const within = schedule(plan.builds.includes(work) ? plan : { ...plan, builds: [...others, work] }, scale);
  let most: { name: string; by: number } | null = null;
  for (const name of others) {
    const a = without[name], b = within[name];
    if (a === null || b === null) continue;
    if (b - a >= 0.1 && (!most || b - a > most.by)) most = { name, by: b - a };
  }
  return most;
}
