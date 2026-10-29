// Strikes, screens, probes caught and radars quieted: what neighbors can do to us, and we to them, by the same physics.
// Anything a neighbor can do, Earth can build too, at the same price and pace, and the reverse. Settled 2026-10-28.
// Sources in HOLOS_RESEARCH.md, "Strikes, screens and harm". Pure, so it tests fast. Server and client both use it:
// what reads the seed's truth stays on the server, and the client sees only what reached us.
import type { Reaction } from "../game/types.ts";
import { STRIKE_READY, STRIKE_V } from "./meetings.ts";
import type { Neighbor, World } from "./types.ts";

/** A bullet, ours or theirs: 1,000 t at a tenth of light speed, readied in 20 Years. Each tonne lands with 108 Mt, so
 *  it lands with about 110,000 Mt, enough to scar the air worldwide and cool the climate. Chicxulub would take over
 *  200,000 t. The fuel to fire it is 61 t of fusion fuel a tonne. */
export const BULLET = { tonnes: 1000, v: STRIKE_V, ready: STRIKE_READY, fuelPerTonne: 61 };
/** Kinetic energy at speed v (in c), per tonne, in megatons: (γ - 1)mc². */
export const mtPerTonne = (v: number) => ((1 / Math.sqrt(1 - v * v) - 1) * 1000 * 299792458 ** 2) / 4.184e15;
export const bulletMt = (tonnes = BULLET.tonnes, v = BULLET.v) => tonnes * mtPerTonne(v);

/** A rock's strike: a stony body at 17 km/s, the typical speed of a near-Earth asteroid's impact. */
export const rockMt = (m: number) => (0.5 * 2400 * (Math.PI / 6) * m ** 3 * 17000 ** 2) / 4.184e15;

/** What a strike of so many megatons costs us. Grid and thought lost, x = log10(Mt): ((x - 1) / 7)², from Tohoku and
 *  Maria at the small end and Toon et al. 1997's thresholds above. Won back over 2·10^(0.25(x - 1)) Years. From 10⁸ Mt,
 *  Chicxulub's class, no Mind of ours lives on Earth. A fit of our own: no study maps impact energy to lost industry. */
export function harmOf(mt: number) {
  const x = Math.log10(Math.max(mt, 1e-3));
  const share = x <= 1 ? 0 : Math.min(1, ((x - 1) / 7) ** 2);
  const tier =
    mt < 10 ? "local" : mt < 1e4 ? "regional" : mt < 1e5 ? "ozone" : mt < 1e6 ? "climate" : mt < 1e8 ? "winter" : "extinction";
  return { mt, share, recover: 2 * 10 ** (0.25 * Math.max(0, x - 1)), tier, ends: mt >= 1e8 } as const;
}

/** What a strike of this tier does, in words. */
export const HARM_WORDS: Record<ReturnType<typeof harmOf>["tier"], string> = {
  local: "a blast like Tunguska’s, flattening forest for tens of kilometres",
  regional: "fire and blast across a region, and its grid and fabs with it",
  ozone: "a region laid waste, and the high air’s water and ozone torn worldwide",
  climate: "a region gone, the ozone thinned worldwide, and the climate cooled for Years",
  winter: "a sky dark with soot for Years, too dark for crops, and most of our industry lost",
  extinction: "Chicxulub’s class: no Mind of ours can live on Earth after it",
};

/** A pellet screen on the line to one star: 10 g pellets 0.7 m apart, 10 km wide, about 2,000 t, held 4 million km out.
 *  Any bullet from that star that crosses it is wrecked into spray that spreads wider than Earth before it arrives, and
 *  lands as a flash in the high air. Our estimate: no paper models one. 4 Years at standard pace. */
export const SCREEN = { tonnes: 2000, km: 10, outKm: 4e6, years: 4 };

/** A probe braking in under a fusion flame shows to an X-ray watch in its last weeks: about 29 days before it stops. */
export const XRAY_WARNING = 29 / 365.25;

const shown = (world: World, p: Neighbor) => world.stars[p.star]?.shown ?? p.star;

/** A strike on our world: from whom, when it lands, and how big. */
export interface StrikeOnUs {
  star: string;
  fired: number;
  lands: number;
  mt: number;
}

/** Bullets a neighbor fires at Earth: each "strike" it chose on news of us, readied and flown. */
export function strikesOnUs(world: World, reactions: readonly Reaction[]): StrikeOnUs[] {
  const who = new Map(world.neighbors.map((p) => [shown(world, p), p]));
  return reactions.flatMap((r) => {
    const p = who.get(r.star);
    // A strike on our craft at a hole ends that craft, by meetings.ts. Only one on news of us at home comes here.
    if (!p || r.move !== "strike" || r.about || (r.to ?? r.from ?? "Sol") !== "Sol") return [];
    const fired = r.at + p.thinks + BULLET.ready;
    return [{ star: r.star, fired, lands: fired + p.d / BULLET.v, mt: bulletMt() }];
  });
}

/** Whether a screen toward a star stands before a bullet from it lands. */
export const screened = (s: { star: string; lands: number }, screens: readonly { star: string; done: number }[]) =>
  screens.some((x) => x.star === s.star && x.done <= s.lands);

/** A neighbor's probe coming to Sol: from the seed, or sent in play on news of us. */
export interface ProbeToUs {
  star: string;
  arrives: number;
  /** It burns all the way in, where an X-ray watch sees its flame, or stops far out, unseen. */
  close: boolean;
  orders: string;
}
export function probesToUs(world: World, reactions: readonly Reaction[]): ProbeToUs[] {
  const from = world.neighbors.flatMap((p) =>
    p.probes.map((x) => ({ star: shown(world, p), arrives: Number(x.year), close: x.ends === "close" && x.bright !== false, orders: String(x.orders ?? "watch") })),
  );
  const who = new Map(world.neighbors.map((p) => [shown(world, p), p]));
  // In play, a probe on news of us is a sentinel like ours: built in 20 Years, flown at a tenth of light speed, 10 Years
  // more to speed up and slow down. Where it stops is the coin a sentinel's sender tosses, half and half here.
  const live = reactions.flatMap((r) => {
    const p = who.get(r.star);
    if (!p || r.move !== "probe" || r.about || (r.to ?? r.from ?? "Sol") !== "Sol") return [];
    return [{ star: r.star, arrives: r.at + p.thinks + 20 + p.d / 0.1 + 10, close: r.key.length % 2 === 0, orders: "watch" }];
  });
  return [...from, ...live].sort((a, b) => a.arrives - b.arrives);
}

/** What our X-ray watch and interceptors make of a probe: seen braking in weeks out, then caught as it stops. */
export function probeFate(p: ProbeToUs, xray: number | null, interceptor: number | null) {
  const seen = p.close && xray !== null && xray <= p.arrives - XRAY_WARNING ? p.arrives - XRAY_WARNING : null;
  const caught = seen !== null && interceptor !== null && interceptor <= seen ? p.arrives : null;
  return { seen, caught };
}

/** Our bullet at a star: ordered at Year y once the Strike Yard is done, readied in 20 Years, flown at a tenth of light
 *  speed. Its launch flame shows only in our own system, to a probe of theirs watching here. */
export function ourStrike(world: World, star: string, y: number, yard: number | null) {
  const p = world.neighbors.find((n) => shown(world, n) === star);
  const d = p?.d ?? world.stars[star]?.d;
  if (yard === null || d === undefined) return null;
  const fired = Math.max(y, yard) + BULLET.ready;
  return { star, fired, lands: fired + d / BULLET.v, mt: bulletMt() };
}

/** When a radar cut at Year `cut` reaches each listener, and who never hears Earth because of it: those whose ears
 *  open only after our last sweep has passed. */
export function quietAt(world: World, cut: number) {
  return world.neighbors
    .filter((p) => !p.dead)
    .map((p) => ({ star: shown(world, p), reaches: cut + p.d, heard: p.heard && (p.heardSince ?? Infinity) <= cut + p.d }));
}

/** Earth's fate by Year `now`: the strikes that landed, screened or not, the harm each did, and the first that ended
 *  Earth, if any. Rocks come in from rocks.ts as strikes from no one. */
export function strikesLanded(strikes: readonly StrikeOnUs[], screens: readonly { star: string; done: number }[], now: number) {
  const landed = strikes
    .filter((s) => s.lands <= now)
    .map((s) => ({ ...s, screened: screened(s, screens), harm: screened(s, screens) ? harmOf(0) : harmOf(s.mt) }));
  const end = landed.find((s) => s.harm.ends) ?? null;
  return { landed, ends: end ? end.lands : null };
}

/** What we have done that neighbors feel, from our kit as Build dates it: bullets fired, probes caught, radars cut. */
export function actsOf(
  world: World,
  reactions: readonly Reaction[],
  kit: { xray?: number | null; interceptor?: number | null; quiet?: number | null; strikes?: { star: string; fired: number }[] },
) {
  const strikes = (kit.strikes ?? []).flatMap((s) => {
    const p = world.neighbors.find((n) => shown(world, n) === s.star);
    const d = p?.d ?? Object.values(world.stars).find((x) => x.shown === s.star)?.d;
    return d === undefined ? [] : [{ star: s.star, fired: s.fired, lands: s.fired + d / BULLET.v }];
  });
  const caught = probesToUs(world, reactions).flatMap((p) => {
    const { caught: at } = probeFate(p, kit.xray ?? null, kit.interceptor ?? null);
    return at === null ? [] : [{ star: p.star, at }];
  });
  return { strikes, caught, quiet: kit.quiet ?? null };
}

/** Screens a neighbor builds on a "guard": pellets on the line to whoever it guards against, as ours, standing 4 Years
 *  after it decides. Parity, 2026-10-28. */
export function theirScreens(world: World, reactions: readonly Reaction[]) {
  const who = new Map(world.neighbors.map((p) => [shown(world, p), p]));
  return reactions.flatMap((r) => {
    const p = who.get(r.star);
    if (!p || r.move !== "guard" || r.about) return [];
    return [{ star: r.star, toward: r.from ?? "Sol", done: r.at + p.thinks + SCREEN.years }];
  });
}

/** A Mind that chose to hide: by its star, the Year it starts to dim, once it has thought. From then the glow it sheds
 *  stops growing, as it computes no larger in the open. The earliest hide counts. Ours as theirs: our colony hides by
 *  the same move. Parity, 2026-10-28. */
export function hidesOf(world: World, done: readonly { star: string; at: number; move?: string }[]) {
  const out = new Map<string, number>();
  for (const r of done) {
    if (r.move !== undefined && r.move !== "hide") continue;
    const p = world.neighbors.find((n) => shown(world, n) === r.star);
    if (!p) continue;
    const at = r.at + p.thinks;
    if (at < (out.get(r.star) ?? Infinity)) out.set(r.star, at);
  }
  return out;
}

/** Our Cold Halo's glow: it starts at the Cold Annex's 1,200 GW, doubles every 10 Years while it grows, and sheds its
 *  heat at 77 K, where the same watch needs (77/12)^3 times the power it needs at 12 K: calcs/kin.py. 2026-10-28. */
export const HALO = { watts: 1.2e12, doubling: 10, warmer: (77 / 12) ** 3 };

/** The Year our halo's glow first reaches `need` watts, from the spans it grew, or null if it never does. */
export function haloReaches(spans: readonly [number, number | null][], need: number) {
  let years = 0;
  const want = HALO.doubling * Math.log2(need / HALO.watts);
  if (want <= 0) return spans[0]?.[0] ?? null;
  for (const [a, b] of spans) {
    const len = b === null ? Infinity : b - a;
    if (years + len >= want) return a + (want - years);
    years += len;
  }
  return null;
}

/** Light-years between two neighbors' stars, by where they sit in the sky. */
function apart(world: World, a: Neighbor, b: Neighbor) {
  const at = (p: Neighbor) => {
    const s = world.stars[p.star];
    if (s?.ra === undefined || s.dec === undefined) return null;
    const ra = (s.ra * 15 * Math.PI) / 180, dec = (s.dec * Math.PI) / 180;
    return [p.d * Math.cos(dec) * Math.cos(ra), p.d * Math.cos(dec) * Math.sin(ra), p.d * Math.sin(dec)];
  };
  const [x, y] = [at(a), at(b)];
  return x && y ? Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) : Infinity;
}

/** Bullets neighbors fire at each other: a "strike" on another neighbor's news, readied in 20 Years, flown at a tenth of
 *  light speed. Unless the target screened the line to the shooter in time. Parity, 2026-10-28. */
export function strikesBetween(world: World, reactions: readonly Reaction[]) {
  const who = new Map(world.neighbors.map((p) => [shown(world, p), p]));
  const screens = theirScreens(world, reactions);
  return reactions.flatMap((r) => {
    const [p, q] = [who.get(r.star), r.from ? who.get(r.from) : undefined];
    if (!p || !q || r.move !== "strike" || r.about) return [];
    const d = apart(world, p, q);
    if (!isFinite(d)) return [];
    const fired = r.at + p.thinks + BULLET.ready;
    const lands = fired + d / BULLET.v;
    const blocked = screens.some((s) => s.star === r.from && s.toward === r.star && s.done <= lands);
    return [{ from: r.star, to: r.from!, fired, lands, d, screened: blocked, mt: bulletMt() }];
  });
}
