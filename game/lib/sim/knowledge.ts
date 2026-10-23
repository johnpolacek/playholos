// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import { BANDS, iwa, observe, owa, WIDE } from "./observing.ts";
import { proximaB } from "./proxima.ts";
import type { EarthView, Find, FeltWorld, Gas, Heard, Read, Visit, World } from "./types.ts";

/** A sender's voice bank: its knock reads as its hail and its close, and the close may carry its name. */
export type Voices = Record<string, { hail: string[]; close: string[] }>;

/** What Earth has built to listen and look with: the Year each is done, if our order finishes it. */
export interface Kit {
  allSky?: number | null;
  flash?: number | null;
  telescope?: number | null;
  mirror?: number | null;
  /** Each road to Proxima b, if our order flies it: the Year it passes, and the Year its word reaches us. */
  sails?: { passed: number; home: number } | null;
  probe?: { passed: number; home: number } | null;
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
    ...(by === "probe" && sight !== "haze" ? { air: { water: air !== "none", oxygen: air === "oxygen" } } : {}),
  };
}

export function earthKnows(
  world: World,
  year: number,
  voices: Voices = {},
  { allSky = null, flash = null, telescope = null, mirror = null, sails = null, probe = null }: Kit = {},
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
    for (const i of p.inbound) {
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
    .map(([by, road]) => visit(world, by, road!))
    .sort((a, b) => a.home - b.home);
  return { year, felt, heard, visits, ...(wide.has(PROXIMA.star) ? { proxima: wide.get(PROXIMA.star) } : {}) };
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

/** The view in words, for the Mind's prompt. It takes the view and nothing else, so the truth can't reach it. */
export function describe(view: EarthView): string {
  const one = (x: number) => x.toFixed(1);
  const felt = view.felt.length
    ? view.felt.map((f) =>
        `- ${f.star}, ${one(f.d)} ly: at least ${one(f.minMass)} Earth masses, a year of ${Math.round(f.periodDays)} days, ` +
        `${f.a.toFixed(2)} AU out. Felt by ${f.by} in ${2040 + f.year}. ${air(f)}`).join("\n")
    : "- None. The planet hunters felt no new world by 2040.";
  const nearest = view.proxima ? `\n- Proxima b, 4.2 ly, the nearest world: ${told(view.proxima, "15 m Mirror")}` : "";
  const heard = view.heard.length
    ? view.heard.map((h) =>
        `- From ${h.star}, ${one(h.d)} ly: ${/^[aeiou]/.test(h.move) ? "an" : "a"} ${h.move}${h.laser ? " sent as laser flashes" : ""} ` +
        `that arrived at Year ${one(h.arrived)}, sent in ${Math.round(2040 + h.sent)}.` +
        // Our radars' first sweeps left in 1950, so they reach a star d light years out in 1950 + d. Added 2026-10-23,
        // after the Mind said a call was sent before we could be heard, twenty years after our noise had reached it.
        ` Our radars first reached it about ${Math.round(1950 + h.d)}, ${2040 + h.sent >= 1950 + h.d ? "before" : "after"} it was sent.` +
        (h.laser ? ` Only our ${h.by} sees flashes. No radio watch hears them.` : h.by ? ` Our ${h.by} caught it. Year 0's sky watch would have missed it.` : "") +
        // Only a knock's words are read at once, and nothing in the game reads the rest. Added 2026-10-23, after the
        // Mind offered to go through an answer's words, and then, told they were unread, to read them.
        (h.text ? ` It reads: "${h.text}"` : " Its words aren't in what Earth holds, and no build reads them.")).join("\n")
    : "- Nothing. Earth has heard no one.";
  const SIGHT = {
    haze: "haze to the horizon and no ground: a small gas world",
    bare: "bare rock under a black sky, no cloud, no sea: its air is gone",
    seas: "cloud, and seas under it. Pictures can't show whether anything lives there",
    green: "cloud, seas, and its land dark green in patches the size of forests",
  };
  const visits = (view.visits ?? []).map(
    (v) =>
      `- ${v.world}, passed by our ${v.by} at Year ${one(v.passed)}, word home at Year ${one(v.home)}: ${SIGHT[v.sight]}.` +
      (v.air ? ` The probe read its air: ${v.air.water ? "water" : "no water"}, ${v.air.oxygen ? "oxygen" : "no oxygen"}.` : ""),
  );
  return `Worlds Earth has felt by their tug on their stars, as of Year ${one(view.year)}. From here a home and a natural world look the same:
${felt}${nearest}

Signals Earth's watch has caught:
${heard}${visits.length ? `\n\nWhat our craft have seen up close:\n${visits.join("\n")}` : ""}`;
}
