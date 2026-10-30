// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import { mindsSeen, type MindKit, type MindsSeen } from "./minds.ts";
import { giftWords } from "../game/sends.ts";
import { lightTime } from "../light.ts";
import { yearText } from "../game/clock.ts";
import { BANDS, iwa, observe, owa, WIDE } from "./observing.ts";
import { proximaB } from "./proxima.ts";
import type { ColonyMode, DarkMass, EarthView, Find, FeltWorld, Gas, Hole, Read, Visit, World } from "./types.ts";
import catalog from "../../data/works.json" with { type: "json" };
import { seedProbes } from "./spread.ts";

import { combedAt } from "./works.ts";

/** What Earth has built to listen and look with: the Year each is done, if our order finishes it. */
export interface Kit {
  allSky?: number | null;
  flash?: number | null;
  telescope?: number | null;
  mirror?: number | null;
  halo?: number | null;
  mapper?: number | null;
  /** The Year the Hypertelescope is done: it pictures every felt world in its reach, nearest first. 2026-10-29. */
  hyper?: number | null;
  /** Each lens we sent, by the star it looks at as we name it: the Year it begins to look, and its picture is home. */
  lenses?: { star: string; looks: number; home: number }[];
  /** Our Mind sent to a black hole or a star: where, how it lives there, and the Year it leaves. */
  colony?: { star: string; mode: ColonyMode; leaves: number } | null;
  /** Each sentinel we sent, by its star as we name it, and the Year it leaves. */
  sentinels?: { star: string; leaves: number }[];
  /** Each seed probe we sent, by its star as we name it, and the Year it leaves. Its copies follow from spread.ts. */
  seeds?: { star: string; leaves: number }[];
  /** Each road to Proxima b, if our order flies it: the Year it passes, and the Year its word reaches us. */
  sails?: { passed: number; home: number } | null;
  probe?: { passed: number; home: number } | null;
  /** The Year our radars went quiet: a neighbor whose ears open only after our last sweep has passed never hears them,
   *  so never answers them. 2026-10-28. */
  quiet?: number | null;
  /** Our idle thought combing old recordings: each Year the line changed, and the flagship-Years spent by then. */
  searched?: [number, number][];
  /** What finds the realistic premise's minds, beyond the Halo Survey: lib/sim/minds.ts. 2026-10-29. */
  warmWatch?: number | null;
  haloArray?: number | null;
  moonSearch?: number | null;
  /** Our Close Look, built once the watcher is found. 2026-10-30. */
  closeLook?: number | null;
  asteroidTour?: number | null;
  craft?: MindKit["craft"];
}

/** Our search of old recordings, for the Mind: how far it has combed by Year `year`, and how fast. */
export function describeSearch(searched: readonly [number, number][], year: number) {
  const at = combedAt(searched, year), soon = combedAt(searched, year + 1);
  const through = Math.floor(2040 + at);
  const pace =
    at >= year - 0.05
      ? "It has caught up with the present, and combs each new recording as it comes in."
      : soon - at < 0.05
        ? "We have no idle thought to spare now, so it waits."
        : `It combs about ${Math.max(1, Math.round(soon - at))} Year${Math.round(soon - at) > 1 ? "s" : ""} of recordings in each of ours.`;
  return `Our idle thought combs old radio recordings, oldest first, for any signal our watches missed when it came. It has combed from 2016 through ${through}. ${pace} What it finds shows in what Earth has heard.`;
}


/** What the first mirror tells apart: no air, water without oxygen, or oxygen. Hidden microbes read as a lifeless sea,
 *  as do a world whose life died and a frozen one, its water as ice. Every Mind's world had animals first, so a home
 *  shows oxygen, and so does one whose makers died, since their air outlasts them by millions of years. As
 *  HOLOS_GAME_CONCEPT.md's rungs have it, 2026-10-14 and 16. So oxygen never unmasks a neighbor. */
const AIR: Record<string, "none" | "water" | "oxygen"> = {
  "bare rock": "none", "airy and lifeless": "water", "hiding microbes": "water", "showing oxygen": "oxygen",
  "with animals and forests": "oxygen", "where life died": "water", frozen: "water",
};

/** A find's true width in Earths, from its world. Rock's mass grows as width to the 3.7. */
function width(world: World, f: Find) {
  const home = world.neighbors.find((p) => p.star === f.star);
  if (home) return home.world.mass ** (1 / 3.7);
  return world.worlds.find((w) => w.star === f.star)?.radius ?? (f.msini / 0.87) ** (1 / 3.7);
}

const GASES: Gas[] = ["water", "oxygen", "ozone"];

/** Proxima b as a telescope's target: where it sits, and how wide it truly is. Its air comes from its drawn nature. */
const PROXIMA = { star: "Proxima Centauri", d: 4.24, a: 0.0485, lum: 0.00157 };

/** What a telescope has read by Year `year`, once done at Year `from`. It takes its targets nearest first, each for as
 *  long as its longest readable band, and each band lands when its days are up. Days are calcs/observing.py's, through
 *  observing.ts. The Infrared Telescope's targets are the finds, 2026-10-20. The 15 m Mirror's are Proxima b and the
 *  finds where it reads more than the Infrared Telescope can: one too close for it to split, or a gas past its reach
 *  or too faint for it. It reads each for every gas it can. 2026-10-23. */
function readings(world: World, from: number, year: number, mirror?: number) {
  const out = new Map<string, Read>();
  const wide = mirror === WIDE;
  const { mass, nature } = proximaB(world.seed);
  const targets = [
    ...world.finds.map((f) => ({
      star: f.star, d: f.d, a: f.a, lum: world.stars[f.star]?.lum ?? 1, radius: width(world, f),
      air: f.truth.kind === "natural" ? AIR[f.truth.rung ?? ""] ?? "none" : "oxygen",
    })),
    ...(wide ? [{ ...PROXIMA, radius: mass ** (1 / 3.7), air: AIR[nature] ?? "none" }] : []),
  ].sort((x, y) => x.d - y.d);
  const gases = (r: ReturnType<typeof observe>) => GASES.filter((g) => r[g] !== null && r[g] !== Infinity);
  let t = from;
  for (const w of targets) {
    if (t > year) break;
    const r = observe(w.d / 3.2616, w.radius, w.a, w.lum, mirror);
    if (wide && w.star !== PROXIMA.star) {
      const near = observe(w.d / 3.2616, w.radius, w.a, w.lum);
      if (!(r.seenH !== null && near.seenH === null) && !gases(r).some((g) => !gases(near).includes(g))) continue;
    }
    const read: Read = { split: r.seenH !== null, at: t };
    out.set(w.star, read);
    if (r.seenH === null) continue;
    const beyond = GASES.filter((g) => r[g] === null);
    if (beyond.length) read.beyond = beyond;
    const shows = { water: w.air !== "none", oxygen: w.air === "oxygen", ozone: w.air === "oxygen" };
    let longest = r.seenH / 24;
    for (const band of GASES) {
      const days = r[band];
      if (days === null || days === Infinity) continue;
      read.readable = true;
      if (t + days / 365.25 <= year) {
        read[band] = shows[band];
        read.at = Math.max(read.at!, t + days / 365.25);
      }
      longest = Math.max(longest, days);
    }
    t += longest / 365.25;
  }
  return out;
}

/** What a flyby of Proxima b sees in its pictures, from its truth: a gas world's haze, bare rock, cloud and sea, which
 *  hide whether anything lives under them, or forests, dark on the land in patches far larger than a pixel. A probe
 *  reads its air as our telescope reads a felt world's. 2026-10-22. */
function visit(world: World, by: Visit["by"], { passed, home }: { passed: number; home: number }): Visit {
  const { nature } = proximaB(world.seed);
  const sight = nature === "a small gas world" ? "haze" : nature === "bare rock" ? "bare" : nature === "with animals and forests" ? "green" : "seas";
  const air = AIR[nature] ?? "none";
  return {
    star: "Proxima Centauri",
    world: "Proxima b",
    by,
    passed,
    home,
    sight,
    ...(by !== "sails" && by !== "hyper" && sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
  };
}

/** What a lens pictures of a felt world, from its truth: everything wider than its pixel, 25 km at 30 pc. A home's
 *  cities and cleared land show. A world whose makers are gone looks merely alive, since its forests have taken its
 *  fields back. HOLOS_GAME_CONCEPT.md's "A picture shows everything larger than a pixel", 2026-10-14. */
const PICTURED: Record<string, Visit["sight"]> = {
  "bare rock": "bare", "airy and lifeless": "seas", "hiding microbes": "seas", "showing oxygen": "seas",
  "with animals and forests": "green", "where life died": "seas", frozen: "ice",
};
function pictured(f: Find, km = 0): Visit["sight"] {
  if (f.truth.elder) return "green";                // an elder's people live lightly, its works far out in the cold
  // Fields and cities show only to a pixel narrower than about 50 km: calcs/mercury.py. 2026-10-29.
  if (f.truth.kind === "home") return km > HYPER.cities ? "green" : "cities";
  if (f.truth.kind === "dead") return "green";
  return PICTURED[f.truth.rung ?? ""] ?? "seas";
}
const LENS_KM_30PC = catalog.lens.km30pc;
const HYPER = catalog.hyper;
const GENERATIONS = catalog.seedProbe.generations;

/** A black hole's name as astronomers give a source: J, its right ascension in hours and minutes, its declination in
 *  degrees and minutes. Found by Gaia it is Gaia's, by our Star Mapper ours. */
export function holeName(h: Hole, by: DarkMass["by"]) {
  const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
  const ra = h.ra / 15, dec = Math.abs(h.dec);
  const at = `J${pad(ra)}${pad((ra % 1) * 60)}${h.dec < 0 ? "-" : "+"}${pad(dec)}${pad((dec % 1) * 60)}`;
  return by === "Gaia" ? `Gaia BH ${at}` : `BH ${at}`;
}

/** Black holes found by `year`: Gaia's fifth catalog, out about 2030, and once our Star Mapper is done, each hole the
 *  first time it shifts a star the mapper sees, as calcs/holes.py draws them. Its mass is measured from the shift and
 *  the hole's own parallax, as OGLE-2011-BLG-0462's was. 2026-10-26. */
export function darkMasses(world: World, year: number, mapper: number | null): (DarkMass & { id: string })[] {
  const out: (DarkMass & { id: string })[] = [];
  for (const h of world.holes ?? []) {
    const by = h.found2040 ? "Gaia" : "Star Mapper";
    const found = h.found2040 ? -10 : mapper === null ? undefined : h.events.find((e) => e >= mapper);
    if (found === undefined || found > year) continue;
    out.push({ id: h.id, name: holeName(h, by), d: h.d, ra: h.ra, dec: h.dec, mass: Math.round(h.mass * 10) / 10, found, by });
  }
  return out.sort((a, b) => a.d - b.d);
}

/** How slow a clock runs on a black hole's innermost stable orbit, going round with its spin: the Kerr metric's
 *  circular orbit, Bardeen, Press and Teukolsky 1972. 0.71 with no spin. */
export function iscoClock(spin: number) {
  const a = Math.min(spin, 0.998);
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  const r = 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
  const ut = (r ** 1.5 + a) / (r ** 0.75 * Math.sqrt(r ** 1.5 - 3 * r ** 0.5 + 2 * a));
  return 1 / ut;
}

export function earthKnows(
  world: World,
  year: number,
  { telescope = null, mirror = null, halo = null, mapper = null, hyper = null, lenses = [], sentinels = [], seeds = [], colony = null, sails = null, probe = null, warmWatch = null, haloArray = null, moonSearch = null, asteroidTour = null, closeLook = null, craft = [] }: Kit = {},
): EarthView {
  const shown = (id: string) => world.stars[id]?.shown ?? id;
  // Earth's finds at Year 0: every world whose tug shows by 2040. Measured, not understood. Its star is in the catalogs.
  // Once the Infrared Telescope is done, what it has read of each.
  const read = telescope !== null && year >= telescope ? readings(world, telescope, year) : new Map<string, Read>();
  const wide = mirror !== null && year >= mirror ? readings(world, mirror, year, WIDE) : new Map<string, Read>();
  const felt: FeltWorld[] = world.finds.map((f) => ({
    star: shown(f.star), d: f.d, minMass: f.msini, periodDays: f.periodDays, a: f.a, by: f.by, year: f.year,
    kind: world.stars[f.star]?.kind, hz: world.stars[f.star]?.hz,
    ...(read.has(f.star) ? { read: read.get(f.star) } : {}),
    ...(wide.has(f.star) ? { wide: wide.get(f.star) } : {}),
  }));
  // Signals caught came from the neighbors' messages to us. They are retired, so none comes, 2026-10-29. The list
  // stays for Scan and the Mind.

  // What our sails and probe saw of Proxima b, once their word is home.
  const visits = (
    [
      ["sails", sails],
      ["probe", probe],
    ] as const
  )
    .filter(([, road]) => road && road.home <= year)
    .map(([by, road]) => visit(world, by, road!));
  // What each lens has pictured, once its picture is home. Only a felt world's star has one to picture.
  for (const l of lenses) {
    const f = world.finds.find((x) => shown(x.star) === l.star);
    if (!f || l.home > year) continue;
    const km = (LENS_KM_30PC * f.d) / (30 * 3.2616);
    visits.push({ star: l.star, world: `${l.star}’s world`, by: "lens", passed: l.looks, home: l.home, sight: pictured(f, km), km, ...(km > HYPER.cities ? { coarse: true } : {}) });
  }
  // What the Hypertelescope has pictured: each felt world within its reach, nearest first, a week a star. Its pixel
  // widens with distance, too wide anywhere for fields or cities. It sits at L2, so its picture is home at once.
  // calcs/mercury.py. 2026-10-29.
  if (hyper !== null) {
    // Proxima b too, whose truth proxima.ts keeps apart from the seed's finds: the nearest, so the first it turns to.
    const near = [
      { star: "Proxima Centauri", d: 4.24, f: null as Find | null },
      ...world.finds.filter((f, i, all) => f.d <= HYPER.reach && all.findIndex((x) => x.star === f.star) === i).map((f) => ({ star: shown(f.star), d: f.d, f })),
    ].sort((a, b) => a.d - b.d);
    near.forEach(({ star, d, f }, i) => {
      const passed = hyper + i * HYPER.slew, home = passed + HYPER.slew, km = HYPER.kmPerLy * d;
      if (home > year) return;
      const coarse = km > HYPER.cities ? { coarse: true as const } : {};
      if (!f) visits.push({ ...visit(world, "hyper", { passed, home }), km, ...coarse });
      else visits.push({ star, world: `${star}’s world`, by: "hyper", passed, home, sight: pictured(f, km), km, ...coarse });
    });
  }

  // What each sentinel has seen, once its first word is home: it arrives at a tenth of light speed and stays, so it
  // sees what a pass can't: who lives there, or their ruins. Its air read from the world's truth, as a probe's.
  const { speed, burns } = catalog.sentinel;
  const holes = darkMasses(world, year, mapper);
  for (const x of sentinels) {
    const f = world.finds.find((y) => shown(y.star) === x.star);
    // A black hole we found: it weighs it, and measures its spin from how light and matter go round it.
    const dark = holes.find((h) => h.name === x.star);
    if (dark) {
      const passed = x.leaves + dark.d / speed + burns, home = passed + dark.d;
      const truth = world.holes!.find((h) => h.id === dark.id)!;
      const claims = truth.claims ?? [];
      // Who got there first: a neighbor's sentinel or colony braked there by the time ours arrives, seen up close.
      const others = claims.filter((c) => c.arrives <= passed).map((c) => ({ kind: c.kind, ...(c.mode ? { mode: c.mode } : {}) }));
      const at = { star: x.star, world: x.star, by: "sentinel" as const, sight: "dark" as const };
      if (home <= year) visits.push({ ...at, passed, home, spin: truth.spin, clock: iscoClock(truth.spin), ...(others.length ? { others } : {}) });
      // It keeps watching, and sends word of each who brakes in after it. 2026-10-26.
      for (const c of claims)
        if (c.arrives > passed && c.arrives + dark.d <= year)
          visits.push({ ...at, passed: c.arrives, home: c.arrives + dark.d, came: comer(world, c.who), others: [{ kind: c.kind }] });
      continue;
    }
    const d = x.star === PROXIMA.star ? PROXIMA.d : f?.d;
    if (d === undefined) continue;
    const passed = x.leaves + d / speed + burns, home = passed + d;
    if (home > year) continue;
    if (!f) { visits.push(visit(world, "sentinel", { passed, home })); continue; }
    const kind = f.truth.kind;
    const air = kind === "natural" ? (AIR[f.truth.rung ?? ""] ?? "water") : "oxygen";
    const sight = pictured(f);
    visits.push({
      star: x.star, world: `${x.star}’s world`, by: "sentinel", passed, home, sight,
      ...(sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
      ...(f.truth.elder ? { elder: f.truth.elder } : kind === "home" ? { lives: true } : kind === "dead" ? { ruins: true } : {}),
    });
  }
  // What each seed probe found where it landed, once its word is home, and word of each copy it sent on. It stays, as a
  // sentinel does, and reads air as one does. It brakes on its sail, unseen, and mines rock no one would miss. A
  // neighbor's colony there by then, it sees as works not ours. 2026-10-26.
  for (const p of seedProbes(seeds)) {
    const home = p.lands + p.d;
    const base = { star: p.star, by: "seed" as const, gen: p.gen, from: p.from, at: [p.ra, p.dec, p.d] as [number, number, number] };
    const found = seedFinds(world, p.star, p.lands);
    if (home <= year) visits.push({ ...base, ...found, passed: p.lands, home });
    for (const c of p.copies) if (c.leaves + p.d <= year) visits.push({ ...base, ...found, passed: c.leaves, home: c.leaves + p.d, sent: c.star });
  }
  visits.sort((a, b) => a.home - b.home);
  // The realistic premise's minds, as far as we have found them. 2026-10-29.
  const firstSeed = seeds.length ? Math.min(...seeds.map((s) => s.leaves)) : null;
  const minds = mindsSeen(world, { telescope, warmWatch, halo, haloArray, moonSearch, asteroidTour, closeLook, firstSeed, craft }, year);
  const anyMind = minds.flashes.length || minds.glows.length || minds.watcher || minds.sleepers.length;
  return {
    year, felt, heard: [], visits,
    ...(anyMind ? { minds } : {}),
    ...(wide.has(PROXIMA.star) ? { proxima: wide.get(PROXIMA.star) } : {}),
    ...(colony ? { colony: colonyAt(world, holes, colony, year) } : {}),
    ...(holes.length ? { holes: holes.map((h) => ({ name: h.name, d: h.d, ra: h.ra, dec: h.dec, mass: h.mass, found: h.found, by: h.by })) } : {}),
  };
}


/** Where a felt world sits from its star in our sky, from Earth's own measures of it, and what a mirror `m` metres
 *  wide could split it in, and each gas whose band it could read there. Not whether it's bright enough: that needs its
 *  size, which Earth doesn't know. observing.ts's dark patch, so what the Mind says is what the telescope does. */
function reach(f: FeltWorld, m?: number) {
  const sep = (f.a / (f.d / 3.2616)) * 1000;
  const inside = (microns: number) => iwa(microns, m) < sep && sep < owa(microns, m);
  return { sep, split: iwa(BANDS.green, m) < sep && sep < owa(BANDS.water, m), gases: GASES.filter((g) => inside(BANDS[g])) };
}
const gases = (g: readonly string[]) => (g.length > 1 ? `${g.slice(0, -1).join(", ")} and ${g.at(-1)}` : g[0]);

/** What our two telescopes could make of a felt world, from where it sits: which could split it, and which gases each
 *  could read. Added 2026-10-23, after the Mind took a world it could read for one beyond it, and back. */
function scope(f: FeltWorld) {
  const near = reach(f), wide = reach(f, WIDE);
  const more = wide.gases.filter((g) => !near.gases.includes(g));
  const at = `It sits ${Math.round(near.sep)} thousandths of an arcsecond from its star in our sky.`;
  if (!wide.split) return `${at} That's too close for the Infrared Telescope or the 15 m Mirror to split.`;
  if (!near.split)
    return `${at} That's too close for the Infrared Telescope. The 15 m Mirror could split it${wide.gases.length ? `, and read its ${gases(wide.gases)} if it's bright enough` : ""}.`;
  const first = near.gases.length
    ? `The Infrared Telescope could split it, and read its ${gases(near.gases)} if it's bright enough.`
    : "The Infrared Telescope could split it, but it sits too close to read any of its air.";
  return `${at} ${first}${more.length ? ` The 15 m Mirror could read its ${gases(more)}${near.gases.length ? " too" : ""}.` : ""}`;
}

/** One telescope's read of a world, in words. A gas past its reach is said so, so "no water" is never taken from water
 *  it couldn't see. */
function told(read: Read, by: string) {
  const beyond = read.beyond ?? [];
  const reachable = GASES.filter((g) => !beyond.includes(g));
  const past = beyond.length ? ` It sits too close to its star for this mirror to read its ${gases(beyond)}.` : "";
  if (!reachable.length) return `Our ${by} sees it beside its star, but it sits too close to read any of its air.`;
  if (!read.readable) return `Our ${by} sees it beside its star, but its air is too faint to read.${past}`;
  const bands = GASES.filter((b) => read[b] !== undefined);
  if (!bands.length) return `Our ${by} sees it beside its star, and is reading its air now.${past}`;
  return `Our ${by} has read its air: ${bands.map((b) => (read[b] ? b : `no ${b}`)).join(", ")}.${past}`;
}

/** What we know of a felt world's air, in words: each telescope's read, and what the 15 m Mirror could add. */
function air(f: FeltWorld) {
  const { read, wide } = f;
  if (!read && !wide) return `It doesn't cross its star, so its size is unread, and no telescope has read its air. ${scope(f)}`;
  if (read && !read.split && !wide) return `Its air stays unread. ${scope(f)}`;
  const first = !read ? "" : read.split ? told(read, "Infrared Telescope") : "Our Infrared Telescope can't split it from its star.";
  if (wide) return `${first} ${told(wide, "15 m Mirror")}`.trim();
  const could = read?.readable ? GASES.filter((g) => !(read.beyond ?? []).includes(g)) : [];
  const more = reach(f, WIDE).gases.filter((g) => !could.includes(g));
  return `${first}${more.length ? ` The 15 m Mirror could read its ${gases(more)}.` : ""}`;
}

/** Our Mind at a black hole, as far as its word has reached us by `year`: on its way, landed, or standing alone as a
 *  Mind, and, once it stands, who was there before it, and how its furnace has grown, a Mind's computing doubling every
 *  10 Years from our 2040 scale, as a neighbor's does. A refuge stays as small and dark as it began. 2026-10-26. */
function colonyAt(world: World, holes: (DarkMass & { id: string })[], c: { star: string; mode: ColonyMode; leaves: number }, year: number) {
  const { speed, burn, brake, stands } = catalog.seedShip;
  const h = holes.find((x) => x.name === c.star);
  if (!h) return colonyAtStar(world, c, year);
  const lands = c.leaves + h.d / speed + burn + brake, alone = lands + stands;
  const heard = year - h.d;                                       // what its word home shows of it now
  const truth = world.holes!.find((x) => x.id === h.id)!;
  const claims = truth.claims ?? [];
  const others = heard >= lands ? claims.filter((x) => x.arrives <= lands).map((x) => ({ kind: x.kind, ...(x.mode ? { mode: x.mode } : {}) })) : [];
  // Who braked in after it, as far as its word has reached us. 2026-10-26.
  const came = claims.filter((x) => x.arrives > lands && x.arrives <= heard).map((x) => ({ kind: x.kind, at: x.arrives, from: comer(world, x.who) }));
  const watts = c.mode === "furnace" && heard >= alone ? 1e13 * 2 ** ((heard - alone) / 10) : null;
  // It measures its hole's spin once it lands, as a sentinel does, and so the clock on its innermost orbit.
  const spin = heard >= lands ? { spin: truth.spin, clock: iscoClock(truth.spin) } : {};
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d: h.d, ...spin, ...(others.length ? { others } : {}), ...(came.length ? { came } : {}), ...(watts ? { watts } : {}) };
}

/** Our Mind settled at a star, on its light and its rock, as far as its word has reached us by `year`: on its way,
 *  landed, or standing alone as a Mind. Who was there first: a people at home, or their ruins, or a neighbor's colony
 *  landed before it. Who came after, its end, and its works growing as a furnace's do. No slow clock: a star has no
 *  innermost orbit to live on. 2026-10-27. */
function colonyAtStar(world: World, c: { star: string; mode: ColonyMode; leaves: number }, year: number) {
  const { speed, burn, brake, stands } = catalog.seedShip;
  const id = Object.keys(world.stars).find((k) => world.stars[k].shown === c.star);
  if (!id) return { star: c.star, mode: c.mode, leaves: c.leaves };
  const d = world.stars[id].d;
  const lands = c.leaves + d / speed + burn + brake, alone = lands + stands;
  const heard = year - d;
  const n = world.neighbors.find((x) => x.star === id);
  const theirs = world.colonies.filter((x) => x.star === id);
  const others = heard >= lands
    ? [...(n ? [{ kind: n.dead ? ("ruins" as const) : n.elder ? ("elder" as const) : ("home" as const) }] : []), ...theirs.filter((x) => x.lands <= lands).map(() => ({ kind: "colony" as const }))]
    : [];
  const came = theirs.filter((x) => x.lands > lands && x.lands <= heard).map((x) => ({ kind: "colony" as const, at: x.lands, from: comer(world, x.root) }));
  const watts = heard >= alone ? 1e13 * 2 ** ((heard - alone) / 10) : null;
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d, atStar: true, ...(others.length ? { others } : {}), ...(came.length ? { came } : {}), ...(watts ? { watts } : {}) };
}

/** The star a craft braking in at a hole came from: its flame points back along its track. Its star, never who. */
function comer(world: World, who: string) {
  const p = world.neighbors.find((n) => n.name === who);
  return p ? (world.stars[p.star]?.shown ?? p.star) : "a star we can't name";
}

/** What the Will knows at Year `year`: Earth's news a light-time old once it lives at our Mind at a hole or a star,
 *  and, at first hand, our Mind there and any craft of ours at the same place. 2026-10-26, a star since 2026-10-27. */
export function willKnows(world: World, year: number, kit: Kit, will?: { hole: string; d: number; at: number } | null): EarthView {
  if (!will || year < will.at) return earthKnows(world, year, kit);
  const view = earthKnows(world, year - will.d, kit);
  // What Earth would know a light-time from now is what is here now.
  const here = earthKnows(world, year + will.d, kit);
  return {
    ...view,
    year,
    visits: [...view.visits.filter((v) => v.star !== will.hole), ...here.visits.filter((v) => v.star === will.hole)].sort((a, b) => a.home - b.home),
    ...(here.colony ? { colony: here.colony } : {}),
    will: { hole: will.hole, d: will.d },
  };
}

/** What a seed probe finds at a star, as the world has it: a neighbor at home, or the ruins of one, a natural warm world,
 *  or only rock. A neighbor's colony landed there by `at` it sees as works not ours. */
function seedFinds(world: World, star: string, at: number): Pick<Visit, "world" | "sight" | "air" | "lives" | "ruins" | "elder" | "others"> {
  const id = Object.keys(world.stars).find((k) => world.stars[k].shown === star);
  const others = world.colonies.some((c) => c.star === id && c.lands <= at) ? { others: [{ kind: "colony" as const }] } : {};
  // Proxima b, drawn for every game apart from the census's warm worlds, as a flyby sees it.
  if (star === PROXIMA.star) {
    const { world: name, sight, air } = visit(world, "seed", { passed: at, home: at });
    return { world: name, sight, ...(air ? { air } : {}), ...others };
  }
  const n = world.neighbors.find((x) => x.star === id);
  if (n?.elder) return { world: `${star}’s world`, sight: "green", air: { water: true, oxygen: true }, elder: n.elder.asleep ? "asleep" : "awake", ...others };
  if (n) return { world: `${star}’s world`, sight: n.dead ? "green" : "cities", air: { water: true, oxygen: true }, ...(n.dead ? { ruins: true } : { lives: true }), ...others };
  const w = world.worlds.find((x) => x.star === id);
  if (!w) return { world: star, sight: "rocks", ...others };
  const sight = PICTURED[w.rung] ?? "seas", air = AIR[w.rung] ?? "water";
  return { world: `${star}’s world`, sight, ...(sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}), ...others };
}

type Others = NonNullable<NonNullable<EarthView["colony"]>["others"]>;

/** An elder's home, up close. Its world is green, its towns few. Its works are far out in the cold: a 12 K glow of
 *  10¹⁹ W sheds from about 10²² m², a thin swarm some 50 million km across. Awake, they shed heat. Asleep, they are
 *  dark and still. 2026-10-28. */
const ELDER_SEEN = "Someone old lives there: its world is green, its towns few and small, and far out in the cold hang works tens of millions of km across.";
const ELDER: Record<"awake" | "asleep", string> = {
  awake: " Its towns are few and small. Far out in the cold, a thin swarm tens of millions of km across sheds heat into the dark, steady, as it has for longer than we can tell: someone computing, awake and very old.",
  asleep: " Its towns are few, small and still. Far out in the cold, a thin swarm tens of millions of km across hangs dark: no heat to speak of, no radio. Whoever built it is asleep, or gone.",
};

/** What a sentinel at a black hole sees of whoever got there first. */
function others(o: Others) {
  return o
    .map((x) =>
      x.kind === "sentinel"
        ? "A craft not ours keeps station there, watching."
        : x.mode === "furnace"
          ? "Someone feeds the hole: a disk of matter glows round it, hot enough to shine in X-rays, and works round that take its light."
          : "Someone lives in its shadow: cold radiators and collectors, dark against the sky, dumping their heat into the hole.",
    )
    .join(" ");
}

/** Who our Mind found at a star when it landed. */
function settledBy(o: Others) {
  return o
    .map((x) =>
      x.kind === "home"
        ? "A people live there: cities on its world, and it braked in under their sky, its flame plain to them."
        : x.kind === "ruins"
          ? "A people lived there once: their world is green, and their cities are ruins."
        : x.kind === "elder"
          ? `${ELDER_SEEN} It braked in under their sky, its flame plain to anything awake there.`
          : "A ship not ours had landed there before it, and stayed.",
    )
    .join(" ");
}

/** The view in words, for the Mind's prompt. It takes the view and nothing else, so the truth can't reach it. */
export function describe(view: EarthView): string {
  const one = (x: number) => x.toFixed(1);
  const felt = view.felt.length
    ? view.felt.map((f) =>
        `- ${f.star}, ${one(f.d)} ly: at least ${one(f.minMass)} Earth masses, a year of ${Math.round(f.periodDays)} days, ` +
        `${lightTime(f.a)} from its star. Felt by ${f.by} in ${2040 + f.year}. ${air(f)}`).join("\n")
    : "- None. The planet hunters felt no new world by 2040.";
  const nearest = view.proxima ? `\n- Proxima b, 4.2 ly, the nearest world: ${told(view.proxima, "15 m Mirror")}` : "";
  const heard = view.heard.length
    ? view.heard.map((h) =>
        // Word from our colony, on its own choice. 2026-10-28.
        h.ours
          ? `- From our Mind ${h.star === "Earth" ? "on Earth" : `at ${h.star}`}, ${one(h.d)} ly, arrived at Year ${yearText(h.arrived)}: it chose to ${h.ours.chose}${h.ours.on ? `, on news from ${h.ours.on}` : ""}. It decides for itself by our charter, since our word takes ${one(h.d)} Years to reach it.${h.text ? ` It sent: "${h.text}"` : ""}` :
        `- From ${h.star}, ${one(h.d)} ly: ${/^[aeiou]/.test(h.move) ? "an" : "a"} ${h.move}${h.laser ? " sent as laser flashes" : ""} ` +
        `that arrived at Year ${yearText(h.arrived)}, sent in ${Math.round(2040 + h.sent)}.` +
        // Our radars' first sweeps left in 1950, so they reach a star d light years out in 1950 + d. Added 2026-10-23,
        // after the Mind said a call was sent before we could be heard, twenty years after our noise had reached it.
        (h.about
          ? ` Whoever watches there sent it to ${h.about.replace(/^Our/, "our")}, which passed it home.`
          : ` Our radars first reached it about ${Math.round(1950 + h.d)}, ${2040 + h.sent >= 1950 + h.d ? "before" : "after"} it was sent.`) +
        (h.laser ? ` Only our ${h.by} sees flashes. No radio watch hears them.` : h.by ? ` Our ${h.by} caught it. Year 0's sky watch would have missed it.` : "") +
        (h.found !== undefined ? ` No one saw it when it came. Our search of old recordings dug it out at Year ${yearText(h.found)}.` : "") +
        // Only a knock's words are read at once, and nothing in the game reads the rest. Added 2026-10-23, after the
        // Mind offered to go through an answer's words, and then, told they were unread, to read them.
        (h.overheard ? " It was sent every way at once, on news from another world, not to us. We overheard it." : "") +
        (h.warning ? " It was sent to us as a warning about another world they know of. Which one, only its words can say." : "") +
        (h.answers !== undefined ? ` It answers our message, which said: "${h.answers}" We caught it listening at every star we send to.` : "") +
        (h.gift ? ` It is a gift of their knowledge, all of it here. From Year ${yearText(h.arrived)}: ${giftWords(h.gift)}` : "") +
        (h.text ? ` It reads: "${h.text}"` : " Its words aren't in what Earth holds, and no build reads them.")).join("\n")
    : "- Nothing. Earth has heard no one.";
  const SIGHT: Record<Visit["sight"], string> = {
    dark: "a black hole, dark against the stars it bends",
    ice: "ice from pole to pole, and no open sea",
    cities: "cloud, seas and dark forests, and on its land, patterns no forest makes: cities, and fields cleared in squares. Someone lives there",
    haze: "haze to the horizon and no ground: a small gas world",
    bare: "bare rock under a black sky, no cloud, no sea: its air is gone",
    seas: "cloud, and seas under it. Pictures can't show whether anything lives there",
    green: "cloud, seas, and its land dark green in patches the size of forests",
    rocks: "no warm world, only rock: asteroids and small moons going round",
  };
  const visits = (view.visits ?? []).map(
    (v) =>
      (v.by === "lens" || v.by === "hyper"
        ? `- ${v.world}, ${one(view.felt.find((f) => f.star === v.star)?.d ?? 0)} ly, pictured by ${v.by === "lens" ? "our lens at the Sun’s focus" : "our Hypertelescope"} from Year ${yearText(v.passed)}, about ${Math.round(v.km ?? 0)} km a pixel, picture home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}. Nothing narrower than a pixel shows.${v.coarse ? " Its pixels are too wide for fields or cities, so it can't tell whether anyone lives there." : ""}`
        : v.by === "seed" && v.sent
          ? `- ${v.world}: our seed probe there sent a copy of itself toward ${v.sent} at Year ${yearText(v.passed)}, word home at Year ${yearText(v.home)}.`
        : v.by === "seed"
          ? `- ${v.world}, ${one(v.at![2])} ly, reached by our seed probe at Year ${yearText(v.passed)}, built ${v.from ? `by our probe at ${v.from}` : "at home"}, its first word home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}. ` +
            `It braked on its sail, unseen, and stays, mining rock to copy itself: a generation ${v.gen} of the ${GENERATIONS} we allow, the last making no copies.` +
            (v.lives ? " It sees them up close: their towns, their craft, their radio. It came in quiet, so they may not know it is there." : v.ruins ? " Among the forests it sees ruins: cities long empty. Whoever lived there is gone." : v.elder ? ELDER[v.elder] : "") +
            (v.others?.length ? " Someone else has works here, not ours: a colony already landed. Whose, it can't tell." : "")
        : v.by === "sentinel" && v.lost
          ? `- ${v.world}: our sentinel there went silent at Year ${yearText(v.passed)}, word of it home at Year ${yearText(v.home)}. ${v.lost === "catch" ? "Its last pictures show a craft not ours closing on it." : "Its last word shows nothing coming."}`
        : v.by === "sentinel" && v.came
          ? `- ${v.world}: at Year ${yearText(v.passed)} our sentinel there saw ${v.others?.[0]?.kind === "colony" ? "a ship not ours, tens of thousands of tonnes, brake to a stop and stay" : "a craft not ours brake to a stop and stay, watching"}. Word home at Year ${yearText(v.home)}. Its flame, as it slowed, pointed back along its track to ${v.came}. Whoever it is has seen ours.`
        : v.by === "sentinel"
          ? `- ${v.world}, reached by our sentinel at Year ${yearText(v.passed)}, where it stays to watch, its first word home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}.` +
            (v.clock ? ` It spins at ${v.spin!.toFixed(2)} of the most a hole can. A clock on its innermost stable orbit would run ${(1 / v.clock).toFixed(1)} times slower than ours.` : "") +
            (v.sight === "dark" ? (v.others?.length ? ` We are not the first. ${others(v.others)} Whose, it can't tell.` : " No one else is there that it can see.") : "") +
            (v.lives ? " It sees them up close: their towns, their craft, their radio. They may have seen its flame." : v.ruins ? " Among the forests it sees ruins: cities long empty. Whoever lived there is gone." : v.elder ? ELDER[v.elder] : "")
          : `- ${v.world}, passed by our ${v.by} at Year ${yearText(v.passed)}, word home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}.`) +
      (v.air && !v.sent ? ` The ${v.by === "seed" ? "probe" : v.by} read its air: ${v.air.water ? "water" : "no water"}, ${v.air.oxygen ? "oxygen" : "no oxygen"}.` : ""),
  );
  // Black holes found. Each is dark: we know it by the stars it shifted. 2026-10-26.
  const dark = (view.holes ?? []).map(
    (h) =>
      `- ${h.name}, ${one(h.d)} ly: about ${h.mass} times the Sun's mass, found ${h.found < 0 ? `in ${2040 + h.found} by Gaia` : `at Year ${yearText(h.found)} by our Star Mapper`}, by how it shifted a star behind it. It gives off no light we can see. Its spin is unknown.`,
  );
  const c = view.colony;
  const colonyText = !c
    ? ""
    : `\n\nOur Mind sent to ${c.star} on the Seed Ship, to ${c.mode === "furnace" ? "feed the hole for power" : c.mode === "refuge" ? "live hidden in its shadow" : "settle there on the star's light and rock"}: ` +
      (c.lands === undefined
        ? `it leaves at Year ${yearText(c.leaves)}.`
        : view.year < c.lands + c.d!
          ? `it left at Year ${yearText(c.leaves)}, lands about Year ${yearText(c.lands)}, and its word of landing reaches us about Year ${yearText(c.lands + c.d!)}.`
          : `it landed at Year ${yearText(c.lands)} and stands alone as a Mind from Year ${yearText(c.stands!)}, ${one(c.d!)} light-years and Years away from us.` +
            (c.others?.length ? ` It was not the first there. ${c.atStar ? settledBy(c.others) : others(c.others)}` : " No one else was there.") +
            (c.clock ? ` The hole spins at ${c.spin!.toFixed(2)} of the most a hole can, so a clock on its innermost stable orbit runs ${(1 / c.clock).toFixed(1)} times slower than ours. ${c.mode === "refuge" ? "Our Mind there could spread over chips 10 cm wide on that orbit, small enough that its tides can't break them, and run that slow, once the Will lives there." : "Its furnace's disk fills that orbit, so our Mind can't live there."}` : "") +
            (c.came?.length ? ` Since then: ${c.came.map((x) => `at Year ${yearText(x.at)}, ${x.kind === "colony" ? "a ship not ours braked in and stayed" : "a craft not ours braked in and stays, watching"}, its track back to ${x.from}`).join("; ")}. Whoever came has seen ours.` : "") +
            (c.lost ? ` Its word stopped at Year ${yearText(c.lost.at)}. It is gone. ${c.lost.how === "strike" ? "Its last word showed nothing coming: whatever hit it came cold and fast." : "Its last word showed a craft not ours closing on it."}` : "") +
            (c.watts && !c.lost && c.mode === "settle" ? ` Its works on the star's light run at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it.` : "") +
            (c.watts && !c.lost && c.mode === "furnace" ? ` Its furnace runs at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it, under what any sky survey sees until about 10^19 W.` : c.mode === "refuge" ? " It keeps small and dark, and no one looking from outside would know it is there." : ""));
  const holesText = dark.length ? `\n\nBlack holes we have found. A star mapper finds more as they pass in front of stars:\n${dark.join("\n")}` : "";
  const mindsText = view.minds ? describeMinds(view.minds, one) : "";
  return `Worlds Earth has felt by their tug on their stars, as of Year ${yearText(view.year)}. From here a home and a natural world look the same:
${felt}${nearest}

Signals Earth's watch has caught:
${heard}${visits.length ? `\n\nWhat our craft have seen up close:\n${visits.join("\n")}` : ""}${holesText}${colonyText}${mindsText}`;
}

/** What Earth has found of the realistic premise's minds, as measured and never as who: each with what it could be,
 *  natural causes first, since minds are rare. lib/sim/minds.ts. 2026-10-29. */
function describeMinds(m: MindsSeen, one: (x: number) => string): string {
  const sky = (x: { ra: number; dec: number }) => `toward right ascension ${(Math.round(x.ra * 10) / 10 % 24).toFixed(1)} h, declination ${x.dec.toFixed(0)}°`;
  const watts = (w: number) => w.toExponential(0).replace("e+", "×10^");
  const out: string[] = [];
  if (m.flashes.length)
    out.push(
      `New warm glows our Warm Sky Watch has seen, mapping the whole sky every 2 Years, ten times deeper than WISE:\n` +
        m.flashes.map((f) =>
          `- ${sky(f)}: a new warm glow near room temperature, first seen at Year ${yearText(f.seen)}${f.faded !== undefined ? `, faded by Year ${yearText(f.faded)}` : ", still shining"}. ` +
          (f.range
            ? `Our Infrared Telescope ranged it at Year ${yearText(f.ranged!)}, by its reddening and the star behind it: roughly ${f.range[0].toLocaleString("en-US")} to ${f.range[1].toLocaleString("en-US")} ly, too far for parallax to say more. `
            : `Its distance isn't measured: too far for parallax, and our Infrared Telescope hasn't studied it while it shone. `) +
          `A glow like this fits a young star wrapped in dust, ` +
          `the dusty wreck of two stars merging, or something building around a star and catching its light. Nothing we have seen yet tells them apart.`).join("\n"),
    );
  if (m.glows.length)
    out.push(
      `Cold glows our Halo Survey has seen, looking at each star for an hour, nearest first:\n` +
        m.glows.map((g) =>
          `- ${sky(g)}, beside a star ${one(g.d)} ly away: a compact glow near 12 K, about ${watts(g.watts)} W, first seen at Year ${yearText(g.seen)}, steady. ` +
          `Its color fits no dust we know. It could be a cold disk of unusual grains, a measuring error, or computing done cold, far from a star.`).join("\n"),
    );
  if (m.watcher) {
    const w = m.watcher;
    out.push(
      w.by === "moon search"
        ? `A small dark body our Moon Search found at ${w.place}, about 10 cm across, first seen at Year ${yearText(w.seen)}. How long it held there before we looked, we can't tell. The Sun's pull unsettles anything at the Moon's L4 and L5 points within years, yet it holds there. No rock should.`
        : w.by === "asteroid tour"
          ? `On ${w.place}, our Asteroid Tour found a made thing about 10 cm across, at Year ${yearText(w.seen)}: smooth, dark and not of the rock. It has been there a long time. It sends nothing we can hear.`
          : `A narrow laser signal aimed at Earth from ${w.place}, beginning at Year ${yearText(w.seen)}, the Year our first seed ship left. Its timing reads as an answer to that ship. It comes from something small that we never found there.`,
    );
    // Our Close Look's word, and a knock the Will may send it. 2026-10-30.
    if (w.looked)
      out.push(
        `Our Close Look reached it and sent word home at Year ${yearText(w.looked.at)}. Up close it is near black, about 10 cm across, with a mirror about 2 cm wide held on one point of the sky, ${sky(w.looked)}, turning as the Earth and Moon turn to keep it there. ` +
          "A thing that reports home by laser would aim so. Whoever sent it likely lies that way, at a distance we can't tell, and we can't tell who. It surely saw our craft come.",
      );
    else if (w.by !== "its warning")
      out.push(
        "Finding it opened a new build, the Close Look: a small craft of CAPSTONE's class with a sharp camera, 2 Years to build, then about 4 months' flight to the Moon's L4 or L5 or a Year to a rock beside us. " +
          "From a few kilometers it would see what the body is made of and how it holds. It would also see our craft come.",
      );
    if (w.by !== "its warning")
      out.push(`The Will can knock on it, with a message aimed at "the watcher". It lands within seconds. What it does with a knock, and whether it passes word home, we can't know.`);
  }
  if (m.sleepers.length)
    out.push(
      `What our craft found resting in other systems:\n` +
        m.sleepers.map((x) =>
          `- ${sky(x)}, ${one(x.d)} ly away: a compact warm body ${lightTime(x.restAU)} from its star, shedding about 10^10 W, word home at Year ${yearText(x.seen)}. ` +
          `Starlight that far out would leave it near ${Math.round(278 / Math.sqrt(x.restAU))} K or colder, yet it is hundreds of K warmer. Something inside it makes heat.`).join("\n"),
    );
  return out.length ? `\n\n${out.join("\n\n")}` : "";
}
