// How Earth finds the realistic premise's minds, from the world's truth (calcs/minds.py) and what we have built. Four
// ways, settled 2026-10-29 in HOLOS_GAME_CONCEPT.md: a peer's warm flash, an awake old mind's cold glow, the watcher by
// where it sits, and a sleeping old mind only up close. Earth learns where and when, never who.
import catalog from "../../data/works.json" with { type: "json" };
import type { OldMind, Peer, World } from "./types.ts";

const PC_LY = 3.2616;

/** What our watches and craft can find minds with: the Year each is done or arrives. */
export interface MindKit {
  /** The all-sky mid-infrared watch, about ten times deeper than WISE: it catches any peer's warm flash while it runs. */
  warmWatch?: number | null;
  /** The Halo Survey, mapping the whole sky in cold far-infrared light. */
  halo?: number | null;
  /** A deep, stacked search of the Earth–Moon L4 and L5 points from Earth. */
  moonSearch?: number | null;
  /** The asteroid tour: the Year its probe reaches the first Earth co-orbital asteroid. It maps each in turn. */
  asteroidTour?: number | null;
  /** The Year our first seed ship leaves: the watcher warns us, and so shows itself. */
  firstSeed?: number | null;
  /** Our craft at other stars: where, in atlas light-years, the Year it arrives, and whether it brakes and stays. */
  craft?: { pos: [number, number, number]; arrives: number; stays: boolean }[];
}

/** A warm source that appeared where none was: a young mind building out its home, though Earth can't know that. */
export interface FlashSeen {
  ra: number;
  dec: number;
  seen: number;
  /** The Year it faded, once it has. */
  faded?: number;
}

/** A cold far-infrared glow beside a star, steady as nothing young is. */
export interface ColdGlowSeen {
  ra: number;
  dec: number;
  d: number;
  seen: number;
  watts: number;
}

export interface WatcherSeen {
  place: string;
  seen: number;
  by: "moon search" | "asteroid tour" | "its warning";
}

/** A compact warm body resting in the cold outer reaches of another star's system. */
export interface SleeperSeen {
  ra: number;
  dec: number;
  d: number;
  seen: number;
  restAU: number;
}

export interface MindsSeen {
  flashes: FlashSeen[];
  glows: ColdGlowSeen[];
  watcher: WatcherSeen | null;
  sleepers: SleeperSeen[];
}

/** How often the warm watch maps the whole sky, in Years. */
export const WARM_EVERY = 2;
/** Years a deep stacked search of Earth–Moon L4 and L5 takes to reach magnitude 28. */
export const MOON_SEARCH_YEARS = 3;
/** The Earth co-orbital asteroids known by 2026, in the order the tour visits them, as calcs/minds.py. */
export const CO_ORBITALS = ["Kamoʻoalewa", "2023 FW13", "2002 AA29", "2004 GU9", "2006 FV35", "Cruithne"];
/** Years the tour spends at each: a Year mapping its whole surface to centimeters, as Tianwen-2, and a Year to the next. */
export const TOUR_EACH = 2;
/** Years mapping one asteroid. */
export const TOUR_MAP = 1;
/** How near a flyby's path must pass a sleeping mind for its 1 m telescope to see it, in AU. */
export const FLYBY_SEES_AU = 50;
/** Years a probe that stays takes to map a whole system. */
export const STAY_SEARCH_YEARS = 3;
/** Within this, a craft is in the same system as a mind, in light-years: about 3,000 AU. */
const SAME_SYSTEM_LY = 0.05;

/** Right ascension in hours and declination in degrees of an atlas position: (Galactic X, Galactic Z, -Galactic Y),
 *  back to ICRS by the transpose of the IAU matrix that scripts/prepare-neighborhood.py uses. */
export function skyOf([ax, ay, az]: readonly [number, number, number]) {
  const g = [ax, -az, ay];
  const M = [
    [-0.0548755604, -0.87343709, -0.4838350155],
    [0.4941094279, -0.44482963, 0.7469822445],
    [-0.867666149, -0.1980763734, 0.4559837762],
  ];
  const [x, y, z] = [0, 1, 2].map((j) => M[0][j] * g[0] + M[1][j] * g[1] + M[2][j] * g[2]);
  const r = Math.hypot(x, y, z);
  return { ra: +((((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) / 15).toFixed(4), dec: +((Math.asin(z / r) * 180) / Math.PI).toFixed(3) };
}

/** A peer's flash is seen at the watch's first look once both have begun, if the flash still shines then. */
export function flashOf(p: Peer, watch: number | null | undefined, year: number): FlashSeen | null {
  if (watch === null || watch === undefined) return null;
  const [rises, fades] = p.flash;
  const from = Math.max(rises, watch);
  const seen = watch + WARM_EVERY * Math.ceil((from - watch) / WARM_EVERY - 1e-9);
  if (seen > fades || seen > year) return null;
  return { ...skyOf(p.pos), seen, ...(fades <= year ? { faded: fades } : {}) };
}

/** An awake old mind's glow is seen once the Halo Survey has mapped the sky, if it is over the floor at its distance.
 *  It has glowed for ages, so its light is already here. */
export function coldGlowOf(m: OldMind, halo: number | null | undefined, year: number): ColdGlowSeen | null {
  if (halo === null || halo === undefined || m.asleep || m.glowW === null) return null;
  const { floor, every } = catalog.halo;
  const seen = halo + every;
  if (m.glowW < floor * (m.d / (10 * PC_LY)) ** 2 || seen > year) return null;
  return { ...skyOf(m.pos), d: m.d, seen, watts: m.glowW };
}

/** The watcher, found by where it sits: from Earth at the Moon's L4 or L5, by the asteroid tour on a co-orbital rock,
 *  or anywhere once it warns us at our first seed ship. At the Sun–Earth L4 or L5 points nothing finds it but its
 *  warning: the zone is tens of millions of km wide, and a probe sees a dark 10 cm body only within about 200,000 km. */
export function watcherOf(world: World, kit: MindKit, year: number): WatcherSeen | null {
  const w = world.minds?.watcher;
  if (!w) return null;
  const ways: WatcherSeen[] = [];
  if (w.place.startsWith("Earth–Moon") && kit.moonSearch != null) ways.push({ place: w.place, seen: kit.moonSearch + MOON_SEARCH_YEARS, by: "moon search" });
  const at = w.rock ? CO_ORBITALS.indexOf(w.rock) : -1;
  if (at >= 0 && kit.asteroidTour != null) ways.push({ place: w.rock!, seen: kit.asteroidTour + at * TOUR_EACH + TOUR_MAP, by: "asteroid tour" });
  if (kit.firstSeed != null) ways.push({ place: w.place, seen: kit.firstSeed, by: "its warning" });
  const first = ways.filter((x) => x.seen <= year).sort((a, b) => a.seen - b.seen)[0];
  return first ?? null;
}

/** A sleeping old mind, found only by our craft in its system: one that stays always finds it, a flyby only if the
 *  mind rests within a 1 m telescope's reach of its path. Word comes home at light speed. */
export function sleeperOf(m: OldMind, craft: MindKit["craft"], year: number): SleeperSeen | null {
  if (!m.asleep || m.restAU === null) return null;
  let best: number | null = null;
  for (const c of craft ?? []) {
    if (Math.hypot(c.pos[0] - m.pos[0], c.pos[1] - m.pos[1], c.pos[2] - m.pos[2]) > SAME_SYSTEM_LY) continue;
    if (!c.stays && m.restAU > FLYBY_SEES_AU) continue;
    const home = c.arrives + (c.stays ? STAY_SEARCH_YEARS : 0) + m.d;
    if (best === null || home < best) best = home;
  }
  if (best === null || best > year) return null;
  return { ...skyOf(m.pos), d: m.d, seen: best, restAU: m.restAU };
}

/** Every mind Earth has found by Year `year`, in the order found. */
export function mindsSeen(world: World, kit: MindKit, year: number): MindsSeen {
  const m = world.minds;
  if (!m) return { flashes: [], glows: [], watcher: null, sleepers: [] };
  const bySeen = <T extends { seen: number }>(xs: (T | null)[]) => xs.filter((x): x is T => x !== null).sort((a, b) => a.seen - b.seen);
  return {
    flashes: bySeen(m.peers.map((p) => flashOf(p, kit.warmWatch, year))),
    glows: bySeen(m.old.map((o) => coldGlowOf(o, kit.halo, year))),
    watcher: watcherOf(world, kit, year),
    sleepers: bySeen(m.old.map((o) => sleeperOf(o, kit.craft, year))),
  };
}
