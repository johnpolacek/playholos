import { YEAR_0 } from "@/lib/game/clock";
import { KNOCKS } from "@/lib/game/knocks";
import { FOMALHAUT } from "@/lib/game/plan";
import type { FeltWorld, Visit } from "@/lib/sim/types";
import { type System, SYSTEMS } from "./systems";

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
  /** What our Infrared Telescope has read of its air, drawn as its light. */
  air?: NonNullable<FeltWorld["read"]>;
  /** What a flyby's pictures showed, drawn as the world. */
  sight?: Visit["sight"];
}

/** What a lead's page draws: a world's orbit against its star's warm zone, Fomalhaut's belt, or a message's trip. */
export type Art =
  | { kind: "orbit"; a: number; e: number; hz?: [number, number] }
  | { kind: "clouds" }
  | { kind: "reply"; sent: number[]; ly: number };

export interface Lead {
  /** Its page's address. */
  slug: string;
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

/** How far out from its star a world sits in our sky, in arcseconds, from its distance from its star and from us. */
const reach = (aAU: number, ly: number) => aAU / (ly / 3.2616);

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
  // The infrared telescope splits a world from its star 56 thousandths of an arcsecond out in green light, and 104
  // at water's band.
  const r = reach(f.a, f.d);
  const tell =
    r >= 0.104
      ? "The Infrared Telescope can split it from its star and read its air: water first, then oxygen."
      : r >= 0.056
        ? "The Infrared Telescope can see it beside its star, but it sits too close in to read its water."
        : "It sits too close to its star for the Infrared Telescope to split. For now its tug is all we have.";
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
      ["From its star", `${f.a.toFixed(2)} AU`],
      ["Warmth", warmth(f.a, f.hz)],
      ["Its star", (f.kind && STARS[f.kind]) ?? "A star"],
      ["Felt by", `${f.by}, ${YEAR_0 + f.year}`],
    ],
    could: [
      { what: "A rocky world", why: `Most worlds under about 2 Earths are rock. Its tug gives only a floor.`, odds: rock },
      { what: "A small gas world", why: "Past about 2 Earths, most worlds we know keep thick hydrogen.", odds: gas },
      {
        what: "Not a world at all",
        why: "A star’s spots and churn can mimic a tug, until years more of measuring rule them out.",
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

/** What our Infrared Telescope has made of a felt world, as a reading on its lead, landing on the Year of its latest
 *  band, or of its first look. Each new band is a new reading. Seen beside its star, it is a world. Oxygen never says
 *  who lives there: a world whose makers died keeps theirs. 2026-10-22. */
export function airReading(f: FeltWorld): Reading | null {
  const read = f.read;
  if (!read) return null;
  const slug = slugOf(f.star);
  const at = Math.floor((read.at ?? 0) * 10 + 1e-9) / 10;
  const by = "Infrared Telescope";
  const seen: Odds[] = [rockOdds(f.minMass), gasOdds(f.minMass), "almost no chance"];
  if (!read.split)
    return {
      id: `${slug}-air-unsplit`,
      needs: "",
      at,
      by,
      air: read,
      title: "Too close to its star to split",
      line: "Our Infrared Telescope can’t split it from its star, so its air stays unread.",
      mind: "Its tug is still all we have. A wider mirror could split some worlds this one can’t.",
      now: [rockOdds(f.minMass), gasOdds(f.minMass), "unlikely"],
      tells: ["The 15 m Mirror, which the Infrared Telescope opens, would split worlds closer to their stars."],
    };
  const bands = (["water", "oxygen", "ozone"] as const).filter((b) => read[b] !== undefined);
  if (!read.readable)
    return {
      id: `${slug}-air-faint`,
      needs: "",
      at,
      by,
      air: read,
      title: "Seen beside its star",
      line: "Our Infrared Telescope sees it beside its star, but its air is too faint, or too close in, to read.",
      mind: "We see it, so it is a world, not a trick of its star. Its air is beyond this mirror.",
      now: seen,
      tells: ["A wider mirror would gather enough of its light to read its air."],
    };
  if (!bands.length)
    return {
      id: `${slug}-air-seen`,
      needs: "",
      at,
      by,
      air: read,
      title: "Seen, and reading its air",
      line: "Our Infrared Telescope sees it beside its star, and is reading its air now.",
      mind: "We see it, so it is a world, not a trick of its star. Its air comes next, a band at a time.",
      now: seen,
      tells: ["Water, oxygen and ozone each show as enough of its light adds up, the faintest last."],
    };
  const shows = bands.filter((b) => read[b]);
  const and = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
  const title = shows.length ? `${and(shows)} in its air` : `No ${and(bands)} in its air`;
  const left = 3 - bands.length;
  return {
    id: `${slug}-air-${bands.map((b) => `${b[0]}${read[b] ? 1 : 0}`).join("")}`,
    needs: "",
    at,
    by,
    air: read,
    title: title[0].toUpperCase() + title.slice(1),
    line: `Our Infrared Telescope read ${bands.map((b) => (read[b] ? b : `no ${b}`)).join(", ")}.${left ? " It reads on." : ""}`,
    mind: read.oxygen
      ? "Oxygen with water is what life made of Earth’s air. Oxygen can also build up without life, in thin dry air, so we weigh it against everything else we read. It can’t tell us who, if anyone, lives there."
      : read.water
        ? "Water, and no oxygen so far. A sea without life reads like this, and so does one whose life makes no oxygen, as Earth’s early microbes didn’t."
        : "No water in its air. Life as we know it needs water, so we would look elsewhere first.",
    now: seen,
    tells: left
      ? ["Our telescope reads on, for the bands still to come."]
      : ["The telescope has read all it can. Going there is how we would learn more: the roads on Reach."],
  };
}

/** What our sails or probe saw of Proxima b, as a reading on its lead, landing the Year their word reached us. The
 *  pictures settle what it is. A probe reads its air too. 2026-10-22. */
export function visitReading(v: Visit): Reading {
  const who = v.by === "sails" ? "Our sails’" : "Our probe’s";
  const SAW = {
    haze: ["A small gas world", "pictures show haze to the horizon, and no ground. It is heavier than its tug told us."],
    bare: ["Bare rock", "pictures show bare rock under a black sky. No cloud, no sea. Its star’s flares took its air."],
    seas: ["Cloud and seas", "pictures show cloud, and seas under it. Its air held, against its star’s flares."],
    green: ["Cloud, seas and forests", "pictures show cloud and seas, and its land dark green, in patches the size of forests."],
  } as const;
  const [title, saw] = SAW[v.sight];
  const air = v.air ? ` It read ${v.air.water ? "water" : "no water"} and ${v.air.oxygen ? "oxygen" : "no oxygen"} in its air.` : "";
  const MIND = {
    haze: "No ground to stand on. Seen near face on, a world weighs more than its tug says, and this one did.",
    bare: "As we feared, its star stripped it. Nothing we know of could live on its face.",
    seas: v.air?.oxygen
      ? "Oxygen with water, at our door. It could be life’s, or rock and starlight’s. It can’t tell us who, if anyone, lives there."
      : v.air
        ? "Water and no oxygen: empty seas, or life that makes none, as Earth’s early microbes made none."
        : "Air held, and seas. Pictures can’t tell an empty sea from one full of microbes. Its air would tell us more.",
    green: v.air?.oxygen
      ? "Forests, and oxygen in their air. Something there turns starlight into life, as our plants do."
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
    mind: MIND[v.sight],
    now,
    tells:
      v.by === "probe" || v.sight === "bare"
        ? ["To learn more we would have to stay. A Seed Ship carries a copy of our Mind to a star, to stay."]
        : ["A probe passing after them could read its air."],
    sight: v.sight,
  };
}

export function leadsOf(felt: FeltWorld[]): Lead[] {
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
        "The nearest world outside ours, about Earth’s mass and warm enough for water. Its star flares, and has likely stripped its air. It sits too close to its star for any telescope we have to split, so going there is how we would read it.",
      facts: [
        ["Mass", "At least 1.06 Earths"],
        ["Its year", "11.2 days"],
        ["From its star", "0.049 AU"],
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
          why: "Its tug gives only a floor. Seen near face on, it could be several times heavier.",
          odds: "very unlikely",
        },
      ],
      tells: [
        "It sits too close to its star for the Infrared Telescope to split. A flyby would see it whole: the two roads on Reach go there.",
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
        "Most likely a gas world, swinging in and out of its star’s warm zone each year. Once the Infrared Telescope is built, about 3 days would show if its air holds water.",
      facts: [
        ["Mass", "At least 5.8 Earths"],
        ["Its year", "648 days"],
        ["From its star", "0.74 to 1.96 AU"],
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
    {
      slug: "fomalhaut",
      star: "Fomalhaut",
      what: "Too many collisions",
      line: "Two dust clouds in 20 years, where we expected one.",
      ly: 25.1,
      ask: "Why are there so many collisions at Fomalhaut?",
      brief:
        "Two crashes in about 20 years, where we expected one in 100,000. Our best guess is one old breakup, still grinding itself down. Thirty seconds of the space telescope would show if the 2023 cloud has moved.",
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
      tells: ["Imaging Fomalhaut again, in thirty seconds of the space telescope. A crash’s cloud drifts outward and fades."],
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
      mind: "Chance can’t carry three. The likeliest answer is dull: one old breakup, still grinding itself down. A Year of watching would tell us if the clouds share one orbit.",
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
