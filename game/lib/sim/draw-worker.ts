// Simulation mode's draw, off the page's thread: at common odds a sky holds thousands of old minds and tens of thousands
// of peers, a second or more of work. It reads the real census once, then draws each sky asked for. 2026-11-01.
import { starsWithin } from "@/lib/about/dials";
import { catalogOf, drawMinds, fillers, safeTop, type DrawnMinds, type Odds } from "./draw-minds.ts";
import { drawWorlds, type Host, type NaturalWorld, type WorldOdds } from "./draw-worlds.ts";

export interface Ask {
  id: number;
  /** What was asked for, echoed back. */
  key: string;
  seed: number;
  odds: Odds;
  worlds: WorldOdds;
}
export interface Drawn {
  id: number;
  key: string;
  minds: DrawnMinds;
  /** Minds in the Galaxy, at these odds, that would fill it on average, and the highest chance to spread that keeps
   *  it unsettled. */
  fillers: number;
  safeTop: number;
  /** The names of old minds' stars we have names for, by mind id: the nearby stars of data/stars.json. */
  names: Record<string, string>;
  /** The natural warm worlds within 50 ly, nearest first. */
  worlds: NaturalWorld[];
}

/** Named stars, by place: data/stars.json, the same frame as the census, out to about 50 ly and some beyond. */
type Named = { name: string; pos: [number, number, number]; distance: number };
const named: Promise<Named[]> = fetch(new URL("../../../data/stars.json", import.meta.url)).then((r) => r.json());

/** A mind's star's name, where a named star sits within a fraction of a light-year of it. */
function namesOf(minds: DrawnMinds, list: Named[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of minds.old) {
    if (m.star === null || m.d > 80) continue;
    let best: Named | null = null, gap = Math.max(0.15, m.d * 0.01);
    for (const n of list) {
      const g = Math.hypot(n.pos[0] - m.pos[0], n.pos[1] - m.pos[1], n.pos[2] - m.pos[2]);
      if (g < gap) [best, gap] = [n, g];
    }
    if (best) out[m.id] = best.name;
  }
  return out;
}

let stars: ReturnType<typeof catalogOf> | null = null;
const hosts: Promise<Host[]> = fetch(new URL("../../data/sim-hosts.json", import.meta.url)).then((r) => r.json());
const catalog = fetch(new URL("../../../data/gcns-326ly.bin", import.meta.url))
  .then((r) => r.arrayBuffer())
  .then((b) => (stars = catalogOf(b)));

self.onmessage = async ({ data }: MessageEvent<Ask>) => {
  await catalog;
  const minds = drawMinds(data.seed, stars!, data.odds, starsWithin);
  const names = namesOf(minds, await named.catch(() => []));
  const worlds = drawWorlds(data.seed, await hosts, data.worlds);
  const out: Drawn = { id: data.id, key: data.key, minds, fillers: fillers(data.odds), safeTop: safeTop(data.odds.starsPerMind), names, worlds };
  (self as unknown as Worker).postMessage(out);
};
