// Strikes that have landed on Earth by a Year, and what they cost: a rock no one pushed aside. Each is harm in the pace
// from the Year it lands, and nothing before. From 10⁸ Mt no Mind of ours lives on Earth, and the Will lives on in a
// vault or a colony, if one stands. Settled 2026-10-28, lib/sim/conflict.ts. Neighbors' bullets went with the
// neighbors, 2026-10-29.
import { harmOf, rockMt } from "@/lib/sim/conflict";
import type { Order } from "@/lib/sim/works";
import { YEAR_0 } from "./clock";
import { colonyRoad } from "./reach";
import { rockAt, rockOf } from "./rocks";
import type { Plan } from "./types";

export interface Hit {
  /** Where it came from: "a rock", or "beyond our system" for the bullet the watcher's maker fires. */
  from: string;
  lands: number;
  mt: number;
  screened: boolean;
  harm: ReturnType<typeof harmOf>;
}

/** Every strike landed by Year `year`, oldest first. */
export function hitsAt(
  plan: Plan,
  seed: number | undefined,
  done: Record<string, number | null>,
  year: number,
  // The ladder's strike, once it has landed, as the server's view tells it: only the world knows who fires. 2026-10-30.
  struck: { lands: number; mt: number } | null = null,
): Hit[] {
  const out: Hit[] = [];
  if (struck && struck.lands <= year) out.push({ from: "beyond our system", lands: struck.lands, mt: struck.mt, screened: false, harm: harmOf(struck.mt) });
  const rock = seed === undefined ? null : rockAt(rockOf(seed), plan, done, year);
  if (rock?.state === "struck") out.push({ from: "a rock", lands: rock.strikes, mt: rockMt(rock.m), screened: false, harm: harmOf(rockMt(rock.m)) });
  return out.sort((a, b) => a.lands - b.lands);
}

/** The hits as harm in the pace. A strike that ends Earth leaves it no thought, unless a backup of our Mind wakes
 *  where something can run it, and regrows from there. */
export function harmOrders(hits: readonly Hit[], restore: Restore | null = null): Order[] {
  return hits
    .filter((h) => h.harm.share > 0)
    .map((h): Order =>
      h.harm.ends && restore
        ? { y: h.lands, restore: restore.from, doubling: restore.doubling }
        : { y: h.lands, harm: h.harm.share, recover: h.harm.ends ? 1e9 : h.harm.recover },
    );
}

/** How a backup of our Mind comes back: the share of Earth's thought it wakes with, and the Years its industry takes to
 *  double, back to all of it. A vault alone is 10 kt of machines and a copy of us: a seed factory, which Metzger et al.
 *  2013 grow in generations 2 years apart. The Moon Vault wakes on whatever else we built off Earth, as samples. The
 *  Trojan Vault has only a small dark rock to work, so it doubles slower, a sample. Our colony is a Mind with its own
 *  industry already. 2026-10-28. */
export interface Restore {
  from: number;
  doubling: number;
}
const OFF_EARTH: [string, number][] = [
  ["Cold Annex", 0.2],
  ["Power from Orbit", 0.15],
  ["Orbital Foundry", 0.03],
  ["Mass Driver", 0.02],
  ["Belt Mining", 0.02],
  ["Orbital Yard", 0.01],
];
export function restoreOf(lives: string, done: Record<string, number | null>, lost: number): Restore {
  if (lives === "the Moon Vault")
    return { from: OFF_EARTH.reduce((s, [n, share]) => s + ((done[n] ?? Infinity) <= lost ? share : 0), 0.001), doubling: 2 };
  if (lives === "the Trojan Vault") return { from: 0.001, doubling: 3 };
  return { from: 0.01, doubling: 2 };
}

/** Our colony as a place the Will can live on: where it stands and how far its light is, from a star's distance. */
export function colonyOf(plan: Plan, scale: number, dOf: (star: string) => number | undefined) {
  const c = plan.colony;
  const d = c ? dOf(c.name) : undefined;
  return c && d !== undefined ? { star: c.name, d, stands: colonyRoad(plan, scale, 0, c.name, d).stands } : null;
}

/** Light-years from Earth to the Moon, 1.3 light-seconds, and to the Trojan Vault at L4, 499. */
const YEAR_S = 31_557_600;
/** Where our Mind lives on once Earth's is lost, and how far its light is from Earth: the nearest of the Moon Vault, the
 *  Trojan Vault or our colony to stand by then, or null when none does and the game is over. The Will crosses to it
 *  as it would by the Mind Link, a Year for each light-year. */
export function survivorAt(done: Record<string, number | null>, lost: number, colony: { stands: number | null; d: number; star: string } | null) {
  for (const [name, at, d] of [
    ["the Moon Vault", done["Moon Vault"], 1.28 / YEAR_S],
    ["the Trojan Vault", done["Trojan Vault"], 499 / YEAR_S],
    [`our Mind at ${colony?.star}`, colony?.stands ?? null, colony?.d ?? 0],
  ] as const)
    if (at != null && at <= lost) return { name, d };
  return null;
}

/** Where a strike lands on Earth, and how far its blast reaches: a place drawn evenly over the globe from the strike
 *  itself, so it is the same every time, and the radius a megaton airburst flattens, about 4.6 km, grown as the cube
 *  root of its yield. For the globe's scar. 2026-10-28. */
export function scarOf(h: Hit) {
  const mix = (salt: number) => {
    let x = salt;
    for (const c of `${h.from}:${h.lands}`) x = Math.imul(x ^ c.charCodeAt(0), 0x9e3779b1);
    x ^= x >>> 15;
    x = Math.imul(x, 0x85ebca6b);
    return ((x ^ (x >>> 13)) >>> 0) / 4294967296;
  };
  const u = mix(0x2545f491), v = mix(0x68e31da4);
  return { lat: (Math.asin(2 * u - 1) * 180) / Math.PI, lon: v * 360 - 180, at: YEAR_0 + h.lands, km: 4.6 * Math.cbrt(h.mt) };
}
