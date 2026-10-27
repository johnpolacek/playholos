// Places for leads the sky file lacks, set at run time: black holes found in play, and far landmarks such as Gaia BH1.
// The map reads them where it reads lib/game/leads.json. Right ascension in hours, declination in degrees, distance in
// light-years, as leads.json has them. 2026-10-26.
const placed = new Map<string, [ra: number, dec: number, ly: number]>();
const listeners = new Set<(id: string) => void>();

export function placeLeads(places: Record<string, [number, number, number]>) {
  for (const [id, at] of Object.entries(places)) {
    if (placed.get(id)?.join() === at.join()) continue;
    placed.set(id, at);
    listeners.forEach((f) => f(id));
  }
}
export const placeOf = (id: string) => placed.get(id);
/** Told when a place is set, so a cache of where things are can forget it. */
export const onPlace = (f: (id: string) => void) => void listeners.add(f);
