// How long each craft takes to cross the light-years: the one place the game works it out, so no screen, no word of
// the Mind's and no other mind's craft keeps its own copy. Speed is set by physics, never a round figure, 2026-11-11:
// a port of calcs/speeds.py, checked against it trip by trip in sim.test.mts.
//
// Four things bound a craft: its push, the wear of dust on its front, the radiation of gas striking at speed, and
// stopping. A craft that stops brakes on a magnetic sail (Gros 2017), on the thin gas between the stars: thicker in
// the warm clouds a few stars sit in, thinner between them. Faster shortens its cruise and lengthens its braking, so
// each trip has a speed that lands it soonest. The sail's drag fades as it slows, so a craft with a drive sheds its
// last tenth of speed by a short burn, and that burn's fuel is dead weight until then. Sources in HOLOS_RESEARCH.md,
// "What sets a craft's speed".
import catalog from "../../data/works.json" with { type: "json" };

const { probe: PROBE, speeds: SPEEDS } = catalog;
const { gas: GAS, sailing: SAIL, wear: WEAR, craft: CRAFT } = SPEEDS;

/** Sails of a few grams, pushed by our Laser Sail Array: a fifth of light speed, Starshot's. */
export const SAIL_C = SPEEDS.sail;
/** Our bullets, as a share of light speed: thrown by fusion, which holds them to a tenth. */
export const BULLET_C = SPEEDS.bullet;

/** The ions a craft brakes on at a star, a cm³: a warm cloud's at the few stars known to sit in one, by the winds they
 *  show, and the thinner gas between the clouds everywhere else. A pair's stars share their cloud. */
export const gasAt = (star?: string) => (star && GAS.inCloud.some((s) => star === s || star.startsWith(`${s} `)) ? GAS.cloud : GAS.between);

/** How far a craft takes to stop on its sail alone, in ly: its speed squared over the gas and its own mass. */
const stopLy = (beta: number, n: number, tonnes: number) => (SAIL.gros * beta ** 2) / (n * tonnes);
/** Deuterium for the burn that ends a stop, tonnes a tonne: a tenth of the craft's speed on its own engine. */
const finishFuel = (beta: number) => Math.exp(beta / 10 / SAIL.finishVe) - 1;
/** The Years stopping adds over cruising the same stretch: on the sail alone, or with a burn for the last tenth. */
function brakeYears(beta: number, n: number, tonnes: number, drive: boolean) {
  const x = stopLy(beta, n, tonnes);
  return drive ? ((SAIL.tenth - SAIL.covered) * x) / beta + (SAIL.burnPerC * beta) / 10 : ((SAIL.stop - 1) * x) / beta;
}
/** The speed that lands a craft soonest: where its cruise and its stopping take as long as each other. */
function bestBeta(d: number, n: number, tonnes: number, drive: boolean) {
  const k = drive ? ((SAIL.tenth - SAIL.covered) * SAIL.gros) / (n * tonnes) + SAIL.burnPerC / 10 : ((SAIL.stop - 1) * SAIL.gros) / (n * tonnes);
  return Math.sqrt(d / k);
}
/** What dust wears off a front over `d` ly, kg a m². */
const wear = (beta: number, d: number) => (WEAR.dust * (beta / 0.1) ** 2 * d) / 6;
/** How deep the gas's protons reach into graphite at this speed, kg a m². */
function protonRange(beta: number) {
  const pts = WEAR.range;
  const [lo, hi] = beta <= pts[1][0] ? [pts[0], pts[1]] : beta <= pts[2][0] ? [pts[1], pts[2]] : [pts[2], pts[3]];
  const k = Math.log(hi[1] / lo[1]) / Math.log(hi[0] / lo[0]);
  return lo[1] * (beta / lo[0]) ** k;
}
/** The fastest a craft can cross `d` ly before its shield outweighs its share of it. */
function shieldBeta(d: number, tonnes: number, front: number) {
  const budget = (WEAR.share * tonnes * 1000) / front;
  const fits = (beta: number) => wear(beta, d) + 3 * protonRange(beta) <= budget;
  let lo = 0.01, hi = WEAR.most;
  if (fits(hi)) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

export interface Trip {
  /** Its cruise, as a share of light speed. */
  beta: number;
  /** What holds it to that speed. */
  binds: "push" | "shield" | "stopping";
  /** Years from leaving to stopped. */
  years: number;
  /** How far out it begins to brake, in ly. */
  stopLy: number;
}

/** One of our craft sent `d` ly to stop there, through gas of `n` ions a cm³. On its Fusion Drive its fuel holds it to
 *  a tenth of light speed and the same drive ends its stop. Pushed by the Ship Beam it carries no drive, so it stops on
 *  its sail alone. */
export function stay(kind: keyof typeof CRAFT, d: number, n: number = GAS.between, beamed = false): Trip {
  const { tonnes, front } = CRAFT[kind];
  if (!(d > 0)) return { beta: beamed ? SPEEDS.beam : SPEEDS.fusion, binds: "push", years: 0, stopLy: 0 };
  const push = beamed ? SPEEDS.beam : SPEEDS.fusion, drive = !beamed;
  const shield = shieldBeta(d, tonnes, front);
  let weight = 1, beta = push, binds: Trip["binds"] = "push";
  // The finishing burn's fuel is dead weight: it slows a pushed craft's start, and the sail must stop it too.
  for (let i = 0; i < 40; i++) {
    const limits: [Trip["binds"], number][] = [["push", beamed ? push / Math.sqrt(weight) : push], ["shield", shield], ["stopping", bestBeta(d, n / weight, tonnes, drive)]];
    [binds, beta] = limits.reduce((a, b) => (b[1] < a[1] ? b : a));
    weight = drive ? 1 + finishFuel(beta) : 1;
  }
  const start = beamed ? SPEEDS.beamStart * beta : SAIL.burnPerC * beta;
  return { beta, binds, years: d / beta + brakeYears(beta, n / weight, tonnes, drive) + start, stopLy: stopLy(beta, n / weight, tonnes) * (drive ? SAIL.covered : 1) };
}

/** Years for our sails to pass a star `ly` away. */
export const sailYears = (ly: number) => ly / SAIL_C;
/** Years for a flyby probe to pass a star `ly` away: its cruise, and what its burn adds. It never brakes. */
export const flybyYears = (ly: number) => ly / PROBE.speed + PROBE.burn;
/** Years for a sentinel to reach a place `ly` away and stop, at the star of that name if it is one. */
export const sentinelYears = (ly: number, star?: string) => stay("sentinel", ly, gasAt(star)).years;
/** A sentinel's cruise alone, with no burn or braking counted. */
export const sentinelCruise = (ly: number) => ly / SPEEDS.fusion;
/** Years for a seed ship or a seed probe to land `ly` away, at the star of that name if it is one. `pushed`: our Ship
 *  Beam threw it, in place of its Fusion Drive. */
export const shipYears = (ly: number, pushed = false, star?: string) => stay("ship", ly, gasAt(star), pushed).years;
/** Whether our Ship Beam threw a ship, from the Years its start cost over cruising, as our orders keep it: the beam's
 *  push costs a fraction of a Year, and a Fusion Drive's burn 10. */
export const pushedBy = (start?: number) => start !== undefined && start < catalog.seedShip.burn;
/** Years for a bullet of ours to land `ly` away. It never brakes. */
export const bulletYears = (ly: number) => ly / BULLET_C;
/** How fast another mind throws what it sends `ly`, as a share of light speed. It never stops, and a mind with works
 *  hundreds of AU wide has push to spare, so only its shield binds it: a slender rod flies near nine tenths of light
 *  speed close by, and slower the farther dust wears it. calcs/speeds.py's thrown_beta. */
export const theirBeta = (ly: number) => shieldBeta(ly, SPEEDS.thrown.tonnes, SPEEDS.thrown.front);
/** Years for what another mind throws to cross `ly`. */
export const theirYears = (ly: number) => (ly > 0 ? ly / theirBeta(ly) : 0);
