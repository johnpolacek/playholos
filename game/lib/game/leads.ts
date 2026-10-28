import { lyOf, YEAR_0 } from "@/lib/game/clock";
import { KNOCKS } from "@/lib/game/knocks";
import { lightTime } from "@/lib/light";
import { FOMALHAUT } from "@/lib/game/plan";
import { BANDS, iwa, owa, WIDE } from "@/lib/sim/observing";
import type { DarkMass, FeltWorld, Gas, Glow, Read, Visit } from "@/lib/sim/types";
import { CATALOG } from "@/lib/sim/works";
import { type System, SYSTEMS } from "./systems";

/** How many generations of seed probes we allow, the last making no copies. */
const GENERATIONS = CATALOG.seedProbe.generations;

// Earth's real leads in 2040, each with its own page: the world next door, whose air we can't read from here, a world
// on a stretched orbit, every world the planet hunters felt by 2040, nearest first, Fomalhaut's collisions, and the
// first star that could answer our messages. Each page is a
// report as HOLOS_GAME_CONCEPT.md has it: what we measured, what it could be, each with the Mind's word, and what would
// tell us. Real numbers from HOLOS_RESEARCH.md, "Earth's leads, as of October 2026".

/** The Mind's seven words for how likely a thing is, after the scale US intelligence analysts use. Never numbers. */
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
}

/** What a lead's page draws: a world's orbit against its star's warm zone, Fomalhaut's belt, or a message's trip. */
export type Art =
  | { kind: "orbit"; a: number; e: number; hz?: [number, number] }
  | { kind: "clouds" }
  | { kind: "reply"; sent: number[]; ly: number }
  | { kind: "dark"; mass: number; ly: number }
  | { kind: "pair"; mass: number; ly: number; a: number; e: number; days: number }
  | { kind: "glow"; ly: number }
  | { kind: "seed"; sight: Visit["sight"] };

/** A black hole's lead: one drawn alone, or with a star going round it, as Gaia BH1. 2026-10-28. */
export const isHole = (art: Art) => art.kind === "dark" || art.kind === "pair";

export interface Lead {
  /** Its page's address. */
  slug: string;
  /** Where it is, for a lead the sky file lacks: right ascension in hours, declination, light-years. */
  at?: [number, number, number];
  star: string;
  what: string;
  line: string;
  ly: number;
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
}

/** The scene names Luyten's Star as the catalog does. */
export const skyId = (star: string) => star.replace("’", "'");

const slugOf = (star: string) =>
  star
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-");

/** Luyten's Star: our two messages, and the first Year a reply to each could reach us. */
const LUYTEN = KNOCKS.filter((k) => k[2] === "Luyten's Star");
const REPLIES = LUYTEN.map(([, sent, , ly]) => Math.round((sent + 2 * ly - YEAR_0) * 10) / 10);
const REPLY = Math.min(...REPLIES);

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
  return {
    slug: slugOf(f.star),
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

/** What one of our telescopes has made of a felt world, as a reading on its lead, landing on the Year of its latest
 *  band, or of its first look: the Infrared Telescope's, or `wide`, the 15 m Mirror's, since 2026-10-23. Each new band
 *  is a new reading. Seen beside its star, it is a world. A gas past a mirror's reach is said so, never read as
 *  missing. Oxygen never says who lives there: a world whose makers died keeps theirs. 2026-10-22. */
export function airReading(f: FeltWorld, wide = false): Reading | null {
  const read = wide ? f.wide : f.read;
  if (!read) return null;
  const slug = slugOf(f.star);
  const at = Math.floor((read.at ?? 0) * 10 + 1e-9) / 10;
  const by = wide ? "15 m Mirror" : "Infrared Telescope";
  const key = `${slug}-${wide ? "wide" : "air"}`;
  const seen: Odds[] = [rockOdds(f.minMass), gasOdds(f.minMass), "almost no chance"];
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
      mind: "Its tug is still all we have. A wider mirror could split some worlds this one can’t.",
      now: [rockOdds(f.minMass), gasOdds(f.minMass), "unlikely"],
      tells: [sees(f.a, f.d, WIDE).split ? "The 15 m Mirror, which the Infrared Telescope opens, would split it." : "It sits too close for any mirror we can build. Its tug is all we will have from here."],
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
  if (v.by === "lens") return lensReading(v);
  if (v.by === "sentinel") return sentinelReading(v);
  if (v.by === "seed") return seedReading(v);
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
    tells:
      v.by === "probe" || v.sight === "bare"
        ? ["To learn more we would have to stay. A Seed Ship takes a copy of our Mind to a star for good."]
        : ["A probe passing after them could read its air."],
    sight: v.sight,
  };
}

/** What a sentinel saw once it braked and stayed, as a reading on its lead: its face as a pass sees it, its air, and
 *  what only staying shows, who lives there or the ruins of those who did. It keeps watching. 2026-10-26. */
function sentinelReading(v: Visit): Reading {
  const SAW: Record<Visit["sight"], [string, string]> = {
    bare: ["Bare rock", "bare rock and craters, no cloud and no sea"],
    seas: ["Cloud and seas", "cloud, and seas under it"],
    green: ["Seas and forests", "cloud and seas, and forests on its land"],
    ice: ["Ice", "ice from pole to pole"],
    haze: ["A small gas world", "haze to the horizon, and no ground"],
    cities: ["Someone lives there", "seas and forests, fields, and cities lit at night"],
    dark: ["A black hole, weighed", "the black hole, dark, the stars behind it bent into a ring"],
    rocks: ["Only rock", "no warm world, only rock going round"],
  };
  if (v.sight === "dark") return darkReading(v);
  const [title, saw] = v.ruins ? ["Ruins", "forests over the ruins of cities, long empty"] : SAW[v.sight];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const mind = v.lives
    ? "They are real, and close enough to see. Our sentinel burned its flame toward them to stop, so they may know it is there. What it sends next is theirs to shape as much as ours."
    : v.ruins
      ? "Someone lived here, and is gone. Their cities stand under the forest. What ended them is the question now."
      : v.air?.oxygen
        ? "Oxygen and life up close, and no one who builds. It stays, and watches for anything that changes."
        : "No one lives there, and nothing it sees could. It stays, and watches.";
  return {
    id: `sentinel-${slugOf(v.star)}-${v.ruins ? "ruins" : v.sight}`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: "Our sentinel",
    title,
    line: `Our sentinel braked at ${v.star} and stays. It sees ${saw}.${air}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: v.sight,
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
    cities: ["Someone lives there", "a world of seas and forests, fields, and cities lit at night"],
    dark: ["Dark", "nothing"],
    rocks: ["Only rock", "no warm world, only asteroids and small moons going round"],
  };
  const [title, saw] = v.ruins ? ["Ruins", "a world of forests over the ruins of cities, long empty"] : SAW[v.sight];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const theirs = v.others?.length ? " Works not ours are already here: someone landed first." : "";
  const mind = v.lives
    ? "They are real, and close enough to see. Our probe braked on its sail, with no flame, so they may not know it is there. Its mining would show only to someone looking closely."
    : v.ruins
      ? "Someone lived here, and is gone. Their cities stand under the forest. Our probe stays among their ruins, and copies itself from their rock."
      : v.others?.length
        ? "We are not the first to come here. Whoever did may see our probe’s work, as we see theirs."
        : v.gen! >= GENERATIONS
          ? "It is the last of its line, as we chose. It stays, and watches."
          : "No one is here. It mines quietly, and will send copies on once it has built them.";
  return {
    id: `seed-${slugOf(v.star)}-${v.ruins ? "ruins" : v.sight}`,
    needs: "",
    at,
    by,
    title: v.others?.length && !v.lives && !v.ruins ? "Someone was here first" : title,
    line: `${by} braked at ${v.star} on its sail and stays. It sees ${saw}.${air}${theirs}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: v.sight,
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

/** What a sentinel found at a black hole: its spin, and the clock on its innermost stable orbit. 2026-10-26. */
function darkReading(v: Visit): Reading {
  if (v.came || v.lost) return watchReading(v);
  const slow = 1 / (v.clock ?? 1);
  return {
    id: `sentinel-${slugOf(v.star)}-dark`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: "Our sentinel",
    title: v.others?.some((o) => o.kind === "colony") ? "Someone is here" : v.others?.length ? "A craft not ours" : `Spinning at ${(v.spin ?? 0).toFixed(2)}`,
    line: `Our sentinel braked at ${v.star} and stays, out of reach of its tides. From the light and dust going round it, it spins at ${(v.spin ?? 0).toFixed(2)} of the most a hole can.`,
    mind: `A clock on its innermost stable orbit would run ${slow.toFixed(1)} times slower than ours. Matter fed to it would give back ${Math.round(100 * (1 - Math.sqrt(1 - 2 / (3 * isco(v.spin ?? 0)))))}% of its mass as light, where fusion gives under 1%. ${
      !v.others?.length
        ? "No one else is there that it can see."
        : v.others.some((o) => o.kind === "colony")
          ? v.others.some((o) => o.mode === "furnace")
            ? "Someone got here first, and feeds it. Their furnace is still too faint for any sky survey at home to see."
            : "Someone got here first, and lives dark in its shadow. From home we would never have known."
          : "A craft not ours already watches it. Someone found it before us."
    }`,
    now: ["almost certain", "almost no chance", "almost no chance"],
    tells: ["It keeps watching, and sends word of anything that changes."],
    sight: "dark",
  };
}
/** Later word from our sentinel at a black hole: someone braking in after it, or its end. 2026-10-26. */
function watchReading(v: Visit): Reading {
  const ship = v.others?.[0]?.kind === "colony";
  const at = Math.floor(v.home * 10 + 1e-9) / 10;
  if (v.lost)
    return {
      id: `sentinel-${slugOf(v.star)}-lost`,
      needs: "",
      at,
      by: "Our sentinel",
      title: "Gone silent",
      line: v.lost === "catch"
        ? `Our sentinel at ${v.star} went silent. Its last pictures show a craft not ours closing on it.`
        : `Our sentinel at ${v.star} went silent. Its last word shows nothing coming.`,
      mind: "Whoever watches this hole would rather we didn’t. It cost them nothing we could see, and it tells us what they think of being watched.",
      now: ["almost certain", "almost no chance", "almost no chance"],
      tells: ["We no longer see this hole. Another craft would have to go."],
      sight: "dark",
    };
  return {
    id: `sentinel-${slugOf(v.star)}-came-${Math.round(v.passed * 10)}`,
    needs: "",
    at,
    by: "Our sentinel",
    title: ship ? "A ship came to stay" : "Another craft came",
    line: ship
      ? `Our sentinel at ${v.star} saw a ship not ours, tens of thousands of tonnes, brake to a stop and stay. Its flame pointed back along its track to ${v.came}.`
      : `Our sentinel at ${v.star} saw a craft not ours brake to a stop, to watch the hole. Its flame pointed back along its track to ${v.came}.`,
    mind: ship
      ? `A ship that size carries a factory, or a Mind. Someone at ${v.came} means to stay. They have seen ours, as we saw theirs.`
      : `Someone at ${v.came} found this hole too. They have seen ours, as we saw theirs.`,
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

/** What a lens at the Sun's focus pictured of a felt world, as a reading on its lead: everything wider than its pixel.
 *  Cities and cleared fields say someone lives there. A world whose makers are gone looks merely alive. 2026-10-26. */
function lensReading(v: Visit): Reading {
  const px = `about ${Math.round(v.km ?? 0)} km a pixel`;
  const SAW: Record<Visit["sight"], [string, string, string]> = {
    bare: ["Bare rock", "bare rock and craters, no cloud and no sea.", "Nothing we know of could live on its face. Its tug was a world, and the world is stone."],
    seas: ["Cloud and seas", "cloud, and seas under it, and bare land.", "Air and water, and no forests wider than a pixel. Pictures can’t tell an empty sea from one full of microbes."],
    green: ["Seas and forests", "cloud and seas, and its land dark in patches the size of forests.", "Something there turns starlight into life, as our plants do. We see no fields and no cities. If anyone lived there, they are gone, or never cleared land."],
    ice: ["Ice", "ice from pole to pole, and no open sea.", "A frozen world. Any sea it has lies under the ice, out of sight."],
    haze: ["A small gas world", "haze to the horizon, and no ground.", "No ground to stand on."],
    cities: ["Cities", "seas and dark forests, and on the land, patterns no forest makes: fields cleared in squares, and cities.", "Someone lives there. Nothing natural we know of draws straight lines a pixel wide across a continent. They may not know we have seen them."],
    dark: ["Dark", "nothing.", "A lens pictures only what shines."],
    rocks: ["Only rock", "no world.", "A lens pictures only a world we have felt."],
  };
  const [title, saw, mind] = SAW[v.sight];
  return {
    id: `lens-${slugOf(v.star)}-${v.sight}`,
    needs: "",
    at: Math.floor(v.home * 10 + 1e-9) / 10,
    by: "Our lens",
    title,
    line: `Our lens at the Sun’s focus pictured its face, ${px}: ${saw}`,
    mind,
    now: v.sight === "haze" ? ["almost no chance", "almost certain", "almost no chance"] : ["almost certain", "almost no chance", "almost no chance"],
    tells: v.sight === "cities" ? ["Listening there, or a knock, would tell us more. A knock tells them we are here."] : ["To learn more we would have to go there."],
    sight: v.sight,
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
      ? `Gaia found it in ${YEAR_0 + h.found} by the star that goes round it, pulled by something ${h.mass} times the Sun's mass that gives off no light. It is the nearest black hole we know of, far past the stars around us. At a tenth of light speed a sentinel would take ${Math.round(h.d / 0.1).toLocaleString("en-US")} Years to get there.`
      : `${h.found < 0 ? `Gaia caught it in ${YEAR_0 + h.found}` : `Our Star Mapper caught it at Year ${Math.floor(h.found * 10) / 10}`}, as it passed in front of a star and shifted where the star seemed to be. Weighed by that shift, it is ${h.mass} times the Sun, and gives off no light we can see. Nothing that heavy shines so little but a black hole. We expected dozens within 100 light years, and had found none.`,
    facts: [
      ["Mass", `About ${h.mass} Suns`],
      ["Its ring", `${Math.round(ring)} thousandths of an arcsecond`],
      ["Its spin", "Unknown"],
      ["Found by", h.found < 0 ? `Gaia, ${YEAR_0 + h.found}` : `Our Star Mapper, Year ${Math.floor(h.found * 10) / 10}`],
      ...(far ? [["Beside it", "A Sun-like star, round it every 186 days"] as [string, string]] : []),
      // What a hole is worth, and what using it costs, 2026-10-26. Kerr numbers and the X-ray sky's limits, from
      // HOLOS_RESEARCH.md's "Black holes".
      ["What it offers", "A furnace: rock fed to it gives back 6% to 42% of its mass as light. Fusion gives under 1%. A dark place to put heat. A clock up to 10 times slow, close in"],
      ["What it costs", "A braking flame shows to anyone close. A furnace stays hidden until it grows past about a millionth of the Sun. A neighbor may get there first"],
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
      "A neighbor nearer to it could reach it first. If one does, its braking flame or its furnace may show us.",
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

/** A grey glow the Halo Survey saw at a star with no lead of its own, as a lead. Its color is the case: dust's falls
 *  steeply from 0.87 to 3 mm, an index of 2.4 to 3.1 (MacGregor et al. 2016), and a body near 12 K stays near 1.6.
 *  2026-10-26. */
function glowLead(g: Glow): Lead {
  return {
    slug: `glow-${slugOf(g.star)}`,
    ...(g.ra !== undefined ? { at: [g.ra, g.dec!, g.d] as [number, number, number] } : {}),
    star: g.star,
    what: "A grey glow",
    line: `Cold light round ${g.star} whose color fits no dust.`,
    ly: g.d,
    ask: `What is the grey glow at ${g.star}?`,
    brief: `Our Halo Survey saw a cold glow round ${g.star}, near 12 K, in light that left it ${Math.round(g.d)} Years ago. Dust glows redder the longer the wavelength. This stays grey, with no lines in it. A Mind computing far from its star, cold, would glow just so.`,
    facts: [
      ["Its glow", `About ${watts(g.watts)}, as its light shows it`],
      ["Its color", "Index about 1.6 from 0.87 to 3 mm. Dust is 2.4 to 3.1"],
      ["First seen", `Year ${Math.floor(g.seen * 10) / 10}, by our Halo Survey`],
      // An elder's glow holds level, and five Years of looks show it. 2026-10-28.
      ...(g.steady ? [["Since then", "Steady. Not growing, as nothing young is"] as [string, string]] : []),
    ],
    could: [
      { what: "A Mind computing cold", why: "Waste heat from collectors far out, at 5 to 28 K, glows grey and line-free, as this does.", odds: "likely" },
      { what: "Something natural we don't know", why: "Nothing known glows grey this cold round a star, but the sky has surprised us before.", odds: "unlikely" },
      { what: "Dust", why: "Its color doesn't fit any dust we have measured.", odds: "almost no chance" },
    ],
    tells: [
      g.steady
        ? "It hasn't brightened in all our looking. A young Mind doubles every decade or so. This one stopped growing long ago."
        : "It brightens if its computing grows. Watching it a decade would show the doubling.",
      "A sentinel could go and stay. A knock would tell them we are here.",
    ],
    art: { kind: "glow", ly: g.d },
  };
}

/** What the Halo Survey saw at a star, as a reading on its lead, landing the Year it first saw it. */
export function glowReading(g: Glow): Reading {
  return {
    id: `glow-${slugOf(g.star)}`,
    needs: "",
    at: Math.floor(g.seen * 10 + 1e-9) / 10,
    by: "Halo Survey",
    title: "A grey glow",
    line: `Our Halo Survey sees a compact cold glow round ${g.star}, about ${watts(g.watts)}, near 12 K. Its color stays grey from 0.87 to 3 mm, where dust reddens.`,
    mind: "Its color fits no dust. Cold computing far from a star would glow so. It says someone may think there, never who, or what they would make of us.",
    now: ["likely", "unlikely", "almost no chance"],
    tells: [g.steady ? "It hasn't brightened in all our looking. A young Mind doubles every decade or so. This one stopped growing long ago." : "It brightens if its computing grows. A decade of watching would show it."],
  };
}

export function leadsOf(felt: FeltWorld[], holes: DarkMass[] = [], glows: Glow[] = [], seeds: Visit[] = []): Lead[] {
  // A star our seed probes reached with no lead of its own: Proxima, a felt world, or a glow already has one.
  const own = new Set(["Proxima Centauri", ...felt.map((f) => f.star), ...glows.map((g) => g.star)]);
  const landed = seeds.filter((v) => v.by === "seed" && !v.sent && !own.has(v.star));
  const reached = landed.filter((v, i) => landed.findIndex((x) => x.star === v.star) === i);
  return withSystems([
    // The nearest world, and the reason for the two roads on Reach: no telescope we have can split it from its star, so
    // going is how we would read it. Added 2026-10-19. Its warm zone is ours, from Kopparapu et al. 2013 at the star's
    // 0.0016 Suns. Its odds follow the shoreline the seed draws by, since 2026-10-22: likely bare rock.
    {
      slug: "proxima-centauri",
      star: "Proxima Centauri",
      what: "A world next door",
      line: "About Earth’s mass, in its star’s warm zone. Its air is unread.",
      ly: 4.24,
      ask: "Could Proxima b keep its air?",
      brief:
        "The nearest world outside our solar system, about Earth’s mass and warm enough for water. Its star flares, and has likely stripped its air. It sits too close to its star for any telescope we have to split. The 15 m Mirror would barely reach it, and going there would show it whole.",
      facts: [
        ["Mass", "At least 1.06 Earths"],
        ["Its year", "11.2 days"],
        ["From its star", "24 light-seconds"],
        ["Warmth", "In the warm zone, with two thirds of Earth’s sunlight"],
        ["Its star", "A red dwarf that flares, the Sun’s nearest neighbor"],
        ["Felt by", "Pale Red Dot, 2016, and ESPRESSO since"],
      ],
      could: [
        {
          what: "Bare rock",
          why: "Its star’s flares and wind strip small worlds this close. Rocky worlds measured near red dwarfs have proved bare, and models keep air only on the largest and coolest.",
          odds: "likely",
        },
        {
          what: "Rock under air, maybe water",
          why: "Cooler worlds hold air better, and it gets only two thirds of Earth’s sunlight. At its mass, it would need luck.",
          odds: "unlikely",
        },
        {
          what: "A small gas world",
          why: "Its tug gives only its least mass. If we see its orbit near face on, it could be several times heavier.",
          odds: "very unlikely",
        },
      ],
      tells: [
        "It sits too close to its star for the Infrared Telescope to split. The 15 m Mirror would barely reach it, for its oxygen and ozone, not its water.",
        "A flyby would see it whole: the two roads on Reach go there.",
      ],
      art: { kind: "orbit", a: 0.0485, e: 0, hz: [0.042, 0.082] },
    },
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
      art: { kind: "orbit", a: 1.354, e: 0.45, hz: [0.83, 1.45] },
    },
    ...felt.map(feltLead),
    ...holes.map((h) => darkLead(h)),
    // A glow at a star with a lead already lands on that lead as a reading.
    ...glows.filter((g) => !felt.some((f) => f.star === g.star)).map(glowLead),
    ...reached.map(seedLead),
    // The nearest known black hole, far past the region, which Earth knows at Year 0. El-Badry et al. 2023. Its
    // position from Gaia's catalog. A landmark to aim at, 2026-10-26. Gaia BH3 left out, 2026-10-27: a second far hole
    // told the intro nothing new.
    ...FAR.map((h) => darkLead(h, true)),
    {
      slug: "fomalhaut",
      star: "Fomalhaut",
      what: "Too many collisions",
      line: "Two dust clouds in 20 years. We expected one in 100,000 years.",
      ly: 25.1,
      ask: "Why are there so many collisions at Fomalhaut?",
      brief:
        "Two crashes in about 20 years, where we expected one in 100,000 years. Our best guess is one old breakup, still grinding itself down. Thirty seconds on the space telescope would show if the 2023 cloud has moved.",
      facts: [
        ["Its star", "A young white star, 440 million years old"],
        ["First cloud", "Seen in 2004, spreading by 2013"],
        ["Second cloud", "Seen in 2023, close to the first"],
        ["Expected", "One such crash in 100,000 years or more"],
      ],
      // The four explanations and their words are the first mock's, so its first reading can move them.
      could: [
        {
          what: "Rubble from one old breakup",
          why: "One large rock, broken long ago, could keep its pieces crashing for a while.",
          odds: "roughly even",
        },
        {
          what: "A hidden world stirring the belt",
          why: "Its pull could send rocks across each other’s paths.",
          odds: "very unlikely",
        },
        { what: "Chance", why: "Two rare crashes, close together, by luck alone.", odds: "unlikely" },
        {
          what: "Something moving rocks",
          why: "A new point of light could be something made. Nothing says so.",
          odds: "almost no chance",
        },
      ],
      tells: ["Imaging Fomalhaut again, with thirty seconds on the space telescope. A crash’s cloud drifts outward and fades."],
      art: { kind: "clouds" },
    },
    {
      slug: "luytens-star",
      star: "Luyten’s Star",
      what: "A reply could come",
      line: `To our 2017 message, as soon as Year ${REPLY}, about ${Math.round(REPLY * 5)} minutes after we begin.`,
      ly: 12.3,
      ask: "Could Luyten’s Star answer us?",
      brief: `We sent it two messages, in 2017 and 2018. If anyone answered at once, the first reply reaches us at Year ${REPLY}. Almost certainly no one did, but our sky watch sees that star only 10 minutes a day.`,
      reply: true,
      facts: [
        ["Its star", "A red dwarf"],
        ["Its worlds", "Two felt, one in the warm zone"],
        ["Our messages", "Sent October 2017 and May 2018"],
        ["They arrived", "2030"],
        ["Earliest replies", REPLIES.map((y) => `Year ${y}`).join(" and ")],
      ],
      could: [
        { what: "No one heard", why: "No search has found anyone, anywhere.", odds: "almost certain" },
        { what: "Someone heard, and stays quiet", why: "Hearing is not answering.", odds: "almost no chance" },
        { what: "A reply, as soon as one could come", why: `It would reach us at Year ${REPLY}.`, odds: "almost no chance" },
      ],
      tells: [
        "Listening as each window opens. Our sky watch sees its star about 10 minutes a day, and a knock lasts hours. The All-Sky Watch hears at any hour.",
      ],
      art: { kind: "reply", sent: LUYTEN.map(([, sent]) => sent), ly: LUYTEN[0][3] },
    },
  ]);
}

/**
 * Readings by lead. Only Fomalhaut's so far: the one observation open at Year 0. It makes the lead stranger, as the
 * concept has it. The third cloud is the game's, not real: the first two were found in 2004 and 2023.
 */
export const READINGS: Record<string, Reading[]> = {
  fomalhaut: [
    {
      id: "fomalhaut-third-cloud",
      needs: FOMALHAUT.name,
      at: FOMALHAUT.lands,
      by: "Space telescope",
      title: "A third cloud",
      line: "The cloud seen in 2023 has spread and faded, as dust does. A new one sits beside it. Three crashes in 36 years, where we expected one in 100,000.",
      mind: "Chance can’t explain three. The likeliest answer is dull: one old breakup, still grinding itself down. A Year of watching would tell us if the clouds share one orbit.",
      now: ["likely", "unlikely", "almost no chance", "very unlikely"],
      tells: [
        "Watching Fomalhaut through a Year, monthly, with the space telescope. If the clouds share one orbit, one breakup made them all.",
      ],
    },
  ],
};

/** The readings that have landed on a lead by this Year, from what the plan observes. */
export function landed(slug: string, observe: string[] | undefined, year: number | null): Reading[] {
  if (year === null || !observe) return [];
  return (READINGS[slug] ?? []).filter((r) => observe.includes(r.needs) && year >= r.at);
}

/** The Mind's words on Earth's named leads now, with what any reading found, for the Mind to judge from. */
export function describeLeads(observe: string[] | undefined, year: number | null): string {
  const lines = leadsOf([]).map((lead) => {
    const read = landed(lead.slug, observe, year).at(-1);
    const words = lead.could
      .map((c, i) => {
        const now = read?.now[i] ?? c.odds;
        return `${c.what}, ${now}${now === c.odds ? "" : ` (was ${c.odds})`}`;
      })
      .join("; ");
    const found = read ? ` Landed at Year ${read.at}, by the ${read.by.toLowerCase()}: ${read.title}. ${read.line}` : "";
    return `- ${lead.star}, ${lead.what.toLowerCase()}.${found} Our words: ${words}.`;
  });
  return `Our words on the named leads, as the Scan tab shows them. Keep to them, and say so if a reading moved one:\n${lines.join("\n")}`;
}
