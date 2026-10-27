// Distances as the time light takes to cross them, the game's one measure, from light-seconds out to light-years. AU
// never reaches a player, since few of us know it. Moved from the drift's readout 2026-10-24, for every screen and the
// Mind's prompt.

const AU_KM = 149597870.7;
const LIGHT_KMS = 299792.458;
/** Light's time across one AU, about 499 seconds. */
export const AU_LIGHT_S = AU_KM / LIGHT_KMS;

/** A distance as the time light takes to cross it: kilometers up close, then light-seconds out to light-years. */
export function lightTime(au: number) {
  const km = au * AU_KM;
  const s = au * AU_LIGHT_S;
  const fixed = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 1 : 0 });
  const light = (n: number, unit: string) => `${fixed(n)} light-${unit}${fixed(n) === "1" ? "" : "s"}`;
  if (s < 1) return `${fixed(Number(km.toPrecision(2)))} km`;
  if (s < 60) return light(s, "second");
  if (s < 3600) return light(s / 60, "minute");
  if (s < 172800) return light(s / 3600, "hour");
  const days = s / 86400;
  if (days < 365.25) return light(days, "day");
  const years = days / 365.25;
  if (years < 1e6) return light(Number(years.toPrecision(years < 1000 ? 3 : 2)), "year");
  return `${fixed(years / 1e6)} million light-years`;
}
