// Earth's aimed messages before Year 0, as calcs/knocks.py lists them. Real sends on real dates; see
// HOLOS_RESEARCH.md, Earth's aimed messages.

/** Message, sent as a decimal year, target, light-years. */
export const KNOCKS: [string, number, string, number][] = [
  ["Message to Altair", 1983.62, "Altair", 16.73],
  ["Teen Age Message", 2001.67, "47 Ursae Majoris", 45.3],
  ["Cosmic Call 2", 2003.51, "Gliese 49", 31.83],
  ["Cosmic Call 2", 2003.51, "Gliese 208", 37.26],
  ["Cosmic Call 2", 2003.51, "55 Cancri", 41.05],
  ["Cosmic Call 2", 2003.51, "HD 10307", 41.55],
  ["Cosmic Call 2", 2003.51, "47 Ursae Majoris", 45.3],
  ["A Message From Earth", 2008.77, "Gliese 581", 20.55],
  ["Hello From Earth", 2009.66, "Gliese 581", 20.55],
  ["RuBisCo Stars", 2009.85, "Teegarden's Star", 12.5],
  ["RuBisCo Stars", 2009.85, "TZ Arietis", 14.58],
  ["RuBisCo Stars", 2009.85, "Kappa¹ Ceti", 30.26],
  ["Lone Signal", 2013.5, "Gliese 526", 17.73],
  ["Sónar Calling GJ273b", 2017.79, "Luyten's Star", 12.26],
  ["Sónar Calling GJ273b", 2018.37, "Luyten's Star", 12.26],
];

/** Earth's radars began sweeping the sky in the 1950s. */
export const RADARS_SINCE = 1950;

/** Each target's declination, J2000 degrees, for placing it in 3D. Its right ascension and distance are in sky.json. */
export const TARGET_DEC: Record<string, number> = {
  Altair: 8.87,
  "47 Ursae Majoris": 40.43,
  "Gliese 49": 62.35,
  "Gliese 208": 11.33,
  "55 Cancri": 28.33,
  "Gliese 581": -7.72,
  "TZ Arietis": 13.05,
  "Kappa¹ Ceti": 3.37,
  "Gliese 526": 14.89,
  "Luyten's Star": 5.23,
  "HD 10307": 42.61,
  "Teegarden's Star": 16.88,
};
