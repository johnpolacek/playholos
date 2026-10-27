// Our seed probes, copying themselves from star to star. Each is a seed ship with no Mind on board: it flies as the Seed
// Ship does, brakes on its sail, mines its new star's moons and asteroids, and sends copies on to the nearest stars no
// probe of ours has reached, at a neighbor colony's pace. Unlike a neighbor's, ours copy only so far, by our choice:
// data/works.json's seedProbe, from calcs/seed.py. Stars are the 50 ly census players can name, data/targets.json, so
// a line stops at its edge. Pure, and the same for every game: what a probe finds there is the world's, in
// knowledge.ts. Settled 2026-10-26.
import targets from "../../data/targets.json" with { type: "json" };
import catalog from "../../data/works.json" with { type: "json" };

const { speed, burn, brake } = catalog.seedShip;
const { first, every, copies, generations } = catalog.seedProbe;

/** Where a star sits, in light-years from the Sun: right ascension in hours, declination, distance. */
export function place(ra: number, dec: number, d: number): [number, number, number] {
  const a = (ra * Math.PI) / 12, b = (dec * Math.PI) / 180;
  return [d * Math.cos(b) * Math.cos(a), d * Math.cos(b) * Math.sin(a), d * Math.sin(b)];
}
const STARS = targets.map((t) => ({ ...t, xyz: place(t.ra, t.dec, t.d) }));
type Star = (typeof STARS)[number];

/** Years from leaving to landing, `ly` away: cruise at a tenth of light speed, the burn, and braking on the sail. */
export const hop = (ly: number) => ly / speed + burn + brake;

/** A companion within a light-year is the same home ground, as Proxima is to Alpha Centauri, as calcs/seed.py has it. */
const HOME_GROUND = 1;

export interface Probe {
  star: string;
  /** Its distance from us, and its place in our sky: right ascension in hours, declination. */
  d: number;
  ra: number;
  dec: number;
  /** 1 for one we sent, 2 for its copies, and so on. */
  gen: number;
  /** The star it was built at, or null if built at home. */
  from: string | null;
  leaves: number;
  lands: number;
  /** The copies it sent on, each by its star and the Year it left. */
  copies: { star: string; leaves: number }[];
}

/** Every probe our seed probes make, from those we sent, each by its star as we name it and the Year it leaves. Copies
 *  go one at a time, the earliest first, each to the nearest star no probe of ours is bound for. A star we don't know
 *  the place of sends no probe. */
export function seedProbes(sent: readonly { star: string; leaves: number }[]): Probe[] {
  const probes: Probe[] = [];
  const at = new Map<Probe, Star>();
  const free = (x: Star) => [...at.values()].every((y) => Math.hypot(x.xyz[0] - y.xyz[0], x.xyz[1] - y.xyz[1], x.xyz[2] - y.xyz[2]) >= HOME_GROUND);
  const launches: { by: Probe; t: number }[] = [];
  const add = (x: Star, gen: number, from: string | null, leaves: number, ly: number) => {
    const p: Probe = { star: x.name, d: x.d, ra: x.ra, dec: x.dec, gen, from, leaves, lands: leaves + hop(ly), copies: [] };
    probes.push(p);
    at.set(p, x);
    if (gen < generations) for (let k = 0; k < copies; k++) launches.push({ by: p, t: p.lands + first + k * every });
  };
  for (const s of [...sent].sort((a, b) => a.leaves - b.leaves)) {
    const x = STARS.find((y) => y.name === s.star);
    if (x && free(x)) add(x, 1, null, s.leaves, x.d);
  }
  for (let guard = 0; launches.length; guard++) {
    if (guard > 1e4) throw new Error("Seed probes did not settle.");
    launches.sort((a, b) => a.t - b.t);
    const { by, t } = launches.shift()!;
    const home = at.get(by)!.xyz;
    const dist = (x: Star) => Math.hypot(x.xyz[0] - home[0], x.xyz[1] - home[1], x.xyz[2] - home[2]);
    const next = STARS.filter(free).sort((a, b) => dist(a) - dist(b))[0];
    if (!next) continue;
    by.copies.push({ star: next.name, leaves: t });
    add(next, by.gen + 1, by.star, t, dist(next));
  }
  return probes;
}
