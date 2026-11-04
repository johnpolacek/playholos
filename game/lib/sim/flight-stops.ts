// Simulation mode's places to fly, 2026-11-03: the stars round us, the minds, the peers and the worlds, each list
// nearest first by distance from Sol. Stars are real; the rest the dials drew. Pure, from the draw.
import { far, round } from "@/lib/about/dials";
import { skyBasis } from "../../../src/coordinates.js";
import type { DrawnMinds } from "./draw-minds.ts";
import type { NaturalWorld } from "./draw-worlds.ts";
import type { Body, BodyKind } from "./flight-view.ts";
import { LIFE } from "./pick.ts";
import { RUNGS } from "./draw-worlds.ts";
import type { Near } from "./tour.ts";

type Vec = [number, number, number];
export type Tab = "stars" | "minds" | "peers" | "worlds";
export const TABS: { id: Tab; label: string; one: string }[] = [
  { id: "stars", label: "Stars", one: "star" },
  { id: "minds", label: "Minds", one: "mind" },
  { id: "peers", label: "Peers", one: "peer" },
  { id: "worlds", label: "Worlds", one: "world" },
];

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
const placeOf = (w: NaturalWorld): Vec => {
  const r = skyBasis(w.ra * 15, w.dec).radial.multiplyScalar(w.d);
  return [r.x, r.y, r.z];
};
const worldKind = (w: NaturalWorld): BodyKind =>
  w.rung === RUNGS[4] ? "animals" : w.rung === RUNGS[3] ? "oxygen" : w.rung === RUNGS[2] ? "microbes" : "lifeless";

/** A mind's halo, light-years: the older, the wider. */
const haloOf = (age: number) => Math.min(4.5, 0.9 + 0.55 * Math.max(0, Math.log10(Math.max(age, 1)) - 4));

export function placesOf(
  tab: Tab,
  m: DrawnMinds,
  names: Record<string, string>,
  worlds: NaturalWorld[],
  near: Near[],
  today: number,
  toNow: number,
): Place[] {
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
  if (tab === "peers")
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
  return [...worlds]
    .sort((a, b) => a.d - b.d)
    .slice(0, MOST)
    .map((w) => ({
      id: `world-${w.star}`,
      pos: placeOf(w),
      d: w.d,
      kind: worldKind(w),
      title: w.name,
      words: `${far(w.d)} away, a rocky world in its star’s warm zone. ${LIFE[w.rung] ?? ""}`,
      stand: 0.35,
    }));
}

/** Everything the flight draws: Sol, the named stars, the minds, the peers, lit by whether their glow reaches us
 *  `years` from now, and the worlds. */
export function bodiesOf(m: DrawnMinds, names: Record<string, string>, worlds: NaturalWorld[], near: Near[], years: number, toNow: number): Body[] {
  return [
    { id: "sol", pos: [0, 0, 0], kind: "sol", label: "Sol", size: 0.5 },
    // A star with a drawn world is named once, by its world.
    ...near
      .filter((s) => !worlds.some((w) => w.name === s.name))
      .map((s): Body => ({ id: `star:${s.name}`, pos: s.pos, kind: "star", label: s.name, size: 0 })),
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
    ...worlds.map((w): Body => ({ id: `world-${w.star}`, pos: placeOf(w), kind: worldKind(w), label: w.name, size: 0.03 })),
  ];
}

/** "Nearest", "2nd nearest", and so on. */
export function rankOf(i: number, one: string): string {
  if (i === 0) return `Our nearest ${one}`;
  const n = i + 1, tail = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${tail} nearest ${one}`;
}
