// Reach: spreading out into the Galaxy, probes first. At Year 0 there is nothing to send yet, so the tab shows how far
// we have gone and the two roads to the nearest star. Each can be queued before Begin, last in line. One queued is
// dated where the plan has it, and one not yet as if queued now, with this game's compute. Queued, a road can slow
// what is before it: see moves() in plan.ts. Distances at Year 0 are HOLOS_GAME_CONCEPT.md's. Built 2026-10-18.
import { bulletsReady } from "@/lib/sim/conflict";
import { bulletBeta, bulletYears, flybyBeta, flybyYears, gasAt, rodReady, SAIL_C, sailYears, sentinelYears, shipYears, stay, type Push } from "@/lib/sim/speeds";
import { fifthsOf, horizonOf, isOn, onFrom, ordersOf, pacedName, rodBy, schedule, searchOf } from "./plan";
import { grownSpans } from "./halo";
import type { Plan, Will } from "./types";
import { CATALOG, type Order, pace } from "@/lib/sim/works";
import { TOUR_FLIGHT } from "@/lib/sim/minds";

export const LY_AU = 63241;
const AU_KM = 149597870.7;
/** One hour of light, in AU: 499 light-seconds to the AU. */
export const LIGHT_HOUR_AU = 3600 / 499;

/** The near end of the line out: about 15,000 km, Earth up close. */
export const NEAR_AU = 1e-4;

/** From Earth outward: the Moon, the Sun, Neptune, and our farthest craft at Year 0. */
export const MARKS: { name: string; au: number; craft?: boolean }[] = [
  { name: "Earth", au: NEAR_AU },
  { name: "Moon", au: 384400 / AU_KM },
  { name: "Sun", au: 1 },
  { name: "Neptune", au: 30 },
  { name: "New Horizons", au: 100, craft: true },
  { name: "Voyager 1", au: 220, craft: true },
];

/** Where the two roads go: Proxima Centauri, the nearest star, for the world next door that no telescope we have can
 *  read. At Gaia's distance. Until 2026-10-19 they went to Alpha Centauri at calcs/early_game.py's 4.32 light-years. */
export const NEAREST = { name: "Proxima Centauri", ly: 4.24 };

/** Light-time, for the line's ticks. */
export const LIGHT: [label: string, au: number][] = [
  ["light-second", 1 / 499],
  ["light-minute", 60 / 499],
  ["light-hour", LIGHT_HOUR_AU],
  ["light-day", 24 * LIGHT_HOUR_AU],
  ["light-year", LY_AU],
];

/** The map's zoom, log10 of the km across half its short side, that frames a distance with room to spare. The line
 *  on the page and the map share it, so a place on one is a view on the other. */
export const zoomFor = (au: number) => Math.log10(1.4 * AU_KM * au);
export const auFor = (zoom: number) => 10 ** zoom / (1.4 * AU_KM);

export interface Road {
  name: string;
  /** Its place in our order, from 1, or null while it is not queued. */
  n: number | null;
  /** What we build first, and what flies. */
  build: string;
  craft: string;
  /** Its speed, as a share of light's. */
  speed: number;
  /** The Year the build is done, the craft leaves, it arrives, and its word reaches us. Null past the horizon. */
  done: number | null;
  leaves: number | null;
  arrives: number | null;
  home: number | null;
  /** Thrown by a beam, it carries a small drive and its fuel to end its stop. 2026-11-12. */
  carries?: boolean;
  /** Years its burns add over cruising. */
  extra?: number;
  /** Years it flies to a place so many light-years off, as lib/sim/speeds.ts has its kind of craft. 2026-11-11. */
  flies?: (ly: number) => number;
  /** Its speed to a place so many light-years off, where the road itself sets it. */
  fast?: (ly: number) => number;
  /** The Year the Deuterium Works is done, for a craft that burns its deuterium. */
  works?: number | null;
  /** The Year each thing a flyby probe waits on is done. */
  fuel?: Fuel;
  /** The beam that throws it, in place of a drive. */
  push?: string | null;
}

/** The Year each thing our fusion craft and flyby probes wait on is done. Null while it isn't, or isn't ours to build. */
export interface Fuel {
  works: number | null;
  yard: number | null;
  drive: number | null;
  beam: number | null;
  /** The Wide Beam's Year done, if it is in our order: from then it throws what the Ship Beam threw. 2026-11-12. */
  wide?: number | null;
}
type Done = (name: string) => number | null | undefined;
export const fuelOf = (at: Done): Fuel => ({ works: at("Deuterium Works") ?? null, yard: at("Probe Yard") ?? null, drive: at("Fusion Drive") ?? null, beam: at("Ship Beam") ?? null, wide: at("Wide Beam") ?? null });

/** Deuterium for our fusion craft, settled 2026-11-07 (m:235), from calcs/craft.py: a flyby probe burns about 6 kt and a
 *  sentinel about 41, and the Deuterium Works makes 8 kt a Year from the Year it is done. Each draws in the order it
 *  was sent, our Proxima probe first once the Probe Yard is ordered. A draw not yet in our plan comes last. */
const FLYBY_PROBE = CATALOG.probe;
const D_PER_YEAR = CATALOG.deuterium.perYear;
interface Draw {
  key: string;
  y: number;
  kt: number;
  /** A flyby probe, by the Year it was sent: the Ship Beam may throw it, and then it draws nothing. */
  probe?: number;
}
export const PROXIMA_PROBE = "probe:Proxima";
/** What a flyby probe needs built: its yard, a Fusion Drive and the Deuterium Works, as a sentinel. 2026-11-07. */
export const PROBE_NEEDS = ["Probe Yard", "Fusion Drive", "Deuterium Works"];
/** Or its yard and the Ship Beam, which throws it with no engine and no fuel. The beam does the same work on whatever
 *  rides its sail, so a probe of 150 t leaves at over a third of light speed: lib/sim/speeds.ts. 2026-11-12. */
export const PROBE_BEAM_NEEDS = ["Probe Yard", "Ship Beam"];
/** What a flyby probe needs: its drive and fuel, or, with the Ship Beam in our order and those not, the beam alone. */
export const probeNeeds = (plan: Plan) => (inOrder(plan, "Ship Beam") && !PROBE_NEEDS.every((n) => inOrder(plan, n)) ? PROBE_BEAM_NEEDS : PROBE_NEEDS);
/** When a flyby probe sent at Year `sent` leaves: built 12 Years after its yard and its drive or beam are done, by its
 *  drive once its deuterium is in at Year `fuel`, or by the Ship Beam, whichever is sooner. The beam throws it if the
 *  Ship Beam is done by then and not kept dark, as it does a seed ship: shipLeaves. */
export function probeLeaves(plan: Plan, f: Fuel, sent: number, fuel: number | null) {
  const both = (a: number | null, b: number | null) => (a === null || b === null ? null : Math.max(a, b));
  const drive = both(f.yard, f.drive), beam = both(f.yard, f.beam);
  const byDrive = drive === null || fuel === null ? null : Math.max(Math.max(sent, drive) + FLYBY_PROBE.build, fuel);
  const byBeam = beam === null ? null : onFrom(plan, "Ship Beam", Math.max(sent, beam) + FLYBY_PROBE.build);
  const leaves = byDrive === null ? byBeam : byBeam === null ? byDrive : Math.min(byDrive, byBeam);
  if (leaves === null) return { leaves: null, pushed: false as Push, ready: drive ?? beam };
  // The Wide Beam throws it, once it stands: it is the Ship Beam grown wider, and goes dark with it.
  const thrown = beam !== null && beam <= leaves && isOn(plan, "Ship Beam", leaves);
  const pushed: Push = thrown && f.wide != null && f.wide <= leaves ? "wide" : thrown;
  return { leaves, pushed, ready: pushed || drive === null ? beam : drive };
}
function draws(plan: Plan, f: Fuel): Draw[] {
  const all: Draw[] = plan.builds.includes("Probe Yard") ? [{ key: PROXIMA_PROBE, y: -Infinity, kt: FLYBY_PROBE.fuel, probe: -Infinity }] : [];
  for (const o of plan.flybys ?? []) if (o.by === "probe") all.push({ key: `probe:${o.name}`, y: o.y, kt: FLYBY_PROBE.fuel, probe: o.y });
  for (const o of plan.sentinels ?? []) all.push({ key: `sentinel:${o.name}`, y: o.y, kt: CATALOG.sentinel.fuel });
  all.sort((a, b) => a.y - b.y);
  // A probe the Ship Beam throws burns nothing, so it draws nothing. Each is settled in the order sent, by the
  // deuterium that would be left to it then.
  const out: Draw[] = [];
  let sum = 0;
  for (const d of all) {
    if (d.probe !== undefined && probeLeaves(plan, f, d.probe, f.works === null ? null : f.works + (sum + d.kt) / D_PER_YEAR).pushed) continue;
    sum += d.kt;
    out.push(d);
  }
  return out;
}
/** The Year a craft's deuterium is in, with the Works done at `f.works`. */
export function fuelReady(plan: Plan, f: Fuel, key: string, kt: number, y: number): number | null {
  const works = f.works;
  if (works === null) return null;
  const list = draws(plan, f);
  if (!list.some((d) => d.key === key)) list.push({ key, y, kt });
  let sum = 0;
  for (const d of list) {
    sum += d.kt;
    if (d.key === key) return works + sum / D_PER_YEAR;
  }
  return null;
}

/** Our deuterium at Year `now`, for the top's meter: what the Works holds free, the Year all we have sent for is in,
 *  and how full the craft now waiting is, or how far toward a sentinel's fuel the stock is. 2026-11-07, the Will's (a). */
export function deuteriumAt(plan: Plan, f: Fuel, now: number) {
  const works = f.works;
  if (works === null) return null;
  const made = Math.max(0, now - works) * D_PER_YEAR;
  const owed = draws(plan, f).filter((d) => d.y <= now);
  const sum = owed.reduce((n, d) => n + d.kt, 0);
  const until = works + sum / D_PER_YEAR;
  if (until <= now) return { stock: made - sum, until: null, fill: Math.min(1, (made - sum) / CATALOG.sentinel.fuel) };
  // The craft its fuel is going into now, and how much of its share is in.
  let cum = 0;
  for (const d of owed) {
    if (cum + d.kt > made) return { stock: 0, until, fill: (made - cum) / d.kt };
    cum += d.kt;
  }
  return { stock: 0, until, fill: 0 };
}

/** Each road where the plan has it, or else begun at Year `from`, last in line.
 *  Sails fly at a fifth of light speed, as Starshot's design. A flyby probe is built 12 Years after the yard, and flies
 *  once its deuterium is in, burning 20 Years to a tenth of light speed: an eighth, as Daedalus, needed helium-3 or an
 *  engine heavier than the probe. 2026-11-07. Its word comes home at light speed. */
export function roads(plan: Plan, scale: number, from = 0): Road[] {
  const { orders, ...opts } = ordersOf(plan);
  const memo = new Map<string, number | null>();
  const doneOf = (work: string) => {
    if (memo.has(work)) return memo.get(work)!;
    // Ordered in play counts too: it dated a build we had finished as if begun again now until 2026-11-05.
    const more: Order[] = inOrder(plan, work) ? [] : [{ y: from, begin: pacedName(work) }];
    const at = pace([...orders, ...more], horizonOf([...orders, ...more], 200), { scale, ...opts }).done[pacedName(work)] ?? null;
    memo.set(work, at);
    return at;
  };
  const sails = (): Road => {
    const done = doneOf("Laser Sail Array");
    const arrives = done === null ? null : done + sailYears(NEAREST.ly);
    const n = plan.builds.indexOf("Laser Sail Array") + 1 || null;
    return { name: "Send a sail", n, build: "Laser Sail Array", craft: "Sails", speed: SAIL_C, done, leaves: done, arrives, home: arrives === null ? null : arrives + NEAREST.ly, extra: 0, flies: sailYears };
  };
  // A flyby probe burns fusion, so it waits on a Fusion Drive as a sentinel does: the engine is the hard part, whatever
  // its size. 2026-11-07, the Will's call. Its yard's Year counts as done once all it needs is. Or the Ship Beam throws
  // it, 2026-11-12: then a drive and a Works that aren't in our order aren't begun for it.
  const beamed = probeNeeds(plan) === PROBE_BEAM_NEEDS;
  const ours = (work: string) => (beamed && !inOrder(plan, work) ? null : doneOf(work));
  const f: Fuel = {
    yard: doneOf("Probe Yard"), drive: ours("Fusion Drive"), works: ours("Deuterium Works"),
    beam: inOrder(plan, "Ship Beam") ? doneOf("Ship Beam") : null, wide: inOrder(plan, "Wide Beam") ? doneOf("Wide Beam") : null,
  };
  const { leaves, pushed, ready } = probeLeaves(plan, f, -Infinity, fuelReady(plan, f, PROXIMA_PROBE, FLYBY_PROBE.fuel, from));
  const arrives = leaves === null ? null : leaves + flybyYears(NEAREST.ly, pushed);
  const probe: Road = {
    name: "Send a flyby probe", n: plan.builds.indexOf("Probe Yard") + 1 || null, build: "Probe Yard", craft: "A flyby probe",
    speed: flybyBeta(NEAREST.ly, pushed), done: ready, leaves, arrives, home: arrives === null ? null : arrives + NEAREST.ly,
    extra: pushed === "wide" ? CATALOG.speeds.wide.probe.lost : pushed ? CATALOG.speeds.probe.lost : FLYBY_PROBE.burn, flies: (ly) => flybyYears(ly, pushed), fast: (ly) => flybyBeta(ly, pushed),
    works: f.works, fuel: f, push: pushed === "wide" ? "Wide Beam" : pushed ? "Ship Beam" : null,
  };
  return [sails(), probe];
}

/** A sail or flyby probe sent past any star, from its destination's page. Each leaves as `toward` dates it: when its
 *  build is ready, or once ordered, and passes at the road's speed. 2026-11-05. */
const FLYBY = { sails: 0, probe: 1 } as const;
type Flyby = NonNullable<Plan["flybys"]>[number];
export function flybyRoad(plan: Plan, scale: number, from: number, o: Flyby): Road {
  const road = roads(plan, scale, from)[FLYBY[o.by]];
  if (o.by !== "probe") return { ...toward(road, o.d, o.y), n: 1 };
  // Built 12 Years after the yard, or after its order once the yard stands, and flown once its own deuterium is in,
  // in its place among our draws.
  // Or thrown by the Ship Beam, if the beam is done and lit when the probe is ready: then it waits on no deuterium.
  const f = road.fuel!;
  const { leaves, pushed, ready } = probeLeaves(plan, f, o.y, fuelReady(plan, f, `probe:${o.name}`, FLYBY_PROBE.fuel, o.y));
  const arrives = leaves === null ? null : leaves + flybyYears(o.d, pushed);
  return {
    ...road, n: 1, done: ready, leaves, arrives, home: arrives === null ? null : arrives + o.d, speed: flybyBeta(o.d, pushed),
    extra: pushed === "wide" ? CATALOG.speeds.wide.probe.lost : pushed ? CATALOG.speeds.probe.lost : FLYBY_PROBE.burn, flies: (ly) => flybyYears(ly, pushed), fast: (ly) => flybyBeta(ly, pushed),
    push: pushed === "wide" ? "Wide Beam" : pushed ? "Ship Beam" : null,
  };
}
export function flybysOf(plan: Plan, scale: number) {
  // A probe flies only once all it needs is in our order. 2026-11-07.
  const works = probeNeeds(plan).every((n) => inOrder(plan, n));
  return (plan.flybys ?? []).flatMap((o) => {
    if (o.by === "probe" && !works) return [];
    const { leaves, arrives, home, speed, push } = flybyRoad(plan, scale, o.y, o);
    // Thrown by a beam, sails always and a probe on the Ship Beam, it carries its speed: who sees that beam turns on it.
    const thrown = o.by === "sails" || push ? { thrown: speed } : {};
    return leaves === null || arrives === null || home === null ? [] : [{ star: o.name, by: o.by, leaves, passed: arrives, home, ...thrown }];
  });
}

/** The Solar Lens's flight, from data/works.json: to the focal line, then half a Year of looking. Its word comes home
 *  from 548 AU, about 3 light-days. Turyshev and colleagues' NIAC study, 2020: about 25 km a pixel at 30 pc. */
const LENS = CATALOG.lens;
export const LENS_HOME = LENS.flight + LENS.look + LENS.au / LY_AU;
/** A lens's pixel, in km across a world `ly` away. */
export const lensKm = (ly: number) => (LENS.km30pc * ly) / (30 * 3.2616);

/** How a lens flies, by the strongest beam done when it leaves. The Star Beam pushes it out in about ten weeks, with a
 *  telescope 3 m wide that looks for a week. The Laser Sail Array, Starshot's 200 GW, pushes a 100 kg lens to about
 *  530 km/s, 5 Years out. Without either, a dive past the Sun, 17 Years. calcs/mercury.py. 2026-10-29. */
export function lensTrip(done: Record<string, number | null>, leaves: number) {
  const by = (n: string) => done[n] != null && done[n]! <= leaves;
  const push = by("Star Beam") ? "Star Beam" : by("Laser Sail Array") ? "Laser Sail Array" : null;
  const flight = push === "Star Beam" ? CATALOG.beams.beam : push ? CATALOG.beams.array : LENS.flight;
  const look = push === "Star Beam" ? CATALOG.beams.look : LENS.look;
  return { push, flight, look, home: flight + look + LENS.au / LY_AU };
}

/** Each lens we sent: its star, and the Year it leaves, once the Solar Lens is done, begins to look, and its picture
 *  reaches us. Null while the Solar Lens isn't done or ordered. 2026-10-26. */
export function lenses(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  return (plan.lenses ?? []).map((o) => {
    const leaves = done["Solar Lens"] == null ? null : Math.max(o.y, done["Solar Lens"]!);
    const trip = leaves === null ? null : lensTrip(done, leaves);
    return { star: o.name, leaves, looks: leaves === null ? null : leaves + trip!.flight, home: leaves === null ? null : leaves + trip!.home };
  });
}

/** A lens to a star as a road: the Solar Lens built, the lens leaving once it is done and sent, reaching the focus,
 *  and its picture home. Sent or not, dated as if sent at Year `from`, and the Solar Lens, if not in our order, as if
 *  begun then. */
export function lensRoad(plan: Plan, scale: number, from: number, star: string): Road & { push: string | null } {
  const { orders, ...opts } = ordersOf(plan);
  const ordered = plan.builds.includes("Solar Lens") || (plan.later ?? []).some((o) => o.name === "Solar Lens");
  const more: Order[] = ordered ? [] : [{ y: from, begin: pacedName("Solar Lens") }];
  const done = pace([...orders, ...more], horizonOf([...orders, ...more], 200), { scale, ...opts }).done[pacedName("Solar Lens")] ?? null;
  const sent = (plan.lenses ?? []).find((o) => o.name === star);
  const leaves = done === null ? null : Math.max(sent?.y ?? from, done);
  const trip = leaves === null ? null : lensTrip(schedule(plan, scale), leaves);
  const arrives = leaves === null ? null : leaves + trip!.flight;
  return {
    name: "Send a lens", n: sent ? 1 : null, build: "Solar Lens", craft: "A lens", speed: 0, done, leaves, arrives,
    home: leaves === null ? null : leaves + trip!.home, push: trip?.push ?? null,
  };
}

/** A sentinel, v1's and the neighbors' own probe: the Probe Yard builds it in 20 Years once the yard, a Fusion Drive
 *  and the Deuterium Works are done, and it leaves once its deuterium is in. It flies at a tenth of light speed, held
 *  there by its fuel, brakes on its magnetic sail, unseen, as our seed ships do (Gros 2017), and ends its stop with a
 *  short burn. How long that takes depends on the gas at its star: lib/sim/speeds.ts. Then it stays. 2026-10-26, its
 *  fuel and sail 2026-11-07, its stop by physics 2026-11-11. */
const SENTINEL = CATALOG.sentinel;
export const SENTINEL_NEEDS = ["Probe Yard", "Fusion Drive", "Deuterium Works"];
export const inOrder = (plan: Plan, name: string) => plan.builds.includes(name) || (plan.later ?? []).some((o) => o.name === name);

/** The Year each sentinel we sent leaves, by its star, once what it needs is done. Null while any of it isn't. */
export function sentinels(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const ready = SENTINEL_NEEDS.every((n) => done[n] != null) ? Math.max(...SENTINEL_NEEDS.map((n) => done[n]!)) : null;
  return (plan.sentinels ?? []).map((o) => {
    const fuel = fuelReady(plan, fuelOf((n) => done[n]), `sentinel:${o.name}`, SENTINEL.fuel, o.y);
    return { star: o.name, leaves: ready === null || fuel === null ? null : Math.max(Math.max(o.y, ready) + SENTINEL.build, fuel) };
  });
}
/** Years a sentinel takes from leaving to staying, `ly` out: its cruise, its burn, and its braking on its sail. */
export const sentinelTrip = sentinelYears;

/** Our bullets, each by its star and the Year it is fired: readied 20 Years after its order once the Strike Yard is
 *  done, and fired once the Helium-3 Harvest has gathered its fuel, after each bullet before it. Null while either
 *  isn't. 2026-10-28, its helium-3 2026-10-29. */
export function strikesOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const at = firing(plan, plan.strikes ?? [], done["Strike Yard"] ?? null, done["Ship Beam"] ?? null, done["Wide Beam"] ?? null, grownSpans(plan, scale, "Helium-3 Harvest"));
  return (plan.strikes ?? []).map((o, i) => ({ star: o.name, ...at[i] }));
}
/** When each bullet ordered is fired, and whether our Ship Beam throws it. One ordered once the Ship Beam stands is a
 *  rod of about 30 t with no engine: readied in about 7 months and thrown at half of light speed, with a bullet's
 *  harm and no helium-3, once the beam is let push. The rest are bullets on their Fusion Drives, and share the
 *  harvest among themselves. plan.ts's thrownAt, lib/sim/speeds.ts. 2026-11-12. */
function firing(plan: Plan, orders: readonly { y: number; d?: number }[], yard: number | null, beam: number | null, wide: number | null, harvest: readonly [number, number | null][]) {
  // Which beam throws each, if one does. One ordered once the Wide Beam stands is a lighter rod, readied sooner.
  const rod = orders.map((o) => rodBy(plan, beam, wide, o.y));
  const burned = bulletsReady(orders.filter((_, i) => !rod[i]).map((o) => o.y), yard, harvest);
  let k = 0;
  return orders.map((o, i): { fired: number | null; pushed: Push } =>
    rod[i]
      ? { fired: yard === null || beam === null ? null : onFrom(plan, "Ship Beam", Math.max(o.y, yard, beam) + rodReady(o.d ?? 0, rod[i])), pushed: rod[i] }
      : { fired: burned[k++], pushed: false },
  );
}

/** A sentinel to a star `ly` away as a road: what it needs built, the sentinel built and flying, arriving to stay, and
 *  its first word home. Sent or not, dated as if sent at Year `from`, and what it needs, if not in our order, as if
 *  begun then. */
export function sentinelRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = SENTINEL_NEEDS.filter((n) => !inOrder(plan, n)).map((n) => ({ y: from, begin: pacedName(n) }));
  const at = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done;
  const ready = SENTINEL_NEEDS.every((n) => at[pacedName(n)] !== undefined) ? Math.max(...SENTINEL_NEEDS.map((n) => at[pacedName(n)])) : null;
  const sent = (plan.sentinels ?? []).find((o) => o.name === star);
  const fuel = fuelReady(plan, fuelOf((n) => at[pacedName(n)]), `sentinel:${star}`, SENTINEL.fuel, sent?.y ?? from);
  const leaves = ready === null || fuel === null ? null : Math.max(Math.max(sent?.y ?? from, ready) + SENTINEL.build, fuel);
  const arrives = leaves === null ? null : leaves + sentinelTrip(ly, star);
  return { name: "Send a sentinel", n: sent ? 1 : null, build: "Probe Yard", craft: "A sentinel", speed: stay("sentinel", ly, gasAt(star)).beta, done: ready, leaves, arrives, home: arrives === null ? null : arrives + ly };
}
export const sentinelReady = (plan: Plan) => SENTINEL_NEEDS.every((n) => inOrder(plan, n));

/** A yard's Year done, as if begun at Year `from` when it isn't in our order. */
function yardDone(plan: Plan, scale: number, from: number, yard: string) {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = inOrder(plan, yard) ? [] : [{ y: from, begin: pacedName(yard) }];
  return pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done[pacedName(yard)] ?? null;
}

/** Our bullet at a star `ly` away, as a road: the Strike Yard, 20 Years to ready it once its helium-3 is in, and its flight at a tenth of light
 *  speed. Nothing comes home from it: its Year is the Year it lands. 2026-10-28. */
export function strikeRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road {
  const yard = yardDone(plan, scale, from, "Strike Yard");
  // Our harvest as it grows, or one begun now if it isn't in our order.
  const ordered = grownSpans(plan, scale, "Helium-3 Harvest");
  const begun = yardDone(plan, scale, from, "Helium-3 Harvest");
  const harvest: [number, number | null][] = ordered.length ? ordered : begun === null ? [] : [[begun, null]];
  const strikes = plan.strikes ?? [];
  const sent = strikes.find((o) => o.name === star);
  // Its place among our bullets: the helium-3 goes to each in the order ordered, and one not yet sent comes last.
  const order = sent ? strikes.map((o) => (o === sent ? { ...o, d: o.d ?? ly } : o)) : [...strikes, { y: from, d: ly }];
  const beam = inOrder(plan, "Ship Beam") ? yardDone(plan, scale, from, "Ship Beam") : null;
  const wide = inOrder(plan, "Wide Beam") ? yardDone(plan, scale, from, "Wide Beam") : null;
  const { fired: leaves, pushed } = firing(plan, order, yard, beam, wide, harvest)[sent ? strikes.indexOf(sent) : order.length - 1];
  const lands = leaves === null ? null : leaves + bulletYears(ly, pushed);
  return { name: "A bullet", n: sent ? 1 : null, build: "Strike Yard", craft: "A bullet", speed: bulletBeta(ly, pushed), done: yard, leaves, arrives: lands, home: lands, push: pushed === "wide" ? "Wide Beam" : pushed ? "Ship Beam" : null };
}

/** Our Mind on the Seed Ship to a black hole `ly` away, to stay: it leaves once the Seed Ship, its Fusion Drive and the
 *  Deuterium Works are done, flies at a tenth of light speed with calcs/seed.py's burn and braking, and stands alone
 *  as a Mind 20 Years after landing. Dated as if sent at Year `from` when not sent. 2026-10-26. */
const SHIP = CATALOG.seedShip;
export const SHIP_NEEDS = ["Seed Ship", "Fusion Drive", "Deuterium Works"];
/** The Ship Beam, done, pushes a seed ship in place of its drive and fuel: 1,000 TW from a patch of the swarm 1,000 km
 *  wide, on a 1 km sail, to a tenth of light speed in about 78 days and its most, about a seventh, in about 135. With no drive it
 *  stops on its magnetic sail alone, which sets its speed for each trip: lib/sim/speeds.ts. calcs/mercury.py.
 *  2026-11-10, its speed by physics 2026-11-11. */
export const BEAM_NEEDS = ["Seed Ship", "Ship Beam"];
/** What a seed ship needs: its drive and fuel, or, with the Ship Beam in our order and those not, the beam alone. */
export const shipNeeds = (plan: Plan) => (inOrder(plan, "Ship Beam") && !SHIP_NEEDS.every((n) => inOrder(plan, n)) ? BEAM_NEEDS : SHIP_NEEDS);
/** The Year a seed ship can leave, by its drive or by the beam, whichever is ready first, from each build's Year done. */
function shipReadyAt(at: (name: string) => number | null | undefined) {
  const all = (names: string[]) => (names.every((n) => at(n) != null) ? Math.max(...names.map((n) => at(n)!)) : null);
  const drive = all(SHIP_NEEDS), beam = all(BEAM_NEEDS);
  return drive === null ? beam : beam === null ? drive : Math.min(drive, beam);
}
/** A way a ship may go: the Year it leaves by it, which beam throws it, if one does, and whether it carries a small
 *  drive to end its stop. A ship on its own drive always does. */
interface ShipWay { leaves: number; pushed: Push; drive: boolean }
/** When a ship ordered at Year `sent` leaves, `build` Years after all it needs is done, the way it goes, and the Years
 *  its start costs over cruising. It may go three ways: on its own drive, thrown by the beam with no drive, or
 *  thrown with a small drive and its fuel aboard to end its stop, where a Fusion Drive and the Deuterium Works stand
 *  too. It goes the way that lands it soonest `ly` off, since 2026-11-12: until then it left by whichever was ready
 *  first, and so was thrown to Proxima where its own drive landed it 10 Years sooner. With no distance, an order from
 *  before that date, it leaves by the first way ready, as it did. The beam throws it only while not kept dark:
 *  plan.ts's SWITCHED. The Wide Beam throws it once it stands. `at` is each build's Year done. */
export function shipLeaves(plan: Plan, at: (name: string) => number | null | undefined, sent: number, build = 0, ly?: number, star?: string) {
  const all = (names: string[]) => (names.every((n) => at(n) != null) ? Math.max(...names.map((n) => at(n)!)) : null);
  const own = all(SHIP_NEEDS), beam = all(BEAM_NEEDS), both = all([...BEAM_NEEDS, "Fusion Drive", "Deuterium Works"]);
  const wide = at("Wide Beam");
  const thrown = (ready: number | null, drive: boolean): ShipWay[] => {
    const leaves = ready === null ? null : onFrom(plan, "Ship Beam", Math.max(sent, ready) + build);
    return leaves === null ? [] : [{ leaves, pushed: wide != null && wide <= leaves ? "wide" : true, drive }];
  };
  // In this order, so that with no distance to go by, the beam throws a ship that both it and its drive are ready for.
  const ways: ShipWay[] = [...thrown(beam, false), ...thrown(both, true), ...(own === null ? [] : [{ leaves: Math.max(sent, own) + build, pushed: false as Push, drive: true }])];
  if (!ways.length) return { leaves: null, start: SHIP.burn, pushed: false as Push, drive: true };
  const lands = (w: ShipWay) => w.leaves + (ly ? shipYears(ly, w.pushed, star, w.drive) : 0);
  const { leaves, pushed, drive } = ways.reduce((a, b) => (lands(b) < lands(a) - 1e-9 ? b : a));
  // Its start's cost tells the sim which beam threw it: speeds.ts's pushedBy. `drive` tells it of the small drive.
  return { leaves, start: pushed === "wide" ? CATALOG.speeds.wide.ship.lost : pushed ? CATALOG.beams.ship : SHIP.burn, pushed, drive };
}
export function colonyRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road & { stands: number | null; push: string | null } {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = shipNeeds(plan).filter((n) => !inOrder(plan, n)).map((n) => ({ y: from, begin: pacedName(n) }));
  const at = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done;
  const ready = shipReadyAt((n) => at[pacedName(n)]);
  const sent = plan.colony?.name === star ? plan.colony : undefined;
  const { leaves, pushed, drive } = shipLeaves(plan, (n) => at[pacedName(n)], sent?.y ?? from, 0, ly, star);
  const arrives = leaves === null ? null : leaves + shipYears(ly, pushed, star, drive);
  return {
    name: "Send our Mind", n: sent ? 1 : null, build: "Seed Ship", craft: "A Mind", speed: stay("ship", ly, gasAt(star), pushed, drive).beta, done: ready, leaves, arrives, carries: !!pushed && drive,
    home: arrives === null ? null : arrives + ly, stands: arrives === null ? null : arrives + SHIP.stands,
    push: pushed === "wide" ? "Wide Beam" : pushed ? "Ship Beam" : null,
  };
}
export const shipReady = (plan: Plan) => shipNeeds(plan).every((n) => inOrder(plan, n));

/** A seed probe: a seed ship with no Mind on board, built in 18 Years once the Seed Ship, its Fusion Drive and the
 *  Deuterium Works are done. It flies and brakes as the Seed Ship does, stays, and copies itself on: lib/sim/spread.ts.
 *  2026-10-26. */
const PROBE = CATALOG.seedProbe;
export const seedNeeds = shipNeeds;
export const seedReady = shipReady;

/** The Year each seed probe we sent leaves, by its star, once what it needs is done, and the Years its start costs:
 *  the Ship Beam's push if the beam is done by then, else its burn. Null while what it needs isn't done. */
export function seedsOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  return (plan.seeds ?? []).map((o) => {
    const { leaves, start, pushed, drive } = shipLeaves(plan, (n) => done[n], o.y, PROBE.build, o.d, o.name);
    return { star: o.name, leaves, burn: start, ...(pushed && drive ? { drive: true } : {}) };
  });
}

/** A seed probe to a star `ly` away as a road: what it needs built, the probe built and flying, landing to stay, and
 *  its first word home. Sent or not, dated as if sent at Year `from`, and what it needs, if not in our order, as if
 *  begun then. Its first copy leaves 60 Years after it lands. */
export function seedRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road & { copies: number | null; push: string | null } {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = shipNeeds(plan).filter((n) => !inOrder(plan, n)).map((n) => ({ y: from, begin: pacedName(n) }));
  const at = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done;
  const ready = shipReadyAt((n) => at[pacedName(n)]);
  const sent = (plan.seeds ?? []).find((o) => o.name === star);
  const { leaves, pushed, drive } = shipLeaves(plan, (n) => at[pacedName(n)], sent?.y ?? from, PROBE.build, ly, star);
  const arrives = leaves === null ? null : leaves + shipYears(ly, pushed, star, drive);
  return {
    name: "Send a seed probe", n: sent ? 1 : null, build: "Seed Ship", craft: "A seed probe", speed: stay("ship", ly, gasAt(star), pushed, drive).beta, done: ready, leaves, arrives, carries: !!pushed && drive,
    home: arrives === null ? null : arrives + ly, copies: arrives === null ? null : arrives + PROBE.first,
    push: pushed === "wide" ? "Wide Beam" : pushed ? "Ship Beam" : null,
  };
}

/** Years the Mind Link takes to send the Will `ly` away, before the light-time: calcs/holes.py's link_years. A
 *  diffraction-limited beam, its receiver catching (Dt Dr / (wavelength d))^2 of it, at ten photons a bit. */
export function linkYears(ly: number) {
  const { bits, aperture, watts, wave, photons } = CATALOG.mindLink;
  const caught = (aperture ** 2 / (wave * ly * 9.4607e15)) ** 2;
  return (bits * photons * 6.626e-34 * 3e8) / wave / caught / watts / 3.156e7;
}

/** The Will's road to our Mind at a hole: the Mind Link built, and word home that our Mind stands there, then the
 *  sending and the light-time. Begun at Year `from` if the link isn't in our order. It stays for good. 2026-10-26. */
export function willRoad(plan: Plan, scale: number, from: number, ly: number, heard: number | null, will?: Will): Road {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = inOrder(plan, "Mind Link") ? [] : [{ y: from, begin: pacedName("Mind Link") }];
  const done = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done[pacedName("Mind Link")] ?? null;
  const leaves = will ? will.y : done === null || heard === null ? null : Math.max(from, done, heard);
  const arrives = leaves === null ? null : leaves + linkYears(ly) + ly;
  return { name: "Move the Will", n: will ? 1 : null, build: "Mind Link", craft: "The Will", speed: 1, done, leaves, arrives, home: null };
}

/** What our order has built to learn with, as the knowledge wall takes it: the Year each watch and telescope is done,
 *  the 15 m Mirror since 2026-10-23, the Halo Survey since 2026-10-26, and for each road to Proxima b that we fly, the Year it passes and the Year its
 *  word reaches us. 2026-10-22. */
export function kitOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const fly = (r: Road) => (r.n !== null && r.arrives !== null && r.home !== null ? { passed: r.arrives, home: r.home } : null);
  const [sails, probe] = roads(plan, scale);
  return {
    allSky: done["All-Sky Watch"],
    searched: searchOf(plan, scale),
    flash: done["Deep Flash Watch"],
    telescope: done["Infrared Telescope"],
    mirror: done["15 m Mirror"] ?? null,
    halo: done["Halo Survey"] ?? null,
    haloArray: done["Halo Array"] ?? null,
    imager: done["Glow Imager"] ?? null,
    farSide: fifthsOf(plan, scale),
    warmWatch: done["Warm Sky Watch"] ?? null,
    closeReads: plan.closeReads ?? [],
    moonSearch: done["Moon Search"] ?? null,
    closeLook: done["Close Look"] ?? null,
    // Our Relay Search flies as a lens does, by the strongest beam done when it is built. 2026-10-30.
    relaySearch: done["Relay Search"] != null ? { built: done["Relay Search"]!, perAU: lensTrip(done, done["Relay Search"]!).flight / LENS.au } : null,
    asteroidTour: done["Asteroid Tour"] != null ? done["Asteroid Tour"]! + TOUR_FLIGHT : null,
    mapper: done["Star Mapper"] ?? null,
    hyper: done["Hypertelescope"] ?? null,
    colony: (() => {
      const c = plan.colony;
      if (!c) return null;
      const { leaves, start, pushed, drive } = shipLeaves(plan, (n) => done[n], c.y, 0, c.d, c.name);
      return leaves === null ? null : { star: c.name, mode: c.mode, leaves, burn: start, ...(pushed && drive ? { drive: true } : {}) };
    })(),
    sentinels: sentinels(plan, scale).flatMap((x) => (x.leaves !== null ? [{ star: x.star, leaves: x.leaves }] : [])),
    seeds: seedsOf(plan, scale).flatMap((x) => (x.leaves !== null ? [{ star: x.star, leaves: x.leaves, burn: x.burn, ...(x.drive ? { drive: true } : {}) }] : [])),
    lenses: lenses(plan, scale).flatMap((l) => (l.looks !== null && l.home !== null ? [{ star: l.star, looks: l.looks, home: l.home }] : [])),
    flybys: flybysOf(plan, scale),
    sails: fly(sails),
    probe: probeNeeds(plan).every((n) => inOrder(plan, n)) ? fly(probe) : null,
    xray: done["X-Ray Watch"] ?? null,
    // Nothing in the simulation reads this yet: no probe comes for it to catch. When one does, it must catch only
    // while armed: plan.ts's isOn. 2026-11-11.
    interceptor: done["Interceptor"] ?? null,
    quiet: done["Quiet Radars"] ?? null,
    strikes: strikesOf(plan, scale).flatMap((x) => (x.fired !== null ? [{ star: x.star, fired: x.fired }] : [])),
  };
}

/** A road toward a star `ly` away: the build and the wait are the same, the flight and the word home are its own. */
export function toward(road: Road, ly: number, from?: number): Road {
  // Our Year 0 craft flew to the nearest star. To any other, given `from`, a craft whose leaving is past is a new one
  // built from now: at Year 979, 82 Eridani's flyby still read passes Year 420.4. Playtest 2026-11-01.
  const leaves = road.leaves !== null && from !== undefined && road.leaves < from ? from + (road.leaves - (road.done ?? road.leaves)) : road.leaves;
  const arrives = leaves === null ? null : leaves + (road.flies ? road.flies(ly) : ly / road.speed + (road.extra ?? 0));
  return { ...road, leaves, arrives, home: arrives === null ? null : arrives + ly, speed: road.fast ? road.fast(ly) : road.speed };
}

/** A way to go that waits on builds beyond the two roads: what it is, and the builds it needs, by name, each a link to
 *  its page to start it. Sources in HOLOS_RESEARCH.md, "Classic propulsion studies" and "Solar gravitational lens
 *  mission", and HOLOS_GAME_CONCEPT.md's drive and seed ship, settled 2026-10-15. */
export interface Way {
  key: string;
  name: string;
  line: string;
  needs: string[];
}

export const LOCKED: Way[] = [
  {
    key: "mind",
    name: "A mind",
    line: "A copy of our Mind, sent to stay, to think there, and to speak with whoever it finds.",
    needs: ["Seed Ship", "Fusion Drive", "Deuterium Works"],
  },
];

