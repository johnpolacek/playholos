// How neighbors take the messages in play: ours, and each other's. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's How
// neighbors play: when a message lands, the neighbor's table draws a few moves by their odds, fresh each game, and the
// model picks one in its character. What a neighbor sends lands on others in turn, so the sky plays on without us. This
// is the part with no model in it: who gets what, when it lands, the news it is, and the moves on offer. Server only:
// it reads the seed's truth. Pure, so it tests fast.
import { dates } from "../game/sends.ts";
import type { Reaction, Sent, Size } from "../game/types.ts";
import { probesToUs, strikesBetween, theirScreens } from "./conflict.ts";
import { type Craft, lossesOf, type Notice, notices, REFUGE_FOUND } from "./meetings.ts";
import { aimedYears, GRID_2040, noticeReach, powerFor, readReach, SIZES } from "./messages.ts";
import { PyRandom } from "./pyrandom.ts";
import { MOVES, TABLES, type News } from "./reactions.ts";
import type { Neighbor, World } from "./types.ts";
import catalog from "../../data/works.json" with { type: "json" };

/** Moves that send something, which the model writes in the neighbor's voice. */
export const SPEAKS = new Set(["knock", "answer", "gift", "mask", "call"]);

/** Moves held out of play. A warning needs a third world the neighbor knows of, and who has heard whom is not worked
 *  out yet, 2026-10-26. */
const HELD = new Set(["warn"]);

/** Earth, as a sender or a target. */
export const SOL = "Sol";

/** How far a neighbor's call every way at once can be read: a woken Mind's dishes, past every star in play. A sample. */
export const CALL_REACH = 60;

/** Moves the model makes for neighbors on each other's news, each century of a game. Past it, a neighbor still moves
 *  by its odds, but sends nothing new, so the talk dies down. A sample, to cap what one game costs. */
export const STAR_BUDGET = 60;
export const budgetAt = (now: number) => STAR_BUDGET * Math.max(1, Math.ceil(now / 100));

/** One message in play: ours, or a neighbor's. */
export interface Signal {
  id: string;
  /** Who sent it: a star's shown name, or Sol. */
  from: string;
  /** A star's shown name, Sol, or every way at once. */
  to: string;
  text: string;
  size: Size;
  /** A neighbor's move that sent it, or "glow" when a neighbor's watch found another's waste heat. */
  move?: string;
}

/** When each living neighbor's Mind first sees another's cold glow, as our Halo Survey would: a woken Mind looks at
 *  every star near it, as well as ALMA does, a sample. Its glow starts at Earth's 2040 scale and doubles every so many
 *  Years after waking, as knowledge.ts's glows() has it. Seen before Year 0, it is news at Year 0. Settled 2026-10-26. */
const START_W = 1e13, PC_LY = 3.2616;
export function glowsSeen(world: World) {
  const shown = (p: Neighbor) => world.stars[p.star]?.shown ?? p.star;
  const out: { from: string; to: string; at: number; d: number }[] = [];
  for (const b of world.neighbors) {
    if (b.dead || b.elder?.asleep) continue;                 // an elder asleep watches nothing
    for (const a of world.neighbors) {
      if (a === b || a.dead) continue;
      const d = between(world, shown(a), shown(b));
      const need = catalog.halo.floor * (d / (10 * PC_LY)) ** 2;
      if (a.elder && a.elder.ceiling < need) continue;       // nor sheds enough to be seen
      const crosses = d + a.waking + a.doubling * Math.log2(need / START_W);
      out.push({ from: shown(a), to: shown(b), at: Math.max(0, crosses, b.waking), d });
    }
  }
  return out;
}

/** One message reaching one neighbor: when it lands, the news it is, whether they could read it, and their choices. */
export interface Landing {
  key: string;
  signal: Signal;
  /** Ours, when it is ours. */
  sent?: Sent;
  neighbor: Neighbor;
  star: string;
  at: number;
  /** Light-years from the sender. */
  d: number;
  news: News;
  /** Every way at once, past where it can be read: they notice a call and can't read its words. */
  read: boolean;
  /** Before its Mind wakes, a people missed it: kept as such, with no model asked. */
  missed: boolean;
  offers: string[];
  /** One of our craft at a black hole, seen by their craft there: no message, news. 2026-10-26. */
  notice?: Notice;
}

const DAY = 86400;

/** A die: fresh each game, or held by a roll seed when a test replays one. */
export type Die = () => number;
export const dieFor = (roll: string | null, key: string): Die => {
  if (roll === null) return Math.random;
  const r = new PyRandom(`${roll}:${key}`);
  return () => r.random();
};

/** Where a star sits, in light-years from Sol. */
function place(world: World, star: string) {
  if (star === SOL) return [0, 0, 0];
  const s = Object.values(world.stars).find((x) => x.shown === star || x.name === star);
  if (!s || s.ra === undefined || s.dec === undefined) return null;
  const ra = (s.ra * 15 * Math.PI) / 180, dec = (s.dec * Math.PI) / 180;
  return [s.d * Math.cos(dec) * Math.cos(ra), s.d * Math.cos(dec) * Math.sin(ra), s.d * Math.sin(dec)];
}

/** Light-years between two stars, by shown name or Sol. */
export function between(world: World, a: string, b: string) {
  const p = place(world, a), q = place(world, b);
  if (!p || !q) return Infinity;
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/** Before its Mind wakes, a people catches a message only if it heard our radars and was listening: half the time,
 *  a sample. An awake Mind keeps an all-sky watch. A dead world hears nothing. */
function catches(p: Neighbor, at: number, die: Die) {
  const dies = (p as Neighbor & { radio?: { dies?: number | null } }).radio?.dies;
  if (p.dead && (dies == null || at > p.waking - dies)) return false;
  if (p.elder?.asleep) return false;                         // asleep, it hears no message. Only a craft in its system wakes it
  if (at >= p.waking) return true;
  return p.heard && die() < 0.5;
}

/** Two or three moves drawn by the table's odds, without repeats. */
export function offers(name: string, news: News, die: Die, n = 3) {
  const table = TABLES[name]?.[news];
  if (!table?.some(([m]) => !HELD.has(m))) return ["ignore"];
  const left = table.filter(([m]) => !HELD.has(m));
  const out: string[] = [];
  while (out.length < n && left.length) {
    const total = left.reduce((t, [, w]) => t + w, 0);
    let r = die() * total, i = 0;
    while (i < left.length - 1 && (r -= left[i][1]) >= 0) i++;
    out.push(left[i][0]);
    left.splice(i, 1);
  }
  return out;
}

/** Where a neighbor's send goes: a call every way at once, all else back to the sender. */
export const sendsTo = (r: Reaction) => r.to ?? r.from ?? SOL;

/** Everything sent by a neighbor so far, as signals, with the Year each left. */
export function starSignals(world: World, done: Reaction[]) {
  const who = new Map(world.neighbors.map((p) => [world.stars[p.star]?.shown ?? p.star, p]));
  return done.flatMap((r) => {
    if (!r.text || !SPEAKS.has(r.move)) return [];
    const p = who.get(r.star);
    if (!p) return [];
    const signal: Signal = { id: r.key, from: r.star, to: sendsTo(r), text: r.text, size: r.size ?? "page", move: r.move };
    return [{ signal, leaves: r.at + p.thinks }];
  });
}

/** What we did that others feel, by the same physics as theirs: bullets we fired, with the Year each left and lands,
 *  probes we caught, and the Year our radars went quiet. 2026-10-28. */
export interface Acts {
  strikes: { star: string; fired: number; lands: number }[];
  caught: { star: string; at: number }[];
  quiet: number | null;
}
const NO_ACTS: Acts = { strikes: [], caught: [], quiet: null };

/** Every landing by Year `now` that has no reaction yet: ours, and every neighbor's on every other. */
export function landings(world: World, sent: Sent[], done: Reaction[], now: number, roll: string | null = null, ours: Craft[] = [], acts: Acts = NO_ACTS): Landing[] {
  const shown = (p: Neighbor) => world.stars[p.star]?.shown ?? p.star;
  const had = new Set(done.map((r) => r.key));
  const out: Landing[] = [];
  const land = (signal: Signal, p: Neighbor, at: number, d: number, read: boolean, sentOf?: Sent) => {
    const star = shown(p);
    const key = `${signal.id}:${star}`;
    const die = dieFor(roll, key);
    const missed = !catches(p, at, die);
    // Answering one of its own sends is a reply. Aimed, unasked, it is a knock. Every way at once, a broadcast.
    const spoke = signal.from === SOL
      ? p.inbound.some((i) => i.sent < (sentOf?.y ?? at))
      : done.some((r) => r.star === star && sendsTo(r) === signal.from && r.text);
    const news: News = signal.to === "everywhere" ? "broadcast" : spoke ? "reply" : "knock";
    out.push({ key, signal, sent: sentOf, neighbor: p, star, at, d, news, read, missed, offers: missed ? [] : offers(p.name, news, die) });
  };
  for (const s of sent) {
    const signal: Signal = { id: s.id, from: SOL, to: s.to, text: s.travels, size: s.size };
    for (const p of world.neighbors) {
      const star = shown(p);
      if (had.has(`${s.id}:${star}`)) continue;
      let at: number, read = true;
      if (s.to === "everywhere") {
        // Read once out to the dial. Repeated, a neighbor who keeps listening reads it farther: a Year of copies.
        const power = powerFor(s.reach!, SIZES[s.size]);
        if (power > GRID_2040) continue;
        const year = s.repeat && (s.stopped ?? Infinity) >= s.y + 1 ? readReach(power, SIZES[s.size], DAY, 365) : 0;
        if (p.d <= s.reach!) at = s.y + p.d;
        else if (p.d <= year) at = s.y + p.d + 1;
        else if (p.d <= noticeReach(power)) { at = s.y + p.d; read = false; }
        else continue;
      } else {
        if (s.to !== star) continue;
        at = s.y + p.d + dates(s.y, p.d, s.size).sendYears;
      }
      if (at <= now) land(signal, p, at, p.d, read, s);
    }
  }
  for (const { signal, leaves } of starSignals(world, done)) {
    for (const p of world.neighbors) {
      const star = shown(p);
      if (star === signal.from || had.has(`${signal.id}:${star}`)) continue;
      if (signal.to !== "everywhere" && signal.to !== star) continue;
      const d = between(world, signal.from, star);
      if (signal.to === "everywhere" ? d > CALL_REACH : !isFinite(d)) continue;
      const at = leaves + (signal.to === "everywhere" ? 0 : aimedYears(SIZES[signal.size], d)) + d;
      if (at <= now) land(signal, p, at, d, true);
    }
  }
  // Our craft at black holes, seen by a neighbor's craft there, once each, unless ours was lost before. 2026-10-26.
  const lost = new Map(lossesOf(done).map((l) => [l.craft, l.at]));
  for (const n of notices(world, ours, (key) => dieFor(roll, `${key}:found`)() < REFUGE_FOUND)) {
    const star = shown(n.neighbor);
    const key = `${n.craft.id}:${star}`;
    if (n.at > now || had.has(key) || (lost.get(n.craft.id) ?? Infinity) <= n.seen) continue;
    const news: News = n.craft.kind === "sentinel" ? "probe" : "settle";
    const signal: Signal = { id: n.craft.id, from: SOL, to: star, text: "", size: "page" };
    out.push({ key, signal, neighbor: n.neighbor, star, at: n.at, d: n.hop, news, read: true, missed: false, offers: offers(n.neighbor.name, news, dieFor(roll, key)), notice: n });
  }
  // What we did, as news. A bullet strikes its star, and every watcher sees its launch flame one light-time from Sol.
  // A probe we caught goes dark, and its sender learns it one light-time later. Our radars falling quiet reach each
  // listener who heard them. Nothing physical is missed: a strike lands whether anyone listens. 2026-10-28.
  const act = (id: string, move: string, to: string, p: Neighbor, at: number, d: number, news: News, sure: boolean) => {
    const star = shown(p);
    const key = `${id}:${star}`;
    if (at > now || had.has(key)) return;
    const die = dieFor(roll, key);
    const missed = !sure && !catches(p, at, die);
    const signal: Signal = { id, from: SOL, to, text: "", size: "page", move };
    out.push({ key, signal, neighbor: p, star, at, d, news, read: true, missed, offers: missed ? [] : offers(p.name, news, die) });
  };
  // A target that screened the line to Sol in time sees our bullet burst on its screen: still an attack, but no harm.
  const guards = theirScreens(world, done);
  // A launch shows only in its own system: a drive of tens of terawatts is about magnitude 40 at 10 light-years, past
  // any telescope, and plain within a few hundred AU. So a neighbor sees ours only through a probe of its own watching
  // Sol by then, and not caught, which sends word home at light speed. 2026-10-28.
  const watching = probesToUs(world, done);
  for (const s of acts.strikes)
    for (const p of world.neighbors) {
      const blocked = guards.some((g) => g.star === s.star && g.toward === SOL && g.done <= s.lands);
      if (shown(p) === s.star) act(`strike:${s.star}`, blocked ? "screened" : "struck", s.star, p, s.lands, p.d, "struck", true);
      const eyes = watching.some(
        (w) => w.star === shown(p) && w.arrives <= s.fired && !acts.caught.some((c) => c.star === w.star && c.at <= s.fired),
      );
      if (eyes) act(`launch:${s.star}`, "strike_seen", s.star, p, s.fired + p.d, p.d, "strike_seen", true);
    }
  // And theirs at each other, by the same physics: the target struck, or its screen hit. No one else sees it: no
  // neighbor's craft watches another's system. Parity, 2026-10-28.
  const byName = new Map(world.neighbors.map((p) => [shown(p), p]));
  for (const b of strikesBetween(world, done)) {
    const target = byName.get(b.to);
    if (target) {
      const key = `nstrike:${b.from}:${b.fired.toFixed(2)}`;
      if (b.lands <= now && !had.has(`${key}:${b.to}`)) {
        const die = dieFor(roll, `${key}:${b.to}`);
        const signal: Signal = { id: key, from: b.from, to: b.to, text: "", size: "page", move: b.screened ? "screened" : "struck" };
        out.push({ key: `${key}:${b.to}`, signal, neighbor: target, star: b.to, at: b.lands, d: b.d, news: "struck", read: true, missed: false, offers: offers(target.name, "struck", die) });
      }
    }
  }
  for (const c of acts.caught) {
    const p = world.neighbors.find((x) => shown(x) === c.star);
    if (p) act(`caught:${c.star}:${c.at}`, "caught", c.star, p, c.at + p.d, p.d, "struck", true);
  }
  if (acts.quiet !== null)
    for (const p of world.neighbors)
      if (!p.dead && p.heard && (p.heardSince ?? Infinity) <= acts.quiet + p.d) act("quiet", "quiet", shown(p), p, acts.quiet + p.d, p.d, "quiet", false);
  // A glow is news of someone, with no words: a hum, by its tables.
  const who = new Map(world.neighbors.map((p) => [shown(p), p]));
  for (const g of glowsSeen(world)) {
    const p = who.get(g.to)!;
    const signal: Signal = { id: `glow:${g.from}`, from: g.from, to: g.to, text: "", size: "page", move: "glow" };
    if (g.at > now || had.has(`${signal.id}:${g.to}`)) continue;
    const key = `${signal.id}:${g.to}`;
    out.push({ key, signal, neighbor: p, star: g.to, at: g.at, d: g.d, news: "hum", read: false, missed: false, offers: offers(p.name, "hum", dieFor(roll, key)) });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** What the neighbor's choices mean, for the model. */
export const describeMove = (m: string) => MOVES[m] ?? m;
