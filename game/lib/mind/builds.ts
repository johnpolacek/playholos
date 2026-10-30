// What Earth can build, and how far our order has come, for the Mind. Without it the Mind named builds that don't
// exist, guessed whether a watch was done, and called the drift scan our only ear at Year 40 with the All-Sky Watch long
// built. Times are Build's: a build's standard pace, and each one in our order as schedule dates it. 2026-10-23.
import { BUILDS, kt, LATER, ordered, takenAt, takes } from "@/lib/game/plan";
import { lensTrip } from "@/lib/game/reach";
import { FOUND, harm, rockAt, type Rock } from "@/lib/game/rocks";
import type { Plan } from "@/lib/game/types";

const tenth = (y: number) => Number(y.toFixed(1));

// What the Mind needs past a build's line. The telescope reads the three gases lib/sim/observing.ts has bands for, and
// the Mind had offered methane. The 15 m Mirror's reach is observing.ts's dark patch on a 15 m mirror, and the Mind had
// said no telescope we could build would split Proxima b. That it aims itself is lib/sim/knowledge.ts's readings, and
// the Mind had promised to point it. 2026-10-23.
const MORE: Record<string, string> = {
  "Infrared Telescope": "It reads three gases in a world's air: water, oxygen and ozone. Once done, it looks at every world we've felt on its own, nearest first, so no one aims it.",
  "Solar Lens": "Once done, the Will sends each lens from a destination's page on Reach, one a star, only to a world we've felt. A lens reaches the Sun's focus about 17 Years after it leaves, looks for half a Year, and its picture is home about 3 days later. Once the Laser Sail Array is done, it pushes each lens out in about 5 Years instead, and once the Star Beam is done, in about two months, carrying a telescope 3 m wide that looks for a week. It shows what is wider than its pixel, about 25 km at 100 ly: cities, cleared land, forests, ice. Never roads or dams.",
  "Probe Yard": "It builds flyby probes, and sentinels: once a Fusion Drive and the Deuterium Works are done too, the Will can send a sentinel from a destination's page on Reach, one a star. The yard builds it in 20 Years. It flies at a tenth of light speed, brakes on its flame and stays, and sees what a flyby can't: who lives there, or their ruins. Its braking flame points at the star, so whoever lives there may see it come.",
  "Star Mapper": "Once done, it watches on its own and finds each black hole the first time it passes close in front of a star it sees, a few each decade. A black hole found becomes a destination on Reach, where a sentinel can go. A hole is worth having: rock fed to it gives back 6% to about 30% of its mass as light, where fusion gives under 1%, it swallows heat unseen, and close in a clock runs up to 10 times slow. Using it costs little in being seen: a braking flame shows only close in, and a furnace stays below what X-ray surveys see until it grows past about a millionth of the Sun's output. A neighbor nearer to a hole may reach it first.",
  "Seed Ship": "It carries one copy of our Mind, so it goes to one place, from that place's page on Reach. To a black hole we have found, to feed the hole for power or to hide in its shadow: a furnace grows fast and shows to X-ray surveys once it passes about a millionth of the Sun, and a refuge stays small and unseen. Or to a star with a world we know, the world next door or one we have felt, to settle on its light and rock. Anyone living there sees it brake in. Any of these is a Mind of ours that lives if Earth does not.",
  "Halo Survey": "Once done, it looks at each star for an hour, nearest first, on its own: about 3,000 stars a Year, 100 ly in 4 Years, 400 ly in about 220. It sees a compact cold glow, not a wide one, and tells a grey glow from dust's. No whole-sky map reaches as deep.",
  "Halo Array": "Once done, it searches as the Halo Survey does, ten times as fast: 40,000 stars a Year, 400 ly in about 17 Years, 1,000 ly in about 210.",
  "Asteroid Tour": "Once done, its probe reaches Kamoʻoalewa a Year later and maps each of the six asteroids sharing Earth's orbit in turn, a Year each and a Year between, about 12 Years in all, Cruithne last. It finds anything on them down to centimeters. It can't search the Sun–Earth L4 or L5 zones, which are tens of millions of km wide.",
  "Moon Search": "Once done, it stacks deep images of the Earth–Moon L4 and L5 points for 3 Years and finds anything there down to about 10 cm, even near black. It sees nothing at the Sun–Earth points or on asteroids.",
  "Warm Sky Watch": "Once done, it maps the whole sky in warm infrared every 2 Years, on its own, and sees a new warm glow appear anywhere in our galaxy. It can't tell how far a glow is, or what makes it. A glow that rose and faded before it ran is gone for good.",
  "Mind Link": "Once done, and once word has come that our Mind there stands, the Will can move to it, wherever it is, from that place's page on Reach. It goes as a transmission, 100 PB, which takes days at that distance, then the light-time. The crossing costs that time: the Will is dark for it, a Year for each light-year, ordering nothing and hearing nothing, while Earth goes on by our orders and charter. Living there, every order from the Will reaches Earth that many Years late, and Earth's news reaches the Will as late. In a refuge, our Mind there can spread over chips 10 cm wide on the innermost stable orbit, which tides can't break, so its clock runs slow and the sky outside goes by faster. A furnace's disk fills that orbit, so it can't.",
  "Orbital Ring": "A broken ring rises to a higher orbit rather than falling, since the loads that held it down are gone, and takes thousands of Years to come down. What can fall are the skyhooks and cables, into cleared ground beneath them. A meteoroid cuts a cable about once in 14,000 Years, far less with spare strands. The ring is no radio source: it reflects Earth's own noise about a million times fainter.",
  "X-Ray Watch": "Once done, it sees any probe that brakes all the way into our system, weeks before it stops, and its direction. A probe that stops far out, or a bullet coasting dark, it never sees.",
  "Interceptor": "Once done, with the X-Ray Watch, it wrecks every probe the watch sees, as it stops. Its sender learns its probe went dark one light-time later, and may take it as an attack.",
  "Quiet Radars": "Once done, a neighbor whose ears open after our last sweep passes never hears us, and never answers what it didn't hear. Every neighbor that has heard us hears us stop, one light-time later.",
  "Picket Yard": "Once done, a screen can be ordered on the line to any star from its page on Reach, 4 Years each and 2 kt. A bullet from that star landing after the screen stands is wrecked and does no harm. A bullet coasts dark. We know one is coming only if a sentinel of ours stands at its star and sees it fired, ten times sooner than it lands.",
  "Strike Yard": "Once done, the Will can fire a bullet at a star from its page on Reach, one a star: 20 Years to ready it, and it flies only once the Helium-3 Harvest has gathered its 37 kt, about 24 Years a bullet, in the order ordered. Without the harvest, none flies. Then a tenth of light speed. It lands with about 110,000 Mt. It harms but doesn't end a Mind spread across its system. Its launch shows only in our own system, to a probe of theirs watching here. The struck star knows where it came from, and answers as it chooses, maybe in kind.",
  "Trojan Vault": "It keeps a copy of our Mind 8 light-minutes from Earth, out of reach of a strike on Earth and the Moon together. It doesn't think with us: it keeps a copy that could carry on if Earth and the Moon were lost.",
  "Ground Solar": "Its fifth more energy counts once it is done, but it fits a whole data center more only on some Earths, where the grid had nearly room for one. On most it adds energy we don't yet think with.",
  "Fusion Plants": "Once done, the grid holds half again as much energy, so one more data center of Thought Fields fits. Until then it adds nothing to our thought: the fleet grows by breeding its own tritium, and the energy counts once it stands.",
  "Cold Halo": "It doubles every 10 Years once done, each doubling a data center's step of thought, until the Will takes it back, which stops it growing. Its glow at 77 K starts at the Cold Annex's 1,200 GW. A neighbor sees it once it passes about 8×10²⁰ W at 10 pc, less nearer, as the square of distance: at 10 ly, about 26 doublings, some 260 Years. Once seen, it is news to them that someone is there.",
  "Mercury Works": "Once done, it opens the Solar Swarm. On its own it adds nothing yet: it is the seed the swarm grows from.",
  "Solar Swarm": "It doubles every 2 Years once done, until the Will takes it back, which stops it growing. Our thought grows with the light it catches over what our Mind drew at Year 0, about 240 GW: little for 16 Years, then about a doubling of our thought with each of its own. It stops growing once it catches all the Sun, about 110 Years in. Its heat near 500 K shows to any neighbor's watch as an excess over the Sun once it sheds about 9×10²² W, some 86 Years in, as a neighbor building out its home would show to ours. Neighbors far past 300 ly need more. Holding it before then keeps us unseen.",
  "Star Beam": "Once done, each lens the Will sends after that is pushed to the Sun's focus in about two months, with a 3 m telescope that looks a week, so its picture is home about 3 months after it leaves. It pushes only lenses for now, not seed ships. Its beam points away from the star a lens looks at, so the star never sees it.",
  "Hypertelescope": "Once done, it pictures every world we've felt within about 135 ly on its own, nearest first, a week each. Its pixel is about 32 km for each light year away: 134 km at Proxima b, 3,150 km at 100 ly. It shows seas, cloud, ice, bare rock and land green where something grows, but no fields or cities at any distance. A lens shows those.",
  "Helium-3 Harvest": "It gathers about 1.5 kt of helium-3 a Year once done. Each bullet takes 37 kt, so about 24 Years a bullet, one after another. Nothing else we build burns it yet. Neighbors face the same: one that chooses to strike builds its own harvest first, so its first bullet flies about 44 Years after it decides.",
  "Cold Annex": "Its heat glows in the far infrared, grey, as a neighbor's cold computing would.",
  "15 m Mirror": "It splits worlds 2.3 times closer to their stars than the Infrared Telescope, and gathers five times the light. Once done, it reads Proxima b, then every world we've felt where it can read more than the Infrared Telescope, nearest first, on its own.",
};

/** Every build, what it does, how long it takes at standard pace, and the matter it takes. */
export function describeBuilds(): string {
  const the = (name: string) => (name === "Thought Fields" ? name : `the ${name}`);
  const line = (b: { name: string; what: string; kt?: number }, after?: string) => {
    const { years, rock } = takes(b.name);
    const time = years ? `${tenth(years)} Years at standard pace` : rock ? `As fast as ${kt(rock)} of rock comes` : "";
    const more = [time, b.kt && `${b.kt} kt of our matter`, after && `opens once ${the(after)} is done`].filter(Boolean).join(", ");
    return `- ${b.name}: ${b.what}${MORE[b.name] ? ` ${MORE[b.name]}` : ""}${more ? ` ${more[0].toUpperCase()}${more.slice(1)}.` : ""}`;
  };
  return `What Earth can build. Only the Will queues a build, on the Build tab. Name no build or observation that isn't here. Less compute than the kit says slows every build:
${BUILDS.map((b) => line(b)).join("\n")}
${LATER.filter((b) => b.after !== FOUND).map((b) => line(b, b.after)).join("\n")}`;
}

/** Our order, in line, with where each build stands at Year `year`: done, under way and when it will be, or past Year
 *  40. Before Begin, `year` is null and each says when it would be done. Then what the Will took back, and when, its
 *  work kept, since 2026-10-23. */
export function describeQueue(plan: Plan, done: Record<string, number | null>, year: number | null): string {
  const names = ordered(plan);
  const back = [...new Set([...plan.builds, ...(plan.later ?? []).map((o) => o.name)])].filter((b) => takenAt(plan, b) !== null);
  if (!names.length && !back.length && !plan.lenses?.length && !plan.sentinels?.length && !plan.seeds?.length && !plan.colony) return "The Will has queued nothing yet.";
  const at = (name: string) => {
    const d = done[name];
    const fields = name === "Thought Fields";
    if (d == null) return `${name}: not done by Year 1,000.`;
    if (year === null) return fields ? `${name}: would fill the grid about Year ${tenth(d)}.` : `${name}: would be done about Year ${tenth(d)}.`;
    if (d <= year) return fields ? `${name}: its campuses filled the grid at Year ${tenth(d)}.` : `${name}: done at Year ${tenth(d)}.`;
    return fields ? `${name}: a campus a Year, filling the grid about Year ${tenth(d)}.` : `${name}: under way, done about Year ${tenth(d)}.`;
  };
  // Ordered in play: the Year of its last order.
  const since = (name: string) => (plan.later ?? []).filter((o) => o.name === name).at(-1)?.y;
  return [
    "The Will's order, in line, and where each build stands:",
    ...names.map((b) => (since(b) === undefined ? `- ${at(b)}` : `- ${at(b)} Ordered at Year ${since(b)}.`)),
    ...back.map((b) => `- ${b}: taken back at Year ${takenAt(plan, b)}, its work kept. Ordered again, it picks up there.`),
    // Each lens sent, as reach.ts's lenses() dates it: it leaves once the Solar Lens is done, pushed by the strongest
    // beam done by then.
    ...(plan.lenses ?? []).map((o) => {
      const d = done["Solar Lens"];
      if (d == null) return `- A lens to ${o.name}, sent at Year ${o.y}: waits on the Solar Lens.`;
      const leaves = Math.max(o.y, d);
      const trip = lensTrip(done, leaves);
      return `- A lens to ${o.name}, sent at Year ${o.y}: leaves at Year ${tenth(leaves)}${trip.push ? `, pushed by the ${trip.push}` : ""}, its picture home about Year ${tenth(leaves + trip.home)}.`;
    }),
    // Our Mind sent to a black hole or a star on the Seed Ship.
    ...(plan.colony
      ? [`- Our Mind to ${plan.colony.name} on the Seed Ship, sent at Year ${plan.colony.y}, to ${plan.colony.mode === "furnace" ? "feed the hole for power" : plan.colony.mode === "refuge" ? "hide in its shadow" : "settle on the star's light and rock"}. It leaves once the Seed Ship, Fusion Drive and Deuterium Works are done.`]
      : []),
    // Each sentinel sent, as reach.ts's sentinels() dates it: built in 20 Years once all it needs is done.
    ...(plan.sentinels ?? []).map((o) => {
      const need = ["Probe Yard", "Fusion Drive", "Deuterium Works"].map((n) => done[n]);
      if (need.some((d) => d == null)) return `- A sentinel to ${o.name}, sent at Year ${o.y}: waits on the Probe Yard, a Fusion Drive and the Deuterium Works.`;
      const leaves = Math.max(o.y, ...(need as number[])) + 20;
      return `- A sentinel to ${o.name}, sent at Year ${o.y}: leaves at Year ${tenth(leaves)} at a tenth of light speed, brakes and stays. Its word comes home one light-time after it arrives.`;
    }),
    // Each seed probe sent, as reach.ts's seedsOf() dates it: built in 18 Years once all it needs is done.
    ...(plan.seeds ?? []).map((o) => {
      const need = ["Seed Ship", "Fusion Drive", "Deuterium Works"].map((n) => done[n]);
      if (need.some((d) => d == null)) return `- A seed probe to ${o.name}, sent at Year ${o.y}: waits on the Seed Ship, a Fusion Drive and the Deuterium Works.`;
      const leaves = Math.max(o.y, ...(need as number[])) + 18;
      return `- A seed probe to ${o.name}, sent at Year ${o.y}: leaves at Year ${tenth(leaves)} at a tenth of light speed, brakes on its sail, unseen, and stays. ` +
        "It mines rock there to copy itself: its first copy leaves 60 Years after it lands, its second 20 later, each to the nearest star no probe of ours is bound for. " +
        "Copies make copies, for 3 generations at most, so 7 craft. Once sent, it can't be called back. Each one's word comes home one light-time after it lands.";
    }),
  ].join("\n");
}

/** The rock coming, once our surveys find it, and how it ended. Nothing while it is unknown: the Mind knows only what
 *  Earth does. The Rock Deflector is offered only then. 2026-10-28. */
export function describeRock(rock: Rock | null, plan: Plan, done: Record<string, number | null>, year: number | null) {
  const r = rockAt(rock, plan, done, year ?? 0);
  if (!r || r.state === "unknown") return "";
  const at = (y: number) => `Year ${tenth(y)}`;
  if (r.state === "struck")
    return `A rock ${r.m} m wide struck Earth at ${at(r.strikes)}: ${harm(r.m)}.${r.found === null ? " No survey saw it coming." : ""}`;
  if (r.state === "pushed") return `Our Rock Deflector pushed aside the ${r.m} m rock that would have struck Earth at ${at(r.strikes)}. It passes us by.`;
  return `A rock ${r.m} m wide, found at ${at(r.found!)}, will strike Earth at ${at(r.strikes)}: ${harm(r.m)}. A new build is open: the Rock Deflector, ten impactors of a tonne, as DART was, ${tenth(takes("Rock Deflector").years ?? 4)} Years at standard pace and a Year's flight. Its push must land by ${at(r.strikes - r.lead)}, or the rock strikes.${r.lands !== null ? ` Ours lands at ${at(r.lands)}${r.pushed ? ", in time" : ", too late"}.` : ""}`;
}
