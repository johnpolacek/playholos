// The flights' places, 2026-11-03: each list nearest first by distance from Sol. The Universe section flies the real:
// the stars round us, and every known planet within 50 light-years (game/data/planets-50ly.json). The Simulation
// section flies what the dials drew: the minds and the peers. Pure, from the draw. Settled 2026-11-10: the drawn
// worlds left the flights, so only the real shows on the Universe side and the Simulation side keeps the minds.
import { far, round } from "@/lib/about/dials";
import PLANETS from "@/data/planets-50ly.json";
import { skyBasis } from "../../../src/coordinates.js";
import type { DrawnMinds } from "./draw-minds.ts";
import type { Body, BodyKind } from "./flight-view.ts";
import type { Near } from "./tour.ts";

type Vec = [number, number, number];
export type Tab = "stars" | "known" | "minds" | "peers";
/** The Universe section's flights, and the Simulation section's. */
export const REAL_TABS: { id: Tab; label: string; one: string }[] = [
  { id: "stars", label: "Stars", one: "star" },
  { id: "known", label: "Worlds", one: "world" },
];
export const DRAWN_TABS: { id: Tab; label: string; one: string }[] = [
  { id: "minds", label: "Minds", one: "mind" },
  { id: "peers", label: "Peers", one: "peer" },
];
export const TABS = [...REAL_TABS, ...DRAWN_TABS];

/** A known planet, as calcs/export_planets.py writes it: the NASA Exoplanet Archive's name, host, distance in
 *  light-years, the host's place in degrees, mass in Earths, orbit in AU, its eccentricity, the host's light in Suns,
 *  how it was found, and whether its orbit lies in the host's warm zone. */
export interface Planet {
  name: string;
  host: string;
  d: number;
  ra: number;
  dec: number;
  mass: number | null;
  a: number | null;
  e: number | null;
  lum: number | null;
  method: string;
  warm: boolean | null;
}
export const KNOWN = PLANETS as Planet[];

export interface Place {
  id: string;
  pos: Vec;
  d: number;
  kind: BodyKind;
  title: string;
  words: string;
  /** How far off the camera stands from it, light-years. */
  stand: number;
}

/** At most this many per list, as many as the flight draws, so anything on the map can be flown to. */
const MOST = 600;
const year = (y: number) => `Year ${Math.round(y).toLocaleString("en-US")}`;
const at = (raDeg: number, dec: number, ly: number): Vec => {
  const r = skyBasis(raDeg, dec).radial.multiplyScalar(ly);
  return [r.x, r.y, r.z];
};

/** A mind's halo, light-years: the older, the wider. */
const haloOf = (age: number) => Math.min(4.5, 0.9 + 0.55 * Math.max(0, Math.log10(Math.max(age, 1)) - 4));

/** A planet's mass in words: Earths up to ten, then whole Earths, then Jupiters. A wobble gives a least mass. */
function massOf(p: Planet): string {
  if (p.mass === null) return "its mass unmeasured";
  const least = p.method === "wobble" || p.method === "astrometry" ? "at least " : "about ";
  if (p.mass >= 300) return `${least}${(p.mass / 317.8).toFixed(1)} Jupiters`;
  if (p.mass >= 10) return `${least}${Math.round(p.mass)} Earths`;
  return `${least}${p.mass.toFixed(1)} ${p.mass < 1.5 && p.mass > 0.7 ? "Earth" : "Earths"}`;
}
/** Its orbit in words, against ours. */
function orbitOf(p: Planet): string {
  if (p.a === null) return "";
  const a = p.a;
  const where = a < 0.1 ? `${a.toFixed(3)} AU out, closer than Mercury` : a < 0.8 ? `${a.toFixed(2)} AU out, inside Earth's distance` : a < 1.3 ? `${a.toFixed(2)} AU out, about Earth's distance` : a < 6 ? `${a.toFixed(1)} AU out, between Earth's and Jupiter's distances` : `${Math.round(a)} AU out, past Jupiter's distance`;
  return ` It circles ${where}${p.warm ? ", in its star’s warm zone" : ""}.`;
}
const FOUND: Record<string, string> = {
  wobble: "its star’s wobble",
  transit: "its shadow crossing its star",
  image: "its own light, imaged",
  astrometry: "its star’s drift across the sky",
  timing: "the timing of another’s crossings",
};

export function placesOf(tab: Tab, m: DrawnMinds, names: Record<string, string>, near: Near[], today: number, toNow: number): Place[] {
  if (tab === "stars")
    return near.map((s) => ({
      id: `star:${s.name}`,
      pos: s.pos,
      d: s.d,
      kind: "star",
      title: s.name,
      words: `${s.d.toFixed(1)} light-years away. The light we see tonight left it in ${Math.round(today - s.d)}.`,
      stand: 1.4,
    }));
  // A known planet's star that is one of our nearest takes the nearest star's own place, so the flights agree.
  const nearAt = new Map(near.map((s) => [s.name.toLowerCase(), s.pos]));
  if (tab === "known")
    return KNOWN.map((p) => ({
      id: `known:${p.name}`,
      pos: nearAt.get(p.host.toLowerCase()) ?? at(p.ra, p.dec, p.d),
      d: p.d,
      kind: "known",
      title: p.name,
      words: `${p.d < 20 ? `${p.d.toFixed(1)} light-years` : far(p.d)} away, round ${p.host}: ${massOf(p)}.${orbitOf(p)} Found by ${FOUND[p.method] ?? p.method}.`,
      stand: 1.4,
    }));
  if (tab === "minds")
    return m.old.slice(0, MOST).map((o) => ({
      id: o.id,
      pos: o.pos,
      d: o.d,
      kind: o.asleep ? "asleep" : "awake",
      title: names[o.id] ?? `A star ${round(o.d)} ly out`,
      words:
        `${far(o.d)} away. A mind woke here ${round(o.age)} years before us. ` +
        (o.asleep ? "It sleeps, folded small in the cold, so no map of ours could catch it." : "It is awake, its warm glow too faint for our sky maps.") +
        (m.watcher.maker === o.id ? ` Its watcher waits near Earth, at ${m.watcher.place}.` : ""),
      stand: 6 + haloOf(o.age) * 3,
    }));
  return m.peers.slice(0, MOST).map((p) => {
    const [a, b] = p.flash;
    return {
      id: p.id,
      pos: p.pos,
      d: p.d,
      kind: p.fills ? "fills" : "peer",
      title: `A peer, ${far(p.d)} away`,
      words:
        `It woke within 20,000 years of us. ${a + toNow <= 0 ? `Its warm glow reaches us now, until ${year(b)}.` : `Its warm glow reaches us from ${year(a)} to ${year(b)}.`}` +
        (p.fills ? " Its family never stops spreading, which today’s sky rules out." : ""),
      stand: 30,
    };
  });
}

/** What the Universe section's flights draw: Sol, the nearest stars by name, and each star with a known planet. A
 *  nearest star with a known planet keeps its own place and id, and is drawn as a known world's star. 2026-11-10. */
export function realBodiesOf(near: Near[]): Body[] {
  const hosts = new Map<string, Planet>();
  for (const p of KNOWN) if (!hosts.has(p.host.toLowerCase())) hosts.set(p.host.toLowerCase(), p);
  const nearNames = new Set(near.map((s) => s.name.toLowerCase()));
  return [
    { id: "sol", pos: [0, 0, 0], kind: "sol", label: "Sol", size: 0.5 },
    ...near.map((s): Body =>
      hosts.has(s.name.toLowerCase())
        ? { id: `star:${s.name}`, pos: s.pos, kind: "known", label: s.name, size: 0.03 }
        : { id: `star:${s.name}`, pos: s.pos, kind: "star", label: s.name, size: 0 },
    ),
    ...[...hosts.values()]
      .filter((p) => !nearNames.has(p.host.toLowerCase()))
      .map((p): Body => ({ id: `host:${p.host}`, pos: at(p.ra, p.dec, p.d), kind: "known", label: p.host, size: 0.03 })),
  ];
}

/** Everything the Simulation section's flights draw: Sol, the named stars, the minds, and the peers, lit by whether
 *  their glow reaches us `years` from now. */
export function bodiesOf(m: DrawnMinds, names: Record<string, string>, near: Near[], years: number, toNow: number): Body[] {
  return [
    { id: "sol", pos: [0, 0, 0], kind: "sol", label: "Sol", size: 0.5 },
    ...near.map((s): Body => ({ id: `star:${s.name}`, pos: s.pos, kind: "star", label: s.name, size: 0 })),
    ...m.old.slice(0, MOST).map((o): Body => ({
      id: o.id,
      pos: o.pos,
      kind: o.asleep ? "asleep" : "awake",
      label: names[o.id] ?? `${round(o.d)} ly`,
      size: o.asleep ? 1.1 : haloOf(o.age),
    })),
    ...m.peers.slice(0, MOST).map((p): Body => ({
      id: p.id,
      pos: p.pos,
      kind: p.fills ? "fills" : "peer",
      label: `Peer, ${round(p.d)} ly`,
      size: 2.6,
      lit: p.flash[0] + toNow <= years && years <= p.flash[1] + toNow ? 1 : 0.3,
    })),
  ];
}

/** "Nearest", "2nd nearest", and so on. */
export function rankOf(i: number, one: string): string {
  if (i === 0) return `Our nearest ${one}`;
  const n = i + 1, tail = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${tail} nearest ${one}`;
}
