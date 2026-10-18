// Reach: spreading out into the Galaxy, probes first. At Year 0 there is nothing to send yet, so the tab shows how far
// we have gone and the two roads to the nearest star, each dated as if begun now, last in the line, with this game's
// thought and the plan as it stands. Distances at Year 0 are HOLOS_GAME_CONCEPT.md's. Built 2026-10-18.
import { ordersOf } from "./plan";
import type { Plan } from "./types";
import { type Order, pace } from "@/lib/sim/works";

export const LY_AU = 63241;
/** One hour of light, in AU: 499 light-seconds to the AU. */
export const LIGHT_HOUR_AU = 3600 / 499;

/** Our farthest craft at Year 0, and Neptune for a sense of the Sun's own family. */
export const MARKS: { name: string; au: number; craft?: boolean }[] = [
  { name: "Earth", au: 1 },
  { name: "Neptune", au: 30 },
  { name: "New Horizons", au: 100, craft: true },
  { name: "Voyager 1", au: 220, craft: true },
];

/** The nearest star system, as calcs/early_game.py's long roads have it. */
export const NEAREST = { name: "Alpha Centauri", ly: 4.32 };

/** Light-time from the Sun, for the drawing's ticks. */
export const LIGHT: [label: string, au: number][] = [
  ["light-hour", LIGHT_HOUR_AU],
  ["light-day", 24 * LIGHT_HOUR_AU],
  ["light-month", 30.44 * 24 * LIGHT_HOUR_AU],
  ["light-year", LY_AU],
];

/** Voyager 1 moves out at about 17 km/s, 3.6 AU a Year. */
export const VOYAGER_AU_PER_YEAR = 3.6;

export interface Road {
  name: string;
  /** What we build first, and what flies. */
  build: string;
  craft: string;
  /** The Year the build is done, the craft leaves, it arrives, and its word reaches us. Null past the horizon. */
  done: number | null;
  leaves: number | null;
  arrives: number | null;
  home: number | null;
}

/** Each road begun at Year `from`, alone and last in line, so it never slows what the plan already holds. Sails fly at
 *  a fifth of light speed, as Starshot's design. A flyby probe is built 12 Years after the yard, and flies at an
 *  eighth, as Daedalus. Its word comes home at light speed. */
export function roads(plan: Plan, scale: number, from = 0): Road[] {
  const { orders, aside } = ordersOf(plan);
  const doneOf = (work: string) =>
    pace([...orders, { y: from, begin: work } as Order], 200, { scale, aside })
      .done[work] ?? null;
  const road = (
    name: string,
    build: string,
    craft: string,
    wait: number,
    speed: number,
  ): Road => {
    const done = doneOf(build);
    const leaves = done === null ? null : done + wait;
    const arrives = leaves === null ? null : leaves + NEAREST.ly / speed;
    return {
      name,
      build,
      craft,
      done,
      leaves,
      arrives,
      home: arrives === null ? null : arrives + NEAREST.ly,
    };
  };
  return [
    road("By sail", "Laser sail array", "Sails", 0, 0.2),
    road("By probe", "Probe yard", "A flyby probe", 12, 1 / 8),
  ];
}
