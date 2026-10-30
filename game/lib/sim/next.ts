// The next Year something new reaches us, for skipping ahead, settled 2026-10-28: the clock keeps 5 real minutes a
// Year, and a skip jumps to the next arrival, build or signal, always stopping when something new happens. Pure.
import type { EarthView } from "./types.ts";

/** Times in what Earth knows that mark something arriving or being found, by their keys. */
const WHEN = new Set(["arrived", "found", "home", "seen", "ranged", "faded", "lands", "stands", "at"]);

/** The earliest Year after `year` that anything in `ahead`, what Earth will know by some later Year, became known. */
export function nextKnown(ahead: EarthView, year: number): number | null {
  let best: number | null = null;
  const walk = (x: unknown, key = "") => {
    if (typeof x === "number") {
      if (WHEN.has(key) && x > year + 1e-6 && (best === null || x < best)) best = x;
    } else if (Array.isArray(x)) {
      // A list of numbers is a place, as [ra, dec, d], not a time.
      if (!x.every((v) => typeof v === "number")) for (const v of x) walk(v, key);
    } else if (x && typeof x === "object") {
      // A warm glow shows on Scan once ranged, not when first seen: a stop then found nothing new there. Playtest
      // 2026-10-30.
      for (const [k, v] of Object.entries(x)) if (!(k === "seen" && "ranged" in x)) walk(v, k);
    }
  };
  walk(ahead);
  return best;
}

/** The next Year to stop at: the soonest of what Earth will learn, the builds we finish, and any other Year something
 *  happens, such as a rock found, pushed aside or striking. */
export function nextStop(ahead: EarthView, year: number, done: Record<string, number | null>, also: readonly (number | null)[] = []): number | null {
  const later = (t: number | null): t is number => t !== null && t > year + 1e-6;
  const times = [nextKnown(ahead, year), ...Object.values(done).filter(later), ...also.filter(later)];
  const real = times.filter((t): t is number => t !== null);
  return real.length ? Math.min(...real) : null;
}
