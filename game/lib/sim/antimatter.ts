// Antimatter by the tonne: what the Antimatter Works makes, on a hundredth of what the Solar Swarm turns to power. A
// plant built for it turns 3.9e-5 of its energy into antimatter (Schmidt et al. 2000), so the Works makes little at first
// and twice as much each time the swarm doubles, up to 10.5 Mt a Year once it catches all the Sun. Held, the swarm stops
// growing and the Works makes what it then can. calcs/antimatter.py. Pure, so it tests fast. 2026-11-12.
import catalog from "../../data/works.json" with { type: "json" };

const AM = catalog.speeds.antimatter;
const { doubling: DOUBLING } = catalog.swarm;
const FULL = catalog.works["Solar swarm"].full;

/** Antimatter made by Year `t`, tonnes, by a Works done at Year `works`, on a swarm that grew over these spans of
 *  Years, the first from the Year it was done. Each generation of the swarm doubles what the Works is given. */
export function amMade(swarm: readonly [number, number | null][], works: number | null, t: number) {
  if (works === null || !swarm.length || t <= works) return 0;
  // Years the swarm had grown by a moment, and the moments its power changes: each doubling, and each hold or release.
  const grown = (at: number) => swarm.reduce((y, [a, b]) => y + Math.max(0, Math.min(b ?? at, at) - a), 0);
  const from = Math.max(works, swarm[0][0]);
  const edges = new Set<number>([from, t]);
  for (const [a, b] of swarm) {
    for (const x of [a, b]) if (x !== null && x > from && x < t) edges.add(x);
    for (let k = DOUBLING; k <= FULL * DOUBLING; k += DOUBLING) {
      const at = a + k - grown(a);
      if (at >= Math.min(b ?? t, t)) break;
      if (at > from) edges.add(at);
    }
  }
  const cut = [...edges].sort((x, y) => x - y);
  let tonnes = 0;
  for (let i = 1; i < cut.length; i++) {
    const mid = (cut[i - 1] + cut[i]) / 2;
    tonnes += (AM.kgPerYear0 / 1000) * 2 ** Math.min(FULL, Math.floor(grown(mid) / DOUBLING + 1e-9)) * (cut[i] - cut[i - 1]);
  }
  return tonnes;
}

/** The Year the Works has made `tonnes` in all, or null if it never does within 2,000 Years of being done. */
export function amWhen(swarm: readonly [number, number | null][], works: number | null, tonnes: number) {
  if (works === null || !swarm.length) return null;
  let lo = Math.max(works, swarm[0][0]), hi = lo + 2000;
  if (amMade(swarm, works, hi) < tonnes) return null;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (amMade(swarm, works, mid) >= tonnes) hi = mid;
    else lo = mid;
  }
  return hi;
}
