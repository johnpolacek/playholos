// What an old mind does when a bullet of ours lands in its system. Settled 2026-11-12, the designer's picks: a weapon
// proves utterly useless against an old mind, and its answer is graded by its nature. The bullet harms nothing
// (lib/sim/strikes.ts), but it is an attack, and its path points home. So the mind answers by its score, hostile to
// peaceful, the one that already says whether it wrecks a craft of ours that comes to stay:
//   1, about 1 awake mind in 63: it ends Earth as our home, with a strike of Chicxulub's class.
//   2, about 1 in 50: it strikes Earth in kind, one rod with a bullet's harm.
//   3, about 1 in 24: it disarms us, wrecking the yard and the beam that threw the rod. Not built yet: until it is,
//      a mind of this score does nothing, and nothing in the game says it did.
//   4 and up, 12 in 13: nothing. We are too small to matter.
// The shares are what the scores of calcs/minds.py give over the pool's 33 games: samples, since nothing measures
// what a mind wants. The mind that made our watcher is never hostile. A sleeping mind decides nothing: asleep it is
// folded a km or so across, and a screen of grams far out spreads a rod's wreck wider than that long before it lands.
// Its answer leaves once it has readied what it throws, as we ready a rod, and flies as what a mind throws does:
// lib/sim/speeds.ts. Earth learns of it only as it lands. Pure, so it tests fast.
import { bulletMt } from "./conflict.ts";
import { theirReady, theirYears } from "./speeds.ts";
import { END_MT } from "./strikes.ts";
import type { OldMind } from "./types.ts";

export type Reprisal = "end" | "kind" | "disarm" | "none";
/** Its answer by its score, hostile to peaceful. Any score above these: none. */
/** Disarming us, at 3, waits on its build: a wrecked yard and beam must stop our craft, not only be said to. */
export const REPRISAL: Record<number, Exclude<Reprisal, "none">> = { 1: "end", 2: "kind" };

/** What an old mind does once a bullet of ours has landed in its system. */
export function reprisalOf(m: OldMind, maker?: string): Reprisal {
  if (m.id === maker || m.asleep) return "none";
  return REPRISAL[m.peaceful] ?? "none";
}
/** The Year its answer lands on Earth, or on our works: it readies what it throws, then that flies. */
export const reprisalLands = (m: OldMind, landed: number) => landed + theirReady(m.d) + theirYears(m.d);
/** How hard it lands on Earth, in megatons. Disarming us, it throws grams at our works, and none at Earth. */
export const reprisalMt = (r: Reprisal) => (r === "end" ? END_MT : r === "kind" ? bulletMt() : 0);
