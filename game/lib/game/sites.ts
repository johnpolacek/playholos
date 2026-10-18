// Where each build would stand, for the map, and what it holds, for the Projects tab. Picking a build there flies the
// map to its place. Only the Moon vault has one so far. Sources in HOLOS_RESEARCH.md, "Where the Moon vault stands".
import { BUILDS } from "./plan";
import { CATALOG } from "@/lib/sim/works";

/** A place on the Moon: latitude, and longitude east, from the middle of the side that faces Earth. */
export interface Site {
  on: "moon";
  lat: number;
  lon: number;
  /** Its name on the map. */
  name: string;
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
  "Moon vault": {
    // The one Moon cave confirmed under a pit, by radar: Carrer et al. 2024.
    site: { on: "moon", lat: 8.3355, lon: 33.222, name: "Sea of Tranquility pit" },
    story: {
      where:
        "A cave under a pit in the Sea of Tranquility, 400 km from where Apollo 11 landed. A 2024 study of radar from orbit found it.",
      why: "More than 100 m of rock overhead. In its shade it holds near 17 °C, through the lunar day and night. If Earth is hit, we go on from here.",
      takes: `About ${years("Moon vault")} Years, and ${kt("Moon vault")} kt of the 20 we hold in orbit.`,
      before: "In 2025 a small data center reached the Moon’s south pole. Its lander tipped over.",
    },
  },
};
