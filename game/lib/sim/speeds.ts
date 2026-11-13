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
/** A bullet's speed, as a share of light speed: 1,000 t on a Fusion Drive, held to a tenth. Ours went 2026-11-13. It
 *  stays as the measure of a bullet's harm, lib/sim/conflict.ts's bulletMt, which the watcher's maker strikes with. */
export const BULLET_C = SPEEDS.bullet;

/** The ions a craft brakes on at a star, a cm³: a warm cloud's at the few stars known to sit in one, by the winds they
 *  show, and the thinner gas between the clouds everywhere else. A pair's stars share their cloud. */
export const gasAt = (star?: string) => (star && GAS.inCloud.some((s) => star === s || star.startsWith(`${s} `)) ? GAS.cloud : GAS.between);

/** How much longer a stop is for the fibre that holds the loop together. A current loop pushes itself outward, and
 *  what holds it weighs at least its stored energy over its fibre's strength: the virial limit. The best current grows
 *  with the craft's speed, so the faster the craft, the more of its loop is fibre, the narrower the loop, and the
 *  longer the stop, by the square. The strongest fibre measured, at break: the least it can weigh. 2026-11-12. */
const loopWeight = (beta: number) => (1 + (SAIL.hoop * beta) / Math.sqrt(1 - beta ** 2)) ** 2;
/** Relativity's factors on a stop's distance and its time at a speed, between the worked speeds by a straight line. */
function rel(beta: number): [number, number] {
  const k = Math.min(SAIL.rel.length - 2, Math.floor(beta * 20));
  const [b0, x0, t0] = SAIL.rel[k], [b1, x1, t1] = SAIL.rel[k + 1];
  const w = (beta - b0) / (b1 - b0);
  return [x0 + (x1 - x0) * w, t0 + (t1 - t0) * w];
}
/** A stop's length before relativity, in ly: the craft's speed squared over the gas and its own mass, by its loop's
 *  fibre. */
const stop0 = (beta: number, n: number, tonnes: number) => (SAIL.gros * beta ** 2 * loopWeight(beta)) / (n * tonnes);
/** How far a craft takes to stop on its sail alone, in ly. */
const stopLy = (beta: number, n: number, tonnes: number) => stop0(beta, n, tonnes) * rel(beta)[0];
/** Deuterium for the burn that ends a stop, tonnes a tonne: a tenth of the craft's speed on its own engine. */
const finishFuel = (beta: number) => Math.exp(beta / 10 / SAIL.finishVe) - 1;
/** That burn's own engine, as a share of the craft it stops, its fuel aside: about a fifth. The burn lasts twice the
 *  Years it costs over cruising, which sets its thrust, and Firefly's engine weighs so much a newton. The big engine
 *  that launched the craft is long dropped. calcs/speeds.py's finish_engine. 2026-11-12. */
const finishEngine = (beta: number) => (SAIL.engine * finishFuel(beta) * SAIL.finishVe * 299_792_458) / (((2 * SAIL.burnPerC * beta) / 10) * 3.15576e7);
/** What a craft weighs with its finishing engine and that burn's fuel aboard, over what it weighs without. */
/** The speed a beam gives a ship of `weight` times its own mass, by the beam's own relation: calcs/speeds.py's
 *  heavy_beta. The bare speed over the root of the weight reads up to 9% low on the Wide Beam. */
function heavyBeta(weight: number, wide: boolean) {
  const { step, rows } = SPEEDS.heavy;
  const i = Math.min(rows.length - 2, Math.max(0, Math.floor((weight - 1) / step)));
  const k = wide ? 2 : 1;
  return rows[i][k] + ((rows[i + 1][k] - rows[i][k]) * (Math.min(weight, rows[rows.length - 1][0]) - rows[i][0])) / (rows[i + 1][0] - rows[i][0]);
}
export const finishWeight = (beta: number) => (1 + finishFuel(beta)) / (1 - finishEngine(beta));
/** The Years stopping adds over cruising the same stretch: on the sail alone, or with a burn for the last tenth. */
function brakeYears(beta: number, n: number, tonnes: number, drive: boolean) {
  const x = stop0(beta, n, tonnes), [fx, ft] = rel(beta);
  return drive ? ((SAIL.tenth * ft - SAIL.covered * fx) * x) / beta + (SAIL.burnPerC * beta) / 10 : ((SAIL.stop * ft - fx) * x) / beta;
}
/** The speed that lands a craft soonest. Its stopping grows faster than its speed, so one speed is best: found where
 *  a little faster and a little slower take the same Years. calcs/speeds.py's best_beta. */
function bestBeta(d: number, n: number, tonnes: number, drive: boolean) {
  const years = (b: number) => d / b + brakeYears(b, n, tonnes, drive);
  let lo = 1e-4, hi = 0.89;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (years(mid * 1.0001) < years(mid * 0.9999)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
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
  // Its floor was 0.01 until 2026-11-13, which no craft reached until Andromeda.
  let lo = 1e-4, hi = WEAR.most;
  if (fits(hi)) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Which beam of ours threw a craft, if one did: none, the Ship Beam, or the Wide Beam, which is the Ship Beam in
 *  stepped colors from a patch ten times as wide. Its colors step bluer as the sail speeds up, so the sail's mirror
 *  reflects to nine tenths of light speed, and its spot holds ten times as far. calcs/mercury.py. 2026-11-12. */
export type Push = boolean | "wide";

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
 *  a tenth of light speed and a small drive of its own ends its stop. Pushed by a beam it may carry that small drive
 *  too, or none, and then it stops on its sail alone. */
export function stay(kind: keyof typeof CRAFT, d: number, n: number = GAS.between, beamed: Push = false, drive = !beamed): Trip {
  const { tonnes, front } = CRAFT[kind];
  // The Wide Beam's work could give a ship more than a third of light speed. It must still stop. `drive`: it carries a
  // small one to end its stop, as a craft on its own drive always does, and a thrown one may: the beam pushes that
  // weight too, and the sail must stop it.
  const push = beamed === "wide" ? SPEEDS.wide.ship.beam : beamed ? SPEEDS.beam : SPEEDS.fusion;
  if (!(d > 0)) return { beta: push, binds: "push", years: 0, stopLy: 0 };
  const shield = shieldBeta(d, tonnes, front);
  let weight = 1, beta = push, binds: Trip["binds"] = "push";
  // The finishing burn's fuel is dead weight: it slows a pushed craft's start, and the sail must stop it too.
  for (let i = 0; i < 40; i++) {
    const limits: [Trip["binds"], number][] = [["push", beamed && weight !== 1 ? heavyBeta(weight, beamed === "wide") : push], ["shield", shield], ["stopping", bestBeta(d, n / weight, tonnes, drive)]];
    [binds, beta] = limits.reduce((a, b) => (b[1] < a[1] ? b : a));
    weight = drive ? finishWeight(beta) : 1;
  }
  // A beam's push is the same force on a heavier craft, so it takes `weight` times as long to reach a speed.
  const start = beamed === "wide" ? ((SPEEDS.wide.ship.lost * beta) / SPEEDS.wide.ship.beam) * weight : beamed ? SPEEDS.beamStart * beta * weight : SAIL.burnPerC * beta;
  return { beta, binds, years: d / beta + brakeYears(beta, n / weight, tonnes, drive) + start, stopLy: stopLy(beta, n / weight, tonnes) * (drive ? SAIL.covered : 1) };
}

/** Years for our sails to pass a star `ly` away. */
export const sailYears = (ly: number) => ly / SAIL_C;
/** How far our sails go before dust wears through their shield: 16 ly, past which a sail never passes its star.
 *  calcs/speeds.py's SAIL_REACH, 2026-11-13. */
export const SAIL_REACH = SPEEDS.sailReach;
export const sailArrives = (ly: number) => ly <= SAIL_REACH;

/** How fast a flyby probe passes a star `ly` away, as a share of light speed. On its Fusion Drive its fuel holds it to
 *  a tenth. `pushed`: our Ship Beam threw it, with no engine or fuel. The beam does the same work on whatever rides its
 *  sail, so 150 t leaves at over a third of light speed, or slower on a road so long that dust would wear through its shield.
 *  calcs/speeds.py's probe_beta. 2026-11-12. On its drive too its shield holds it slower past about 12,500 ly:
 *  drive_probe_beta, 2026-11-13. */
export const flybyBeta = (ly: number, pushed: Push = false) =>
  Math.min(pushed ? (pushed === "wide" ? SPEEDS.wide : SPEEDS).probe.beam : PROBE.speed, shieldBeta(ly, SPEEDS.probe.tonnes, SPEEDS.probe.front));
/** Years for a flyby probe to pass a star `ly` away: its cruise, and what its burn or its push adds. It never brakes. */
export function flybyYears(ly: number, pushed: Push = false) {
  // Its burn is shorter when its shield holds it under a tenth. calcs/speeds.py's drive_probe_years.
  if (!pushed) {
    const beta = flybyBeta(ly);
    return ly / beta + (PROBE.burn * beta) / PROBE.speed;
  }
  if (!(ly > 0)) return 0;
  const beta = flybyBeta(ly, pushed), by = (pushed === "wide" ? SPEEDS.wide : SPEEDS).probe;
  return ly / beta + (by.lost * beta) / by.beam;
}
/** Years for a sentinel to reach a place `ly` away and stop, at the star of that name if it is one. */
export const sentinelYears = (ly: number, star?: string) => stay("sentinel", ly, gasAt(star)).years;
/** A sentinel's cruise alone, with no burn or braking counted. */
export const sentinelCruise = (ly: number) => ly / SPEEDS.fusion;
/** Years for a seed ship or a seed probe to land `ly` away, at the star of that name if it is one. `pushed`: our Ship
 *  Beam threw it, in place of its Fusion Drive. */
export const shipYears = (ly: number, pushed: Push = false, star?: string, drive = !pushed) => stay("ship", ly, gasAt(star), pushed, drive).years;
/** Whether our Ship Beam threw a ship, from the Years its start cost over cruising, as our orders keep it: the beam's
 *  push costs a fraction of a Year, and a Fusion Drive's burn 10. */
export const pushedBy = (start?: number): Push =>
  start === undefined ? false : Math.abs(start - SPEEDS.wide.ship.lost) < 1e-9 ? "wide" : start < catalog.seedShip.burn;
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
 *  between: its speed across our sky times that gap, `kms`, the star's own where our files hold its motion, else the
 *  middle speed of the stars near us. The slower the craft, the wider the miss. Benford and Benford
 *  2016, calcs/speeds.py beam_miss. 2026-11-12. */
export const beamMiss = (ly: number, beta: number, kms?: number | null) => ((kms || SPEEDS.seen.kms) / 299792.458) * (1 / beta - 1) * ly * (9.4607e15 / 1.495978707e11);
/** How far an awake old mind's works reach from its star, in AU: where a plate stays at its glow's 12 K, by the root
 *  of the star's light in Suns. 538 AU at a Sun, about 50 at a red dwarf. */
export const worksAU = (lum = 1) => SPEEDS.seen.worksAU * Math.sqrt(lum);
/** Whether a mind awake at that star sees the beam: only an old mind's, whose works reach the beam's line, by its
 *  star's light in Suns. A peer's swarm is under an AU wide, so no peer does. */
export const beamSeen = (ly: number, beta: number, lum = 1, kms?: number | null) => beta > 0 && beamMiss(ly, beta, kms) <= worksAU(lum);
/** How near a star must be for an awake old mind there to see the beam that throws a craft at this speed, in ly. */
export const seenWithin = (beta: number, lum = 1, kms?: number | null) => worksAU(lum) / beamMiss(1, beta, kms);

/** Our antimatter drive, once the Antimatter Works stands: a beamed core engine, Frisbee's two stages through Keane
 *  and Zhang's nozzle. It goes, cruises and stops by its own rocket, so its stop is the same at every star and needs no
 *  gas. Its heat holds it to a hundredth of a g. calcs/antimatter.py. 2026-11-12. */
const AM = SPEEDS.antimatter;
/** Its cruise `ly` off: the stages' most, or less where dust and gas would wear through its shield first. */
export const amBeta = (ly: number, kind: keyof typeof CRAFT = "sentinel") => Math.min(AM.beta, shieldBeta(ly, CRAFT[kind].tonnes, CRAFT[kind].front));
/** Years from leaving to stopped `ly` off: up to speed at a hundredth of a g, by the clock at home, a cruise, and down
 *  again. A road too short to reach its speed turns over halfway. */
export function amYears(ly: number, kind: keyof typeof CRAFT = "sentinel") {
  if (!(ly > 0)) return 0;
  const beta = amBeta(ly, kind), phi = Math.atanh(beta);
  const t = AM.cOverA * Math.sinh(phi), x = AM.cOverA * (Math.cosh(phi) - 1);
  return ly >= 2 * x ? 2 * t + (ly - 2 * x) / beta : 2 * AM.cOverA * Math.sinh(Math.acosh(1 + ly / 2 / AM.cOverA));
}
/** Antimatter it burns, tonnes, for a craft of this kind: 447 t for each tonne landed, and as much hydrogen. */
export const amTonnes = (kind: keyof typeof CRAFT = "sentinel") => CRAFT[kind].tonnes * AM.perTonne;
/** Years for a sentinel `ly` off, at the star of that name: on its fusion drive, or by antimatter if `am`. */
export const sentinelYearsBy = (ly: number, star?: string, am?: boolean) => (am ? amYears(ly, "sentinel") : sentinelYears(ly, star));
/** Years for a seed ship or seed probe to land, by the way it went: antimatter if `am`, else as `start` tells. */
export const landYears = (ly: number, start?: number, star?: string, drive?: boolean, am?: boolean) =>
  am ? amYears(ly, "ship") : shipYears(ly, pushedBy(start), star, drive || !pushedBy(start));
