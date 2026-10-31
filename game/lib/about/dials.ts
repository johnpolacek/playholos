// The dials on /about/research: the chain from stars to minds, HOLOS_MODELING_ALIENS.md's, with each step a reader
// can turn within its research range. Holos's own values are the marks. Pure, so the page draws from it.

export interface Dial {
  key: string;
  label: string;
  /** What the step keeps, as a share: Holos's value, and the research range. */
  holos: number;
  lo: number;
  hi: number;
  basis: string;
}

export const DIALS: Dial[] = [
  { key: "warm", label: "A rocky world in the warm zone", holos: 1 / 8, lo: 1 / 25, hi: 1 / 3, basis: "Kepler’s counts" },
  { key: "air", label: "It keeps its air", holos: 1 / 3, lo: 1 / 10, hi: 0.9, basis: "JWST on red-dwarf worlds" },
  { key: "start", label: "Life starts", holos: 3 / 4, lo: 1 / 100, hi: 1, basis: "Earth’s fast start" },
  { key: "last", label: "Life lasts", holos: 1 / 3, lo: 1 / 10, hi: 0.97, basis: "Climate models" },
  { key: "animals", label: "Life reaches animals", holos: 3 / 5, lo: 1 / 5, hi: 0.9, basis: "Waiting on oxygen" },
  { key: "minds", label: "Animals become a mind", holos: 1 / 6200, lo: 1e-10, hi: 1 / 2, basis: "Contested" },
];

export const PRESETS: { name: string; set: Record<string, number> }[] = [
  { name: "Holos", set: {} },
  { name: "Minds come easy", set: { minds: 1 / 10 } },
  { name: "Minds are rare", set: { minds: 1e-8 } },
  { name: "Life is rare", set: { start: 1 / 100, last: 1 / 10, minds: 1 / 6200 } },
];

/** Stars in our Galaxy, Holos's 200 billion, and what they weigh, Licquia and Newman 2015, so stars per Sun's mass. */
const GALAXY = 2e11;
const PER_SUN = GALAXY / 6.08e10;
/** Minds that woke within ±1 year of us, as a share of all: 7 of 200,000 within ±100,000 years (calcs/minds.py). */
const PEER_PER_YEAR = 7 / 2e5 / 1e5;

// The thin disk of calcs/minds.py: stars per cubic parsec here, scale height, scale length, the Sun's radius (pc).
const N0 = 0.1, HZ = 300, HR = 2600, R0 = 8200, PC_LY = 3.261563777;

/** Thin-disk stars within each radius, integrated once over shells, out to 100,000 ly. */
const TABLE = (() => {
  const steps = 1000, top = 1e5 / PC_LY, dr = top / steps, out: number[] = [0];
  let tot = 0;
  for (let i = 0; i < steps; i++) {
    const r = (i + 0.5) * dr;
    let s = 0;
    for (let j = 0; j < 24; j++) {
      const mu = -1 + ((j + 0.5) * 2) / 24, rho = r * Math.sqrt(1 - mu * mu);
      let ring = 0;
      for (let k = 0; k < 48; k++) {
        const phi = ((k + 0.5) * 2 * Math.PI) / 48;
        const R = Math.sqrt(R0 * R0 + rho * rho - 2 * R0 * rho * Math.cos(phi));
        ring += Math.exp(-(R - R0) / HR);
      }
      s += (N0 * Math.exp(-Math.abs(r * mu) / HZ) * ring) / 48 / 24;
    }
    tot += 4 * Math.PI * r * r * s * dr;
    out.push(tot);
  }
  return { out, dly: 1e5 / steps };
})();
const DISK = TABLE.out[TABLE.out.length - 1];

/** The share of a normal curve below z, after Abramowitz and Stegun 7.1.26. */
function normal(z: number): number {
  const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
  const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  return z < 0 ? (1 - erf) / 2 : (1 + erf) / 2;
}

/** Stars within r light-years of the Sun: the disk, with the rest of the Galaxy's count at its center, 26,700 ly away. */
function starsWithin(ly: number): number {
  const x = Math.min(ly, 1e5) / TABLE.dly, i = Math.min(Math.floor(x), TABLE.out.length - 2);
  // Between rows, along the cube root, so a small radius keeps its r³.
  const a = Math.cbrt(TABLE.out[i]), b = Math.cbrt(TABLE.out[i + 1]);
  const disk = (a + (b - a) * (x - i)) ** 3;
  const core = (GALAXY - DISK) * normal((ly - R0 * PC_LY) / (1000 * PC_LY));
  return Math.min(GALAXY, disk + core);
}

// Beyond our Galaxy: Andromeda, Tamm et al. 2012, about 1.0 to 1.5 × 10¹¹ Suns, 2.5 million ly. Triangulum, its disk
// about 5 × 10⁹ Suns, 2.8 million ly. Past the Local Group, the cosmic average, about 5 × 10⁸ Suns per cubic Mpc.
const LOCAL: [ly: number, stars: number][] = [[2.5e6, 1.2e11 * PER_SUN], [2.8e6, 5e9 * PER_SUN]];
const COSMIC = (5e8 * PER_SUN) / (PC_LY * 1e6) ** 3;

function starsOut(ly: number): number {
  const local = GALAXY + LOCAL.reduce((n, [d, s]) => n + (ly >= d ? s : 0), 0);
  return Math.max(local, (4 / 3) * Math.PI * ly ** 3 * COSMIC);
}

/** The distance at which half of draws hold one: where the count expected is ln 2. */
function median(perStar: number): { ly: number; beyond: boolean } {
  const want = Math.LN2 / perStar;
  if (want <= GALAXY) {
    let lo = 0, hi = 1e5;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (starsWithin(mid) < want) lo = mid;
      else hi = mid;
    }
    return { ly: hi, beyond: false };
  }
  let lo = 1e5, hi = 1e11;
  for (let i = 0; i < 80; i++) {
    const mid = Math.sqrt(lo * hi);
    if (starsOut(mid) < want) lo = mid;
    else hi = mid;
  }
  return { ly: hi, beyond: true };
}

export interface Result {
  perStar: number;
  perMillion: number;
  galaxy: number;
  nearest: { ly: number; beyond: boolean };
  /** Minds within 1,000 ly of us, as the neighborhood map draws them. */
  near: number;
  peers: number;
  peerChance: number;
  nearestPeer: { ly: number; beyond: boolean };
}

export const NEAR_LY = 1000;

export function chain(values: Record<string, number>, window: number): Result {
  const perStar = DIALS.reduce((p, d) => p * (values[d.key] ?? d.holos), 1);
  const peerPerStar = perStar * PEER_PER_YEAR * window;
  const peers = peerPerStar * GALAXY;
  return {
    perStar,
    perMillion: perStar * 1e6,
    galaxy: perStar * GALAXY,
    nearest: median(perStar),
    near: perStar * starsWithin(NEAR_LY),
    peers,
    peerChance: 1 - Math.exp(-peers),
    nearestPeer: median(peerPerStar),
  };
}

/** A share as people say it: “3 in 4”, “1 in 6,200”. */
export function odds(p: number): string {
  if (p >= 0.995) return "all";
  if (p >= 0.3) {
    let best = [1, 1, 1];
    for (let d = 2; d <= 10; d++) {
      const n = Math.round(p * d), off = Math.abs(n / d - p);
      if (off < best[2] - 1e-9) best = [n, d, off];
    }
    return best[0] === best[1] ? "nearly all" : `${best[0]} in ${best[1]}`;
  }
  return `1 in ${round(1 / p)}`;
}

/** A count rounded to two figures, written out, or in words past a million. */
export function round(n: number): string {
  if (n < 1) return n.toPrecision(1);
  if (n < 100) return String(Math.round(n));
  const words: [number, string][] = [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"]];
  for (const [v, w] of words) if (n >= v) return `${+(n / v).toPrecision(2)} ${w}`;
  return (+n.toPrecision(2)).toLocaleString("en-US");
}

/** A distance in light-years, or millions of them. */
export function far(ly: number): string {
  return `${round(ly)} light-years`;
}
