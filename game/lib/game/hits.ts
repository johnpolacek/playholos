// Strikes that have landed on Earth by a Year, and what they cost: a neighbor's bullets, unless a screen stood on the
// line to its star, and a rock no one pushed aside. Each is harm in the pace from the Year it lands, and nothing before:
// a coasting bullet is dark, so we learn of it as it lands. From 10⁸ Mt no Mind of ours lives on Earth, and the Will
// lives on in a vault or a colony, if one stands. Settled 2026-10-28, lib/sim/conflict.ts.
import { harmOf, rockMt } from "@/lib/sim/conflict";
import type { Order } from "@/lib/sim/works";
import { YEAR_0 } from "./clock";
import { screensOf } from "./reach";
import { rockAt, rockOf } from "./rocks";
import type { Plan, Reaction } from "./types";

export interface Hit {
  /** A neighbor's star, or "a rock". */
  from: string;
  lands: number;
  mt: number;
  screened: boolean;
  harm: ReturnType<typeof harmOf>;
}

/** Every strike landed by Year `year`, oldest first. */
export function hitsAt(
  plan: Plan,
  scale: number,
  seed: number | undefined,
  reactions: readonly Reaction[],
  done: Record<string, number | null>,
  year: number,
): Hit[] {
  const screens = screensOf(plan, scale);
  const out: Hit[] = reactions.flatMap((r) => {
    if (r.lands === undefined || r.mt === undefined || r.lands > year) return [];
    const screened = screens.some((s) => s.star === r.star && s.done !== null && s.done <= r.lands!);
    return [{ from: r.star, lands: r.lands, mt: r.mt, screened, harm: harmOf(screened ? 0 : r.mt) }];
  });
  const rock = seed === undefined ? null : rockAt(rockOf(seed), plan, done, year);
  if (rock?.state === "struck") out.push({ from: "a rock", lands: rock.strikes, mt: rockMt(rock.m), screened: false, harm: harmOf(rockMt(rock.m)) });
  return out.sort((a, b) => a.lands - b.lands);
}

/** The hits as harm in the pace. A strike that ends Earth leaves it no thought, for good. */
export const harmOrders = (hits: readonly Hit[]): Order[] =>
  hits.filter((h) => h.harm.share > 0).map((h) => ({ y: h.lands, harm: h.harm.share, recover: h.harm.ends ? 1e9 : h.harm.recover }));

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
