// Simulation mode's tour: the stops through a drawn sky, and what in it today's sky rules out. Pure, from the draw, so
// gameplay could take the same words later. 2026-11-01.
import { far, odds, round } from "@/lib/about/dials";
import type { SimMind, WorldKind } from "@/lib/drift";
import { skyBasis } from "../../../src/coordinates.js";
import { ALIVE, RUNGS, type NaturalWorld } from "./draw-worlds.ts";
import type { DrawnMinds, Odds } from "./draw-minds.ts";

type Vec = [number, number, number];

export interface Stop {
  id: string;
  title: string;
  words: string;
  /** The place in view, light-years in the atlas frame, or null for our Sun. */
  focus: Vec | null;
  /** How far out the view stands, log10 AU. */
  zoom: number;
  /** The name the map gives the place in view. */
  label?: string;
  /** Today's sky rules this stop's subject out. */
  clash?: boolean;
  /** The drawn sky shows, and the dials with it: from the stop that hands them over on. */
  reveal?: boolean;
  /** Lines out from Sol to our nearest stars, each with its distance. */
  spokes?: boolean;
  /** On first opening, the tour moves on by itself after this many seconds: the dive from the universe to our Galaxy. */
  auto?: number;
  /** Time passes here: a slider runs the years ahead. */
  time?: boolean;
  /** Words the map puts at places, light-years in the atlas frame. They stand in for Sol's name. */
  notes?: { id: string; pos: Vec; text: string }[];
}

/** How far time runs ahead, in years: a peer is a mind that woke within 20,000 years of us. */
export const AHEAD = 20_000;
/** Our first radio, the start of our light out among the stars. */
const FIRST_RADIO = 1950;
/** How far our light has gone, `years` from now, in light-years. */
export const lightAt = (years: number, today: number) => today - FIRST_RADIO + years;

/** At `years` from now: how many peers glow at us, and how many our light has reached. `toNow` turns a game Year,
 *  counted from 2040, into years from now. */
export function timeOf(m: DrawnMinds, years: number, toNow: number, today: number) {
  const light = lightAt(years, today);
  return {
    glowing: m.peers.filter((p) => p.flash[0] + toNow <= years && years <= p.flash[1] + toNow).length,
    reached: m.peers.filter((p) => p.d <= light).length,
    light,
  };
}

/** One of our nearest stars, as data/stars.json names and places it. */
export interface Near {
  name: string;
  pos: Vec;
  d: number;
}

/** The Galaxy's stars, and how far our Sun is from its center, as calcs/minds.py's disk puts it. */
const GALAXY_STARS = 2e11;
const SUN_FROM_CENTER = 26745;
/** The objects within 50 ly in Gaia's census of nearby stars, data/gcns-326ly-meta.json. */
const WITHIN_50 = 1210;

/** The minds the map names round the place in view: the nearest old minds and the nearest peers, with what each is. */
export function namedOf(m: DrawnMinds, names: Record<string, string>, worlds: NaturalWorld[] = []): Named[] {
  const ly = (d: number) => `${round(d)} ly`;
  return [
    ...worlds.filter(living).slice(0, 6).map((w) => ({ id: `world-${w.star}`, pos: placeOf(w), label: w.name, kind: kindOf(w) as Named["kind"] })),
    ...m.old.slice(0, 8).map((o): Named => ({ id: o.id, pos: o.pos, label: names[o.id] ?? ly(o.d), kind: o.asleep ? "asleep" : "awake" })),
    ...m.peers.slice(0, 4).map((p): Named => ({ id: p.id, pos: p.pos, label: ly(p.d), kind: "peer" })),
  ];
}

/** A place the map names: its words, and the mark beside them for what it is. */
export interface Named {
  id: string;
  pos: Vec;
  label: string;
  kind: "awake" | "asleep" | "peer" | "animals" | "oxygen" | "microbes";
}

export interface Clash {
  title: string;
  words: string;
}

const LY_AU = 63241.077;
const zoomFor = (ly: number) => Math.log10(2.5 * ly * LY_AU);
/** For a place off to one side: farther out, since the view turns round Sol and the place sits toward its edge. */
const sideZoom = (ly: number) => Math.min(10.3, Math.max(6.6, Math.log10(4.5 * ly * LY_AU)));
/** The Galaxy's center in the atlas frame: Galactic X toward it, 8.2 kpc. */
export const CENTER: Vec = [26745, 0, 0];
/** The opening's view, log10 AU: far enough out that the whole disk and our Sun at its edge both show. */
export const OPENING = 9.95;
/** The universe we can see, log10 AU: its edge, 46.5 billion light-years out, all in view. */
export const UNIVERSE = 15.9;
/** Andromeda, 776 kpc out, the Local Volume Database's distance, at its place in the sky. */
const ANDROMEDA: Vec = (() => {
  const r = skyBasis(10.6847, 41.2688).radial.multiplyScalar(2.532e6);
  return [r.x, r.y, r.z];
})();
const CATALOG_LY = 326;
/** Above about this many fillers on average, more likely than not one mind's family filled the Galaxy. */
const LIKELY = Math.LN2;

const years = (y: number) => `${round(y)} years`;
const year = (y: number) => `Year ${Math.round(y).toLocaleString("en-US")}`;

/** Where a world's star is, light-years in the atlas frame. */
const placeOf = (w: NaturalWorld): Vec => {
  const r = skyBasis(w.ra * 15, w.dec).radial.multiplyScalar(w.d);
  return [r.x, r.y, r.z];
};
const kindOf = (w: NaturalWorld): WorldKind =>
  w.rung === RUNGS[4] ? "animals" : w.rung === RUNGS[3] ? "oxygen" : w.rung === RUNGS[2] ? "microbes" : "lifeless";
const living = (w: NaturalWorld) => ALIVE.includes(w.rung);

/** The map's points: each natural world by how far its life has come, then each old mind and peer by kind. */
export function pointsOf(m: DrawnMinds, worlds: NaturalWorld[] = [], toNow = 0): SimMind[] {
  return [
    ...worlds.map((w): SimMind => ({ pos: placeOf(w), kind: kindOf(w) })),
    ...m.old.map((o): SimMind => ({ pos: o.pos, kind: o.asleep ? "asleep" : "awake" })),
    ...m.peers.map((p): SimMind => ({
      pos: p.pos,
      kind: p.fills ? "fills" : "peer",
      flash: [p.flash[0] + toNow, p.flash[1] + toNow],
    })),
  ];
}

/** What this sky shows that ours does not. */
export function clashesOf(m: DrawnMinds, odds_: Odds, fillers: number): Clash[] {
  const out: Clash[] = [];
  const chance = 1 - Math.exp(-fillers);
  if (fillers >= LIKELY)
    out.push({
      title: "Settlers would be here",
      words: `At these odds, ${chance >= 0.995 ? "it is near certain that" : `there is a ${Math.round(chance * 100)}% chance`} some mind’s family never stopped spreading and filled the Galaxy, our Sun’s system too. We find no settlers here, so today’s sky rules this out.`,
    });
  const fill = m.peers.filter((p) => p.fills).length;
  if (fill)
    out.push({
      title: fill === 1 ? "One peer fills the Galaxy" : `${fill} peers fill the Galaxy`,
      words: "Drawn in rose on the map. A family that never stops would reach every star, ours included.",
    });
  return out;
}

/** The tour. It opens on the Galaxy as we know it, comes down to our Sun today and out to our nearest stars, then
 *  hands over the dials and goes through what they draw. names gives some old minds' stars by name, by mind id, worlds
 *  the natural warm worlds within 50 ly, and near our nearest stars. Settled 2026-11-01. */
export function tourOf(m: DrawnMinds, o: Odds, names: Record<string, string> = {}, worlds: NaturalWorld[] = [], nearest: Near[] = []): Stop[] {
  const galaxy = GALAXY_STARS / o.starsPerMind;
  const stops: Stop[] = [];
  // The dive: from the edge of what we can see, in through the galaxies round us, to ours.
  stops.push({
    id: "universe",
    title: "The universe we can see",
    words:
      "Everything we have mapped, 43,000 galaxies, fits in the bright knot at the center. Hundreds of billions more fill the rest, out to the edge, as far as light has had time to reach us. We sit at the center only because we are the ones looking.",
    focus: null,
    zoom: UNIVERSE,
    auto: 8,
    notes: [
      { id: "mapped", pos: [0, 3.2e9, 0], text: "All we have mapped: 43,000 galaxies" },
      { id: "drawn", pos: [-1.6e10, -9e9, 0], text: "Hundreds of billions more, drawn" },
      // Toward the Galaxy's center, which the opening's view puts at the sphere's right edge.
      { id: "edge", pos: [4.65e10, 0, 0], text: "The edge of what we can see, 46 billion light-years" },
    ],
  });
  stops.push({
    id: "laniakea",
    title: "Our corner of it",
    words:
      "Laniakea, the supercluster we live in: about 100,000 galaxies across 520 million light-years, all falling toward one place.",
    focus: null,
    zoom: 13.4,
    auto: 5,
  });
  stops.push({
    id: "group",
    title: "Our Local Group",
    words: "Andromeda, 2.5 million light-years away, and dozens of small galaxies, held to ours by gravity.",
    focus: ANDROMEDA,
    zoom: 11.0,
    label: "Andromeda",
    auto: 5,
  });
  stops.push({
    id: "galaxy",
    title: "Our Galaxy",
    words: `About ${round(GALAXY_STARS)} stars. Ours is one of them, ${far(SUN_FROM_CENTER)} from the center. Are we alone among them?`,
    focus: CENTER,
    zoom: OPENING,
    label: "The Galaxy’s center",
  });
  stops.push({
    id: "today",
    title: "Our Sun, today",
    words:
      "Eight planets, and one with life we know of: ours. Voyager 1, the farthest we have reached, is about one light-day out. " +
      "We know thousands of worlds round other stars, 227 of them within 50 light-years. We have heard no one, seen no one’s works, and met no settlers.",
    focus: null,
    zoom: 1.75,
    label: "Sol",
  });
  const first = nearest[0];
  stops.push({
    id: "near",
    title: "Our nearest stars",
    words: first
      ? `Each line to scale. ${first.name} is the nearest, ${first.d.toFixed(1)} light-years away: its light takes ${first.d.toFixed(1)} years to reach us, and Voyager 1, at 3.6 AU a year, would take about ${round((first.d * LY_AU) / 3.6)}. Within 50 light-years lie about ${WITHIN_50.toLocaleString("en-US")} stars.`
      : `Within 50 light-years lie about ${WITHIN_50.toLocaleString("en-US")} stars.`,
    focus: null,
    zoom: 6.35,
    spokes: true,
  });
  stops.push({
    id: "dials",
    title: "Turn the dials",
    words: `No one yet knows how often life starts, lasts, or wakes into a mind. Each dial is one step, set as far as the research allows. At these odds, ${odds(1 / o.starsPerMind)} stars holds a mind, about ${round(galaxy)} in our Galaxy, nearly all far older than us. Turn one and watch who appears.`,
    focus: null,
    zoom: 7.0,
    reveal: true,
  });

  if (worlds.length) {
    const n = (r: (typeof RUNGS)[number]) => worlds.filter((w) => w.rung === r).length;
    const airy = worlds.length - n(RUNGS[0]);
    const alive = worlds.filter(living).length;
    const best = worlds.find((w) => w.rung === RUNGS[4]) ?? worlds.find(living);
    const count = (k: number, one: string, many: string) => `${k.toLocaleString("en-US")} ${k === 1 ? one : many}`;
    stops.push({
      id: "worlds",
      title: "Worlds round us",
      words:
        `Within 50 light-years, ${count(worlds.length, "warm rocky world", "warm rocky worlds")}. ${airy.toLocaleString("en-US")} kept ${airy === 1 ? "its" : "their"} air. ` +
        (alive
          ? `Life holds on ${alive.toLocaleString("en-US")}: ${n(RUNGS[4])} with animals and forests, ${n(RUNGS[3])} showing oxygen, ${n(RUNGS[2])} with microbes hidden. On ${n(RUNGS[5])} more, life began and died. `
          : `Life holds on none. `) +
        (best ? `The nearest ${best.rung === RUNGS[4] ? "with animals" : "alive"} circles ${best.name}, ${far(best.d)} away.` : ""),
      focus: best ? placeOf(best) : null,
      zoom: best ? sideZoom(best.d) : 7.0,
      label: best?.name,
    });
  }

  const near = m.old[0];
  const alone = near.d > 1e5;
  const sleeping = near.asleep
    ? "It sleeps, folded small in the cold, so no map of ours could catch it."
    : "It is awake, and its warm glow stays under what our sky maps can catch.";
  stops.push({
    id: "nearest",
    title: "Our nearest mind",
    words: alone
      ? `No mind in our Galaxy but us. The nearest lies about ${far(near.d)} away, past its edge.`
      : `${near.star === null ? `None of the stars within ${CATALOG_LY} light-years holds one. It lies ${far(near.d)} away` : names[near.id] ? `It lives at ${names[near.id]}, ${far(near.d)} away,` : `It lies ${far(near.d)} away`} and woke ${years(near.age)} before us. ${sleeping} Its watcher waits near Earth, at ${m.watcher.place}.`,
    focus: near.pos,
    zoom: alone ? 10.3 : sideZoom(near.d),
    label: names[near.id] ?? "Nearest mind",
  });

  const inside = m.old.filter((x) => x.d <= CATALOG_LY);
  if (inside.length > 1) {
    const asleep = inside.filter((x) => x.asleep).length;
    stops.push({
      id: "old",
      title: "Old minds around us",
      words: `${inside.length.toLocaleString("en-US")} old minds on the real stars within ${CATALOG_LY} light-years. ${asleep.toLocaleString("en-US")} sleep. The rest are awake, in blue, their glow too faint for the maps we have.`,
      focus: null,
      zoom: zoomFor(CATALOG_LY),
    });
  }

  const peer = m.peers[0];
  if (peer) {
    const now = peer.flash[0] <= 0;
    stops.push({
      id: "peer",
      title: "Our nearest peer",
      words: `A mind that woke within 20,000 years of us, ${far(peer.d)} away. ${now ? `Its warm glow reaches us now, until ${year(peer.flash[1])}.` : `Its warm glow reaches us from ${year(peer.flash[0])} to ${year(peer.flash[1])}.`}${peer.fills ? " Its family never stops spreading." : ""}`,
      focus: peer.pos,
      zoom: sideZoom(peer.d),
      label: "Nearest peer",
      clash: peer.fills,
    });
  }

  stops.push({
    id: "peers",
    title: "Every peer",
    words: m.peers.length
      ? `${m.peers.length.toLocaleString("en-US")} peers across the Galaxy whose warm glow still reaches us, in amber. Each woke within 20,000 years of us.`
      : "No peer: no mind woke within 20,000 years of us, so none is young as we are.",
    focus: CENTER,
    zoom: 9.75,
    label: "The Galaxy’s center",
  });

  if (m.peers.length)
    stops.push({
      id: "time",
      title: "The next 20,000 years",
      words:
        "Slide time forward. A peer glows warm at us only while it builds out and spreads, a few centuries to a few thousand years, then fades. Our own light, out since our first radio, spreads to meet them.",
      focus: CENTER,
      zoom: 9.75,
      time: true,
    });

  const filler = m.peers.find((p) => p.fills);
  if (filler)
    stops.push({
      id: "fills",
      title: "A mind that filled the Galaxy",
      words: "Its family never stopped spreading. In time it would have settled every star, ours too. Today’s sky shows no such thing.",
      focus: filler.pos,
      zoom: sideZoom(filler.d),
      label: "Never stopped",
      clash: true,
    });
  for (const s of stops.slice(stops.findIndex((x) => x.id === "dials"))) s.reveal = true;
  return stops;
}
