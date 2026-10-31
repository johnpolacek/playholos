// Reach: spreading out into the Galaxy, probes first. At Year 0 there is nothing to send yet, so the tab shows how far
// we have gone and the two roads to the nearest star. Each can be queued before Begin, last in line. One queued is
// dated where the plan has it, and one not yet as if queued now, with this game's compute. Queued, a road can slow
// what is before it: see moves() in plan.ts. Distances at Year 0 are HOLOS_GAME_CONCEPT.md's. Built 2026-10-18.
import { BULLET, bulletsReady, SCREEN } from "@/lib/sim/conflict";
import { horizonOf, ordersOf, pacedName, schedule, searchOf } from "./plan";
import { grownSpans } from "./halo";
import type { Plan, Will } from "./types";
import { CATALOG, type Order, pace } from "@/lib/sim/works";

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
}

/** Each road where the plan has it, or else begun at Year `from`, last in line.
 *  Sails fly at a fifth of light speed, as Starshot's design. A flyby probe is built 12 Years after the yard, and flies
 *  at an eighth, as Daedalus. Its word comes home at light speed. */
export function roads(plan: Plan, scale: number, from = 0): Road[] {
  const { orders, ...opts } = ordersOf(plan);
  const doneOf = (work: string) => {
    const more: Order[] = plan.builds.includes(work) ? [] : [{ y: from, begin: pacedName(work) }];
    return pace([...orders, ...more], horizonOf([...orders, ...more], 200), { scale, ...opts }).done[pacedName(work)] ?? null;
  };
  const road = (name: string, build: string, craft: string, wait: number, speed: number): Road => {
    const done = doneOf(build);
    const leaves = done === null ? null : done + wait;
    const arrives = leaves === null ? null : leaves + NEAREST.ly / speed;
    const n = plan.builds.indexOf(build) + 1 || null;
    return { name, n, build, craft, speed, done, leaves, arrives, home: arrives === null ? null : arrives + NEAREST.ly };
  };
  return [road("Send a sail", "Laser Sail Array", "Sails", 0, 0.2), road("Send a flyby probe", "Probe Yard", "A flyby probe", 12, 1 / 8)];
}

/** The Solar Lens's flight, from data/works.json: to the focal line, then half a Year of looking. Its word comes home
 *  from 548 AU, about 3 light-days. Turyshev and colleagues' NIAC study, 2020: about 25 km a pixel at 30 pc. */
const LENS = CATALOG.lens;
export const LENS_HOME = LENS.flight + LENS.look + LENS.au / LY_AU;
/** A lens's pixel, in km across a world `ly` away. */
export const lensKm = (ly: number) => (LENS.km30pc * ly) / (30 * 3.2616);

/** How a lens flies, by the strongest beam done when it leaves. The Star Beam pushes it out in about two months, with a
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
 *  and the Deuterium Works are done, and it flies at a tenth of light speed, 10 Years more for speeding up and
 *  braking, as calcs/seed.py's probe_trip has it. Then it stays. 2026-10-26. */
const SENTINEL = CATALOG.sentinel;
export const SENTINEL_NEEDS = ["Probe Yard", "Fusion Drive", "Deuterium Works"];
const inOrder = (plan: Plan, name: string) => plan.builds.includes(name) || (plan.later ?? []).some((o) => o.name === name);

/** The Year each sentinel we sent leaves, by its star, once what it needs is done. Null while any of it isn't. */
export function sentinels(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const ready = SENTINEL_NEEDS.every((n) => done[n] != null) ? Math.max(...SENTINEL_NEEDS.map((n) => done[n]!)) : null;
  return (plan.sentinels ?? []).map((o) => ({ star: o.name, leaves: ready === null ? null : Math.max(o.y, ready) + SENTINEL.build }));
}

/** Our pellet screens, each by its star and the Year it stands: once the Picket Yard is done, 4 Years after its order.
 *  Null while the yard isn't. 2026-10-28. */
export function screensOf(plan: Plan, scale: number) {
  const yard = schedule(plan, scale)["Picket Yard"] ?? null;
  return (plan.pickets ?? []).map((o) => ({ star: o.name, done: yard === null ? null : Math.max(o.y, yard) + SCREEN.years }));
}

/** Our bullets, each by its star and the Year it is fired: readied 20 Years after its order once the Strike Yard is
 *  done, and fired once the Helium-3 Harvest has gathered its fuel, after each bullet before it. Null while either
 *  isn't. 2026-10-28, its helium-3 2026-10-29. */
export function strikesOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const ready = bulletsReady((plan.strikes ?? []).map((o) => o.y), done["Strike Yard"] ?? null, grownSpans(plan, scale, "Helium-3 Harvest"));
  return (plan.strikes ?? []).map((o, i) => ({ star: o.name, fired: ready[i] }));
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
  const leaves = ready === null ? null : Math.max(sent?.y ?? from, ready) + SENTINEL.build;
  const arrives = leaves === null ? null : leaves + ly / SENTINEL.speed + SENTINEL.burns;
  return { name: "Send a sentinel", n: sent ? 1 : null, build: "Probe Yard", craft: "A sentinel", speed: SENTINEL.speed, done: ready, leaves, arrives, home: arrives === null ? null : arrives + ly };
}
export const sentinelReady = (plan: Plan) => SENTINEL_NEEDS.every((n) => inOrder(plan, n));

/** A yard's Year done, as if begun at Year `from` when it isn't in our order. */
function yardDone(plan: Plan, scale: number, from: number, yard: string) {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = inOrder(plan, yard) ? [] : [{ y: from, begin: pacedName(yard) }];
  return pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done[pacedName(yard)] ?? null;
}

/** A pellet screen on the line to a star, as a road: the Picket Yard, then 4 Years to build and place it, 4 million
 *  km out. It stands then, and we know it at once. 2026-10-28. */
export function screenRoad(plan: Plan, scale: number, from: number, star: string): Road {
  const yard = yardDone(plan, scale, from, "Picket Yard");
  const sent = (plan.pickets ?? []).find((o) => o.name === star);
  const leaves = yard === null ? null : Math.max(sent?.y ?? from, yard);
  const stands = leaves === null ? null : leaves + SCREEN.years;
  return { name: "A pellet screen", n: sent ? 1 : null, build: "Picket Yard", craft: "A pellet screen", speed: 0, done: yard, leaves, arrives: stands, home: stands };
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
  const order = sent ? strikes.map((o) => o.y) : [...strikes.map((o) => o.y), from];
  const leaves = bulletsReady(order, yard, harvest)[sent ? strikes.indexOf(sent) : order.length - 1];
  const lands = leaves === null ? null : leaves + ly / BULLET.v;
  return { name: "A bullet", n: sent ? 1 : null, build: "Strike Yard", craft: "A bullet", speed: BULLET.v, done: yard, leaves, arrives: lands, home: lands };
}

/** Our Mind on the Seed Ship to a black hole `ly` away, to stay: it leaves once the Seed Ship, its Fusion Drive and the
 *  Deuterium Works are done, flies at a tenth of light speed with calcs/seed.py's burn and braking, and stands alone
 *  as a Mind 20 Years after landing. Dated as if sent at Year `from` when not sent. 2026-10-26. */
const SHIP = CATALOG.seedShip;
export const SHIP_NEEDS = ["Seed Ship", "Fusion Drive", "Deuterium Works"];
export function colonyRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road & { stands: number | null } {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = SHIP_NEEDS.filter((n) => !inOrder(plan, n)).map((n) => ({ y: from, begin: pacedName(n) }));
  const at = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done;
  const ready = SHIP_NEEDS.every((n) => at[pacedName(n)] !== undefined) ? Math.max(...SHIP_NEEDS.map((n) => at[pacedName(n)])) : null;
  const sent = plan.colony?.name === star ? plan.colony : undefined;
  const leaves = ready === null ? null : Math.max(sent?.y ?? from, ready);
  const arrives = leaves === null ? null : leaves + ly / SHIP.speed + SHIP.burn + SHIP.brake;
  return {
    name: "Send our Mind", n: sent ? 1 : null, build: "Seed Ship", craft: "A Mind", speed: SHIP.speed, done: ready, leaves, arrives,
    home: arrives === null ? null : arrives + ly, stands: arrives === null ? null : arrives + SHIP.stands,
  };
}
export const shipReady = (plan: Plan) => SHIP_NEEDS.every((n) => inOrder(plan, n));

/** A seed probe: a seed ship with no Mind on board, built in 18 Years once the Seed Ship, its Fusion Drive and the
 *  Deuterium Works are done. It flies and brakes as the Seed Ship does, stays, and copies itself on: lib/sim/spread.ts.
 *  2026-10-26. */
const PROBE = CATALOG.seedProbe;
export const SEED_NEEDS = SHIP_NEEDS;
export const seedReady = shipReady;

/** The Year each seed probe we sent leaves, by its star, once what it needs is done. Null while any of it isn't. */
export function seedsOf(plan: Plan, scale: number) {
  const done = schedule(plan, scale);
  const ready = SEED_NEEDS.every((n) => done[n] != null) ? Math.max(...SEED_NEEDS.map((n) => done[n]!)) : null;
  return (plan.seeds ?? []).map((o) => ({ star: o.name, leaves: ready === null ? null : Math.max(o.y, ready) + PROBE.build }));
}

/** A seed probe to a star `ly` away as a road: what it needs built, the probe built and flying, landing to stay, and
 *  its first word home. Sent or not, dated as if sent at Year `from`, and what it needs, if not in our order, as if
 *  begun then. Its first copy leaves 60 Years after it lands. */
export function seedRoad(plan: Plan, scale: number, from: number, star: string, ly: number): Road & { copies: number | null } {
  const { orders, ...opts } = ordersOf(plan);
  const more: Order[] = SEED_NEEDS.filter((n) => !inOrder(plan, n)).map((n) => ({ y: from, begin: pacedName(n) }));
  const at = pace([...orders, ...more], horizonOf([...orders, ...more], 300), { scale, ...opts }).done;
  const ready = SEED_NEEDS.every((n) => at[pacedName(n)] !== undefined) ? Math.max(...SEED_NEEDS.map((n) => at[pacedName(n)])) : null;
  const sent = (plan.seeds ?? []).find((o) => o.name === star);
  const leaves = ready === null ? null : Math.max(sent?.y ?? from, ready) + PROBE.build;
  const arrives = leaves === null ? null : leaves + ly / SHIP.speed + SHIP.burn + SHIP.brake;
  return {
    name: "Send a seed probe", n: sent ? 1 : null, build: "Seed Ship", craft: "A seed probe", speed: SHIP.speed, done: ready, leaves, arrives,
    home: arrives === null ? null : arrives + ly, copies: arrives === null ? null : arrives + PROBE.first,
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
    warmWatch: done["Warm Sky Watch"] ?? null,
    moonSearch: done["Moon Search"] ?? null,
    closeLook: done["Close Look"] ?? null,
    // Our Relay Search flies as a lens does, by the strongest beam done when it is built. 2026-10-30.
    relaySearch: done["Relay Search"] != null ? { built: done["Relay Search"]!, perAU: lensTrip(done, done["Relay Search"]!).flight / LENS.au } : null,
    asteroidTour: done["Asteroid Tour"] != null ? done["Asteroid Tour"]! + 1 : null,
    mapper: done["Star Mapper"] ?? null,
    hyper: done["Hypertelescope"] ?? null,
    colony: (() => {
      const c = plan.colony;
      if (!c) return null;
      const ready = SHIP_NEEDS.every((n) => done[n] != null) ? Math.max(...SHIP_NEEDS.map((n) => done[n]!)) : null;
      return ready === null ? null : { star: c.name, mode: c.mode, leaves: Math.max(c.y, ready) };
    })(),
    sentinels: sentinels(plan, scale).flatMap((x) => (x.leaves !== null ? [{ star: x.star, leaves: x.leaves }] : [])),
    seeds: seedsOf(plan, scale).flatMap((x) => (x.leaves !== null ? [{ star: x.star, leaves: x.leaves }] : [])),
    lenses: lenses(plan, scale).flatMap((l) => (l.looks !== null && l.home !== null ? [{ star: l.star, looks: l.looks, home: l.home }] : [])),
    sails: fly(sails),
    probe: fly(probe),
    xray: done["X-Ray Watch"] ?? null,
    interceptor: done["Interceptor"] ?? null,
    quiet: done["Quiet Radars"] ?? null,
    screens: screensOf(plan, scale).flatMap((x) => (x.done !== null ? [{ star: x.star, done: x.done }] : [])),
    strikes: strikesOf(plan, scale).flatMap((x) => (x.fired !== null ? [{ star: x.star, fired: x.fired }] : [])),
  };
}

/** A road toward a star `ly` away: the build and the wait are the same, the flight and the word home are its own. */
export function toward(road: Road, ly: number): Road {
  const arrives = road.leaves === null ? null : road.leaves + ly / road.speed;
  return { ...road, arrives, home: arrives === null ? null : arrives + ly };
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

