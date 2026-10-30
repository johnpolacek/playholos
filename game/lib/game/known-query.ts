// What the server needs from the save to say what Earth knows, or what comes next: Scan's /api/known and the skip's
// /api/next ask with the same. 2026-10-29.
import { lossesOf } from "@/lib/sim/meetings";
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
    // Our craft at holes a neighbor caught or struck, and neighbors that chose to hide, by moves kept in the save.
    losses: JSON.stringify(lossesOf(save?.reactions ?? [])),
    hides: JSON.stringify((save?.reactions ?? []).filter((r) => r.move === "hide").map((r) => ({ star: r.star, at: r.at }))),
    will: JSON.stringify(save?.will ?? null),
    stops: JSON.stringify(plan?.stops ?? []),
    observe: JSON.stringify(plan?.observe ?? []),
  }).toString();
}
