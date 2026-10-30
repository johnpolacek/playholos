// Our craft at black holes, and the neighbors there who notice them. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's
// Neighbors at black holes: whoever is at a hole second is seen by whoever is there first, and the one who sees it
// tells its Mind, a light-time away unless that Mind stands at the hole. What the Mind does is a move on its table:
// our sentinel is "probe" news, our Mind come to stay is "settle". A catch or a strike ends our craft there. Server
// only: it reads the seed's truth. Pure, so it tests fast. Our Mind settled at a star, 2026-10-27: the people at home
// there see it brake in under their sky, and so does a neighbor's colony there, first or later.
import catalog from "../../data/works.json" with { type: "json" };
import { darkMasses } from "./knowledge.ts";
import type { ColonyMode, Neighbor, World } from "./types.ts";

/** One craft of ours at a black hole: a sentinel, or our Mind sent on the Seed Ship, which can settle at a star too. */
export interface Craft {
  /** Its kind and the hole's or star's id, as a reaction's key keeps it. */
  id: string;
  kind: "sentinel" | "colony";
  mode?: ColonyMode;
  /** At a star, not a hole. */
  atStar?: boolean;
  /** The hole's or star's name as we gave it, its id, and how far it is from Earth. */
  hole: string;
  holeId: string;
  d: number;
  /** The Year it brakes there. A colony stands alone as a Mind some Years later. */
  arrives: number;
  stands?: number;
}

/** A neighbor seeing one of our craft at a hole: the Year it sees it there, and where its Mind decides. */
export interface Notice {
  craft: Craft;
  neighbor: Neighbor;
  /** Who was there first: us, or them. */
  first: "us" | "them";
  seen: number;
  /** Their Mind stands at the hole, so it decides there, with no light-time to wait. */
  local: boolean;
  /** Light-years from the hole to where it decides. */
  hop: number;
  /** The Year the news reaches the Mind that decides. */
  at: number;
}

/** How our craft at a hole ends, from a neighbor's move. */
export interface Loss {
  craft: string;
  at: number;
  how: "catch" | "strike";
}

/** A refuge, dark in the hole's shadow, is found by a craft that comes later half the time. A sample. Anything that
 *  brakes in while another watches is seen: a fusion flame is bright. */
export const REFUGE_FOUND = 0.5;
/** Helium-3 for a bullet, and where it comes from: 61 t of fusion fuel a tonne, 60% of it helium-3, so 36.6 kt for
 *  1,000 t. A harvest in an ice giant's air gathers about 1.5 kt a Year once built, Palaszewski's craft at about
 *  150 kt, the project audit's. Built in 20 Years, a sample. Its craft copy themselves from the moons' rock and ice,
 *  doubling every 5 Years, Metzger's pace with help from home, slower than Mercury's 2 since sunlight there is a
 *  370th of ours: so its rate doubles too, until held. Every star's bullets wait on it. 2026-10-29. */
export const HE3 = { bullet: 36.6, perYear: 1.5, build: 20, doubling: 5 };

/** Helium-3 gathered by Year t, kt, from a harvest growing over these spans of Years, the first from the Year it was
 *  done. Held, it gathers at its size. */
export function he3By(spans: readonly [number, number | null][], t: number) {
  if (!spans.length || t <= spans[0][0]) return 0;
  // Years grown by a moment, and the moments its rate changes: each doubling, and each hold or release.
  const grown = (at: number) => spans.reduce((y, [a, b]) => y + Math.max(0, Math.min(b ?? at, at) - a), 0);
  const edges = new Set<number>([spans[0][0], t]);
  for (const [a, b] of spans) {
    edges.add(a);
    if (b !== null) edges.add(b);
    for (let k = HE3.doubling; ; k += HE3.doubling) {
      const at = a + k - grown(a);
      if (at >= Math.min(b ?? t, t)) break;
      if (at > a) edges.add(at);
    }
  }
  const cut = [...edges].filter((x) => x <= t).sort((x, y) => x - y);
  let kt = 0;
  for (let i = 1; i < cut.length; i++) {
    const mid = (cut[i - 1] + cut[i]) / 2;
    kt += HE3.perYear * 2 ** Math.floor(grown(mid) / HE3.doubling + 1e-9) * (cut[i] - cut[i - 1]);
  }
  return kt;
}

/** The Year a harvest growing over these spans has gathered `kt`, or null if never within 2,000 Years. */
export function he3When(spans: readonly [number, number | null][], kt: number) {
  if (!spans.length) return null;
  let [lo, hi] = [spans[0][0], spans[0][0] + 2000];
  if (he3By(spans, hi) < kt) return null;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (he3By(spans, mid) >= kt) hi = mid;
    else lo = mid;
  }
  return hi;
}

/** A strike: a bullet built and fired once its weapons are ready, at a tenth of light speed, the audit's heavy
 *  impactor. The bullet itself takes 20 Years, a sample, as long as a sentinel's. A neighbor that chooses to strike
 *  starts its harvest then, with none in store, a sample: 20 Years to build it and about 12.4 for its growing harvest
 *  to fill one bullet, so it fires about 32.4 Years on. 2026-10-29. */
export const STRIKE_BUILD = 20;
export const STRIKE_READY = Math.max(STRIKE_BUILD, HE3.build + he3When([[0, null]], HE3.bullet)!), STRIKE_V = 0.1;

/** Our craft at holes, from what the kit sends where: the sentinels sent to a hole we found, and our Mind. */
export function crafts(
  world: World,
  kit: { sentinels?: { star: string; leaves: number }[]; colony?: { star: string; mode: ColonyMode; leaves: number } | null; mapper?: number | null },
): Craft[] {
  const holes = darkMasses(world, Infinity, kit.mapper ?? null);
  const out: Craft[] = [];
  for (const x of kit.sentinels ?? []) {
    const h = holes.find((y) => y.name === x.star);
    if (!h) continue;
    const { speed, burns } = catalog.sentinel;
    out.push({ id: `sentinel:${h.id}`, kind: "sentinel", hole: h.name, holeId: h.id, d: h.d, arrives: x.leaves + h.d / speed + burns });
  }
  const c = kit.colony, h = c && holes.find((y) => y.name === c.star);
  const { speed, burn, brake, stands } = catalog.seedShip;
  if (c && h) {
    const lands = c.leaves + h.d / speed + burn + brake;
    out.push({ id: `colony:${h.id}`, kind: "colony", mode: c.mode, hole: h.name, holeId: h.id, d: h.d, arrives: lands, stands: lands + stands });
  }
  const at = c && !h ? Object.keys(world.stars).find((k) => world.stars[k].shown === c.star) : undefined;
  if (c && at) {
    const d = world.stars[at].d, lands = c.leaves + d / speed + burn + brake;
    out.push({ id: `colony:${at}`, kind: "colony", mode: c.mode, atStar: true, hole: c.star, holeId: at, d, arrives: lands, stands: lands + stands });
  }
  return out;
}

/** Each neighbor at a hole who sees a craft of ours there, once. `found` rolls whether a later craft finds a refuge. */
export function notices(world: World, ours: Craft[], found: (key: string) => boolean): Notice[] {
  const out: Notice[] = [];
  for (const craft of ours) {
    if (craft.atStar) {
      out.push(...atStar(world, craft));
      continue;
    }
    const truth = world.holes?.find((h) => h.id === craft.holeId);
    const by = new Map<string, NonNullable<typeof truth>["claims"]>();
    for (const c of truth?.claims ?? []) by.set(c.who, [...(by.get(c.who) ?? []), c]);
    for (const [who, claims] of by) {
      const neighbor = world.neighbors.find((p) => p.name === who);
      if (!neighbor || !claims?.length) continue;
      const theirs = Math.min(...claims.map((c) => c.arrives));
      const first = theirs <= craft.arrives ? "them" : "us";
      // Ours already there and dark, when theirs comes later: a refuge is found only sometimes.
      if (first === "us" && craft.mode === "refuge" && theirs > craft.stands! && !found(`${craft.id}:${who}`)) continue;
      const seen = Math.max(theirs, craft.arrives);
      const local = claims.some((c) => c.kind === "colony" && c.stands !== undefined && c.stands <= seen);
      const hop = local ? 0 : (claims[0] as { hop?: number }).hop ?? 0;
      out.push({ craft, neighbor, first, seen, local, hop, at: seen + hop });
    }
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Who sees our Mind at a star: the people living there, at home, as it brakes in, their Mind deciding there once
 *  woken; and each neighbor's colony there, whichever came first, deciding there once it stands, or else at the star it
 *  came from. A settled Mind is never hidden. Ruins see nothing. */
function atStar(world: World, craft: Craft): Notice[] {
  const out: Notice[] = [];
  const home = world.neighbors.find((p) => p.star === craft.holeId && !p.dead);
  if (home) out.push({ craft, neighbor: home, first: "them", seen: craft.arrives, local: true, hop: 0, at: craft.arrives });
  for (const c of world.colonies.filter((x) => x.star === craft.holeId)) {
    const neighbor = world.neighbors.find((p) => p.name === c.root);
    if (!neighbor || neighbor === home || out.some((n) => n.neighbor === neighbor)) continue;
    const first = c.lands <= craft.arrives ? "them" : "us";
    const seen = Math.max(c.lands, craft.arrives);
    const local = c.stands <= seen;
    const hop = local ? 0 : ((c as { hop?: number }).hop ?? 0);
    out.push({ craft, neighbor, first, seen, local, hop, at: seen + hop });
  }
  return out;
}

/** When a move on a notice ends our craft: a catch by their craft there, ordered from where their Mind decides, or a
 *  strike, fired once its weapons are ready, from there. Null for every other move. */
export function ends(n: Notice, move: string): number | null {
  const go = n.at + n.neighbor.thinks;
  if (move === "catch") return go + n.hop;
  if (move === "strike") return go + STRIKE_READY + n.hop / STRIKE_V;
  return null;
}

/** Our craft lost, by the reactions kept in the save: the soonest end of each. */
export function lossesOf(reactions: { sent: string; move: string; ends?: number }[]): Loss[] {
  const out = new Map<string, Loss>();
  for (const r of reactions) {
    if (r.ends === undefined || (r.move !== "catch" && r.move !== "strike")) continue;
    const was = out.get(r.sent);
    if (!was || r.ends < was.at) out.set(r.sent, { craft: r.sent, at: r.ends, how: r.move });
  }
  return [...out.values()];
}
