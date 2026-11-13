// The next Year something new reaches us, for skipping ahead, settled 2026-10-28: the clock keeps 5 real minutes a
// Year, and a skip jumps to the next arrival, build or signal, always stopping when something new happens. Pure.
import type { EarthView } from "./types.ts";

/** Times in what Earth knows that mark something arriving or being found, by their keys. */
// "near": a sentinel's word on a cold glow, up close, 2026-10-31. The watcher's answer comes under "at".
// "warned" and "known": the watcher's warning and a seed gone silent, playtest 2026-11-01.
// "imaged": our Glow Imager's look at a cold glow, from home, 2026-11-11.
const WHEN = new Set(["arrived", "found", "home", "seen", "ranged", "faded", "lands", "stands", "at", "near", "imaged", "lost", "answered", "warned", "known"]);

/** Years at least between two warm glows that stop the skip. */
export const GLOW_GAP = 1000;

/** The earliest Year after `year` that anything in `ahead`, what Earth will know by some later Year, became known. */
export function nextKnown(ahead: EarthView, year: number): number | null {
  return nextKnownWhy(ahead, year)?.at ?? null;
}

/** The kind of thing that comes next, said without spoiling the sky: word from our own craft, or a finding. The Jump
 *  button names it, 2026-11-01: a jump to a bare Year read as unexplained. A signal, a reading and the sky's own news
 *  are one word, our next finding, and the Year goes unsaid, 2026-11-04: "something new in the sky" read as cryptic. */
export type Why = string;
// A lens's or the Hypertelescope's pictures come from home, not a craft: "Jump to word from our craft" landed on the
// Hypertelescope's first pictures, and no craft had spoken. Playtest 2026-11-07.
export function whyOf(path: readonly string[], owner?: unknown): Why {
  const [top] = path;
  const key = path.at(-1);
  const by = (owner as { by?: string } | undefined)?.by;
  if (top === "visits" && (by === "lens" || by === "hyper")) return "our next finding";
  if (top === "visits" || top === "colony" || key === "near" || key === "home" || (top === "minds" && path.includes("seedsLost"))) return "word from our craft";
  return "our next finding";
}

/** The earliest Year after `year` that anything in `ahead` became known, and what kind of thing it is. */
export function nextKnownWhy(ahead: EarthView, year: number): { at: number; why: Why } | null {
  let best: number | null = null;
  let where: string[] = [];
  let whose: unknown;
  const walk = (x: unknown, key = "", path: string[] = [], owner?: unknown) => {
    if (typeof x === "number") {
      if (WHEN.has(key) && x > year + 1e-6 && (best === null || x < best)) {
        best = x;
        where = path;
        whose = owner;
      }
    } else if (Array.isArray(x)) {
      // A list of numbers is a place, as [ra, dec, d], not a time.
      if (!x.every((v) => typeof v === "number")) for (const v of x) walk(v, key, path);
    } else if (x && typeof x === "object") {
      // A warm glow shows on Scan once ranged, not when first seen: a stop then found nothing new there. Playtest
      // 2026-10-30.
      // A seed gone silent shows once its silence is known, not at the Year it was lost. 2026-11-01.
      for (const [k, v] of Object.entries(x))
        if (!(k === "seen" && "ranged" in x) && !(k === "at" && "known" in x))
          walk(v, k, [...path, k], x);
    }
  };
  // Only the first cold glow stops the skip. The Halo Survey finds one every few Years, and each stopping it took about
  // 460 presses to reach Year 20,000. The rest gather on Scan as one row. Word from our craft up close still stops it.
  // Playtest 2026-11-01.
  const glows = ahead.minds?.glows ?? [];
  // A warm glow stops the skip once it is ranged, at most once in GLOW_GAP Years, and its fade never does. The Warm
  // Sky Watch finds hundreds: 464 by Year 34,944, and each stopping it twice took about 1,000 presses. The rest gather
  // on Scan. Playtest 2026-11-01.
  let last = -Infinity;
  const flashes = [...(ahead.minds?.flashes ?? [])]
    .map((f) => f.ranged ?? f.seen)
    .sort((a, b) => a - b)
    .filter((t) => (t - last >= GLOW_GAP ? ((last = t), true) : false))
    .map((t) => ({ seen: t }));
  // Only the first black hole stops the skip, as only the first cold glow does: each nearer one after stopped a jump
  // with nothing to do there, and the next jump's card still names it. Blind playtest, the Will's call, 2026-11-07.
  // Word from our craft at one still stops it, under visits.
  const holes = [...(ahead.holes ?? [])].sort((a, b) => a.found - b.found).slice(0, 1);
  // Our Glow Imager turns to every glow we find, a week each. Only its first cold glow stops the skip, as only the
  // first found does, and only its first made ring among the warm ones: the first sure sight of another mind's works.
  // 2026-11-11.
  const rings = (ahead.minds?.flashes ?? []).flatMap((f) => (f.imaged?.saw === "ring" ? [f.imaged.at] : []));
  const ring = rings.length ? { ring: { at: Math.min(...rings) } } : {};
  // Our Far-Side Array finds a dozen worlds in its first decades, by their magnetic fields. Only the first stops the
  // skip, as only the first cold glow does: the rest gather on Scan. What it hears at a world we knew still stops it.
  // 2026-11-11.
  const fields = (ahead.fields ?? []).slice(0, 1);
  walk({ ...ahead, fields, holes, minds: ahead.minds && { ...ahead.minds, ...ring, flashes, glows: glows.map((g, i) => (i === 0 ? g : { near: g.near, lost: g.lost, answered: g.answered })) } });
  return best === null ? null : { at: best, why: whyOf(where, whose) };
}

/** The next Year to stop at: the soonest of what Earth will learn, the builds we finish, and any other Year something
 *  happens, such as a rock found, pushed aside or striking. */
export function nextStop(ahead: EarthView, year: number, done: Record<string, number | null>, also: readonly (number | null)[] = []): number | null {
  return nextStopWhy(ahead, year, done, also.map((at) => ({ at, why: "" })))?.at ?? null;
}

/** The next stop, and why: a build of ours done names it, and any other Year comes with its own words. */
export function nextStopWhy(
  ahead: EarthView,
  year: number,
  done: Record<string, number | null>,
  also: readonly { at: number | null; why: Why }[] = [],
): { at: number; why: Why } | null {
  const later = (t: number | null): t is number => t !== null && t > year + 1e-6;
  const all = [
    nextKnownWhy(ahead, year),
    ...Object.entries(done).flatMap(([name, at]) => (later(at) ? [{ at, why: `${name} done` }] : [])),
    ...also.flatMap((x) => (later(x.at) ? [{ at: x.at, why: x.why }] : [])),
  ].filter((x): x is { at: number; why: Why } => x !== null);
  return all.length ? all.reduce((a, b) => (b.at < a.at ? b : a)) : null;
}
