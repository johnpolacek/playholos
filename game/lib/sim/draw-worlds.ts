// calcs/seed.py's natural warm worlds in TypeScript: at each host star within 50 ly, whether it holds a warm rocky
// world, and how far life there has come. At Holos's odds it gives what Python gave, which sim.test.mts checks against
// the shipped worlds. Simulation mode turns five of the chain's steps here, 2026-11-01:
// - A rocky world in the warm zone scales how often a star holds one.
// - Life starts and life lasts are the draw's own odds.
// - It keeps its air, and life reaches animals, come from physics: a world's gravity against its starlight, and its
//   star's age against life's pace. So they turn by nudging the physics, not by coin flips. The air's line moves until
//   as many worlds keep air as the dial asks, and life's pace slows or quickens until as many reach animals. The worlds
//   that keep air are still the heaviest and least scorched, and the ones with animals still the oldest.
import { blake2b } from "./blake2b.ts";
import { PyRandom } from "./pyrandom.ts";

/** A host star as calcs/export_sim_hosts.py writes it. */
export interface Host {
  id: string;
  name: string;
  kind: string;
  d: number;
  lum: number;
  age: number | null;
  ageBy: string | null;
  gabs: number;
  north: boolean;
  ra: number;
  dec: number;
  /** The widest stable orbit beside a wide companion, in AU. */
  wideAU: number | null;
  closePair: boolean;
  /** Known planets: mass in Earths, orbit in AU, eccentricity. */
  planets: [number, number, number][];
  /** The smallest tug the 2026 surveys could feel, m/s. Null where none watched. */
  rvFloor: number | null;
}

export const RUNGS = ["bare rock", "airy and lifeless", "hiding microbes", "showing oxygen", "with animals and forests", "where life died", "frozen"] as const;
export type Rung = (typeof RUNGS)[number];
export const ALIVE: readonly Rung[] = RUNGS.slice(2, 5);

export interface NaturalWorld {
  star: string;
  name: string;
  d: number;
  ra: number;
  dec: number;
  a: number;
  radius: number;
  mass: number;
  pole: number;
  tug: number;
  rung: Rung;
  /** Its star's age, Gyr, and when life's clock could start there: 0 warm from the start, null still frozen. */
  age: number;
  ageBy: string;
  thaw: number | null;
  /** Its star's kind, M to F, light in Suns, and known planets: real, as data/sim-hosts.json has them. */
  kind: string;
  lum: number;
  planets: number;
  /** Whether the star's age was published, not drawn. */
  agePublished: boolean;
}

/** The chain's steps a natural world turns on, as shares. Holos's own: the dials' marks. */
export interface WorldOdds {
  warm: number;
  air: number;
  start: number;
  last: number;
  animals: number;
}
export const HOLOS_WORLD_ODDS: WorldOdds = { warm: 1 / 8, air: 1 / 3, start: 3 / 4, last: 1 / 3, animals: 3 / 5 };

const ETA = 0.24, R_MIN = 0.6, R_MAX = 1.4;
const SHORE_LUCK = 0.5, PACE = Math.log(1.6);
const OXYGEN_AT = 2.3, RICH_AT = 4.0, OLDEST = 10.5;
const OUTER_LIGHT = 1 / 1.67 ** 2, THAW_LIGHT = 0.62;
const M_EARTH = 5.972e24, M_SUN = 1.989e30, R_SUN = 6.957e8;
const DEG = Math.PI / 180;

/** calcs/seed.py's keyed(): a number between 0 and 1 that depends only on its parts. */
export function keyed(...parts: (string | number)[]): number {
  const d = blake2b(new TextEncoder().encode(parts.join(":")), 8);
  const n = new DataView(d.buffer).getBigUint64(0, false);
  return Number(n + BigInt(1)) / (2 ** 64 + 2);
}

const power = (u: number, lo: number, hi: number, k: number) => (lo ** k + u * (hi ** k - lo ** k)) ** (1 / k);
const starMass = (lum: number) => lum ** 0.25;
function tug(m: number, a: number, ms: number, sinI: number) {
  const period = Math.sqrt(a ** 3 / ms);
  return 28.4 * (m / 317.8) * sinI * period ** (-1 / 3) * ms ** (-2 / 3);
}

/** calcs/neighbors.py's orbit_fails for a circular orbit: whether it is ruled out, and its tug in m/s. */
function orbitFails(h: Host, mass: number, a: number, pole: number): { fails: boolean; k: number } {
  let fails = (h.wideAU !== null && a > h.wideAU) || h.closePair;
  const ms = starMass(h.lum);
  for (const [pm, pa, pe] of h.planets) {
    const hill = (((mass + pm) * M_EARTH) / (3 * ms * M_SUN)) ** (1 / 3) * ((a + pa) / 2);
    const gap = pa > a ? pa * (1 - pe) - a : a - pa * (1 + pe);
    if (gap < (pm < 10 ? 10 : 2 * 3 ** 0.5) * hill) fails = true;
  }
  const rStar = ms > 0.6 ? (R_SUN * h.lum ** 0.5) / ms ** 0.5 : R_SUN * ms;
  if (Math.abs(Math.cos(pole * DEG)) < rStar / (a * 1.496e11)) fails = true;
  const k = tug(mass, a, ms, Math.sin(pole * DEG));
  if (k > (h.rvFloor ?? Infinity)) fails = true;
  return { fails, k };
}

const brightness = (x: number) => 1 / (1.4 - 0.875 * Math.min(1, Math.max(0, x)));
function thawed(h: Host, a: number, age: number): number | null {
  if (h.kind === "M") return 0;
  const life = 10 * h.lum ** -0.75, now = h.lum / a ** 2;
  if ((now * brightness(0)) / brightness(age / life) >= OUTER_LIGHT) return 0;
  if (now < THAW_LIGHT) return null;
  return ((1.4 - now / (THAW_LIGHT * brightness(age / life))) / 0.875) * life;
}
function shoreline(h: Host, radius: number, mass: number, a: number) {
  const dose = (h.lum ** 0.4 / a ** 2) * (h.kind === "M" && h.gabs > 10 ? 3.1 : 1);
  return 4 * Math.log10(11.19 * Math.sqrt(mass / radius)) - Math.log10(dose) - 3.16;
}

/** One world's draw before the odds are applied: where it sits, and the rolls its rung is read from. */
interface Raw {
  h: Host;
  a: number;
  radius: number;
  mass: number;
  pole: number;
  k: number;
  age: number;
  /** How far on the airy side of the shoreline, its luck included. */
  margin: number;
  thaw: number | null;
  uStart: number;
  uDied: number;
  pace: number;
}

function raw(seed: number, h: Host, eta: number): Raw | null {
  if (keyed(seed, "natural", h.id) >= eta) return null;
  const r = new PyRandom(`${seed}:natural:${h.id}`);
  let x: number, radius: number;
  for (;;) {
    x = power(r.random(), 0.95, 1.67, 0.39);
    radius = power(r.random(), R_MIN, R_MAX, -0.19);
    if (radius >= 0.8 * x ** -0.5) break;
  }
  const a = x * Math.sqrt(h.lum), mass = radius ** 3.7, pole = Math.acos(r.uniform(-1, 1)) / DEG;
  const { fails, k } = orbitFails(h, mass, a, pole);
  if (fails) return null;
  const q = new PyRandom(`${seed}:rung:${h.id}`);
  const uAge = q.random(), luck = q.gauss(0, SHORE_LUCK), uStart = q.random(), uDied = q.random(), pace = Math.exp(q.gauss(0, PACE));
  const age = h.age || 1 + uAge * (Math.min(OLDEST, Math.max(2.0, 10 * h.lum ** -0.75)) - 1);
  return { h, a, radius, mass, pole, k, age, margin: shoreline(h, radius, mass, a) + luck, thaw: thawed(h, a, age), uStart, uDied, pace };
}

/** The shift that leaves exactly `want` of these values above zero: none at all when Holos's count is wanted. */
function shiftFor(values: number[], want: number, holos: number): number {
  if (want === holos) return 0;
  const v = [...values].sort((p, q) => q - p);
  if (want <= 0) return -(v[0] ?? 0) - 1;
  if (want >= v.length) return -v[v.length - 1] + 1;
  return -(v[want - 1] + v[want]) / 2;
}

/** The natural warm worlds at these hosts, nearest first. */
export function drawWorlds(seed: number, hosts: Host[], odds: WorldOdds = HOLOS_WORLD_ODDS): NaturalWorld[] {
  const eta = (ETA * odds.warm) / HOLOS_WORLD_ODDS.warm;
  const drawn = hosts.map((h) => raw(seed, h, eta)).filter((w): w is Raw => w !== null);
  // Air: as many keep it as the dial asks, against how many do at Holos's line.
  const margins = drawn.map((w) => w.margin);
  const airyHolos = margins.filter((m) => m > 0).length;
  const air = shiftFor(margins, Math.round((airyHolos * odds.air) / HOLOS_WORLD_ODDS.air), airyHolos);
  const died = 1 - odds.last;
  const lives = (w: Raw) => w.margin + air > 0 && w.thaw !== null && w.uStart < odds.start && !(w.uDied < died);
  // Animals: life's pace scales until as many living worlds reach them as the dial asks. ln of the share of the
  // way there, so 0 is the line.
  const living = drawn.filter(lives);
  const toward = living.map((w) => Math.log((w.age - w.thaw!) / (RICH_AT * w.pace)));
  const richHolos = toward.filter((t) => t >= 0).length;
  const shift = shiftFor(toward, Math.round((richHolos * odds.animals) / HOLOS_WORLD_ODDS.animals), richHolos);
  const slow = Math.exp(-shift);
  const rungOf = (w: Raw): Rung => {
    if (w.margin + air <= 0) return RUNGS[0];
    if (w.thaw === null) return RUNGS[6];
    if (w.uStart >= odds.start) return RUNGS[1];
    if (w.uDied < died) return RUNGS[5];
    const t = w.age - w.thaw, pace = w.pace * slow;
    return t < OXYGEN_AT * pace ? RUNGS[2] : t < RICH_AT * pace ? RUNGS[3] : RUNGS[4];
  };
  return drawn
    .map((w) => ({
      star: w.h.id, name: w.h.name, d: w.h.d, ra: w.h.ra, dec: w.h.dec, a: w.a, radius: w.radius, mass: w.mass, pole: w.pole,
      tug: w.k, rung: rungOf(w), age: w.age, ageBy: w.h.ageBy ?? "drawn", thaw: w.thaw,
      kind: w.h.kind, lum: w.h.lum, planets: w.h.planets.length, agePublished: !!w.h.age,
    }))
    .sort((p, q) => p.d - q.d);
}
