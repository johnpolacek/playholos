// Our colony as a second Mind, 2026-10-28. Word from Earth takes a Year for each light-year to reach it, so once it
// stands alone it decides for itself: its stand-in Will makes the moves a neighbor makes, as our charter would choose
// them, and reads our orders by their intent. It is not a rival. Parity: neighbors' colonies keep their parent's dials,
// and ours keeps our charter's. It hears what lands at its star, not Earth's own sends, and reports each move home,
// which reaches us a light-time later. Pure, so it tests fast.
import type { Craft } from "./meetings.ts";
import { DIAL, KINDS } from "./reactions.ts";
import type { Neighbor, World } from "./types.ts";

/** Our charter's dials, 0 to 100 from Open, Expand and Cautious to Hidden, Deepen and Bold, as dial codes: a lean past
 *  the middle is 1, and 20 or more from it is 2, as lib/game/charter.ts reads a lean. */
export function ourCodes(dials: readonly number[]) {
  const ends = [["O", "H"], ["E", "D"], ["C", "B"]];
  return dials
    .slice(0, 3)
    .flatMap((v, i) => (v >= 44 && v <= 56 ? [] : [`${ends[i][v < 44 ? 0 : 1]}${Math.abs(v - 50) >= 20 ? 2 : 1}`]))
    .join(" ");
}

/** The kind of Mind our charter makes: a contacter if it leans Open, inward if it leans Deepen, else a watcher. Never a
 *  hunter: a first strike is the Will's to order, not its stand-in's. A design choice. */
export function ourKind(codes: string) {
  return codes.includes("O") ? "contacter" : codes.includes("D") ? "inward" : "watcher";
}

const NAMES: Record<string, string> = { O: "Open", H: "Hidden", E: "Expand", D: "Deepen", B: "Bold", C: "Cautious" };

/** Our colony's moves on each news, by its kind's odds tilted by our dials, as calcs/reactions.py's table() tilts a
 *  neighbor's. */
export function ourTable(codes: string): Record<string, [string, number][]> {
  const out: Record<string, [string, number][]> = {};
  for (const [news, base] of Object.entries(KINDS[ourKind(codes)])) {
    const w = { ...base };
    for (const c of codes.split(" ").filter(Boolean))
      for (const [move, m] of Object.entries(DIAL[NAMES[c[0]]] ?? {})) if (move in w) w[move] *= m ** Number(c[1]);
    const total = Object.values(w).reduce((a, b) => a + b, 0);
    out[news] = Object.entries(w)
      .map(([m, v]): [string, number] => [m, v / total])
      .sort((a, b) => b[1] - a[1]);
  }
  return out;
}

/** Years our colony takes to act on news, from its Cautious or Bold dial, as a neighbor's. Half a Year with no lean. */
export function ourThinks(codes: string) {
  const t: Record<string, number> = { B2: 0.1, B1: 0.25, C1: 1, C2: 2 };
  return codes.split(" ").map((c) => t[c]).find((x) => x !== undefined) ?? 0.5;
}

/** Our colony as one more actor among the neighbors, once it stands alone as a Mind. Null before, at a hole whose place
 *  we can't put in the sky, or while the Will lives there and decides for it. */
export function colonyActor(world: World, craft: Craft | undefined, dials: readonly number[] | null, will: string | null): Neighbor | null {
  if (!craft || craft.kind !== "colony" || craft.stands === undefined || will === craft.hole) return null;
  return actor(craft.holeId, craft.hole, craft.d, craft.stands, dials);
}

/** Earth's Mind once the Will has crossed elsewhere: a stand-in runs it by our orders and charter, as the colony's
 *  does, from the Year the Will left. It hears what lands at Sol, and reports to the Will a light-time away. Null while
 *  the Will lives on Earth, or once Earth's Mind is lost. 2026-10-28. */
export function earthActor(dials: readonly number[] | null, will: { d: number; y: number; lost?: boolean } | null): Neighbor | null {
  if (!will || will.lost) return null;
  return actor("Sol", "Earth", will.d, will.y, dials);
}

function actor(star: string, where: string, d: number, waking: number, dials: readonly number[] | null): Neighbor {
  const codes = ourCodes(dials ?? [50, 50, 50]);
  return {
    name: "us",
    star,
    d,
    dead: false,
    waking,
    disposition: ourKind(codes),
    doubling: 10,
    dials: codes,
    thinks: ourThinks(codes),
    heard: false,
    heardSince: null,
    world: { mass: 0, a: 0, pole: 0, tug: 0 },
    foundBy2040: false,
    swept: false,
    inbound: [],
    afterSilence: null,
    probes: [],
    ours: { where, table: ourTable(codes) },
  };
}
