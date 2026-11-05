// A label's side of its mark, held until the mark has moved well past the line that picks it. A mark sitting on the
// line, as Sol does at the map's middle, flipped its name from side to side each frame. Playtest 2026-11-04.
const BAND = 24;

const sides = new WeakMap<object, boolean>();
const keyed = new Map<string, boolean>();

/** True for the far side of `line`: once picked, it holds until `x` is `BAND` pixels past `line` the other way. */
export function steadySide(key: object | string, x: number, line: number) {
  const was = typeof key === "string" ? keyed.get(key) : sides.get(key);
  const far = was === undefined ? x > line : was ? x > line - BAND : x > line + BAND;
  if (typeof key === "string") keyed.set(key, far);
  else sides.set(key, far);
  return far;
}

const spots = new WeakMap<object, number>();

/** Which of a label's spots to use: the one it had while still clear, so two labels nudging each other don't swap
 *  spots each frame, else the first clear one. -1 when none is. */
export function steadySpot<T>(key: object, tries: T[], clear: (t: T) => boolean) {
  const was = spots.get(key);
  const i = was !== undefined && was < tries.length && clear(tries[was]) ? was : tries.findIndex(clear);
  if (i >= 0) spots.set(key, i);
  return i;
}
