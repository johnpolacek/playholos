// What the server needs from the save to say what Earth knows, or what comes next: Scan's /api/known and the skip's
// /api/next ask with the same. 2026-10-29.
import { target, WATCHER } from "./sends";
import type { Save } from "./types";

export function knownQuery(save: Save | undefined, year: number | null) {
  const plan = save?.plan;
  return new URLSearchParams({
    year: String(year ?? 0),
    builds: JSON.stringify(plan?.builds ?? []),
    later: JSON.stringify(plan?.later ?? []),
    gifts: JSON.stringify(plan?.gifts ?? []),
    lenses: JSON.stringify(plan?.lenses ?? []),
    sentinels: JSON.stringify(plan?.sentinels ?? []),
    strikes: JSON.stringify(plan?.strikes ?? []),
    seeds: JSON.stringify(plan?.seeds ?? []),
    colony: JSON.stringify(plan?.colony ?? null),
    will: JSON.stringify(save?.will ?? null),
    stops: JSON.stringify(plan?.stops ?? []),
    observe: JSON.stringify(plan?.observe ?? []),
    // Our knocks on the watcher, for its maker's answer. 2026-10-31.
    knocks: JSON.stringify((save?.sent ?? []).filter((m) => target(m.to) === WATCHER).map((m) => m.y)),
  }).toString();
}
