import type { Plan } from "./types";

// A rock coming: the asteroids our surveys missed. By Year 0 NEO Surveyor and Rubin have mapped about 9 in 10 of those
// over 140 m, and none is coming. What is left are the smaller ones, and the few large ones still unmapped. Each game's
// seed decides whether one is on its way in the first 1,000 Years, at real rates, how wide, when we find it and when it
// would strike. Found in time, the Rock Deflector can push it aside, as DART pushed Dimorphos. Sources in
// HOLOS_RESEARCH.md, "A rock coming". Settled 2026-10-28.

/** The event the Rock Deflector waits on, as a build waits on the one before it. */
export const FOUND = "A rock found";

/** Strikes a Year by size, of rocks no survey had mapped by Year 0. 50 to 140 m: about one strike in 1,000 Years, a
 *  sample between Tunguska's and Chelyabinsk's rates, with about 6 in 10 still unmapped. Over 140 m: NEOMOD's 4.5% a
 *  millennium, with 1 in 10 unmapped. */
const RATES = [
  { from: 50, to: 140, perYear: 0.6 / 1000 },
  { from: 140, to: 1000, perYear: 0.0045 / 1000 },
];
/** Rocks grow rarer with size: of those wider than D, about D^-2.4. */
const SLOPE = 2.4;
/** The share found only days ahead, from the Sun's side as Chelyabinsk came, too late to push. A sample. */
const UNSEEN = 0.3;
/** How long before it strikes we find the rest, in Years. A sample: most come round more than once first. */
const LEAD = [3, 40] as const;

export interface Rock {
  /** How wide, in metres. */
  m: number;
  /** The Year we find it, or null if it comes unseen. */
  found: number | null;
  /** The Year it would strike Earth. */
  strikes: number;
}

/** The same numbers every time for a seed. */
function stream(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** This game's rock, the first of any coming in its first 1,000 Years, or null. */
export function rockOf(seed: number): Rock | null {
  const r = stream(seed);
  let first: Rock | null = null;
  for (const { from, to, perYear } of RATES) {
    const strikes = -Math.log(1 - r()) / perYear;
    const m = Math.min(to, from * (1 - r()) ** (-1 / SLOPE));
    const unseen = r() < UNSEEN;
    const lead = LEAD[0] + r() * (LEAD[1] - LEAD[0]);
    if (strikes > 1000 || (first && first.strikes <= strikes)) continue;
    first = { m: Math.round(m), strikes: Math.round(strikes * 10) / 10, found: unseen ? null : Math.max(0, Math.round((strikes - lead) * 10) / 10) };
  }
  return first;
}

/** The Rock Deflector: ten impactors of a tonne, at 6 km/s, each pushing with ejecta 3.6 times its own momentum, as
 *  DART's did. A year's flight to the rock. */
export const DEFLECTOR = { impactors: 10, kg: 1000, ms: 6000, beta: 3.6, flight: 1 };

/** Years before a strike the push must land, to move the rock two Earth radii aside: a push along its path grows about
 *  three times its speed change each second. Rock of 2,400 kg a cubic metre, as Dimorphos's. */
export function leadNeeded(m: number) {
  const mass = 2400 * (Math.PI / 6) * m ** 3;
  const dv = (DEFLECTOR.impactors * DEFLECTOR.kg * DEFLECTOR.ms * DEFLECTOR.beta) / mass;
  return (2 * 6.371e6) / (3 * dv) / 3.156e7;
}

/** What befalls the rock by a Year: not yet found, found and coming, pushed aside, or struck. */
export function rockAt(rock: Rock | null, plan: Plan, done: Record<string, number | null>, year: number) {
  if (!rock) return null;
  const ordered = plan.later?.some((o) => o.name === "Rock Deflector") ?? false;
  const ready = ordered ? done["Rock Deflector"] : null;
  const lands = ready == null ? null : ready + DEFLECTOR.flight;
  const pushed = lands !== null && lands <= rock.strikes - leadNeeded(rock.m);
  const state =
    year >= rock.strikes
      ? pushed ? "pushed" : "struck"
      : lands !== null && year >= lands && pushed
        ? "pushed"
        : rock.found !== null && year >= rock.found
          ? "coming"
          : "unknown";
  return { ...rock, state, lands, pushed, lead: leadNeeded(rock.m) } as const;
}

/** What a strike of this size does, from Tunguska and the impact literature. */
export function harm(m: number) {
  if (m < 100) return "an airburst like Tunguska's in 1908, which flattened 2,150 km² of forest";
  if (m < 300) return "a blast of hundreds of megatons, enough to lay waste a region";
  return "a blast that would wreck a continent and dim the sky for a Year";
}
