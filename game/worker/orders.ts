import { BUILDS, LATER } from "@/lib/game/plan";
import type { Ordered } from "@/lib/game/types";

// Our order, as the browser sends it from the save, checked against what Earth can build before the server paces it.

// What the plan observes, from the save. Checked, since it comes from the browser.
export function readObserve(o: unknown) {
  return Array.isArray(o) ? o.filter((x): x is string => typeof x === "string").slice(0, 8) : [];
}

// What we have queued, in order, from the save. Checked against what Earth can build, since it comes from the browser.
export function readQueue(b: unknown) {
  const names = new Set(BUILDS.map((build) => build.name));
  return Array.isArray(b) ? b.filter((x): x is string => typeof x === "string" && names.has(x)) : [];
}

// What we have ordered in play, once our builds opened it, from the save. Checked the same way.
export function readLater(l: unknown): Ordered[] {
  const names = new Set(LATER.map((build) => build.name));
  return Array.isArray(l)
    ? l
        .filter((o): o is Ordered => !!o && names.has(o.name) && typeof o.y === "number" && Number.isFinite(o.y) && o.y >= 0)
        .slice(0, 16)
    : [];
}
