// Where each build would stand, for the map, and what it holds, for the Build tab. Picking a build there flies the
// map to its place. Sources in HOLOS_RESEARCH.md, "Where the Moon vault stands", "Where the watches stand", "Where
// the data center, launch complex and yard stand" and "Where the infrared telescope stands".
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
 *  long it takes is left to the build's page and the list, which reckon it with this game's thought, 2026-10-19. */
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
        "EMBRACE, in France, steered beams from 4,608 small antennas by 2011. This is that, a few hundred times over.",
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
      takes: "Chips as fast as the fabs make them. It draws about 120 GW, half a percent of Earth’s energy.",
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
      takes: "Building in orbit, a quarter faster once the yard is done.",
      before:
        "NASA’s Habitable Worlds Observatory was to read the air of at least 25 such worlds from here in the 2040s. In April 2026 NASA asked only $5 million for it, down from $150 million.",
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
        "Breakthrough Starshot set out this plan in 2016, with 100 million dollars to begin. By 2025 it was on hold, about 4.5 million spent.",
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
      takes: `${kt("Probe Yard")} kt of the 20 we hold in orbit. The first probe flies 12 Years after.`,
      before:
        "Project Daedalus, from 1973 to 1978, planned a two-stage fusion probe of 54,000 t, built in Earth orbit as this one is. It would pass Barnard’s Star about 50 years after launch.",
    },
  },
};
