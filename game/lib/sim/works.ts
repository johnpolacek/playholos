// Earth's works, paced by thought down the player's line. One loop for any order: a port of calcs/early_game.py's
// first_hour() and replay(), which pace the mocks' one game each, and are tested against it. The numbers are data,
// written by calcs/export_worlds.py. Settled 2026-10-13 and 14: thought buys speed down to a floor, each work in
// line gets its want in turn, then each is pushed to ten times it, and what is left sits idle.
//
// The loop jumps from event to event, so a date is exact rather than stepped: an order, a work done, a data center
// done, an observation starting or ending. Between events every rate holds still.
import catalog from "../../data/works.json" with { type: "json" };

/** One of the player's orders, at a Year. Replayed in order, they are the whole of Earth's building. */
export type Order =
  | { y: number; begin: string }            // a work joins the end of the line. "Data center" queues one for the fabs
  | { y: number; first: string }            // the player moves a work under way to the front
  | { y: number; standing: "Data center" }  // the fabs keep data centers coming, as many as the grid allows
  | { y: number; studies: number };         // thought set aside for the Mind's studies

interface Work {
  years?: number;                   // standard Years, at the thought its want buys
  want: number;                     // flagships of thought for standard pace
  orbit?: boolean;                  // built faster once the orbital yard is done
  milestone?: [string, number];     // a step done when this many standard Years are left
  then?: string[];                  // works that join the line when it is done
  copies?: [number, string];        // built this many times, each named this and its number
  rock?: number;                    // done when this many kt of rock have come in, not paced by thought
  most?: number;                    // the most times its want it can use. PUSH if missing
}
interface Catalog {
  works: Record<string, Work>;
  floor: number; push: number; flagship: number; gridRoom: number; step: number; studies: number;
  dataCenter: { years: number; aside: number };
  yard: { work: string; cut: number };
  rock: Record<string, number>;     // kt a Year from each work once it is done
}
export const CATALOG = catalog as unknown as Catalog;
const { works: WORKS, floor: FLOOR, push: PUSH, flagship: FLAGSHIP, step: STEP } = CATALOG;
const EPS = 1e-9;

/** Years a work takes when given s times the thought its standard pace needs. */
export const paced = (years: number, s: number) => years * (FLOOR + (1 - FLOOR) / s);

/** How many data centers fit under the grid, for a game whose Year 0 compute is `scale` of the no-branch path's. */
export const centers = (scale: number) => Math.floor(Math.log(CATALOG.gridRoom / scale) / Math.log(STEP));

/** Thought down the line: each work its want in order, then each pushed to its most. Returns times-want, and idle. */
export function split(line: readonly { want: number; most: number }[], room: number): { s: number[]; idle: number } {
  const give = line.map(({ want }) => { const g = Math.min(want, room); room -= g; return g; });
  line.forEach(({ want, most }, i) => { const more = Math.min(want * (most - 1), room); give[i] += more; room -= more; });
  return { s: give.map((g, i) => g / line[i].want), idle: room };
}

export interface Pace {
  at: number;
  /** The Year each work, step and copy was done. */
  done: Record<string, number>;
  /** Works under way, in the line's order: standard Years left, null if paced by rock, and times their want. */
  line: { work: string; left: number | null; s: number }[];
  /** The Year each data center was done. */
  dataCenters: number[];
  /** All of Earth's thought, what the line may use after set-asides, and what it leaves idle, in flagships. */
  thought: number;
  room: number;
  idle: number;
  /** Rock thrown from the Moon or hauled from the belt so far, kt. */
  rockKt: number;
}

export interface PaceOptions {
  /** Year 0 compute over the no-branch path's: the seed's earth.compute. */
  scale?: number;
  /** Thought set aside for observations: [from Year, to Year, share of Year 0 thought]. */
  aside?: readonly (readonly [number, number, number])[];
  /** Whether the works a done work opens join the line on their own, as the mocks have it. The game's player orders
   *  them instead, since 2026-10-22. */
  follow?: boolean;
}

/** Earth's works at Year `until`, from the player's orders. */
export function pace(orders: readonly Order[], until: number, { scale = 1, aside = [], follow = true }: PaceOptions = {}): Pace {
  const queue = [...orders].sort((a, b) => a.y - b.y);                     // a stable sort keeps one Year's orders as given
  const line: string[] = [], left = new Map<string, number>(), begun = new Map<string, number>(), moved = new Set<string>();
  const done: Record<string, number> = {}, built = new Map<string, number>(), dataCenters: number[] = [];
  let t = 0, studies = CATALOG.studies, fits = centers(scale), queued = 0, standing = false, building: number | null = null;
  let s: number[] = [], room = 0, idle = 0, thought = 0;

  const rockAt = (y: number) => Object.entries(CATALOG.rock).reduce((kt, [w, rate]) => kt + rate * Math.max(0, y - (done[w] ?? Infinity)), 0);
  const rockRate = () => Object.entries(CATALOG.rock).reduce((r, [w, rate]) => r + (done[w] !== undefined ? rate : 0), 0);
  const yardDone = () => done[CATALOG.yard.work] !== undefined;
  // A work that joins the line later takes its parent's place in the order begun: before works begun after it,
  // unless the player moved those to the front. As the mocks place the far-side array behind a seed ship's works.
  const place = (w: string) => { const i = line.findIndex((x) => begun.get(x)! > begun.get(w)! && !moved.has(x)); return i < 0 ? line.length : i; };
  const join = (w: string, at: number, since: number, years = WORKS[w].years) => {
    begun.set(w, since);
    if (years !== undefined) left.set(w, years * (WORKS[w].orbit && yardDone() ? 1 - CATALOG.yard.cut : 1));
    line.splice(at, 0, w);
  };

  /** Everything due at Year t: works done, data centers, then the player's orders. */
  const settle = () => {
    for (let changed = true; changed; ) {
      changed = false;
      if (building !== null && building + CATALOG.dataCenter.years <= t + EPS) { dataCenters.push(t); building = null; changed = true; }
      if (building === null && dataCenters.length < fits && (queued > 0 || standing)) { building = t; if (queued > 0) queued--; changed = true; }
      for (const w of [...line]) {
        const work = WORKS[w], l = left.get(w);
        if (work.milestone && l !== undefined && l <= work.milestone[1] + EPS && done[work.milestone[0]] === undefined) done[work.milestone[0]] = t;
        if (!(work.rock !== undefined ? rockAt(t) >= work.rock - EPS : l !== undefined && l <= EPS)) continue;
        line.splice(line.indexOf(w), 1); left.delete(w); changed = true;
        if (work.rock !== undefined) fits++;                               // power from orbit: one more data center fits
        if (work.copies) {
          const n = (built.get(w) ?? 0) + 1; built.set(w, n); done[`${work.copies[1]} ${n}`] = t;
          if (n < work.copies[0]) join(w, place(w), begun.get(w)!);
        } else done[w] = t;
        if (w === CATALOG.yard.work) for (const x of line) if (WORKS[x].orbit && left.has(x)) left.set(x, left.get(x)! * (1 - CATALOG.yard.cut));
        if (follow && work.then) { const at = place(w); work.then.forEach((x, i) => join(x, at + i, begun.get(w)!)); }
      }
      while (queue.length && queue[0].y <= t + EPS) {
        const o = queue.shift()!; changed = true;
        if ("studies" in o) studies = o.studies;
        else if ("standing" in o) standing = true;
        else if ("first" in o) { const i = line.indexOf(o.first); if (i >= 0) { line.splice(i, 1); line.unshift(o.first); moved.add(o.first); } }
        else if (o.begin === "Data center") queued++;
        else if (WORKS[o.begin] && !line.includes(o.begin) && done[o.begin] === undefined) join(o.begin, line.length, t);
      }
    }
    thought = (scale * STEP ** dataCenters.length) / FLAGSHIP;
    // What is set aside is a share of this Earth's own Year 0 compute, so studies keep a tenth of it whatever a war
    // left, as calcs/early_game.py has it since 2026-10-22.
    const set = scale * (studies + aside.reduce((sum, [a, b, share]) => sum + (a <= t + EPS && t + EPS < b ? share : 0), 0) + (building !== null ? CATALOG.dataCenter.aside : 0));
    room = Math.max(0, thought - set / FLAGSHIP);
    ({ s, idle } = split(line.map((w) => ({ want: WORKS[w].want, most: WORKS[w].most ?? PUSH })), room));
  };

  for (let guard = 0; ; guard++) {
    if (guard > 1e5) throw new Error("Pacing did not settle.");
    settle();
    const rate = line.map((w, i) => (left.has(w) && s[i] > 0 ? 1 / paced(1, s[i]) : 0));
    let next = until;
    if (queue.length) next = Math.min(next, queue[0].y);
    for (const [a, b] of aside) for (const edge of [a, b]) if (edge > t + EPS) next = Math.min(next, edge);
    if (building !== null) next = Math.min(next, building + CATALOG.dataCenter.years);
    line.forEach((w, i) => {
      const l = left.get(w), m = WORKS[w].milestone;
      if (l !== undefined && rate[i] > 0) {
        next = Math.min(next, t + l / rate[i]);
        if (m && l > m[1] + EPS) next = Math.min(next, t + (l - m[1]) / rate[i]);
      }
      const need = WORKS[w].rock;
      if (need !== undefined && rockRate() > 0) next = Math.min(next, t + (need - rockAt(t)) / rockRate());
    });
    line.forEach((w, i) => { if (left.has(w)) left.set(w, left.get(w)! - rate[i] * (next - t)); });
    t = next;
    if (t >= until - EPS) { settle(); break; }
  }
  return {
    at: until, done, dataCenters, thought, room, idle, rockKt: rockAt(until),
    line: line.map((w, i) => ({ work: w, left: left.get(w) ?? null, s: s[i] })),
  };
}
