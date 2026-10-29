// Our Cold Halo's growth, from our order: from the Year it is done it doubles every 10 Years, and each time we take
// it back it stops, until we order it again. What neighbors could see of it is lib/sim/answers.ts's glowsSeen().
// 2026-10-28.
import { pace } from "@/lib/sim/works";
import { HORIZON, ordersOf } from "./plan";
import type { Plan } from "./types";

/** The Year the halo was done, held or not. Our order's schedule leaves out a build taken back, and holding the halo is
 *  taking it back, so this reads the pace itself. */
export function haloDone(plan: Plan, scale: number): number | null {
  const { orders, ...opts } = ordersOf(plan);
  return pace(orders, HORIZON, { scale, ...opts }).done["Cold halo"] ?? null;
}

/** The Years it grew, as spans from one Year to another, the last open while it still grows. Empty until done. */
export function haloSpans(plan: Plan, scale: number, at = haloDone(plan, scale)): [number, number | null][] {
  if (at == null) return [];
  const toggles = [
    ...(plan.stops ?? []).filter((o) => o.name === "Cold Halo").map((o) => ({ y: o.y, on: false })),
    ...(plan.later ?? []).filter((o) => o.name === "Cold Halo").map((o) => ({ y: o.y, on: true })),
  ].sort((a, b) => a.y - b.y);
  const spans: [number, number | null][] = [];
  let since: number | null = at;
  for (const t of toggles) {
    if (t.y <= at) continue;
    if (!t.on && since !== null) { spans.push([since, t.y]); since = null; }
    else if (t.on && since === null) since = t.y;
  }
  if (since !== null) spans.push([since, null]);
  return spans;
}
