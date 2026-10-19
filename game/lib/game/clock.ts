// 5 real minutes = 1 Year. It runs offline, with no pause. Settled 2026-10-06.
export const MS_PER_YEAR = 5 * 60 * 1000;
export const YEAR_0 = 2040;

/** Game Years since Begin. Null before Begin. */
export function yearAt(beganAt: number | null, now = Date.now()): number | null {
  return beganAt === null ? null : (now - beganAt) / MS_PER_YEAR;
}

/** Years to the tenth below, as the top bar shows them: 0, 0.1, 3.2. */
export function tenths(years: number): number {
  return Math.floor(years * 10 + 1e-9) / 10;
}

/** Real time for a span of game time, as a list shows it: 1h 38m, 21m, or under a minute, 30s. Read at a glance,
 *  where HH:MM:SS reads like a time of day. Settled 2026-10-19. */
export function span(years: number): string {
  const s = Math.max(0, Math.floor((years * MS_PER_YEAR) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  return m ? `${m}m` : `${s}s`;
}

/** Real time for a span of game time, as HH:MM:SS. */
export function realTime(years: number): string {
  const s = Math.round((years * MS_PER_YEAR) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
