// What the server needs from the save to say what Earth knows, or what comes next: Scan's /api/known and the skip's
// /api/next ask with the same. 2026-10-29.
import { target, WATCHER } from "./sends";
import { SIZES } from "../sim/messages";
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
    flybys: JSON.stringify(plan?.flybys ?? []),
    seeds: JSON.stringify(plan?.seeds ?? []),
    colony: JSON.stringify(plan?.colony ?? null),
    will: JSON.stringify(save?.will ?? null),
    stops: JSON.stringify(plan?.stops ?? []),
    switches: JSON.stringify(plan?.switches ?? []),
    observe: JSON.stringify(plan?.observe ?? []),
    // Our knocks on the watcher, for its maker's answer. 2026-10-31.
    knocks: JSON.stringify((save?.sent ?? []).filter((m) => target(m.to) === WATCHER).map((m) => m.y)),
    // Our messages aimed at peers' warm glows, for their answers. 2026-10-31.
    aimed: JSON.stringify(aimedOf(save?.sent ?? [])),
    // Our calls through the Galaxy Broadcast Array, for the answers of minds we never found. 2026-11-11.
    calls: JSON.stringify(callsOf(save?.sent ?? [])),
  }).toString();
}

/** Our messages aimed at a peer's warm glow, as the server reads them: to, the Year sent, whether it asked anything or
 *  carried a falsehood, and what it said. 2026-10-31. */
/** Our calls through the Galaxy Broadcast Array, as the server reads them: the Year the first pass left, the Year of
 *  the last, or null while it repeats, its size in bits, and what it said. 2026-11-11. */
export function callsOf(sent: readonly Sent[]) {
  return sent
    .filter((m) => m.to === "everywhere" && m.galaxy)
    .map((m) => ({ y: m.y, until: m.repeat ? (m.stopped ?? null) : m.y, bits: SIZES[m.size], questions: m.holds.includes("questions"), lie: !!m.lie, travels: m.travels.slice(0, 600) }));
}

export function aimedOf(sent: readonly Sent[]) {
  return sent
    // And at an old mind: its cold glow, or a sleeping one's warm body where our craft stands by. 2026-11-11.
    .filter((m) => /^(Warm glow|Cold glow|Warm body) \d+$/.test(m.to))
    .map((m) => ({ to: m.to, y: m.y, questions: m.holds.includes("questions"), lie: !!m.lie, travels: m.travels.slice(0, 600) }));
}
