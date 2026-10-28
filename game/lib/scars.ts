// Strikes landed on Earth, for every screen that shows the globe: where, the decimal year each landed, and its blast's
// reach in km, with the decimal year now. The game sets it, and the map reads it each frame. Kept apart from the map,
// so setting it never loads three.js. 2026-10-28.
export interface Scar {
  lat: number;
  lon: number;
  at: number;
  km: number;
}
export const scarsNow: { list: Scar[]; year: number } = { list: [], year: 0 };
export const setScars = (list: Scar[], year: number) => void Object.assign(scarsNow, { list, year });
