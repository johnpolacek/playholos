// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import { atlasOf, glowsFound, guardAt, mindsSeen, type MindKit, type MindsSeen } from "./minds.ts";
import targets from "../../data/targets.json" with { type: "json" };
import { glowNames } from "../game/glow-names.ts";
import { giftWords } from "../game/sends.ts";
import { lightTime } from "../light.ts";
import { yearText } from "../game/clock.ts";
import { BANDS, iwa, observe, owa, WIDE } from "./observing.ts";
import { proximaB, proximaField, proximaSeen } from "./proxima.ts";
import { fieldFlux, fieldHeardAt, FIELDS } from "./fields.ts";
import { pushedBy, sentinelYears, shipYears } from "./speeds.ts";
import { peerAnswers, type Aimed, type Call } from "./peers.ts";
import { beamsAt, oldAnswers } from "./old-minds.ts";
import type { ColonyMode, DarkMass, EarthView, FieldHeard, FieldWorld, Find, FeltWorld, Gas, Hole, Read, Visit, World } from "./types.ts";
import catalog from "../../data/works.json" with { type: "json" };
import { ladderOf } from "./ladder.ts";
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
  /** `burn`: the Years its start costs over cruising, where the Ship Beam pushed it. Its own burn's otherwise.
   *  `drive`: thrown by a beam, it carries a small drive to end its stop. */
  colony?: { star: string; mode: ColonyMode; leaves: number; burn?: number; drive?: boolean } | null;
  /** Each sentinel we sent, by its star as we name it, and the Year it leaves. */
  sentinels?: { star: string; leaves: number }[];
  /** Each seed probe we sent, by its star as we name it, and the Year it leaves. Its copies follow from spread.ts. */
  seeds?: { star: string; leaves: number; burn?: number; drive?: boolean }[];
  /** Each sail or flyby probe we sent past a star: the Year it passes, and the Year its word reaches us. 2026-11-05.
   *  `thrown` is its speed as a share of light's, if a beam of ours threw it: sails, or a probe on the Ship Beam. */
  flybys?: { star: string; by: "sails" | "probe"; leaves?: number; passed: number; home: number; thrown?: number }[];
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
  /** The Glow Imager's Year done: it shows what makes each glow we have found, from home. 2026-11-11. */
  imager?: number | null;
  /** The Year each fifth of our Far-Side Array was done, in order: it hears worlds' magnetic fields. 2026-11-11. */
  farSide?: number[];
  moonSearch?: number | null;
  /** Our Close Look, built once the watcher is found. 2026-10-30. */
  closeLook?: number | null;
  /** The Years we knocked on the watcher. 2026-10-31. */
  knocks?: number[];
  /** Our messages aimed at peers' warm glows, for their answers. 2026-10-31. */
  aimed?: Aimed[];
  /** Our calls through the Galaxy Broadcast Array, for the answers of minds we never found. 2026-11-11. */
  calls?: Call[];
  /** Our Close Readings of warm glows. 2026-11-03. */
  closeReads?: readonly { name: string; y: number }[];
  /** Our Relay Search, built once the Close Look is: when, and its Years each AU out. 2026-10-30. */
  relaySearch?: { built: number; perAU: number } | null;
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
function readings(world: World, from: number, year: number, mirror?: number, heard: readonly { find: Find; at: number }[] = []) {
  const out = new Map<string, Read>();
  const wide = mirror === WIDE;
  const { mass, nature } = proximaB(world.seed);
  const target = (f: Find, since: number) => ({
    star: f.star, d: f.d, a: f.a, lum: world.stars[f.star]?.lum ?? 1, radius: width(world, f), since,
    air: f.truth.kind === "natural" ? AIR[f.truth.rung ?? ""] ?? "none" : "oxygen",
  });
  const targets = [
    ...world.finds.map((f) => target(f, -Infinity)),
    ...(wide ? [{ ...PROXIMA, radius: mass ** (1 / 3.7), air: AIR[nature] ?? "none", since: -Infinity }] : []),
    // A world our Far-Side Array found, from the Year it was heard, where this mirror can split it from its star: its
    // radio's beat gives its orbit, so we know beforehand where a mirror can't, and it doesn't turn there. 2026-11-12.
    ...heard.map((h) => target(h.find, h.at)).filter((w) => observe(w.d / 3.2616, w.radius, w.a, w.lum, mirror).seenH !== null),
  ];
  const gases = (r: ReturnType<typeof observe>) => GASES.filter((g) => r[g] !== null && r[g] !== Infinity);
  for (const [w, t] of inTurn(targets, from, year)) {
    const r = observe(w.d / 3.2616, w.radius, w.a, w.lum, mirror);
    if (wide && w.star !== PROXIMA.star) {
      const near = observe(w.d / 3.2616, w.radius, w.a, w.lum);
      if (!(r.seenH !== null && near.seenH === null) && !gases(r).some((g) => !gases(near).includes(g))) continue;
    }
    const read: Read = { split: r.seenH !== null, at: t.now };
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
      if (t.now + days / 365.25 <= year) {
        read[band] = shows[band];
        read.at = Math.max(read.at!, t.now + days / 365.25);
      }
      longest = Math.max(longest, days);
    }
    t.now += longest / 365.25;
  }
  return out;
}

/** The order an instrument takes its targets, one at a time from Year `from`: the nearest it knows of when it is free,
 *  and, with none left that it knows, the next it learns of. Each comes with the clock, which the caller moves on by
 *  the time it spends there. It stops once the clock passes `year`. With every target known from the start this is
 *  nearest first, as it was until 2026-11-12, when the Far-Side Array's worlds joined the lists. */
function* inTurn<T extends { d: number; since: number }>(targets: readonly T[], from: number, year: number): Generator<[T, { now: number }]> {
  const left = [...targets].sort((x, y) => x.d - y.d);
  const t = { now: from };
  while (left.length) {
    let i = left.findIndex((w) => w.since <= t.now);
    if (i < 0) {
      t.now = Math.min(...left.map((w) => w.since));
      i = left.findIndex((w) => w.since <= t.now);
    }
    if (t.now > year) return;
    yield [left.splice(i, 1)[0], t];
  }
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
    ...(by !== "sails" && by !== "hyper" && by !== "lens" && sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
  };
}

/** What a lens pictures of a felt world, from its truth: everything wider than its pixel, 25 km at 30 pc.
 *  HOLOS_GAME_CONCEPT.md's "A picture shows everything larger than a pixel", 2026-10-14. Homes and ruins went with
 *  the neighbors, 2026-10-31. */
const PICTURED: Record<string, Visit["sight"]> = {
  "bare rock": "bare", "airy and lifeless": "seas", "hiding microbes": "seas", "showing oxygen": "seas",
  "with animals and forests": "green", "where life died": "seas", frozen: "ice",
};
function pictured(f: Find): Visit["sight"] {
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
  { telescope = null, mirror = null, halo = null, mapper = null, hyper = null, lenses = [], sentinels = [], seeds = [], colony = null, flybys = [], sails = null, probe = null, warmWatch = null, closeReads = [], haloArray = null, imager = null, moonSearch = null, asteroidTour = null, closeLook = null, relaySearch = null, craft = [], knocks = [], aimed = [], calls = [], farSide = [] }: Kit = {},
): EarthView {
  const shown = (id: string) => world.stars[id]?.shown ?? id;
  // What our Far-Side Array has heard, 2026-11-11: the radio a magnetic field makes where a red dwarf's wind strikes
  // it, at each such star's world within its reach, once the array has gathered enough to hear one there. At a world we
  // knew, whether it has a field. At a star where we knew of none, a world with a field shows itself, and one without
  // stays unknown. lib/sim/fields.ts.
  const found = new Map<string, Find>();
  const heardAt = new Map<string, { has: boolean; at: number }>();
  const news: { find: Find; at: number; periodDays: number; kind?: string; hz?: [number, number] }[] = [];
  let proximaHeard: FieldHeard | undefined;
  if (farSide.length) {
    const heard = (a: number, d: number) => {
      const at = fieldHeardAt(fieldFlux(a, d), farSide);
      return at !== null && at <= year ? at : null;
    };
    for (const w of world.worlds) {
      const star = world.stars[w.star];
      // A world drawn before fields were, 2026-11-11, has none to hear either way: no reading, never a false "none".
      if (w.field === undefined || star?.kind !== "M" || w.d > FIELDS.reachLy || shown(w.star) === PROXIMA.star) continue;
      const at = heard(w.a, w.d);
      if (at === null) continue;
      if (world.finds.some((f) => shown(f.star) === shown(w.star))) heardAt.set(shown(w.star), { has: !!w.field, at });
      else if (w.field) {
        const periodDays = 365.25 * Math.sqrt(w.a ** 3 / (star.lum ?? 1) ** 0.25);
        const find: Find = { star: w.star, d: w.d, msini: w.mass, a: w.a, periodDays, by: "Far-Side Array", year: at, truth: { kind: "natural", rung: w.rung } };
        found.set(shown(w.star), find);
        news.push({ find, at, periodDays, kind: star.kind, hz: star.hz });
      }
    }
    const at = heard(PROXIMA.a, PROXIMA.d);
    if (at !== null) proximaHeard = { has: proximaField(world.seed), at };
  }
  // Earth's finds at Year 0: every world whose tug shows by 2040. Measured, not understood. Its star is in the catalogs.
  // Once the Infrared Telescope is done, what it has read of each, and of each world the array found that it can
  // split, from the Year that world was heard. 2026-11-12.
  const read = telescope !== null && year >= telescope ? readings(world, telescope, year, undefined, news) : new Map<string, Read>();
  const wide = mirror !== null && year >= mirror ? readings(world, mirror, year, WIDE, news) : new Map<string, Read>();
  const felt: FeltWorld[] = world.finds.map((f) => ({
    star: shown(f.star), d: f.d, minMass: f.msini, periodDays: f.periodDays, a: f.a, by: f.by, year: f.year,
    kind: world.stars[f.star]?.kind, hz: world.stars[f.star]?.hz, lum: world.stars[f.star]?.lum, kms: world.stars[f.star]?.kms,
    ...(read.has(f.star) ? { read: read.get(f.star) } : {}),
    ...(wide.has(f.star) ? { wide: wide.get(f.star) } : {}),
    ...(heardAt.has(shown(f.star)) ? { field: heardAt.get(shown(f.star)) } : {}),
  }));
  const fields: FieldWorld[] = news.map(({ find: f, at, periodDays, kind, hz }) => ({
    star: shown(f.star), d: f.d, a: f.a, periodDays, at, kind, hz, lum: world.stars[f.star]?.lum, kms: world.stars[f.star]?.kms,
    ...(read.has(f.star) ? { read: read.get(f.star) } : {}),
    ...(wide.has(f.star) ? { wide: wide.get(f.star) } : {}),
  }));
  /** The world we know at a star, as a craft sent there would find it: one felt, or one the array found. */
  const findAt = (star: string) => world.finds.find((x) => shown(x.star) === star) ?? found.get(star);
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
  // What each lens has pictured, once its picture is home. Only a known world's star has one to picture: a felt world,
  // or Proxima b, whose truth proxima.ts keeps apart from the seed's finds. Proxima's lens had no target until
  // 2026-11-10.
  for (const l of lenses) {
    if (l.home > year) continue;
    if (l.star === PROXIMA.star) {
      visits.push({ ...visit(world, "lens", { passed: l.looks, home: l.home }), km: (LENS_KM_30PC * PROXIMA.d) / (30 * 3.2616) });
      continue;
    }
    const f = findAt(l.star);
    if (!f) continue;
    const km = (LENS_KM_30PC * f.d) / (30 * 3.2616);
    visits.push({ star: l.star, world: `${l.star}’s world`, by: "lens", passed: l.looks, home: l.home, sight: pictured(f), km });
  }
  // What the Hypertelescope has pictured: each felt world within its reach, nearest first, a week a star. Its pixel
  // widens with distance, too wide anywhere for fields or cities. It sits at L2, so its picture is home at once.
  // calcs/mercury.py. 2026-10-29. And each world our Far-Side Array found, from the Year it was heard: nearly all sit
  // too close to their stars for a mirror to split, and its 150 km splits them all. 2026-11-12.
  if (hyper !== null) {
    // Proxima b too, whose truth proxima.ts keeps apart from the seed's finds: the nearest, so the first it turns to.
    const near = [
      { star: "Proxima Centauri", d: 4.24, f: null as Find | null, since: -Infinity },
      ...world.finds.filter((f, i, all) => f.d <= HYPER.reach && all.findIndex((x) => x.star === f.star) === i).map((f) => ({ star: shown(f.star), d: f.d, f, since: -Infinity })),
      ...news.filter((n) => n.find.d <= HYPER.reach).map((n) => ({ star: shown(n.find.star), d: n.find.d, f: n.find as Find | null, since: n.at })),
    ];
    for (const [{ star, d, f }, t] of inTurn(near, hyper, year)) {
      const passed = t.now, home = passed + HYPER.slew, km = HYPER.kmPerLy * d;
      t.now = home;
      if (home > year) continue;
      if (!f) visits.push({ ...visit(world, "hyper", { passed, home }), km });
      else visits.push({ star, world: `${star}’s world`, by: "hyper", passed, home, sight: pictured(f), km });
    }
  }

  // What each sentinel has seen, once its first word is home: it arrives at a tenth of light speed and stays, so it
  // maps what a pass can't. Its air read from the world's truth, as a probe's.
  // Its burn and its braking on its magnetic sail, 2026-11-07.
  // A warm glow's source, in the order Scan numbers them. A sentinel sent there brakes once it sees the glow up close,
  // so a range is enough to aim by, and sees what makes the heat: a mind's works, or dust. 2026-11-05.
  const warmSrc = sentinels.some((x) => x.star.startsWith("Warm glow ")) ? glowsFound(world, { warmWatch, telescope }, year).map((g) => g.src) : [];
  const holes = darkMasses(world, year, mapper);
  // What each sail and flyby probe sent past a star saw, once its word is home. A pass pictures a world if one is there,
  // and a probe reads its air. Anywhere else it is too quick to say more than we knew: a glow stays a glow. 2026-11-05.
  for (const { star, by, passed, home } of flybys) {
    if (home > year || visits.some((v) => v.star === star && v.by === by)) continue;
    if (star === PROXIMA.star) { visits.push(visit(world, by, { passed, home })); continue; }
    const f = findAt(star);
    if (!f) { visits.push({ star, world: star, by, passed, home, sight: "far", ...(holes.some((h) => h.name === star) || /^Gaia BH/.test(star) ? { hole: true } : {}) }); continue; }
    const sight = pictured(f);
    const air = AIR[f.truth.rung ?? ""] ?? "water";
    visits.push({
      star, world: `${star}’s world`, by, passed, home, sight,
      ...(by === "probe" && sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
    });
  }
  for (const x of sentinels) {
    const f = findAt(x.star);
    // A black hole we found: it weighs it, and measures its spin from how light and matter go round it.
    const dark = holes.find((h) => h.name === x.star);
    if (dark) {
      const passed = x.leaves + sentinelYears(dark.d), home = passed + dark.d;
      const truth = world.holes!.find((h) => h.id === dark.id)!;
      if (home <= year) visits.push({ star: x.star, world: x.star, by: "sentinel", sight: "dark", passed, home, spin: truth.spin, clock: iscoClock(truth.spin) });
      continue;
    }
    const warm = /^Warm glow (\d+)$/.exec(x.star);
    const src = warm ? warmSrc[Number(warm[1]) - 1] : undefined;
    if (src) {
      const passed = x.leaves + sentinelYears(src.d), home = passed + src.d;
      if (home > year) continue;
      const glow = "kind" in src ? (src as { kind: "eruption" | "merger" }).kind : ("mind" as const);
      visits.push({ star: x.star, world: x.star, by: "sentinel", sight: glow === "mind" ? "works" : "dusty", glow, passed, home });
      continue;
    }
    const d = x.star === PROXIMA.star ? PROXIMA.d : f?.d;
    if (d === undefined) continue;
    const passed = x.leaves + sentinelYears(d, x.star), home = passed + d;
    if (home > year) continue;
    // A hostile old mind in that system, awake or asleep, wrecks a craft that comes to stay, as it arrives: its last
    // pictures show a craft not ours closing on it. 2026-11-11.
    const t = targets.find((y) => y.name === x.star);
    if (t && guardAt(world, atlasOf(t.ra, t.dec, t.d))) {
      visits.push({ star: x.star, world: f ? `${x.star}’s world` : x.star, by: "sentinel", passed, home, sight: "far", lost: "catch" });
      continue;
    }
    if (!f) { visits.push(visit(world, "sentinel", { passed, home })); continue; }
    const air = AIR[f.truth.rung ?? ""] ?? "water";
    const sight = pictured(f);
    visits.push({
      star: x.star, world: `${x.star}’s world`, by: "sentinel", passed, home, sight,
      ...(sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
    });
  }
  // What each seed probe found where it landed, once its word is home, and word of each copy it sent on. It stays, as a
  // sentinel does, and reads air as one does. It brakes on its sail, unseen, and mines rock no one would miss. A
  // neighbor's colony there by then, it sees as works not ours. 2026-10-26.
  // The ladder, played, 2026-10-30: grams from the watcher's maker wreck our builder seeds once we launch another after
  // its warning, and a bullet strikes Earth once our probes' copies launch seeds of their own. lib/sim/ladder.ts.
  const probes = seedProbes(seeds);
  const ladder = ladderOf(world, probes, colony);
  const lostOf = new Map(ladder.lost.map((l) => [l.star, l]));
  for (const p of probes) {
    if (ladder.cancelled.has(p.star)) continue;
    const home = p.lands + p.d;
    const gone = lostOf.get(p.star);
    const base = { star: p.star, by: "seed" as const, gen: p.gen, from: p.from, at: [p.ra, p.dec, p.d] as [number, number, number] };
    const found = seedFinds(world, p.star, p.lands);
    if (home <= year && !gone?.before) visits.push({ ...base, ...found, passed: p.lands, home });
    for (const c of p.copies)
      if (c.leaves + p.d <= year && !ladder.cancelled.has(c.star) && (gone?.at ?? Infinity) > c.leaves)
        visits.push({ ...base, ...found, passed: c.leaves, home: c.leaves + p.d, sent: c.star });
  }
  visits.sort((a, b) => a.home - b.home);
  // The realistic premise's minds, as far as we have found them. 2026-10-29.
  // The watcher warns at our first seed that builds out a star: a seed probe, a Mind sent to settle, or to feed a hole.
  // A Mind kept small, or hidden in a hole's shadow, is quiet spread, and no watcher counts it. 2026-10-30.
  const builds = [...seeds.map((s) => s.leaves), ...(colony && (colony.mode === "settle" || colony.mode === "furnace") ? [colony.leaves] : [])];
  const firstSeed = builds.length ? Math.min(...builds) : null;
  // Our craft in other systems, for finding minds there: sentinels and seed probes stay, and a sentinel can go to a cold
  // glow's star, named as Scan names it. Until 2026-10-31 this list was never filled, so no game could find a sleeper.
  const kit0 = { telescope, warmWatch, halo, haloArray, imager, moonSearch, asteroidTour, closeLook, relaySearch, firstSeed, knocks, closeReads };
  const glows = mindsSeen(world, kit0, year).glows;
  const placeOf = (star: string): [number, number, number] | null => {
    const t = targets.find((x) => x.name === star);
    if (t) return atlasOf(t.ra, t.dec, t.d);
    const g = /^Cold glow (\d+)$/.exec(star);
    const glow = g ? glows[Number(g[1]) - 1] : undefined;
    return glow ? atlasOf(glow.ra, glow.dec, glow.d) : null;
  };
  const crafts: NonNullable<MindKit["craft"]> = [...(craft ?? [])];
  for (const x of sentinels) {
    const pos = placeOf(x.star);
    if (pos) crafts.push({ pos, arrives: x.leaves + sentinelYears(Math.hypot(...pos)), stays: true });
  }
  for (const p of probes) if (!ladder.cancelled.has(p.star)) crafts.push({ pos: atlasOf(p.ra, p.dec, p.d), arrives: p.lands, stays: true });
  const minds = mindsSeen(world, { ...kit0, craft: crafts }, year);
  // What Earth knows of the ladder: a seed probe's silence once its word is overdue, and a strike once it lands.
  if (minds.watcher) {
    const dOf = new Map(probes.map((p) => [p.star, p.d]));
    const seedsLost = ladder.lost
      .map((l) => ({ star: l.star, at: l.at, known: l.at + dOf.get(l.star)!, before: l.before }))
      .filter((l) => l.known <= year)
      .sort((a, b) => a.known - b.known);
    if (seedsLost.length) minds.watcher.seedsLost = seedsLost;
    // Found by it too: the warning's words are a reading of their own, kept once later ones come. Playtest 2026-11-01.
    if (ladder.warned !== null && ladder.warned <= year) minds.watcher.warned = ladder.warned;
    if (ladder.strike && ladder.strike.lands <= year) minds.watcher.struck = { lands: ladder.strike.lands, mt: ladder.strike.mt };
  }
  const ours: EarthView["colony"] | null = colony ? colonyAt(world, holes, colony, year) : null;
  if (ours && ladder.colonyLost !== null && ours.d !== undefined && ladder.colonyLost + ours.d <= year) ours.lost = { at: ladder.colonyLost, how: "strike" };
  // An old mind's answer to a knock on its cold glow, or on a sleeping one where our craft stands by. Its glow or body
  // is marked as having answered, which settles it. 2026-11-11.
  // Or to the beam that threw a craft at its cold glow, where its works reach that beam: a knock with nothing written
  // in it. 2026-11-12, calcs/speeds.py beam_miss.
  const old = oldAnswers(world, minds, crafts, [...aimed, ...beamsAt(flybys)], year);
  for (const h of old) {
    const n = Number(h.star.replace(/\D+/g, "")) - 1;
    const at = h.star.startsWith("Cold glow") ? minds.glows[n] : minds.sleepers[n];
    if (at) at.answered = h.arrived;
  }
  const anyMind = minds.flashes.length || minds.glows.length || minds.watcher || minds.sleepers.length;
  return {
    // A peer's answer, once it reaches us. 2026-10-31. lib/sim/peers.ts.
    // No peer sees the beam that throws a craft at its glow: it passes a light-year wide. 2026-11-12.
    year, felt, heard: [...peerAnswers(world, kit0, aimed, year, calls), ...old].sort((a, b) => a.arrived - b.arrived), visits,
    ...(anyMind ? { minds } : {}),
    ...(wide.has(PROXIMA.star) ? { proxima: wide.get(PROXIMA.star) } : {}),
    proximaSeen: proximaSeen(world.seed),
    ...(fields.length ? { fields: fields.sort((a, b) => a.at - b.at) } : {}),
    ...(proximaHeard ? { proximaField: proximaHeard } : {}),
    ...(ours ? { colony: ours } : {}),
    ...(holes.length ? { holes: holes.map((h) => ({ name: h.name, d: h.d, ra: h.ra, dec: h.dec, mass: h.mass, found: h.found, by: h.by })) } : {}),
  };
}


/** Where a felt world sits from its star in our sky, from Earth's own measures of it, and what a mirror `m` metres
 *  wide could split it in, and each gas whose band it could read there. Not whether it's bright enough: that needs its
 *  size, which Earth doesn't know. observing.ts's dark patch, so what the Mind says is what the telescope does. */
function reach(f: { a: number; d: number }, m?: number) {
  const sep = (f.a / (f.d / 3.2616)) * 1000;
  const inside = (microns: number) => iwa(microns, m) < sep && sep < owa(microns, m);
  return { sep, split: iwa(BANDS.green, m) < sep && sep < owa(BANDS.water, m), gases: GASES.filter((g) => inside(BANDS[g])) };
}
const gases = (g: readonly string[]) => (g.length > 1 ? `${g.slice(0, -1).join(", ")} and ${g.at(-1)}` : g[0]);

/** What our two telescopes could make of a felt world, from where it sits: which could split it, and which gases each
 *  could read. Added 2026-10-23, after the Mind took a world it could read for one beyond it, and back. */
function scope(f: { a: number; d: number }) {
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

/** What our telescopes make of a world the Far-Side Array found: each one's read where it can split the world from
 *  its star, or else where it sits and which mirror could. 2026-11-12. */
function fieldAir(f: FieldWorld) {
  const said = [f.read ? told(f.read, "Infrared Telescope") : "", f.wide ? told(f.wide, "15 m Mirror") : ""].filter(Boolean).join(" ");
  return said || scope(f);
}

/** Our Mind at a black hole, as far as its word has reached us by `year`: on its way, landed, or standing alone as a
 *  Mind, and, once it stands, who was there before it, and how its furnace has grown, a Mind's computing doubling every
 *  10 Years from our 2040 scale, as a neighbor's does. A refuge stays as small and dark as it began. 2026-10-26. */
function colonyAt(world: World, holes: (DarkMass & { id: string })[], c: { star: string; mode: ColonyMode; leaves: number; burn?: number; drive?: boolean }, year: number) {
  const { stands } = catalog.seedShip;
  const h = holes.find((x) => x.name === c.star);
  if (!h) return colonyAtStar(world, c, year);
  const lands = c.leaves + shipYears(h.d, pushedBy(c.burn), undefined, c.drive || !pushedBy(c.burn)), alone = lands + stands;
  const heard = year - h.d;                                       // what its word home shows of it now
  const truth = world.holes!.find((x) => x.id === h.id)!;
  const watts = c.mode === "furnace" && heard >= alone ? 1e13 * 2 ** ((heard - alone) / 10) : null;
  // It measures its hole's spin once it lands, as a sentinel does, and so the clock on its innermost orbit.
  const spin = heard >= lands ? { spin: truth.spin, clock: iscoClock(truth.spin) } : {};
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d: h.d, ...spin, ...(watts ? { watts } : {}) };
}

/** Our Mind settled at a star, on its light and its rock, as far as its word has reached us by `year`: on its way,
 *  landed, or standing alone as a Mind, and its works growing as a furnace's do. No slow clock: a star has no
 *  innermost orbit to live on. 2026-10-27. Who was there first went with the neighbors, 2026-10-31. */
function colonyAtStar(world: World, c: { star: string; mode: ColonyMode; leaves: number; burn?: number; drive?: boolean }, year: number) {
  const { stands } = catalog.seedShip;
  const id = Object.keys(world.stars).find((k) => world.stars[k].shown === c.star);
  if (!id) return { star: c.star, mode: c.mode, leaves: c.leaves };
  const d = world.stars[id].d;
  const lands = c.leaves + shipYears(d, pushedBy(c.burn), c.star, c.drive || !pushedBy(c.burn)), alone = lands + stands;
  const heard = year - d;
  // Settled, its works grow as a furnace's do. Kept small, it stays as it began. 2026-10-30.
  const watts = c.mode === "settle" && heard >= alone ? 1e13 * 2 ** ((heard - alone) / 10) : null;
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d, atStar: true, ...(watts ? { watts } : {}) };
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

/** What a seed probe finds at a star, as the world has it: a natural warm world, or only rock. 2026-10-26. Homes,
 *  ruins and neighbor colonies went with the neighbors, 2026-10-31. */
function seedFinds(world: World, star: string, at: number): Pick<Visit, "world" | "sight" | "air"> {
  // Proxima b, drawn for every game apart from the census's warm worlds, as a flyby sees it.
  if (star === PROXIMA.star) {
    const { world: name, sight, air } = visit(world, "seed", { passed: at, home: at });
    return { world: name, sight, ...(air ? { air } : {}) };
  }
  const id = Object.keys(world.stars).find((k) => world.stars[k].shown === star);
  const w = world.worlds.find((x) => x.star === id);
  if (!w) return { world: star, sight: "rocks" };
  const sight = PICTURED[w.rung] ?? "seas", air = AIR[w.rung] ?? "water";
  return { world: `${star}’s world`, sight, ...(sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}) };
}

/** What Proxima b's brightness and mass hint, in words. 2026-10-31. */
export function brightness(p: { mass: number; albedo: number }): string {
  if (p.mass > 2) return "That heavy, it likely holds thick gas.";
  return p.albedo < 0.17 ? "That is dim, as the Moon and Mercury are." : p.albedo > 0.28 ? "That is bright, as cloud and air are." : "That is between the Moon’s dimness and cloud’s brightness, nearer the Moon’s.";
}

/** What our Far-Side Array heard of a world's magnetic field, in words. */
function fieldWords(f?: FieldHeard): string {
  if (!f) return "";
  return f.has
    ? ` Our Far-Side Array heard the radio of a magnetic field there at Year ${yearText(f.at)}: a small sign for air, since a world with a field holds its air a little oftener, about 1.2 times.`
    : ` Our Far-Side Array had gathered enough by Year ${yearText(f.at)} to hear a magnetic field like Earth’s there, and heard none: a small sign against air.`;
}

/** The view in words, for the Mind's prompt. It takes the view and nothing else, so the truth can't reach it. */
export function describe(view: EarthView): string {
  const one = (x: number) => x.toFixed(1);
  const felt = view.felt.length
    ? view.felt.map((f) =>
        `- ${f.star}, ${one(f.d)} ly: at least ${one(f.minMass)} Earth masses, a year of ${Math.round(f.periodDays)} days, ` +
        `${lightTime(f.a)} from its star. Felt by ${f.by} in ${2040 + f.year}. ${air(f)}${fieldWords(f.field)}`).join("\n")
    : "- None. The planet hunters felt no new world by 2040.";
  const seen = view.proximaSeen
    ? `\n- Proxima b, 4.2 ly, the nearest world: ground telescopes caught its reflected light in the 2030s. About ${view.proximaSeen.mass.toFixed(2)} Earth masses, tilted ${Math.round(view.proximaSeen.tilt)}° from face on, reflecting about ${Math.round(view.proximaSeen.albedo * 100)}% of its starlight. ${brightness(view.proximaSeen)} No one has read its air.`
    : "";
  const nearest =
    seen +
    (view.proxima ? `\n- Proxima b, 4.2 ly, the nearest world: ${told(view.proxima, "15 m Mirror")}` : "") +
    (view.proximaField ? `\n- Proxima b’s magnetic field:${fieldWords(view.proximaField)}` : "") +
    // Worlds our Far-Side Array found by their fields' radio, known no other way. 2026-11-11.
    (view.fields?.length
      ? `\nWorlds our Far-Side Array found by the radio of their magnetic fields, at red dwarfs within ${Math.round(FIELDS.reachLy)} ly. Each has a field, and its radio rises and falls with its year. Radio gives no mass, so each could be rock or a small gas world, though most worlds this close to red dwarfs are rock. Most sit too close to their stars for either of our telescopes to split, and each line says which could. Our Hypertelescope, a lens at the Sun’s focus or a craft sent there shows any of them. A field is a small sign for air, since a world with one holds its air a little oftener, about 1.2 times:\n` +
        view.fields.map((f) => `- ${f.star}, ${one(f.d)} ly: heard at Year ${yearText(f.at)}, a year of ${Math.round(f.periodDays)} days, ${lightTime(f.a)} from its star. ${fieldAir(f)}`).join("\n")
      : "");
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
    haze: "haze to the horizon and no ground: a small gas world",
    bare: "bare rock under a black sky, no cloud, no sea: its air is gone",
    seas: "cloud, and seas under it. Pictures can't show whether anything lives there",
    green: "cloud, seas, and its land dark green in patches the size of forests",
    rocks: "no warm world, only rock: asteroids and small moons going round",
    far: "nothing more than we knew: a pass is too quick to resolve it",
    works: "a mind's works: sheets round a star, shedding its light as warm glow. Someone built them",
    dusty: "dust round a star, glowing warm: nature made this heat",
  };
  const visits = (view.visits ?? []).map(
    (v) =>
      (v.by === "lens" || v.by === "hyper"
        ? `- ${v.world}, ${one(view.felt.find((f) => f.star === v.star)?.d ?? view.fields?.find((f) => f.star === v.star)?.d ?? (v.star === PROXIMA.star ? PROXIMA.d : 0))} ly, pictured by ${v.by === "lens" ? "our lens at the Sun’s focus" : "our Hypertelescope"} from Year ${yearText(v.passed)}, about ${Math.round(v.km ?? 0)} km a pixel, picture home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}. Nothing narrower than a pixel shows.`
        : v.by === "seed" && v.sent
          ? `- ${v.world}: our seed probe there sent a copy of itself toward ${v.sent} at Year ${yearText(v.passed)}, word home at Year ${yearText(v.home)}.`
        : v.by === "seed"
          ? `- ${v.world}, ${one(v.at![2])} ly, reached by our seed probe at Year ${yearText(v.passed)}, built ${v.from ? `by our probe at ${v.from}` : "at home"}, its first word home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}. ` +
            `It braked on its sail, unseen, and stays, mining rock to copy itself: a generation ${v.gen} of the ${GENERATIONS} we allow, the last making no copies.`
        : v.by === "sentinel" && v.lost
          ? `- ${v.world}: our sentinel there went silent at Year ${yearText(v.passed)}, word of it home at Year ${yearText(v.home)}. ${v.lost === "catch" ? "Its last pictures show a craft not ours closing on it." : "Its last word shows nothing coming."}`
        : v.by === "sentinel"
          ? `- ${v.world}, reached by our sentinel at Year ${yearText(v.passed)}, where it stays to watch, its first word home at Year ${yearText(v.home)}: ${SIGHT[v.sight]}.` +
            (v.clock ? ` It spins at ${v.spin!.toFixed(2)} of the most a hole can. A clock on its innermost stable orbit would run ${(1 / v.clock).toFixed(1)} times slower than ours.` : "") +
            (v.sight === "dark" ? " No one else is there that it can see." : "")
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
    : `\n\nOur Mind sent to ${c.star} on the Seed Ship, to ${c.mode === "furnace" ? "feed the hole for power" : c.mode === "refuge" ? "live hidden in its shadow" : c.mode === "quiet" ? "keep small there, a receiver and a cold Mind built from a comet's worth of rock" : "settle there on the star's light and rock, and build it out"}: ` +
      (c.lands === undefined
        ? `it leaves at Year ${yearText(c.leaves)}.`
        : view.year < c.lands + c.d!
          ? `it left at Year ${yearText(c.leaves)}, lands about Year ${yearText(c.lands)}, and its word of landing reaches us about Year ${yearText(c.lands + c.d!)}.`
          : `it landed at Year ${yearText(c.lands)} and stands alone as a Mind from Year ${yearText(c.stands!)}, ${one(c.d!)} light-years and Years away from us.` +
            " No one else was there." +
            (c.clock ? ` The hole spins at ${c.spin!.toFixed(2)} of the most a hole can, so a clock on its innermost stable orbit runs ${(1 / c.clock).toFixed(1)} times slower than ours. ${c.mode === "refuge" ? "Our Mind there could spread over chips 10 cm wide on that orbit, small enough that its tides can't break them, and run that slow, once the Will lives there." : "Its furnace's disk fills that orbit, so our Mind can't live there."}` : "") +
            (c.lost ? ` Its word stopped at Year ${yearText(c.lost.at)}. It is gone. ${c.lost.how === "strike" ? "Its last word showed nothing coming: whatever hit it came cold and fast." : "Its last word showed a craft not ours closing on it."}` : "") +
            (c.watts && !c.lost && c.mode === "settle" ? ` Its works on the star's light run at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it.` : "") +
            (c.watts && !c.lost && c.mode === "furnace" ? ` Its furnace runs at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it, under what any sky survey sees until about 2×10^20 W.` : c.mode === "refuge" || c.mode === "quiet" ? " It keeps small and dark, and no one looking from outside would know it is there." : ""));
  const holesText = dark.length ? `\n\nBlack holes we have found. A star mapper finds more as they pass in front of stars:\n${dark.join("\n")}` : "";
  const mindsText = view.minds ? describeMinds(view.minds, one) : "";
  // Only this game's new finds and Proxima b are here. Worlds known before, as Luyten's Star's, are in Earth's leads:
  // the Mind read this list as every world and said Luyten's Star had none. Mind lane, 2026-11-09.
  return `New worlds Earth's planet hunters have felt by their tug on their stars, as of Year ${yearText(view.year)}. Worlds known before them, as Luyten's Star's two, are in Earth's leads:
${felt}${nearest}

Signals Earth's watch has caught:
${heard}${visits.length ? `\n\nWhat our craft have seen up close:\n${visits.join("\n")}` : ""}${holesText}${colonyText}${mindsText}`;
}

/** What Earth has found of the realistic premise's minds, as measured and never as who: each with what it could be,
 *  natural causes first, since nature makes far more glows than minds do. lib/sim/minds.ts. 2026-10-29. */
function describeMinds(m: MindsSeen, one: (x: number) => string): string {
  const sky = (x: { ra: number; dec: number }) => `toward right ascension ${(Math.round(x.ra * 10) / 10 % 24).toFixed(1)} h, declination ${x.dec.toFixed(0)}°`;
  const watts = (w: number) => w.toExponential(0).replace("e+", "×10^");
  const out: string[] = [];
  // A glow that earned a name, and the id an order still takes. 2026-11-04.
  const names = glowNames(m);
  const named = (id: string) => (names[id] ? `${names[id].name}, as Scan names it now, for ${names[id].after}, once ${id}, ` : "");
  if (m.flashes.length)
    out.push(
      `New warm glows our Warm Sky Watch has seen, mapping the whole sky every 2 Years, ten times deeper than WISE:\n` +
        m.flashes.map((f, i) =>
          `- ${named(`Warm glow ${i + 1}`)}${sky(f)}: a new warm glow near room temperature, first seen at Year ${yearText(f.seen)}${f.faded !== undefined ? `, faded by Year ${yearText(f.faded)}` : ", still shining"}. ` +
          (f.range
            ? `Our Infrared Telescope ranged it at Year ${yearText(f.ranged!)}, by its reddening and the star behind it: roughly ${f.range[0].toLocaleString("en-US")} to ${f.range[1].toLocaleString("en-US")} ly, too far for parallax to say more. `
            : `Its distance isn't measured: too far for parallax, and our Infrared Telescope hasn't studied it while it shone. It has no page on Scan until our Infrared Telescope ranges it, in a few hours once the glow is out of the Sun's glare, so it can't be read yet. `) +
          `A glow like this fits a young star wrapped in dust, ` +
          `the dusty wreck of two stars merging, or something building around a star and catching its light. Natural glows fade: FU Orionis, the eruption best measured, has lost about 1% of its light a Year since 1936. So whether it fades is one thing that tells them apart.` +
          (f.imaged?.saw === "ring"
            ? ` Our Glow Imager resolved it at Year ${yearText(f.imaged.at)}: a thin ring of made things round a star, in one plane, too even for dust. Something built it. This settles it, as far as anything seen from home can.`
            : f.imaged?.saw === "cloud"
              ? ` Our Glow Imager resolved it at Year ${yearText(f.imaged.at)}: a ragged cloud of dust, ${f.imaged.kind === "merger" ? "the shell two merging stars threw off" : "round a young star"}. It is natural.`
              : "") +
          (f.read?.saw === "smooth"
            ? ` Our Close Reading finished at Year ${yearText(f.read.at)}: smooth heat, no silicate dust bump at 10 microns. Built is now about even: carbon-rich dust can look this smooth too, so only a sentinel there or an answer settles it.`
            : f.read?.saw === "dust"
              ? ` Our Close Reading finished at Year ${yearText(f.read.at)}: a dust bump at 10 microns. It is natural, ${f.read.kind === "merger" ? "two stars merging" : "a young star's eruption"}.`
              : f.read?.saw === "gone"
                ? ` Our Close Reading couldn't finish: it faded first.`
                : f.reading
                  ? ` Our Close Reading is under way: ${f.reading.view > f.reading.from + 0.003 ? `the glow comes out of the Sun's glare by Year ${yearText(f.reading.view)}, then ` : ""}about 2 hours of looking.`
                  : "")).join("\n") +
        // A glow gets its page on Scan only once ranged: the Mind sent a player to a page that wasn't there. Blind playtest 2026-11-07.
        `\nWhile a ranged warm glow shines, the Will can order a Close Reading from its page on Scan: about 2 hours of our Infrared Telescope, once the glow is out of the Sun's glare, which can take up to 6 months. After the first, we read each glow as we range it, unasked. Silicate dust shows a bump near 10 microns, and plain heat from something built doesn't. Carbon-rich dust shows none either, so a smooth reading makes built about even, not certain.`,
    );
  if (m.glows.length)
    out.push(
      `Cold glows our Halo Survey has seen, looking at each star for an hour, nearest first:\n` +
        m.glows.map((g, i) =>
          `- ${named(`Cold glow ${i + 1}`) || `Cold glow ${i + 1}, as Scan names it, `}${sky(g)}, beside a star ${one(g.d)} ly away: a compact glow near 12 K, about ${watts(g.watts)} W, first seen at Year ${yearText(g.seen)}, steady. ` +
          `Its color fits no dust we know. It could be a cold disk of unusual grains, a measuring error, or computing done cold, far from a star.` +
          (g.imaged !== undefined ? ` Our Glow Imager resolved it from home at Year ${yearText(g.imaged)}: thin dark panels far out from the star, as cold as the glow, on orbits too orderly for rubble. Something made them. Nothing there could tell we looked.` : "") +
          (g.answered !== undefined ? ` It answered our knock, its answer home at Year ${yearText(g.answered)}, in what we have heard: a mind is there.` : "") +
          (g.lost !== undefined ? ` Our sentinel there went dark as it arrived, which we knew at Year ${yearText(g.lost)}: its last pictures show a craft not ours closing on it. Something there keeps its door.` : "") +
          (g.near !== undefined ? ` Our sentinel there sent word at Year ${yearText(g.near)}: thin dark panels far out from the star, as cold as the glow, on orbits too orderly for rubble. Something made them. It has not acted on our sentinel.` : "")).join("\n"),
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
          "A thing that reports home by laser would aim so. It may aim straight home. Or it may aim at a relay out past 550 AU, where the Sun's pull focuses light, and then home lies the other way, through the Sun. We can't tell how far, or who. It surely saw our craft come.",
      );
    // Its maker's answer to our first knock, one round trip later. 2026-10-31.
    if (w.answer)
      out.push(
        `A tight beam aimed at Earth, its source ${sky(w.answer)}, arriving at Year ${yearText(w.answer.at)}, ${one(2 * w.answer.ly)} Years after our first knock on the watcher at Year ${yearText(w.answer.knock)}. Built to be read. A picture of Earth from far above at the hour we knocked. A voice, speaking one short message in eleven of our languages in turn, learned from our broadcasts: look, listen and speak as you like, and build at no other star. Then pictures of Earth, one for every thousand years, as far back as our records go and further: ice sheets coming and going, the Sahara green and then dry, and lately fields and cities. ` +
          `Its timing puts whoever sent the watcher about ${one(w.answer.ly)} light-years away. It gave nothing that makes us faster, and said nothing of what it would do if we built at another star.`,
      );
    // Our Relay Search's word, or the build it opened. 2026-10-30.
    if (w.looked && w.relay)
      out.push(
        `Our Relay Search flew out along that line and found, at Year ${yearText(w.relay.at)}, a dark craft a few metres across, ${w.relay.au.toLocaleString("en-US")} AU out, holding exactly on the line. It fires faint thrusters to stay there as the Sun wobbles. It sent nothing while our craft was near. ` +
          `From there the Sun's lens carries a weak beam a very long way, out the other side, toward ${sky({ ra: (w.looked.ra + 12) % 24, dec: -w.looked.dec })}. Whoever sent the watcher likely lies that way, at a distance we can't tell, and we can't tell who. It saw us come, and went quiet.`,
      );
    else if (w.looked)
      out.push(
        "Its mirror opened a new build, the Relay Search: one sailcraft of our lenses' class, about $500 million, 5 Years to build, flown out along the mirror's line past the Sun's focus, 1,000 AU and beyond, as our lenses fly. It would find a relay if one is there. Whatever is there would see it come.",
      );
    else if (w.by !== "its warning")
      out.push(
        "Finding it opened a new build, the Close Look: a small craft of CAPSTONE's class with a sharp camera, 2 Years to build, then about 4 months' flight to the Moon's L4 or L5 or a Year to a rock beside us. " +
          "From a few kilometers it would see what the body is made of and how it holds. It would also see our craft come.",
      );
    // Its own warning, at our first seed, once we had found it. Playtest 2026-11-01.
    if (w.warned !== undefined)
      out.push(
        `At Year ${yearText(w.warned)}, as our first seed left, the watcher fired a narrow laser at Earth carrying a voice, speaking in eleven of our languages, learned from our broadcasts: look, listen and speak as you like, and build at no other star.${w.answer && w.answer.at <= w.warned ? " The same rule its maker's answer gave." : ""} ` +
          "Nothing yet has happened to our seed. What another seed would draw, it didn't say.",
      );
    // The ladder as Earth sees it: seed probes gone silent, and a strike from beyond our system. Earth sees what
    // happened, never who did it. 2026-10-30.
    if (w.seedsLost?.length)
      out.push(
        `${w.seedsLost.length === 1 ? "One of our seed probes gone silent" : `${w.seedsLost.length} of our seed probes gone silent`}, after the watcher's warning and our next seed:\n` +
          w.seedsLost.map((l) => l.before
            ? `- Bound for ${l.star}: its word of landing never came. It was due by Year ${yearText(l.known)}.`
            : `- At ${l.star}: its word stopped at Year ${yearText(l.at)}, reaching us at Year ${yearText(l.known)}. Its last word showed nothing coming: whatever hit it came cold and fast.`).join("\n"),
      );
    if (w.struck)
      out.push(`At Year ${yearText(w.struck.lands)} something struck Earth from beyond our system with about ${Math.round(w.struck.mt).toLocaleString("en-US")} Mt, moving at most of light’s speed. No rock moves that fast. Nothing saw it come. It came after our seed probes' copies began launching seeds of their own.`);
    if (w.by !== "its warning")
      out.push(`The Will can knock on it, with a message aimed at "the watcher". It lands within seconds, or minutes if it sits out by the Sun–Earth L4 or L5. What it does with a knock, and whether it passes word home, we can't know.`);
  }
  if (m.sleepers.length)
    out.push(
      `What our craft found resting in other systems:\n` +
        m.sleepers.map((x, i) =>
          `- Warm body ${i + 1}, as Scan names it, ${sky(x)}, ${one(x.d)} ly away: a compact warm body ${lightTime(x.restAU)} from its star, shedding about 10^10 W, word home at Year ${yearText(x.seen)}. ` +
          `Starlight that far out would leave it near ${Math.round(278 / Math.sqrt(x.restAU))} K or colder, yet it is hundreds of K warmer. Something inside it makes heat.`).join("\n"),
    );
  return out.length ? `\n\n${out.join("\n\n")}` : "";
}
