// Simulation mode's draw, off the page's thread: at common odds a sky holds thousands of old minds and tens of thousands
// of peers, a second or more of work. It reads the real census once, then draws each sky asked for. 2026-11-01.
import { starsWithin } from "@/lib/about/dials";
import { catalogOf, drawMinds, fillers, safeTop, type DrawnMinds, type Odds } from "./draw-minds.ts";

export interface Ask {
  id: number;
  /** What was asked for, echoed back. */
  key: string;
  seed: number;
  odds: Odds;
}
export interface Drawn {
  id: number;
  key: string;
  minds: DrawnMinds;
  /** Minds in the Galaxy, at these odds, that would fill it on average, and the highest chance to spread that keeps
   *  it unsettled. */
  fillers: number;
  safeTop: number;
}

let stars: ReturnType<typeof catalogOf> | null = null;
const catalog = fetch(new URL("../../../data/gcns-326ly.bin", import.meta.url))
  .then((r) => r.arrayBuffer())
  .then((b) => (stars = catalogOf(b)));

self.onmessage = async ({ data }: MessageEvent<Ask>) => {
  await catalog;
  const minds = drawMinds(data.seed, stars!, data.odds, starsWithin);
  const out: Drawn = { id: data.id, key: data.key, minds, fillers: fillers(data.odds), safeTop: safeTop(data.odds.starsPerMind) };
  (self as unknown as Worker).postMessage(out);
};
