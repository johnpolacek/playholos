// Reach: spreading out into the Galaxy, probes first. At Year 0 there is nothing to send yet, so the tab shows how far
// we have gone and the two roads to the nearest star. Each can be queued before Begin, last in line. One queued is
// dated where the plan has it, and one not yet as if queued now, with this game's compute. Queued, a road can slow
// what is before it: see moves() in plan.ts. Distances at Year 0 are HOLOS_GAME_CONCEPT.md's. Built 2026-10-18.
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

/** Where the two roads go: Proxima Centauri, the nearest star, for the world next door that no telescope we have can
 *  read. At Gaia's distance. Until 2026-10-19 they went to Alpha Centauri at calcs/early_game.py's 4.32 light-years. */
export const NEAREST = { name: "Proxima Centauri", ly: 4.24 };

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

export interface Road {
  name: string;
  /** Its place in our order, from 1, or null while it is not queued. */
  n: number | null;
  /** What we build first, and what flies. */
  build: string;
  craft: string;
  /** Its speed, as a share of light's. */
  speed: number;
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
  const { orders, ...opts } = ordersOf(plan);
  const doneOf = (work: string) => {
    const more: Order[] = plan.builds.includes(work) ? [] : [{ y: from, begin: pacedName(work) }];
    return pace([...orders, ...more], 200, { scale, ...opts }).done[pacedName(work)] ?? null;
  };
  const road = (name: string, build: string, craft: string, wait: number, speed: number): Road => {
    const done = doneOf(build);
    const leaves = done === null ? null : done + wait;
    const arrives = leaves === null ? null : leaves + NEAREST.ly / speed;
    const n = plan.builds.indexOf(build) + 1 || null;
    return { name, n, build, craft, speed, done, leaves, arrives, home: arrives === null ? null : arrives + NEAREST.ly };
  };
  return [road("By sail", "Laser Sail Array", "Sails", 0, 0.2), road("By probe", "Probe Yard", "A flyby probe", 12, 1 / 8)];
}

/** What our order has built to learn with, as the knowledge wall takes it: the Year each watch and telescope is done,
 *  the 15 m Mirror since 2026-10-23, and for each road to Proxima b that we fly, the Year it passes and the Year its
 *  word reaches us. 2026-10-22. */
export function kitOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const fly = (r: Road) => (r.n !== null && r.arrives !== null && r.home !== null ? { passed: r.arrives, home: r.home } : null);
  const [sails, probe] = roads(plan, scale);
  return {
    allSky: done["All-Sky Watch"],
    flash: done["Deep Flash Watch"],
    telescope: done["Infrared Telescope"],
    mirror: done["15 m Mirror"] ?? null,
    sails: fly(sails),
    probe: fly(probe),
  };
}

/** A road toward a star `ly` away: the build and the wait are the same, the flight and the word home are its own. */
export function toward(road: Road, ly: number): Road {
  const arrives = road.leaves === null ? null : road.leaves + ly / road.speed;
  return { ...road, arrives, home: arrives === null ? null : arrives + ly };
}

/** A way to go that waits on builds beyond the two roads: what it is, and the builds it needs, by name, each a link to
 *  its page to start it. Sources in HOLOS_RESEARCH.md, "Classic propulsion studies" and "Solar gravitational lens
 *  mission", and HOLOS_GAME_CONCEPT.md's drive and seed ship, settled 2026-10-15. */
export interface Way {
  key: string;
  name: string;
  line: string;
  needs: string[];
}

export const LOCKED: Way[] = [
  {
    key: "lens",
    name: "A lens at the Sun’s focus",
    line: "Small solar sails, built in orbit, dive past the Sun and reach its focus, 550 AU out, in about 17 years. There the Sun’s gravity gathers the star’s light into a map of the world’s face, kilometers to a pixel.",
    needs: ["Orbital Yard"],
  },
  {
    key: "stay",
    name: "A probe that stays",
    line: "A probe with a fusion drive slows at the star and stays to watch, where a flyby passes in minutes.",
    needs: ["Probe Yard", "Fusion Drive", "Deuterium Works"],
  },
  {
    key: "mind",
    name: "A mind",
    line: "A copy of our Mind, sent to stay, to think there, and to speak with whoever it finds.",
    needs: ["Seed Ship", "Fusion Drive", "Deuterium Works"],
  },
];

