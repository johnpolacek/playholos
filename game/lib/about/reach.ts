// How far can we reach, on /about/research: craft real and planned, flown out past real stars to the nearest mind and
// beyond. The seed ship is the game's own, from data/works.json. Pure, so the page draws from it.
import works from "../../data/works.json" with { type: "json" };
import { chain } from "./dials.ts";
import type { Source } from "./dials.ts";

const { speed, burn, brake } = works.seedShip;

export interface Craft {
  key: string;
  name: string;
  /** Cruise speed, as a share of light's. */
  c: number;
  /** Years added to every trip: a burn and braking. */
  extra: number;
  note: string;
}

export const CRAFT: Craft[] = [
  {
    key: "voyager",
    name: "Voyager 1",
    c: 17 / 299_792,
    extra: 0,
    note: "our fastest craft leaving the Sun",
  },
  {
    key: "sail",
    name: "A sail that stops",
    c: 0.038,
    extra: 0,
    note: "braking on starlight",
  },
  {
    key: "seed",
    name: "Our seed ship",
    c: speed,
    extra: burn + brake,
    note: "the game’s, a tenth of light speed",
  },
  {
    key: "starshot",
    name: "Starshot",
    c: 0.2,
    extra: 0,
    note: "gram probes that fly past, on hold",
  },
  { key: "light", name: "A message", c: 1, extra: 0, note: "at light speed" },
];

/** Where they go, in light-years. The nearest mind is Holos's own, half the time within it. */
export const PLACES: { name: string; ly: number }[] = [
  { name: "Proxima", ly: 4.24 },
  { name: "Tau Ceti", ly: 11.9 },
  { name: "TRAPPIST-1", ly: 40.7 },
  {
    name: "Nearest mind",
    ly: Math.round(chain({}, 2000).nearest.ly / 10) * 10,
  },
  { name: "Galaxy’s center", ly: 26_700 },
  { name: "Andromeda", ly: 2.5e6 },
];

export const trip = (k: Craft, ly: number) => ly / k.c + k.extra;

export const SOURCES: Source[] = [
  {
    who: "Voyager 1",
    url: "https://en.wikipedia.org/wiki/Voyager_1",
    found:
      "Leaves the Sun at about 17 km/s, so about 75,000 years to the nearest star.",
  },
  {
    who: "Heller and Hippke 2017",
    url: "https://arxiv.org/abs/1701.08803",
    found:
      "A sail can brake on starlight, so the Sun can catch or launch one at up to 3.8% of light speed.",
  },
  {
    who: "Gros 2017",
    url: "https://arxiv.org/abs/1707.02801",
    found:
      "A magnetic sail stops a big ship from a tenth of light speed in about 19 years, with no fuel.",
  },
  {
    who: "Project Daedalus",
    url: "https://en.wikipedia.org/wiki/Project_Daedalus",
    found:
      "A 1970s fusion probe design at 12% of light speed, 50 years to Barnard’s Star.",
  },
  {
    who: "Eubanks et al. 2026",
    url: "https://arxiv.org/abs/2604.20182",
    found:
      "A swarm of gram-scale sail probes at a fifth of light speed, flying through Proxima’s system.",
  },
  {
    who: "Scoles 2025",
    url: "https://www.scientificamerican.com/article/the-quiet-demise-of-breakthrough-starshot-a-billionaires-interstellar/",
    found: "Breakthrough Starshot is on hold.",
  },
];
