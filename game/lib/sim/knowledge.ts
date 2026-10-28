// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import { giftWords } from "../game/sends.ts";
import { lightTime } from "../light.ts";
import { BANDS, iwa, observe, owa, WIDE } from "./observing.ts";
import { proximaB } from "./proxima.ts";
import type { ColonyMode, DarkMass, EarthView, Find, FeltWorld, Gas, Glow, Heard, Hole, Read, Visit, World } from "./types.ts";
import catalog from "../../data/works.json" with { type: "json" };
import type { Loss } from "./meetings.ts";
import { seedProbes } from "./spread.ts";

/** A sender's voice bank: its knock reads as its hail and its close, and the close may carry its name. */
export type Voices = Record<string, { hail: string[]; close: string[] }>;

/** What Earth has built to listen and look with: the Year each is done, if our order finishes it. */
export interface Kit {
  allSky?: number | null;
  flash?: number | null;
  telescope?: number | null;
  mirror?: number | null;
  halo?: number | null;
  mapper?: number | null;
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
  /** Our craft at black holes a neighbor caught or struck, from its moves kept in the save. 2026-10-26. */
  losses?: Loss[];
  /** The Year our radars went quiet: a neighbor whose ears open only after our last sweep has passed never hears them,
   *  so never answers them. 2026-10-28. */
  quiet?: number | null;
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
    ...(by !== "sails" && sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
  };
}

/** What the Halo Survey has seen by `year`, once it is done at `from`. A Mind computes cold and its computing doubles
 *  every so many Years after it wakes, from Earth's 2040 scale, as calcs/neighbors.py's glow_at has it. ALMA sees a
 *  compact 12 K glow over the floor at 10 pc, growing with distance squared, in light that left d Years ago. The
 *  survey looks at each star once a Year. The dead never wake, as glow_at has it. Settled 2026-10-26. */
const START_W = 1e13, PC_LY = 3.2616;
export function glows(world: World, from: number, year: number): Glow[] {
  const { floor, every } = catalog.halo;
  const out: Glow[] = [];
  for (const p of world.neighbors) {
    if (p.dead) continue;
    const need = floor * (p.d / (10 * PC_LY)) ** 2;
    if (p.elder && p.elder.ceiling < need) continue;                           // an elder asleep sheds almost nothing
    const crosses = p.d + p.waking + p.doubling * Math.log2(need / START_W);   // the Year its light here crosses the floor
    const seen = from + every * Math.ceil(Math.max(0, crosses - from) / every - 1e-9);
    if (seen > year) continue;
    const at = world.stars[p.star];
    out.push({
      star: at?.shown ?? p.star, d: p.d, seen, watts: Math.min(START_W * 2 ** Math.min((year - p.d - p.waking) / p.doubling, 1000), p.elder?.ceiling ?? Infinity),
      ...(p.elder && year - seen >= 5 ? { steady: true } : {}),
      ...(at?.ra !== undefined ? { ra: at.ra, dec: at.dec } : {}),
    });
  }
  return out.sort((a, b) => a.seen - b.seen);
}

/** What a lens pictures of a felt world, from its truth: everything wider than its pixel, 25 km at 30 pc. A home's
 *  cities and cleared land show. A world whose makers are gone looks merely alive, since its forests have taken its
 *  fields back. HOLOS_GAME_CONCEPT.md's "A picture shows everything larger than a pixel", 2026-10-14. */
const PICTURED: Record<string, Visit["sight"]> = {
  "bare rock": "bare", "airy and lifeless": "seas", "hiding microbes": "seas", "showing oxygen": "seas",
  "with animals and forests": "green", "where life died": "seas", frozen: "ice",
};
function pictured(f: Find): Visit["sight"] {
  if (f.truth.elder) return "green";                // an elder's people live lightly, its works far out in the cold
  if (f.truth.kind === "home") return "cities";
  if (f.truth.kind === "dead") return "green";
  return PICTURED[f.truth.rung ?? ""] ?? "seas";
}
const LENS_KM_30PC = catalog.lens.km30pc;
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
  voices: Voices = {},
  { allSky = null, flash = null, telescope = null, mirror = null, halo = null, mapper = null, lenses = [], sentinels = [], seeds = [], colony = null, sails = null, probe = null, losses = [], quiet = null }: Kit = {},
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
  // Signals that have arrived and were caught: by Year 0's sky watch, or, once each is done, by the All-Sky Watch, which
  // hears what reaches us from anywhere at any hour, or the Deep Flash Watch, which alone sees knocks sent as laser
  // flashes. The world records which would catch each. 2026-10-20.
  const heard: Heard[] = [];
  for (const p of world.neighbors) {
    // Our radars cut before they reached it: what it would have sent on hearing them is never sent.
    const deaf = quiet !== null && (p.heardSince ?? Infinity) > quiet + p.d;
    for (const i of p.inbound) {
      if (deaf && i.what.includes("radars")) continue;
      const wide = allSky !== null && i.year >= allSky && !!i.allsky;
      const seen = flash !== null && i.year >= flash && !!i.flash;
      if (i.year > year || !(i.kit0 || wide || seen)) continue;
      const bank = voices[p.name];
      heard.push({
        star: shown(p.star), d: p.d, sent: i.sent, arrived: i.year, move: i.move,
        text: bank && i.move === "knock" ? `${bank.hail[0]} ${bank.close[0]}` : null,
        ...(i.kit0 ? {} : { by: seen ? "Deep Flash Watch" : "All-Sky Watch" }),
        ...(i.laser ? { laser: true } : {}),
      });
    }
  }
  heard.sort((a, b) => a.arrived - b.arrived);
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
    visits.push({ star: l.star, world: `${l.star}’s world`, by: "lens", passed: l.looks, home: l.home, sight: pictured(f), km: (LENS_KM_30PC * f.d) / (30 * 3.2616) });
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
      const lost = losses.find((l) => l.craft === `sentinel:${truth.id}`);
      const claims = truth.claims ?? [];
      // Who got there first: a neighbor's sentinel or colony braked there by the time ours arrives, seen up close.
      const others = claims.filter((c) => c.arrives <= passed).map((c) => ({ kind: c.kind, ...(c.mode ? { mode: c.mode } : {}) }));
      const at = { star: x.star, world: x.star, by: "sentinel" as const, sight: "dark" as const };
      if (home <= year) visits.push({ ...at, passed, home, spin: truth.spin, clock: iscoClock(truth.spin), ...(others.length ? { others } : {}) });
      // It keeps watching, and sends word of each who brakes in after it, until it is lost. 2026-10-26.
      for (const c of claims)
        if (c.arrives > passed && c.arrives < (lost?.at ?? Infinity) && c.arrives + dark.d <= year)
          visits.push({ ...at, passed: c.arrives, home: c.arrives + dark.d, came: comer(world, c.who), others: [{ kind: c.kind }] });
      if (lost && lost.at + dark.d <= year) visits.push({ ...at, passed: lost.at, home: lost.at + dark.d, lost: lost.how });
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
  return {
    year, felt, heard, visits,
    ...(wide.has(PROXIMA.star) ? { proxima: wide.get(PROXIMA.star) } : {}),
    ...(halo !== null && year >= halo ? { glows: glows(world, halo, year) } : {}),
    ...(colony ? { colony: colonyAt(world, holes, colony, year, losses) } : {}),
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
function colonyAt(world: World, holes: (DarkMass & { id: string })[], c: { star: string; mode: ColonyMode; leaves: number }, year: number, losses: Loss[] = []) {
  const { speed, burn, brake, stands } = catalog.seedShip;
  const h = holes.find((x) => x.name === c.star);
  if (!h) return colonyAtStar(world, c, year, losses);
  const lands = c.leaves + h.d / speed + burn + brake, alone = lands + stands;
  const heard = year - h.d;                                       // what its word home shows of it now
  const truth = world.holes!.find((x) => x.id === h.id)!;
  const claims = truth.claims ?? [];
  const others = heard >= lands ? claims.filter((x) => x.arrives <= lands).map((x) => ({ kind: x.kind, ...(x.mode ? { mode: x.mode } : {}) })) : [];
  // Who braked in after it, and its end, a neighbor's catch or strike, as far as its word has reached us. 2026-10-26.
  const loss = losses.find((l) => l.craft === `colony:${h.id}`);
  const lost = loss && heard >= loss.at ? { at: loss.at, how: loss.how } : null;
  const until = Math.min(heard, loss?.at ?? Infinity);
  const came = claims.filter((x) => x.arrives > lands && x.arrives <= until).map((x) => ({ kind: x.kind, at: x.arrives, from: comer(world, x.who) }));
  const watts = c.mode === "furnace" && until >= alone ? 1e13 * 2 ** ((until - alone) / 10) : null;
  // It measures its hole's spin once it lands, as a sentinel does, and so the clock on its innermost orbit.
  const spin = heard >= lands ? { spin: truth.spin, clock: iscoClock(truth.spin) } : {};
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d: h.d, ...spin, ...(others.length ? { others } : {}), ...(came.length ? { came } : {}), ...(lost ? { lost } : {}), ...(watts ? { watts } : {}) };
}

/** Our Mind settled at a star, on its light and its rock, as far as its word has reached us by `year`: on its way,
 *  landed, or standing alone as a Mind. Who was there first: a people at home, or their ruins, or a neighbor's colony
 *  landed before it. Who came after, its end, and its works growing as a furnace's do. No slow clock: a star has no
 *  innermost orbit to live on. 2026-10-27. */
function colonyAtStar(world: World, c: { star: string; mode: ColonyMode; leaves: number }, year: number, losses: Loss[] = []) {
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
  const loss = losses.find((l) => l.craft === `colony:${id}`);
  const lost = loss && heard >= loss.at ? { at: loss.at, how: loss.how } : null;
  const until = Math.min(heard, loss?.at ?? Infinity);
  const came = theirs.filter((x) => x.lands > lands && x.lands <= until).map((x) => ({ kind: "colony" as const, at: x.lands, from: comer(world, x.root) }));
  const watts = until >= alone ? 1e13 * 2 ** ((until - alone) / 10) : null;
  return { star: c.star, mode: c.mode, leaves: c.leaves, lands, stands: alone, d, atStar: true, ...(others.length ? { others } : {}), ...(came.length ? { came } : {}), ...(lost ? { lost } : {}), ...(watts ? { watts } : {}) };
}

/** The star a craft braking in at a hole came from: its flame points back along its track. Its star, never who. */
function comer(world: World, who: string) {
  const p = world.neighbors.find((n) => n.name === who);
  return p ? (world.stars[p.star]?.shown ?? p.star) : "a star we can't name";
}

/** What the Will knows at Year `year`: Earth's news a light-time old once it lives at our Mind at a hole or a star,
 *  and, at first hand, our Mind there and any craft of ours at the same place. 2026-10-26, a star since 2026-10-27. */
export function willKnows(world: World, year: number, voices: Voices, kit: Kit, will?: { hole: string; d: number; at: number } | null): EarthView {
  if (!will || year < will.at) return earthKnows(world, year, voices, kit);
  const view = earthKnows(world, year - will.d, voices, kit);
  // What Earth would know a light-time from now is what is here now.
  const here = earthKnows(world, year + will.d, voices, kit);
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
          ? `- From our Mind ${h.star === "Earth" ? "on Earth" : `at ${h.star}`}, ${one(h.d)} ly, arrived at Year ${one(h.arrived)}: it chose to ${h.ours.chose}${h.ours.on ? `, on news from ${h.ours.on}` : ""}. It decides for itself by our charter, since our word takes ${one(h.d)} Years to reach it.${h.text ? ` It sent: "${h.text}"` : ""}` :
        `- From ${h.star}, ${one(h.d)} ly: ${/^[aeiou]/.test(h.move) ? "an" : "a"} ${h.move}${h.laser ? " sent as laser flashes" : ""} ` +
        `that arrived at Year ${one(h.arrived)}, sent in ${Math.round(2040 + h.sent)}.` +
        // Our radars' first sweeps left in 1950, so they reach a star d light years out in 1950 + d. Added 2026-10-23,
        // after the Mind said a call was sent before we could be heard, twenty years after our noise had reached it.
        (h.about
          ? ` Whoever watches there sent it to ${h.about.replace(/^Our/, "our")}, which passed it home.`
          : ` Our radars first reached it about ${Math.round(1950 + h.d)}, ${2040 + h.sent >= 1950 + h.d ? "before" : "after"} it was sent.`) +
        (h.laser ? ` Only our ${h.by} sees flashes. No radio watch hears them.` : h.by ? ` Our ${h.by} caught it. Year 0's sky watch would have missed it.` : "") +
        // Only a knock's words are read at once, and nothing in the game reads the rest. Added 2026-10-23, after the
        // Mind offered to go through an answer's words, and then, told they were unread, to read them.
        (h.overheard ? " It was sent every way at once, on news from another world, not to us. We overheard it." : "") +
        (h.warning ? " It was sent to us as a warning about another world they know of. Which one, only its words can say." : "") +
        (h.answers !== undefined ? ` It answers our message, which said: "${h.answers}" We caught it listening at every star we send to.` : "") +
        (h.gift ? ` It is a gift of their knowledge, all of it here. From Year ${one(h.arrived)}: ${giftWords(h.gift)}` : "") +
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
      (v.by === "lens"
        ? `- ${v.world}, ${one(view.felt.find((f) => f.star === v.star)?.d ?? 0)} ly, pictured by our lens at the Sun’s focus from Year ${one(v.passed)}, about ${Math.round(v.km ?? 0)} km a pixel, picture home at Year ${one(v.home)}: ${SIGHT[v.sight]}. Nothing narrower than a pixel shows.`
        : v.by === "seed" && v.sent
          ? `- ${v.world}: our seed probe there sent a copy of itself toward ${v.sent} at Year ${one(v.passed)}, word home at Year ${one(v.home)}.`
        : v.by === "seed"
          ? `- ${v.world}, ${one(v.at![2])} ly, reached by our seed probe at Year ${one(v.passed)}, built ${v.from ? `by our probe at ${v.from}` : "at home"}, its first word home at Year ${one(v.home)}: ${SIGHT[v.sight]}. ` +
            `It braked on its sail, unseen, and stays, mining rock to copy itself: a generation ${v.gen} of the ${GENERATIONS} we allow, the last making no copies.` +
            (v.lives ? " It sees them up close: their towns, their craft, their radio. It came in quiet, so they may not know it is there." : v.ruins ? " Among the forests it sees ruins: cities long empty. Whoever lived there is gone." : v.elder ? ELDER[v.elder] : "") +
            (v.others?.length ? " Someone else has works here, not ours: a colony already landed. Whose, it can't tell." : "")
        : v.by === "sentinel" && v.lost
          ? `- ${v.world}: our sentinel there went silent at Year ${one(v.passed)}, word of it home at Year ${one(v.home)}. ${v.lost === "catch" ? "Its last pictures show a craft not ours closing on it." : "Its last word shows nothing coming."}`
        : v.by === "sentinel" && v.came
          ? `- ${v.world}: at Year ${one(v.passed)} our sentinel there saw ${v.others?.[0]?.kind === "colony" ? "a ship not ours, tens of thousands of tonnes, brake to a stop and stay" : "a craft not ours brake to a stop and stay, watching"}. Word home at Year ${one(v.home)}. Its flame, as it slowed, pointed back along its track to ${v.came}. Whoever it is has seen ours.`
        : v.by === "sentinel"
          ? `- ${v.world}, reached by our sentinel at Year ${one(v.passed)}, where it stays to watch, its first word home at Year ${one(v.home)}: ${SIGHT[v.sight]}.` +
            (v.clock ? ` It spins at ${v.spin!.toFixed(2)} of the most a hole can. A clock on its innermost stable orbit would run ${(1 / v.clock).toFixed(1)} times slower than ours.` : "") +
            (v.sight === "dark" ? (v.others?.length ? ` We are not the first. ${others(v.others)} Whose, it can't tell.` : " No one else is there that it can see.") : "") +
            (v.lives ? " It sees them up close: their towns, their craft, their radio. They may have seen its flame." : v.ruins ? " Among the forests it sees ruins: cities long empty. Whoever lived there is gone." : v.elder ? ELDER[v.elder] : "")
          : `- ${v.world}, passed by our ${v.by} at Year ${one(v.passed)}, word home at Year ${one(v.home)}: ${SIGHT[v.sight]}.`) +
      (v.air && !v.sent ? ` The ${v.by === "seed" ? "probe" : v.by} read its air: ${v.air.water ? "water" : "no water"}, ${v.air.oxygen ? "oxygen" : "no oxygen"}.` : ""),
  );
  // What the Halo Survey has seen. Grey and line-free, its color fits no dust: cold computing would glow so, and
  // nothing natural we know of does. Said as seen, not as a Mind, since a glow carries no word. 2026-10-26.
  const glow = !view.glows
    ? ""
    : `\n\nCold glows our Halo Survey has seen, looking at each star within 50 ly once a Year. It sees a compact glow near 12 K ` +
      `over about 3×10¹⁸ W at 10 pc, and four times that at twice the distance. A glow hundreds of AU wide would slip past it:\n` +
      (view.glows.length
        ? view.glows.map((g) =>
            `- At ${g.star}, ${one(g.d)} ly: a grey, line-free glow, first seen at Year ${one(g.seen)}, now about ${g.watts.toExponential(0).replace("e+", "×10^")} W ` +
            `in light that left ${one(g.d)} Years ago. Its color fits no dust. Cold computing far from a star would glow so.` +
            (g.steady ? " It has held steady since we first saw it: not growing, as nothing young is." : "")).join("\n")
        : "- None. Each star's glow it has seen has dust's color, or it sees none.");
  // Black holes found. Each is dark: we know it by the stars it shifted. 2026-10-26.
  const dark = (view.holes ?? []).map(
    (h) =>
      `- ${h.name}, ${one(h.d)} ly: about ${h.mass} times the Sun's mass, found ${h.found < 0 ? `in ${2040 + h.found} by Gaia` : `at Year ${one(h.found)} by our Star Mapper`}, by how it shifted a star behind it. It gives off no light we can see. Its spin is unknown.`,
  );
  const c = view.colony;
  const colonyText = !c
    ? ""
    : `\n\nOur Mind sent to ${c.star} on the Seed Ship, to ${c.mode === "furnace" ? "feed the hole for power" : c.mode === "refuge" ? "live hidden in its shadow" : "settle there on the star's light and rock"}: ` +
      (c.lands === undefined
        ? `it leaves at Year ${one(c.leaves)}.`
        : view.year < c.lands + c.d!
          ? `it left at Year ${one(c.leaves)}, lands about Year ${one(c.lands)}, and its word of landing reaches us about Year ${one(c.lands + c.d!)}.`
          : `it landed at Year ${one(c.lands)} and stands alone as a Mind from Year ${one(c.stands!)}, ${one(c.d!)} light-years and Years away from us.` +
            (c.others?.length ? ` It was not the first there. ${c.atStar ? settledBy(c.others) : others(c.others)}` : " No one else was there.") +
            (c.clock ? ` The hole spins at ${c.spin!.toFixed(2)} of the most a hole can, so a clock on its innermost stable orbit runs ${(1 / c.clock).toFixed(1)} times slower than ours. ${c.mode === "refuge" ? "Our Mind there could spread over chips 10 cm wide on that orbit, small enough that its tides can't break them, and run that slow, once the Will lives there." : "Its furnace's disk fills that orbit, so our Mind can't live there."}` : "") +
            (c.came?.length ? ` Since then: ${c.came.map((x) => `at Year ${one(x.at)}, ${x.kind === "colony" ? "a ship not ours braked in and stayed" : "a craft not ours braked in and stays, watching"}, its track back to ${x.from}`).join("; ")}. Whoever came has seen ours.` : "") +
            (c.lost ? ` Its word stopped at Year ${one(c.lost.at)}. It is gone. ${c.lost.how === "strike" ? "Its last word showed nothing coming: whatever hit it came cold and fast." : "Its last word showed a craft not ours closing on it."}` : "") +
            (c.watts && !c.lost && c.mode === "settle" ? ` Its works on the star's light run at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it.` : "") +
            (c.watts && !c.lost && c.mode === "furnace" ? ` Its furnace runs at about ${c.watts.toExponential(0).replace("e+", "×10^")} W, as its word shows it, under what any sky survey sees until about 10^19 W.` : c.mode === "refuge" ? " It keeps small and dark, and no one looking from outside would know it is there." : ""));
  const holesText = dark.length ? `\n\nBlack holes we have found. A star mapper finds more as they pass in front of stars:\n${dark.join("\n")}` : "";
  return `Worlds Earth has felt by their tug on their stars, as of Year ${one(view.year)}. From here a home and a natural world look the same:
${felt}${nearest}

Signals Earth's watch has caught:
${heard}${visits.length ? `\n\nWhat our craft have seen up close:\n${visits.join("\n")}` : ""}${glow}${holesText}${colonyText}`;
}
