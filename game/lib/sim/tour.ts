// Simulation mode's tour: the stops through a drawn sky, and what in it today's sky rules out. Pure, from the draw, so
// gameplay could take the same words later. 2026-11-01.
import { far, odds, round } from "@/lib/about/dials";
import type { SimMind } from "@/lib/drift";
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
}

export interface Clash {
  title: string;
  words: string;
}

const LY_AU = 63241.077;
const zoomFor = (ly: number) => Math.log10(2.5 * ly * LY_AU);
/** The Galaxy's center in the atlas frame: Galactic X toward it, 8.2 kpc. */
const CENTER: Vec = [26745, 0, 0];
const CATALOG_LY = 326;
/** Above about this many fillers on average, more likely than not one mind's family filled the Galaxy. */
const LIKELY = Math.LN2;

const years = (y: number) => `${round(y)} years`;
const year = (y: number) => `Year ${Math.round(y).toLocaleString("en-US")}`;

/** The map's points: each old mind and peer by kind. */
export function pointsOf(m: DrawnMinds): SimMind[] {
  return [
    ...m.old.map((o): SimMind => ({ pos: o.pos, kind: o.asleep ? "asleep" : "awake" })),
    ...m.peers.map((p): SimMind => ({ pos: p.pos, kind: p.fills ? "fills" : "peer" })),
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

export function tourOf(m: DrawnMinds, o: Odds): Stop[] {
  const galaxy = 2e11 / o.starsPerMind;
  const stops: Stop[] = [];
  stops.push({
    id: "sun",
    title: "Our Sun",
    words: `At these odds, ${odds(1 / o.starsPerMind)} stars holds a mind. Our Galaxy holds about ${round(galaxy)} of them, nearly all far older than us.`,
    focus: null,
    zoom: 7.0,
    label: "Sol",
  });

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
      : `${near.star === null ? `None of the stars within ${CATALOG_LY} light-years holds one. It` : "It"} lies ${far(near.d)} away and woke ${years(near.age)} before us. ${sleeping} Its watcher waits near Earth, at ${m.watcher.place}.`,
    focus: near.pos,
    zoom: alone ? 10.3 : Math.min(10.3, Math.max(6.6, zoomFor(near.d))),
    label: "Nearest mind",
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
      zoom: Math.min(10.3, Math.max(6.6, zoomFor(peer.d))),
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

  const filler = m.peers.find((p) => p.fills);
  if (filler)
    stops.push({
      id: "fills",
      title: "A mind that filled the Galaxy",
      words: "Its family never stopped spreading. In time it would have settled every star, ours too. Today’s sky shows no such thing.",
      focus: filler.pos,
      zoom: Math.min(10.3, Math.max(6.6, zoomFor(filler.d))),
      label: "Never stopped",
      clash: true,
    });
  return stops;
}
