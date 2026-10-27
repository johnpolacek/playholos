// Proxima b's truth, for each game. The world next door is real and known, but no one has read its air, so the seed
// never drew it. Here it is drawn as calcs/seed.py's rung() draws a natural world, from the same physics: the cosmic
// shoreline with Pass et al. 2025's factor for a fully convective red dwarf, each world's luck, and Earth's pace of
// life. Its true mass comes from its least mass and a pole drawn at random, and past 2 Earths it keeps thick gas, as
// Chen and Kipping 2017 have it. Drawn on the server only, behind the knowledge wall, and found only when our sails or
// probe send word home. Sources in HOLOS_RESEARCH.md, "Proxima b's nature, drawn". 2026-10-22.

export const RUNGS = [
  "bare rock",
  "airy and lifeless",
  "hiding microbes",
  "showing oxygen",
  "with animals and forests",
  "where life died",
] as const;
export type Nature = (typeof RUNGS)[number] | "a small gas world";

const PROXIMA = { lum: 0.00157, a: 0.0485, msini: 1.055 };
/** The Alpha Centauri system's ages, in billions of years: Alpha Centauri A's 20 in Ware et al. 2026 run 4.2 to 6.7. */
const AGES = [4.2, 6.7];
// calcs/seed.py's samples.
const SHORE_LUCK = 0.5;
const STARTED = 0.75;
const DIED = 0.2;
const PACE = Math.log(1.6);
const OXYGEN_AT = 2.3;
const RICH_AT = 4.0;
const GAS_AT = 2.0;

/** A stream of numbers in [0, 1) from a string, the same every time. */
function stream(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function proximaB(seed: number): { mass: number; nature: Nature } {
  const rand = stream(`${seed}:proxima-b`);
  const gauss = (sd: number) => sd * Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  // Its pole at random: the tug shows only mass times the sine of its tilt to us.
  const mass = PROXIMA.msini / Math.sqrt(1 - (2 * rand() - 1) ** 2);
  const luck = gauss(SHORE_LUCK);
  const [start, died, pace] = [rand(), rand(), Math.exp(gauss(PACE))];
  const age = AGES[0] + rand() * (AGES[1] - AGES[0]);
  if (mass > GAS_AT) return { mass, nature: "a small gas world" };
  const radius = mass ** (1 / 3.7);
  const dose = (PROXIMA.lum ** 0.4 / PROXIMA.a ** 2) * 3.1;
  const shore = 4 * Math.log10(11.19 * Math.sqrt(mass / radius)) - Math.log10(dose) - 3.16;
  // A red dwarf barely brightens, so its warm worlds were never frozen, and life's clock starts at its birth.
  const nature: Nature =
    shore + luck <= 0
      ? RUNGS[0]
      : start >= STARTED
        ? RUNGS[1]
        : died < DIED
          ? RUNGS[5]
          : age < OXYGEN_AT * pace
            ? RUNGS[2]
            : age < RICH_AT * pace
              ? RUNGS[3]
              : RUNGS[4];
  return { mass, nature };
}
