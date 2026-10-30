// What grows once done, from our order: the Cold Halo doubles every 10 Years, and since 2026-10-29 the Solar Swarm
// every 2. Each time we take one back it stops, until we order it again. What neighbors could see of them is
// lib/sim/answers.ts's glowsSeen(). 2026-10-28.
import { pace } from "@/lib/sim/works";
import { HORIZON, ordersOf, pacedName } from "./plan";
import type { Plan } from "./types";

/** The builds that grow once done. */
export const GROWS = ["Cold Halo", "Solar Swarm", "Helium-3 Harvest"];

/** The Year a build that grows was done, held or not. Our order's schedule leaves out a build taken back, and holding
 *  one is taking it back, so this reads the pace itself. */
export function grownDone(plan: Plan, scale: number, name: string): number | null {
  const { orders, ...opts } = ordersOf(plan);
  return pace(orders, HORIZON, { scale, ...opts }).done[pacedName(name)] ?? null;
}

/** The Years it grew, as spans from one Year to another, the last open while it still grows. Empty until done. */
export function grownSpans(plan: Plan, scale: number, name: string, at = grownDone(plan, scale, name)): [number, number | null][] {
  if (at == null) return [];
  const toggles = [
    ...(plan.stops ?? []).filter((o) => o.name === name).map((o) => ({ y: o.y, on: false })),
    ...(plan.later ?? []).filter((o) => o.name === name).map((o) => ({ y: o.y, on: true })),
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

export const haloDone = (plan: Plan, scale: number) => grownDone(plan, scale, "Cold Halo");
export const haloSpans = (plan: Plan, scale: number, at = haloDone(plan, scale)) => grownSpans(plan, scale, "Cold Halo", at);
