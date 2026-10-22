// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import { observe } from "./observing.ts";
import { proximaB } from "./proxima.ts";
import type { EarthView, Find, FeltWorld, Heard, Visit, World } from "./types.ts";

/** A sender's voice bank: its knock reads as its hail and its close, and the close may carry its name. */
export type Voices = Record<string, { hail: string[]; close: string[] }>;

/** What Earth has built to listen and look with: the Year each is done, if our order finishes it. */
export interface Kit {
  allSky?: number | null;
  flash?: number | null;
  telescope?: number | null;
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

/** What the Infrared Telescope has read by Year `year`, once done at Year `from`. It takes the finds nearest first, each
 *  for as long as its longest readable band, and each band lands when its days are up. Days are calcs/observing.py's,
 *  through observing.ts. 2026-10-20. */
function readings(world: World, from: number, year: number) {
  const out = new Map<string, NonNullable<FeltWorld["read"]>>();
  let t = from;
  for (const f of [...world.finds].sort((a, b) => a.d - b.d)) {
    if (t > year) break;
    const r = observe(f.d / 3.2616, width(world, f), f.a, world.stars[f.star]?.lum ?? 1);
    const air = f.truth.kind === "natural" ? AIR[f.truth.rung ?? ""] ?? "none" : "oxygen";
    const read: NonNullable<FeltWorld["read"]> = { split: r.seenH !== null, at: t };
    out.set(f.star, read);
    if (r.seenH === null) continue;
    const bands = { water: air !== "none", oxygen: air === "oxygen", ozone: air === "oxygen" };
    let longest = r.seenH / 24;
    for (const band of ["water", "oxygen", "ozone"] as const) {
      const days = r[band];
      if (days === null || days === Infinity) continue;
      read.readable = true;
      if (t + days / 365.25 <= year) {
        read[band] = bands[band];
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
  { allSky = null, flash = null, telescope = null, sails = null, probe = null }: Kit = {},
): EarthView {
  const shown = (id: string) => world.stars[id]?.shown ?? id;
  // Earth's finds at Year 0: every world whose tug shows by 2040. Measured, not understood. Its star is in the catalogs.
  // Once the Infrared Telescope is done, what it has read of each.
  const read = telescope !== null && year >= telescope ? readings(world, telescope, year) : new Map();
  const felt: FeltWorld[] = world.finds.map((f) => ({
    star: shown(f.star), d: f.d, minMass: f.msini, periodDays: f.periodDays, a: f.a, by: f.by, year: f.year,
    kind: world.stars[f.star]?.kind, hz: world.stars[f.star]?.hz,
    ...(read.has(f.star) ? { read: read.get(f.star) } : {}),
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
  return { year, felt, heard, visits };
}

/** What we know of a felt world's air, in words. */
function air(read: FeltWorld["read"]) {
  if (!read) return "It doesn't cross its star, so its size and air are unread.";
  if (!read.split) return "Our Infrared Telescope can't split it from its star, so its air stays unread.";
  const bands = (["water", "oxygen", "ozone"] as const).filter((b) => read[b] !== undefined);
  if (!read.readable) return "Our Infrared Telescope sees it beside its star, but its air is too faint or too close in to read.";
  if (!bands.length) return "Our Infrared Telescope sees it beside its star, and is reading its air now.";
  return `Our Infrared Telescope has read its air: ${bands.map((b) => (read[b] ? b : `no ${b}`)).join(", ")}.`;
}

/** The view in words, for the Mind's prompt. It takes the view and nothing else, so the truth can't reach it. */
export function describe(view: EarthView): string {
  const one = (x: number) => x.toFixed(1);
  const felt = view.felt.length
    ? view.felt.map((f) =>
        `- ${f.star}, ${one(f.d)} ly: at least ${one(f.minMass)} Earth masses, a year of ${Math.round(f.periodDays)} days, ` +
        `${f.a.toFixed(2)} AU out. Felt by ${f.by} in ${2040 + f.year}. ${air(f.read)}`).join("\n")
    : "- None. The planet hunters felt no new world by 2040.";
  const heard = view.heard.length
    ? view.heard.map((h) =>
        `- From ${h.star}, ${one(h.d)} ly: ${/^[aeiou]/.test(h.move) ? "an" : "a"} ${h.move}${h.laser ? " sent as laser flashes" : ""} ` +
        `that arrived at Year ${one(h.arrived)}, sent in ${Math.round(2040 + h.sent)}.` +
        (h.laser ? ` Only our ${h.by} sees flashes. No radio watch hears them.` : h.by ? ` Our ${h.by} caught it. Year 0's sky watch would have missed it.` : "") +
        (h.text ? ` It reads: "${h.text}"` : "")).join("\n")
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
${felt}

Signals Earth's watch has caught:
${heard}${visits.length ? `\n\nWhat our craft have seen up close:\n${visits.join("\n")}` : ""}`;
}
