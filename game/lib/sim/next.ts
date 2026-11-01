// The next Year something new reaches us, for skipping ahead, settled 2026-10-28: the clock keeps 5 real minutes a
// Year, and a skip jumps to the next arrival, build or signal, always stopping when something new happens. Pure.
import type { EarthView } from "./types.ts";

/** Times in what Earth knows that mark something arriving or being found, by their keys. */
// "near": a sentinel's word on a cold glow, up close, 2026-10-31. The watcher's answer comes under "at".
// "warned" and "known": the watcher's warning and a seed gone silent, playtest 2026-11-01.
const WHEN = new Set(["arrived", "found", "home", "seen", "ranged", "faded", "lands", "stands", "at", "near", "warned", "known"]);

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
      // A seed gone silent shows once its silence is known, not at the Year it was lost. 2026-11-01.
      for (const [k, v] of Object.entries(x)) if (!(k === "seen" && "ranged" in x) && !(k === "at" && "known" in x)) walk(v, k);
    }
  };
  // Only the first cold glow stops the skip. The Halo Survey finds one every few Years, and each stopping it took about
  // 460 presses to reach Year 20,000. The rest gather on Scan as one row. Word from our craft up close still stops it.
  // Playtest 2026-11-01.
  const glows = ahead.minds?.glows ?? [];
  walk({ ...ahead, minds: ahead.minds && { ...ahead.minds, glows: glows.map((g, i) => (i === 0 ? g : { near: g.near })) } });
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
