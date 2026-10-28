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
  | { y: number; drop: string }             // the player takes a work back: it leaves the line and keeps its work, to
                                            // pick up there if begun again. "Data center" ends the fabs' standing
                                            // order, and a campus under way is finished. 2026-10-23
  | { y: number; studies: number }          // thought set aside for the Mind's studies
  | { y: number; gift: string; steps: number } // a neighbor's knowledge, all of it come: our thought goes `steps`
                                            // steps further from then, as many data centers would. Once a star.
                                            // 2026-10-26
  | { y: number; harm: number; recover: number } // a strike on Earth: this share of our thought lost, won back
                                            // evenly over `recover` Years. lib/sim/conflict.ts. 2026-10-28
  | { y: number; restore: number; doubling: number }; // Earth's Mind lost, and its backup woken where something
                                            // can run it: this share of our thought, doubling every so many Years
                                            // as its industry copies itself, back to all of it. lib/game/hits.ts

interface Work {
  years?: number;                   // standard Years, at the thought its want buys
  want: number;                     // flagships of thought for standard pace
  orbit?: boolean;                  // built faster once the orbital yard is done
  milestone?: [string, number];     // a step done when this many standard Years are left
  then?: string[];                  // works that join the line when it is done
  copies?: [number, string];        // built this many times, each named this and its number
  rock?: number;                    // done when this many kt of rock have come in, not paced by thought
  most?: number;                    // the most times its want it can use. PUSH if missing
  energy?: number;                  // the share of Year 0's grid it adds once done, so more data centers fit
}
interface Catalog {
  works: Record<string, Work>;
  floor: number; push: number; flagship: number; gridRoom: number; step: number; studies: number;
  dataCenter: { years: number; aside: number };
  yard: { work: string; cut: number };
  halo: { floor: number; every: number };
  lens: { au: number; flight: number; look: number; km30pc: number };
  sentinel: { build: number; speed: number; burns: number };
  seedShip: { speed: number; burn: number; brake: number; stands: number };
  seedProbe: { build: number; first: number; every: number; copies: number; generations: number };
  mindLink: { bits: number; aperture: number; watts: number; wave: number; photons: number };
  rock: Record<string, number>;     // kt a Year from each work once it is done
}
export const CATALOG = catalog as unknown as Catalog;
const { works: WORKS, floor: FLOOR, push: PUSH, flagship: FLAGSHIP, step: STEP } = CATALOG;
const EPS = 1e-9;
/** How much further our thought goes for a gift of so many steps, as many data centers would make it go. */
export const giftTimes = (steps: number) => STEP ** steps;

/** Works a woken backup can still build: what is joined in orbit, and what stands on the Moon or among the rocks. All
 *  else is on Earth, and is lost with it, data centers too. 2026-10-28. */
const OFF_EARTH = new Set(["Moon vault", "Orbital yard", "Mass driver", "Belt mining", "Far-side array, one fifth", "Power from orbit", "Cold annex"]);
export const offEarth = (w: string) => OFF_EARTH.has(w) || WORKS[w]?.orbit === true;

/** Years a work takes when given s times the thought its standard pace needs. */
export const paced = (years: number, s: number) => years * (FLOOR + (1 - FLOOR) / s);

/** How many data centers fit under the grid, for a game whose Year 0 compute is `scale` of the no-branch path's. */
export const centers = (scale: number, more = 0) => Math.floor(Math.log((CATALOG.gridRoom * (1 + more)) / scale) / Math.log(STEP));

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
  /** Works taken back and not begun again: the standard Years each had left, and the share of it built. */
  kept: Record<string, { left: number; built: number }>;
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
  // A work taken back: its standard Years left of the whole, and whether the yard was done then, so it gets the yard's
  // cut once. The whole is each work's standard Years when begun, cut with what is left, so the share built holds.
  const kept = new Map<string, { left: number; whole: number; yard: boolean }>(), whole = new Map<string, number>();
  let t = 0, studies = CATALOG.studies, fits = centers(scale), more = 0, queued = 0, standing = false, building: number | null = null;
  let s: number[] = [], room = 0, idle = 0, thought = 0;
  const gifts = new Map<string, number>();
  const harms: { y: number; harm: number; recover: number }[] = [];
  const backup: { o: { y: number; restore: number; doubling: number } | null } = { o: null };
  /** What a woken backup thinks with at Year `at`, as a share of what Earth had: none before it wakes. */
  const regrown = (at: number) => {
    const r = backup.o;
    return r && at >= r.y ? Math.min(1, r.restore * 2 ** ((at - r.y) / r.doubling)) : 1;
  };
  /** What strikes leave of our thought at Year t: each loss shrinking as we rebuild. */
  const spared = (at: number) =>
    harms.reduce((m, h) => m * (1 - h.harm * Math.max(0, 1 - (at - h.y) / h.recover)), 1) * regrown(at);

  const rockAt = (y: number) => Object.entries(CATALOG.rock).reduce((kt, [w, rate]) => kt + rate * Math.max(0, y - (done[w] ?? Infinity)), 0);
  const rockRate = () => Object.entries(CATALOG.rock).reduce((r, [w, rate]) => r + (done[w] !== undefined ? rate : 0), 0);
  // Rock goes to the works that wait on it one at a time, first in line first, and what one holds is spent: power from
  // orbit and the cold annex never share the same megatonnes. 2026-10-26.
  const rockSpent = () => Object.keys(done).reduce((kt, w) => kt + (WORKS[w]?.rock ?? 0), 0);
  const rockFirst = () => line.find((w) => WORKS[w].rock !== undefined);
  const yardDone = () => done[CATALOG.yard.work] !== undefined;
  // A work that joins the line later takes its parent's place in the order begun: before works begun after it,
  // unless the player moved those to the front. As the mocks place the far-side array behind a seed ship's works.
  const place = (w: string) => { const i = line.findIndex((x) => begun.get(x)! > begun.get(w)! && !moved.has(x)); return i < 0 ? line.length : i; };
  const join = (w: string, at: number, since: number, years = WORKS[w].years) => {
    begun.set(w, since);
    if (years !== undefined) whole.set(w, left.set(w, years * (WORKS[w].orbit && yardDone() ? 1 - CATALOG.yard.cut : 1)).get(w)!);
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
        if (!(work.rock !== undefined ? w === rockFirst() && rockAt(t) - rockSpent() >= work.rock - EPS : l !== undefined && l <= EPS)) continue;
        line.splice(line.indexOf(w), 1); left.delete(w); changed = true;
        if (work.rock !== undefined) fits++;                               // power from orbit or the cold annex: one more data center fits
        // Fusion plants add to the grid itself, so as many more fit as its new room holds. 2026-10-28.
        if (work.energy) { fits += centers(scale, more + work.energy) - centers(scale, more); more += work.energy; }
        if (work.copies) {
          const n = (built.get(w) ?? 0) + 1; built.set(w, n); done[`${work.copies[1]} ${n}`] = t;
          if (n < work.copies[0]) join(w, place(w), begun.get(w)!);
        } else done[w] = t;
        if (w === CATALOG.yard.work)
          for (const x of line) if (WORKS[x].orbit && left.has(x)) { left.set(x, left.get(x)! * (1 - CATALOG.yard.cut)); whole.set(x, whole.get(x)! * (1 - CATALOG.yard.cut)); }
        if (follow && work.then) { const at = place(w); work.then.filter((x) => !backup.o || offEarth(x)).forEach((x, i) => join(x, at + i, begun.get(w)!)); }
      }
      while (queue.length && queue[0].y <= t + EPS) {
        const o = queue.shift()!; changed = true;
        if ("studies" in o) studies = o.studies;
        else if ("gift" in o) { if (!gifts.has(o.gift)) gifts.set(o.gift, o.steps); }
        else if ("harm" in o) harms.push(o);
        else if ("restore" in o) {
          backup.o = o; standing = false; queued = 0; building = null;
          for (const w of [...line]) if (!offEarth(w)) { line.splice(line.indexOf(w), 1); left.delete(w); }
        }
        else if ("standing" in o) standing = !backup.o;
        else if ("first" in o) { const i = line.indexOf(o.first); if (i >= 0) { line.splice(i, 1); line.unshift(o.first); moved.add(o.first); } }
        else if ("drop" in o) {
          if (o.drop === "Data center") standing = false;
          else if (line.includes(o.drop)) {
            if (left.has(o.drop)) kept.set(o.drop, { left: left.get(o.drop)!, whole: whole.get(o.drop)!, yard: yardDone() });
            line.splice(line.indexOf(o.drop), 1); left.delete(o.drop);
          }
        }
        else if (o.begin === "Data center") queued += backup.o ? 0 : 1;
        else if (WORKS[o.begin] && !line.includes(o.begin) && done[o.begin] === undefined && (!backup.o || offEarth(o.begin))) {
          join(o.begin, line.length, t);
          const k = kept.get(o.begin);
          if (k) {
            const cut = WORKS[o.begin].orbit && !k.yard && yardDone() ? 1 - CATALOG.yard.cut : 1;
            left.set(o.begin, k.left * cut); whole.set(o.begin, k.whole * cut); kept.delete(o.begin);
          }
        }
      }
    }
    thought = (spared(t) * scale * STEP ** dataCenters.length * STEP ** [...gifts.values()].reduce((a, b) => a + b, 0)) / FLAGSHIP;
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
    // While we rebuild, thought comes back a little each tenth of a Year.
    if (harms.some((h) => t + EPS < h.y + h.recover)) next = Math.min(next, t + 0.1);
    if (backup.o && t + EPS >= backup.o.y && regrown(t) < 1) next = Math.min(next, t + 0.25);
    if (building !== null) next = Math.min(next, building + CATALOG.dataCenter.years);
    line.forEach((w, i) => {
      const l = left.get(w), m = WORKS[w].milestone;
      if (l !== undefined && rate[i] > 0) {
        next = Math.min(next, t + l / rate[i]);
        if (m && l > m[1] + EPS) next = Math.min(next, t + (l - m[1]) / rate[i]);
      }
      const need = WORKS[w].rock;
      if (need !== undefined && w === rockFirst() && rockRate() > 0) next = Math.min(next, t + (need - rockAt(t) + rockSpent()) / rockRate());
    });
    line.forEach((w, i) => { if (left.has(w)) left.set(w, left.get(w)! - rate[i] * (next - t)); });
    t = next;
    if (t >= until - EPS) { settle(); break; }
  }
  return {
    at: until, done, dataCenters, thought, room, idle, rockKt: rockAt(until),
    kept: Object.fromEntries([...kept].map(([w, k]) => [w, { left: k.left, built: 1 - k.left / k.whole }])),
    line: line.map((w, i) => ({ work: w, left: left.get(w) ?? null, s: s[i] })),
  };
}
