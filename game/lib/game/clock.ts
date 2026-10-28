// 5 real minutes = 1 Year. It runs offline, with no pause. Settled 2026-10-06.
export const MS_PER_YEAR = 5 * 60 * 1000;
export const YEAR_0 = 2040;

/** Game Years since Begin. Null before Begin. Once the Will lives at our Mind on a hole's innermost orbit, its clock
 *  runs slow there, so the sky's Years go by `rate` times as fast from the Year it arrived. 2026-10-26. */
export function yearAt(beganAt: number | null, now = Date.now(), will?: { at: number; rate: number } | null): number | null {
  if (beganAt === null) return null;
  const y = (now - beganAt) / MS_PER_YEAR;
  return will && y > will.at ? will.at + (y - will.at) * will.rate : y;
}

/** The Year an order of the Will's lands on Earth: at once while it lives there, a light-time later from a hole. */
export const ordersLand = (year: number, will?: { at: number; d: number } | null) => (will && year >= will.at ? year + will.d : year);

/** The Year of Earth's news the Will has at Year `year`: now on Earth, or a light-time old at a hole. */
export const newsOf = (year: number, will?: { at: number; d: number } | null) => (will && year >= will.at ? year - will.d : year);

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
  if (h) return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
  return m ? `${m}m` : `${s}s`;
}

/** Light-years as a screen writes them: 4.2, or 1,560 where the tenth is 0. */
export const lyOf = (ly: number) => ly.toLocaleString("en-US", { maximumFractionDigits: 1 });

/** Real time for a span of game time, as HH:MM:SS. */
export function realTime(years: number): string {
  const s = Math.round((years * MS_PER_YEAR) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
