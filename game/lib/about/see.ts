// What can we see, on /about/research: one Earth twin, about 10 parsecs away, as each rung of our sight shows it. Pure,
// so the page draws from it.
import type { Source } from "./dials.ts";
import { stream } from "./random.ts";

export interface Rung {
  key: string;
  name: string;
  /** Pixels across the world: 0 is unseen, 1 a dot. Past what the page can draw, a close view. */
  px: number;
  says: string;
}

export const RUNGS: Rung[] = [
  {
    key: "pull",
    name: "Feel its pull",
    px: 0,
    says: "First we feel it: its star sways about 9 cm/s as the world circles. Telescopes on Earth must watch it nightly for years to be sure.",
  },
  {
    key: "dot",
    name: "See a dot",
    px: 1,
    says: "A space telescope 6 to 8 m wide that blocks the starlight sees the world as one dot, in about 3 hours. NASA plans one for the 2040s.",
  },
  {
    key: "air",
    name: "Read its air",
    px: 1,
    says: "Spread into colors, that one dot’s light holds its air. Water takes days to read, oxygen up to 200 days on a hard target. Methane at Earth’s level is too faint to read at all.",
  },
  {
    key: "lens",
    name: "Map it",
    px: 1500,
    says: "Our Sun bends light like a lens. A probe 550 AU out, 17 years’ flight, could map the world at about 8 km a pixel, some 1,500 across.",
  },
  {
    key: "flyby",
    name: "Fly past",
    px: 640_000,
    says: "A probe flying through sees 20 to 200 m: coasts, cloud and patches of forest, for under a minute, decades after launch.",
  },
];

/** Where each air shows in the dot's light, in microns. Methane is drawn, too faint to read. */
export const LINES: {
  name: string;
  um: number;
  depth: number;
  faint?: boolean;
}[] = [
  { name: "Ozone", um: 0.6, depth: 0.12 },
  { name: "Water", um: 0.72, depth: 0.25 },
  { name: "Oxygen", um: 0.76, depth: 0.45 },
  { name: "Water", um: 0.82, depth: 0.3 },
  { name: "Methane", um: 0.89, depth: 0.06, faint: true },
  { name: "Water", um: 0.94, depth: 0.55 },
];

// An Earth-like world, made once: land, ice and cloud on a sphere from layered noise.
const hashes = (() => {
  const r = stream(5);
  return Array.from({ length: 512 }, () => r());
})();
const hash = (x: number, y: number, z: number) =>
  hashes[((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) & 511];
const ease = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, z: number): number {
  const X = Math.floor(x),
    Y = Math.floor(y),
    Z = Math.floor(z);
  const u = ease(x - X),
    v = ease(y - Y),
    w = ease(z - Z);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const at = (i: number, j: number, k: number) => hash(X + i, Y + j, Z + k);
  return lerp(
    lerp(
      lerp(at(0, 0, 0), at(1, 0, 0), u),
      lerp(at(0, 1, 0), at(1, 1, 0), u),
      v,
    ),
    lerp(
      lerp(at(0, 0, 1), at(1, 0, 1), u),
      lerp(at(0, 1, 1), at(1, 1, 1), u),
      v,
    ),
    w,
  );
}
export function layered(
  x: number,
  y: number,
  z: number,
  octaves: number,
): number {
  let sum = 0,
    amp = 0.5,
    f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * f, y * f, z * f);
    amp /= 2;
    f *= 2;
  }
  return sum / (1 - 0.5 ** octaves);
}

/** The world's color at a point on its sphere, with `octaves` of detail. */
export function surface(
  x: number,
  y: number,
  z: number,
  octaves = 6,
): [number, number, number] {
  const h = layered(x * 1.8 + 3, y * 1.8, z * 1.8, octaves);
  const cloud = layered(x * 2.6 + 9, y * 4, z * 2.6, octaves);
  let rgb: [number, number, number];
  if (Math.abs(y) > 0.93) rgb = [236, 240, 244];
  else if (h < 0.5) rgb = [22 + 30 * h, 52 + 50 * h, 96 + 60 * h];
  else {
    const dry = layered(x * 5, y * 5 + 4, z * 5, Math.max(2, octaves - 2));
    rgb = dry > 0.55 ? [160, 138, 96] : [70 + 40 * (h - 0.5), 104, 62];
  }
  const c = Math.max(0, Math.min(1, (cloud - 0.55) * 4));
  return [
    rgb[0] + (245 - rgb[0]) * c,
    rgb[1] + (247 - rgb[1]) * c,
    rgb[2] + (250 - rgb[2]) * c,
  ];
}

export const SOURCES: Source[] = [
  {
    who: "Terra Hunting Experiment",
    url: "https://arxiv.org/abs/1806.00518",
    found:
      "Ten years of nightly watching of Sun-like stars, to feel an Earth twin’s pull.",
  },
  {
    who: "Alei et al. 2025",
    url: "https://arxiv.org/abs/2512.05279",
    found:
      "An Earth twin at 10 pc is first seen in 3.2 hours with a 7.87 m mirror.",
  },
  {
    who: "Stark et al. 2024",
    url: "https://arxiv.org/abs/2405.19418",
    found: "A water search takes 3.5 to 22 days a world, by mirror size.",
  },
  {
    who: "Stark et al. 2025",
    url: "https://arxiv.org/abs/2502.18556",
    found: "Oxygen on a hard target takes about 200 days.",
  },
  {
    who: "Latouf et al. 2024",
    url: "https://arxiv.org/abs/2411.15089",
    found:
      "Methane at Earth’s level can’t be read at any signal we can gather.",
  },
  {
    who: "Habitable Worlds Observatory",
    url: "https://science.nasa.gov/astrophysics/programs/habitable-worlds-observatory/",
    found:
      "NASA’s telescope to image about 25 potentially habitable worlds, aimed at the 2040s.",
  },
  {
    who: "Turyshev et al. 2020",
    url: "https://arxiv.org/abs/2002.11871",
    found:
      "The Sun’s lens, past 548 AU, maps an exo-Earth at 30 pc at about 25 km a pixel.",
  },
  {
    who: "Eubanks et al. 2026",
    url: "https://arxiv.org/abs/2604.20182",
    found: "A flyby sees about 20 m at best, 200 m at a miss of 100,000 km.",
  },
];
