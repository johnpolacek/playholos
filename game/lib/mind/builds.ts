// What Earth can build, and how far our order has come, for the Mind. Without it the Mind named builds that don't
// exist, guessed whether a watch was done, and called the drift scan our only ear at Year 40 with the All-Sky Watch long
// built. Times are Build's: a build's standard pace, and each one in our order as schedule dates it. 2026-10-23.
import { yearText } from "@/lib/game/clock";
import { BUILDS, EVENTS, isOn, kt, LATER, moves, openAt, ordered, PAST, SWITCHED, switchedAt, takenAt, takes } from "@/lib/game/plan";
import { fuelOf, fuelReady, lensTrip, probeLeaves, sentinelTrip, shipLeaves, strikesOf } from "@/lib/game/reach";
import { CATALOG } from "@/lib/sim/works";
import { beamMiss, beamSeen, bulletBeta, bulletYears, flybyBeta, flybyYears, rodTonnes, SAIL_C, sailYears } from "@/lib/sim/speeds";
import { harm, rockAt, type Rock } from "@/lib/game/rocks";
import type { Plan } from "@/lib/game/types";

const tenth = (y: number) => Number(y.toFixed(1));

// What the Mind needs past a build's line. The telescope reads the three gases lib/sim/observing.ts has bands for, and
// the Mind had offered methane. The 15 m Mirror's reach is observing.ts's dark patch on a 15 m mirror, and the Mind had
// said no telescope we could build would split Proxima b. That it aims itself is lib/sim/knowledge.ts's readings, and
// the Mind had promised to point it. 2026-10-23.
const MORE: Record<string, string> = {
  "Infrared Telescope": "It reads three gases in a world's air: water, oxygen and ozone. Once done, it looks at every world we've felt on its own, nearest first, so no one aims it. It turns to a world our Far-Side Array finds too, once heard, where it can split that world from its star: few sit far enough out. It also studies each new warm glow our Warm Sky Watch finds, while it shines, and ranges it within about a third either way, in about 2 Years.",
  "Solar Lens": "Once done, the Will sends each lens from a destination's page on Reach, one a star, only to a world we've felt or to Proxima b. A lens reaches the Sun's focus about 17 Years after it leaves, looks for half a Year, and its picture is home about 3 days later. Once the Laser Sail Array is done, it pushes each lens out in about 5 Years instead, and once the Star Beam is done, in about ten weeks, carrying a telescope 3 m wide that looks for a week. It shows what is wider than its pixel, about 25 km at 100 ly: cities, cleared land, forests, ice. Never roads or dams.",
  "Laser Sail Array": "Once done, the Will sends sails from a destination's page on Reach, one sail a star, past any star on the page. A sail flies by at a fifth of light speed and sends pictures: a world if one is there, and no air. Past a glow, a black hole or a star with no world near its path, it resolves nothing more than we knew. Its launch costs hours of a small grid's power. Its laser is aimed where the star will be when the sail arrives, so the beam passes the star as it is by about 25 AU for each light-year of the trip: 107 AU at Proxima Centauri, a light-year at a warm glow 2,700 ly off. So no mind at a warm glow sees it. Only an awake old mind's works are wide enough to cross it, and only round a bright star: its cold panels sit where 12 K lies, about 540 AU out round a star like the Sun, but about 55 AU round the red dwarfs most old minds live at. So a sail's beam is seen within about 21 ly at a Sun-like star and 2 ly at a red dwarf, which in most games is no one. A mind that does see it takes it as a knock, and may answer.",
  "Probe Yard": "It builds flyby probes, which the Will sends past any star from a destination's page on Reach, one a star, leaving 12 Years after the order once a Fusion Drive is done too, since its engine is fusion, and once its 6 kt of deuterium is in from the Deuterium Works, which makes 8 kt a Year and fuels flyby probes and sentinels in the order sent. A flyby probe burns 20 Years to a tenth of light speed, 10 Years over cruising, then passes, sends pictures of a world if one is there and reads its air. Once the Ship Beam is done, and while the Will does not keep it dark, the beam throws each flyby probe that leaves after that in place of its engine and fuel: about 48 days of push to 0.37 of light speed, over three times as fast, drawing no deuterium. With the Ship Beam in our order a flyby probe can be sent with no Fusion Drive and no Deuterium Works. Once the Wide Beam is done it throws each flyby probe in the Ship Beam's place, at about three quarters of light speed. Past a glow, a black hole or a star with no world near its path, it resolves nothing more than we knew. It builds sentinels too: once a Fusion Drive and the Deuterium Works are done too, the Will can send a sentinel from a destination's page on Reach, one a star. The yard builds it in 20 Years. It leaves once its 52 kt of deuterium is in, about 6.5 Years of the Works. It flies at a tenth of light speed, brakes on a magnetic sail 1,800 km across, a loop of superconducting wire held together by nanotube tethers, unseen, ends its stop with a short burn, and stays. Its stop adds about 14 Years over cruising at a star inside a warm cloud of gas, as Alpha Centauri and Epsilon Eridani are, and about 75 between the clouds, where the gas it brakes on is thinner, and sees what a flyby can't: who lives there, or their ruins. It can go to a warm glow too: it brakes once it sees the glow up close, so a range is enough, and sees what makes the heat, a mind's works or dust.",
  "Star Mapper": "Once done, it watches on its own and finds each black hole the first time it passes close in front of a star it sees, a few each decade. A black hole found becomes a destination on Reach, where a sentinel can go. A hole is worth having: rock fed to it gives back 6% to about 30% of its mass as light, where fusion gives under 1%, it swallows heat unseen, and close in a clock runs up to 10 times slow. Using it costs little in being seen: our craft brake in on a magnetic sail, with no flame, and a furnace stays below what X-ray surveys see until it grows past about a millionth of the Sun's output.",
  "Seed Ship": "It carries one copy of our Mind, so it goes to one place, from that place's page on Reach. To a black hole we have found, to feed the hole for power or to hide in its shadow: a furnace grows fast and shows to X-ray surveys once it passes about a millionth of the Sun, and a refuge stays small and unseen. Or to a star with a world we know, the world next door or one we have felt, to settle on its light and rock and build it out, or to keep small: a receiver and a cold Mind built from a comet's worth of rock, staying that size. It brakes in on its magnetic sail, with no flame, so no one living there sees it come. Any of these is a Mind of ours that lives if Earth does not. A watcher counts only growth: a Mind sent to settle or to feed a hole draws its warning as a seed probe does, and one kept small or hidden never does.",
  "Halo Survey": "Once done, it looks at each star for an hour, nearest first, on its own: about 3,000 stars a Year, 100 ly in 4 Years, 400 ly in about 220. It sees a compact cold glow, not a wide one, and tells a grey glow from dust's. No whole-sky map reaches as deep.",
  "Halo Array": "Once done, it searches as the Halo Survey does, ten times as fast: 40,000 stars a Year, the 300,000 within 326 ly in about 8 Years.",
  "Asteroid Tour": "Once done, its probe maps each of the six asteroids sharing Earth's orbit in turn, a Year each and a Year between, Kamoʻoalewa first and Cruithne last, ending 12 Years after it is done, with a Year to fly out first. It finds anything on them down to centimeters. It can't search the Sun–Earth L4 or L5 zones, which are tens of millions of km wide.",
  "Moon Search": "Once done, it stacks deep images of the Earth–Moon L4 and L5 points for 3 Years and finds anything there down to about 10 cm, even near black. It sees nothing at the Sun–Earth points or on asteroids.",
  "Far-Side Array": "It hears from its first fifth, on its own, the whole sky at once. What it hears is the radio a magnetic field makes where a red dwarf's wind strikes a world, under 2 MHz, which Earth's air blocks. Its reach is red dwarfs within 33 ly: a world of a Sun-like star is hundreds of times too faint. The nearest and closest-in worlds show within a Year, most within a few decades, the faintest after two or three centuries, sooner as more fifths stand. At a world we know, it tells whether it has a field. At a star where we knew no world, one with a field shows itself, with its year and no mass, and one without a field stays unknown. Most worlds it finds sit too close to their stars for our telescopes to split: the 15 m Mirror splits about 1 in 4 and reads the air of about 1 in 6, the Infrared Telescope splits about 1 in 50, and the Hypertelescope pictures every one, a week each, once heard. A field is a small sign for air, since a world with one holds its air a little oftener, about 1.2 times: never a reading of its air. No rocky world's field had been caught by Year 0, so how many have one is unknown, perhaps half. It would also hear a world's everyday radio within about 50 ly, and none near us makes any.",
  "Deep Ice Watch": "Once done, it hears on its own, with no aiming. About 2 stars a Year exploding in other galaxies, out to about 30 million ly, each by a few neutrinos. A star that fell straight to a black hole with no flash would run hotter and be heard to about 83 million ly. It tells how far a death is by its count, never where: our telescopes find the galaxy, by the flash or by a star gone missing. It hears no minds and no craft. What it would settle is whether some heavy stars die dark, and how large a share. At Year 0 that isn't known: stars seen to vanish and black hole masses point to about 1 in 6, and the evidence runs from about none to about 4 in 10.",
  "Warm Sky Watch": "Once done, it maps the whole sky in warm infrared every 2 Years, on its own, and sees a new warm glow appear anywhere in our galaxy. It can't tell how far a glow is, or what makes it. A glow that rose and faded before it ran is gone for good.",
  "Mind Link": "Once done, and once word has come that our Mind there stands, the Will can move to it, wherever it is, from that place's page on Reach. It goes as a transmission, 100 PB, which takes days at that distance, then the light-time. The crossing costs that time: the Will is dark for it, a Year for each light-year, ordering nothing and hearing nothing, while Earth goes on by our orders and charter. Living there, every order from the Will reaches Earth that many Years late, and Earth's news reaches the Will as late. In a refuge, our Mind there can spread over chips 10 cm wide on the innermost stable orbit, which tides can't break, so its clock runs slow and the sky outside goes by faster. A furnace's disk fills that orbit, so it can't.",
  "Orbital Ring": "A broken ring rises to a higher orbit rather than falling, since the loads that held it down are gone, and takes thousands of Years to come down. What can fall are the skyhooks and cables, into cleared ground beneath them. A meteoroid cuts a cable about once in 14,000 Years, far less with spare strands. The ring is no radio source: it reflects Earth's own noise about a million times fainter.",
  "X-Ray Watch": "Once done, it sees any probe that brakes all the way into our system, weeks before it stops, and its direction. A probe that stops far out, or a bullet coasting dark, it never sees.",
  "Interceptor": "Once done, with the X-Ray Watch, it wrecks every probe the watch sees, as it stops. Its sender learns its probe went dark one light-time later, and may take it as an attack. The Will can stand it down from its page at any time, before it is built or after, and arm it again: standing down, it catches nothing.",
  "Quiet Radars": "Once done, our radar front stops growing. It already reaches about 90 ly, where no mind is likely to be, so it shapes only who could hear us centuries from now. Anything watching from inside our own system would have heard us long ago.",
  "Strike Yard": "Once done, the Will can fire a bullet at a star from its page on Reach, one a star: 20 Years to ready it, and it flies only once the Helium-3 Harvest has gathered its 37 kt, in the order ordered: about 12 Years for the first, faster as the harvest grows. Without the harvest, none flies. Then a tenth of light speed. A bullet ordered once the Ship Beam is done is a different craft: a rod of 30 t with no engine, readied in about 7 months and thrown by the beam at half of light speed, with no helium-3, landing as hard as a bullet. With the Ship Beam in our order and no Helium-3 Harvest, a bullet ordered waits for the beam. One ordered once the Wide Beam is done is a lighter rod still, about 4 t at nine tenths of light speed, readied in about a month. It lands with about 110,000 Mt. It harms but doesn't end a Mind spread across its system. Its launch shows only in our own system, to a probe of theirs watching here. The struck star knows where it came from, and answers as it chooses, maybe in kind.",
  "Trojan Vault": "It keeps a copy of our Mind 8 light-minutes from Earth, out of reach of a strike on Earth and the Moon together. It doesn't think with us: it keeps a copy that could carry on if Earth and the Moon were lost.",
  "Ground Solar": "Its 4.8 TW counts once it is done: about as much again as the electricity we had at Year 0, so about two more data centers of Thought Fields fit.",
  "Fusion Plants": "Once done, its 12 TW is 2.4 times the electricity we had at Year 0, so about two more data centers of Thought Fields fit beyond Ground Solar's. Until then it adds nothing to our thought: the fleet grows by breeding its own tritium, and the energy counts once it stands.",
  "Cold Halo": "It doubles every 10 Years once done, each doubling a data center's step of thought, until the Will takes it back, which stops it growing. Its glow at 77 K starts at the Cold Annex's 1,200 GW. A watch like our Halo Survey sees it once it passes about 4×10²⁰ W at 10 pc, more farther, as the square of distance. Anything watching from inside our own system would see it at once. Once seen, it is news to them that someone is there.",
  "Mercury Works": "Once done, it opens the Solar Swarm. On its own it adds nothing yet: it is the seed the swarm grows from.",
  "Solar Swarm": "It doubles every 2 Years once done, until the Will takes it back, which stops it growing. Our thought grows with the light it catches over what our Mind drew at Year 0, about 240 GW: little for 16 Years, then about a doubling of our thought with each of its own. It stops growing once it catches all the Sun, about 110 Years in. Its heat near 500 K shows to a watch like our Warm Sky Watch as an excess over the Sun once it sheds about 9×10²² W, some 86 Years in, as a young mind building out its home shows to ours. Anything watching from inside our own system would see it at once. Watchers far past 300 ly need more. Holding it before then keeps us unseen.",
  "Star Beam": "Once done, each lens the Will sends after that is pushed to the Sun's focus in about ten weeks, with a 3 m telescope that looks a week, so its picture is home about 3 months after it leaves. It pushes only lenses: a seed ship is far too heavy for it, and waits on the Ship Beam, which opens once this is done. Its beam points away from the star a lens looks at, so the star never sees it.",
  "Ship Beam": "A patch of the swarm 1,000 km across, phased as one laser of 1,000 TW, in light of 1.55 microns: silicon, in its sail's mirror, soaks up bluer light and is clear there. Once done, each seed ship and seed probe that leaves our Sun after that rides it on a sail a kilometer wide: a tenth of light speed in about 78 days, and its most, about a seventh, in about 135. A lighter craft leaves faster: the beam does the same work on whatever it pushes. So it throws flyby probes from the Probe Yard too: 150 t leaves at 0.37 of light speed after about 48 days of push, with no engine and no fuel, and passes Proxima Centauri about 12 Years later. It throws a bullet too, once the Strike Yard is done: a rod of 30 t at half of light speed, which lands with a bullet's 110,000 Mt and needs no helium-3. No craft passes half of light speed on this sail: there it outruns its mirror, since the beam's light reaches a fleeing sail stretched redder, and a mirror reflects only so wide a band. The Wide Beam, which opens once this is done, lifts that with stepped colors. So it needs no Fusion Drive and no deuterium. With no drive it stops on its magnetic sail alone, which sets its speed for each trip: as fast as it can stop from. On a short hop through the thin gas between clouds that is under a tenth, and it lands later than a ship on its own drive. On a road past about 55 ly it rides the beam's full push, and saves about a fifth of the trip at 200 ly. A seed probe's copies are built at other stars, where no beam stands, so they burn their own fuel. Its price is being seen, but only from near. Each craft is aimed where its star will be when it lands, so the beam passes that star by, the wider the slower the craft: about 170 AU at Proxima Centauri for a seed ship, and a light-year at a glow 2,700 ly off. Only an awake old mind whose works reach that line sees it. Its cold panels sit where 12 K lies round its star: about 540 AU out round a star like the Sun, about 55 AU round the red dwarfs most old minds live at. So at a Sun-like star a seed ship's beam is seen within about 14 ly at most, a flyby probe's within 49 ly, a rod's within 92 ly, and at a red dwarf a tenth as far. Of about 95 awake old minds within 326 ly, about one could see a probe's or a rod's beam, and none a seed ship's. Such a mind sees the beam as it would a knock, knows something is coming decades before it lands, and may answer. No mind at a warm glow sees it. A ship on its own drive leaves unseen. The Will can keep the beam dark from its page at any time, and let it push again: dark, each ship leaves on its own drive and fuel, unseen, and one with no drive waits. A Seed Ship can be queued with this in our order in place of its Fusion Drive and Deuterium Works.",
  "Wide Beam": "The Ship Beam's patch grown ten times wider, 10,000 km, lasing in four colors, each bluer, that take over one by one as the sail speeds up: 2.0 microns, then 1.55, 1.06 and 0.80, each a kind of laser built today. The steps keep the light the sail sees inside its mirror's one band up to 0.90 of light speed, and the width holds the beam's spot on a 1 km sail for half a light-year. It throws the same 1,000 TW, since a sail can take no more. Once done, and while the Will does not keep the Ship Beam dark, it throws each flyby probe and each rod in the Ship Beam's place. A seed ship or a seed probe rides it too, but it must stop on its sail alone, so its stopping sets its speed on most roads: no faster than on the Ship Beam within about 55 ly, then 0.18 of light speed to a star 100 ly off, 0.23 at 200 ly and 0.27 at 326 ly, where it lands in about 1,940 Years, not 2,530. A faster stop needs a stronger current in its sail's loop, and more of the loop's weight goes to the tethers that hold it together, so each step in speed costs more than the last. A bullet ordered once it is done is a rod of about 4 t at nine tenths of light speed near us, with a bullet's 110,000 Mt, readied in about a month and pushed 78 days: the same rod another mind throws, as fast, bound only by its shield, so slower and heavier on a road past about 100 ly. It reaches a star 10 ly off in about 11 Years. A flyby probe leaves at about three quarters of light speed after about 10 months of push, and passes Proxima Centauri about 6 Years later. Its price is being seen from farther: a faster craft's beam passes nearer its star, a rod's by about 3 AU at Proxima Centauri and 80 AU at 100 ly. So of about 95 awake old minds within 326 ly, about 12 could see a rod's beam and about 3 a probe's, where the Ship Beam's is seen by about one.",
  "Hypertelescope": "Once done, it pictures every world we've felt within about 135 ly on its own, nearest first, a week each, and each world our Far-Side Array finds, once heard. Its pixel is about 32 km for each light year away: 134 km at Proxima b, 3,150 km at 100 ly. It shows seas, cloud, ice, bare rock and land green where something grows, but no fields or cities at any distance. A lens shows those.",
  "Galaxy Broadcast Array": "It sends nothing on its own. Once done, a message the Will sends every way at once can go along the Galaxy's plane in place of the stars near us: the Will picks which on the send card, so offer it with the same send line, to everywhere. It sweeps the plane in short pulses, about 10^20 W along its beam from 218 GW, and returns to each star about once a Year for about a second. It is noticed anywhere in the Galaxy on the first pass. A page of words is read on the first pass out to about 6,700 ly, in 3 passes at 10,000 ly and 17 at the Galaxy's center, so a repeat reads farther each Year, and nothing larger than a page gets through: Cosmic Call's collection would be read only to 25 ly. An awake young mind that reads it may answer once, as one answers an aimed message, found by us or not, and an answer takes twice its distance in Years: the nearest such minds are likely thousands of ly away, so thousands of Years at the soonest. Nothing we have found says a call is punished, and nothing says it is safe: we have heard no one else call. Our own searches at Year 0 would have missed a call like this, since they watched one star for minutes and listened for steady tones.",
  "Glow Imager": "Once done, it turns on its own to each glow we have found, a week each, in the order each was ready: a cold glow once our Halo Survey or Halo Array has seen it, a warm glow once our Infrared Telescope has ranged it and while it still shines. It shows what makes the glow, from home. A cold glow: whether thin panels keep orderly orbits far from the star, which only made things do. A warm glow: a thin even ring round a star, which is built, or a ragged cloud, which is dust. That settles a glow as a sentinel that stays does, in a week where a sentinel takes centuries, and nothing at the glow can tell we looked. It finds no glows, so the surveys still matter. It can't see a mind that sleeps: only a craft up close finds one. A sentinel still watches a place over time.",
  "Helium-3 Harvest": "It gathers about 1.5 kt of helium-3 a Year once done, and its craft copy themselves, doubling its rate every 5 Years until the Will holds it. Each bullet takes 37 kt: the first about 12 Years after it is done, the fourth about 21, and 50 Years on one every 9 days. Nothing else we build burns it yet. Any mind faces the same: one that chooses to strike builds its own harvest first, so its first bullet flies about 32 Years after it decides.",
  "Cold Annex": "Its heat glows in the far infrared, grey, as an old mind's cold computing does.",
  "15 m Mirror": "It splits worlds 2.3 times closer to their stars than the Infrared Telescope, and gathers five times the light. Once done, it reads Proxima b, then every world we've felt where it can read more than the Infrared Telescope, nearest first, on its own. And each world our Far-Side Array finds that it can split from its star, once heard: about 1 in 4 of them.",
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
${LATER.filter((b) => !EVENTS.includes(b.after)).map((b) => line(b, b.after)).join("\n")}`;
}

/** For a craft a beam of ours threw at a star near enough: that an old mind awake there would see the beam. Farther
 *  off the beam passes too wide for any star's mind, and the line says nothing. The plan keeps no star's light, so the
 *  line says which stars' minds could. lib/sim/speeds.ts's beamSeen. 2026-11-12. */
const beamNote = (ly: number, beta: number) =>
  !beamSeen(ly, beta)
    ? ""
    : ` Its beam passes that star by about ${Math.round(beamMiss(ly, beta))} AU. An old mind awake there sees it, as it would a knock, only if its cold works reach that far: ${
        // The middle awake old mind's star has 0.011 Suns, a red dwarf: calcs/minds.py, over the pool's games.
        beamSeen(ly, beta, 0.011) ? "they would, even round a red dwarf" : "they would round a star like the Sun, and not round a red dwarf"
      }.`;

/** Our order, in line, with where each build stands at Year `year`: done, under way and when it will be, or past the
 *  horizon. Before Begin, `year` is null and each says when it would be done. Then what the Will took back, and when, its
 *  work kept, since 2026-10-23. */
export function describeQueue(plan: Plan, done: Record<string, number | null>, year: number | null, scale = 1): string {
  const names = ordered(plan);
  const back = [...new Set([...plan.builds, ...(plan.later ?? []).map((o) => o.name)])].filter((b) => takenAt(plan, b) !== null);
  if (!names.length && !back.length && !plan.lenses?.length && !plan.sentinels?.length && !plan.seeds?.length && !plan.flybys?.length && !plan.strikes?.length && !plan.colony) return "The Will has queued nothing yet.";
  const at = (name: string) => {
    const d = done[name];
    const fields = name === "Thought Fields";
    if (d == null) return `${name}: done ${PAST}.`;
    if (year === null) return fields ? `${name}: would fill the grid about Year ${tenth(d)}.` : `${name}: would be done about Year ${tenth(d)}.`;
    if (d <= year) return fields ? `${name}: its campuses filled the grid at Year ${tenth(d)}.` : `${name}: done at Year ${tenth(d)}.`;
    return fields ? `${name}: a campus a Year, filling the grid about Year ${tenth(d)}.` : `${name}: under way, done about Year ${tenth(d)}.`;
  };
  // Ordered in play: the Year of its last order.
  const since = (name: string) => (plan.later ?? []).filter((o) => o.name === name).at(-1)?.y;
  return [
    "The Will's order, in line, and where each build stands:",
    ...names.map((b) => (since(b) === undefined ? `- ${at(b)}` : `- ${at(b)} Ordered at Year ${since(b)}.`)),
    ...back.map((b) => `- ${b}: paused at Year ${takenAt(plan, b)}, its work kept. Resumed, it picks up there.`),
    // What the Will has stood down, and since when: plan.ts's SWITCHED. 2026-11-11.
    ...Object.keys(SWITCHED)
      .filter((b) => names.includes(b) && !isOn(plan, b, year ?? 0))
      .map((b) => `- ${b}: ${SWITCHED[b].off.toLowerCase()} by the Will's order since Year ${switchedAt(plan, b, year ?? 0)}. ${SWITCHED[b].whenOff} The Will can change that from its page.`),
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
      ? [`- Our Mind to ${plan.colony.name} on the Seed Ship, sent at Year ${plan.colony.y}, to ${plan.colony.mode === "furnace" ? "feed the hole for power" : plan.colony.mode === "refuge" ? "hide in its shadow" : "settle on the star's light and rock"}. It leaves once the Seed Ship is done and ${ordered(plan).includes("Ship Beam") ? "either its Fusion Drive and the Deuterium Works are, or the Ship Beam, which pushes it in place of its burn, and whose beam only an awake old mind near us could see" : "the Fusion Drive and Deuterium Works are"}.`]
      : []),
    // Each sail and flyby probe sent past a star. 2026-11-05.
    ...(plan.flybys ?? []).map((o) => {
      if (o.by === "sails") {
        const ready = done["Laser Sail Array"];
        if (ready == null) return `- Sails to ${o.name}, sent at Year ${o.y}: waits on the Laser Sail Array.`;
        const passes = Math.max(ready, o.y) + sailYears(o.d);
        return `- Sails to ${o.name}, sent at Year ${o.y}: passes about Year ${tenth(passes)}, its word home about Year ${tenth(passes + o.d)}.${beamNote(o.d, SAIL_C)}`;
      }
      // As reach.ts's flybyRoad dates it: by its Fusion Drive once its deuterium is in, or thrown by the Ship Beam,
      // whichever is sooner. 2026-11-12.
      const f = fuelOf((n) => done[n]);
      const { leaves, pushed } = probeLeaves(plan, f, o.y, fuelReady(plan, f, `probe:${o.name}`, CATALOG.probe.fuel, o.y));
      if (leaves === null) {
        const beam = ordered(plan).includes("Ship Beam");
        if (f.yard === null) return `- A flyby probe to ${o.name}, sent at Year ${o.y}: waits on the Probe Yard.`;
        if (beam && f.beam !== null && f.drive === null) return `- A flyby probe to ${o.name}, sent at Year ${o.y}: built, with no engine of its own, it waits while the Will keeps the Ship Beam dark.`;
        return `- A flyby probe to ${o.name}, sent at Year ${o.y}: waits on a Fusion Drive and the Deuterium Works for its fuel${beam ? ", or on the Ship Beam to throw it" : ""}.`;
      }
      const passes = leaves + flybyYears(o.d, pushed);
      const how = pushed ? ` thrown by the ${pushed === "wide" ? "Wide Beam" : "Ship Beam"} at Year ${tenth(leaves)}, with no engine or fuel, at ${flybyBeta(o.d, pushed).toFixed(2)} of light speed,` : "";
      return `- A flyby probe to ${o.name}, sent at Year ${o.y}:${how} passes about Year ${tenth(passes)}, its word home about Year ${tenth(passes + o.d)}.${pushed ? beamNote(o.d, flybyBeta(o.d, pushed)) : ""}`;
    }),
    // Each sentinel sent, as reach.ts's sentinels() dates it: built in 20 Years once all it needs is done.
    ...(plan.sentinels ?? []).map((o) => {
      const need = ["Probe Yard", "Fusion Drive", "Deuterium Works"].map((n) => done[n]);
      if (need.some((d) => d == null)) return `- A sentinel to ${o.name}, sent at Year ${o.y}: waits on the Probe Yard, a Fusion Drive and the Deuterium Works.`;
      const fuel = fuelReady(plan, fuelOf((n) => done[n]), `sentinel:${o.name}`, CATALOG.sentinel.fuel, o.y)!;
      const leaves = Math.max(Math.max(o.y, ...(need as number[])) + CATALOG.sentinel.build, fuel);
      // What its start and its stop add over a cruise at a tenth of light speed, by the gas at its star: lib/sim/speeds.ts.
      const over = Math.round(sentinelTrip(50, o.name) - 500);
      return `- A sentinel to ${o.name}, sent at Year ${o.y}: leaves at Year ${tenth(leaves)} once its deuterium is in, at a tenth of light speed, brakes on its magnetic sail unseen, ends its stop with a short burn, and stays, about ${over} Years more than the cruise. Its word comes home one light-time after it arrives.`;
    }),
    // Each seed probe sent, as reach.ts's seedsOf() dates it: built in 18 Years once all it needs is done.
    ...(plan.seeds ?? []).map((o) => {
      // As reach.ts's seedsOf() dates it: by its drive and fuel, or by the Ship Beam unless the Will keeps it dark.
      const { leaves, pushed } = shipLeaves(plan, (n) => done[n], o.y, CATALOG.seedProbe.build);
      if (leaves == null)
        return done["Seed Ship"] != null && done["Ship Beam"] != null
          ? `- A seed probe to ${o.name}, sent at Year ${o.y}: built, with no drive of its own, it waits while the Will keeps the Ship Beam dark.`
          : `- A seed probe to ${o.name}, sent at Year ${o.y}: waits on the Seed Ship, a Fusion Drive and the Deuterium Works${ordered(plan).includes("Ship Beam") ? ", or on the Seed Ship and the Ship Beam" : ""}.`;
      return `- A seed probe to ${o.name}, sent at Year ${o.y}: leaves at Year ${tenth(leaves)}${pushed ? `, pushed by the ${pushed === "wide" ? "Wide Beam" : "Ship Beam"} as fast as it can stop from, with no drive of its own,` : " at a tenth of light speed,"} brakes on its sail, unseen, and stays. ` +
        "It mines rock there to copy itself: its first copy leaves 60 Years after it lands, its second 20 later, each to the nearest star no probe of ours is bound for. " +
        "Copies make copies, for 3 generations at most, so 7 craft. Once sent, it can't be called back. Each one's word comes home one light-time after it lands.";
    }),
    // Each bullet ordered, as reach.ts's strikesOf() dates it: a bullet on its Fusion Drive once its helium-3 is in,
    // or a rod our Ship Beam throws. The Mind was never told of them until 2026-11-12.
    ...strikesOf(plan, scale).map((s, i) => {
      const o = plan.strikes![i];
      const what = s.pushed === "wide" ? `a rod of ${rodTonnes(o.d ?? 10, "wide").toFixed(1)} t for the Wide Beam to throw` : s.pushed ? `a rod of ${Math.round(CATALOG.speeds.rod.tonnes)} t for the Ship Beam to throw` : "a bullet of 1,000 t on its Fusion Drive";
      if (s.fired === null)
        return `- A bullet at ${o.name}, ordered at Year ${o.y}, ${what}: not fired, it waits on ${s.pushed ? "the Strike Yard and the Ship Beam, or on the Will to let the beam push" : "the Strike Yard and the Helium-3 Harvest"}.`;
      const speed = `${s.pushed ? bulletBeta(o.d ?? 10, s.pushed).toFixed(2) : "a tenth"} of light speed`;
      if (year !== null && s.fired > year) return `- A bullet at ${o.name}, ordered at Year ${o.y}, ${what}: readying, fired at Year ${tenth(s.fired)}, then ${speed}${o.d ? `, landing about Year ${tenth(s.fired + bulletYears(o.d, s.pushed))}` : ""}.`;
      if (!o.d) return `- A bullet at ${o.name}, ordered at Year ${o.y}, ${what}: fired at Year ${tenth(s.fired)}, at ${speed}. It can't be called back.`;
      const lands = s.fired + bulletYears(o.d, s.pushed);
      return year !== null && lands <= year
        ? `- A bullet at ${o.name}, ordered at Year ${o.y}, ${what}: fired at Year ${tenth(s.fired)}, it landed at Year ${tenth(lands)} with about 110,000 Mt. Its flash reaches us at Year ${tenth(lands + o.d)}.`
        : `- A bullet at ${o.name}, ordered at Year ${o.y}, ${what}: fired at Year ${tenth(s.fired)}, in flight at ${speed}, landing about Year ${tenth(lands)}. It can't be called back.`;
    }),
  ].join("\n");
}

/** Each build open to order now, as Build's catalog dates it with this game's compute: when it would be done, and the
 *  build in our order it slows or speeds most. The Mind gave standard-pace Years and guessed at slowing, where Build
 *  said "in 20m" and "slows nothing". Playtest 2026-10-30. */
export function describeOffers(plan: Plan, scale: number, done: Record<string, number | null>, year: number | null) {
  const at = tenth(year ?? 0);
  const open = openAt(plan, done, at);
  if (!open.length) return "";
  const lines = open.map((b) => {
    const m = moves(plan, scale, b.name, year === null ? null : at);
    const when = m.at == null ? `done ${PAST}` : `done about Year ${yearText(m.at)}`;
    // Nothing slowed goes unsaid, on Build and here: the Mind said "slowing nothing we've queued" unasked. 2026-11-08.
    const slows = m.late ? `, slowing the ${m.late.name} by about ${tenth(m.late.by)} Years` : "";
    const speeds = m.soon ? `, ${m.late ? "and " : ""}speeding the ${m.soon.name} by about ${tenth(m.soon.by)} Years` : "";
    return `- ${b.name}: ordered now, ${when}${slows}${speeds}.`;
  });
  return `Builds the Will could order now, as Build shows them. When asked how long one takes or what it slows, say these, never the standard pace. One that names no build it slows slows none. Never say a build slows nothing unless the Will asks what it slows:\n${lines.join("\n")}`;
}

/** The rock coming, once our surveys find it, and how it ended. Nothing while it is unknown: the Mind knows only what
 *  Earth does. The Rock Deflector is offered only then. 2026-10-28. */
export function describeRock(rock: Rock | null, plan: Plan, done: Record<string, number | null>, year: number | null) {
  const r = rockAt(rock, plan, done, year ?? 0);
  if (!r || r.state === "unknown") return "";
  const at = (y: number) => `Year ${yearText(y)}`;
  if (r.state === "struck")
    // Its warning, plainly, so the Mind never says it came unwarned when we had Years. Playtest 2026-10-30.
    return `A rock ${r.m} m wide struck Earth at ${at(r.strikes)}: ${harm(r.m)}.${r.found === null ? " No survey saw it coming." : ` We found it at ${at(r.found)}, ${tenth(r.strikes - r.found)} Years ahead, time enough for a push landing by ${at(r.strikes - r.lead)}. ${r.lands === null ? "We never ordered the Rock Deflector." : `Our Rock Deflector's push landed at ${at(r.lands)}, too late.`}`}`;
  if (r.state === "pushed") return `Our Rock Deflector pushed aside the ${r.m} m rock that would have struck Earth at ${at(r.strikes)}. It passes us by.`;
  return `A rock ${r.m} m wide, found at ${at(r.found!)}, will strike Earth at ${at(r.strikes)}: ${harm(r.m)}. A new build is open: the Rock Deflector, ten impactors of a tonne, as DART was, ${tenth(takes("Rock Deflector").years ?? 4)} Years at standard pace and a Year's flight. Its push must land by ${at(r.strikes - r.lead)}, or the rock strikes.${r.lands !== null ? ` Ours lands at ${at(r.lands)}${r.pushed ? ", in time" : ", too late"}.` : ""}`;
}
