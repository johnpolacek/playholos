// What the server needs from the save to say what Earth knows, or what comes next: Scan's /api/known and the skip's
// /api/next ask with the same. 2026-10-29.
import { target, WATCHER } from "./sends";
import type { Save, Sent } from "./types";

export function knownQuery(save: Save | undefined, year: number | null) {
  const plan = save?.plan;
  return new URLSearchParams({
    year: String(year ?? 0),
    builds: JSON.stringify(plan?.builds ?? []),
    later: JSON.stringify(plan?.later ?? []),
    gifts: JSON.stringify(plan?.gifts ?? []),
    lenses: JSON.stringify(plan?.lenses ?? []),
    closeReads: JSON.stringify(plan?.closeReads ?? []),
    sentinels: JSON.stringify(plan?.sentinels ?? []),
    strikes: JSON.stringify(plan?.strikes ?? []),
    flybys: JSON.stringify(plan?.flybys ?? []),
    seeds: JSON.stringify(plan?.seeds ?? []),
    colony: JSON.stringify(plan?.colony ?? null),
    will: JSON.stringify(save?.will ?? null),
    stops: JSON.stringify(plan?.stops ?? []),
    observe: JSON.stringify(plan?.observe ?? []),
    // Our knocks on the watcher, for its maker's answer. 2026-10-31.
    knocks: JSON.stringify((save?.sent ?? []).filter((m) => target(m.to) === WATCHER).map((m) => m.y)),
    // Our messages aimed at peers' warm glows, for their answers. 2026-10-31.
    aimed: JSON.stringify(aimedOf(save?.sent ?? [])),
  }).toString();
}

/** Our messages aimed at a peer's warm glow, as the server reads them: to, the Year sent, whether it asked anything or
 *  carried a falsehood, and what it said. 2026-10-31. */
export function aimedOf(sent: readonly Sent[]) {
  return sent
    .filter((m) => /^Warm glow \d+$/.test(m.to))
    .map((m) => ({ to: m.to, y: m.y, questions: m.holds.includes("questions"), lie: !!m.lie, travels: m.travels.slice(0, 600) }));
}
