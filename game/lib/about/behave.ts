// How minds behave, on /about/research: how much power an awake mind puts out, how cold it runs, and how many sleep.
// Turned on the dials, drawn on the quiet sky's heat chart, and checked against what our searches would already have
// seen. Holos's marks are the game's own: its awake old minds glow about 4 × 10²¹ W at the median, middle two thirds
// 10¹⁹ to 4 × 10²⁴ W, over the 33 pool seeds, at 12 K, half asleep, as calcs/minds.py. At those marks the chart draws
// them by the game's rule.
import { starsWithin } from "./dials.ts";
import {
  allSkyAbove,
  NEARBY,
  NEARBY_STARS,
  nearbyLeast,
  STARS_PER_MIND,
} from "./haystack.ts";

/** How many of the stars within 20 ly the nearby-star surveys checked: 57 of 76 named ones (checked.json). Beyond,
 *  the rest of their 580 spread over about 40,000 stars, so at least this share, likely more out to 50 ly. */
const NEAR_SHARE = 57 / 76;
const FAR_SHARE = (NEARBY_STARS - 57) / 40000;

export interface Behave {
  power: number;
  cold: number;
  asleep: number;
}

export const HOLOS: Behave = { power: 4e21, cold: 12, asleep: 0.5 };

export const isHolos = (b: Behave) =>
  b.power === HOLOS.power && b.cold === HOLOS.cold && b.asleep === HOLOS.asleep;

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
 *  the nearby-star surveys at the stars they checked, most within 20 ly and a few beyond. */
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
  const inner = starsWithin(Math.min(near, 20)),
    outer = Math.max(0, starsWithin(near) - starsWithin(20));
  const bySky = (awake * starsWithin(sky)) / STARS_PER_MIND;
  const byNear =
    (awake * (inner * NEAR_SHARE + outer * FAR_SHARE)) / STARS_PER_MIND;
  return bySky + byNear;
}

/** What the all-sky maps would have caught 400 ly away, as calcs/minds.py's ALL_SKY_W. */
const ALL_SKY_W = 2.7e26;

/** Awake minds within 326 ly for the chart. At Holos's marks, by the game's rule: each glows log-evenly up to what
 *  our maps would have caught at its distance, the nearby-star surveys' limit within 150 ly, checked star or not.
 *  Otherwise around the dial's power, a tenfold spread either way. */
export function dots(
  b: Behave,
  n: number,
  rand: () => number,
): { ly: number; w: number }[] {
  const out = [];
  for (let i = 0; i < n; i++) {
    const ly = 10 * (326 / 10) ** (rand() ** 0.33);
    if (isHolos(b)) {
      let limit = ALL_SKY_W * (ly / 400) ** 2;
      if (ly <= NEARBY.ly)
        limit = Math.min(limit, NEARBY.w * (ly / NEARBY.at) ** 2);
      const lo = Math.min(1e18, limit / 2);
      out.push({ ly, w: lo * (limit / lo) ** rand() });
      continue;
    }
    const spread =
      Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
    out.push({ ly, w: b.power * 10 ** (0.5 * spread) });
  }
  return out;
}
