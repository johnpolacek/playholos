// Where each build would stand, for the map, and what it holds, for the Projects tab. Picking a build there flies the
// map to its place. All but the infrared telescope have theirs so far. Sources in HOLOS_RESEARCH.md, "Where the Moon
// vault stands", "Where the watches stand" and "Where the data center, launch complex and yard stand".
import { BUILDS } from "./plan";
import { CATALOG } from "@/lib/sim/works";

/** One place a build stands: latitude, and longitude east. On the Moon, longitude runs from the middle of the side
 *  that faces Earth. */
export interface Place {
  lat: number;
  lon: number;
  /** Its name on the map. */
  name: string;
}

/** Where a build stands: on Earth, the Moon or in orbit, at one place or more. */
export interface Site {
  on: "earth" | "moon" | "orbit";
  /** How the map draws it: a dome of the sky each place watches, a ring round it, or paths up to orbit from it. */
  draw: "dome" | "ring" | "launch";
  /** In orbit, one place, its name only. */
  places: Place[];
  /** In orbit: how high, in km, its tilt to the equator, in degrees, and minutes round. */
  orbit?: { km: number; tilt: number; minutes: number };
}

/** A build's story: where it stands, why there, what it takes, and who tried before us. */
export interface Story {
  where: string;
  why: string;
  takes: string;
  before?: string;
}

const kt = (name: string) => BUILDS.find((b) => b.name === name)?.kt ?? 0;
const years = (name: string) =>
  name === "Data center" ? CATALOG.dataCenter.years : (CATALOG.works[name]?.years ?? 0);

export const SITES: Record<string, { site: Site; story: Story }> = {
  "All-sky watch": {
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
      where:
        "Two fields of small antennas, at Green Bank in West Virginia and at Murchison in Western Australia. Both lie in radio quiet zones.",
      why: "They stand on nearly opposite sides of Earth, one north and one south. Each hears the half of the sky above it, so together they hear all of it, at every hour.",
      takes: `About ${years("All-sky watch")} Years, and 1.28 million small antennas, half at each.`,
      before:
        "EMBRACE, in France, steered beams from 4,608 small antennas by 2011. This is that, a few hundred times over.",
    },
  },
  "Deep flash watch": {
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
      where:
        "Domes of small lens telescopes on Palomar Mountain in California and at Sutherland in South Africa. Two domes at each, 1 km apart.",
      why: "A laser knock is a flash a billionth of a second long. Both domes must see it at once, or it was a cosmic ray’s flash in our own air. Palomar watches the northern sky, Sutherland the southern.",
      takes: `About ${years("Deep flash watch")} Years, and 45 telescopes in each dome.`,
      before:
        "PANOSETI’s first telescopes began watching from Lick Observatory in 2021. Its plan for Palomar is two domes like these.",
    },
  },
  "Data center": {
    // Beside the biggest AI campus planned in 2025, where the land and the power already are.
    site: { on: "earth", draw: "ring", places: [{ lat: 32.48, lon: -91.63, name: "Richland Parish, Louisiana" }] },
    story: {
      where:
        "Beside Hyperion, in Richland Parish, Louisiana: 11 data centers on 13.6 km², planned in 2025 to draw 5 GW.",
      why: "The land, the power lines and the new gas plants are already there. Each data center adds half again to our thought.",
      takes: `About ${years("Data center")} Year, as fast as the chip factories fill it. At first it draws about half a percent of Earth’s energy.`,
      before:
        "Stargate’s campus at Abilene, Texas, began in 2024, eight buildings for 1.2 GW. By April 2026, about 200 MW ran.",
    },
  },
  "Launch complex": {
    // Europe's spaceport, near the equator, with open sea to the east.
    site: { on: "earth", draw: "launch", places: [{ lat: 5.236, lon: -52.769, name: "Kourou, French Guiana" }] },
    story: {
      where: "Kourou, in French Guiana, Europe’s spaceport, 5° north of the equator.",
      why: "Near the equator, Earth’s turn gives a rocket its biggest push east: 463 m/s, against Florida’s 409. East of the pads lies open sea.",
      takes: `About ${years("Launch complex")} Years, built from Earth’s own industry. It spends none of the matter we hold in orbit.`,
      before: "In May 2026 ESA and France put €1 billion into Kourou, to host six new launchers.",
    },
  },
  "Orbital yard": {
    // The ISS's orbit, which launch sites from Baikonur to Florida can all reach.
    site: {
      on: "orbit",
      draw: "ring",
      places: [{ lat: 0, lon: 0, name: "Low orbit, 400 km up" }],
      orbit: { km: 400, tilt: 51.6, minutes: 92.9 },
    },
    story: {
      where: "In low orbit, 400 km up, in the ISS’s orbit, tilted 51.6° to the equator. Once round every 93 minutes.",
      why: "Launch sites from Baikonur to Florida can all reach that tilt. Up there we can join parts too big to launch whole.",
      takes: `About ${years("Orbital yard")} Years, and 1 kt in orbit, a little over twice the ISS.`,
      before: "The ISS took 13 years to build at the Shuttle’s pace. China’s Tiangong took 18 months.",
    },
  },
  "Moon vault": {
    // The first radar evidence of a cave under a Moon pit: Carrer et al. 2024.
    site: { on: "moon", draw: "ring", places: [{ lat: 8.3355, lon: 33.222, name: "Sea of Tranquility pit" }] },
    story: {
      where:
        "A cave under a pit in the Sea of Tranquility, 400 km from where Apollo 11 landed. A 2024 study of radar from orbit found signs of it.",
      why: "More than 100 m of rock overhead. In its shade it holds near 17 °C, through the lunar day and night. If Earth is hit, we go on from here.",
      takes: `About ${years("Moon vault")} Years, and ${kt("Moon vault")} kt of the 20 we hold in orbit.`,
      before: "In 2025 a small data center reached the Moon’s south pole. Its lander tipped over.",
    },
  },
};
