// The ladder, played: what the watcher's maker does once we spread, after its news crosses and its answer comes back.
// Warn at our first builder seed, the watcher's own laser, at once. Contain when we launch another after it: what it
// throws wrecks our seeds and any Mind sent to settle, at every star they reach, flying near nine tenths of light speed
// close by, since only its shield binds what never stops (lib/sim/speeds.ts, 2026-11-11: it was a tenth). Strike Earth when our
// seed probes' copies launch seeds of their own: a bullet, readied as any mind readies one, by parity, thrown as fast, with the harm of our own. Settled
// 2026-10-29, played since 2026-10-30, in HOLOS_GAME_CONCEPT.md. Pure, so it tests fast.
//
// Wrecking the watcher, 2026-11-13, the designer's pick: our Interceptor can wreck it once we have found it where a
// craft can reach it. From then it sees nothing, so a launch it would have seen goes unseen. Its maker learns it went
// dark a light-time later, as its reports stop, and answers by its own nature. A hostile one, at or under HOSTILE as
// any mind, takes the blinding as spreading: its grams set out then, without a warning, and wreck our seeds at every
// star they reach. Any other sends a new watcher, which flies as our craft that stops would, by parity, and hides at
// the Sun's L4 or L5, where no craft of ours finds it. From its arrival it sees our launches as the first did.
import targets from "../../data/targets.json" with { type: "json" };
import { bulletMt } from "./conflict.ts";
import { HOSTILE, skyOf } from "./minds.ts";
import { place, type Probe } from "./spread.ts";
import { sentinelYears, theirReady, theirYears } from "./speeds.ts";
import type { ColonyMode, World } from "./types.ts";


export interface Ladder {
  /** The Year the warning came, at our first builder seed. */
  warned: number | null;
  /** Each seed probe of ours the grams wrecked: its star, its generation, and the Year it was lost. One lost before it
   *  landed never landed. */
  lost: { star: string; gen: number; at: number; before: boolean }[];
  /** Copies that never left, their parent lost first: by star. */
  cancelled: Set<string>;
  /** Our Mind sent to settle, wrecked there, and when. */
  colonyLost: number | null;
  /** The bullet: when the maker chose to strike, when it lands, and how hard. */
  strike: { chose: number; lands: number; mt: number } | null;
  /** Its grams set out because we wrecked its watcher, not for a second seed. 2026-11-13. */
  blinded: boolean;
  /** The Year a new watcher takes its place, if its maker sent one, or null. Earth never sees this. */
  rewatch: number | null;
}

/** What the watcher's maker does once its watcher goes dark: a hostile one contains us, and any other sends another.
 *  `wrecked` is the Year our kill vehicle hit it. Its word stops then, and reaches the maker a light-time later. */
export function answerToWreck(maker: { d: number; peaceful: number }, wrecked: number) {
  const learns = wrecked + maker.d;
  return maker.peaceful <= HOSTILE
    ? { contain: learns, rewatch: null }
    : { contain: null, rewatch: learns + theirReady(maker.d) + sentinelYears(maker.d) };
}

const dist = (a: readonly number[], b: readonly number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const starAt = (name: string) => {
  const t = targets.find((x) => x.name === name);
  return t ? place(t.ra, t.dec, t.d) : null;
};

/** The ladder for one game, from the world's watcher and maker, our seed probes as spread.ts flies them, and our Mind
 *  sent on the Seed Ship. Only builders count: seed probes, and a Mind sent to settle or to feed a hole. */
export function ladderOf(
  world: World,
  probes: readonly Probe[],
  colony: { star: string; mode: ColonyMode; leaves: number } | null,
  wrecked: number | null = null,
): Ladder {
  const none: Ladder = { warned: null, lost: [], cancelled: new Set(), colonyLost: null, strike: null, blinded: false, rewatch: null };
  const w = world.minds?.watcher;
  const maker = w && world.minds!.old.find((o) => o.id === w.maker);
  if (!w || !maker) return none;
  const sky = skyOf(maker.pos);
  const M = place(sky.ra, sky.dec, maker.d);
  const builder = colony && (colony.mode === "settle" || colony.mode === "furnace") ? colony : null;
  // Our watcher wrecked: what its maker does once it learns. 2026-11-13.
  const wreck = wrecked === null ? null : answerToWreck(maker, wrecked);
  // Launches from Earth, the ones a watcher here sees: our first-generation probes and a builder Mind. None while no
  // watcher stands: from the wreck until a new one comes, if one does.
  const seen = (t: number) => wreck === null || t < wrecked! || (wreck.rewatch !== null && t >= wreck.rewatch);
  const launches = [...probes.filter((p) => p.gen === 1).map((p) => p.leaves), ...(builder ? [builder.leaves] : [])].sort((a, b) => a - b);
  const watched = launches.filter(seen);
  if (!launches.length || (!watched.length && wreck?.contain == null)) return { ...none, rewatch: wreck?.rewatch ?? null };
  const warned = watched.length ? watched[0] : null;
  // Contain: another builder launched after the warning, seen. Word reaches the maker, and grams fly to every star we
  // reached. Or a hostile maker's watcher went dark. Whichever comes first.
  const again = warned === null ? undefined : watched.find((t) => t > warned);
  const byAgain = again === undefined ? Infinity : again + maker.d;
  const byWreck = wreck?.contain ?? Infinity;
  const sent = Math.min(byAgain, byWreck) === Infinity ? null : Math.min(byAgain, byWreck);
  const arrives = (S: readonly number[] | null) => (sent === null || !S ? Infinity : sent + theirYears(dist(M, S)));
  const lost: Ladder["lost"] = [];
  const cancelled = new Set<string>();
  const lostAt = new Map<string, number>();
  for (const p of [...probes].sort((a, b) => a.leaves - b.leaves)) {
    // A copy whose parent was lost before it left never flew.
    if (p.from !== null && (cancelled.has(p.from) || (lostAt.get(p.from) ?? Infinity) <= p.leaves)) {
      cancelled.add(p.star);
      continue;
    }
    const at = arrives(starAt(p.star));
    if (at === Infinity) continue;
    const when = Math.max(at, p.lands);
    lost.push({ star: p.star, gen: p.gen, at: when, before: at < p.lands });
    lostAt.set(p.star, when);
  }
  const colonyLost = builder ? (() => {
    const at = arrives(starAt(builder.star));
    return at === Infinity ? null : Math.max(at, builder.leaves);
  })() : null;
  // Strike: our colonies launch seeds of their own. The first copy to leave, seen by a watcher at its star, whose word
  // crosses to the maker. It readies a rod, in about a month since its beam stands, then throws it at Earth.
  let strike: Ladder["strike"] = null;
  for (const p of probes)
    for (const c of p.copies) {
      if (cancelled.has(c.star) || (lostAt.get(p.star) ?? Infinity) <= c.leaves) continue;
      const S = starAt(p.star);
      if (!S) continue;
      const chose = c.leaves + dist(S, M);
      const lands = chose + theirReady(maker.d) + theirYears(maker.d);
      if (!strike || lands < strike.lands) strike = { chose, lands, mt: bulletMt() };
    }
  return { warned, lost, cancelled, colonyLost, strike, blinded: byWreck < byAgain, rewatch: wreck?.rewatch ?? null };
}
