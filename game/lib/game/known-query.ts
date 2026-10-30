// What the server needs from the save to say what Earth knows, or what comes next: Scan's /api/known and the skip's
// /api/next ask with the same. 2026-10-29.
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
    pickets: JSON.stringify(plan?.pickets ?? []),
    strikes: JSON.stringify(plan?.strikes ?? []),
    seeds: JSON.stringify(plan?.seeds ?? []),
    colony: JSON.stringify(plan?.colony ?? null),
    will: JSON.stringify(save?.will ?? null),
    stops: JSON.stringify(plan?.stops ?? []),
    observe: JSON.stringify(plan?.observe ?? []),
  }).toString();
}
