// calcs/minds.py in TypeScript, so a page can draw a seed's minds itself, at any odds: old minds on the real stars out to
// 326 ly, young peers across the Galaxy, and the watcher. At Holos's odds it gives what Python gave, roll for roll,
// which sim.test.mts checks against the shipped worlds. Pure: it takes the catalog's bytes, so it runs in the browser
// as well as in Node. Simulation mode draws with it, 2026-11-01, and gameplay could later.
import { PyRandom } from "./pyrandom.ts";
import type { Minds, OldMind, Peer, Watcher } from "./types.ts";

const PC_LY = 3.261563777;

/** The odds a draw takes. Holos's own: one mind per 1,600 stars, and a chance to spread up to 1 in 84. */
export interface Odds {
  starsPerMind: number;
  /** The top of a mind's chance to spread, drawn evenly in log from 1 in 1,000 up to it. */
  spreadTop: number;
}
export const HOLOS_ODDS: Odds = { starsPerMind: 1600, spreadTop: 0.012 };

const CATALOG_LY = 326;
const OLD_MINDS_LY = CATALOG_LY;
/** Mean peers at Holos's odds. More minds, more peers, in step. */
const PEERS = 800;
const PEER_WINDOW = 2e4;
const ASLEEP_SHARE = 0.5;
const EARTH_GYR = 4.54, OLDER_SHARE = 0.75, OLDER_K = 4, OLDER_THETA = 0.45, PACE = Math.log(1.6);
const OLDEST_GYR = 10.5;
const ARCHIVE_LY = 150, ARCHIVE_W = 7e19;
const ALL_SKY_W = 2.7e26;
const REST_AU: [number, number] = [30, 2000];
const REPLY_C = 0.1;
const N0 = 0.1, HZ = 300.0, HR = 2600.0, R0 = 8200.0;
const BULGE_SHARE = 0.2, BULGE_PC = 1000.0;
const WATCHER_PLACES = ["an Earth co-orbital asteroid", "Sun–Earth L4", "Sun–Earth L5", "Earth–Moon L4", "Earth–Moon L5"];
const RELAY_AU: [number, number] = [1000, 2500];
const CO_ORBITALS = ["Kamoʻoalewa", "2023 FW13", "2002 AA29", "2004 GU9", "2006 FV35", "Cruithne"];
const BUILD_YEARS: [number, number] = [50, 1000];
const SEED_C: [number, number] = [0.01, 0.2];
const SPREAD_FLOOR = 1e-3;
export const NEIGHBORS = 6 + 20_000 / 11_000;
const HOP_LY = 5;
const INHERIT_SD = 0.3;
/** A family past this many settlements never stops: it would fill the Galaxy. Python never reaches it at its odds. */
const FILLS = 1e5;

type Vec = [number, number, number];
/** A peer as drawn, with whether its family never stopped spreading. */
export type DrawnPeer = Peer & { fills: boolean };
export type DrawnMinds = Omit<Minds, "peers"> & { peers: DrawnPeer[] };

const rng = (seed: number, ...key: (string | number)[]) => new PyRandom([seed, "minds", ...key].join(":"));
const logBetween = (r: PyRandom, lo: number, hi: number) => lo * (hi / lo) ** r.random();

function poisson(r: PyRandom, mean: number): number {
  if (mean > 500) {
    const parts = Math.ceil(mean / 500);
    let n = 0;
    for (let i = 0; i < parts; i++) n += poisson(r, mean / parts);
    return n;
  }
  const limit = Math.exp(-mean);
  let k = 0, p = r.random();
  while (p > limit) {
    k++;
    p *= r.random();
  }
  return k;
}

/** Python's round(x, n): the nearest, and ties to even, read from x's exact decimal value. */
export function pyRound(x: number, n = 0): number {
  const exact = x.toFixed(Math.min(100, n + 60)), dot = exact.indexOf(".");
  const rest = exact.slice(dot + 1 + n);
  if (/^50*$/.test(rest)) {
    const kept = exact.slice(0, dot + 1 + n).replace(/\.$/, "");
    const last = Number(kept[kept.length - 1]);
    if (last % 2 === 0) return Number(kept);
  }
  return Number(x.toFixed(n));
}

// ---------- Stars ----------
/** The real census out to 326 ly, data/gcns-326ly.bin's rows: x, y, z in atlas light-years, then two more. */
export function catalogOf(bytes: ArrayBuffer): Vec[] {
  const v = new Float32Array(bytes), out: Vec[] = [];
  for (let i = 0; i < v.length; i += 5) out.push([v[i], v[i + 1], v[i + 2]]);
  return out;
}

const hypot = (x: number, y: number, z = 0) => Math.sqrt(x * x + y * y + z * z);

function diskDensity(x: number, y: number, z: number): number {
  const gx = x / PC_LY, gz = y / PC_LY, gy = -z / PC_LY;
  const R = hypot(R0 - gx, gy);
  return N0 * Math.exp(-Math.abs(gz) / HZ - (R - R0) / HR);
}

const FACT = [1];
for (let k = 1; k < 12; k++) FACT.push(FACT[k - 1] * k);
export function diskStars(rLy: number, steps = 120, m = 48): number {
  let tot = 0;
  const dr = rLy / PC_LY / steps;
  for (let i = 0; i < steps; i++) {
    const r = (i + 0.5) * dr;
    let s = 0;
    for (let j = 0; j < m; j++) {
      const mu = -1 + ((j + 0.5) * 2) / m, a = (r * Math.sqrt(1 - mu * mu)) / HR;
      let bessel = 0;
      for (let k = 0; k < 12; k++) bessel += (a / 2) ** (2 * k) / FACT[k] ** 2;
      s += (N0 * Math.exp(-Math.abs(r * mu) / HZ) * bessel) / m;
    }
    tot += 4 * Math.PI * r * r * s * dr;
  }
  return tot;
}

function inShell(r: PyRandom, lo: number, hi: number): Vec {
  const top = diskDensity(0, 0, 0) * Math.exp(hi / PC_LY / HR);
  for (;;) {
    const d = (lo ** 3 + (hi ** 3 - lo ** 3) * r.random()) ** (1 / 3);
    const mu = r.uniform(-1, 1), phi = r.uniform(0, 2 * Math.PI);
    const s = Math.sqrt(1 - mu * mu);
    const p: Vec = [d * s * Math.cos(phi), d * mu, d * s * Math.sin(phi)];
    if (r.random() * top < diskDensity(...p)) return p;
  }
}

function inGalaxy(r: PyRandom): Vec {
  let gx: number, gy: number, gz: number;
  if (r.random() < BULGE_SHARE) {
    const g = [r.gauss(0, BULGE_PC), r.gauss(0, BULGE_PC), r.gauss(0, BULGE_PC)];
    [gx, gy, gz] = [R0 + g[0], g[1], g[2] * 0.5];
  } else {
    const R = r.gammavariate(2, HR), phi = r.uniform(0, 2 * Math.PI);
    [gx, gy] = [R0 - R * Math.cos(phi), R * Math.sin(phi)];
    gz = (r.random() < 0.5 ? 1 : -1) * r.expovariate(1 / HZ);
  }
  return [gx * PC_LY, gz * PC_LY, -gy * PC_LY];
}

// ---------- Old minds ----------
function oldMind(seed: number, i: number | string, pos: Vec, star: number | null = null): OldMind {
  const r = rng(seed, "old", i);
  const d = hypot(...pos);
  const asleep = r.random() < ASLEEP_SHARE;
  let limit = ALL_SKY_W * (d / 400) ** 2;
  if (d <= ARCHIVE_LY) limit = Math.min(limit, ARCHIVE_W * (d / PC_LY / 10) ** 2);
  const age = headStart(r);
  const glow = asleep ? null : Number(logBetween(r, Math.min(1e18, limit / 2), limit).toPrecision(3));
  const rest = asleep ? pyRound(logBetween(r, ...REST_AU)) : null;
  return { id: `old-${i}`, pos: pos.map((c) => pyRound(c, 3)) as Vec, d: pyRound(d, 2), star, age, asleep, glowW: glow, restAU: rest };
}

function headStart(r: PyRandom): number {
  for (;;) {
    const world = r.random() < OLDER_SHARE ? Math.min(OLDEST_GYR, EARTH_GYR + r.gammavariate(OLDER_K, OLDER_THETA)) : r.uniform(0, EARTH_GYR);
    const took = EARTH_GYR * Math.exp(r.gauss(0, PACE));
    if ((world - took) * 1e9 > PEER_WINDOW) return pyRound((world - took) * 1e9);
  }
}

function oldMinds(seed: number, stars: Vec[], odds: Odds): OldMind[] {
  const r = rng(seed, "old");
  const n = poisson(r, stars.length / odds.starsPerMind), inside: number[] = [];
  for (let k = 0; k < n; k++) inside.push(Math.floor(r.random() * stars.length));
  const beyond = poisson(r, (diskStars(OLD_MINDS_LY) - diskStars(CATALOG_LY)) / odds.starsPerMind);
  const out = inside.map((k, i) => oldMind(seed, i, stars[k], k));
  for (let j = 0; j < beyond; j++) {
    const i = inside.length + j;
    out.push(oldMind(seed, i, inShell(rng(seed, "old", i, "place"), CATALOG_LY, OLD_MINDS_LY)));
  }
  return out.sort((a, b) => a.d - b.d);
}

/** With none on the catalog's stars, the nearest beyond: as far as the Galaxy's stars put it, toward where they lie.
 *  Python's fallback, a mind 326 to 652 ly out, never runs at its odds, so this one is the sim's own. */
function nearestBeyond(seed: number, odds: Odds, within: (ly: number) => number): OldMind {
  const r = rng(seed, "old", "far");
  const want = within(CATALOG_LY) + r.expovariate(1) * odds.starsPerMind;
  let lo = CATALOG_LY, hi = 3e7;
  for (let i = 0; i < 80; i++) {
    const mid = Math.sqrt(lo * hi);
    if (within(mid) < want) lo = mid;
    else hi = mid;
  }
  const way = inGalaxy(r), len = hypot(...way) || 1;
  return oldMind(seed, "far", way.map((c) => (c / len) * hi) as Vec);
}

// ---------- Peers ----------
/** A young mind, and whether its family never stopped spreading. */
function peer(seed: number, i: number, odds: Odds): DrawnPeer {
  const r = rng(seed, "peer", i);
  const pos = inGalaxy(r);
  const d = hypot(...pos);
  const wake = r.uniform(-PEER_WINDOW, PEER_WINDOW);
  const build = logBetween(r, ...BUILD_YEARS);
  const chance = logBetween(r, SPREAD_FLOOR, odds.spreadTop);
  let settlements = 0, deepest = 0, fills = false;
  const todo: [number, number][] = [[chance, 0]];
  while (todo.length) {
    const [p, gen] = todo.pop()!;
    if (r.random() >= p) continue;
    const kids = poisson(r, NEIGHBORS);
    for (let k = 0; k < kids; k++) {
      settlements++;
      deepest = Math.max(deepest, gen + 1);
      todo.push([Math.min(1, p * Math.exp(r.gauss(0, INHERIT_SD))), gen + 1]);
    }
    if (settlements > FILLS) {
      fills = true;
      break;
    }
  }
  const reach = HOP_LY * deepest;
  const speed = settlements ? logBetween(r, ...SEED_C) : null;
  let hops = 0;
  for (let k = 0; k < deepest; k++) hops += HOP_LY / speed! + logBetween(r, ...BUILD_YEARS);
  const outward = build + (deepest ? hops : 0);
  const contact = wake + outward < d ? "inward" : wake <= d ? "outward" : "unborn";
  return {
    id: `peer-${i}`, pos: pos.map((c) => pyRound(c, 1)) as Vec, d: pyRound(d, 1), wake: pyRound(wake, 1),
    buildYears: pyRound(build, 1), spreadChance: pyRound(chance, 5), settlements,
    reachLy: pyRound(reach, 1), seedC: speed && pyRound(speed, 4),
    outwardYears: pyRound(outward, 1), asleep: r.random() < ASLEEP_SHARE,
    flash: [pyRound(wake + d, 1), pyRound(wake + outward + d, 1)],
    ourLight: pyRound(d, 1), atContact: contact, fills,
  };
}

function peers(seed: number, odds: Odds): DrawnPeer[] {
  const n = poisson(rng(seed, "peers"), (PEERS * HOLOS_ODDS.starsPerMind) / odds.starsPerMind), out: DrawnPeer[] = [];
  for (let i = 0; i < n; i++) {
    const p = peer(seed, i, odds);
    if (p.flash[1] >= 0) out.push(p);
  }
  return out.sort((a, b) => a.d - b.d);
}

// ---------- The watcher ----------
function watcher(seed: number, olds: OldMind[]): Watcher {
  const r = rng(seed, "watcher");
  const maker = olds[0], d = maker.d;
  const place = WATCHER_PLACES[Math.floor(r.random() * WATCHER_PLACES.length)];
  const rock = place === WATCHER_PLACES[0] ? Math.floor(rng(seed, "watcher", "rock").random() * CO_ORBITALS.length) : null;
  const relay = pyRound(rng(seed, "watcher", "relay").uniform(...RELAY_AU));
  const delay = pyRound(d + d / REPLY_C);
  return {
    place, rock: rock === null ? null : CO_ORBITALS[rock], kg: 1, relayAU: relay,
    arrivedYearsAgo: pyRound(logBetween(r, 1e6, Math.min(1e9, maker.age))), maker: maker.id,
    ladder: [
      { rung: "warn", on: "our first seed launches", by: "watcher", delay: 0 },
      { rung: "contain", on: "we launch another seed after the warning", by: "maker", delay },
      { rung: "strike", on: "our colonies launch seeds of their own", by: "maker", delay },
    ],
  };
}

/** A seed's minds at the odds given. `within` counts the stars within a distance, for a nearest mind past the catalog:
 *  lib/about/dials.ts's starsWithin. */
export function drawMinds(seed: number, stars: Vec[], odds: Odds = HOLOS_ODDS, within?: (ly: number) => number): DrawnMinds {
  let olds = oldMinds(seed, stars, odds);
  if (!olds.length)
    olds = within ? [nearestBeyond(seed, odds, within)] : [oldMind(seed, "far", inShell(rng(seed, "old", "far"), OLD_MINDS_LY, 2 * OLD_MINDS_LY))];
  return { old: olds, peers: peers(seed, odds), watcher: watcher(seed, olds) };
}

// ---------- Spreading's limit ----------
// calcs/spread_limit.py: the chance a family starting at p never dies out, solved on a grid in log p. It depends only
// on the stars in reach, so it is solved once.
let SURVIVAL: { p: number[]; f: number[] } | null = null;
function survival(n = NEIGHBORS, sd = INHERIT_SD, steps = 900) {
  if (SURVIVAL) return SURVIVAL;
  const lo = Math.log(1e-6), dx = -lo / (steps - 1);
  const p = Array.from({ length: steps }, (_, i) => Math.exp(lo + i * dx));
  const K = Math.floor((6 * sd) / dx), w: number[] = [];
  for (let j = -K; j <= K; j++) w.push(Math.exp(-((j * dx) ** 2) / (2 * sd * sd)));
  const sum = w.reduce((a, b) => a + b, 0);
  for (let j = 0; j < w.length; j++) w[j] /= sum;
  let f = new Array<number>(steps).fill(1);
  for (let it = 0; it < 300; it++) {
    const next = new Array<number>(steps);
    for (let i = 0; i < steps; i++) {
      let e = 0;
      for (let j = -K; j <= K; j++) e += w[j + K] * f[Math.min(steps - 1, Math.max(0, i + j))];
      next[i] = p[i] * -Math.expm1(-n * e);
    }
    f = next;
  }
  return (SURVIVAL = { p, f });
}

/** Minds in the whole Galaxy, at these odds: its 200 billion stars. */
export const galaxyMinds = (odds: Odds) => 2e11 / odds.starsPerMind;

/** How many of the Galaxy's minds would fill it, on average, with chances drawn evenly in log up to the top. Above
 *  about 0.44, some mind likely has: our Solar System would be settled, and today's sky shows it is not. */
export function fillers(odds: Odds): number {
  const { p, f } = survival();
  let sum = 0, n = 0;
  for (let i = 0; i < p.length; i++)
    if (p[i] >= SPREAD_FLOOR && p[i] <= odds.spreadTop) {
      sum += f[i];
      n++;
    }
  return n ? (sum / n) * galaxyMinds(odds) : 0;
}

/** The highest top that keeps the Galaxy unsettled, as calcs/spread_limit.py's top(). */
export function safeTop(starsPerMind: number, line = 0.44): number {
  const { p, f } = survival();
  for (let k = 0; k < p.length; k++) {
    if (p[k] < SPREAD_FLOOR * 1.01) continue;
    let sum = 0, n = 0;
    for (let i = 0; i <= k; i++)
      if (p[i] >= SPREAD_FLOOR) {
        sum += f[i];
        n++;
      }
    if ((sum / n) * (2e11 / starsPerMind) > line) return p[k];
  }
  return 1;
}
