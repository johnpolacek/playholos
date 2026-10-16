// 5 real minutes = 1 Year. It runs offline, with no pause. Settled 2026-10-06.
export const MS_PER_YEAR = 5 * 60 * 1000;
export const YEAR_0 = 2040;

/** Game Years since Begin. Null before Begin. */
export function yearAt(beganAt: number | null, now = Date.now()): number | null {
  return beganAt === null ? null : (now - beganAt) / MS_PER_YEAR;
}
