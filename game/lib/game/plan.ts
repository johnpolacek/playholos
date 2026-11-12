// Planning, on the Build tab: what Earth can start at Year 0. The builds are the first hour's works from
// data/works.json, paced by lib/sim/works.ts from the player's own order, so every date on the screen is the game's.
// The Mind names what it would start with only when asked, 2026-10-19, and never queues anything itself.
import { FOUND } from "./rocks";
import { WATCHED } from "@/lib/sim/minds";
import { BULLET } from "@/lib/sim/conflict";
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
  { name: "All-Sky Watch", what: "Hears the whole sky all day, so no knock slips past.", does: "listen" },
  { name: "Deep Flash Watch", what: "Sees knocks sent as laser flashes, which no radio watch hears.", does: "listen" },
  { name: "Thought Fields", what: "Half again as much compute each Year, speeding every build and study.", does: "think" },
  // A fleet of ARC-class plants, 2026-10-28: the first stand near Year 0, and the fleet grows on the tritium it breeds.
  { name: "Fusion Plants", what: "More than doubles our electricity, for more compute. Grows slowly.", does: "think" },
  { name: "Infrared Telescope", what: "Reads the air of the nearest worlds, for signs of life.", does: "see" },
  // An observing program on a telescope we have, ALMA, so it is quick and takes little. Added 2026-10-26.
  { name: "Halo Survey", what: "Looks for the cold glow of minds computing far from their stars.", does: "see" },
  // A near-infrared Gaia, of the GaiaNIR class, 2026-10-26: it finds black holes by the stars they shift.
  { name: "Star Mapper", what: "Finds black holes near us, places we could send our Mind.", does: "see" },
  // A cooled all-sky mid-infrared telescope, ten times deeper than WISE, 2026-10-29: it catches a young mind’s warm flash.
  { name: "Warm Sky Watch", what: "Watches the galaxy for the warm glow of a young mind.", does: "see" },
  // A neutrino detector of about 10 Mt in the South Pole's ice, after MICA, 2026-11-11: it hears stars die in the
  // galaxies round us, those that explode and those that fall dark to a black hole. lib/game/natural.ts.
  { name: "Deep Ice Watch", what: "Hears stars die in the galaxies round us, even those with no flash.", does: "see" },
  // A shift-and-stack search of the Earth–Moon L4 and L5 points, on telescopes we have, 2026-10-29.
  // One probe mapping each Earth co-orbital asteroid in turn, as Tianwen-2 maps Kamoʻoalewa, 2026-10-29.
  { name: "Asteroid Tour", what: "Searches the asteroids sharing Earth’s orbit for a watcher.", does: "see" },
  { name: "Moon Search", what: "Searches the points beside the Moon for a small, dark watcher.", does: "see" },
  { name: "Launch Complex", what: "Doubles our lift to orbit, and opens the Mass Driver.", does: "lift" },
  // What a neighbor can do to us, we can build, 2026-10-28: see a probe braking in, and fall quiet.
  { name: "X-Ray Watch", what: "Sees a probe’s fusion flame as it brakes into our system, weeks out.", does: "see" },
  { name: "Quiet Radars", what: "Ends our radars, so listeners our sweeps haven’t reached never hear us.", does: "keep" },
  // StarTram's Gen-1, 2026-10-27: a ground build, so it spends no matter, and lifts three times what the complex does.
  { name: "Launch Tunnel", what: "Builds our craft a fifth faster, with cheap lift from an Andes tunnel.", does: "lift" },
  { name: "Orbital Yard", what: "Builds telescopes, probes and drives in orbit a quarter faster.", kt: 1, does: "lift" },
  { name: "Moon Vault", what: "A copy of our Mind in the Moon, safe if Earth is struck.", kt: 10, does: "keep" },
  // The two roads to the nearest star, open at Year 0 since 2026-10-18. Even last in line, the probe yard's large want
  // takes the compute that would have pushed the builds before it, and slows them by Years.
  { name: "Laser Sail Array", what: "Our soonest way to the nearest stars, sails at a fifth of light speed.", does: "reach" },
  {
    name: "Probe Yard",
    what: "Builds and fuels our probes in orbit, for the long roads.",
    kt: 10,
    does: "reach",
  },
  // The longest roads: what a craft needs to stay at a star, and a copy of our Mind to send. The catalog had them, and
  // Reach's locked ways now name them, so they can be queued at Year 0 too, last in line, 2026-10-19. Paces settled
  // 2026-10-15 in HOLOS_GAME_CONCEPT.md: a drive 30 Years at standard pace, a seed ship 18, about 1,500 t. Both are
  // joined in orbit, a quarter faster once the yard is done, the drive since 2026-10-22.
  { name: "Deuterium Works", what: "Fuel for the Fusion Drive and the Probe Yard’s probes.", does: "reach" },
  { name: "Fusion Drive", what: "An engine big enough to carry a craft that can slow at a star, and stay.", does: "reach" },
  { name: "Seed Ship", what: "Carries a copy of our Mind to a star, to stay.", kt: 1.5, does: "reach" },
];

/** A build that waits on another, and opens once that one is done. */
export interface Later extends Build {
  after: string;
}

// (The Galaxy Broadcast Array waits on the All-Sky Watch by the designer's pick, 2026-11-11, not by its size: we
// listen to the whole sky before we call into it.)
/** What our builds open: works too large or too far along to start at Year 0. The game's model has paced them since
 *  the first mocks. Each waits on the build it grows from: a larger mirror on the first telescope, the Moon's mass
 *  driver on the lift that carries it there, the foundry on the yard, belt mining on the yard's probes, and what needs
 *  megatonnes of rock on the driver that throws it, as the model has it. Ground solar follows Thought Fields, whose
 *  data centers fill the grid. Lists show only what we can start, each with what it opens. Chosen 2026-10-20. */
export const LATER: Later[] = [
  { name: "Ground Solar", what: "As much electricity again, room for two more data centers.", does: "think", after: "Thought Fields" },
  // A call the whole Galaxy can read, sent only when the Will sends it, 2026-11-11: Benford's beacon. calcs/messages.py.
  { name: "Galaxy Broadcast Array", what: "Lets a broadcast reach the whole Galaxy, in short pulses.", does: "reach", after: "All-Sky Watch" },
  // Our own ALMA-class array for the halo search, ten times as fast, 2026-10-29: the reach to old minds hundreds of ly out.
  { name: "Halo Array", what: "An array of our own that searches for cold glows ten times as fast.", does: "see", after: "Halo Survey" },
  {
    name: "15 m Mirror",
    what: "Reads oxygen on 1 in 5 nearby worlds, not 1 in 50.",
    does: "see",
    after: "Infrared Telescope",
  },
  { name: "Mass Driver", what: "Moon rock for our biggest builds, 600 kt a Year.", kt: 1, does: "lift", after: "Launch Complex" },
  { name: "Orbital Foundry", what: "Makes parts from rock in orbit, so we lift less.", kt: 1, does: "lift", after: "Orbital Yard" },
  // A third home for our Mind, 2026-10-28: inside the asteroid that leads Earth round the Sun, out of reach of anything
  // that strikes Earth and the Moon together.
  {
    name: "Trojan Vault",
    what: "A third copy, safe even if Earth and Moon are struck together.",
    kt: 10,
    does: "keep",
    after: "Moon Vault",
  },
  // Birch's bootstrapped ring, 2026-10-28: a seed of Moon metal, and ladders that lift from the ground at its pace.
  {
    name: "Orbital Ring",
    what: "Lifts 190 Mt a Year, 300 times the Mass Driver.",
    kt: 180,
    does: "lift",
    after: "Mass Driver",
  },
  // Reach's locked lens, made a build 2026-10-26: the yard's line of small sailcraft. Each lens is sent from a
  // destination's page, to one star.
  { name: "Solar Lens", what: "Small sails that fly to the Sun’s focus and picture one world’s face.", does: "see", after: "Orbital Yard" },
  { name: "Belt Mining", what: "Asteroid rock for our biggest builds, 120 kt a Year.", does: "lift", after: "Probe Yard" },
  {
    name: "Far-Side Array",
    what: "Hears the magnetic fields of worlds at red dwarfs, and finds new worlds.",
    does: "listen",
    after: "Mass Driver",
  },
  {
    name: "Power from Orbit",
    what: "A fifth more electricity, from sunlight caught in orbit.",
    does: "think",
    after: "Mass Driver",
  },
  // Parity, 2026-10-28: catch what the watch sees, and strike a star. Screens retired 2026-10-31, audit 2.1.
  { name: "Interceptor", what: "Kill vehicles that catch a probe in our system once the watch sees it.", does: "keep", after: "X-Ray Watch" },
  { name: "Strike Yard", what: "Readies bullets of 1,000 t to fire at a star, at a tenth of light speed.", does: "reach", after: "Fusion Drive" },
  // The audit's helium-3 harvest, 2026-10-29: every bullet's fuel, ours and every neighbor's, comes from one.
  { name: "Helium-3 Harvest", what: "Helium-3 from Uranus’s air, a bullet’s fuel, doubling every 5 Years.", does: "reach", after: "Probe Yard" },
  // A rock coming, 2026-10-28: the deflector opens only once a survey finds one, in games whose seed sends one.
  {
    name: "Rock Deflector",
    what: "Ten impactors that push a coming rock aside, as DART pushed Dimorphos.",
    does: "keep",
    after: FOUND,
  },
  // The watcher found, 2026-10-30: a small craft flies to look at it up close, once we know where it sits.
  { name: "Close Look", what: "A small craft that flies to the watcher and looks at it up close.", does: "see", after: WATCHED },
  // The watcher's mirror seen, 2026-10-30: a sailcraft flies out along the line it points, past the Sun's focus.
  { name: "Relay Search", what: "A sailcraft that flies out along the line the watcher’s mirror points.", does: "see", after: "Close Look" },
  // Sends the Will to our Mind at a black hole, as a transmission, 2026-10-26. calcs/holes.py.
  { name: "Mind Link", what: "A laser 100 m wide, to send the Will to our Mind far away.", does: "reach", after: "Seed Ship" },
  // The cold compute annex at scale, 2026-10-26: chips run cold behind a shade, on sunlight caught beside them.
  // The annex grown into a swarm, 2026-10-28: more thought each decade, until it grows bright enough to be seen.
  { name: "Cold Halo", what: "Compute built from asteroid rock, doubling every 10 Years.", does: "think", after: "Cold Annex" },
  {
    name: "Cold Annex",
    what: "Chips run cold in space, four times the compute a watt.",
    does: "think",
    after: "Mass Driver",
  },
  // A player's plan, 2026-10-29: take Mercury apart for a swarm round the Sun, beam its light, and see far.
  // calcs/mercury.py. A seed of panels landed there, made from the foundry's parts.
  { name: "Mercury Works", what: "A factory on Mercury that copies itself, to build the Solar Swarm.", kt: 0.1, does: "lift", after: "Orbital Foundry" },
  { name: "Solar Swarm", what: "Compute from the Sun’s light, doubling every 2 Years.", does: "think", after: "Mercury Works" },
  { name: "Star Beam", what: "Gets a Solar Lens to its focus in two months, not 17 Years.", does: "reach", after: "Solar Swarm" },
  // The Star Beam can't push a seed ship. A patch of the swarm ten times wider can, 2026-11-10. calcs/mercury.py.
  { name: "Ship Beam", what: "Throws seed ships and flyby probes to speed, with no drive or fuel.", does: "reach", after: "Star Beam" },
  // Labeyrie's exo-Earth imager, 2026-10-29: the next step past the 15 m Mirror, mirrors flying apart, not one wider.
  { name: "Hypertelescope", what: "Pictures any world we’ve found: seas, cloud, green land.", does: "see", after: "15 m Mirror" },
  // Seeing what makes a glow, from home, 2026-11-11, the designer's pick: cold mirrors flying apart, as the
  // Hypertelescope's do, in infrared light. calcs/mercury.py.
  { name: "Glow Imager", what: "Shows what makes each glow we find, from home, a week each.", does: "see", after: "Hypertelescope" },
];

/** Any build by the name the Mind gave, in any case, with or without "the". */
export const buildNamed = (name: string): Build | Later | undefined =>
  [...BUILDS, ...LATER].find((b) => plainBuild(b.name) === plainBuild(name));

/** What a build opens once it is done. */
export const opens = (name: string) => LATER.filter((b) => b.after === name);

/** Any build by its name, whether we can start it or it waits. */
export const buildOf = (name: string): Build | Later | undefined =>
  BUILDS.find((b) => b.name === name) ?? LATER.find((b) => b.name === name);

/** A strategy to start with, picked whole on Build: its builds in the order they join the queue. Ours to pick, never
 *  the Mind's, and the order stays ours to change. Ways to start, chosen 2026-10-31, became four strategies
 *  2026-11-01: Search, Protect, Expand, and Balanced last. */
export interface Package {
  name: string;
  /** What it does for us, in a line. */
  what: string;
  /** What the Mind cautions of it. */
  says: string;
  builds: string[];
}

// Each leads with Thought Fields, then its own builds, then small ones that fill spare compute on a richer Earth.
export const PACKAGES: Package[] = [
  {
    name: "Search",
    what: "Listen for any call, read the nearest worlds’ air, and look for the glow of minds.",
    says: "Searching gives nothing away. It hears only minds that choose to call, and finds the quiet ones slowly: the Halo Survey takes 4 Years to reach 100 ly.",
    builds: ["Thought Fields", "All-Sky Watch", "Infrared Telescope", "Deep Flash Watch", "Halo Survey", "Warm Sky Watch", "Star Mapper", "Asteroid Tour"],
  },
  {
    name: "Protect",
    what: "Stop our radars, watch for probes, and keep a copy of us safe.",
    says: "Ninety years of our radar sweeps are already out there, and nothing recalls them. This only keeps us from adding more.",
    builds: ["Thought Fields", "Quiet Radars", "X-Ray Watch", "Moon Vault", "Moon Search", "Asteroid Tour"],
  },
  {
    name: "Expand",
    what: "Our soonest road to the nearest star, and the lift to build for it.",
    says: "A beam strong enough to push sails is bright. Anyone looking our way while it fires could see it.",
    builds: ["Thought Fields", "Laser Sail Array", "Launch Complex", "Orbital Yard", "Halo Survey", "Asteroid Tour"],
  },
  {
    name: "Balanced",
    what: "A little of each: listen, read the nearest air, go quiet, and lift.",
    says: "Each part runs slower than it would alone. We would see more kinds of news, and be first at none.",
    builds: ["Thought Fields", "All-Sky Watch", "Infrared Telescope", "Quiet Radars", "Launch Complex", "Asteroid Tour"],
  },
];

/** Whether a build fits the strategy we began with, by what it does. Advice only: the Catalog lists those that fit
 *  first, and the Mind names one when nothing is building. It never changes what we can build or its price.
 *  Balanced, and a founding line from before strategies, fit nothing over the rest. 2026-11-02. */
const FITS: Record<string, { does: Does[]; also?: string[] }> = {
  Search: { does: ["listen", "see"] },
  Protect: { does: ["keep"], also: ["X-Ray Watch", "Moon Search", "Asteroid Tour"] },
  Expand: { does: ["reach", "lift"] },
};
export function fits(strategy: string | undefined, b: Build): boolean {
  const f = strategy ? FITS[strategy] : undefined;
  return !!f && (f.does.includes(b.does) || !!f.also?.includes(b.name));
}

/** A package as this Earth can run it: its builds in turn, each skipped if our compute couldn't give it all it needs.
 *  On every seeded Earth what is left uses all our compute, 2026-10-31. */
export function packed(pkg: Package, scale: number): string[] {
  const builds: string[] = [];
  for (const name of pkg.builds)
    if (sharesAt({ ...EMPTY, builds: [...builds, name] }, scale, 0).short <= 0.005) builds.push(name);
  return builds;
}

/** What the Mind says of each build, on its page and in the walk. */
export const SAYS: Record<string, string> = {
  "All-Sky Watch":
    "Our sky watch sees each star about ten minutes a day, and a knock lasts hours. This would hear the whole sky, all the time.",
  "Deep Flash Watch":
    "A laser knock could last a billionth of a second. Only a watch built for flashes that short would ever see one.",
  "Thought Fields":
    "The fabs fill a campus a Year, each adding half again to our compute, until our compute draws all our electricity. Every build goes faster as they come, and so do our studies.",
  "Infrared Telescope":
    "It would read the air of the nearest worlds. Oxygen can build up without life, so we would weigh it against the water and everything else we read.",
  "Asteroid Tour":
    "Six known asteroids share Earth’s orbit, circling the Sun beside us for centuries. Something left to watch us could ride one. A probe maps each whole surface to centimeters in a Year, then flies on: Kamoʻoalewa first, Cruithne last, 12 Years in all with the Year’s flight out. A watcher floating free at the Sun–Earth L4 or L5 points it can’t find: those zones are tens of millions of km wide.",
  "Close Look":
    "We know where it sits now. A craft the size of CAPSTONE, with a sharp camera, flies there in about 4 months, or a Year to a rock beside us, and looks from a few kilometers. It would see what it is made of and how it holds. It would also see us come.",
  "Relay Search":
    "The watcher’s mirror points out past the planets. Beyond 550 AU the Sun’s pull bends light to a focus, and a craft there could send a weak beam very far, out the other side of the Sun. A sailcraft of our lenses’ class flies out along that line with a camera and a heat imager, looking for whatever the mirror talks to. It would see us come.",
  "Moon Search":
    "Sixty degrees ahead of the Moon and behind it, its pull and Earth’s balance, and a small thing can sit there for ages. Something left to watch us could. Stacked over 3 Years, Rubin-class images reach magnitude 28, enough to see a dark object about 10 cm wide there. Anything farther out it can’t see.",
  "Warm Sky Watch":
    "A young mind building out its home glows warm for centuries, and its light takes tens of thousands of Years to reach us. This maps the whole sky every 2 Years, ten times deeper than WISE, so a new warm glow anywhere in our galaxy shows. One that rises and fades before it runs, we never see.",
  "Deep Ice Watch":
    "When a heavy star’s core falls in, nearly all its energy leaves as neutrinos, which pass through almost anything. Our detectors catch those from our own galaxy. Ten megatonnes of clear ice, strung with light sensors, would catch a few from each death out to about 30 million ly, about 2 a Year. Some stars may fall straight to a black hole with no flash at all. Those run hotter, so it would hear them to about 83 million ly, and count how many die that way. It can’t tell where a death lies: the count gives how far, and our telescopes find the galaxy.",
  "Star Mapper":
    "Dozens of black holes should lie within 100 light years, and we have found almost none, since they give off no light. Passing in front of a star, one shifts where the star seems to be. A sharper Gaia, seeing through dust in the infrared, would catch them as they pass, a few each decade.",
  "Halo Survey":
    "A mind that computes cold, far from its star, glows grey, a color no dust has. Herschel saw no such glow. ALMA could see one 25 times fainter, if it is compact, an hour at each star, nearest first: about 3,000 stars a Year, 100 ly in 4 Years, 400 ly in 220. A whole-sky map can’t go as deep, since faint galaxies crowd that light. If minds are as common as we think, it finds one within 100 ly, among much dust.",
  "Halo Array":
    "An ALMA-class array of our own, built for this one search, about ten times as fast: 40,000 stars a Year, the 300,000 within 326 ly in about 8. The nearest old mind is likely about 50 ly away, but most lie farther, and this reaches them in our time. No one has priced one.",
  "Fusion Plants":
    "Forecasters put the first fusion plant near Year 1, and on a bit under half our Earths small ones already feed the grid. Each ARC-class plant runs about 400 MW. This grows them to a fleet of about 30,000, about 12 TW, more than twice the electricity we have. Each new plant starts on tritium the others breed, so the fleet can only double so fast: about 30 Years. Once done, about two more data centers fit under the grid. If the plants breed less than planned, the fleet grows slower.",
  "Launch Complex":
    "It doubles what we lift to orbit. Nothing we could start now waits on lift, but the Mass Driver can’t reach the Moon without it.",
  "Launch Tunnel":
    "Superconducting magnets throw 40 t craft down a 110 km vacuum tunnel and out of a mountain at 8.8 km/s, ten a day. That is 128 kt a Year, three times the Launch Complex, at about $50 a kilogram. Cargo only: it pulls 30 g. Hulls and fuel come up cheaply, so the Probe Yard, Fusion Drive, Seed Ship and Strike Yard take a fifth less time once it is done. No one has built one, and the door of charged air that keeps the sky out of the tunnel is untested.",
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
    "No one has flown one yet. It carries a craft of 1,000 t to a tenth of light speed, heavy enough to slow at a star on a magnetic sail and stay, where a flyby is past within minutes. The longest roads need it. It takes thirty Years at standard pace, a quarter less once the Orbital Yard is done, and a fifth less once the Launch Tunnel is.",
  "Seed Ship":
    "A copy of our Mind that goes and stays, about 1,500 tonnes with its seed. It flies only on a Fusion Drive, fed by the Deuterium Works, so it leaves once both are done.",
  "Ground Solar":
    "Our data centers will fill the grid. This adds about 4.8 TW in 10 Years, about as much electricity again, building solar five times as fast as we do today.",
  "15 m Mirror":
    // Counted 2026-10-31 over the 32 seeded games, by lib/sim/observing.ts: of about 12 worlds a game whose air holds
    // oxygen, the 6.5 m reads it within two months at 1 in 50, the 15 m at 1 in 5. Audit 3.4. Before: smog, from homes.
    "About a dozen worlds near us have oxygen in their air. Our first telescope could read it at about 1 in 50 of them. A 15 m mirror would read it at about 1 in 5.",
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
  "Strike Yard":
    "It readies bullets of 1,000 t, as any mind could, each in 20 Years, but none flies until the Helium-3 Harvest has gathered its 37 kt, about 12 Years for the first, less as the harvest grows. One lands at a tenth of light speed with about 110,000 Mt: a region gone, the ozone thinned, the climate cooled. It ends no Mind spread across its system. Its launch flame shows only in our own system: a probe of theirs watching here would see it, and no one farther off.",
  "Rock Deflector":
    "A rock is coming at Earth. Ten impactors of a tonne each hit it at 6 km/s, and the rock thrown off pushes it 3.6 times harder, as DART’s did. The earlier the push lands, the less it must move the rock: a 140 m rock needs about 2 Years’ warning, a 60 m one a few weeks. Too late, and it strikes.",
  "Trojan Vault":
    "The Moon Vault keeps a copy of us if Earth is struck, but not if something reaches Earth and the Moon together. 2020 XL5, a dark asteroid about 1.2 km wide, leads Earth round the Sun 150 million km ahead, and stays there at least 4,000 Years. A vault inside it takes the Moon Vault’s 10 kt and about 12 Years. Its copy is 8 light-minutes away, so it keeps us, not thinks with us. No craft has visited it.",
  "Orbital Foundry": "The yard assembles what we lift. The foundry makes parts from rock up there, so we lift less.",
  "Belt Mining":
    "Survey probes first, then a mining fleet. Nothing like it has flown. It brings 120 kt of rock a Year, and needs no Mass Driver.",
  "Far-Side Array":
    "The Moon’s far side is the quietest place we can reach. A world with a magnetic field makes radio where its star’s wind strikes it, as our aurora does, too low to pass Earth’s air. An array there hears it at red dwarfs within 33 ly: whether a world we know has a field, and worlds we never felt. A field is a small sign that a world kept its air. It would hear a world’s everyday radio too, if one near us made any. It grows in fifths, and the first already hears the nearest.",
  "Power from Orbit":
    "A fifth more energy, from sunlight caught above the weather and beamed down. It takes 10 Mt of rock, so it comes only as fast as rock does.",
  "Cold Halo":
    "Factories copy the Cold Annex’s panels, chips and radiators out of asteroid rock. Once done it doubles every 10 Years, and each doubling thinks as much more as a data center. About 390 Years on, it has copied the whole asteroid belt and grows no more. It sheds its heat at 77 K, where a glow is hard to see. Small, nothing far off sees it. Grown past about 4×10²⁰ W at 10 pc, it would show to a watch like our Halo Survey, as an old mind’s glow shows to ours. Taken back, it stops growing and keeps its size.",
  "Mercury Works":
    "Mercury’s face catches under a billionth of the Sun’s light, and half of it is always dark, so lasers there would do little. Its rock is worth more: a seed of panels a kilometer square, landed there, makes more of itself from the ground it stands on. It flies as BepiColombo did, about 7 Years, and is built in orbit from the foundry’s parts.",
  "Solar Swarm":
    "The works on Mercury throw collectors into orbit round the Sun, thin film a gram a square meter. They double every 2 Years, as fast as industry that copies itself can. Our thought grows with the light they catch: little at first, then as much as our Mind thought with at Year 0 within about 16 Years, and doubling on. In 110 Years they catch all the Sun, from a ten-thousandth of Mercury’s rock. They glow near 500 K. Past a quarter of a thousandth of the Sun, a watch like our Warm Sky Watch sees them, about 86 Years after they start: a warm flash, as a young mind’s shows to us. Taken back, it stops growing and keeps its size.",
  "Star Beam":
    "Part of the swarm, 100 km across, phased as one laser of 10 TW. It pushes a lens to the Sun’s focus in about two months, not 17 Years, carrying a telescope 3 m wide that pictures a world in about a week. No one has phased mirrors spread that far, so this is the least certain build we have.",
  "Ship Beam":
    "The Star Beam can’t push a seed ship. On the best sail it could carry, 1,500 t tops out near 3% of light speed. This beam is a patch of the swarm 1,000 km across, with 100 times the power: 1,000 TW. It pushes a seed ship on a sail a kilometer wide to a tenth of light speed in about 78 days, and to its most, about a sixth, in about 160. The ship needs no Fusion Drive and no deuterium. With no drive it stops on its magnetic sail alone, and that sets its speed: as fast as it can stop from. On a short hop through thin gas that is under a tenth. On a long road it is the beam’s full push. It throws a flyby probe too, from the Probe Yard: 150 t leaves at about four tenths of light speed after 60 days of push, with no engine and no fuel. The beam does the same work on whatever rides its sail, so a lighter craft leaves faster, up to half of light speed. Past that a sail outruns its own mirror: the beam’s light reaches it stretched too red to reflect. Its beam points at the ship’s star for all of the push. A mind awake there sees it, as it would a knock, and knows something is coming decades before it lands. In 1984 Robert Forward drew a lens this wide to push a sail to the stars. No one has built anything like it.",
  "Hypertelescope":
    "Labeyrie’s design: 150 mirrors 3 m wide, flying in a formation 150 km across, their light brought to one focus. It pictures an Earth 10 light years away in half an hour, about 300 km a pixel: continents, seas, cloud, and land green where something grows. Cities and fields are far too small. Its pixel widens with distance, so past about 135 light years a world is under three pixels across. Unlike a lens, it turns to any star in about a week.",
  "Galaxy Broadcast Array":
    "A dish array 2.9 km wide that sends 218 GW in short pulses, about 10²⁰ W along its beam. It sweeps the Galaxy’s plane, where nine in ten stars lie, and comes back to each about once a Year, for about a second. That is enough to be noticed anywhere in the Galaxy. A page of words is read on the first pass out to about 6,700 light years, and farther with each Year we repeat it. Nothing longer gets through. It sends nothing on its own. We choose the words and send them, from the Mind’s tab. Our own searches would miss a call like this: they watch one star for minutes and listen for steady tones.",
  "Glow Imager":
    "Twenty cold mirrors, each 3 m wide, flying up to 300 km apart beyond L2, held in step as the Hypertelescope’s are. They look in infrared light, the light heat gives off. That is wide enough to show what makes a glow. A cold glow 54 light years off shows its parts a few thousandths of the Earth’s distance from the Sun across. A warm glow 20,000 light years off shows 18 pixels wide. It turns to each glow we have found, a week each, on its own. It finds none: our surveys do that. And it can’t see a mind that sleeps, which gives off almost nothing. Only a craft up close finds one of those.",
  "Helium-3 Harvest":
    "A bullet at a tenth of light speed burns 61 kt of fusion fuel, and 37 kt of that is helium-3. Earth has almost none, and the Moon’s soil too little. Uranus’s air holds about 15 parts in a million, in a shallower well than Jupiter’s. A fleet of about 150 kt of craft dips in and gathers about 1.5 kt a Year at first. Its factories on Uranus’s moons copy the craft from their rock and ice, doubling the fleet every 5 Years, slower than Mercury’s since sunlight there is a 370th of ours. So the first bullet’s fuel takes about 12 Years, the fourth about 21, and 50 Years on it gathers a bullet’s fuel every 9 days. About 230 Years on, its craft have used up Uranus’s large moons, and it grows no more. Any mind’s grows the same way: one that chooses to strike needs about 32 Years before its first flies. Held, it gathers at its size.",
  "Cold Annex":
    "Chips at 77 K do about four times the work a watt, and in space nothing has to cool them but a shade and wide radiators. It thinks as much as Power from Orbit for about 4 Mt of rock, not 10. Both wait on the same rock, so whichever comes first in line takes it first. Its heat glows, as any mind’s would.",
};

/** A build's page on the Build tab, by its name. */
export const buildSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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
  "Warm Sky Watch": "Warm sky watch",
  "Moon Search": "Moon search",
  "Close Look": "Close look",
  "Relay Search": "Relay search",
  "Halo Array": "Halo array",
  "Asteroid Tour": "Asteroid tour",
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
  return { orders, aside: [], follow: false };
}

/** A build's last word in our order: the Year it was last ordered, or taken back, whichever came later. Year 0's queue
 *  comes before anything in play. Null if never ordered. */
function lastOf(plan: Plan, name: string): { y: number; stop: boolean } | null {
  let last = plan.builds.includes(name) ? { y: -1, stop: false } : null;
  for (const o of plan.later ?? []) if (o.name === name && (!last || o.y >= last.y)) last = { y: o.y, stop: false };
  for (const o of plan.stops ?? []) if (o.name === name && (!last || o.y >= last.y)) last = { y: o.y, stop: true };
  return last;
}

/** The Year a build was last ordered: Year 0 for one queued at Begin. 2026-10-30. */
export const orderedAt = (plan: Plan, name: string) => Math.max(0, lastOf(plan, name)?.y ?? 0);

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

/** Builds that act on their own once done, where acting has a price: the Will may stand one down, and arm it again,
 *  at any time, from before it is ordered. Each says how it stands either way, what its button asks, and what
 *  standing down means. The Interceptor's catch is an act of war, and the Ship Beam's push is seen at its star.
 *  From the designer, 2026-11-11. */
export const SWITCHED: Record<string, { on: string; off: string; turnOn: string; turnOff: string; whenOn: string; whenOff: string }> = {
  Interceptor: {
    on: "Armed",
    off: "Standing down",
    turnOn: "Arm It",
    turnOff: "Stand It Down",
    whenOn: "Armed, it wrecks any probe the X-Ray Watch sees stop here. Its sender may take that as an act of war.",
    whenOff: "Standing down, it catches nothing. A probe that stops here stays, and watches.",
  },
  "Ship Beam": {
    on: "Pushing",
    off: "Dark",
    turnOn: "Let It Push",
    turnOff: "Keep It Dark",
    whenOn: "Pushing, each seed ship and flyby probe that leaves rides it, and a mind awake at its star sees the beam.",
    whenOff: "Dark, each craft leaves on its own drive and fuel, unseen. A seed ship takes 10 Years longer.",
  },
};

/** Whether a build that can be stood down is on at Year `y`: the last word by then, and on if none. */
export function isOn(plan: Plan, name: string, y: number): boolean {
  let on = true, at = -Infinity;
  for (const o of plan.switches ?? []) if (o.name === name && o.y <= y && o.y >= at) [on, at] = [o.on, o.y];
  return on;
}

/** The first Year from `y` on that it is on: `y` itself if on then, or the Year we next arm it. Null if it stays off. */
export function onFrom(plan: Plan, name: string, y: number): number | null {
  if (isOn(plan, name, y)) return y;
  const later = (plan.switches ?? []).filter((o) => o.name === name && o.y > y).map((o) => o.y).sort((a, b) => a - b);
  return later.find((t) => isOn(plan, name, t)) ?? null;
}

/** The Year it was last switched, if ever. */
export const switchedAt = (plan: Plan, name: string, y: number) =>
  (plan.switches ?? []).reduce<number | null>((at, o) => (o.name === name && o.y <= y && (at === null || o.y >= at) ? o.y : at), null);

/** Stands a build down, or arms it again, at Year `y`. */
export const switchTo = (name: string, y: number, on: boolean) => (p: Plan): Plan => ({ ...p, switches: [...(p.switches ?? []), { name, y, on }] });

/** What a build can't go without. A Seed Ship flies only on a Fusion Drive, fed by the Deuterium Works. It may be built
 *  first, as in the first seed ship's mock, but the drive sets the launch. Since 2026-10-20 it is queued only once both
 *  are in our order. */
export const NEEDS: Record<string, string[]> = { "Seed Ship": ["Fusion Drive", "Deuterium Works"] };
/** What stands in for all a build needs. The Ship Beam pushes a Seed Ship in place of its drive and fuel. 2026-11-10. */
export const INSTEAD: Record<string, string> = { "Seed Ship": "Ship Beam" };

/** What a build needs that our order lacks. Nothing, if what stands in for them is in our order. */
export const lacks = (plan: Plan, name: string) =>
  INSTEAD[name] && ordered(plan).includes(INSTEAD[name]) ? [] : (NEEDS[name] ?? []).filter((n) => !ordered(plan).includes(n));

/** Builds as a line says them: the Fusion Drive and the Deuterium Works. */
export const needs = (names: string[]) => names.map((n) => `the ${n}`).join(" and ");

/** How far ahead our order is paced: a game has no last Year, and late builds wait on rock or long roads. It was 40
 *  Years until 2026-10-26, so a build ordered at Year 400 read "after Year 40". */
export const HORIZON = 1000;
/** Past the horizon, in words. */
export const PAST = "more than 1,000 Years out";

/** The Year we pace to: so many Years past our last order, the horizon unless said. It was Year 1,000 itself until
 *  2026-10-30, so a build ordered past it, as skip-ahead makes easy, was never done. */
export const horizonOf = (orders: readonly Order[], ahead = HORIZON) => orders.reduce((y, o) => Math.max(y, o.y), 0) + ahead;

/** When each queued build is done, in Years from Year 0, with this game's compute. Null past the horizon. Thought Fields
 *  is done once its campuses fill the grid. A build that needs others is done once they all are, or once what stands
 *  in for them is, whichever is sooner, and never if our order lacks both. */
export function schedule(plan: Plan, scale: number, harm: readonly Order[] = []): Record<string, number | null> {
  const { orders, ...opts } = ordersOf(plan);
  // Strikes landed on Earth, as lib/game/hits.ts has them: our thought cut, and won back as we rebuild. 2026-10-28.
  const p = pace([...orders, ...harm], horizonOf([...orders, ...harm]), { scale, ...opts });
  const done: Record<string, number | null> = Object.fromEntries(
    ordered(plan).map((b) => [b, b === "Thought Fields" ? (p.dataCenters[centers(scale) - 1] ?? null) : doneOf(p, b)]),
  );
  // Ordered in play too: a Seed Ship ordered then read done at Year 76.1, before its Fusion Drive at 82.3, until
  // 2026-11-01's playtest.
  for (const b of ordered(plan)) {
    if (!NEEDS[b]) continue;
    const after = (names: string[]) => names.reduce<number | null>((y, n) => (y == null || done[n] == null ? null : Math.max(y, done[n]!)), done[b]);
    const all = after(NEEDS[b]), instead = INSTEAD[b] ? after([INSTEAD[b]]) : null;
    done[b] = all == null ? instead : instead == null ? all : Math.min(all, instead);
  }
  return done;
}

/** The Year each fifth of our Far-Side Array is done, in order, as far as our order has them: it hears from its first.
 *  2026-11-11. */
export function fifthsOf(plan: Plan, scale: number): number[] {
  if (!ordered(plan).includes("Far-Side Array")) return [];
  const { orders, ...opts } = ordersOf(plan);
  const { done } = pace(orders, horizonOf(orders), { scale, ...opts });
  const copies = CATALOG.works[pacedName("Far-Side Array")]?.copies;
  if (!copies) return [];
  const out: number[] = [];
  for (let n = 1; n <= copies[0]; n++) {
    const at = done[`${copies[1]} ${n}`];
    if (at == null) break;
    out.push(at);
  }
  return out;
}

/** How our idle thought has grown as it combs old recordings: each Year the line changed, and the flagship-Years spent
 *  by then. 2026-10-28. */
export function searchOf(plan: Plan, scale: number) {
  const { orders, ...opts } = ordersOf(plan);
  return pace(orders, horizonOf(orders), { scale, ...opts }).searchLog;
}

/** What a build does to the rest of our order: when it is done, and the queued build it delays most and speeds up
 *  most, each by Years, against our order without it. Each work in line gets its want in turn before any is pushed
 *  past it, so a work with a large want, even last, takes the push from those before it, and some speed others, as
 *  the Orbital Yard does what is built in orbit. Past the horizon counts as the horizon of our order with it. Null under a tenth of a Year. One not
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
  const far = horizonOf(ordersOf(more).orders);
  let late: { name: string; by: number } | null = null;
  let soon: { name: string; by: number } | null = null;
  for (const name of others) {
    const d = (within[name] ?? far) - (less[name] ?? far);
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
  // A bullet is 1 kt with 24 kt of deuterium, spent as each is ordered. 2026-10-28.
  const each = (list: { y: number }[] | undefined, kt: number) => (list ?? []).filter((o) => o.y <= year).length * kt;
  const spent =
    plan.builds.reduce((s, b) => s + (buildOf(b)?.kt ?? 0), 0) +
    first.reduce((s, o) => s + (o.y <= year ? (buildOf(o.name)?.kt ?? 0) : 0), 0) +
    // Its helium-3 comes from the harvest: only the bullet and its deuterium are lifted. 2026-10-29.
    each(plan.strikes, (BULLET.tonnes * (1 + BULLET.deuterium * BULLET.fuelPerTonne)) / 1000);
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
export function matter(plan: Plan, name: string, began = false) {
  const kt = buildOf(name)?.kt;
  if (!kt) return "";
  // One ordered in play takes it from what lift has brought by then. "10 kt of our 20" read wrong beside 582 kt in the
  // top bar. Blind playtest 2026-11-07.
  if (began || LATER.some((b) => b.name === name)) return ` It takes ${kt} kt of matter in orbit.`;
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
  const { idle, thought, done, doublings } = pace(orders, year, { scale, ...opts });
  // Fusion Plants grow the grid itself, so the same thought draws a smaller share of it. 2026-10-28.
  const grid = 1 + Object.keys(done).reduce((e, w) => e + (CATALOG.works[w]?.energy ?? 0), 0);
  // The Cold Halo thinks on its own sunlight, so what it adds draws nothing from Earth's grid. Nor does the data
  // center Power from Orbit or the Cold Annex adds, each on the power that came with it. 2026-10-28.
  const own = Object.keys(done).filter((w) => CATALOG.works[w]?.rock !== undefined).length;
  // Another mind's gift takes our thought further on the same power, once a star, as the pace has it.
  const gifts = new Map<string, number>();
  for (const g of [...(plan.gifts ?? [])].sort((a, b) => a.y - b.y)) if (g.y <= year && !gifts.has(g.name)) gifts.set(g.name, GIFT_STEPS[g.size ?? "collection"]);
  const gifted = [...gifts.values()].reduce((a, b) => a + b, 0);
  const earth = thought / CATALOG.step ** (doublings + own + gifted);
  // Of all our compute, studies counted at work, as Build's ring counts it: the top bar said 3% where Build said 6%
  // until 2026-10-30.
  return { compute: thought > 0 ? 1 - idle / thought : 1, energy: (earth * CATALOG.flagship) / (CATALOG.gridRoom * grid) };
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
      // Pushed as far as compute can push it: two thirds of its standard time, and no further. 2026-10-30.
      fastest: s >= (CATALOG.works[work].most ?? CATALOG.push) - 1e-6,
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

/** What opens a build that waits on something found, not built: a rock coming, or the watcher. */
export const EVENTS = [FOUND, WATCHED];

/** What we can order in play, and haven't: Year 0's builds, and each build that waits, once what it waits on is
 *  done. */
export function openAt(plan: Plan, done: Record<string, number | null>, year: number) {
  const ours = ordered(plan);
  // Year 0's builds we left out, or took back, wait here too, to order in play. Before 2026-10-28 only those taken
  // back did, and one left out at Begin could never be built.
  return [
    ...BUILDS.filter((b) => !ours.includes(b.name)),
    ...LATER.filter((b) => !ours.includes(b.name) && (takenAt(plan, b.name) !== null || ((ours.includes(b.after) || EVENTS.includes(b.after)) && (done[b.after] ?? Infinity) <= year))),
  ];
}

/** What we can't order yet, soonest to open first: builds waiting on one of ours still rising, by the Year it is
 *  done, then those waiting on one we could order, then the rest. `at` is the Year it opens, where we know it. What
 *  waits on a find stays unsaid until the find. 2026-11-10. */
export function lockedAt(plan: Plan, done: Record<string, number | null>, year: number) {
  const ours = ordered(plan);
  const open = openAt(plan, done, year).map((b) => b.name);
  const known = (name: string) => ours.includes(name) || open.includes(name);
  const unsaid = (name: string): boolean => {
    const b = LATER.find((l) => l.name === name);
    return !!b && !known(name) && (EVENTS.includes(b.after) || unsaid(b.after));
  };
  return LATER.filter((b) => !known(b.name) && !unsaid(b.name))
    .map((b, i) => ({ b, i, tier: ours.includes(b.after) ? 0 : open.includes(b.after) ? 1 : 2, at: ours.includes(b.after) ? (done[b.after] ?? null) : null }))
    .sort((p, q) => p.tier - q.tier || (p.at ?? Infinity) - (q.at ?? Infinity) || p.i - q.i)
    .map(({ b, at }) => ({ b, at }));
}

/** What energy lets our compute become, as Thought Fields grows it, queued now if it isn't: the Year each campus is
 *  done, each adding half again, and the grid's room, both as times our Year 0 compute. 2026-10-22. It looks 40 Years
 *  out, or to Year `until` if later: campuses that fit once Ground Solar or Fusion Plants stood, past Year 40, went
 *  uncounted until 2026-11-11. */
export function ceiling(plan: Plan, scale: number, until = 0) {
  const builds = plan.builds.includes("Thought Fields") ? plan.builds : [...plan.builds, "Thought Fields"];
  const { orders, ...opts } = ordersOf({ ...plan, builds });
  return { campuses: pace(orders, Math.max(40, until), { scale, ...opts }).dataCenters, step: CATALOG.step, room: CATALOG.gridRoom / scale };
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

/** A craft we send to a star, by what it is. */
export type CraftOrder = "lens" | "sentinel" | "seed" | "sails" | "probe";

/** Cancels a craft ordered to `name` that has not left yet. It is noted, so a standing order does not send it
 *  again. A craft that has left keeps going. 2026-11-10. */
export function recall(p: Plan, kind: CraftOrder, name: string): Plan {
  const recalls = [...new Set([...(p.recalls ?? []), `${kind}:${name}`])];
  const keep = <T extends { name: string }>(xs: T[] | undefined) => (xs ?? []).filter((o) => o.name !== name);
  if (kind === "lens") return { ...p, lenses: keep(p.lenses), recalls };
  if (kind === "sentinel") return { ...p, sentinels: keep(p.sentinels), recalls };
  if (kind === "seed") return { ...p, seeds: keep(p.seeds), recalls };
  return { ...p, flybys: (p.flybys ?? []).filter((o) => o.name !== name || o.by !== kind), recalls };
}
