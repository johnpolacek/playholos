// Why the sky is quiet, on /about/research: a mind's waste heat glows at a wavelength set by how cold it runs, and the
// searches so far watched the warm end. Garrett 2026 puts mature minds at 5 to 28 K. Pure, so the page draws from it.
import type { Source } from "./dials.ts";

/** Coldest and warmest a mind might run, in kelvin: near the cosmic background, and room temperature. */
export const COLD = 3,
  WARM = 300;
/** The wavelengths drawn, in microns. */
export const FROM = 1,
  TO = 5000;

/** Where the glow of a grey body at T is brightest per log wavelength, in microns: hc / 3.92 kT. */
export const peak = (T: number) => 14388 / 3.92 / T;

/** That glow's brightness per log wavelength at λ microns, 1 at its peak. */
export function glow(T: number, um: number): number {
  const shape = (x: number) => x ** 4 / Math.expm1(x);
  const x = 14388 / (um * T);
  return x > 700 ? 0 : shape(x) / shape(3.92);
}

/** Where we have looked, by wavelength in microns. */
export const SEARCHES: {
  name: string;
  from: number;
  to: number;
  reach: string;
}[] = [
  { name: "WISE", from: 3.4, to: 22, reach: "whole sky" },
  { name: "JWST", from: 5, to: 28, reach: "star by star" },
  { name: "PRIMA", from: 24, to: 261, reach: "from 2033" },
  { name: "Herschel", from: 70, to: 500, reach: "hundreds of nearby stars" },
  { name: "ALMA, JCMT", from: 350, to: 3600, reach: "star by star" },
];

/** Where a glow peaking at λ microns falls among the searches. */
export function where(um: number): string {
  if (um <= 22)
    return "where WISE searched the whole sky, and nothing is confirmed";
  if (um <= 70)
    return "between the bands, where only JWST looks, one star at a time, until PRIMA flies in 2033";
  if (um <= 500)
    return "where Herschel looked at only a few hundred nearby stars";
  return "where only ALMA and JCMT look, one star at a time";
}

export const SOURCES: Source[] = [
  {
    who: "Garrett 2026",
    url: "https://arxiv.org/abs/2608.31153",
    found:
      "Mature minds may compute cold, at 5 to 28 K, glowing in the far infrared and submillimetre that older searches didn’t watch.",
  },
  {
    who: "Landauer, on dissipation",
    url: "https://research.ibm.com/publications/dissipation-and-noise-immunity-in-computation-and-communication",
    found:
      "Erasing a bit has a least heat cost, in step with temperature, so cold thought is cheap.",
  },
  {
    who: "Bennett, Hanson and Riedel 2019",
    url: "https://arxiv.org/abs/1902.06730",
    found:
      "Nothing forces a mind to wait for a colder universe, so cold minds can compute now.",
  },
  {
    who: "Griffith et al. 2015",
    url: "https://arxiv.org/abs/1504.03418",
    found:
      "Of about 100,000 galaxies in WISE, none turns more than 85% of its starlight into heat.",
  },
  {
    who: "Suazo et al. 2024",
    url: "https://arxiv.org/abs/2405.02927",
    found:
      "About five million stars screened for warm builds. Seven candidates, none confirmed.",
  },
  {
    who: "Wright et al. 2014",
    url: "https://arxiv.org/abs/1408.1133",
    found: "Waste-heat searches, and why no one behavior holds for all minds.",
  },
  {
    who: "NASA 2026, PRIMA",
    url: "https://www.nasa.gov/news-release/nasa-selects-far-infrared-telescope-as-first-in-new-mission-class/",
    found:
      "Our first far-infrared telescope since Herschel, aimed at a 2033 launch.",
  },
];
