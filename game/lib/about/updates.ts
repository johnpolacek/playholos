// What /about/updates shows: each recheck of the research, newest first, and the results the game waits on, by date.
// A recheck adds a round here, moves what resolved off the watch, and logs its sources in HOLOS_RESEARCH.md.

/** A result the game waits on. `when` is a month as YYYY-MM, the earliest date given when sources differ. */
export type Watch = {
  when: string;
  name: string;
  settles: string;
  /** Only a rough date is known, so the month is a guess. */
  rough?: boolean;
};

/** One recheck: what changed, and what in the game changed with it. */
export type Round = {
  date: string;
  checked: number;
  changed: { what: string; game?: string }[];
};

export const WATCH: Watch[] = [
  {
    when: "2026-11",
    name: "Hera’s close images",
    settles: "Didymos and the crater DART left, seen whole for the first time.",
  },
  {
    when: "2026-12",
    name: "DNA archives for sale",
    settles: "Biomemory’s first DNA storage, a medium that could outlast us.",
    rough: true,
  },
  {
    when: "2026-12",
    name: "Gaia DR4",
    settles: "New star census, planets felt by their sway, nearby black hole pairs.",
  },
  {
    when: "2026-12",
    name: "Rubin’s second preview",
    settles: "The first deep sky data, where Planet Nine gets tested.",
  },
  {
    when: "2027-01",
    name: "HARPS3 repair",
    settles: "When the ten-year hunt for Earth twins at Sun-like stars starts.",
  },
  {
    when: "2027-01",
    name: "Alpha Centauri A, rechecked",
    settles: "Whether the giant JWST glimpsed in our nearest twin’s warm zone is real.",
    rough: true,
  },
  {
    when: "2027-02",
    name: "Roman’s first science",
    settles: "A coronagraph in space, and Epsilon Eridani b’s clouds.",
    rough: true,
  },
  {
    when: "2027-03",
    name: "PLATO launch",
    settles: "A search for Earth-sized worlds in Sun-like stars’ warm zones.",
  },
  {
    when: "2027-03",
    name: "Starship refuels in orbit",
    settles: "Whether a ship can fill up in orbit, the key to cheap deep space.",
    rough: true,
  },
  {
    when: "2027-03",
    name: "OHISAMA",
    settles: "The first power beamed from orbit to the ground.",
    rough: true,
  },
  {
    when: "2027-05",
    name: "Dimorphos weighed",
    settles: "How hard DART pushed, and so how well we can move a rock.",
    rough: true,
  },
  {
    when: "2027-06",
    name: "Artemis III",
    settles: "Both Moon landers dock with Orion in Earth orbit.",
  },
  {
    when: "2027-06",
    name: "LuSEE-Night",
    settles: "The first radio telescope on the Moon’s quiet far side.",
    rough: true,
  },
  {
    when: "2027-09",
    name: "NEO Surveyor",
    settles: "A telescope to find the dark rocks that could hit Earth.",
  },
  {
    when: "2027-10",
    name: "SPARC’s first plasma",
    settles: "Whether a compact magnet can hold fusion fire at a gain.",
    rough: true,
  },
  {
    when: "2028-03",
    name: "SPHEREx star catalogs",
    settles: "102 colors of every star, a new screen for odd warm ones.",
    rough: true,
  },
  {
    when: "2028-04",
    name: "RAMSES launch",
    settles: "A craft to ride beside Apophis as it passes Earth.",
  },
  {
    when: "2028-06",
    name: "Helion’s power plant",
    settles: "The first fusion electricity sold, to Microsoft.",
    rough: true,
  },
  {
    when: "2028-06",
    name: "Tianwen-3 launch",
    settles: "Mars rocks home by 2031, and a test of past life.",
    rough: true,
  },
  {
    when: "2029-03",
    name: "ELT first light",
    settles: "A 39 m mirror, and air read on worlds next door.",
  },
  {
    when: "2029-04",
    name: "Apophis flyby",
    settles: "A 340 m rock passing inside our satellites’ orbits.",
  },
];

export const ROUNDS: Round[] = [
  {
    date: "2026-11-07",
    checked: 525,
    changed: [
      {
        what: "Andromeda’s merger odds: a 2026 study puts it near 90%, not a coin flip.",
        game: "We keep the coin flip for now. The study calls its own answer inconclusive, and Gaia’s next release may settle it.",
      },
      {
        what: "GJ 887 d: a warm-zone world 10.7 light-years away, found in 2026.",
        game: "Our Mind now knows it at Year 0, as a candidate.",
      },
      {
        what: "HARPS3 never started. Its cooler exploded on its first night.",
        game: "Its finds by 2036 still land before Year 0. The source text is fixed.",
      },
      {
        what: "Epsilon Indi Ab weighs 7.6 Jupiters, more than first thought.",
      },
      {
        what: "AI gets twice as efficient every 5 or 6 months, faster than the 8 we used.",
        game: "The yardstick for a neighbor’s gift is updated. Its steps hold.",
      },
      {
        what: "The odd heat of two Dyson sphere candidates came from galaxies behind them. The rest are still open.",
        game: "The design now says so.",
      },
      {
        what: "FAST listened to Groombridge 34 A and B, and heard nothing.",
        game: "Both now show as heard on the Research page’s star map.",
      },
      {
        what: "Hera reached Didymos. Starship reached orbit. Roman launched.",
      },
      {
        what: "Our catalog of neighbor galaxies has a new release, with 250 updated.",
        game: "Pinned to the new release. Our ten galaxies kept their numbers.",
      },
      {
        what: "About 19 papers we cited as drafts are now published.",
      },
      {
        what: "Two surveys of nearby galaxies find no galaxy-wide waste heat, under about 2 to 3%.",
        game: "It fits our quiet sky: no mind fills a galaxy.",
      },
      {
        what: "Mars may hold signs of past life, but the trip home lost its funding. China aims for 2031.",
      },
      {
        what: "Glass archives that last 10,000 years now work in the lab.",
      },
    ],
  },
];

/** A watch month as a fractional year, for placing it on a line. */
export const yearOf = (when: string) => {
  const [y, m] = when.split("-").map(Number);
  return y + (m - 0.5) / 12;
};

/** A watch month as words, like “Dec 2026”. */
export const monthOf = (when: string) =>
  new Date(`${when}-15T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
