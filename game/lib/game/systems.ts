// Each lead's star and what we know goes round it, for the drawing of its system on the lead's page. Real where
// published, as of October 2026: worlds by their tug, with periods, least masses and distances from their stars, and
// belts of dust. What no one knows stays out: most orbits' tilts, and sizes. A world a seed felt brings only itself,
// and the rest of its system is unknown, as it would be to Earth in 2040. Warm zones are this project's, from Kopparapu
// et al. 2013's conservative limits. Sources in HOLOS_RESEARCH.md, "Lead systems, checked 2026-10-19".

export interface Body {
  name: string;
  /** Distance from its star, in AU, and how stretched its orbit is. */
  a: number;
  e: number;
  /** Its year, in days, and its least mass, in Earths. */
  days: number;
  mass?: number;
  /** Confirmed, or only claimed: a candidate not yet confirmed, or a claim others dispute. */
  status: "confirmed" | "candidate" | "disputed";
  /** The world the lead is about. */
  lead?: boolean;
}

export interface Belt {
  name: string;
  /** Inner and outer edge, in AU. */
  from: number;
  to: number;
}

export interface System {
  /** The star's surface warmth, in kelvin, for its color, and its brightness, in Suns, where known. */
  temp: number;
  lum?: number;
  hz?: [number, number];
  worlds: Body[];
  belts?: Belt[];
  /** Something farther out, beyond the drawing's edge, named in a line. */
  beyond?: string;
  /** Only the one world is known: the rest of the system is unknown. */
  unknown?: boolean;
}

export const SYSTEMS: Record<string, System> = {
  // Kervella et al. 2017 and Pineda et al. 2021 for the star, Suárez Mascareño et al. 2025 for b and d. c from Damasso
  // et al. 2020's least mass, Benedict and McArthur 2020's year and shape, and Kervella et al. 2020's distance, disputed
  // by Artigau et al. 2022 and not confirmed by NIRPS in 2025.
  "proxima-centauri": {
    temp: 2992,
    lum: 0.00157,
    hz: [0.042, 0.082],
    worlds: [
      { name: "d", a: 0.0288, e: 0, days: 5.12, mass: 0.26, status: "confirmed" },
      { name: "b", a: 0.0485, e: 0, days: 11.19, mass: 1.06, status: "confirmed", lead: true },
      { name: "c", a: 1.49, e: 0.04, days: 1928, mass: 5.8, status: "disputed" },
    ],
    beyond: "Alpha Centauri A and B, about 12,950 AU away",
  },
  // Nari et al. 2025 for the star and all three worlds. The 2011 forty-day world is now read as the star's turning.
  // Kennedy et al. 2015 for the dust, at 22 to 27 AU, beyond the drawing's edge.
  "82-eridani": {
    temp: 5473,
    lum: 0.687,
    hz: [0.83, 1.45],
    worlds: [
      { name: "b", a: 0.1257, e: 0.06, days: 18.31, mass: 2.15, status: "confirmed" },
      { name: "c", a: 0.3625, e: 0.08, days: 89.68, mass: 2.98, status: "confirmed" },
      { name: "d", a: 1.3541, e: 0.45, days: 647.6, mass: 5.82, status: "confirmed", lead: true },
    ],
    beyond: "A thin belt of dust at 22 to 27 AU",
  },
  // Pozuelos et al. 2020 for the star and b and c, confirmed by Astudillo-Defru et al. 2017. Tuomi et al. 2019 claimed
  // d and e, not yet confirmed.
  "luytens-star": {
    temp: 3382,
    lum: 0.0088,
    hz: [0.098, 0.19],
    worlds: [
      { name: "c", a: 0.0365, e: 0.17, days: 4.72, mass: 1.18, status: "confirmed" },
      { name: "b", a: 0.0911, e: 0.1, days: 18.65, mass: 2.89, status: "confirmed" },
      { name: "d", a: 0.712, e: 0.17, days: 413.9, mass: 10.8, status: "candidate" },
      { name: "e", a: 0.849, e: 0.03, days: 542, mass: 9.3, status: "candidate" },
    ],
  },
  // No world confirmed. Its dust, from Gáspár et al. 2023 with JWST and ALMA: a belt near 10 AU, dust between the
  // belts, and the main ring at 133 to 158 AU, its middle about 15 AU off the star. The "Great Dust Cloud" proved to
  // be a galaxy behind it, so it is left out.
  fomalhaut: {
    temp: 8590,
    lum: 16.6,
    worlds: [],
    belts: [
      { name: "inner belt", from: 8, to: 12 },
      { name: "dust between", from: 35, to: 133 },
      { name: "main ring", from: 133, to: 158 },
    ],
    beyond: "Its companions, 0.9 and 2.5 light-years out",
  },
};
