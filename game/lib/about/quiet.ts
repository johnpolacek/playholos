// Why the sky is quiet, on /about/research: a mind's waste heat glows at a wavelength set by how cold it runs, and the
// searches so far watched the warm end. Garrett 2026 puts mature minds at 5 to 28 K. The limits are in haystack.ts.
import type { Source } from "./dials.ts";

/** Coldest and warmest a mind might run, in kelvin: near the cosmic background, and room temperature. */
export const COLD = 3,
  WARM = 300;
/** Where the glow of a grey body at T is brightest per log wavelength, in microns: hc / 3.92 kT. */
export const peak = (T: number) => 14388 / 3.92 / T;

export const SOURCES: Source[] = [
  {
    who: "IRAS explanatory supplement",
    url: "https://heasarc.gsfc.nasa.gov/W3Browse/catalog/iraspsc.html",
    found:
      "The 1983 all-sky map is complete to about 0.4, 0.5, 0.6 and 1.0 Jy at 12, 25, 60 and 100 µm.",
  },
  {
    who: "AKARI bright source catalogue",
    url: "https://www.ipac.caltech.edu/doi/10.26131/IRSA180",
    found: "An all-sky far-infrared map, about 0.55 Jy at 90 µm.",
  },
  {
    who: "AllWISE explanatory supplement",
    url: "https://irsa.ipac.caltech.edu/data/WISE/docs/release/AllWISE/expsup/sec2_3a.html",
    found: "The whole sky at 12 µm, to about 0.73 mJy.",
  },
  {
    who: "Price et al. 2020",
    url: "https://arxiv.org/abs/1906.07750",
    found:
      "Breakthrough Listen heard no steady tone above 2.1 × 10¹² W from 1,327 stars, out to 50 pc, at 1.1 to 3.45 GHz.",
  },
  {
    who: "Wright, Kanodia and Lubar 2018",
    url: "https://arxiv.org/abs/1809.07252",
    found:
      "Radio searches so far cover about 6 × 10⁻¹⁸ of the haystack: a hot tub against Earth’s oceans.",
  },
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
