// Planning, on the Build tab: what Earth can start at Year 0. The builds are the first hour's works from
// data/works.json, paced by lib/sim/works.ts from the player's own order, so every date on the screen is the game's.
// The Mind names what it would start with only when asked, 2026-10-19, and never queues anything itself.
import { KNOCKS } from "./knocks";
import { YEAR_0 } from "./clock";
import type { Plan } from "./types";
import { CATALOG, centers, pace, type Order } from "@/lib/sim/works";

/** What a build does, which gives it its color: listening, thinking, seeing, lifting, reaching or keeping us. */
export type Does = "listen" | "think" | "see" | "lift" | "reach" | "keep";

export interface Build {
  name: string;
  /** What it gives us, in a line. */
  what: string;
  does: Does;
  /** Matter it takes from the 20 kt we hold, if any worth naming. */
  kt?: number;
}

export const BUILDS: Build[] = [
  { name: "All-Sky Watch", what: "Hears a knock or a broadcast from anywhere, at any hour.", does: "listen" },
  { name: "Deep Flash Watch", what: "Sees knocks sent as laser flashes, which no radio watch hears.", does: "listen" },
  { name: "Thought Fields", what: "Half again as much compute each Year, until the grid is full.", does: "think" },
  { name: "Infrared Telescope", what: "Reads the air of the nearest worlds.", does: "see" },
  { name: "Launch Complex", what: "Doubles what we lift to orbit.", does: "lift" },
  { name: "Orbital Yard", what: "Builds in orbit a quarter faster.", kt: 1, does: "lift" },
  { name: "Moon Vault", what: "A second home for our Mind, in the Moon’s rock.", kt: 10, does: "keep" },
  // The two roads to the nearest star, open at Year 0 since 2026-10-18. Even last in line, the probe yard's large want
  // takes the compute that would have pushed the builds before it, and slows them by Years.
  { name: "Laser Sail Array", what: "Light from the ground, to push sails to a fifth of light speed.", does: "reach" },
  {
    name: "Probe Yard",
    what: "Builds and fuels probes in orbit. The first flies 12 Years after.",
    kt: 10,
    does: "reach",
  },
  // The longest roads: what a craft needs to stay at a star, and a copy of our Mind to send. The catalog had them, and
  // Reach's locked ways now name them, so they can be queued at Year 0 too, last in line, 2026-10-19. Paces settled
  // 2026-10-15 in HOLOS_GAME_CONCEPT.md: a drive 30 Years at standard pace, a seed ship 18, about 1,500 t. Both are
  // joined in orbit, a quarter faster once the yard is done, the drive since 2026-10-22.
  { name: "Deuterium Works", what: "Draws heavy hydrogen from water, to fuel fusion.", does: "reach" },
  { name: "Fusion Drive", what: "An engine that lets a craft slow at a star, and stay.", does: "reach" },
  { name: "Seed Ship", what: "Carries a copy of our Mind to a star, to stay.", kt: 1.5, does: "reach" },
];

/** A build that waits on another, and opens once that one is done. */
export interface Later extends Build {
  after: string;
}

/** What our builds open: works too large or too far along to start at Year 0. The game's model has paced them since
 *  the first mocks. Each waits on the build it grows from: a larger mirror on the first telescope, the Moon's mass
 *  driver on the lift that carries it there, the foundry on the yard, belt mining on the yard's probes, and what needs
 *  megatonnes of rock on the driver that throws it, as the model has it. Ground solar follows Thought Fields, whose
 *  data centers fill the grid. Lists show only what we can start, each with what it opens. Chosen 2026-10-20. */
export const LATER: Later[] = [
  { name: "Ground Solar", what: "A fifth more energy, from sunlight on the ground.", does: "think", after: "Thought Fields" },
  {
    name: "15 m Mirror",
    what: "A telescope more than twice as wide, to read the air the first can’t.",
    does: "see",
    after: "Infrared Telescope",
  },
  { name: "Mass Driver", what: "Throws Moon rock to orbit, 600 kt a Year.", kt: 1, does: "lift", after: "Launch Complex" },
  { name: "Orbital Foundry", what: "Makes parts from rock, in orbit.", kt: 1, does: "lift", after: "Orbital Yard" },
  { name: "Belt Mining", what: "Brings asteroid rock home, 120 kt a Year.", does: "lift", after: "Probe Yard" },
  {
    name: "Far-Side Array",
    what: "Hears the faint hum of a world’s everyday radio, from the Moon’s far side.",
    does: "listen",
    after: "Mass Driver",
  },
  {
    name: "Power from Orbit",
    what: "A fifth more energy, from sunlight caught in orbit.",
    does: "think",
    after: "Mass Driver",
  },
];

/** What a build opens once it is done. */
export const opens = (name: string) => LATER.filter((b) => b.after === name);

/** Any build by its name, whether we can start it or it waits. */
export const buildOf = (name: string): Build | Later | undefined =>
  BUILDS.find((b) => b.name === name) ?? LATER.find((b) => b.name === name);

/** What we could start with, walked one at a time on Build: all but the longest roads' builds, which pay only once
 *  a drive is coming, and the Moon Vault, which can come later. They wait in the list. Chosen 2026-10-19,
 *  the vault left out 2026-10-20. */
export const STARTS = BUILDS.filter(
  (b) => !["Moon Vault", "Deuterium Works", "Fusion Drive", "Seed Ship"].includes(b.name),
);

/** What the Mind says of each build, on its page and in the walk. */
export const SAYS: Record<string, string> = {
  "All-Sky Watch":
    "Our sky watch sees each star about ten minutes a day, and a knock lasts hours. This would hear the whole sky, all the time.",
  "Deep Flash Watch":
    "A laser knock could last a billionth of a second. Only a watch built for flashes that short would ever see one.",
  "Thought Fields":
    "The fabs fill a campus a Year, each adding half again to our compute, until compute draws the whole grid. Every build goes faster as they come, and so do our studies.",
  "Infrared Telescope":
    "It would read the air of the nearest worlds. Oxygen and methane together would be hard to explain without life.",
  "Launch Complex":
    "It doubles what we lift to orbit. Nothing we could start now waits on lift, but the Mass Driver can’t reach the Moon without it.",
  "Orbital Yard": "It builds in orbit a quarter faster. It pays most if we mean to build a lot up there.",
  "Moon Vault":
    "Nothing we know of threatens Earth yet. This is a copy of us, out of reach of anything that hits Earth, for if something does. It takes half the matter we hold in orbit.",
  "Laser Sail Array":
    "Our soonest road to the nearest star, and it takes no matter. Last in line, it barely slows what is before it.",
  "Probe Yard":
    "It builds and fuels probes in orbit. Its want is large: even last in line, it slows every build before it.",
  "Deuterium Works":
    "Fusion burns heavy hydrogen, and the sea holds plenty: about one hydrogen atom in 6,400. It takes little, and pays only once a drive is coming.",
  "Fusion Drive":
    "No one has flown one yet. It is how a craft slows at a star and stays, where a flyby passes in minutes. Thirty Years at standard pace, a quarter less once the yard is done, for the longest roads.",
  "Seed Ship":
    "A copy of our Mind that goes and stays, about 1,500 tonnes with its seed. It flies only on a Fusion Drive, fed by the Deuterium Works, so it leaves once both are done.",
  "Ground Solar":
    "Our data centers will fill the grid. This adds a fifth more energy in 10 Years, building solar five times as fast as we do today.",
  "15 m Mirror":
    "Our first telescope could read smog at about 1 living world in 12. A 15 m mirror would read it at about 3 in 4.",
  "Mass Driver":
    "Megatonnes can’t come from Earth: 10 Mt is 180 Years of lift. This throws 600 kt of Moon rock a Year, by O’Neill’s estimate. No one has priced one.",
  "Orbital Foundry": "The yard assembles what we lift. The foundry makes parts from rock up there, so we lift less.",
  "Belt Mining":
    "Survey probes first, then a mining fleet. Nothing like it has flown. It brings 120 kt of rock a Year, and the driver doesn’t need it.",
  "Far-Side Array":
    "The Moon’s far side is the quietest place we can reach. An array there hears the everyday radio no telescope on Earth can. It grows in fifths, and the first already hears the nearest worlds.",
  "Power from Orbit":
    "A fifth more energy, from sunlight caught above the weather and beamed down. It takes 10 Mt of rock, so it comes only as fast as rock does.",
};

/** A build's page on the Build tab, by its name. */
export const buildSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** The one observation open at Year 0: thirty seconds of the space telescope. */
export const FOMALHAUT = { name: "Image Fomalhaut again", what: "Has the new cloud moved?", lands: 0.1 };

export const EMPTY: Plan = { builds: [], observe: [] };

/** The charter's strongest lean: which dial, and whether it leans low. */
export function lean(dials: number[]) {
  const i = dials.reduce((best, v, k) => (Math.abs(v - 50) > Math.abs(dials[best] - 50) ? k : best), 0);
  return { i, low: dials[i] < 50 };
}

/** A build's name in the pace and its worlds, which keep the names they were first given: in sentence case, Thought
 *  Fields as a data center, and two by their first long names. */
const PACED = Object.fromEntries(Object.keys(CATALOG.works).map((k) => [k.toLowerCase(), k]));
const FIRST: Record<string, string> = {
  "Thought Fields": "Data center",
  "15 m Mirror": "A 15 m mirror",
  "Far-Side Array": "Far-side array, one fifth",
};
export const pacedName = (name: string) => FIRST[name] ?? PACED[name.toLowerCase()] ?? name;

/** How long a build takes at the pace its want buys, in Years, or, if rock paces it, the rock it waits on, in kt. A
 *  work built in parts takes all of them. */
export function takes(name: string): { years?: number; rock?: number } {
  const w = CATALOG.works[pacedName(name)];
  if (!w) return {};
  if (w.rock !== undefined) return { rock: w.rock };
  return { years: w.years === undefined ? undefined : w.years * (w.copies?.[0] ?? 1) };
}

/** The plan as the player's orders, at Year 0 and then in play, and the compute its observation sets aside. The
 *  Mind's studies keep the pace's own tenth. Thought Fields is a standing order since 2026-10-20: the fabs fill a
 *  campus a Year until the grid is full, as HOLOS_GAME_CONCEPT.md's Growing compute has it. What a done build opens
 *  waits for our order, so nothing joins the line on its own, 2026-10-22. */
export function ordersOf(plan: Plan) {
  const orders: Order[] = plan.builds.map((b) =>
    b === "Thought Fields" ? { y: 0, standing: "Data center" } : { y: 0, begin: pacedName(b) },
  );
  for (const o of plan.later ?? []) orders.push({ y: o.y, begin: pacedName(o.name) });
  const aside = plan.observe.length ? ([[0, FOMALHAUT.lands, 0.05]] as const) : [];
  return { orders, aside, follow: false };
}

/** Every build in our order: those from Year 0, then those ordered in play. */
export const ordered = (plan: Plan) => [...plan.builds, ...(plan.later ?? []).map((o) => o.name)];

/** A build ordered in play, at the Year we order it, last in line. */
export const orderLater = (name: string, y: number) => (p: Plan): Plan => ({
  ...p,
  later: [...(p.later ?? []), { name, y }],
});

/** Our order without a build. */
const without = (plan: Plan, name: string): Plan => ({
  ...plan,
  builds: plan.builds.filter((b) => b !== name),
  later: plan.later?.filter((o) => o.name !== name),
});

/** When the pace has a work done: once, or for a work built in copies, its last. */
function doneOf(p: ReturnType<typeof pace>, name: string) {
  const work = pacedName(name);
  const copies = CATALOG.works[work]?.copies;
  return p.done[copies ? `${copies[1]} ${copies[0]}` : work] ?? null;
}

/** What a build can't go without. A Seed Ship flies only on a Fusion Drive, fed by the Deuterium Works. It may be built
 *  first, as in the first seed ship's mock, but the drive sets the launch. Since 2026-10-20 it is queued only once both
 *  are in our order. */
export const NEEDS: Record<string, string[]> = { "Seed Ship": ["Fusion Drive", "Deuterium Works"] };

/** What a build needs that our order lacks. */
export const lacks = (plan: Plan, name: string) => (NEEDS[name] ?? []).filter((n) => !plan.builds.includes(n));

/** Builds as a line says them: the Fusion Drive and the Deuterium Works. */
export const needs = (names: string[]) => names.map((n) => `the ${n}`).join(" and ");

/** When each queued build is done, in Years from Year 0, with this game's compute. Null past 40 Years. Thought Fields
 *  is done once its campuses fill the grid. A build that needs others is done once they all are, and never if our
 *  order lacks one. */
export function schedule(plan: Plan, scale: number): Record<string, number | null> {
  const { orders, ...opts } = ordersOf(plan);
  const p = pace(orders, 40, { scale, ...opts });
  const done: Record<string, number | null> = Object.fromEntries(
    ordered(plan).map((b) => [b, b === "Thought Fields" ? (p.dataCenters[centers(scale) - 1] ?? null) : doneOf(p, b)]),
  );
  for (const b of plan.builds)
    for (const n of NEEDS[b] ?? []) done[b] = done[b] == null || done[n] == null ? null : Math.max(done[b]!, done[n]!);
  return done;
}

/** What a build does to the rest of our order: when it is done, and the queued build it delays most and speeds up
 *  most, each by Years, against our order without it. Each work in line gets its want in turn before any is pushed
 *  past it, so a work with a large want, even last, takes the push from those before it, and some speed others, as
 *  the Orbital Yard does what is built in orbit. Past Year 40 counts as Year 40. Null under a tenth of a Year. One not
 *  in our order is added last at Year 0, or in play at Year `y`. */
export function moves(plan: Plan, scale: number, work: string, y: number | null = null) {
  const others = ordered(plan).filter((b) => b !== work);
  const less = schedule(without(plan, work), scale);
  const more = ordered(plan).includes(work)
    ? plan
    : y === null
      ? { ...plan, builds: [...plan.builds, work] }
      : orderLater(work, y)(plan);
  const within = schedule(more, scale);
  let late: { name: string; by: number } | null = null;
  let soon: { name: string; by: number } | null = null;
  for (const name of others) {
    const d = (within[name] ?? 40) - (less[name] ?? 40);
    if (d >= 0.1 && (!late || d > late.by)) late = { name, by: d };
    if (d <= -0.1 && (!soon || -d > soon.by)) soon = { name, by: -d };
  }
  return { at: within[work], late, soon };
}

/** The matter we hold in orbit at Year 0, what spare lift brings each Year, and what the Launch Complex adds once
 *  done, in kt: HOLOS_GAME_CONCEPT.md's. */
export const HELD = 20;
export const SPARE_LIFT = 15;
export const LAUNCH_LIFT = 40;

/** The matter we hold in orbit at a Year, in kt: the 20 at Year 0 and what spare lift has brought since, 40 kt a Year
 *  more once the Launch Complex is done, less what our builds take, spent as each begins at Year 0. Lift moves no
 *  date, so matter piles up. Rock from the Moon and the belt comes later. 2026-10-20. */
function held(plan: Plan, done: Record<string, number | null>, year: number) {
  const launch = plan.builds.includes("Launch Complex") ? done["Launch Complex"] : null;
  // Builds from Year 0 spend theirs then, and those ordered in play when ordered: the driver's and the foundry's
  // machines, landed from Earth, since 2026-10-22.
  const spent =
    plan.builds.reduce((s, b) => s + (buildOf(b)?.kt ?? 0), 0) +
    (plan.later ?? []).reduce((s, o) => s + (o.y <= year ? (buildOf(o.name)?.kt ?? 0) : 0), 0);
  const lifted = SPARE_LIFT * year + (launch == null ? 0 : LAUNCH_LIFT * Math.max(0, year - launch));
  return HELD + lifted + rockAt(plan, done, year) - spent;
}

/** Rock come in by a Year, in kt, from the Moon's driver and the belt once each is done, less what Power from Orbit
 *  takes as it comes, until it holds the megatonnes it waits on. 2026-10-22. */
function rockAt(plan: Plan, done: Record<string, number | null>, year: number) {
  const come = Object.entries(CATALOG.rock).reduce((kt, [work, rate]) => {
    const at = done[NAMED[work] ?? work];
    return kt + (at == null ? 0 : rate * Math.max(0, year - at));
  }, 0);
  const needs = ordered(plan).reduce((kt, b) => kt + (takes(b).rock ?? 0), 0);
  return come - Math.min(come, needs);
}
export const matterAt = (plan: Plan, done: Record<string, number | null>, year: number) =>
  Math.max(0, held(plan, done, year));

/** What our builds take past what we hold at a Year, in kt, until lift brings it. */
export const shortAt = (plan: Plan, done: Record<string, number | null>, year: number) =>
  Math.max(0, -held(plan, done, year));

/** Matter as the top bar shows it: 20 kt, 514 kt, 1.2 Mt. */
export const kt = (n: number) => (n < 1000 ? `${Math.floor(n)} kt` : `${(Math.floor(n / 100) / 10).toFixed(1)} Mt`);

/** A build's matter, as its line says it: its share of the 20 kt we hold, or, once the rest of our order holds all 20,
 *  how soon spare lift brings what is short. Matter piles up from lift, so it moves no date. */
export function matter(plan: Plan, name: string) {
  const kt = buildOf(name)?.kt;
  if (!kt) return "";
  // One ordered in play takes it from what lift has brought by then.
  if (LATER.some((b) => b.name === name)) return ` ${kt} kt.`;
  const short = plan.builds.filter((b) => b !== name).reduce((s, b) => s + (buildOf(b)?.kt ?? 0), kt) - HELD;
  if (short <= 0) return ` ${kt} kt of our ${HELD}.`;
  const years = Math.ceil(short / SPARE_LIFT);
  return ` ${kt} kt. Past our ${HELD}, spare lift brings the last ${short} kt within ${years === 1 ? "a Year" : `${years} Years`}.`;
}

/** What our order draws at a Year: the share of our compute its builds use, and the share of Earth's energy our
 *  thinking draws, about a hundredth at Year 0 and half again with each data center done. What the builds leave sits
 *  idle. Thought Fields uses none of it: the fabs build data centers. 2026-10-21. */
export function drawAt(plan: Plan, scale: number, year: number) {
  const { orders, ...opts } = ordersOf(plan);
  const { room, idle, thought } = pace(orders, year, { scale, ...opts });
  return { compute: room > 0 ? 1 - idle / room : 1, energy: (thought * CATALOG.flagship) / CATALOG.gridRoom };
}

/** The share of our compute the plan's builds would use at Year 0. A plan is enough when it uses it all. */
export const inUse = (plan: Plan, scale: number) => drawAt(plan, scale, 0).compute;

/** A build's name from the pace's. */
const NAMED = Object.fromEntries([...BUILDS, ...LATER].map((b) => [pacedName(b.name), b.name]));

/** Our compute at a Year as shares of all of it, as the ring on Build draws it: what our Mind's studies and the
 *  observation set aside, a campus of Thought Fields under way, and for each build in line what it needs, the spare
 *  pushing it, and what it is short. Spare goes down the line in order, as the pace gives it. 2026-10-22. */
export function sharesAt(plan: Plan, scale: number, year: number) {
  const { orders, ...opts } = ordersOf(plan);
  const p = pace(orders, year, { scale, ...opts });
  const all = p.thought;
  const building = plan.builds.includes("Thought Fields") && p.dataCenters.length < centers(scale);
  const fields = building ? (scale * CATALOG.dataCenter.aside) / CATALOG.flagship / all : 0;
  const parts = p.line.map(({ work, s }) => {
    const want = CATALOG.works[work].want;
    const give = s * want;
    return {
      name: NAMED[work] ?? work,
      need: Math.min(want, give) / all,
      spare: Math.max(0, give - want) / all,
      short: Math.max(0, want - give) / all,
    };
  });
  const sum = (k: "need" | "spare" | "short") => parts.reduce((t, x) => t + x[k], 0);
  return {
    studies: (all - p.room) / all - fields,
    fields,
    parts,
    spare: sum("spare"),
    short: sum("short"),
    idle: p.idle / all,
  };
}

/** All our compute at a Year, in flagships: Year 0's, and half again with each campus done. */
export function computeAt(plan: Plan, scale: number, year: number) {
  const { orders, ...opts } = ordersOf(plan);
  return pace(orders, year, { scale, ...opts }).thought;
}

/** A build's share of `all` our compute, in flagships, at its standard pace. Thought Fields takes its share only
 *  while a campus is built, a share of this Earth's Year 0 compute at `scale`. */
export function needOf(name: string, all: number, scale = 1) {
  const want = name === "Thought Fields" ? (scale * CATALOG.dataCenter.aside) / CATALOG.flagship : (CATALOG.works[pacedName(name)]?.want ?? 0);
  return want / all;
}

/** What our builds have opened by a Year, and we haven't ordered: each build that waits, once what it waits on is
 *  done. */
export function openAt(plan: Plan, done: Record<string, number | null>, year: number) {
  const ours = ordered(plan);
  return LATER.filter((b) => !ours.includes(b.name) && ours.includes(b.after) && (done[b.after] ?? Infinity) <= year);
}

/** What energy lets our compute become, as Thought Fields grows it, queued now if it isn't: the Year each campus is
 *  done, each adding half again, and the grid's room, both as times our Year 0 compute. 2026-10-22. */
export function ceiling(plan: Plan, scale: number) {
  const builds = plan.builds.includes("Thought Fields") ? plan.builds : [...plan.builds, "Thought Fields"];
  const { orders, ...opts } = ordersOf({ ...plan, builds });
  return { campuses: pace(orders, 40, { scale, ...opts }).dataCenters, step: CATALOG.step, room: CATALOG.gridRoom / scale };
}

/** What is already on its way, in Years from Year 0: our messages arriving, and the first replies that could come.
 *  Each keeps the message it rides on, the decimal year we sent it, and the star's distance in light-years. */
export function events(until: number) {
  const out: { at: number; star: string; reply: boolean; msg: string; sent: number; ly: number }[] = [];
  const seen = new Set<string>();
  for (const [msg, sent, star, ly] of KNOCKS) {
    const arrive = sent + ly - YEAR_0;
    if (arrive > 0 && arrive <= until) out.push({ at: arrive, star, reply: false, msg, sent, ly });
    const reply = sent + 2 * ly - YEAR_0;
    if (reply > 0 && reply <= until && !seen.has(star)) {
      seen.add(star);
      out.push({ at: reply, star, reply: true, msg, sent, ly });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
