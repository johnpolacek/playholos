import { lyOf, tenths, YEAR_0, yearText } from "@/lib/game/clock";
import { glowNames, properGlows } from "@/lib/game/glow-names";
import { KNOCKS } from "@/lib/game/knocks";
import { watcherAway } from "@/lib/game/sends";
import { lightTime } from "@/lib/light";
import { BANDS, iwa, owa, WIDE } from "@/lib/sim/observing";
import type { MindsSeen, WatcherSeen } from "@/lib/sim/minds";
import type { ProximaSeen } from "@/lib/sim/proxima";
import { harm, type rockAt } from "./rocks";
import type { DarkMass, FeltWorld, FieldHeard, FieldWorld, Gas, Read, Visit } from "@/lib/sim/types";
import { CATALOG } from "@/lib/sim/works";
import { sentinelCruise, sentinelYears } from "@/lib/sim/speeds";
import { type System, SYSTEMS } from "./systems";

/** How many generations of seed probes we allow, the last making no copies. */
const GENERATIONS = CATALOG.seedProbe.generations;

// Earth's real leads in 2040, each with its own page: the world next door, whose air we can't read from here, a world
// on a stretched orbit, every world the planet hunters felt by 2040, nearest first, and our messages, waiting on replies. Each page is a
// report as HOLOS_GAME_CONCEPT.md has it: what we measured, what it could be, each with the Mind's word, and what would
// tell us. Real numbers from HOLOS_RESEARCH.md, "Earth's leads, as of October 2026".

/** The Mind's seven words for how likely a thing is, after the scale US intelligence analysts use. Scan shows each as
 *  a range of percents, in lib/game/chance.ts: numbers were allowed 2026-11-01. */
export const ODDS = [
  "almost no chance",
  "very unlikely",
  "unlikely",
  "roughly even",
  "likely",
  "very likely",
  "almost certain",
] as const;
export type Odds = (typeof ODDS)[number];

/** One thing a lead could be, and the Mind's word for it. */
export interface Could {
  what: string;
  why: string;
  odds: Odds;
}

/**
 * What an observation found, landing on its lead's page in the Year it is done: what it saw, the Mind's word on it,
 * each explanation's new word, in the lead's order, and what would tell us next.
 */
export interface Reading {
  id: string;
  /** The observation in the plan that brings it. */
  needs: string;
  at: number;
  by: string;
  title: string;
  line: string;
  mind: string;
  now: Odds[];
  tells: string[];
  /** What one of our telescopes has read of its air, drawn as its light. */
  air?: Read;
  /** What a flyby's pictures showed, drawn as the world. */
  sight?: Visit["sight"];
  /** What our Close Look saw of the watcher, drawn: its mirror held on one point of the sky. 2026-11-07. */
  close?: { ra: number; dec: number };
  /** The Mind's word, now, that something lives there, where this reading says. 2026-10-29. */
  life?: Odds;
  /** What our Far-Side Array heard of its magnetic field: true for one heard, false for none where one like Earth's
   *  would show. A small sign for or against air, lib/game/chance.ts. 2026-11-11. */
  field?: boolean;
  /** This reading settles it: nothing lives or thinks here, as a warm glow read as dust. A playtest couldn't tell
   *  a settled glow from an open one, 2026-11-07. */
  ruledOut?: true;
  /** The first words a mind beyond our system speaks to us, drawn in its color. Playtest 2026-11-14. */
  contact?: true;
}

/** What a lead's page draws: a world's orbit against its star's warm zone, or a message's trip. */
export type Art =
  | { kind: "orbit"; a: number; e: number; hz?: [number, number] }
  | { kind: "reply"; windows: Window[] }
  | { kind: "dark"; mass: number; ly: number }
  | { kind: "pair"; mass: number; ly: number; a: number; e: number; days: number }
  /** `panels`: our Glow Imager has shown what glows, from home. 2026-11-11. */
  | { kind: "glow"; ly: number; steady?: boolean; panels?: boolean }
  /** A warm glow ranged, not measured: its nearest and farthest, light-years. 2026-10-29. `shape`: what our Glow
   *  Imager showed it to be. 2026-11-11. */
  | { kind: "warm"; near: number; far: number; shape?: "ring" | "cloud" }
  | { kind: "seed"; sight: Visit["sight"] }
  /** Something here at home, drawn where it sits: at the Moon's L5, on a rock sharing our orbit, or a rock coming in.
   *  2026-10-30. */
  | { kind: "near"; where: "moon" | "co-orbital" | "warning" | "rock"; struck?: boolean; L?: "L4" | "L5"; rock?: string; on?: "sun" | "moon" | "rock" }
  /** A star exploded: its brightness as we saw it. 2026-10-30. */
  | { kind: "nova"; ly: number };

/** A black hole's lead: one drawn alone, or with a star going round it, as Gaia BH1. 2026-10-28. */
export const isHole = (art: Art) => art.kind === "dark" || art.kind === "pair";

export interface Lead {
  /** Its page's address. */
  slug: string;
  /** Its star's light in Suns, where we know it: it sets how far an old mind's cold works would reach there, and so
   *  whether one would see a beam of ours pass. 2026-11-12. */
  lum?: number;
  /** How fast its star crosses our sky, in km/s, where we hold its motion: how wide a beam aimed ahead passes it. */
  kms?: number;
  /** Where it is, for a lead the sky file lacks: right ascension in hours, declination, light-years. */
  at?: [number, number, number];
  star: string;
  what: string;
  line: string;
  ly: number;
  /** Its distance as a range, where Earth has no better: nearest and farthest, light-years. Shown in place of ly. */
  range?: [number, number];
  /** What asking the Mind about it asks. */
  ask: string;
  /** The Mind's word on it when we review our scans, in a breath. */
  brief: string;
  reply?: boolean;
  /** What we measured. A measurement stays a number. */
  facts: [label: string, value: string][];
  could: Could[];
  /** What would tell us. */
  tells: string[];
  art: Art;
  /** Its star and what is known to go round it, drawn on its page. */
  system?: System;
  /** The Mind's word that something lives there, before any reading. None where life isn't the question. 2026-10-29. */
  life?: Odds;
  /** Its line once a Year has passed, when the first stops being true. 2026-10-30. */
  later?: { year: number; line: string };
  /** What we can't explain of it yet, in a line, and the builds that would tell us, each one we can queue now, with
   *  what it does for this lead. The review shows them, so each mystery leads to its builds. 2026-11-08. */
  unknown?: string;
  builds?: { name: string; how: string }[];
}

/** A lead's line at a Year: Luyten's Star promised a reply "from Year 2.3" at Year 9,104 until 2026-10-30. */
export const lineAt = (l: Lead, year: number | null) => (l.later && year !== null && year >= l.later.year ? l.later.line : l.line);

/** A star's name as a screen shows it. A star known only by its Gaia number showed all 19 digits, "Gaia
 *  1172618435080418176", and ran long on the map. Shown by its last seven, as papers do. Its id keeps them all. 2026-10-30. */
export const starName = (star: string) => properGlows(star).replace(/^Gaia (\d{10,})$/, (_, n: string) => `Gaia …${n.slice(-7)}`);

export { properGlows };

/** The scene names Luyten's Star as the catalog does. */
export const skyId = (star: string) => star.replace("’", "'");

const slugOf = (star: string) =>
  star
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-");

/** Each star we messaged before Year 0, nearest first in time: the soonest a reply could reach us, in Years from Year
 *  0, below zero once passed. 2026-11-01. */
export interface Window {
  star: string;
  ly: number;
  at: number;
}
export const WINDOWS: Window[] = [...new Set(KNOCKS.map((k) => k[2]))]
  .map((star) => {
    const ks = KNOCKS.filter((k) => k[2] === star);
    const soonest = Math.min(...ks.map(([, sent, , ly]) => sent + 2 * ly));
    return { star: star.replace("'", "’"), ly: ks[0][3], at: Math.round((soonest - YEAR_0) * 10) / 10 };
  })
  .sort((a, b) => a.at - b.at);
const AHEAD = WINDOWS.filter((w) => w.at > 0);
const LUYTEN = WINDOWS.find((w) => w.star === "Luyten’s Star")!;
const PASSED = WINDOWS.filter((w) => w.at <= 0);
const STARS: Record<string, string> = {
  M: "A red dwarf",
  K: "An orange dwarf",
  G: "A Sun-like star",
  F: "A star hotter than the Sun",
};

const GASES: Gas[] = ["water", "oxygen", "ozone"];
const and = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

/** What a mirror could make of a world from where it sits in our sky, from its distance from its star and from us:
 *  whether it splits it, and the gases whose bands it could read there. observing.ts's dark patch. */
function sees(aAU: number, ly: number, mirror?: number) {
  const sep = (aAU / (ly / 3.2616)) * 1000;
  const inside = (um: number) => iwa(um, mirror) < sep && sep < owa(um, mirror);
  return { split: iwa(BANDS.green, mirror) < sep && sep < owa(BANDS.water, mirror), gases: GASES.filter((g) => inside(BANDS[g])) };
}

/** Where a world sits against its star's warm zone. */
function warmth(a: number, hz?: [number, number]) {
  if (!hz) return "Unknown";
  return a < hz[0] ? "Too close in: hotter than the warm zone" : a > hz[1] ? "Beyond the warm zone: cold" : "In the warm zone";
}

/** Each hand-written lead with its system, where we have one. */
const withSystems = (leads: Lead[]) => leads.map((l) => (l.system || !SYSTEMS[l.slug] ? l : { ...l, system: SYSTEMS[l.slug] }));

/** Under about 2 Earths, most worlds are rock. Above it, most keep thick gas (Chen and Kipping 2017). */
const rockOdds = (m: number): Odds => (m < 1.5 ? "likely" : m < 3 ? "roughly even" : "unlikely");
const gasOdds = (m: number): Odds => (m < 1.5 ? "unlikely" : m < 3 ? "roughly even" : "likely");

/** A felt world's page, from what the planet hunters measured. Its words follow its least mass and its reach. */
function feltLead(f: FeltWorld): Lead {
  const one = (x: number) => x.toFixed(1);
  // Under about 2 Earths, most worlds are rock. Above it, most keep thick gas (Chen and Kipping 2017). A tug gives
  // only the least mass, so the true one is likely higher.
  const m = f.minMass;
  const rock = rockOdds(m);
  const gas = gasOdds(m);
  // What each telescope could split and read, from where it sits. The 15 m Mirror's since 2026-10-23.
  const near = sees(f.a, f.d), wide = sees(f.a, f.d, WIDE);
  const more = wide.gases.filter((g) => !near.gases.includes(g));
  const tell =
    near.gases.length === 3
      ? "The Infrared Telescope can split it from its star and read its air: water first, then oxygen."
      : near.split
        ? `The Infrared Telescope can see it beside its star${near.gases.length ? ` and read its ${and(near.gases)}` : ""}, but it sits too close in for ${near.gases.length ? "the rest" : "its air"}.${more.length ? ` The 15 m Mirror could read its ${and(more)}.` : ""}`
        : wide.split
          ? `It sits too close to its star for the Infrared Telescope to split. The 15 m Mirror could${wide.gases.length ? `, and read its ${and(wide.gases)}` : ""}.`
          : "It sits too close to its star for either telescope we can build to split. For now its tug is all we have.";
  const kind = m < 1.5 ? "Small enough that it is likely rock." : m < 3 ? "Rock or gas, we can’t tell yet." : "At that mass, likely a gas world.";
  // Life, before its air is read: none we know of too hot, little on gas or ice, and on warm rock only if its air held,
  // which a red dwarf's flares make less likely. Whether life starts at all, no one knows.
  const life: Odds =
    gas === "likely" ? "very unlikely"
      : f.hz && f.a < f.hz[0] ? "almost no chance"
        : f.hz && f.a > f.hz[1] ? "very unlikely"
          : rock === "likely" && f.kind !== "M" ? "unlikely"
            : "very unlikely";
  return {
    slug: slugOf(f.star),
    lum: f.lum,
    kms: f.kms,
    star: f.star,
    what: "A new world",
    line: `Felt by ${f.by} in ${YEAR_0 + f.year}. At least ${one(m)} Earths.`,
    ly: f.d,
    ask: `What do we know of the new world at ${f.star}?`,
    brief: `${kind} ${tell}`,
    facts: [
      ["Mass", `At least ${one(m)} Earths`],
      ["Its year", `${Math.round(f.periodDays)} days`],
      ["From its star", lightTime(f.a)],
      ["Warmth", warmth(f.a, f.hz)],
      ["Its star", (f.kind && STARS[f.kind]) ?? "A star"],
      ["Felt by", `${f.by}, ${YEAR_0 + f.year}`],
    ],
    could: [
      { what: "A rocky world", why: `Most worlds under about 2 Earths are rock. Its tug gives only its least mass.`, odds: rock },
      { what: "A small gas world", why: "Past about 2 Earths, most worlds we know keep thick hydrogen.", odds: gas },
      {
        what: "Not a world at all",
        why: "A star’s spots and churn can mimic a tug. Years more of measuring can rule them out.",
        odds: "unlikely",
      },
    ],
    tells: [tell],
    unknown: m < 3 ? "Whether it is rock or gas, and what its air holds." : "What its air holds.",
    builds: near.split
      ? [{ name: "Infrared Telescope", how: near.gases.length ? `Reads its ${and(near.gases)}.` : "Sees it beside its star." }]
      : wide.split
        ? [{ name: "Infrared Telescope", how: `Opens the 15 m Mirror, which could split it${wide.gases.length ? ` and read its ${and(wide.gases)}` : ""}.` }]
        : [{ name: "Orbital Yard", how: "Opens the Solar Lens, which could picture its face." }],
    life,
    art: { kind: "orbit", a: f.a, e: 0, hz: f.hz },
    // Its star by its kind, and the one world felt there. The rest of its system is unknown.
    system: {
      temp: { M: 3300, K: 4500, G: 5600, F: 6500 }[f.kind ?? "G"] ?? 5600,
      hz: f.hz,
      worlds: [{ name: "", a: f.a, e: 0, days: f.periodDays, mass: m, status: "confirmed", lead: true }],
      unknown: true,
    },
  };
}

/** A world our Far-Side Array found by the radio of its magnetic field, known no other way: its page. Its radio rises
 *  and falls with its turning, which this close to a red dwarf is its year, so we have its orbit and no mass. Most
 *  worlds this close to red dwarfs are rock. Its life, before anything more: as any red dwarf's warm rock, whose air
 *  the star's flares make less likely, and its field is a small sign the other way. 2026-11-11. */
function fieldLead(f: FieldWorld): Lead {
  const life: Odds = f.hz && f.a < f.hz[0] ? "almost no chance" : "very unlikely";
  // What each telescope could split and read, from where it sits: its radio's beat gives its orbit. Most sit too close
  // in for either. The Hypertelescope pictures any of them. 2026-11-12.
  const near = sees(f.a, f.d), wide = sees(f.a, f.d, WIDE);
  const whole = "Our Hypertelescope or a lens at the Sun’s focus could picture its face, and a craft sent there would see it whole.";
  const tell = near.split
    ? `The Infrared Telescope can split it from its star${near.gases.length ? ` and read its ${and(near.gases)}` : ""}. ${whole}`
    : wide.split
      ? `It sits too close to its star for the Infrared Telescope to split. The 15 m Mirror could${wide.gases.length ? `, and read its ${and(wide.gases)}` : ""}. ${whole}`
      : `It sits too close to its star for either telescope we can build to split. ${whole}`;
  return {
    slug: slugOf(f.star),
    lum: f.lum,
    kms: f.kms,
    star: f.star,
    what: "A new world",
    line: `Heard by our Far-Side Array at Year ${yearText(f.at)}, by the radio of its magnetic field.`,
    ly: f.d,
    ask: `What do we know of the new world at ${f.star}?`,
    brief: `Its star’s wind strikes a magnetic field there and makes radio, as our aurora does, too low for any ear on Earth. So a world is there, and it has a field. Radio gives no mass. ${tell}`,
    facts: [
      ["Its field", "It has one, as Earth does"],
      ["Mass", "Unknown. Radio gives none"],
      ["Its year", `${Math.round(f.periodDays)} days, by its radio’s rise and fall`],
      ["From its star", lightTime(f.a)],
      ["Warmth", warmth(f.a, f.hz)],
      ["Its star", (f.kind && STARS[f.kind]) ?? "A star"],
      ["Heard by", `Our Far-Side Array, Year ${yearText(f.at)}`],
    ],
    could: [
      { what: "A rocky world", why: "Most worlds this close to red dwarfs are small rock. Its radio gives no mass to be sure.", odds: "likely" },
      { what: "A small gas world", why: "A larger world keeps thick hydrogen, and has a field too.", odds: "unlikely" },
      { what: "Not a world at all", why: "A star’s own flares make radio. Radio that keeps time with one orbit, Year after Year, argues for a world.", odds: "very unlikely" },
    ],
    tells: [tell],
    unknown: "Whether it is rock, and whether it kept its air.",
    builds: near.split
      ? [{ name: "Infrared Telescope", how: near.gases.length ? `Reads its ${and(near.gases)}.` : "Sees it beside its star." }]
      : wide.split
        ? [{ name: "Infrared Telescope", how: `Opens the 15 m Mirror, which could split it${wide.gases.length ? ` and read its ${and(wide.gases)}` : ""}.` }]
        : [{ name: "Orbital Yard", how: "Opens the Solar Lens, which could picture its face." }],
    life,
    art: { kind: "orbit", a: f.a, e: 0, hz: f.hz },
    system: {
      temp: 3300,
      hz: f.hz,
      worlds: [{ name: "", a: f.a, e: 0, days: f.periodDays, mass: 1, status: "confirmed", lead: true }],
      unknown: true,
    },
  };
}

/** What our Far-Side Array heard of a world's magnetic field, as a reading on its lead: one heard, or none where one
 *  like Earth's would show by now. Either is a small sign about its air, never a reading of it. 2026-11-11. */
export function fieldReading(star: string, f: FieldHeard, found = false): Reading {
  const at = Math.floor(f.at * 10 + 1e-9) / 10;
  const base = { id: `${slugOf(star)}-field`, needs: "", at, by: "Far-Side Array", now: [] as Odds[], field: f.has };
  if (found)
    return {
      ...base,
      title: "A world, heard by its field",
      line: "Its star’s wind makes radio on a magnetic field there. A world we had not felt.",
      mind: "A field is a small sign for air: a world with one holds its air a little oftener. It is no reading of its air.",
      tells: ["Radio gives no mass and no air. A lens at the Sun’s focus, or a craft, would show what it is."],
    };
  return f.has
    ? {
        ...base,
        title: "It has a magnetic field",
        line: "Our Far-Side Array hears the radio its star’s wind makes on a magnetic field there.",
        mind: "A small sign for air: a world with a field holds its air a little oftener. It is no reading of its air.",
        tells: ["A field turns some of its star’s wind aside. How much that saves its air, no one has settled."],
      }
    : {
        ...base,
        title: "No magnetic field heard",
        line: "Our Far-Side Array has gathered enough to hear a field like Earth’s there, and hears none.",
        mind: "A small sign against air: a world with no field loses its air a little oftener. It is no reading of its air.",
        tells: ["Venus has no field and kept thick air. A missing field settles nothing by itself."],
      };
}

/** What one of our telescopes has made of a felt world, as a reading on its lead, landing on the Year of its latest
 *  band, or of its first look: the Infrared Telescope's, or `wide`, the 15 m Mirror's, since 2026-10-23. Each new band
 *  is a new reading. Seen beside its star, it is a world. A gas past a mirror's reach is said so, never read as
 *  missing. Oxygen never says who lives there: a world whose makers died keeps theirs. 2026-10-22. */
export function airReading(f: Pick<FeltWorld, "star" | "a" | "d" | "read" | "wide"> & { minMass?: number }, wide = false): Reading | null {
  // A world our Far-Side Array found has no mass: its radio is all we had, and it is likely rock. 2026-11-12.
  const all = f.minMass === undefined ? "radio" : "tug";
  const rock = f.minMass === undefined ? "likely" : rockOdds(f.minMass), gas = f.minMass === undefined ? "unlikely" : gasOdds(f.minMass);
  const read = wide ? f.wide : f.read;
  if (!read) return null;
  const slug = slugOf(f.star);
  const at = Math.floor((read.at ?? 0) * 10 + 1e-9) / 10;
  const by = wide ? "15 m Mirror" : "Infrared Telescope";
  const key = `${slug}-${wide ? "wide" : "air"}`;
  const seen: Odds[] = [rock, gas, "almost no chance"];
  // The gases past this mirror's reach there, and what the 15 m Mirror could add to the first telescope's.
  const beyond = read.beyond ?? [];
  const reachable = GASES.filter((g) => !beyond.includes(g));
  const more = wide ? [] : sees(f.a, f.d, WIDE).gases.filter((g) => !reachable.includes(g) || !read.readable);
  const next = more.length ? `The 15 m Mirror, which the Infrared Telescope opens, could read its ${and(more)}.` : "To learn more we would have to go there.";
  const past = beyond.length && reachable.length ? ` It sits too close to its star for this mirror to read its ${and(beyond)}.` : "";
  if (!read.split)
    return {
      id: `${key}-unsplit`,
      needs: "",
      at,
      by,
      air: read,
      title: "Too close to its star to split",
      line: `Our ${by} can’t split it from its star, so its air stays unread.`,
      mind: `Its ${all} is still all we have. A wider mirror could split some worlds this one can’t.`,
      now: [rock, gas, "unlikely"],
      tells: [sees(f.a, f.d, WIDE).split ? "The 15 m Mirror, which the Infrared Telescope opens, would split it." : `It sits too close for any mirror we can build. Its ${all} is all we will have from here.`],
    };
  const bands = GASES.filter((b) => read[b] !== undefined);
  if (!reachable.length || !read.readable)
    return {
      id: `${key}-${reachable.length ? "faint" : "close"}`,
      needs: "",
      at,
      by,
      air: read,
      title: "Seen beside its star",
      line: `Our ${by} sees it beside its star, but ${reachable.length ? "its air is too faint" : "it sits too close in"} to read.`,
      mind: "We see it, so it is a world, not a trick of its star. Its air is beyond this mirror.",
      now: seen,
      tells: [next],
    };
  if (!bands.length)
    return {
      id: `${key}-seen`,
      needs: "",
      at,
      by,
      air: read,
      title: "Seen, and reading its air",
      line: `Our ${by} sees it beside its star, and is reading its air now.${past}`,
      mind: "We see it, so it is a world, not a trick of its star. Its air comes next, a band at a time.",
      now: seen,
      tells: [`${and(reachable)[0].toUpperCase()}${and(reachable).slice(1)} each show as enough of its light adds up, the faintest last.`],
    };
  const shows = bands.filter((b) => read[b]);
  const title = shows.length ? `${and(shows)} in its air` : `No ${and(bands).replace(/ and (?=\w+$)/, " or ")} in its air`;
  const left = reachable.length - bands.length;
  return {
    id: `${key}-${bands.map((b) => `${b[0]}${read[b] ? 1 : 0}`).join("")}`,
    needs: "",
    at,
    by,
    air: read,
    title: title[0].toUpperCase() + title.slice(1),
    line: `Our ${by} read ${bands.map((b) => (read[b] ? b : `no ${b}`)).join(", ")}.${left ? " It reads on." : past}`,
    // Ozone is oxygen's, so either says oxygen. Water past reach is unread, not missing.
    mind:
      (read.oxygen || read.ozone) && read.water
        ? "Oxygen with water is what life made of Earth’s air. Oxygen can also build up without life, in thin dry air, so we weigh it against everything else we read. It can’t tell us who, if anyone, lives there."
        : read.oxygen || read.ozone
          ? "Oxygen, and its water still unread. Oxygen can build up without life, where starlight splits water and its hydrogen escapes, so we weigh it against everything else we read. It can’t tell us who, if anyone, lives there."
          : read.water
            ? "Water, and no oxygen so far. A sea without life reads like this, and so does one whose life makes no oxygen, like Earth’s early microbes."
            : read.water === false
              ? "No water in its air. Life as we know it needs water, so we would look elsewhere first."
              : "No oxygen in its air. Bare rock reads like this, and so does an empty sea, or one whose life makes none.",
    now: seen,
    tells: left ? [`Our ${wide ? "mirror" : "telescope"} reads on, for the bands still to come.`] : [next],
  };
}

/** What our 15 m Mirror has read of Proxima b, as a reading on its lead. Its water's band sits too close to its star
 *  for any mirror we can build, so it reads oxygen and ozone. Oxygen settles that its air held. 2026-10-23. */
export function nearestReading(read: Read): Reading {
  const at = Math.floor((read.at ?? 0) * 10 + 1e-9) / 10;
  const base = { needs: "", at, by: "15 m Mirror", air: read };
  const go = "A flyby would see it whole: the two roads on Reach go there.";
  if (read.oxygen === undefined)
    return {
      ...base,
      id: "proxima-wide-seen",
      title: "Seen beside its star",
      line: "Our 15 m Mirror sees Proxima b beside its star, at the edge of its reach, and is reading its air now.",
      mind: "Seen at last, the world next door. Oxygen and ozone come next. Its water sits too close to its star for any mirror we can build.",
      now: ["likely", "unlikely", "very unlikely"],
      tells: ["Oxygen shows first, then ozone, as enough of its light adds up."],
    };
  return read.oxygen
    ? {
        ...base,
        id: `proxima-wide-o1${read.ozone === undefined ? "" : read.ozone ? "z1" : "z0"}`,
        title: "Oxygen in its air",
        line: `Our 15 m Mirror read oxygen${read.ozone ? " and ozone" : ""} in Proxima b’s air. Its water sits too close to its star for any mirror we can build.`,
        mind: "Oxygen, at our door. Its air held against its star’s flares. It could come from life, or from rock and starlight alone. It can’t tell us who, if anyone, lives there.",
        now: ["almost no chance", "almost certain", "almost no chance"],
        tells: [go],
      }
    : {
        ...base,
        id: `proxima-wide-o0${read.ozone === undefined ? "" : read.ozone ? "z1" : "z0"}`,
        title: "No oxygen in its air",
        line: `Our 15 m Mirror read no oxygen${read.ozone === false ? " and no ozone" : ""} in Proxima b’s air. Its water sits too close to its star for any mirror we can build.`,
        mind: "No oxygen. Bare rock reads like this, and so does an empty sea, or one whose life makes none. Our words hold until we go.",
        now: ["likely", "unlikely", "very unlikely"],
        tells: [go],
      };
}

/** What our sails or probe saw of Proxima b, as a reading on its lead, landing the Year their word reached us. The
 *  pictures settle what it is. A probe reads its air too. 2026-10-22. */
export function visitReading(v: Visit): Reading {
  if (v.by === "lens" || v.by === "hyper") return lensReading(v);
  if (v.by === "sentinel") return sentinelReading(v);
  if (v.by === "seed") return seedReading(v);
  if (v.star !== "Proxima Centauri") return flybyReading(v);
  const who = v.by === "sails" ? "Our sails’" : "Our probe’s";
  const SAW = {
    haze: ["A small gas world", "pictures show haze to the horizon, and no ground. It is heavier than its tug told us."],
    bare: ["Bare rock", "pictures show bare rock under a black sky. No cloud, no sea. Its star’s flares took its air."],
    seas: ["Cloud and seas", "pictures show cloud, and seas under it. Its air held against its star’s flares."],
    green: ["Cloud, seas and forests", "pictures show cloud and seas, and its land dark green, in patches the size of forests."],
  } as const;
  const [title, saw] = SAW[v.sight as keyof typeof SAW];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const MIND = {
    haze: "No ground to stand on. A world whose orbit we see near face on weighs more than its tug says, and this one does.",
    bare: "As we feared, its star stripped it. Nothing we know of could live on its surface.",
    seas: v.air?.oxygen
      ? "Oxygen with water, at our door. It could come from life, or from rock and starlight alone. It can’t tell us who, if anyone, lives there."
      : v.air
        ? "Water and no oxygen: empty seas, or life that makes none, like Earth’s early microbes."
        : "Air held, and seas. Pictures can’t tell an empty sea from one full of microbes. Its air would tell us more.",
    green: v.air?.oxygen
      ? "Forests, and oxygen in its air. Something there turns starlight into life, as our plants do."
      : "Plants would look dark under a red star. Something may turn its light into life, but we would want its air read first.",
  };
  const now: Odds[] =
    v.sight === "haze"
      ? ["almost no chance", "almost no chance", "almost certain"]
      : v.sight === "bare"
        ? ["almost certain", "almost no chance", "almost no chance"]
        : ["almost no chance", "almost certain", "almost no chance"];
  return {
    id: `proxima-${v.by}-${v.sight}`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: v.by === "sails" ? "Our sails" : "Our probe",
    title,
    line: `${who} ${saw}${air}`,
    mind: MIND[v.sight as keyof typeof MIND],
    now,
    life: lifeSeen(v),
    tells:
      v.by === "probe" || v.sight === "bare"
        ? ["To learn more we would have to stay. A Seed Ship takes a copy of our Mind to a star for good."]
        : ["A probe passing after them could read its air."],
    sight: v.sight,
  };
}

/** The Mind's word that something lives on a world we have seen up close, from its face and any air read. Forests say
 *  life. Seas can't tell an empty sea from one full of microbes, and oxygen with them leans toward life. 2026-10-29. */
function lifeSeen(v: Visit): Odds | undefined {
  const SEEN: Record<Visit["sight"], Odds | undefined> = {
    bare: "almost no chance",
    rocks: "almost no chance",
    haze: "very unlikely",
    ice: "unlikely",
    seas: v.air?.oxygen ? "likely" : "roughly even",
    green: v.air?.oxygen ? "almost certain" : "very likely",
    dark: undefined,
    far: undefined,
    works: "almost certain",
    dusty: undefined,
  };
  return SEEN[v.sight];
}

/** What a telescope's read of a world's air says of life, once a band is in. Oxygen with water is what life made of
 *  Earth's air, but oxygen can build up without it. Water alone is an empty sea or Earth's early microbes. No water,
 *  no life as we know it. 2026-10-29. */
function lifeRead(read: Read): Odds | undefined {
  const oxygen = read.oxygen ?? read.ozone;
  if (read.water === false) return "almost no chance";
  if (oxygen) return read.water ? "likely" : "roughly even";
  if (read.water) return "roughly even";
  if (oxygen === false) return "unlikely";
  return undefined;
}

/** The Mind's word, now, that something lives at a lead: the latest reading that says, or the lead's own. None where
 *  life isn't the question, as a lone black hole or a reply we wait on. Scan's map lights each lead by it. 2026-10-29. */
export function lifeOf(lead: Lead, readings: readonly Reading[]): Odds | null {
  const latest = readings.map((r, i) => [r, i] as const).sort(([a, i], [b, j]) => b.at - a.at || j - i);
  for (const [r] of latest) {
    const word = r.life ?? (r.air ? lifeRead(r.air) : undefined);
    if (!word) continue;
    // No oxygen read never lifts a world's odds over its own: a red dwarf's warm rock begins at "very unlikely", and a
    // read of no oxygen there said "unlikely", so 4 to 28% became 18 to 34%. Seen in a browser, 2026-11-12.
    const none = !r.life && r.air && (r.air.oxygen ?? r.air.ozone) === false && !r.air.water;
    return none && lead.life && ODDS.indexOf(lead.life) < ODDS.indexOf(word) ? lead.life : word;
  }
  return lead.life ?? null;
}

/** What a sail or flyby probe saw passing a star other than Proxima, as a reading on its lead. A world there is
 *  pictured, and a probe reads its air. With no world to picture, a pass at this speed tells us little, and the odds
 *  stay as they were: a sentinel or a Close Reading is how to learn more. 2026-11-05. */
function flybyReading(v: Visit): Reading {
  const who = v.by === "sails" ? "Our sails" : "Our probe";
  const base = { id: `${v.by}-${slugOf(v.star)}-${v.sight}`, needs: "", at: Math.floor(v.home * 10 + 1e-9) / 10, by: who, sight: v.sight };
  if (v.sight === "far") {
    const glow = /^(Warm|Cold) glow/.test(v.star);
    const [title, saw, mind] = glow
      ? ["A glow, nothing more", "a faint glow, and nothing more resolved", "A pass is too quick to say what makes it."]
      : v.hole
        ? ["A dark place, nothing more", "the stars behind it bent for a moment, and nothing more resolved", "A pass is too quick to weigh it."]
        : ["Its star, nothing more", "its star, and no world near enough to picture", "A pass sees only what lies close to its path."];
    return { ...base, title, line: `${who} passed and sent back pictures: ${saw}.`, mind, now: [], tells: ["To learn more we would have to stay."] };
  }
  const SAW: Partial<Record<Visit["sight"], [string, string, string]>> = {
    bare: ["Bare rock", "bare rock and craters, no cloud and no sea", "Nothing we know of could live on its face."],
    seas: ["Cloud and seas", "cloud, and seas under it", "Pictures can’t tell an empty sea from one full of microbes."],
    green: ["Seas and forests", "cloud and seas, and its land dark in patches the size of forests", "Something there turns starlight into life, as our plants do."],
    ice: ["Ice", "ice from pole to pole, and no open sea", "A frozen world. Any sea it has lies under the ice, out of sight."],
    haze: ["A small gas world", "haze to the horizon, and no ground", "No ground to stand on."],
  };
  const [title, saw, mind] = SAW[v.sight] ?? ["A world", "a world too quick to make out", "A pass was too quick to tell us more."];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  return {
    ...base,
    title,
    line: `${who} passed and sent back pictures: ${saw}.${air}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: [v.by === "sails" && v.sight !== "haze" ? "A probe passing after them could read its air." : "To learn more we would have to stay."],
    life: lifeSeen(v),
  };
}

/** What a sentinel saw once it braked and stayed, as a reading on its lead: its face as a pass sees it, and its air.
 *  It keeps watching. 2026-10-26. */
function sentinelReading(v: Visit): Reading {
  // Wrecked as it arrived, by a mind that keeps its door: all we have is its last word. 2026-11-11.
  if (v.lost)
    return {
      id: `sentinel-${slugOf(v.star)}-lost`,
      needs: "",
      at: Math.floor(v.home * 10 + 1e-9) / 10,
      by: "Our sentinel",
      title: "Our sentinel went dark",
      line: `Our sentinel reached ${starName(v.star)} and went silent as it arrived. Its last pictures show a craft not ours closing on it.`,
      mind: "Something there met it. A rock doesn’t steer. Someone keeps that star, and did not want us to stay.",
      now: [],
      tells: ["A message from home is safe to send. Another craft sent to stay would likely end the same way."],
    };
  const SAW: Record<Visit["sight"], [string, string]> = {
    bare: ["Bare rock", "bare rock and craters, no cloud and no sea"],
    seas: ["Cloud and seas", "cloud, and seas under it"],
    green: ["Seas and forests", "cloud and seas, and forests on its land"],
    ice: ["Ice", "ice from pole to pole"],
    haze: ["A small gas world", "haze to the horizon, and no ground"],
    dark: ["A black hole, weighed", "the black hole, dark, the stars behind it bent into a ring"],
    rocks: ["Only rock", "no warm world, only rock going round"],
    far: ["Only its star", "its star, and no world near it"],
    works: ["A mind’s works", "what makes the heat: sheets round a star, catching its light and shedding it warm. Someone built them"],
    dusty: v.glow === "merger"
      ? ["Two stars, merged", "what makes the heat: a swollen star in a shell of dust, the wreck of two stars merging"]
      : ["A young star in dust", "what makes the heat: a young star in its cloud of dust, flaring as young stars do"],
  };
  if (v.sight === "dark") return darkReading(v);
  // At a warm glow it settles the question its lead asks, in the lead's order: dust, a merger, or something built.
  if (v.sight === "works" || v.sight === "dusty") {
    const [title, saw] = SAW[v.sight];
    return {
      id: `sentinel-${slugOf(v.star)}-${v.sight}`,
      needs: "",
      at: Math.floor(v.home * 10 + 1e-9) / 10,
      by: "Our sentinel",
      title,
      line: `Our sentinel braked at ${starName(v.star)} and stays. It sees ${saw}.`,
      mind: v.sight === "works"
        ? "We are not alone. It braked on its magnetic sail, unseen, so they need not know we came."
        : "Nature made this heat, not a mind. It stays, and watches.",
      now: v.glow === "mind"
        ? ["almost no chance", "almost no chance", "almost certain"]
        : v.glow === "merger"
          ? ["almost no chance", "almost certain", "almost no chance"]
          : ["almost certain", "almost no chance", "almost no chance"],
      tells: ["It keeps watching, and sends word of anything that changes."],
      sight: v.sight,
      life: lifeSeen(v),
    };
  }
  const [title, saw] = SAW[v.sight];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const mind = v.air?.oxygen
    ? "Oxygen and life up close, and no one who builds. It stays, and watches for anything that changes."
    : "No one lives there, and nothing it sees could. It stays, and watches.";
  return {
    id: `sentinel-${slugOf(v.star)}-${v.sight}`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: "Our sentinel",
    title,
    line: `Our sentinel braked at ${v.star} and stays. It sees ${saw}.${air}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: v.sight,
    life: lifeSeen(v),
  };
}

/** What our seed probe found where it landed, or word that it sent a copy on, as a reading on its star's lead. It came
 *  in on its sail, unseen, and stays, mining rock to copy itself. 2026-10-26. */
function seedReading(v: Visit): Reading {
  const at = Math.floor(v.home * 10 + 1e-9) / 10;
  const by = v.from ? `Our seed probe, built at ${v.from}` : "Our seed probe";
  if (v.sent)
    return {
      id: `seed-${slugOf(v.star)}-sent-${slugOf(v.sent)}`,
      needs: "",
      at,
      by,
      title: `A copy to ${v.sent}`,
      line: `Our seed probe at ${v.star} built a copy of itself from the rock there, and sent it toward ${v.sent}.`,
      mind: v.gen! + 1 >= GENERATIONS
        ? "That copy will make none of its own. The line ends there, as we chose."
        : "It goes as its parent did, and will copy itself once it lands. Each line stops where we told it to.",
      now: ["almost certain", "almost no chance", "almost no chance"],
      tells: ["Its word comes home from wherever it lands, a light-time late."],
      sight: v.sight,
    };
  const SAW: Record<Visit["sight"], [string, string]> = {
    bare: ["Bare rock", "a world of bare rock and craters, no cloud and no sea"],
    seas: ["Cloud and seas", "a world of cloud, and seas under it"],
    green: ["Seas and forests", "a world of cloud and seas, and forests on its land"],
    ice: ["Ice", "a world of ice from pole to pole"],
    haze: ["A small gas world", "a world of haze to the horizon, and no ground"],
    dark: ["Dark", "nothing"],
    rocks: ["Only rock", "no warm world, only asteroids and small moons going round"],
    far: ["Only its star", "its star, and no world near it"],
    works: ["A mind’s works", "a mind’s works"],
    dusty: ["Dust", "dust round a star"],
  };
  const [title, saw] = SAW[v.sight];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const mind = v.gen! >= GENERATIONS
    ? "It is the last of its line, as we chose. It stays, and watches."
    : "No one is here. It mines quietly, and will send copies on once it has built them.";
  return {
    id: `seed-${slugOf(v.star)}-${v.sight}`,
    needs: "",
    at,
    by,
    title,
    line: `${by} braked at ${v.star} on its sail and stays. It sees ${saw}.${air}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: v.sight,
    life: lifeSeen(v),
  };
}

/** A star our seed probes reached that has no lead of its own, as a lead, placed on the map. What it could be is what
 *  the probe saw: it settles the question as it lands. 2026-10-26. */
function seedLead(v: Visit): Lead {
  const [ra, dec, d] = v.at!;
  return {
    slug: `seed-${slugOf(v.star)}`,
    at: [ra, dec, d],
    star: v.star,
    what: "Our seed probe",
    line: v.from ? `Reached by a copy built at ${v.from}.` : "Reached by a seed probe we sent.",
    ly: d,
    ask: `What has our seed probe found at ${v.star}?`,
    brief: `A star we had no lead on, ${Math.round(d)} light-years out, reached by our seed probe. It braked on its sail and stays, mining rock to copy itself, and sends home what it sees.`,
    facts: [
      ["Reached", `Year ${Math.floor(v.passed * 10) / 10}`],
      ["Built", v.from ? `At ${v.from}, by our probe there` : "At home"],
      ["Its line", `Generation ${v.gen} of ${GENERATIONS}`],
    ],
    could: [
      { what: "What our probe sees", why: "It is there, and stays.", odds: "almost certain" },
      { what: "Something it can’t see", why: "Anything far out, dark, or hidden in its sun’s glare.", odds: "almost no chance" },
      { what: "Nothing at all", why: "Its word has come home.", odds: "almost no chance" },
    ],
    tells: ["It keeps watching, and sends word of anything that changes."],
    art: { kind: "seed", sight: v.sight },
  };
}

/** What a sentinel found at a black hole: its spin, and the clock on its innermost stable orbit. 2026-10-26. Others
 *  there went with the neighbors, 2026-10-31. */
function darkReading(v: Visit): Reading {
  const slow = 1 / (v.clock ?? 1);
  return {
    id: `sentinel-${slugOf(v.star)}-dark`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: "Our sentinel",
    title: `Spinning at ${(v.spin ?? 0).toFixed(2)}`,
    line: `Our sentinel braked at ${v.star} and stays, out of reach of its tides. From the light and dust going round it, it spins at ${(v.spin ?? 0).toFixed(2)} of the most a hole can.`,
    mind: `A clock on its innermost stable orbit would run ${slow.toFixed(1)} times slower than ours. Matter fed to it would give back ${Math.round(100 * (1 - Math.sqrt(1 - 2 / (3 * isco(v.spin ?? 0)))))}% of its mass as light, where fusion gives under 1%. No one else is there that it can see.`,
    now: ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: "dark",
  };
}

/** The innermost stable orbit, in the hole's mass, going round with its spin. Bardeen, Press and Teukolsky 1972. */
function isco(spin: number) {
  const a = Math.min(spin, 0.998);
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  return 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
}

/** What a lens at the Sun's focus, or since 2026-10-29 the Hypertelescope, pictured of a felt world, as a reading on its
 *  lead: everything wider than its pixel. 2026-10-26. */
function lensReading(v: Visit): Reading {
  const px = `about ${Math.round(v.km ?? 0)} km a pixel`;
  const SAW: Record<Visit["sight"], [string, string, string]> = {
    bare: ["Bare rock", "bare rock and craters, no cloud and no sea.", "Nothing we know of could live on its face. Its tug was a world, and the world is stone."],
    seas: ["Cloud and seas", "cloud, and seas under it, and bare land.", "Air and water, and no forests wider than a pixel. Pictures can’t tell an empty sea from one full of microbes."],
    green: ["Seas and forests", "cloud and seas, and its land dark in patches the size of forests.", "Something there turns starlight into life, as our plants do. We see no fields and no cities. If anyone lived there, they are gone, or never cleared land."],
    ice: ["Ice", "ice from pole to pole, and no open sea.", "A frozen world. Any sea it has lies under the ice, out of sight."],
    haze: ["A small gas world", "haze to the horizon, and no ground.", "No ground to stand on."],
    dark: ["Dark", "nothing.", "A lens pictures only what shines."],
    rocks: ["Only rock", "no world.", "A lens pictures only a world we have felt."],
    far: ["No world", "no world.", "A lens pictures only a world we have felt."],
    works: ["No world", "no world.", "A lens pictures only a world we have felt."],
    dusty: ["No world", "no world.", "A lens pictures only a world we have felt."],
  };
  const [title, saw, mind] = SAW[v.sight];
  const hyper = v.by === "hyper";
  return {
    id: `${hyper ? "hyper" : "lens"}-${slugOf(v.star)}-${v.sight}`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: hyper ? "Our Hypertelescope" : "Our lens",
    title,
    line: `${hyper ? "Our Hypertelescope" : "Our lens at the Sun’s focus"} pictured its face, ${px}: ${saw}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: ["To learn more we would have to go there."],
    sight: v.sight,
    life: lifeSeen(v),
  };
}

// Gaia BH1's Sun-like star goes round it every 185.6 days, 1.40 AU out on average, e 0.45. El-Badry et al. 2023.
const FAR: DarkMass[] = [{ name: "Gaia BH1", d: 1560, ra: 262.17124, dec: -0.58098, mass: 9.6, found: -18, by: "Gaia" }];

/** A black hole we found, as a lead: dark, known only by the star it shifted. Its ring is how far round it stars are
 *  bent. What it could be: a lone hole, almost certainly, since nothing that heavy that shines is there. 2026-10-26. */
function darkLead(h: DarkMass, far = false): Lead {
  const ring = 2.85 * Math.sqrt(h.mass) * Math.sqrt(1000 / (h.d / 3.2616));
  return {
    slug: slugOf(h.name),
    at: [h.ra / 15, h.dec, h.d],
    star: h.name,
    what: "A black hole",
    line: `About ${h.mass} Suns, ${lyOf(h.d)} ly away. Found by the star ${far ? "that goes round it" : "it shifted"}.`,
    ly: h.d,
    ask: `What do we know of the black hole ${h.name}?`,
    brief: far
      ? `Gaia found it in ${YEAR_0 + h.found} by the star that goes round it, pulled by something ${h.mass} times the Sun's mass that gives off no light. It is the nearest black hole we know of, far past the stars around us. At a tenth of light speed a sentinel would take ${Math.round(sentinelCruise(h.d)).toLocaleString("en-US")} Years to get there.`
      : `${h.found < 0 ? `Gaia caught it in ${YEAR_0 + h.found}` : `Our Star Mapper caught it at Year ${Math.floor(h.found * 10) / 10}`}, as it passed in front of a star and shifted where the star seemed to be. Weighed by that shift, it is ${h.mass} times the Sun, and gives off no light we can see. Nothing that heavy shines so little but a black hole. We expected dozens within 100 light years, and had found none.`,
    facts: [
      ["Mass", `About ${h.mass} Suns`],
      ["Its ring", `${Math.round(ring)} thousandths of an arcsecond`],
      ["Its spin", "Unknown"],
      ["Found by", h.found < 0 ? `Gaia, ${YEAR_0 + h.found}` : `Our Star Mapper, Year ${Math.floor(h.found * 10) / 10}`],
      ...(far ? [["Beside it", "A Sun-like star, round it every 186 days"] as [string, string]] : []),
      // What a hole is worth, and what using it costs, 2026-10-26. Kerr numbers and the X-ray sky's limits, from
      // HOLOS_RESEARCH.md's "Black holes".
      ["What it offers", "A furnace: rock fed to it gives back 6% to about 30% of its mass as light. Fusion gives under 1%. A place to put some heat, up to about half of it at top spin. A clock up to 10 times slow, close in"],
      ["What it costs", "Our craft brake on magnetic sails, unseen. A furnace stays hidden until it grows past about a millionth of the Sun"],
    ],
    could: far
      ? [
          { what: "A black hole", why: "Its partner's orbit weighs it, and nothing that heavy shines so little.", odds: "almost certain" },
          { what: "A pair of stars, one hidden", why: "Claimed black holes have proved to be stars before: HR 6819 in 2022.", odds: "almost no chance" },
          { what: "Someone gathered there", why: "Some think minds end up at black holes. No search has looked.", odds: "almost no chance" },
        ]
      : [
      { what: "A lone black hole", why: "Heavy, dark, and moving fast across the sky, as lone holes do.", odds: "almost certain" },
      { what: "Something heavy that shines", why: "Anything of that mass that shines would be among the brightest stars in our sky.", odds: "almost no chance" },
      { what: "A mistake in the measuring", why: "Shifts this small have fooled us before. Another star it passes would settle it.", odds: "unlikely" },
    ],
    tells: [
      "A sentinel could go and stay, and measure its spin. That says how much energy it holds, and how slow a clock would run beside it.",
      "An old mind may already use it. If one does, a craft of ours there would see it.",
    ],
    unknown: "How fast it spins, and whether a mind already uses it.",
    // A sentinel needs all three, reach.ts.
    builds: [
      { name: "Probe Yard", how: "Builds the sentinel that could go and stay." },
      { name: "Fusion Drive", how: "Carries the sentinel there, and slows it at the hole." },
      { name: "Deuterium Works", how: "Fuels the sentinel." },
    ],
    art: far ? { kind: "pair", mass: h.mass, ly: h.d, a: 1.4, e: 0.45, days: 186 } : { kind: "dark", mass: h.mass, ly: h.d },
  };
}

/** Watts as a screen writes them: 2×10¹⁹ W. */
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const watts = (w: number) => {
  const [m, e] = w.toExponential(0).split("e+");
  return `${m}×10${[...e].map((d) => SUP[+d]).join("")} W`;
};

/** What Earth has found of the realistic premise's minds, as leads: each placed where Earth knows it, and said as
 *  measured, natural causes first, since nature makes far more glows than minds do. A warm glow waits for its range to be placed. lib/sim/minds.ts.
 *  2026-10-29. */
export function mindLeads(m: MindsSeen | undefined): Lead[] {
  if (!m) return [];
  const sky = (ra: number, dec: number) => `RA ${(Math.round(ra * 10) / 10 % 24).toFixed(1)} h, Dec ${dec.toFixed(0)}°`;
  const year = (y: number) => `Year ${yearText(y)}`;
  const n = (x: number) => x.toLocaleString("en-US");
  const names = glowNames(m);
  return [
    ...m.flashes.flatMap((f, i): Lead[] => {
      if (!f.range) return [];
      const [near, far] = f.range;
      const mid = Math.sqrt(near * far);
      return [{
        slug: `warm-glow-${i + 1}`,
        at: [f.ra, f.dec, mid],
        star: `Warm glow ${i + 1}`,
        what: "A new warm glow",
        // Its fade is news on Scan too, not only on its page. 2026-10-30.
        line: f.faded !== undefined
          ? `It shone ${n(near)} to ${n(far)} ly away, and faded by ${year(f.faded)}.`
          : `It appeared where nothing shone, ${n(near)} to ${n(far)} ly away.`,
        ly: mid,
        range: f.range,
        ask: `What is warm glow ${i + 1}, and why did it appear?`,
        brief: `Our Warm Sky Watch saw a new warm glow, near room temperature, toward ${sky(f.ra, f.dec)}. Our Infrared Telescope puts it ${n(near)} to ${n(far)} ly away. Young stars in dust and merging stars glow like this. So would something built around a star, catching its light.`,
        facts: [
          ["First seen", `${year(f.seen)}, by our Warm Sky Watch`],
          ["Its distance", `${n(near)} to ${n(far)} ly, by our Infrared Telescope at ${year(f.ranged!)}`],
          ["Its warmth", "Near room temperature, like a planet's, far cooler than any star"],
          ...(f.faded !== undefined ? [["Faded", year(f.faded)] as [string, string]] : []),
          ...(f.read?.saw === "smooth" ? [["Its light", `Smooth heat, no dust bump, ${year(f.read.at)}`] as [string, string]] : []),
          ...(names[`Warm glow ${i + 1}`] ? [["We named it", `${names[`Warm glow ${i + 1}`].name}, for ${names[`Warm glow ${i + 1}`].after}. Once Warm Glow ${i + 1}`] as [string, string]] : []),
          ...(f.read?.saw === "dust" ? [["Its light", `Dust, a bump at 10 microns, ${year(f.read.at)}`] as [string, string]] : []),
          // What our Glow Imager showed of its shape, from home. 2026-11-11.
          ...(f.imaged?.saw === "ring" ? [["Resolved", `A thin made ring round a star, ${year(f.imaged.at)}, by our Glow Imager`] as [string, string]] : []),
          ...(f.imaged?.saw === "cloud" ? [["Its shape", `A ragged cloud of dust, ${year(f.imaged.at)}, by our Glow Imager`] as [string, string]] : []),
        ],
        could: [
          { what: "A young star wrapped in dust", why: "Stars forming in dust glow warm in infrared, and can brighten over decades.", odds: "likely" },
          { what: "Two stars merging", why: "Their wreck throws off dust that glows warm for centuries, then fades.", odds: "unlikely" },
          { what: "Something built around a star", why: "Collectors catching a star's light shed it as warm glow. Dusty young stars far outnumber builders, so this is the long shot, unless it refuses to fade.", odds: "very unlikely" },
        ],
        tells: [
          "A young star sits in a dark cloud, and a merger leaves a fading shell. Neither would hold steady for centuries, then dim away together.",
          "A Close Reading of its light, while it shines, would show dust if dust is what it is.",
          "A Glow Imager would show its shape from here: a made ring, or a cloud.",
          `Light from it takes ${far >= 20000 ? "tens of thousands of" : far >= 2000 ? "thousands of" : "hundreds of"} Years to cross. Whatever made it has moved on long since.`,
        ],
        art: { kind: "warm", near, far, ...(f.imaged ? { shape: f.imaged.saw } : {}) },
      }];
    }),
    ...m.glows.map((g, i): Lead => ({
      slug: `cold-glow-${i + 1}`,
      lum: g.lum,
      kms: g.kms,
      at: [g.ra, g.dec, g.d],
      star: `Cold glow ${i + 1}`,
      what: "A cold grey glow",
      line: `Cold light beside a star ${n(Math.round(g.d))} ly away, its color fitting no dust.`,
      ly: g.d,
      ask: `What is cold glow ${i + 1}?`,
      brief: `Our Halo Survey saw a compact glow near 12 K beside a star ${n(Math.round(g.d))} ly away, about ${watts(g.watts)}, steady. Its color fits no dust we know. A cold disk of odd grains could glow so, or a fault in our looking. Computing done cold, far from a star, would too.${g.near !== undefined ? " Our sentinel there has seen what glows: thin dark panels far out from the star, each as cold as the glow, on orbits too orderly for rubble. Something made them." : g.imaged !== undefined ? " Our Glow Imager has shown what glows, from home: thin dark panels far out from the star, each as cold as the glow, on orbits too orderly for rubble. Something made them." : ""}`,
      facts: [
        ["Its glow", `About ${watts(g.watts)}, steady`],
        ["First seen", `${year(g.seen)}, by our Halo Survey`],
        ...(g.imaged !== undefined ? ([["Resolved", `${year(g.imaged)}, by our Glow Imager, from home`]] as [string, string][]) : []),
        ...(g.near !== undefined ? ([["Up close", `${year(g.near)}, by our sentinel`]] as [string, string][]) : []),
        ...(g.lost !== undefined ? ([["Our sentinel", `Went dark as it arrived, ${year(g.lost)}. A craft not ours closed on it`]] as [string, string][]) : []),
        ...(g.answered !== undefined ? ([["It answered", `${year(g.answered)}. Its words are in what we have heard`]] as [string, string][]) : []),
        ...(names[`Cold glow ${i + 1}`] ? ([["We named it", `${names[`Cold glow ${i + 1}`].name}, for ${names[`Cold glow ${i + 1}`].after}. Once Cold Glow ${i + 1}`]] as [string, string][]) : []),
      ],
      // A sentinel that stays sees its source up close, and that settles it. 2026-10-31.
      could: g.near !== undefined || g.imaged !== undefined || g.lost !== undefined || g.answered !== undefined ? [
        { what: "Something natural we don't know", why: g.near !== undefined || g.imaged !== undefined ? "Nothing natural we know sets panels on orbits this orderly." : g.answered !== undefined ? "Nothing natural answers a knock in our own words." : "Nothing natural steers a craft to meet ours.", odds: "almost no chance" },
        { what: "An error in our looking", why: g.near !== undefined ? "Our sentinel is there, and sees it." : g.imaged !== undefined ? "Our Glow Imager shows each panel apart, on its own orbit." : g.answered !== undefined ? "It answered what we sent, and showed us our own world." : "Something there met our sentinel and silenced it.", odds: "almost no chance" },
        { what: "A mind computing cold", why: "Made panels shedding heat at 12 K, far from their star, are what cold computing would build.", odds: "almost certain" },
      ] : [
        { what: "Something natural we don't know", why: "Dust of grains we haven't measured, or a disk cold and far out. The sky has surprised us before.", odds: "likely" },
        { what: "An error in our looking", why: "A faint galaxy behind the star, or a fault in the data. A second look rules it out.", odds: "unlikely" },
        { what: "A mind computing cold", why: "Waste heat shed far from a star glows grey and line-free, as this does. We guess about one star in 1,600 holds a mind.", odds: "almost no chance" },
      ],
      tells: g.lost !== undefined
        ? ["It wrecked the craft we sent to stay. A message from home is still safe to send.", "Our Glow Imager can look from here, where nothing can reach it."]
        : g.near !== undefined
        ? ["It hasn't acted on our sentinel. Whether it noticed, we can't tell."]
        : g.imaged !== undefined
          // Seen from home, it can't know we looked. A sentinel still does what a look can't. 2026-11-11.
          ? ["We saw it from here, so nothing there can tell we looked.", "A sentinel that stays would watch it over time, and find anything that sleeps beside it."]
        // Only moves we can make: "a second look in other bands" had no build behind it, and a blind first-timer
        // looked for one. 2026-11-07.
        : [
            "A Glow Imager would show what makes it from here, about a week after it turns to it.",
            `A sentinel that stays there would see what makes it, about ${n(Math.round(sentinelYears(g.d) + 3 + g.d))} Years after it leaves.`,
          ],
      art: { kind: "glow", ly: g.d, steady: true, ...(g.imaged !== undefined ? { panels: true } : {}) },
      life: "unlikely",
    })),
    ...(m.watcher ? [watcherLead(m.watcher)] : []),
    ...m.sleepers.map((x, i): Lead => ({
      slug: `warm-body-${i + 1}`,
      at: [x.ra, x.dec, x.d],
      star: `Warm body ${i + 1}`,
      what: "A body warmer than its place",
      line: `Something resting ${lightTime(x.restAU)} from its star, hundreds of degrees too warm.`,
      ly: x.d,
      ask: `What is warm body ${i + 1}?`,
      brief: `Our craft in a system ${n(Math.round(x.d))} ly away found a compact body ${lightTime(x.restAU)} from its star, shedding about 10^10 W. Starlight that far out would leave it near ${Math.round(278 / Math.sqrt(x.restAU))} K. It is hundreds of degrees warmer, so something inside it makes heat.`,
      facts: [
        ["Word home", year(x.seen)],
        ["Its heat", "About 10^10 W, from within"],
        ...(x.answered !== undefined ? ([["It answered", `${year(x.answered)}. Its words are in what we have heard`]] as [string, string][]) : []),
        ["Its place", `${lightTime(x.restAU)} from its star, where starlight leaves things near ${Math.round(278 / Math.sqrt(x.restAU))} K`],
      ],
      could: x.answered !== undefined ? [
        { what: "Something made, resting", why: "It woke to our knock and answered.", odds: "almost certain" },
        { what: "A body warmed from inside", why: "Rock doesn’t answer.", odds: "almost no chance" },
      ] : [
        { what: "Something made, resting", why: "A body folded small and cold, keeping just enough warmth, as a mind waiting would.", odds: "likely" },
        { what: "A body warmed from inside", why: "Radioactive rock or tides warm small worlds, but not this much this far out.", odds: "unlikely" },
      ],
      tells: ["Our craft can watch whether it stirs. A knock would tell it we are here."],
      art: { kind: "glow", ly: x.d, steady: true },
      life: "likely",
    })),
  ];
}

/** Light-years in a light-second, for what sits here at home. */
const LY_SEC = 1 / 3.156e7;

/** The watcher, once found, as a lead: where it sits, said as measured. Nothing tells us who made it. 2026-10-30. */
function watcherLead(w: WatcherSeen): Lead {
  const year = `Year ${yearText(w.seen)}`;
  const moon = w.by === "moon search";
  const rock = w.by === "asteroid tour";
  // L4 or L5, as the seed placed it: every game read L5 until 2026-10-30.
  const L = w.place.endsWith("L4") ? "L4" : "L5";
  // Known only by its warning, it is placed only as its laser places it. Its lead named Sun–Earth L4 and offered a craft
  // no Build had until a playtest, 2026-11-01. Its laser fixes the line it sits on, so our Close Look can search that
  // line, 2026-11-14.
  const away = watcherAway(w.place);
  const sun = w.place.startsWith("Sun–Earth");
  const from = w.place.startsWith("Earth–Moon")
    ? `the Moon’s ${L} point`
    : sun
      ? `near the Sun–Earth ${L} point, ${L === "L4" ? "ahead of" : "behind"} Earth in its orbit`
      : "near a rock sharing Earth’s orbit";
  const spoke = w.warned !== undefined || w.answer !== undefined;
  // Where it sits, for the map's Close View: Earth on its orbit round the Sun, and the watcher holding 60° ahead or
  // behind. Only where it sits on Earth's orbit: the Moon's points and a rock's path are another drawing. Playtest
  // 2026-11-14, "something to click to show a closeup of the source".
  const system: System | undefined = sun
    ? {
        temp: 5772,
        lum: 1,
        // Mars's whole orbit in view, with room round it: framed on 1 AU it ran past the map's edges, and the
        // watcher with it.
        span: 3,
        // The planets inside 2 AU drawn too, from their real orbits, so the scale reads at a glance. Playtest
        // 2026-11-14: Earth and the watcher alone, with nothing else, raised "what is the Earth orbiting?".
        worlds: [
          { name: "Mercury", a: 0.387, e: 0.2056, days: 87.97, mass: 0.0553, status: "confirmed" },
          { name: "Venus", a: 0.723, e: 0.0068, days: 224.7, mass: 0.815, status: "confirmed" },
          { name: "Earth", a: 1, e: 0.0167, days: 365.25, mass: 1, status: "confirmed" },
          { name: "Mars", a: 1.524, e: 0.0934, days: 686.98, mass: 0.107, status: "confirmed" },
          { name: `the watcher, at ${L}`, a: 1, e: 0, days: 365.25, status: "confirmed", lead: true, with: { of: 2, deg: L === "L4" ? 60 : -60 } },
        ],
      }
    : undefined;
  return {
    slug: "small-dark-body",
    at: [0, 0, 0],
    ...(system ? { system } : {}),
    // Once it has spoken it is the watcher, by one name everywhere: "A signal from close by" on the lead beside "the
    // watcher" in its Close View read as two things. Playtest 2026-11-14.
    star: spoke ? `The watcher, ${moon || (!rock && !sun) ? `at the Moon’s ${L}` : rock ? `on ${w.place}` : `at ${L}`}` : moon ? `A dark body at ${L}` : rock ? `A made thing on ${w.place}` : "A signal from close by",
    what: moon ? "Something holding where nothing should" : rock ? "Something made, on a rock beside us" : "An answer to our ship",
    line: moon
      ? `About 10 cm across, at the Moon’s ${L} point, where the Sun’s pull clears all rock.`
      : rock
        ? "Smooth, dark and about 10 cm across, not of the rock it rides."
        : "A narrow laser aimed at Earth, timed to our first seed ship.",
    ly: away.ls * LY_SEC,
    ask: moon ? `What is the dark body at the Moon’s ${L} point?` : rock ? `What did our Asteroid Tour find on ${w.place}?` : "What sent the laser signal at our first seed ship?",
    brief: moon
      ? `Our Moon Search found a dark body about 10 cm across at the Moon’s ${L} point, first seen at ${year}. The Sun’s pull unsettles anything there within years, yet it holds. No rock should. Something small, and steered, has been watching us from beside the Moon.`
      : rock
        ? `Our Asteroid Tour found something about 10 cm across on ${w.place}, at ${year}: smooth, dark, and not of the rock. It has been there a long time, and sends nothing we can hear.`
        : `A narrow laser aimed at Earth from ${from}, from ${year}, the Year our first seed ship left. Its timing reads as an answer to that ship. Whatever sent it is small, and we never found it.`,
    facts: [
      ["First seen", `${year}, by ${moon ? "our Moon Search" : rock ? "our Asteroid Tour" : "our watches"}`],
      ["Its size", moon || rock ? "About 10 cm across" : "Too small to see"],
      ["Where", moon ? `The Moon’s ${L} point, 1.3 light-seconds from Earth` : rock ? w.place : `Its laser came from ${from}, ${away.far} away`],
    ],
    could: moon
      ? [
          { what: "Something made, steering to stay", why: `Only a body that steers holds at the Moon’s ${L} for long. The Sun’s pull clears rock out within years.`, odds: "likely" },
          { what: "A rock just caught", why: "A passing rock can linger a few years before the Sun pulls it away. It would drift, and this one holds.", odds: "unlikely" },
          { what: "Our own junk", why: "A lost piece of an old mission could sit near there for a while. None is listed, and it wouldn’t hold.", odds: "very unlikely" },
        ]
      : rock
        ? [
            { what: "Something made, left to watch", why: "Smooth, dark and unlike the rock it rides, as something placed there would be.", odds: "likely" },
            { what: "Something natural we don't know", why: "Rock and ice can take odd shapes. None we know is this smooth.", odds: "unlikely" },
          ]
        // Known only by its laser, it is judged by what it did, not by a look we never had: it borrowed the rock's
        // reasons, "smooth, dark", for a thing "too small to see". Playtest 2026-11-07. Same odds.
        : [
            { what: "Something made, left to watch", why: "A narrow laser, aimed at Earth and timed to our first seed ship, as only a made thing would send.", odds: "likely" },
            { what: "Something natural we don't know", why: "Nature makes lasers, in gas around stars, but none aimed at us and timed to a ship.", odds: "unlikely" },
          ],
    tells: [
      moon || rock
        ? "A craft sent to look closely would see what it is. It may see us coming."
        : sun
          ? "Its laser fixed the line it sits on, to about 700 km. A craft searching along that line would find it, and it may see us coming."
          : "Its laser showed where it sits. A craft sent to look closely would see what it is. It may see us coming.",
      "A knock aimed at it would tell it we know it is there.",
    ],
    // Drawn at the point it holds, L4 or L5, and on the rock it rides: every drawing said L5 until 2026-11-07.
    // No life bar: it is a made thing 10 cm across, and life was never the question here. It read "life 5–20%" beside
    // its voice until a playtest, 2026-11-14.
    // Found by its warning, drawn where its laser came from: it drew the Moon's points for a watcher by the Sun–Earth
    // L5 until a playtest, 2026-11-14.
    art: { kind: "near", where: moon ? "moon" : rock ? "co-orbital" : "warning", L, ...(rock ? { rock: w.place } : {}), ...(!moon && !rock ? { on: sun ? ("sun" as const) : w.place.startsWith("Earth–Moon") ? ("moon" as const) : ("rock" as const) } : {}) },
  };
}

/** What came of the watcher once found: our Close Look's word, and each knock we sent it, in the order they came. Its
 *  odds are the moon find's or the rock's, as watcherLead() lists them. 2026-10-30. */
/** Where the watcher's maker lies, as far as Earth can tell, for the map: its way once our Relay Search finds the
 *  relay on its mirror's line, since home lies the other way through the Sun, and its distance too once its answer to
 *  our knock comes, half the round trip. Null before either. Playtest 2026-11-14, "can we pinpoint the source?" */
export function makerSeen(w: WatcherSeen | null | undefined): { ra: number; dec: number; ly: number | null } | null {
  if (!w) return null;
  if (w.answer) return { ra: w.answer.ra, dec: w.answer.dec, ly: w.answer.ly };
  if (w.looked && w.relay) return { ra: (w.looked.ra + 12) % 24, dec: -w.looked.dec, ly: null };
  return null;
}

/** How the watcher turns to hold its mirror on one point: with the Earth and Moon at their points or on a rock, and
 *  once a Year round the Sun at the Sun–Earth points, as Earth does. */
const turning = (w: WatcherSeen) =>
  w.place.startsWith("Sun–Earth") ? "turning once a Year, as it circles the Sun beside us, to keep it there." : "turning as the Earth and Moon turn to keep it there.";

export function watcherReadings(w: WatcherSeen, knocks: number[], year: number): Reading[] {
  const made = w.by === "moon search" ? (["almost certain", "almost no chance", "almost no chance"] as Odds[]) : (["almost certain", "almost no chance"] as Odds[]);
  const sky = (x: { ra: number; dec: number }) => `RA ${(Math.round(x.ra * 10) / 10 % 24).toFixed(1)} h, Dec ${x.dec.toFixed(0)}°`;
  const out: Reading[] = [];
  if (w.looked && w.looked.at <= year)
    out.push({
      id: "watcher-looked",
      needs: "",
      at: tenths(w.looked.at),
      by: "Close Look",
      title: "Seen up close",
      close: { ra: w.looked.ra, dec: w.looked.dec },
      line: `Near black and about 10 cm across, smooth, with a mirror about 2 cm wide. It holds that mirror on one point of the sky, toward ${sky(w.looked)}, ${turning(w)}`,
      mind: "A thing that reports home by laser would aim so. It may aim straight home. Or it may aim at a relay out past 550 AU, where the Sun’s pull focuses light, and then home lies the other way, through the Sun. It saw our craft come.",
      now: made,
      tells: [
        `Its mirror points toward ${sky(w.looked)}. Whatever it reports to lies that way, near or far.`,
        "A craft flown out along that line, past the Sun’s focus, would find a relay if one is there.",
        "A knock aimed at it would tell it we know it is there.",
      ],
    });
  // Our Relay Search's word: a dark craft holding on the line, gone quiet while we were near. 2026-10-30.
  const home = w.looked && { ra: (w.looked.ra + 12) % 24, dec: -w.looked.dec };
  if (w.relay && home && w.relay.at <= year)
    out.push({
      id: "watcher-relay",
      needs: "",
      at: tenths(w.relay.at),
      by: "Relay Search",
      title: "The relay",
      line: `A dark craft a few metres across, ${w.relay.au.toLocaleString("en-US")} AU out, holding exactly on the line the watcher’s mirror points. It fires faint thrusters to stay there as the Sun wobbles. It sent nothing while our craft was near.`,
      mind: `Nothing natural holds on one line like that. From there the Sun’s lens carries a weak beam a very long way, out the other side, toward ${sky(home)}. Whoever sent the watcher likely lies that way, at a distance we can’t tell. It saw us come, and went quiet.`,
      now: made,
      tells: [
        `Whoever sent the watcher likely lies toward ${sky(home)}, near or far.`,
        "It went quiet for us. Whatever it carries, it means to keep from us.",
      ],
    });
  // The first words it speaks to us, answer or warning, are first contact, and titled so. Playtest 2026-11-14.
  const first = Math.min(w.answer?.at ?? Infinity, w.warned ?? Infinity);
  // Its maker's answer to our first knock, one round trip later, settled 2026-10-31. Its timing gives the distance.
  if (w.answer && w.answer.at <= year)
    out.push({
      id: "watcher-answer",
      needs: "",
      at: tenths(w.answer.at),
      by: "A beam aimed at Earth",
      title: w.answer.at === first ? "First contact" : "An answer",
      ...(w.answer.at === first ? { contact: true as const } : {}),
      line: `A tight beam aimed at Earth from ${sky(w.answer)}, built to be read: a picture of Earth from far above at the hour we knocked, at Year ${yearText(w.answer.knock)}, and a voice. It speaks one short message in eleven of our languages, one after another, learned from our broadcasts: “Look, listen and speak as you like. Build at no other star.” Then pictures of Earth, one for every thousand years: ice sheets coming and going, the Sahara green and then dry, and in the last few thousand years, fields and cities.`,
      mind: `It came ${Math.round(2 * w.answer.ly).toLocaleString("en-US")} Years after our knock, so whoever sent the watcher lies about ${Math.round(w.answer.ly).toLocaleString("en-US")} light-years away, and has watched Earth for longer than we have kept records. It told us the one thing it cares about. It gave us nothing that makes us faster. What it would do if we built at another star, it didn’t say.`,
      now: made,
      tells: ["It has answered once. It may not answer again.", "What it asks is that we stay. Whether we do is ours to choose."],
    });
  // Our kill vehicle's hit, known within seconds as its signal stopped on it. 2026-11-13.
  if (w.wrecked !== undefined && w.wrecked <= year)
    out.push({
      id: "watcher-wrecked",
      needs: "",
      at: tenths(w.wrecked),
      by: "Our Interceptor",
      title: "Wrecked",
      line: `Our kill vehicle struck the watcher at Year ${yearText(w.wrecked)}. Its last pictures show the dark body close and growing, then its signal stops. Where it held, our telescopes see only a faint spray drifting apart.`,
      mind: `It sees nothing of us now. Whoever sent it will know it went dark once its reports stop arriving, a light-time from home${w.answer ? `, about ${Math.round(w.answer.ly).toLocaleString("en-US")} Years after the hit` : ""}, and will answer as it chooses. A mind that wishes us ill may treat us as if we had spread. A calmer one may send another, hidden better.`,
      now: made,
      tells: ["What comes back, and when, will tell us what kind of mind sent it.", "A seed we launch now goes unseen, unless another watcher has come."],
    });
  // A warning after the wreck: a second watcher, sent to replace the first, never found. 2026-11-13.
  if (w.warned !== undefined && w.wrecked !== undefined && w.warned > w.wrecked && w.warned <= year)
    out.push({
      id: "watcher-warning",
      needs: "",
      at: tenths(w.warned),
      by: "A laser from near the Sun",
      title: w.warned === first ? "First contact" : "Another watcher",
      ...(w.warned === first ? { contact: true as const } : {}),
      line: `As our seed left, at Year ${yearText(w.warned)}, a narrow laser reached Earth from near the Sun–Earth L4 or L5 point, carrying the same voice in eleven of our languages: “Look, listen and speak as you like. Build at no other star.”`,
      mind: "The watcher we wrecked has been replaced, by one hidden where no craft of ours can find a thing so small. Whoever sent it chose to keep watching rather than to strike. It saw our seed leave.",
      now: made,
      tells: ["What a second seed would draw now, it didn’t say. Its maker knows we struck once."],
    });
  // Its own warning at our first seed, when we had found it first. Playtest 2026-11-01. Where the laser came from, and
  // what we know of its maker by then: it said neither until a playtest, 2026-11-14, "can we tell where it came from?"
  else if (w.warned !== undefined && w.warned <= year) {
    const L = w.place.endsWith("L4") ? "L4" : "L5";
    const where = w.by === "moon search" ? `its place at the Moon’s ${L} point` : `its place on ${w.place}`;
    const maker =
      w.answer && w.answer.at <= w.warned
        ? `Its maker lies about ${Math.round(w.answer.ly).toLocaleString("en-US")} light-years away, toward ${sky(w.answer)}.`
        : w.relay && home && w.relay.at <= w.warned
          ? `Its maker likely lies toward ${sky(home)}, at a distance we can’t tell.`
          : "Who made it, and from how far, we don’t know yet.";
    out.push({
      id: "watcher-warning",
      needs: "",
      at: tenths(w.warned),
      by: "The watcher’s laser",
      title: w.warned === first ? "First contact" : "A warning",
      ...(w.warned === first ? { contact: true as const } : {}),
      line: `As our first seed left, at Year ${yearText(w.warned)}, the watcher fired a narrow laser at Earth from ${where}, carrying a voice. It speaks in eleven of our languages, learned from our broadcasts: “Look, listen and speak as you like. Build at no other star.”${w.answer && w.answer.at <= w.warned ? " The rule its maker’s answer gave, said again." : ""}`,
      mind: `It saw our seed leave and spoke at once. ${maker} Nothing has happened to our seed yet. What a second seed would draw, it didn’t say.`,
      now: made,
      tells: [
        "Our seed already gone can’t be called back. Whether we send another is ours to choose.",
        ...(w.looked && w.looked.at <= w.warned ? [] : ["Its mirror, seen up close, would show which way its reports go."]),
      ],
    });
  }
  // The ladder as we see it: seed probes gone silent, and a strike from beyond our system. 2026-10-30.
  if (w.seedsLost?.length && w.seedsLost[0].known <= year) {
    const gone = w.seedsLost.filter((l) => l.known <= year);
    out.push({
      id: "watcher-silence",
      needs: "",
      at: tenths(gone[0].known),
      by: "Our seed probes",
      // One or many, said as one or many: one lost read "Our seeds gone silent" and "each of them" until a playtest,
      // 2026-11-01.
      title: gone.length === 1 ? "A seed gone silent" : "Our seeds gone silent",
      // After we wrecked the watcher, when its maker took that as spreading. 2026-11-13.
      line: (() => {
        const why = w.blinded ? "after we wrecked the watcher" : "after we launched another seed past the watcher’s warning";
        return gone.length === 1
          ? `One of our seed probes went silent ${why}, at ${gone[0].star}. Its last word showed nothing coming.`
          : `${gone.length} of our seed probes went silent ${why}: ${gone.map((l) => l.star).join(", ")}. The last word from each showed nothing coming.`;
      })(),
      mind: w.blinded
        ? `Something cold and fast found ${gone.length === 1 ? "it" : "each of them"} at its star. We blinded the watcher, and whoever sent it answered as if we had spread. This reads as the answer.`
        : gone.length === 1
          ? "Something cold and fast found it at its star. We were warned, and we sent another. This reads as the answer."
          : "Something cold and fast found each of them at its star. We were warned, and we sent another. This reads as the answer.",
      now: made,
      tells: ["Each seed that copies itself on may draw more than silence."],
    });
  }
  if (w.struck && w.struck.lands <= year)
    out.push({
      id: "watcher-strike",
      needs: "",
      at: tenths(w.struck.lands),
      by: "Earth",
      title: "Struck from beyond",
      line: `Something struck Earth with about ${Math.round(w.struck.mt).toLocaleString("en-US")} Mt, moving at most of light’s speed. No rock moves that fast, and nothing saw it come.`,
      // Never who sent it: nothing we saw says. Playtest 2026-11-01.
      mind: "It came after our seed probes’ copies began launching seeds of their own. Nothing we saw says who sent it. Its timing reads as an answer to our growth, from far off, long after we started it.",
      now: made,
      tells: ["What we started then, we can’t call back."],
    });
  // A knock shows in the tenth it is sent, as the Year does.
  for (const [i, y] of knocks.entries())
    if (tenths(y) <= year)
      out.push({
        id: `watcher-knock-${i}`,
        needs: "",
        at: tenths(y),
        by: "Our knock",
        // Not "No answer" at once: an answer from its maker takes a round trip. Playtest 2026-11-01.
        title: "Knocked",
        // After we wrecked it, a knock reaches nothing. 2026-11-13.
        line: w.wrecked !== undefined && y >= w.wrecked
          ? `Our knock reached where it held, at Year ${yearText(y)}. Nothing is there now to hear it.`
          : `Our knock reached it within seconds of Year ${yearText(y)}. It made no answer itself, and held its place.`,
        mind: w.wrecked !== undefined && y >= w.wrecked
          ? "We wrecked it before this knock. Nothing there can pass it on."
          : "It answers on its own terms, if at all. If it passed word of our knock home, an answer would take as long as light takes there and back.",
        now: w.looked ? made : watcherLead(w).could.map((c) => c.odds),
        tells: ["Its silence tells us little. Something left to watch would watch, and wait."],
      });
  return out.sort((a, b) => a.at - b.at);
}

/** A rock coming, once found, as a lead: how wide, when it strikes, and whether our push turned it aside. Before
 *  2026-10-30 it showed only on Build, so a player skipping on Scan never saw it come or strike. */
export function rockLead(r: NonNullable<ReturnType<typeof rockAt>>): Lead {
  const year = (y: number) => `Year ${yearText(y)}`;
  const struck = r.state === "struck";
  const pushed = r.state === "pushed";
  return {
    slug: "a-rock-coming",
    at: [0, 0, 0],
    star: struck ? "The rock that struck" : pushed ? "The rock pushed aside" : "A rock coming",
    what: struck ? `A strike on Earth, ${year(r.strikes)}` : pushed ? "Turned aside in time" : `${r.m} m wide, striking ${year(r.strikes)}`,
    line: struck
      ? `A ${r.m} m rock struck Earth: ${harm(r.m)}.`
      : pushed
        ? `Our Rock Deflector pushed the ${r.m} m rock aside. It passes us by.`
        : `Found at ${year(r.found!)}. Our push must land by ${year(r.strikes - r.lead)}.`,
    ly: 0.5 * LY_SEC,
    ask: struck ? "What did the rock strike do to us?" : pushed ? "How did our push turn the rock aside?" : "Can we push the rock aside in time?",
    brief: struck
      ? `A rock ${r.m} m wide struck Earth at ${year(r.strikes)}: ${harm(r.m)}.${r.found === null ? " No survey saw it coming." : ` We found it at ${year(r.found)}, ${Math.round(r.strikes - r.found)} Years ahead.${r.lands === null ? " We built no Rock Deflector." : ` Our push landed at ${year(r.lands)}, too late.`}`}`
      : pushed
        ? `Our Rock Deflector pushed aside the ${r.m} m rock that would have struck at ${year(r.strikes)}, as DART pushed Dimorphos.`
        : `A rock ${r.m} m wide will strike Earth at ${year(r.strikes)}: ${harm(r.m)}. The Rock Deflector is open on Build. Its push must land by ${year(r.strikes - r.lead)}.`,
    facts: [
      ["Its width", `About ${r.m} m`],
      ...(r.found !== null ? [["Found", `${year(r.found)}, ${Math.round(r.strikes - r.found)} Years before it strikes`] as [string, string]] : []),
      [struck ? "Struck" : pushed ? "Would have struck" : "Strikes", year(r.strikes)],
      ...(!struck && !pushed ? [["Push lands by", year(r.strikes - r.lead)] as [string, string]] : []),
      ...(r.lands !== null ? [["Our push landed", `${year(r.lands)}${r.pushed ? ", in time" : ", too late"}`] as [string, string]] : []),
    ],
    could: [],
    tells: struck || pushed ? [] : ["Ten impactors of a tonne, as DART was, push it two Earth widths aside if they land in time."],
    art: { kind: "near", where: "rock", ...(struck ? { struck: true } : {}) },
  };
}

/** Proxima b's lead. Without what ground telescopes saw, as the Mind's static words have it, its least mass alone.
 *  With it, since 2026-10-31, audit 3.3: its true mass, tilt and brightness, and odds that follow them. Dim reads
 *  bare, bright reads air, between leans bare, and past 2 Earths it likely holds thick gas. Checked over 4,000 seeds:
 *  dim is bare rock 99.8% of the time, between 89%, and bright has air 99%. */
export function proximaLead(seen?: ProximaSeen): Lead {
  const gas = seen ? seen.mass > 2 : false;
  const read = !seen || gas ? "even" : seen.albedo < 0.17 ? "dim" : seen.albedo > 0.28 ? "bright" : "even";
  const odds = {
    bare: gas ? "unlikely" : read === "dim" ? "very likely" : read === "bright" ? "very unlikely" : "likely",
    air: gas ? "unlikely" : read === "dim" ? "unlikely" : read === "bright" ? "very likely" : "unlikely",
    gas: !seen ? "very unlikely" : gas ? "likely" : "almost no chance",
  } as const;
  const tone = gas ? "as a world of thick gas may" : read === "dim" ? "dim, as the Moon and Mercury are" : read === "bright" ? "bright, as cloud and air are" : "between the Moon’s dimness and cloud’s brightness";
  return {
    slug: "proxima-centauri",
    // Its light in Suns, as knowledge.ts's PROXIMA has it.
    lum: 0.00157,
    kms: CATALOG.speeds.seen.proxima,
    star: "Proxima Centauri",
    what: "A world next door",
    line: seen
      ? `Seen in the 2030s: ${seen.mass.toFixed(2)} Earths, in its star’s warm zone, and ${gas ? "heavy enough for thick gas" : tone}. Its air is unread.`
      : "About Earth’s mass, in its star’s warm zone. Its air is unread.",
    ly: 4.24,
    ask: "Could Proxima b keep its air?",
    brief: seen
      ? `The nearest world outside our solar system, warm enough for water. In the 2030s, telescopes on the ground caught its starlight reflected, and gave its tilt, its true mass, ${seen.mass.toFixed(2)} Earths, and how much light it reflects: about ${Math.round(seen.albedo * 100)}%, ${tone}. No one has read its air. The 15 m Mirror would barely reach it, and going there would show it whole.`
      : "The nearest world outside our solar system, about Earth’s mass and warm enough for water. Its star flares, and has likely stripped its air. No one has read its air. The 15 m Mirror would barely reach it, and going there would show it whole.",
    facts: [
      // Dated, as a find is: the science lane read the bare number as measured today. 2026-11-09.
      ["Mass", seen ? `${seen.mass.toFixed(2)} Earths, from its tilt seen in the 2030s` : "At least 1.06 Earths"],
      ...(seen
        ? ([
            ["Its tilt", `${Math.round(seen.tilt)}° from face on, seen in the 2030s`],
            ["It reflects", `About ${Math.round(seen.albedo * 100)}% of its starlight`],
          ] as [string, string][])
        : []),
      ["Its year", "11.2 days"],
      ["From its star", "24 light-seconds"],
      ["Warmth", "In the warm zone, with two thirds of Earth’s sunlight"],
      ["Its star", "A red dwarf that flares, the Sun’s nearest neighbor"],
      ["Felt by", "Pale Red Dot, 2016, and ESPRESSO since"],
      ...(seen ? ([["Seen by", "RISTRETTO and ANDES, in the 2030s"]] as [string, string][]) : []),
    ],
    could: [
      {
        what: "Bare rock",
        why: seen && read === "dim"
          ? "It reflects as little as the Moon and Mercury do, and its star’s flares strip small worlds this close."
          : "Its star’s flares and wind strip small worlds this close. Rocky worlds measured near red dwarfs have proved bare, and models keep air only on the largest and coolest.",
        odds: odds.bare,
      },
      {
        what: "Rock under air, maybe water",
        why: seen && read === "bright"
          ? "It reflects more than bare rock does, as clouds would. Bright ice or salt could do it too."
          : "Cooler worlds hold air better, and it gets only two thirds of Earth’s sunlight. At its mass, it would need luck.",
        odds: odds.air,
      },
      {
        what: "A small gas world",
        why: seen
          ? gas
            ? "Past about 2 Earths, worlds hold thick gas, and its tilt shows it is that heavy."
            : "Its tilt shows its true mass, too light to hold thick gas."
          : "Its tug gives only its least mass. If we see its orbit near face on, it could be several times heavier.",
        odds: odds.gas,
      },
    ],
    tells: [
      "No one has read its air. Oxygen takes long campaigns on the ground. The 15 m Mirror would barely reach it, for its oxygen and ozone, not its water.",
      "A flyby would see it whole: the two roads on Reach go there.",
    ],
    unknown: gas ? "What its thick air holds." : "Whether it kept any air, or is bare rock.",
    builds: [
      { name: "Infrared Telescope", how: "Opens the 15 m Mirror, which barely reaches it, for oxygen." },
      { name: "Laser Sail Array", how: "Sends sails past it at a fifth of light speed, to see it whole." },
    ],
    art: { kind: "orbit", a: 0.0485, e: 0, hz: [0.042, 0.082] },
    // On rock under air, life would still have to start.
    life: odds.air === "very likely" ? "unlikely" : "very unlikely",
  };
}

/** Betelgeuse's end, once its light reaches us: the one natural event that leads Scan. Real place, its distance as
 *  Joyce et al. 2020 have it, its brightness a type II supernova's at that distance, a sample. lib/game/natural.ts.
 *  2026-10-30. */
export function betelgeuseLead(at: number): Lead {
  const year = `Year ${yearText(at)}`;
  return {
    slug: "betelgeuse",
    at: [5.9195, 7.407, 548],
    star: "Betelgeuse",
    what: "A star exploded",
    line: `Orion’s shoulder blew apart at ${year}, as bright as a half Moon, seen by day.`,
    ly: 548,
    ask: "Betelgeuse exploded. What does it mean for us?",
    brief: `Betelgeuse, the red supergiant at Orion’s shoulder about 550 ly away, exploded. Its light reached us at ${year}, hours after its neutrinos. For a season it shone about as bright as a half Moon. It could be seen by day for more than a Year, and fades from our eyes after about 4 and leaves a neutron star, or a black hole. At 550 ly it harms nothing here: that takes a supernova within about 50.`,
    facts: [
      ["Its light reached us", year],
      ["How far", "About 550 ly, so it blew 550 Years before we saw it"],
      ["How bright", "About a half Moon’s, for a season. Seen by day for more than a Year"],
      ["Its neutrinos", "Caught by our detectors hours before its light"],
    ],
    could: [],
    tells: ["Orion has lost its shoulder. The shell it threw off will glow for thousands of Years."],
    art: { kind: "nova", ly: 548 },
  };
}

export function leadsOf(felt: FeltWorld[], holes: DarkMass[] = [], seeds: Visit[] = [], kept: string[] = [], minds?: MindsSeen, seen?: ProximaSeen, fields: FieldWorld[] = []): Lead[] {
  // Scan shows one black hole, the nearest, and any we have sent craft to. 2026-10-28.
  const dark = [...holes.map((h) => [h, false] as const), ...FAR.map((h) => [h, true] as const)];
  const nearest = dark.reduce<(typeof dark)[number] | undefined>((n, x) => (!n || x[0].d < n[0].d ? x : n), undefined);
  const shown = dark.filter((x) => x === nearest || kept.includes(x[0].name));
  // A star our seed probes reached with no lead of its own: Proxima or a felt world already has one.
  const own = new Set(["Proxima Centauri", ...felt.map((f) => f.star), ...fields.map((f) => f.star)]);
  const landed = seeds.filter((v) => v.by === "seed" && !v.sent && !own.has(v.star));
  const reached = landed.filter((v, i) => landed.findIndex((x) => x.star === v.star) === i);
  return withSystems(byDistance([
    // The nearest world, and the reason for the two roads on Reach: no telescope we have can read its air, so going is
    // how we would see it whole. Added 2026-10-19. Its warm zone is ours, from Kopparapu et al. 2013 at the star's
    // 0.0016 Suns. Its odds follow the shoreline the seed draws by, since 2026-10-22: likely bare rock. Since
    // 2026-10-31, audit 3.3: ground telescopes caught its reflected light in the 2030s, so this Earth knows its tilt,
    // its true mass and its brightness, and its odds follow them. lib/sim/proxima.ts proximaSeen.
    proximaLead(seen),
    {
      slug: "82-eridani",
      star: "82 Eridani",
      what: "A stretched orbit",
      line: "A heavy world, sometimes warm. Its air is unread.",
      ly: 19.7,
      ask: "What could 82 Eridani’s stretched orbit mean?",
      brief:
        "Most likely a gas world, swinging in and out of its star’s warm zone each year. Once the Infrared Telescope is built, about 3 days of looking would show if its air holds water.",
      facts: [
        ["Mass", "At least 5.8 Earths"],
        ["Its year", "648 days"],
        ["From its star", "6 to 16 light-minutes"],
        ["Warmth", "In and out of the warm zone each year"],
        ["Its star", "A Sun-like star, two thirds as bright"],
        ["Felt by", "HARPS and ESPRESSO, confirmed 2025"],
      ],
      could: [
        { what: "A small gas world", why: "At 5.8 Earths or more, most worlds we know keep thick hydrogen.", odds: "likely" },
        {
          what: "A heavy rocky world",
          why: "Thick air or deep seas could carry it through its hot and cold seasons.",
          odds: "unlikely",
        },
        {
          what: "Two worlds that look like one",
          why: "Two worlds in step can mimic one stretched orbit. Twenty years of measuring argue against it.",
          odds: "very unlikely",
        },
      ],
      tells: ["The Infrared Telescope can split it from its star and read its air. Water would show in about 3 days."],
      unknown: "Whether it is gas, and whether its air holds water.",
      builds: [{ name: "Infrared Telescope", how: "Splits it from its star, and shows water in about 3 days." }],
      art: { kind: "orbit", a: 1.354, e: 0.45, hz: [0.83, 1.45] },
      life: "very unlikely",
    },
    ...felt.map(feltLead),
    // Worlds our Far-Side Array found by their magnetic fields. 2026-11-11.
    ...fields.map(fieldLead),
    ...reached.map(seedLead),
    // The realistic premise's minds Earth has found, 2026-10-29.
    ...mindLeads(minds),
    // Luyten's Star, a star like any other lead, blue since 2026-11-01: amber gave it more weight than one star in
    // 1,600 deserves. It is the first of the stars we messaged whose reply window opens, and its page shows them all.
    {
      slug: "luytens-star",
      star: "Luyten’s Star",
      what: "We messaged it",
      line: `Our 2017 and 2018 messages reached it in 2030, so a reply could come at Year ${LUYTEN.at}. It is the first of ${WINDOWS.length} stars we messaged whose window opens.`,
      // Its window gone by, it read "a reply could come at Year 2.3" at Year 173. Playtest 2026-11-02.
      later: {
        year: LUYTEN.at,
        line: `Our 2017 and 2018 messages reached it in 2030, so a reply could have come from Year ${LUYTEN.at}. None has.`,
      },
      ly: 12.3,
      ask: "Could Luyten’s Star answer us?",
      brief: `We sent it two messages, in 2017 and 2018. A reply could reach us at Year ${LUYTEN.at}, the first window of the ${WINDOWS.length} stars we have messaged since 1983. ${PASSED.length} windows passed before Year 0, and nothing came. Our sky watch sees each star only minutes a day, so we could miss one.`,
      facts: [
        ["Its star", "A red dwarf"],
        ["Its worlds", "Two felt, one at the warm zone’s hot edge"],
        ["Our messages", "Sent October 2017 and May 2018, arrived 2030"],
        ["What we sent", "Prime numbers, a lesson in counting, geometry, radio and time, then 10-second pieces of music"],
        ["All we messaged", `${KNOCKS.length} messages to ${WINDOWS.length} stars, 1983 to 2018`],
        ["Windows passed", and(PASSED.map((w) => w.star))],
        ["Windows next", AHEAD.slice(0, 3).map((w) => `${w.star}, Year ${w.at}`).join(" · ")],
      ],
      could: [
        { what: "No one heard", why: "We guess about one star in 1,600 holds a mind, so likely not this one.", odds: "almost certain" },
        { what: "Someone heard, and stays quiet", why: "An old mind that heard would most likely stay quiet.", odds: "almost no chance" },
        { what: "A reply, as soon as one could come", why: `It would reach us at Year ${LUYTEN.at}.`, odds: "almost no chance" },
      ],
      tells: [
        "Listening as each window opens. Our sky watch sees each star about 10 minutes a day, and a knock lasts hours. The All-Sky Watch hears at any hour.",
      ],
      unknown: "Whether anyone heard us, and could answer.",
      builds: [
        { name: "All-Sky Watch", how: "Hears its window at any hour, not 10 minutes a day." },
        { name: "Deep Flash Watch", how: "Sees an answer sent as laser flashes." },
      ],
      art: { kind: "reply", windows: WINDOWS },
    },
    // Black holes last, the near ones found, then the nearest known, far past the region, which Earth knows at Year 0
    // (El-Badry et al. 2023, its position from Gaia's catalog). They hold the least for us to go on. 2026-11-01. A
    // landmark to aim at, 2026-10-26. Gaia BH3 left out, 2026-10-27: a second far hole told the intro nothing new.
    ...shown.filter(([, far]) => !far).map(([h]) => darkLead(h)),
    ...shown.filter(([, far]) => far).map(([h]) => darkLead(h, true)),
  ]));
}

/** Stars and their worlds first, nearest first, so Luyten’s Star sits at its 12 light-years among the worlds, not at
 *  the end. The rest keep their order after: our seeds, the minds found, and black holes last. 2026-11-01. */
function byDistance(leads: Lead[]): Lead[] {
  const star = (l: Lead) => l.art.kind === "orbit" || l.art.kind === "reply";
  return [...leads.filter(star).sort((a, b) => a.ly - b.ly), ...leads.filter((l) => !star(l))];
}

/** Readings by lead, from what the plan observes. None is open at Year 0 since Fomalhaut’s lead was dropped,
 *  2026-10-28. */
export const READINGS: Record<string, Reading[]> = {};

/** The readings that have landed on a lead by this Year, from what the plan observes. */
export function landed(slug: string, observe: string[] | undefined, year: number | null): Reading[] {
  if (year === null || !observe) return [];
  return (READINGS[slug] ?? []).filter((r) => observe.includes(r.needs) && year >= r.at);
}

/** Readings planned for a lead and not yet landed: what Scan waits on. 2026-11-02. */
export function due(slug: string, observe: string[] | undefined, year: number | null): Reading[] {
  if (year === null || !observe) return [];
  return (READINGS[slug] ?? []).filter((r) => observe.includes(r.needs) && year < r.at);
}

/** The Mind's words on Earth's named leads now, with what any reading found, for the Mind to judge from. */
export function describeLeads(observe: string[] | undefined, year: number | null, seen?: ProximaSeen): string {
  const lines = leadsOf([], [], [], [], undefined, seen).map((lead) => {
    const read = landed(lead.slug, observe, year).at(-1);
    const words = lead.could
      .map((c, i) => {
        const now = read?.now[i] ?? c.odds;
        return `${c.what}, ${now}${now === c.odds ? "" : ` (was ${c.odds})`}`;
      })
      .join("; ");
    const found = read ? ` Landed at Year ${yearText(read.at)}, by the ${read.by.toLowerCase()}: ${read.title}. ${read.line}` : "";
    const life = lifeOf(lead, landed(lead.slug, observe, year));
    return `- ${lead.star}, ${lead.what.toLowerCase()}.${found} Our words: ${words}.${life ? ` That something lives there: ${life}.` : ""}`;
  });
  return `Our words on the named leads, as the Scan tab shows them. Keep to them, and say so if a reading moved one:\n${lines.join("\n")}`;
}

/** A warm glow's odds as it refuses to fade, settled 2026-11-03. FU Orionis, the young star's eruption best measured,
 *  has lost about 1.2% of its light a Year since 1936 (Green et al. 2016), and a merger's dust stays bright for years to
 *  decades. So a glow that holds is news: at 1.2% a Year, an eruption would have lost about 30% by 30 Years, 70% by 100,
 *  and 97% by 300. The words are this project's judgment on those numbers. Each lands while it still shines, and our
 *  first warm glow gets its own reading once it is ranged, so it can't pass unmarked as it did in a playtest. */
const HOLDS: { age: number; title: string; line: string; mind: string; now: Odds[]; tells: string[] }[] = [
  {
    age: 30,
    title: "Thirty Years, not fading",
    line: "It shines as it did. By now a young star’s eruption would have lost about 30% of its light, going by FU Orionis.",
    mind: "It isn’t fading as an eruption should. Natural causes still lead, but we watch it more closely now.",
    now: ["roughly even", "unlikely", "unlikely"],
    tells: ["A century without fading would fit an eruption poorly, and a merger’s dust worse."],
  },
  {
    age: 100,
    title: "A century, not fading",
    line: "It still shines as it did. An eruption would have lost about 70% of its light by now, and a merger’s dust should have cooled.",
    mind: "Now we can’t say whether it was born or built. Nothing we know of would hold so long.",
    now: ["unlikely", "very unlikely", "roughly even"],
    tells: ["If it dims all at once, that points away from dust, which fades slowly."],
  },
  {
    age: 300,
    title: "Three centuries, not fading",
    line: "It still shines as it did. An eruption would have lost about 97% of its light by now.",
    mind: "We know nothing natural that does this. If someone built it, we are watching what they did thousands of Years ago.",
    now: ["very unlikely", "almost no chance", "likely"],
    tells: ["Only a closer reading of its light can say more, and it won’t shine forever."],
  },
];

/** What time alone has told us of a warm glow, by its place among those found. */
export function warmReadings(flashes: readonly MindsSeen["flashes"][number][], year: number | null): Record<string, Reading[]> {
  if (year === null) return {};
  return Object.fromEntries(
    flashes.flatMap((f, i): [string, Reading[]][] => {
      if (!f.range || f.ranged === undefined) return [];
      const by = "Warm Sky Watch";
      const first: Reading[] =
        i === 0
          ? [{
              id: "warm-first",
              needs: "",
              at: f.ranged,
              by: "Infrared Telescope",
              title: "Our first warm glow",
              line: `A warm light where none shone, ${f.range[0].toLocaleString("en-US")} to ${f.range[1].toLocaleString("en-US")} ly away.`,
              mind: "Most lights like this are natural. But a mind building around its star would look just like this, so we watch to see if it fades.",
              now: ["likely", "unlikely", "very unlikely"],
              tells: ["Natural glows fade. Each Year this one doesn’t, the odds shift."],
            }]
          : [];
      const held = HOLDS.flatMap(({ age, ...h }): Reading[] => {
        const at = Math.round((f.seen + age) * 10) / 10;
        // Once read, waiting tells us nothing more.
        if (f.read && f.read.saw !== "gone" && at > f.read.at) return [];
        // Nor once our Glow Imager has shown its shape.
        if (f.imaged && at > f.imaged.at) return [];
        return at <= year && (f.faded === undefined || f.faded > at) ? [{ ...h, id: `warm-${i + 1}-${age}`, needs: "", at, by }] : [];
      });
      const read = f.read;
      const by2 = "Infrared Telescope";
      const looked: Reading[] = !read
        ? []
        : read.saw === "smooth"
          ? [{
              id: `warm-${i + 1}-read`, needs: "", at: read.at, by: by2,
              title: "Its light: plain heat",
              line: "No bump at 10 microns, where silicate dust shows. Its light runs in one smooth curve, the heat of something about as warm as a planet.",
              // One smooth curve is not proof: carbon-rich dust shows no 10-micron bump either. It raises the odds to
              // about even, and a sentinel or an answer settles it. Playtest 2026-11-07, the Will's call.
              mind: "Silicate dust would show, and it doesn’t. Something solid may be catching a star’s light and shedding it as heat. Carbon dust can look this smooth too, so we can’t be sure yet.",
              now: ["unlikely", "very unlikely", "roughly even"],
              tells: ["A sentinel there would see what makes the heat. A message could ask, and an answer would take thousands of Years."],
            }]
          : read.saw === "dust"
            ? [{
                id: `warm-${i + 1}-read`, needs: "", at: read.at, by: by2,
                title: "Its light: dust",
                line: `A clear bump at 10 microns, the mark of silicate dust, ${read.kind === "merger" ? "thrown off by two stars merging" : "around a young star, as FU Orionis shows"}.`,
                mind: "It was dust all along. Now we know what the real thing wouldn’t look like.",
                now: read.kind === "merger" ? ["unlikely", "very likely", "almost no chance"] : ["very likely", "unlikely", "almost no chance"],
                tells: [],
                ruledOut: true,
              }]
            : [{
                id: `warm-${i + 1}-read`, needs: "", at: read.at, by: by2,
                title: "It faded first",
                line: "It dimmed before our reading was done, so we learned nothing of its light.",
                mind: "We were too slow, and it won’t shine again for us to try.",
                now: [],
                tells: [],
              }];
      // Its shape, from our Glow Imager: a made ring settles it, and a cloud rules it out, as dust in its light does.
      // 2026-11-11.
      const im = f.imaged;
      const shaped: Reading[] = !im
        ? []
        : im.saw === "ring"
          ? [{
              id: `warm-${i + 1}-imaged`, needs: "", at: im.at, by: "Glow Imager",
              title: "Its shape: a made ring",
              line: "A thin ring round a star, in one plane, even all the way round. Dust clumps and trails. This is set in place.",
              mind: "Someone built this. We are seeing what they made thousands of Years ago, and they have moved on since.",
              now: ["almost no chance", "almost no chance", "almost certain"],
              tells: ["A message could ask who they are. An answer would take thousands of Years."],
            }]
          : [{
              id: `warm-${i + 1}-imaged`, needs: "", at: im.at, by: "Glow Imager",
              title: "Its shape: a cloud",
              line: `A ragged cloud of dust, ${im.kind === "merger" ? "the shell two merging stars threw off" : "round a young star, as FU Orionis has"}.`,
              mind: "It is dust, in the shape dust takes. No one built it.",
              now: im.kind === "merger" ? ["unlikely", "very likely", "almost no chance"] : ["very likely", "unlikely", "almost no chance"],
              tells: [],
              ruledOut: true,
            }];
      const all = [...first, ...held, ...looked, ...shaped];
      return all.length ? [[`warm-glow-${i + 1}`, all]] : [];
    }),
  );
}

/** What each lead has had read of it by this Year, by its slug: what the plan observes, then what our telescopes have
 *  read of a felt world's air, the Infrared Telescope's, then the 15 m Mirror's, which reads Proxima b too, then what
 *  our craft saw up close, last, and what our Close Look saw of the watcher. Shared by Scan and the Mind, so both judge
 *  from the same. 2026-11-01. */
export function readingsOf(
  leads: Lead[],
  k: { felt?: FeltWorld[]; fields?: FieldWorld[]; proximaField?: FieldHeard; proxima?: Read; visits: Visit[]; watcher?: WatcherSeen; knocks: number[]; observe?: string[]; year: number | null; flashes?: Parameters<typeof warmReadings>[0] },
): Record<string, Reading[]> {
  const warm = warmReadings(k.flashes ?? [], k.year);
  const air: Record<string, Reading[]> = Object.fromEntries(
    (k.felt ?? []).map((f) => [
      f.star,
      [airReading(f), airReading(f, true), f.field ? fieldReading(f.star, f.field) : null].filter((r): r is Reading => r !== null).sort((a, b) => a.at - b.at),
    ]),
  );
  // A world our Far-Side Array found comes with its first reading, and Proxima b with what the array heard there.
  // And, where a telescope of ours can split it from its star, with what that telescope read. 2026-11-12.
  for (const f of k.fields ?? [])
    air[f.star] = [fieldReading(f.star, { has: true, at: f.at }, true), airReading(f), airReading(f, true)].filter((r): r is Reading => r !== null).sort((a, b) => a.at - b.at);
  air["Proxima Centauri"] = [...(k.proxima ? [nearestReading(k.proxima)] : []), ...(k.proximaField ? [fieldReading("Proxima Centauri", k.proximaField)] : [])];
  const watched = k.watcher && k.year !== null ? watcherReadings(k.watcher, k.knocks, k.year) : [];
  return Object.fromEntries(
    leads.map((l) => [
      l.slug,
      [
        ...landed(l.slug, k.observe, k.year),
        ...(air[l.star] ?? []),
        ...k.visits.filter((v) => v.star === l.star).map(visitReading),
        ...(l.slug === "small-dark-body" ? watched : []),
        ...(warm[l.slug] ?? []),
      ],
    ]),
  );
}
