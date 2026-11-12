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
/** How fast a flyby probe passes a star `ly` away, as a share of light speed. On its Fusion Drive its fuel holds it to
 *  a tenth. `pushed`: our Ship Beam threw it, with no engine or fuel. The beam does the same work on whatever rides its
 *  sail, so 150 t leaves at about four tenths, or slower on a road so long that dust would wear through its shield.
 *  calcs/speeds.py's probe_beta. 2026-11-12. */
export const flybyBeta = (ly: number, pushed = false) =>
  pushed ? Math.min(SPEEDS.probe.beam, shieldBeta(ly, SPEEDS.probe.tonnes, SPEEDS.probe.front)) : PROBE.speed;
/** Years for a flyby probe to pass a star `ly` away: its cruise, and what its burn or its push adds. It never brakes. */
export function flybyYears(ly: number, pushed = false) {
  if (!pushed) return ly / PROBE.speed + PROBE.burn;
  if (!(ly > 0)) return 0;
  const beta = flybyBeta(ly, true);
  return ly / beta + (SPEEDS.probe.lost * beta) / SPEEDS.probe.beam;
}
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
/** How fast a bullet of ours flies `ly`, as a share of light speed. On its Fusion Drive, a tenth. `pushed`: our Ship
 *  Beam threw it, as a rod of about 32 t with no engine, at the most its sail's mirror reflects, half of light speed,
 *  with a bullet's harm. Dust binds it only on a very long road. calcs/speeds.py's rod_beta. 2026-11-12. */
export const bulletBeta = (ly: number, pushed = false) => (pushed ? Math.min(SPEEDS.rod.beam, shieldBeta(ly, SPEEDS.thrown.tonnes, SPEEDS.thrown.front)) : BULLET_C);
/** Years for a bullet of ours to land `ly` away. It never brakes. */
export function bulletYears(ly: number, pushed = false) {
  if (!pushed) return ly / BULLET_C;
  if (!(ly > 0)) return 0;
  const beta = bulletBeta(ly, true);
  return ly / beta + (SPEEDS.rod.lost * beta) / SPEEDS.rod.beam;
}
/** How fast another mind throws what it sends `ly`, as a share of light speed. It never stops, and a mind with works
 *  hundreds of AU wide has push to spare, so only its shield binds it: a slender rod flies near nine tenths of light
 *  speed close by, and slower the farther dust wears it. calcs/speeds.py's thrown_beta. */
export const theirBeta = (ly: number) => shieldBeta(ly, SPEEDS.thrown.tonnes, SPEEDS.thrown.front);
/** Years another mind takes to ready what it throws `ly`. It throws a rod by a beam that already stands, as we can
 *  with our Ship Beam, so by parity it readies one as we do: by the rod's mass, which is what gives a bullet's harm at
 *  its speed. About a month near us, where its rod is lightest. Until 2026-11-12 it took a bullet's 32 Years.
 *  calcs/speeds.py's their_ready. */
export function theirReady(ly: number) {
  const energy = (beta: number) => 1 / Math.sqrt(1 - beta * beta) - 1;
  return (SPEEDS.rod.ready * energy(SPEEDS.rod.beam)) / energy(theirBeta(ly));
}
/** Years for what another mind throws to cross `ly`. */
export const theirYears = (ly: number) => (ly > 0 ? ly / theirBeta(ly) : 0);

/** How far a launch beam passes from its star, in AU. A craft is aimed where its star will be when it lands, and its
 *  beam points along its path. The beam's light is there in `ly` Years, the craft in ly / beta, and the star moves on
 *  between: its speed across our sky times that gap. The slower the craft, the wider the miss. Benford and Benford
 *  2016, calcs/speeds.py beam_miss. 2026-11-12. */
export const beamMiss = (ly: number, beta: number) => (SPEEDS.seen.kms / 299792.458) * (1 / beta - 1) * ly * (9.4607e15 / 1.495978707e11);
/** How far an awake old mind's works reach from its star, in AU: where a plate stays at its glow's 12 K, by the root
 *  of the star's light in Suns. 538 AU at a Sun, about 50 at a red dwarf. */
export const worksAU = (lum = 1) => SPEEDS.seen.worksAU * Math.sqrt(lum);
/** Whether a mind awake at that star sees the beam: only an old mind's, whose works reach the beam's line, by its
 *  star's light in Suns. A peer's swarm is under an AU wide, so no peer does. */
export const beamSeen = (ly: number, beta: number, lum = 1) => beta > 0 && beamMiss(ly, beta) <= worksAU(lum);
/** How near a star must be for an awake old mind there to see the beam that throws a craft at this speed, in ly. */
export const seenWithin = (beta: number, lum = 1) => worksAU(lum) / beamMiss(1, beta);
