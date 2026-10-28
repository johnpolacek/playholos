// Where each build would stand, for the map, and what it holds, for the Build tab. Picking a build there flies the
// map to its place. Sources in HOLOS_RESEARCH.md, "Where the Moon vault stands", "Where the watches stand", "Where
// the data center, launch complex and yard stand", "Where the infrared telescope stands", and since 2026-10-22, each
// opened build's and the long road's "Where ... stands".
import { BUILDS } from "./plan";

/** One place a build stands: latitude, and longitude east. On the Moon, longitude runs from the middle of the side
 *  that faces Earth. */
export interface Place {
  lat: number;
  lon: number;
  /** Its name on the map. */
  name: string;
}

/** Where a build stands: on Earth, the Moon, in low orbit or out at L2, at one place or more. */
export interface Site {
  on: "earth" | "moon" | "orbit" | "l2";
  /** How the map draws it: a dome of the sky each place watches, a ring round it, or paths up to orbit from it. */
  draw: "dome" | "ring" | "launch";
  /** In orbit or at L2, one place, its name only. */
  places: Place[];
  /** In orbit: how high, in km, its tilt to the equator, in degrees, minutes round, and how many degrees it trails
   *  another on the same path. */
  orbit?: { km: number; tilt: number; minutes: number; behind?: number };
  /** At L2: how far out from Earth, in km. */
  km?: number;
}

/** A build's story: what we have at Year 0, where it stands, why there, what it takes, and who tried before us. How
 *  long it takes is left to the build's page and the list, which reckon it with this game's compute, 2026-10-19. */
export interface Story {
  /** What Earth already has of its kind in 2040, so the build reads as a step from there. */
  have?: string;
  where: string;
  why: string;
  takes: string;
  before?: string;
}

const kt = (name: string) => BUILDS.find((b) => b.name === name)?.kt ?? 0;

export const SITES: Record<string, { site: Site; story: Story }> = {
  "All-Sky Watch": {
    // Two radio quiet zones, nearly opposite each other across Earth, one north and one south.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: 38.433, lon: -79.84, name: "Green Bank, West Virginia" },
        { lat: -26.7, lon: 116.67, name: "Murchison, Western Australia" },
      ],
    },
    story: {
      have: "Since 2028 our sky watch sees each northern star about ten minutes a day. It never sees the far southern sky, and catches about 1 knock in 5.",
      where:
        "Two fields of small antennas, at Green Bank in West Virginia and at Murchison in Western Australia. Both lie in radio quiet zones.",
      why: "They stand on nearly opposite sides of Earth, one north and one south. Each hears the half of the sky above it, so together they hear all of it, at every hour.",
      takes: "1.28 million small antennas, half at each.",
      before:
        "EMBRACE, in France, steered beams from 4,608 small antennas by 2011. Ours is the same idea, a few hundred times bigger.",
    },
  },
  "Deep Flash Watch": {
    // PANOSETI's own choice for its domes, and the darkest big observatory in the south, far round from it.
    site: {
      on: "earth",
      draw: "dome",
      places: [
        { lat: 33.356, lon: -116.865, name: "Palomar Mountain, California" },
        { lat: -32.38, lon: 20.81, name: "Sutherland, South Africa" },
      ],
    },
    story: {
      have: "Our watches listen for radio. For laser flashes we have only a few small telescopes at Lick, each on its own patch of sky.",
      where:
        "Domes of small lens telescopes on Palomar Mountain in California and at Sutherland in South Africa. Two domes at each, 1 km apart.",
      why: "A laser knock is a flash a billionth of a second long. Both domes must see it at once, or it was a cosmic ray’s flash in our own air. Palomar watches the northern sky, Sutherland the southern.",
      takes: "45 telescopes in each dome.",
      before:
        "PANOSETI’s first telescopes began watching from Lick Observatory in 2021. Its plan for Palomar is two domes like these.",
    },
  },
  "Thought Fields": {
    // Around the biggest AI campus planned in 2025, where the land and the power already are.
    site: { on: "earth", draw: "ring", places: [{ lat: 32.48, lon: -91.63, name: "Richland Parish, Louisiana" }] },
    story: {
      have: "We think on about 250 GW of chips, a hundredth of Earth’s energy. That is fifty campuses the size of Hyperion, the giant of the 2020s.",
      where:
        "Around Hyperion, in Richland Parish, Louisiana, and on campuses like it. Each campus we build is a Year of the fabs’ chips.",
      why: "The land and the power lines are already there, so chips are the only wait.",
      takes: "Chips as fast as the fabs make them, a campus a Year. Each adds half again to all our compute, so the first draws about 120 GW, half a percent of Earth’s energy. After eleven, compute draws nine tenths of it.",
    },
  },
  "Infrared Telescope": {
    // Where Webb flies, and where NASA meant to send the Habitable Worlds Observatory.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Webb and Roman fly, and the ELT watches from Chile. The Habitable Worlds Observatory is about 8 Years from done. None can read a neighbor’s air.",
      where:
        "At L2, 1.5 million km out on Earth’s night side, where Webb flies. The Sun, Earth and Moon all stay behind it.",
      why: "Infrared is heat, so the telescope must be colder than the worlds it reads. One shade blocks all three, and behind it Webb holds near 40 K while its sunny side reaches 110 °C.",
      takes: "Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "NASA’s Habitable Worlds Observatory was to read the air of at least 25 such worlds from here in the 2040s. In April 2026 NASA asked only $5 million for it, down from $150 million.",
    },
  },
  "Star Mapper": {
    // At L2, where Gaia flew, and where GaiaNIR would.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Gaia mapped nearly two billion stars from 2014 to 2025. Its last catalog, out about 2030, holds every shift it saw.",
      where: "At L2, 1.5 million km out on Earth’s night side, where Gaia flew.",
      why: "A black hole is dark, but bends the light of stars behind it. As it passes, a star seems to slide a fraction of a thousandth of an arcsecond, and then back. Only a mapper as steady as Gaia sees that, and in the infrared it sees through the Galaxy’s dust to five times the stars.",
      takes: "A spinning telescope with two views of the sky, as Gaia had, built on Earth and flown out whole.",
      before: "In 2022 Sahu and colleagues weighed the first lone black hole, 5,000 light years away, from the shift it gave a star. ESA has studied GaiaNIR, an infrared Gaia, for the 2040s.",
    },
  },
  "Halo Survey": {
    // ALMA's dishes on the Chajnantor plateau, 5,000 m up in Chile's Atacama, where the air holds least water.
    site: { on: "earth", draw: "dome", places: [{ lat: -23.0193, lon: -67.7532, name: "Chajnantor, Chile" }] },
    story: {
      have: "Herschel and the JCMT watched hundreds of near stars for cold glow, and saw dust or nothing. PRIMA, launched in 2033, sees warmer glow faster, but not the coldest.",
      where: "ALMA’s 66 dishes on the Chajnantor plateau, 5,000 m up in Chile’s Atacama desert.",
      why: "Water in the air drinks the submillimetre light a cold glow gives off, and this is among the driest places on Earth. An hour in each of two bands shows a glow’s color: dust reddens, cold computing stays grey.",
      takes: "About a Year of ALMA’s time to look at each star within 50 ly, then a look each Year after. It builds nothing new.",
      before: "In 2026 Garrett read the Herschel and JCMT surveys as limits on cold computing: nothing over about 7×10¹⁹ W at 10 pc. No one has looked deeper.",
    },
  },
  "Launch Complex": {
    // Europe's spaceport, near the equator, with open sea to the east.
    site: { on: "earth", draw: "launch", places: [{ lat: 5.236, lon: -52.769, name: "Kourou, French Guiana" }] },
    story: {
      have: "Reusable heavy lift carries about 40 kt a Year to orbit. Only about 15 kt is spare. The rest keeps working craft flying.",
      where: "Kourou, in French Guiana, Europe’s spaceport, 5° north of the equator.",
      why: "Near the equator, Earth’s turn gives a rocket its biggest push east: 463 m/s, against Florida’s 409. East of the pads lies open sea.",
      takes: "Earth’s own industry. It spends none of the matter we hold in orbit.",
      before: "In May 2026 ESA and France put €1 billion into Kourou, to host six new launchers.",
    },
  },
  "Launch Tunnel": {
    // StarTram's own sites for orbits round the equator are in the Andes or Africa. Cayambe, 5,790 m, is the highest
    // ground on the equator: our pick.
    site: { on: "earth", draw: "launch", places: [{ lat: 0.029, lon: -77.986, name: "Cayambe, Ecuador" }] },
    story: {
      have: "Every tonne we lift rides a rocket. Japan’s superconducting maglev reached 603 km/h in 2015.",
      where: "Through Cayambe, in the Andes of Ecuador, the highest ground on the equator. The tunnel’s mouth opens high on its flank.",
      why: "Craft leave at 8.8 km/s, so the thinner the air above the mouth, the less it slows them. High on the equator, they reach orbit with a small burn.",
      takes: "Earth’s own industry: 110 km of tunnel, superconducting coils and a 300 MW plant. It spends none of the matter we hold in orbit.",
      before: "James Powell, a co-inventor of superconducting maglev, and George Maise priced it at $20 billion in 2010. No part of it has been built.",
    },
  },
  "Orbital Yard": {
    // The ISS's orbit, which launch sites from Baikonur to Florida can all reach.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9 },
    },
    story: {
      have: "About 20 kt of spare metal circles Earth: depots, spent stages and dead craft. Nothing up there can join it into anything big.",
      where: "In low orbit, 400 km up, in the ISS’s orbit, tilted 51.6° to the equator. Once round every 93 minutes.",
      why: "Launch sites from Baikonur to Florida can all reach that tilt. Up there we can join parts too big to launch whole.",
      takes: "1 kt in orbit, a little over twice the ISS.",
      before: "The ISS took 13 years to build at the Shuttle’s pace. China’s Tiangong took 18 months.",
    },
  },
  "Moon Vault": {
    // The first radar evidence of a cave under a Moon pit: Carrer et al. 2024.
    site: { on: "moon", draw: "ring", places: [{ lat: 8.3355, lon: 33.222, name: "Sea of Tranquility pit" }] },
    story: {
      have: "Crews have landed on the Moon since 2028, and stations at its south pole are planned. Every copy of us is still on Earth.",
      where:
        "A cave under a pit in the Sea of Tranquility, 400 km from where Apollo 11 landed. A 2024 study of radar from orbit found signs of it.",
      why: "More than 100 m of rock overhead. In its shade it holds near 17 °C, through the lunar day and night. If Earth is hit, we go on from here.",
      takes: `${kt("Moon Vault")} kt of the 20 we hold in orbit.`,
      before: "In 2025 a small data center reached the Moon’s south pole. Its lander tipped over.",
    },
  },
  "Laser Sail Array": {
    // Starshot's own criteria, high, dry and southern, and the Atacama it weighed, beside ALMA, on the plateau with the
    // strongest sunlight measured on Earth.
    site: { on: "earth", draw: "ring", places: [{ lat: -23.03, lon: -67.7, name: "Chajnantor plateau, Chile" }] },
    story: {
      have: "Our strongest lasers on the ground run at a few hundred kilowatts. The array needs 100 GW, a third of a million times that.",
      where:
        "A square kilometer of lasers on the Chajnantor plateau in Chile’s Atacama, about 5,000 m up, 5 km east of ALMA’s dishes.",
      why: "High and dry, so the air blurs the beam least, and far south, where Proxima Centauri climbs 50° up. Its sunlight is the strongest measured on Earth, to charge the array between launches.",
      takes: "None of the matter we hold in orbit.",
      before:
        "Breakthrough Starshot set out this plan in 2016, with $100 million to begin. By 2025 it was on hold, with about $4.5 million spent.",
    },
  },
  "Probe Yard": {
    // Beside the yard, on the same orbit: the parts come up the same way.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 1.5 },
    },
    story: {
      have: "Nothing we have built has flown faster than Parker Solar Probe: 192 km/s, at its closest to the Sun in 2024.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 180 km behind it.",
      why: "A probe this big can’t be launched whole. Its parts come up to orbit, so we join and fuel it there.",
      takes: `${kt("Probe Yard")} kt of the 20 we hold in orbit. The first probe flies 12 Years after the yard is done.`,
      before:
        "Project Daedalus, from 1973 to 1978, planned a two-stage fusion probe of 54,000 t, built in Earth orbit as this one is. It would pass Barnard’s Star about 50 years after launch.",
    },
  },
  "Ground Solar": {
    // The largest solar park at work, the largest being built, and the Andes, where panels make the most power on Earth.
    site: {
      on: "earth",
      draw: "ring",
      places: [
        { lat: 36.19, lon: 100.54, name: "Talatan, Qinghai, China" },
        { lat: 24.117, lon: 69.35, name: "Khavda, Gujarat, India" },
        { lat: -24.095, lon: -66.724, name: "Cauchari, Jujuy, Argentina" },
      ],
    },
    story: {
      have: "Solar and wind grow our energy 1 to 2% a Year. The largest solar park, Talatan in China, already covered 420 km² in 2025.",
      where:
        "Fields of panels on dry, empty land: round Talatan on the Tibetan plateau, at Khavda in India’s salt desert, and at Cauchari, 4,000 m up in Argentina’s Andes.",
      why: "Clear, clean, thin air lets the most sunlight through, and cold keeps panels working well. Panels in the Andes make 15 to 20% more power than in the Sahara or Arabia.",
      takes: "None of the matter we hold in orbit. A fifth more energy is about 42,000 TWh a Year, 15 times what all our panels made in 2025.",
      before: "Khavda is to hold 30 GW of sun and wind by 2029. By April 2026 about 9.4 GW ran there.",
    },
  },
  "15 m Mirror": {
    // Beside the Infrared Telescope at L2, where LUVOIR-A, the 15 m design, was to fly.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Webb’s mirror, 6.5 m across, is the widest we have in space. The Habitable Worlds Observatory’s, about 6 m, is still being built.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside the Infrared Telescope.",
      why: "A wider mirror splits worlds that sit closer to their stars. At 15 m it reaches 2.3 times closer in than Webb’s, and gathers five times the light. At L2 the Sun, Earth and Moon all stay on one side.",
      takes: "About 40 t, as LUVOIR-A weighed with margin. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "LUVOIR-A, a 15 m design, reported to NASA in 2019 and aimed at a launch about 2039. The 2020 survey chose a telescope of about 6 m instead.",
    },
  },
  "Mind Link": {
    // Beside the 15 m Mirror at L2, where the Sun, Earth and Moon stay on one side, so it can aim anywhere else.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "In 2023 NASA’s DSOC sent 267 Mb/s by laser from 19 million miles, a 22 cm terminal on Psyche to a 5 m telescope. By 2025 it reached 218 million miles. No link reaches past the planets.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside the 15 m Mirror.",
      why: "Our dishes can’t carry a Mind: 100 PB would take them millions of Years. A laser with optics 100 m wide at both ends keeps its beam tight, so most of it lands. It sends a Mind 10 ly in under two days.",
      takes: "A mirror 100 m wide in segments, built in orbit, and a laser of 1 GW. Our Mind at the far end builds its own 100 m mirror to catch it.",
      before: "DSOC ended in 2025, past every goal. No one has built a mirror wider than Webb’s 6.5 m in space.",
    },
  },
  "Mass Driver": {
    // O’Neill’s group’s launch point: on the equator at 33.1° east, where throws scatter least on the way to a catcher
    // beyond the far side.
    site: { on: "moon", draw: "ring", places: [{ lat: 0, lon: 33.1, name: "Lunar equator, 33° east" }] },
    story: {
      have: "Crews have landed on the Moon since 2028. Every tonne we hold in orbit came up from Earth.",
      where:
        "On the Moon’s equator at 33° east, where the Sea of Tranquility meets the highlands, about 250 km south of the Moon Vault.",
      why: "Rock leaves at 2.4 km/s, the Moon’s escape speed, and coasts to a catcher beyond the far side. From this spot small errors in a throw scatter least, as O’Neill’s group showed in 1977.",
      takes: "About 1 kt of machines, landed from Earth. O’Neill’s design ran about half the time, throwing a 10 kg load four times a second.",
      before:
        "In 1977 MIT students built Mass Driver 1 for O’Neill and Kolm, largely from scrap. A 2026 study sized a 372 t driver for the Moon, throwing 263 kt a Year. None has been built there.",
    },
  },
  "Orbital Foundry": {
    // O’Neill’s group’s orbit for working Moon rock: half the Moon’s month, a nudge from where thrown rock is caught.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "High orbit, 235,000 km up" }],
      orbit: { km: 235_000, tilt: 25, minutes: 19_672 },
    },
    story: {
      have: "Small furnaces in orbit grow crystals for chips. Nothing up there has been made from rock.",
      where:
        "In a high orbit 235,000 km up, nearly two thirds of the way to the Moon, once round every 13.7 days, half the Moon’s month.",
      why: "Rock thrown from the Moon is caught beyond it, and a push of 10 to 30 m/s brings it to this orbit. Reaching low orbit and geostationary orbit from here costs less fuel than from the other places O’Neill’s group weighed.",
      takes: "About 1 kt of machines, then rock as it comes. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "O’Neill’s group placed a factory for Moon rock in this orbit in 1977. In 2025 Space Forge’s ForgeStar-1 lit a 1,000 °C furnace, the first on a free-flying commercial craft.",
    },
  },
  "Belt Mining": {
    // The map has no belt, so the mining stands where its rock comes home: the foundry's orbit, a little behind it.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "High orbit, where belt rock comes home" }],
      orbit: { km: 235_000, tilt: 25, minutes: 19_672, behind: 30 },
    },
    story: {
      have: "Our probes have brought home grams of asteroid, 121.6 g of it from Bennu. NASA’s Psyche reached a metal one in 2029. None has been mined.",
      where:
        "In the asteroid belt between Mars and Jupiter, 2.1 to 3.3 times Earth’s distance from the Sun. Its rock comes home to the Orbital Foundry’s high orbit.",
      why: "Some asteroids are largely metal, and some hold water. Psyche may be up to 60% metal, and Bennu’s grains hold water in their clay.",
      takes: "Survey probes from the Probe Yard first, then a fleet that hauls 120 kt a Year home.",
      before:
        "In 2012 a Keck Institute study planned to bring a whole 7 m asteroid, about 500 t, to high lunar orbit. AstroForge’s Odin, sent in 2025 to fly past an asteroid, was lost on the way.",
    },
  },
  "Far-Side Array": {
    // Near the middle of the far side, where Earth never rises: a crater long proposed for a radio telescope, deep in
    // the ITU’s shielded zone.
    site: { on: "moon", draw: "ring", places: [{ lat: -5.9, lon: 179.4, name: "Daedalus crater, far side" }] },
    story: {
      have: "Small receivers have listened from the far side since Chang’e 4 landed in 2019. Every big radio telescope we have is on Earth, under our own noise.",
      where: "Inside Daedalus crater, 94 km across, near the middle of the Moon’s far side, where Earth never rises.",
      why: "The Moon’s bulk dims our radio there more than ten billion times, and radio rules bar emissions that would harm radio astronomy. Only from there can we hear a world’s faint everyday hum.",
      takes: "About 1 Mt of metal, made in place from the far side’s own rock, as NASA’s FarView study plans on a smaller scale. It grows in fifths, each hearing farther.",
      before:
        "In 2026 a team searched Chang’e 4’s far-side recordings for a repeating signal, the first such search from there. It found none.",
    },
  },
  "Power from Orbit": {
    // Geostationary orbit, where NASA’s 2024 designs fly: once round a day, so each station hangs over one spot on Earth.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Geostationary orbit, 35,786 km up" }],
      orbit: { km: 35_786, tilt: 0, minutes: 1436.1 },
    },
    story: {
      have: "Tests have beamed a little power from orbit to the ground. Nothing up there feeds our grid.",
      where:
        "In geostationary orbit, 35,786 km above the equator. Each station beams to a field of antennas on the ground about 6 km across.",
      why: "Up there a station goes round once a day, so it hangs over one spot. Above the weather, NASA’s 2024 design makes power 99% of the time, day and night.",
      takes: "About 10 Mt of Moon rock, so it comes only as fast as rock does. NASA’s 2024 design sends down 2 GW from 5,900 t.",
      before: "Peter Glaser proposed it in 1968. In 2023 Caltech’s MAPLE beamed a little power from orbit to a rooftop in Pasadena.",
    },
  },
  "Solar Lens": {
    // Built at the Orbital Yard, in the ISS's orbit, before each lens dives for the Sun.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 30 },
    },
    story: {
      have: "No craft has gone past 170 AU. Voyager 1, the farthest, took 48 years to reach it.",
      where: "Built at the Orbital Yard, 400 km up. Each lens falls toward the Sun, swings close past it, and flies out the far side to 548 AU and beyond.",
      why: "The Sun’s gravity bends light passing it, and past 548 AU that light comes to a focus. A small telescope there sees one world through the Sun’s whole lens, its face kilometers to a pixel.",
      takes: "A few small sails, each with a telescope about 1 m wide. The dive past the Sun leaves at about 150 km/s, so it reaches the focus in about 17 Years.",
      before: "In 2020 Turyshev and colleagues finished NASA’s study of a lens mission. It would picture an exo-Earth 100 ly away at about 25 km a pixel, in half a year of looking.",
    },
  },
  "Cold Annex": {
    // At L2 beside our telescopes, where one shade hides the Sun, Earth and Moon together, so the radiators see only
    // the cold sky, as Webb's do.
    site: { on: "l2", draw: "ring", places: [{ lat: 0, lon: 0, name: "L2, 1.5 million km out" }], km: 1_500_000 },
    story: {
      have: "Since 2026 Suncatcher’s first chips have computed in orbit, in bursts, since their heat had nowhere to go. Nothing of ours computes cold.",
      where: "At L2, 1.5 million km out on Earth’s night side, beside our telescopes.",
      why: "Here one shade hides the Sun, Earth and Moon, as Webb’s does, so radiators behind it face only the cold sky. Chips at 77 K do about four times the work a watt, and no cooler has to run.",
      takes: "About 4 Mt of Moon rock: 1,200 GW of panels on the sunward side, and radiators near 300,000 km² behind the shade, at 77 K.",
      before: "In 2024 a 28 nm process tuned for 77 K ran on 37% less power. Below about 50 K chips gain little more.",
    },
  },
  "Deuterium Works": {
    // Where the largest heavy water plant ever ran, on the nuclear station’s steam, by Lake Huron.
    site: { on: "earth", draw: "ring", places: [{ lat: 44.325, lon: -81.599, name: "Bruce, Ontario, on Lake Huron" }] },
    story: {
      have: "We make heavy water only for reactors. India makes the most.",
      where: "Beside the Bruce nuclear station on Lake Huron, in Ontario, where Canada made heavy water from 1973 to 1997.",
      why: "Heavy water is drawn out with heat and a great deal of water, 340,000 t for each tonne. Bruce’s reactors gave the steam, by the lake. Glace Bay, in Nova Scotia, tried seawater, and the salt corroded it.",
      takes: "Plants 24 times Bruce’s at its peak, about 7,700 t of deuterium a Year, on under a fifth of a percent of our energy.",
      before:
        "Bruce made 1,600 t of heavy water a Year at its peak, the most of any plant, and 16,000 t in all. It closed when Canada’s reactors had enough.",
    },
  },
  "Fusion Drive": {
    // On the yard’s orbit, as Project Icarus planned for its Firefly, and lit only once towed behind the Moon.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 3 },
    },
    story: {
      have: "Fusion plants are being built, but none feeds the grid yet. No fusion engine has ever fired.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 350 km behind it.",
      why: "Its parts come up to orbit and are joined there, as Project Icarus planned for its Firefly. It burns deuterium and throws off radiation, so it is first lit behind the Moon, far from Earth.",
      takes: "An engine and radiators of 1,400 to 4,000 t, by Firefly’s figures scaled to our ship. Built in orbit, it takes a quarter less time once the yard is done.",
      before:
        "Firefly, drawn in 2015, burns deuterium for 10 years to reach 4.7% of light speed. Its pinch draws 1,175 GW. Zap Energy’s best ran at 39 kW in 2025.",
    },
  },
  "Seed Ship": {
    // On the yard’s orbit just past its drive: built where its parts come up, and fitted to the drive there.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9, behind: 4.5 },
    },
    story: {
      have: "Nothing we have launched can stop at another star. Voyager 1, our farthest, passes 1.7 ly from one in 40,000 years.",
      where: "In low orbit, 400 km up, on the Orbital Yard’s path, about 530 km behind it, 180 km past its Fusion Drive.",
      why: "At about 1,500 t it can’t be launched whole. Its parts come up to orbit, so we join it there, beside the drive that will carry it.",
      takes: `${kt("Seed Ship")} kt of the 20 we hold in orbit. About half is the magnetic sail it brakes on. The seed itself is about 443 t.`,
      before:
        "In 1980 Robert Freitas drew REPRO, a 443 t seed that lands on a giant planet’s moon and grows into a 346,000 t factory over 500 years.",
    },
  },
};
