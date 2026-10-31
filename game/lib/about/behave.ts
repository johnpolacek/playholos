// How minds behave, on /about/research: how much power an awake mind puts out, how cold it runs, and how many sleep.
// Turned on the dials, drawn on the quiet sky's heat chart, and checked against what our searches would already have
// seen. Holos's marks: Garrett 2026's cold halo, about 10²⁰ W at 12 K, and half asleep, as calcs/minds.py.
import { starsWithin } from "./dials.ts";
import {
  allSkyAbove,
  NEARBY,
  NEARBY_STARS,
  nearbyLeast,
  STARS_PER_MIND,
} from "./haystack.ts";

export interface Behave {
  power: number;
  cold: number;
  asleep: number;
}

export const HOLOS: Behave = { power: 1e20, cold: 12, asleep: 0.5 };

export const RANGES = {
  power: { lo: 2e13, hi: 4e26, left: "EARTH TODAY", right: "A WHOLE STAR" },
  cold: {
    lo: 3,
    hi: 300,
    left: "NEAR THE COLDEST SPACE ALLOWS",
    right: "AS WARM AS OUR COMPUTERS",
  },
  asleep: { lo: 0, hi: 0.99, left: "ALL AWAKE", right: "NEARLY ALL ASLEEP" },
};

// A tiny shared store, so the dials and the heat chart, in different sections, turn together.
let now: Behave = HOLOS;
const heard = new Set<() => void>();
export const behave = {
  get: () => now,
  set: (b: Partial<Behave>) => {
    now = { ...now, ...b };
    heard.forEach((f) => f());
  },
  subscribe: (f: () => void) => {
    heard.add(f);
    return () => heard.delete(f);
  },
};

/** How far a survey would have caught a mind of this power and temperature. Its limits grow as distance squared. */
const reach = (edge: (ly: number) => number, power: number) => {
  const at = edge(10);
  return isFinite(at) ? 10 * Math.sqrt(power / at) : 0;
};

/** How many awake minds our searches would already have seen, on average: the whole-sky maps out to their reach, and
 *  the nearby-star surveys at their few hundred stars. */
export function seen(b: Behave): number {
  const awake = 1 - b.asleep;
  const sky = Math.min(
    1e5,
    reach((ly) => allSkyAbove(b.cold, ly), b.power),
  );
  const near = Math.min(
    NEARBY.ly,
    reach((ly) => nearbyLeast(b.cold, ly), b.power),
  );
  const bySky = (awake * starsWithin(sky)) / STARS_PER_MIND;
  const byNear =
    (awake * NEARBY_STARS * (near / NEARBY.ly) ** 3) / STARS_PER_MIND;
  return bySky + byNear;
}

/** Awake minds within 326 ly for the chart, around the dial's power, a tenfold spread either way. */
export function dots(
  b: Behave,
  n: number,
  rand: () => number,
): { ly: number; w: number }[] {
  const out = [];
  for (let i = 0; i < n; i++) {
    const ly = 10 * (326 / 10) ** (rand() ** 0.33);
    const spread =
      Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
    out.push({ ly, w: b.power * 10 ** (0.5 * spread) });
  }
  return out;
}
