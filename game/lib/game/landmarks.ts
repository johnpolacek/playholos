// Known places beyond our reach, at their real positions, for the map to name. 2026-10-29, concept: known landmarks
// sit at their real places. Positions are ICRS, from SIMBAD (clusters, nebulae) and Gaia DR3 (the black holes'
// companion stars). Distances: SIMBAD's cluster parallaxes, Baumgardt & Vasiliev 2021 for globular clusters, and each
// discovery paper for the black holes. Sources in HOLOS_RESEARCH.md, landmarks. Gaia BH1 is a destination already
// (lib/game/leads.ts), so it isn't named here.
import { skyBasis } from "../../../src/coordinates.js";

export interface Landmark {
  id: string;
  name: string;
  line: string;
  /** Right ascension and declination, degrees. */
  ra: number;
  dec: number;
  ly: number;
  /** Rough radius in light-years, so a tap near it finds it. */
  size: number;
}

export const LANDMARKS: Landmark[] = [
  {
    id: "hyades",
    name: "The Hyades · 155 light-years",
    line: "The nearest star cluster, hundreds of stars born together 600 million years ago, now drifting apart.",
    ra: 67.447,
    dec: 16.948,
    ly: 155,
    size: 10,
  },
  {
    id: "pleiades",
    name: "The Pleiades · 443 light-years",
    line: "A young cluster, about 100 million years old. Its blue haze is dust it happens to be passing through.",
    ra: 56.601,
    dec: 24.114,
    ly: 443,
    size: 8,
  },
  {
    id: "praesepe",
    name: "The Beehive · 607 light-years",
    line: "An old open cluster, the Hyades’ twin in age. Planets have been found round some of its stars.",
    ra: 130.054,
    dec: 19.621,
    ly: 607,
    size: 10,
  },
  {
    id: "orion",
    name: "The Orion Nebula · 1,270 light-years",
    line: "The nearest big nursery of stars. Thousands are forming there now, many with disks that will make worlds.",
    ra: 83.82,
    dec: -5.388,
    ly: 1270,
    size: 12,
  },
  {
    id: "bh3",
    name: "Gaia BH3 · 1,920 light-years",
    line: "A black hole of 33 Suns, the heaviest known from a star. Its companion is old and poor in metals.",
    ra: 294.828,
    dec: 14.931,
    ly: 1920,
    size: 6,
  },
  {
    id: "bh2",
    name: "Gaia BH2 · 3,800 light-years",
    line: "A black hole of about 9 Suns, with a red giant on a wide orbit that takes three and a half years.",
    ra: 207.57,
    dec: -59.239,
    ly: 3800,
    size: 6,
  },
  {
    id: "crab",
    name: "The Crab Nebula · 6,500 light-years",
    line: "What a star left when it blew up in 1054, seen by day for weeks. A pulsar spins at its heart 30 times a second.",
    ra: 83.632,
    dec: 22.017,
    ly: 6500,
    size: 6,
  },
  {
    id: "47tuc",
    name: "47 Tucanae · 14,700 light-years",
    line: "A globular cluster of about a million stars, older than the Sun by twice over, packed into 120 light-years.",
    ra: 6.022,
    dec: -72.081,
    ly: 14700,
    size: 60,
  },
  {
    id: "omegacen",
    name: "Omega Centauri · 17,700 light-years",
    line: "The biggest globular cluster round our galaxy, ten million stars. It may be the core of a galaxy ours swallowed.",
    ra: 201.697,
    dec: -47.479,
    ly: 17700,
    size: 80,
  },
];

/** Where a landmark sits in the atlas frame, light-years: (Galactic X, Galactic Z, -Galactic Y), as the star catalogs. */
export function landmarkAt({
  ra,
  dec,
  ly,
}: Landmark): [number, number, number] {
  const r = skyBasis(ra, dec).radial;
  return [r.x * ly, r.y * ly, r.z * ly];
}
