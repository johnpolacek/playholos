// The haystack, on /about/research: what our searches have ruled out, and what is still possible. A mind of some
// heat and temperature, some distance away, shows in a survey if its glow in that survey's band beats the survey's
// faintest. Each survey rules out everything brighter, out to its reach. Pure, so the page draws from it.

const H = 6.626e-34,
  C = 2.998e8,
  K = 1.381e-23,
  SIGMA = 5.67e-8,
  LY = 9.461e15;

/** The share of a grey body's power, at T kelvin, that falls in each hertz at λ microns. */
export function perHz(um: number, T: number): number {
  const nu = C / (um * 1e-6),
    x = (H * nu) / (K * T);
  if (x > 700) return 0;
  return (
    (Math.PI * 2 * H * nu ** 3) / C ** 2 / Math.expm1(x) / (SIGMA * T ** 4)
  );
}

export interface Survey {
  name: string;
  /** Faintest it sees, in janskys, at a wavelength in microns. */
  bands: [um: number, jy: number][];
  /** How far it reaches, and how many stars or how much sky. */
  ly?: number;
  sky: string;
}

// WISE: AllWISE's explanatory supplement, W3 at 12 µm to about 0.73 mJy. IRAS: its explanatory supplement, complete
// to about 0.4, 0.5, 0.6 and 1.0 Jy at 12, 25, 60 and 100 µm. AKARI: its bright source catalogue, about 0.55 Jy at
// 90 µm. Herschel and JCMT: the nearby-star surveys read as limits by Garrett 2026, about 7e19 W at 10 pc, for minds
// cold enough to glow in their bands, as calcs/minds.py takes them.
export const SURVEYS: Survey[] = [
  { name: "WISE", bands: [[12, 7.3e-4]], sky: "whole sky" },
  {
    name: "IRAS",
    bands: [
      [12, 0.4],
      [25, 0.5],
      [60, 0.6],
      [100, 1.0],
    ],
    sky: "whole sky",
  },
  { name: "AKARI", bands: [[90, 0.55]], sky: "whole sky" },
];

/** Herschel's and JCMT's nearby stars: 7e19 W at 10 pc, out to 150 ly, for a glow peaking in their bands. */
export const NEARBY = { w: 7e19, at: 32.6, ly: 150, from: 70, to: 850 };

/** The least power a survey would have caught, at T kelvin and `ly` away. Infinity if it can't see that glow. */
export function least(s: Survey, T: number, ly: number): number {
  let best = Infinity;
  for (const [um, jy] of s.bands) {
    const f = perHz(um, T);
    if (f > 0)
      best = Math.min(best, (jy * 1e-26 * 4 * Math.PI * (ly * LY) ** 2) / f);
  }
  return best;
}

/** Where a glow at T peaks, in microns, as quiet.ts has it. */
const peakUm = (T: number) => 14388 / 3.92 / T;

export function nearbyLeast(T: number, ly: number): number {
  const p = peakUm(T);
  if (ly > NEARBY.ly || p < NEARBY.from || p > NEARBY.to) return Infinity;
  return NEARBY.w * (ly / NEARBY.at) ** 2;
}

/** The least power any search would have caught: below it, a mind is still possible. */
export function ruledAbove(T: number, ly: number): number {
  return Math.min(nearbyLeast(T, ly), ...SURVEYS.map((s) => least(s, T, ly)));
}

/** What the whole-sky maps rule out: they looked at every star. */
export function allSkyAbove(T: number, ly: number): number {
  return Math.min(...SURVEYS.map((s) => least(s, T, ly)));
}

/** Stars within ly of the Sun, at calcs/minds.py's 0.0028 a cubic light-year, so how few the targeted surveys saw. */
export const starsWithin = (ly: number) => (4 / 3) * Math.PI * ly ** 3 * 0.0028;
/** Holos's density, one mind per 1,600 stars, so how many minds a targeted survey's stars would hold. */
export const STARS_PER_MIND = 1600;
/** Herschel's DEBRIS and DUNES, and JCMT's SONS: about 580 stars between them, some shared. */
export const NEARBY_STARS = 580;

/** Radio: Breakthrough Listen's 1,327 stars, Price et al. 2020. No steady tone above 2.1e12 W at Green Bank, at the
 *  sample's 50 pc. Only tones, only 1.1 to 3.45 GHz, about 15 minutes a star. */
export const LISTEN = { w: 2.1e12, at: 163, stars: 1327 };
export const listenLeast = (ly: number) =>
  ly > LISTEN.at ? Infinity : LISTEN.w * (ly / LISTEN.at) ** 2;

/** Powers to measure by, in watts. */
export const MARKS: { name: string; w: number; radio?: boolean }[] = [
  { name: "Earth’s whole power use", w: 2e13 },
  { name: "A cold halo, Garrett 2026", w: 1e20 },
  { name: "A mind using its whole star, a Sun", w: 3.828e26 },
  { name: "Arecibo’s radar, aimed", w: 1e13, radio: true },
];
