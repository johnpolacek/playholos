// How old are they, on /about/research: how long before us each mind woke, calcs/minds.py's head_start drawn many
// times. Its world's age less the time its mind took. 3 in 4 Earth-like worlds are older than Earth, by 1.8 ± 0.9
// billion years (Lineweaver 2001), the rest younger, evenly. A mind takes Earth's 4.54 billion years, faster or slower
// by each world's pace, 1.6 times at one sigma. Pure, so the page draws from it.
import type { Source } from "./dials.ts";
import { gauss, stream } from "./random.ts";

const EARTH_GYR = 4.54,
  OLDER_SHARE = 0.75,
  OLDER_K = 4,
  OLDER_THETA = 0.45,
  PACE = Math.log(1.6),
  OLDEST_GYR = 10.5;
/** The share of minds that woke within 100,000 years of us, either side, from calcs/minds.py. */
export const PEER_SHARE = 1.6e-5;
/** The timeline runs back this far, in billions of years. */
export const SPAN = 7;
export const BIN = 0.1;

/** Earth then, so a head start reads as a time in our own past. Moody et al. 2024, Poulton et al. 2021. */
export const EARTH: { gyr: number; label: string; then: string }[] = [
  { gyr: 4.54, label: "Earth forms", then: "Earth had not yet formed" },
  {
    gyr: 4.2,
    label: "Life’s common ancestor",
    then: "Earth was newly formed, and lifeless",
  },
  {
    gyr: 2.3,
    label: "Oxygen fills the air",
    then: "Earth held only microbes, in air without oxygen",
  },
  {
    gyr: 0.6,
    label: "First animals",
    then: "Earth had oxygen air, and no animals yet",
  },
  { gyr: 0, label: "Us", then: "Earth had animals" },
];

/** What Earth was like a given number of billions of years ago. */
export function earthThen(gyr: number): string {
  let then = EARTH[EARTH.length - 1].then;
  for (let i = EARTH.length - 1; i >= 0; i--)
    if (gyr >= EARTH[i].gyr) then = EARTH[i].then;
  return then;
}

export interface Ages {
  /** Share of minds in each 0.1 billion-year bin, from now back to SPAN. */
  bins: number[];
  median: number;
  /** The middle two thirds. */
  lo: number;
  hi: number;
  /** Share of minds that woke more than `gyr` billion years ago. */
  awakeBy: (gyr: number) => number;
}

export function ages(n = 200_000, seed = 23): Ages {
  const r = stream(seed),
    out: number[] = [];
  while (out.length < n) {
    const world =
      r() < OLDER_SHARE
        ? Math.min(
            OLDEST_GYR,
            EARTH_GYR -
              OLDER_THETA *
                Math.log(
                  (r() || 1e-9) * (r() || 1e-9) * (r() || 1e-9) * (r() || 1e-9),
                ),
          )
        : r() * EARTH_GYR;
    const ahead = world - EARTH_GYR * Math.exp(gauss(r) * PACE);
    if (ahead > 1e-4) out.push(ahead);
  }
  out.sort((a, b) => a - b);
  const at = (q: number) => out[Math.floor(q * (n - 1))];
  const bins = Array.from({ length: Math.round(SPAN / BIN) }, () => 0);
  for (const a of out) if (a < SPAN) bins[Math.floor(a / BIN)] += 1 / n;
  const awakeBy = (gyr: number) => {
    let lo = 0,
      hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (out[mid] <= gyr) lo = mid + 1;
      else hi = mid;
    }
    return (n - lo) / n;
  };
  return { bins, median: at(0.5), lo: at(1 / 6), hi: at(5 / 6), awakeBy };
}

export const SOURCES: Source[] = [
  {
    who: "Lineweaver 2001",
    url: "https://arxiv.org/abs/astro-ph/0012399",
    found:
      "Earth-like worlds are on average 1.8 ± 0.9 billion years older than Earth.",
  },
  {
    who: "Lineweaver, Fenner and Gibson 2004",
    url: "https://arxiv.org/abs/astro-ph/0401024",
    found:
      "About 3 in 4 worlds in our Galaxy’s habitable zone are older than Earth.",
  },
  {
    who: "Behroozi and Peeples 2015",
    url: "https://arxiv.org/abs/1508.01202",
    found:
      "Earth is early among all worlds that will ever form, but young among those that exist now.",
  },
  {
    who: "Moody et al. 2024",
    url: "https://doi.org/10.1038/s41559-024-02461-1",
    found: "Life’s last common ancestor lived about 4.2 billion years ago.",
  },
  {
    who: "Poulton et al. 2021",
    url: "https://doi.org/10.1038/s41586-021-03393-7",
    found: "Oxygen air lasted from about 2.3 billion years ago.",
  },
];
