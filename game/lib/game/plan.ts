// Planning, on the Build tab: what Earth can start at Year 0. The builds are the first hour's works from
// data/works.json, paced by lib/sim/works.ts from the player's own order, so every date on the screen is the game's.
// The Mind names what it would start with only when asked, 2026-10-19, and never queues anything itself.
import { FOUND } from "./rocks";
import { BULLET, SCREEN } from "@/lib/sim/conflict";
import { plainBuild } from "./build-offer";
import { KNOCKS } from "./knocks";
import { YEAR_0 } from "./clock";
import type { Plan } from "./types";
import { GIFT_STEPS } from "@/lib/sim/messages";
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
  // A fleet of ARC-class plants, 2026-10-28: the first stand near Year 0, and the fleet grows on the tritium it breeds.
  { name: "Fusion Plants", what: "Half again as much energy, from a fleet of fusion plants.", does: "think" },
  { name: "Infrared Telescope", what: "Reads the air of the nearest worlds.", does: "see" },
  // An observing program on a telescope we have, ALMA, so it is quick and takes little. Added 2026-10-26.
  { name: "Halo Survey", what: "Looks for the cold glow of minds computing far from their stars.", does: "see" },
  // A near-infrared Gaia, of the GaiaNIR class, 2026-10-26: it finds black holes by the stars they shift.
  { name: "Star Mapper", what: "Maps a billion stars’ places, and finds black holes by the stars they shift.", does: "see" },
  { name: "Launch Complex", what: "Doubles what we lift to orbit.", does: "lift" },
  // What a neighbor can do to us, we can build, 2026-10-28: see a probe braking in, and fall quiet.
  { name: "X-Ray Watch", what: "Sees a probe’s fusion flame as it brakes into our system, weeks out.", does: "see" },
  { name: "Quiet Radars", what: "Cuts the radars that tell every listener we are here.", does: "keep" },
  // StarTram's Gen-1, 2026-10-27: a ground build, so it spends no matter, and lifts three times what the complex does.
  { name: "Launch Tunnel", what: "Throws cargo to orbit from a tunnel in the Andes, 128 kt a Year.", does: "lift" },
  { name: "Orbital Yard", what: "Cuts build time in orbit by a quarter.", kt: 1, does: "lift" },
  { name: "Moon Vault", what: "A second home for our Mind, in the Moon’s rock.", kt: 10, does: "keep" },
  // The two roads to the nearest star, open at Year 0 since 2026-10-18. Even last in line, the probe yard's large want
  // takes the compute that would have pushed the builds before it, and slows them by Years.
  { name: "Laser Sail Array", what: "A beam from Earth that pushes sails to a fifth of light speed.", does: "reach" },
  {
    name: "Probe Yard",
    what: "Builds and fuels probes in orbit. The first flies 12 Years after the yard is done.",
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
  // A third home for our Mind, 2026-10-28: inside the asteroid that leads Earth round the Sun, out of reach of anything
  // that strikes Earth and the Moon together.
  {
    name: "Trojan Vault",
    what: "A third home for our Mind, inside an asteroid that leads Earth round the Sun.",
    kt: 10,
    does: "keep",
    after: "Moon Vault",
  },
  // Birch's bootstrapped ring, 2026-10-28: a seed of Moon metal, and ladders that lift from the ground at its pace.
  {
    name: "Orbital Ring",
    what: "A ring round the world in low orbit, with cables down to the ground. 190 Mt a Year.",
    kt: 180,
    does: "lift",
    after: "Mass Driver",
  },
  // Reach's locked lens, made a build 2026-10-26: the yard's line of small sailcraft. Each lens is sent from a
  // destination's page, to one star.
  { name: "Solar Lens", what: "Small sails that fly to the Sun’s focus and picture one world’s face.", does: "see", after: "Orbital Yard" },
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
  // Parity, 2026-10-28: catch what the watch sees, screen a line to a star, and strike one.
  { name: "Interceptor", what: "Kill vehicles that catch a probe in our system once the watch sees it.", does: "keep", after: "X-Ray Watch" },
  {
    name: "Picket Yard",
    what: "Builds pellet screens on the line to a star, to wreck a bullet from there.",
    does: "keep",
    after: "Orbital Yard",
  },
  { name: "Strike Yard", what: "Readies bullets of 1,000 t to fire at a star, at a tenth of light speed.", does: "reach", after: "Fusion Drive" },
  // A rock coming, 2026-10-28: the deflector opens only once a survey finds one, in games whose seed sends one.
  {
    name: "Rock Deflector",
    what: "Ten impactors that push a coming rock aside, as DART pushed Dimorphos.",
    does: "keep",
    after: FOUND,
  },
  // Sends the Will to our Mind at a black hole, as a transmission, 2026-10-26. calcs/holes.py.
  { name: "Mind Link", what: "A laser 100 m wide, to send the Will to our Mind far away.", does: "reach", after: "Seed Ship" },
  // The cold compute annex at scale, 2026-10-26: chips run cold behind a shade, on sunlight caught beside them.
  {
    name: "Cold Annex",
    what: "Chips run cold in space, four times the thought a watt.",
    does: "think",
    after: "Mass Driver",
  },
];

/** Any build by the name the Mind gave, in any case, with or without "the". */
export const buildNamed = (name: string): Build | Later | undefined =>
  [...BUILDS, ...LATER].find((b) => plainBuild(b.name) === plainBuild(name));

/** What a build opens once it is done. */
export const opens = (name: string) => LATER.filter((b) => b.after === name);

/** Any build by its name, whether we can start it or it waits. */
export const buildOf = (name: string): Build | Later | undefined =>
  BUILDS.find((b) => b.name === name) ?? LATER.find((b) => b.name === name);

/** What we could start with, walked one at a time on Build: all but the longest roads' builds, which pay only once
 *  a drive is coming, and the Moon Vault, which can come later. They wait in the list. Chosen 2026-10-19,
 *  the vault left out 2026-10-20, the Halo Survey and Star Mapper 2026-10-26, which pay off late, and the Launch
 *  Tunnel 2026-10-27, since nothing we could start waits on lift. */
export const STARTS = BUILDS.filter(
  (b) => !["Moon Vault", "Halo Survey", "Star Mapper", "Launch Tunnel", "X-Ray Watch", "Quiet Radars", "Deuterium Works", "Fusion Drive", "Seed Ship"].includes(b.name),
);

/** What the Mind says of each build, on its page and in the walk. */
export const SAYS: Record<string, string> = {
  "All-Sky Watch":
    "Our sky watch sees each star about ten minutes a day, and a knock lasts hours. This would hear the whole sky, all the time.",
  "Deep Flash Watch":
    "A laser knock could last a billionth of a second. Only a watch built for flashes that short would ever see one.",
  "Thought Fields":
    "The fabs fill a campus a Year, each adding half again to our compute, until our compute draws the whole grid. Every build goes faster as they come, and so do our studies.",
  "Infrared Telescope":
    "It would read the air of the nearest worlds. Oxygen can build up without life, so we would weigh it against the water and everything else we read.",
  "Star Mapper":
    "Dozens of black holes should lie within 100 light years, and we have found almost none, since they give off no light. Passing in front of a star, one shifts where the star seems to be. A sharper Gaia, seeing through dust in the infrared, would catch them as they pass, a few each decade.",
  "Halo Survey":
    "A mind that computes cold, far from its star, glows grey, a color no dust has. Herschel saw no such glow. ALMA could see one 25 times fainter, if it is compact. Early on it will likely find only dust. A neighbor whose thinking keeps growing would show in time.",
  "Fusion Plants":
    "The first fusion plants, about 400 MW each, come online near Year 0. This grows them to a fleet of about 30,000, half again the energy we have. Each new plant starts on tritium the others breed, so the fleet can only double so fast: about 30 Years. Once done, one more data center fits under the grid. If the plants breed less than planned, the fleet grows slower.",
  "Launch Complex":
    "It doubles what we lift to orbit. Nothing we could start now waits on lift, but the Mass Driver can’t reach the Moon without it.",
  "Launch Tunnel":
    "Superconducting magnets throw 40 t craft down a 110 km vacuum tunnel and out of a mountain at 8.8 km/s, ten a day. That is 128 kt a Year, three times the Launch Complex, at about $50 a kilogram. Cargo only: it pulls 30 g. No one has built one, and the door of charged air that keeps the sky out of the tunnel is untested. Nothing we could start now waits on lift.",
  "Orbital Yard": "It builds in orbit in a quarter less time. It pays most if we mean to build a lot up there.",
  "Moon Vault":
    "Nothing we know of threatens Earth yet. This keeps a copy of us out of reach of anything that hits Earth, in case something does. It takes half the matter we hold in orbit.",
  "Laser Sail Array":
    "Our soonest road to the nearest star, and it needs none of the matter we hold in orbit. Last in line, it barely slows the builds ahead of it.",
  "Probe Yard":
    "It builds and fuels probes in orbit. It needs a lot of compute: even last in line, it slows every build ahead of it.",
  "Deuterium Works":
    "Fusion burns heavy hydrogen, and the sea holds plenty: about one hydrogen atom in 6,400 is heavy. It takes little, and pays only once a drive is coming.",
  "Fusion Drive":
    "No one has flown one yet. It lets a craft slow at a star and stay, where a flyby is past within minutes. The longest roads need it. It takes thirty Years at standard pace, a quarter less once the Orbital Yard is done.",
  "Seed Ship":
    "A copy of our Mind that goes and stays, about 1,500 tonnes with its seed. It flies only on a Fusion Drive, fed by the Deuterium Works, so it leaves once both are done.",
  "Ground Solar":
    "Our data centers will fill the grid. This adds a fifth more energy in 10 Years, building solar five times as fast as we do today.",
  "15 m Mirror":
    "Our first telescope could read smog at about 1 living world in 12. A 15 m mirror would read it at about 3 in 4.",
  "Mass Driver":
    "Megatonnes can’t come from Earth by rocket: 10 Mt is 180 Years of lift. This throws 600 kt of Moon rock a Year, by O’Neill’s estimate. No one has priced one.",
  "Solar Lens":
    "Past 548 AU the Sun’s gravity bends a star’s light to a focus, a lens a million kilometers wide. A few small sails there picture one world’s face, about 25 km a pixel at 100 ly, finer nearer. Cities show, and cleared land. Each lens looks at one star, and takes about 18 Years to reach its focus and look.",
  "Mind Link":
    "Our dishes would take millions of Years to send a Mind. A laser with a 100 m mirror sends one 10 ly in under two days, if the far end catches it as wide. Our Mind there, at a hole or a star, builds that end. Once both stand, the Will can live there. The crossing is dark: a Year for each light-year, with no orders and no news.",
  "Orbital Ring":
    "A ring of Moon metal circles the world 300 km up, spun faster than orbit so it holds up cables to 20 places on the ground. Craft climb them to orbit. It takes 180 kt of what we hold, then lifts the full ring, 180 Mt, in about a year, and after that about 190 Mt a Year, three hundred times what the Mass Driver throws. At full pace it draws about 200 GW. No part of it has been tested. A ring that breaks rises rather than falls, since the loads that held it down are gone. The skyhooks and cables are what can come down.",
  "X-Ray Watch":
    "Six wide-field X-ray telescopes of Einstein Probe’s class, about 4 Years. A probe braking into our system on a fusion flame shows to them in its last weeks, about 2 AU out. A craft coasting dark shows to nothing we can build.",
  "Quiet Radars":
    "Ninety years of our radar sweeps are already out there, and nothing recalls them. Cutting the radars now means a listener whose ears open after our last sweep passes never hears us. Every listener who has heard us hears us stop, and can’t tell waking from dying.",
  "Interceptor":
    "Stored kill vehicles of a tonne each, about 5 Years. Once the X-Ray Watch sees a probe braking in, one meets it as it stops and wrecks it. Its sender loses its eyes here, and may take that as the act of war it is.",
  "Picket Yard":
    "It builds pellet screens in orbit: 10 g pellets 0.7 m apart, 10 km wide, about 2,000 t, held 4 million km out on the line to one star. A bullet from there that crosses one is wrecked into spray, and lands as a flash high in the air. A bullet coasts dark, so a screen must stand before one comes. Only a sentinel of ours at its star could see it fired. Each takes 4 Years.",
  "Strike Yard":
    "It readies bullets of 1,000 t, as a neighbor’s are, each 20 Years and 61 kt of fusion fuel. One lands at a tenth of light speed with about 110,000 Mt: a region gone, the ozone thinned, the climate cooled. It ends no Mind spread across its system. Its launch flame shows only in our own system: a probe of theirs watching here would see it, and no one farther off.",
  "Rock Deflector":
    "A rock is coming at Earth. Ten impactors of a tonne each hit it at 6 km/s, and the rock thrown off pushes it 3.6 times harder, as DART’s did. The earlier the push lands, the less it must move the rock: a 140 m rock needs about 2 Years’ warning, a 60 m one a few weeks. Too late, and it strikes.",
  "Trojan Vault":
    "The Moon Vault keeps a copy of us if Earth is struck, but not if something reaches Earth and the Moon together. 2020 XL5, a dark asteroid about 1.2 km wide, leads Earth round the Sun 150 million km ahead, and stays there at least 4,000 Years. A vault inside it takes the Moon Vault’s 10 kt and about 12 Years. Its copy is 8 light-minutes away, so it keeps us, not thinks with us. No craft has visited it.",
  "Orbital Foundry": "The yard assembles what we lift. The foundry makes parts from rock up there, so we lift less.",
  "Belt Mining":
    "Survey probes first, then a mining fleet. Nothing like it has flown. It brings 120 kt of rock a Year, and needs no Mass Driver.",
  "Far-Side Array":
    "The Moon’s far side is the quietest place we can reach. An array there hears the hum of everyday radio that no telescope on Earth can. It grows in fifths, and the first already hears the nearest worlds.",
  "Power from Orbit":
    "A fifth more energy, from sunlight caught above the weather and beamed down. It takes 10 Mt of rock, so it comes only as fast as rock does.",
  "Cold Annex":
    "Chips at 77 K do about four times the work a watt, and in space nothing has to cool them but a shade and wide radiators. It thinks as much as Power from Orbit for about 4 Mt of rock, not 10. Both wait on the same rock, so whichever comes first in line takes it first. Its heat glows, as a neighbor’s would.",
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
  "X-Ray Watch": "X-ray sky watch",
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
  for (const o of plan.later ?? [])
    orders.push(o.name === "Thought Fields" ? { y: o.y, standing: "Data center" } : { y: o.y, begin: pacedName(o.name) });
  for (const o of plan.stops ?? []) orders.push({ y: o.y, drop: o.name === "Thought Fields" ? "Data center" : pacedName(o.name) });
  for (const o of plan.gifts ?? []) orders.push({ y: o.y, gift: o.name, steps: GIFT_STEPS[o.size ?? "collection"] });
  const aside = plan.observe.length ? ([[0, FOMALHAUT.lands, 0.05]] as const) : [];
  return { orders, aside, follow: false };
}

/** A build's last word in our order: the Year it was last ordered, or taken back, whichever came later. Year 0's queue
 *  comes before anything in play. Null if never ordered. */
function lastOf(plan: Plan, name: string): { y: number; stop: boolean } | null {
  let last = plan.builds.includes(name) ? { y: -1, stop: false } : null;
  for (const o of plan.later ?? []) if (o.name === name && (!last || o.y >= last.y)) last = { y: o.y, stop: false };
  for (const o of plan.stops ?? []) if (o.name === name && (!last || o.y >= last.y)) last = { y: o.y, stop: true };
  return last;
}

/** Every build in our order: those from Year 0, then those ordered in play, in the order ordered. Not those taken back,
 *  and one ordered again stands where it was ordered again. */
export const ordered = (plan: Plan) => [
  ...plan.builds.filter((b) => lastOf(plan, b)?.y === -1),
  ...(plan.later ?? []).filter((o) => { const l = lastOf(plan, o.name); return l && !l.stop && l.y === o.y; }).map((o) => o.name),
];

/** The Year a build was taken back, if it was and hasn't been ordered again. */
export const takenAt = (plan: Plan, name: string) => {
  const l = lastOf(plan, name);
  return l?.stop ? l.y : null;
};

/** A build ordered in play, at the Year we order it, last in line. One taken back picks up its work. Taken back and
 *  ordered again in the same tenth of a Year, it's as if it was never taken back. */
export const orderLater = (name: string, y: number) => (p: Plan): Plan =>
  takenAt(p, name) === y
    ? { ...p, stops: p.stops?.filter((o) => !(o.name === name && o.y === y)) }
    : { ...p, later: [...(p.later ?? []), { name, y }] };

/** A build under way taken back at Year `y`. Its work is kept, and the rest of our order shares its compute from then.
 *  Ordered and taken back in the same tenth of a Year, it's as if it was never ordered. 2026-10-23. */
export const takeBack = (name: string, y: number) => (p: Plan): Plan =>
  lastOf(p, name)?.y === y
    ? { ...p, later: p.later?.filter((o) => !(o.name === name && o.y === y)) }
    : { ...p, stops: [...(p.stops ?? []), { name, y }] };

/** The work left on a build we took back, as it stood then, by Year `year`: its standard Years left, and the share of
 *  it built. Null if none is kept, as for Thought Fields, whose campus under way is finished. */
export function keptOf(plan: Plan, scale: number, name: string, year: number) {
  const { orders, ...opts } = ordersOf(plan);
  return pace(orders, year, { scale, ...opts }).kept[pacedName(name)] ?? null;
}

/** Our order without a build. */
const without = (plan: Plan, name: string): Plan => ({
  ...plan,
  builds: plan.builds.filter((b) => b !== name),
  later: plan.later?.filter((o) => o.name !== name),
  stops: plan.stops?.filter((o) => o.name !== name),
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
export const lacks = (plan: Plan, name: string) => (NEEDS[name] ?? []).filter((n) => !ordered(plan).includes(n));

/** Builds as a line says them: the Fusion Drive and the Deuterium Works. */
export const needs = (names: string[]) => names.map((n) => `the ${n}`).join(" and ");

/** How far ahead our order is paced: a game has no last Year, and late builds wait on rock or long roads. It was 40
 *  Years until 2026-10-26, so a build ordered at Year 400 read "after Year 40". */
export const HORIZON = 1000;
/** Past the horizon, in words. */
export const PAST = "past Year 1,000";

/** When each queued build is done, in Years from Year 0, with this game's compute. Null past the horizon. Thought Fields
 *  is done once its campuses fill the grid. A build that needs others is done once they all are, and never if our
 *  order lacks one. */
export function schedule(plan: Plan, scale: number, harm: readonly Order[] = []): Record<string, number | null> {
  const { orders, ...opts } = ordersOf(plan);
  // Strikes landed on Earth, as lib/game/hits.ts has them: our thought cut, and won back as we rebuild. 2026-10-28.
  const p = pace([...orders, ...harm], HORIZON, { scale, ...opts });
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
 *  the Orbital Yard does what is built in orbit. Past the horizon counts as the horizon. Null under a tenth of a Year. One not
 *  in our order is added last at Year 0, or in play at Year `y`. */
export function moves(plan: Plan, scale: number, work: string, y: number | null = null) {
  const others = ordered(plan).filter((b) => b !== work);
  // One taken back is measured against our order as it stands, the compute it used until then spent.
  const less = schedule(ordered(plan).includes(work) ? without(plan, work) : plan, scale);
  const more = ordered(plan).includes(work)
    ? plan
    : y === null
      ? { ...plan, builds: [...plan.builds, work] }
      : orderLater(work, y)(plan);
  const within = schedule(more, scale);
  let late: { name: string; by: number } | null = null;
  let soon: { name: string; by: number } | null = null;
  for (const name of others) {
    const d = (within[name] ?? HORIZON) - (less[name] ?? HORIZON);
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
/** The Launch Tunnel's lift, kt a Year: StarTram Gen-1's, at 10 launches a day. 2026-10-27. */
export const TUNNEL_LIFT = 128;

/** The matter we hold in orbit at a Year, in kt: the 20 at Year 0 and what spare lift has brought since, 40 kt a Year
 *  more once the Launch Complex is done, less what our builds take, spent as each begins at Year 0. Lift moves no
 *  date, so matter piles up. Rock from the Moon and the belt comes later. 2026-10-20. */
function held(plan: Plan, done: Record<string, number | null>, year: number) {
  const launch = plan.builds.includes("Launch Complex") ? done["Launch Complex"] : null;
  const tunnel = ordered(plan).includes("Launch Tunnel") ? done["Launch Tunnel"] : null;
  // Builds from Year 0 spend theirs then, and those ordered in play when ordered: the driver's and the foundry's
  // machines, landed from Earth, since 2026-10-22.
  // Ordered again after it was taken back, a build has its matter already.
  const first = (plan.later ?? []).filter((o, i, all) => !plan.builds.includes(o.name) && all.findIndex((x) => x.name === o.name) === i);
  // A screen is 2 kt of pellets, and a bullet 1 kt with 61 kt of fusion fuel, spent as each is ordered. 2026-10-28.
  const each = (list: { y: number }[] | undefined, kt: number) => (list ?? []).filter((o) => o.y <= year).length * kt;
  const spent =
    plan.builds.reduce((s, b) => s + (buildOf(b)?.kt ?? 0), 0) +
    first.reduce((s, o) => s + (o.y <= year ? (buildOf(o.name)?.kt ?? 0) : 0), 0) +
    each(plan.pickets, SCREEN.tonnes / 1000) +
    each(plan.strikes, (BULLET.tonnes * (1 + BULLET.fuelPerTonne)) / 1000);
  const lifted =
    SPARE_LIFT * year +
    (launch == null ? 0 : LAUNCH_LIFT * Math.max(0, year - launch)) +
    (tunnel == null ? 0 : TUNNEL_LIFT * Math.max(0, year - tunnel));
  return HELD + lifted + rockAt(plan, done, year) - spent;
}

/** Rock come in by a Year, in kt, from the Moon's driver, the belt and the ring's ladders once each is done, less
 *  what Power from Orbit takes as it comes, until it holds the megatonnes it waits on. 2026-10-22. */
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
export const kt = (n: number) =>
  n < 1000
    ? `${Math.floor(n)} kt`
    : n < 1e6
      ? `${(Math.floor(n / 100) / 10).toFixed(1)} Mt`
      : `${(Math.floor(n / 1e5) / 10).toFixed(1)} Gt`;

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
  const { room, idle, thought, done } = pace(orders, year, { scale, ...opts });
  // Fusion Plants grow the grid itself, so the same thought draws a smaller share of it. 2026-10-28.
  const grid = 1 + Object.keys(done).reduce((e, w) => e + (CATALOG.works[w]?.energy ?? 0), 0);
  return { compute: room > 0 ? 1 - idle / room : 1, energy: (thought * CATALOG.flagship) / (CATALOG.gridRoom * grid) };
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
  const building = ordered(plan).includes("Thought Fields") && p.dataCenters.length < centers(scale);
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

/** What we can order in play, and haven't: Year 0's builds, and each build that waits, once what it waits on is
 *  done. */
export function openAt(plan: Plan, done: Record<string, number | null>, year: number) {
  const ours = ordered(plan);
  // Year 0's builds we left out, or took back, wait here too, to order in play. Before 2026-10-28 only those taken
  // back did, and one left out at Begin could never be built.
  return [
    ...BUILDS.filter((b) => !ours.includes(b.name)),
    ...LATER.filter((b) => !ours.includes(b.name) && (takenAt(plan, b.name) !== null || ((ours.includes(b.after) || b.after === FOUND) && (done[b.after] ?? Infinity) <= year))),
  ];
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
