// A neighbor's move on news, rolled from its table as the calcs and the mocks roll it. Tables are data, written by
// calcs/export_worlds.py from calcs/reactions.py. The key is the seed, the neighbor and the news, so a roll holds.
import tables from "../../data/reactions.json" with { type: "json" };
import { PyRandom } from "./pyrandom.ts";

export type News = "hum" | "knock" | "broadcast" | "reply" | "silence" | "quiet" | "probe" | "settle" | "struck" | "strike_seen";
export const TABLES = tables.tables as unknown as Record<string, Record<string, [string, number][]>>;
export const MOVES = tables.moves as Record<string, string>;
/** The base odds for each kind of Mind, and how far each dial tilts a move, per unit of lean. For our colony, whose
 *  table is built from our charter in play. 2026-10-28. */
export const KINDS = tables.kinds as unknown as Record<string, Record<string, Record<string, number>>>;
export const DIAL = tables.dial as unknown as Record<string, Record<string, number>>;

/** The move a neighbor makes on this news, in this game. Null for the dead, who have no table. */
export function roll(seed: number, name: string, news: News): string | null {
  const t = TABLES[name]?.[news];
  if (!t) return null;
  return new PyRandom(`${seed}:${name}:${news}`).choice(t.map(([m]) => m), t.map(([, w]) => w));
}

/** Light-time: a signal sent at Year t from d light-years arrives at Year t + d. */
export const arrives = (sent: number, d: number) => sent + d;
