// Where each build would stand, for the map, and what it holds, for the Projects tab. Picking a build there flies the
// map to its place. The Moon vault and the two watches have theirs so far. Sources in HOLOS_RESEARCH.md, "Where the
// Moon vault stands" and "Where the watches stand".
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

/** Where a build stands: on Earth or the Moon, at one place or more. */
export interface Site {
  on: "earth" | "moon";
  places: Place[];
}

/** A build's story: where it stands, why there, what it takes, and who tried before us. */
export interface Story {
  where: string;
  why: string;
  takes: string;
  before?: string;
}

const kt = (name: string) => BUILDS.find((b) => b.name === name)?.kt ?? 0;
const years = (name: string) => CATALOG.works[name]?.years ?? 0;

export const SITES: Record<string, { site: Site; story: Story }> = {
  "All-sky watch": {
    // Two radio quiet zones, nearly opposite each other across Earth, one north and one south.
    site: {
      on: "earth",
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
  "Moon vault": {
    // The first radar evidence of a cave under a Moon pit: Carrer et al. 2024.
    site: { on: "moon", places: [{ lat: 8.3355, lon: 33.222, name: "Sea of Tranquility pit" }] },
    story: {
      where:
        "A cave under a pit in the Sea of Tranquility, 400 km from where Apollo 11 landed. A 2024 study of radar from orbit found signs of it.",
      why: "More than 100 m of rock overhead. In its shade it holds near 17 °C, through the lunar day and night. If Earth is hit, we go on from here.",
      takes: `About ${years("Moon vault")} Years, and ${kt("Moon vault")} kt of the 20 we hold in orbit.`,
      before: "In 2025 a small data center reached the Moon’s south pole. Its lander tipped over.",
    },
  },
};
