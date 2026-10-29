// Earth's history to this morning, as the mocks' "Where we come from" tells it. To 2026 it is real.
// After that each branch was rolled at its Metaculus odds, in calcs/seed.py.

/** The seed's branches from 2026 to 2040. Years only for the branches that happened. */
export interface EarthPast {
  taiwan: "invasion" | "blockade" | null;
  nuclear: boolean;
  mars: boolean;
  fusion: boolean;
  /** Compute at Year 0, as a share of what it would have been. */
  compute: number;
  years: Partial<Record<"taiwan" | "nuclear" | "mars" | "fusion", number>>;
}

export interface Moment {
  when: string;
  /** Years before 2040. */
  ago: number;
  what: string;
  detail?: string;
  /** The dial this moment set or moved. */
  dial?: string;
}

const DEEP: Moment[] = [
  { when: "4.6 billion", ago: 4.6e9, what: "The Sun forms", detail: "Earth forms with it." },
  { when: "3.7 billion", ago: 3.7e9, what: "First life, or earlier" },
  { when: "2.4 billion", ago: 2.4e9, what: "Oxygen fills the air" },
  { when: "300,000", ago: 3e5, what: "The first people" },
  { when: "5,000", ago: 5000, what: "Writing" },
];

/** Every moment to 2040, and how many of them this game rolled. */
export function history(e: EarthPast): { moments: Moment[]; rolled: number } {
  const y = e.years;
  const cut =
    e.compute < 0.99
      ? `Compute is ${Math.round(e.compute * 100)}% of what it would have been.`
      : "Output caught up. Compute is what it would have been.";
  const real: Moment[] = [
    ...DEEP,
    {
      when: "1945",
      ago: 95,
      what: "The bomb",
      detail:
        "Used twice in war" +
        (e.nuclear && y.nuclear ? `, then not for ${y.nuclear - 1945} years.` : ", and never since."),
    },
    {
      when: "1950s",
      ago: 85,
      what: "Radars sweep the sky",
      detail: "They still do. Then a message from Arecibo, 1974, and two records on the Voyagers, 1977.",
      dial: "set Open",
    },
    { when: "1969", ago: 71, what: "People on the Moon", detail: "Then a long pause, and back in 2028." },
    {
      when: "2022",
      ago: 18,
      what: "The race to build minds",
      detail: "Two decades went into compute, as fast as chips could be made.",
      dial: "set Bold",
    },
  ];
  const rolled: [number, Omit<Moment, "ago" | "when">][] = [];
  if (e.taiwan === "invasion" && y.taiwan)
    rolled.push([
      y.taiwan,
      { what: "The war for Taiwan", detail: `The best chip fabs were lost for years. ${cut}`, dial: "toward Hidden" },
    ]);
  if (e.taiwan === "blockade" && y.taiwan)
    rolled.push([
      y.taiwan,
      {
        what: "The blockade of Taiwan",
        detail: `No chips left the island for a year. ${cut}`,
        dial: "toward Cautious",
      },
    ]);
  if (e.nuclear && y.nuclear)
    rolled.push([
      y.nuclear,
      { what: "A nuclear weapon, used in war", detail: "One. Then none.", dial: "toward Cautious" },
    ]);
  if (e.mars && y.mars)
    rolled.push([
      y.mars,
      { what: "People on Mars", detail: "A small outpost, a few ships’ cargo.", dial: "toward Expand" },
    ]);
  if (e.fusion && y.fusion)
    rolled.push([y.fusion, { what: "Fusion on the grid", detail: "The first plants are small." }]);
  rolled.sort((a, b) => a[0] - b[0]);
  return {
    moments: [...real, ...rolled.map(([year, m]) => ({ ...m, when: String(year), ago: 2040 - year }))],
    rolled: rolled.length,
  };
}
