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
  /** The research behind the step, HOLOS_MODELING_ALIENS.md's chain table. */
  sources: Source[];
}

export interface Source {
  who: string;
  url: string;
  found: string;
}

export const DIALS: Dial[] = [
  {
    key: "warm",
    label: "A rocky world in the warm zone",
    holos: 1 / 8,
    lo: 1 / 25,
    hi: 1 / 3,
    basis: "Kepler’s counts",
    sources: [
      {
        who: "Stark et al. 2019",
        url: "https://arxiv.org/abs/1904.11988",
        found:
          "From Kepler’s counts, 0.24 warm rocky worlds per star that can host one, range 0.08 to 0.70.",
      },
      {
        who: "Bryson et al. 2021",
        url: "https://arxiv.org/abs/2010.14812",
        found: "For Sun-like stars, 0.37 to 0.60 a star, with wide error bars.",
      },
      {
        who: "Dressing and Charbonneau 2015",
        url: "https://arxiv.org/abs/1501.01623",
        found:
          "For red dwarfs, about 0.16 Earth-sized worlds in each warm zone.",
      },
    ],
  },
  {
    key: "air",
    label: "It keeps its air",
    holos: 1 / 3,
    lo: 1 / 10,
    hi: 0.9,
    basis: "JWST on red-dwarf worlds",
    sources: [
      {
        who: "Zahnle and Catling 2017",
        url: "https://arxiv.org/abs/1702.03386",
        found:
          "The cosmic shoreline: a world’s gravity against the light it takes decides whether it keeps air.",
      },
      {
        who: "Pass, Charbonneau and Vanderburg 2025",
        url: "https://arxiv.org/abs/2504.01182",
        found: "The shoreline as a formula, applied to nearby red dwarfs.",
      },
      {
        who: "Greene et al. 2023",
        url: "https://arxiv.org/abs/2303.14849",
        found: "JWST finds TRAPPIST-1 b most likely bare rock.",
      },
      {
        who: "Kreidberg et al. 2019",
        url: "https://arxiv.org/abs/1908.06834",
        found: "LHS 3844 b, Earth-sized at a red dwarf, fits bare rock.",
      },
      {
        who: "Henry, von Hippel and Childs 2026",
        url: "https://arxiv.org/abs/2609.01790",
        found: "A few warm-zone worlds are born frozen.",
      },
    ],
  },
  {
    key: "start",
    label: "Life starts",
    holos: 3 / 4,
    lo: 1 / 100,
    hi: 1,
    basis: "Earth’s fast start",
    sources: [
      {
        who: "Kipping 2025",
        url: "https://arxiv.org/abs/2504.05993",
        found:
          "A fast start is favored 13 to 1 where conditions are Earth-like.",
      },
      {
        who: "Moody et al. 2024",
        url: "https://doi.org/10.1038/s41559-024-02461-1",
        found: "Life’s last common ancestor lived about 4.2 billion years ago.",
      },
      {
        who: "Spiegel and Turner 2012",
        url: "https://arxiv.org/abs/1107.3835",
        found: "A fast start is weak evidence, since we had to exist to ask.",
      },
    ],
  },
  {
    key: "last",
    label: "Life lasts",
    holos: 1 / 3,
    lo: 1 / 10,
    hi: 0.97,
    basis: "Climate models",
    sources: [
      {
        who: "Coy, Kite and Graham 2025",
        url: "https://iopscience.iop.org/article/10.3847/PSJ/adf643",
        found:
          "Lifeless Earth-like worlds stay livable 4 billion years in about 32% of runs, 10 to 97% across setups.",
      },
      {
        who: "Arthur and Nicholson 2023",
        url: "https://arxiv.org/abs/2301.02150",
        found: "Many living worlds tend to keep their conditions livable.",
      },
      {
        who: "Chopra and Lineweaver 2016",
        url: "https://doi.org/10.1089/ast.2015.1387",
        found: "Almost all early life dies before it can steady its world.",
      },
      {
        who: "Nicholson et al. 2018",
        url: "https://arxiv.org/abs/1803.08063",
        found: "Models show life both steadying and failing its world.",
      },
    ],
  },
  {
    key: "animals",
    label: "Life reaches animals",
    holos: 3 / 5,
    lo: 1 / 5,
    hi: 0.9,
    basis: "Waiting on oxygen",
    sources: [
      {
        who: "Mills et al. 2025",
        url: "https://doi.org/10.1126/sciadv.ads5698",
        found: "Each step waited for oxygen, and humans arose on time.",
      },
      {
        who: "Poulton et al. 2021",
        url: "https://doi.org/10.1038/s41586-021-03393-7",
        found: "Oxygen air lasted from about 2.3 billion years ago.",
      },
      {
        who: "Reinhard et al. 2017",
        url: "https://arxiv.org/abs/1702.01137",
        found:
          "Animals and forests came with oxygen, about 4.0 billion years into Earth’s life.",
      },
    ],
  },
  {
    key: "minds",
    label: "Animals become a mind",
    holos: 1 / 6200,
    lo: 1e-10,
    hi: 1 / 2,
    basis: "Contested",
    sources: [
      {
        who: "Mills et al. 2025",
        url: "https://doi.org/10.1126/sciadv.ads5698",
        found:
          "No hard steps: minds should be common on old worlds with animals.",
      },
      {
        who: "Snyder-Beattie et al. 2021",
        url: "https://doi.org/10.1089/ast.2019.2149",
        found:
          "Hard steps: each took longer than Earth will last, so minds are very rare.",
      },
      {
        who: "Kipping 2020",
        url: "https://arxiv.org/abs/2005.09008",
        found: "Slightly favors rare intelligence, about 3 to 2.",
      },
    ],
  },
];

export const PRESETS: { name: string; set: Record<string, number> }[] = [
  { name: "Holos", set: {} },
  { name: "Minds come easy", set: { minds: 1 / 10 } },
  { name: "Minds are rare", set: { minds: 1e-8 } },
  {
    name: "Life is rare",
    set: { start: 1 / 100, last: 1 / 10, minds: 1 / 6200 },
  },
];

/** Stars in our Galaxy, Holos's 200 billion, and what they weigh, Licquia and Newman 2015, so stars per Sun's mass. */
const GALAXY = 2e11;
const PER_SUN = GALAXY / 6.08e10;
/** Minds that woke within ±1 year of us, as a share of all: 7 of 200,000 within ±100,000 years (calcs/minds.py). */
const PEER_PER_YEAR = 7 / 2e5 / 1e5;

// The thin disk of calcs/minds.py: stars per cubic parsec here, scale height, scale length, the Sun's radius (pc).
const N0 = 0.1,
  HZ = 300,
  HR = 2600,
  R0 = 8200,
  PC_LY = 3.261563777;

/** Thin-disk stars within each radius, integrated once over shells, out to 100,000 ly. */
const TABLE = (() => {
  const steps = 1000,
    top = 1e5 / PC_LY,
    dr = top / steps,
    out: number[] = [0];
  let tot = 0;
  for (let i = 0; i < steps; i++) {
    const r = (i + 0.5) * dr;
    let s = 0;
    for (let j = 0; j < 24; j++) {
      const mu = -1 + ((j + 0.5) * 2) / 24,
        rho = r * Math.sqrt(1 - mu * mu);
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
  const x = Math.abs(z) / Math.SQRT2,
    t = 1 / (1 + 0.3275911 * x);
  const erf =
    1 -
    t *
      (0.254829592 +
        t *
          (-0.284496736 +
            t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) *
      Math.exp(-x * x);
  return z < 0 ? (1 - erf) / 2 : (1 + erf) / 2;
}

/** Stars within r light-years of the Sun: the disk, with the rest of the Galaxy's count at its center, 26,700 ly away. */
function starsWithin(ly: number): number {
  const x = Math.min(ly, 1e5) / TABLE.dly,
    i = Math.min(Math.floor(x), TABLE.out.length - 2);
  // Between rows, along the cube root, so a small radius keeps its r³.
  const a = Math.cbrt(TABLE.out[i]),
    b = Math.cbrt(TABLE.out[i + 1]);
  const disk = (a + (b - a) * (x - i)) ** 3;
  const core = (GALAXY - DISK) * normal((ly - R0 * PC_LY) / (1000 * PC_LY));
  return Math.min(GALAXY, disk + core);
}

// Beyond our Galaxy: Andromeda, Tamm et al. 2012, about 1.0 to 1.5 × 10¹¹ Suns, 2.5 million ly. Triangulum, its disk
// about 5 × 10⁹ Suns, 2.8 million ly. Past the Local Group, the cosmic average, about 5 × 10⁸ Suns per cubic Mpc.
const LOCAL: [ly: number, stars: number][] = [
  [2.5e6, 1.2e11 * PER_SUN],
  [2.8e6, 5e9 * PER_SUN],
];
const COSMIC = (5e8 * PER_SUN) / (PC_LY * 1e6) ** 3;

function starsOut(ly: number): number {
  const local = GALAXY + LOCAL.reduce((n, [d, s]) => n + (ly >= d ? s : 0), 0);
  return Math.max(local, (4 / 3) * Math.PI * ly ** 3 * COSMIC);
}

/** The distance at which half of draws hold one: where the count expected is ln 2. */
function median(perStar: number): { ly: number; beyond: boolean } {
  const want = Math.LN2 / perStar;
  if (want <= GALAXY) {
    let lo = 0,
      hi = 1e5;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (starsWithin(mid) < want) lo = mid;
      else hi = mid;
    }
    return { ly: hi, beyond: false };
  }
  let lo = 1e5,
    hi = 1e11;
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
      const n = Math.round(p * d),
        off = Math.abs(n / d - p);
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
  const words: [number, string][] = [
    [1e12, "trillion"],
    [1e9, "billion"],
    [1e6, "million"],
  ];
  for (const [v, w] of words)
    if (n >= v) return `${+(n / v).toPrecision(2)} ${w}`;
  return (+n.toPrecision(2)).toLocaleString("en-US");
}

/** A distance in light-years, or millions of them. */
export function far(ly: number): string {
  return `${round(ly)} light-years`;
}
