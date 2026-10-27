// "Where we come from": the Sun's road through time, shared by the screen's words and its scene. Time runs in log
// years, from the Sun's birth to this morning, so the deep past sweeps by and the last century gets room.

export const AGE = 4.6e9;
const DEEP = Math.log10(AGE + 1);

/** Where a moment falls on the road, from 0 at the Sun's birth to 1 at this morning. */
export const place = (ago: number) => 1 - Math.log10(ago + 1) / DEEP;
/** Years ago at a place on the road. */
export const agoAt = (u: number) => 10 ** ((1 - u) * DEEP) - 1;

/** About how long one lap of the galaxy takes the Sun, in years: 8.28 kpc round at 236 km/s. */
export const LAP = 2.2e8;

/**
 * How far the camera stands as the Sun's light nears this morning: log10 of years ago, then log10 of AU. The whole
 * galaxy for the deep past, then the nearby stars for the first people, the Sun's neighborhood for writing, and home.
 */
const ZOOM: [lt: number, logD: number][] = [
  [9.67, 10.15],
  [8.0, 10.15],
  [6.5, 8.9],
  [5.5, 7.65],
  [3.7, 5.75],
  [2.0, 4.15],
  [1.27, 3.3],
  [0.7, 2.6],
  [0, -3.55],
];
export const WHOLE_ROAD = ZOOM[0][1];

/** The camera's distance, log10 of AU, at a place on the road. */
export function roadZoom(u: number) {
  const lt = (1 - u) * DEEP;
  for (let i = 0; i < ZOOM.length - 1; i++) {
    const [a, da] = ZOOM[i];
    const [b, db] = ZOOM[i + 1];
    if (lt >= b) return da + ((db - da) * (a - lt)) / (a - b);
  }
  return ZOOM[ZOOM.length - 1][1];
}
