// The ladder, played: what the watcher's maker does once we spread, after its news crosses and its answer comes back.
// Warn at our first builder seed, the watcher's own laser, at once. Contain when we launch another after it: grams at a
// tenth of light speed wreck our seeds and any Mind sent to settle, at every star they reach. Strike Earth when our
// seed probes' copies launch seeds of their own: a bullet, readied as any mind readies one, by parity. Settled
// 2026-10-29, played since 2026-10-30, in HOLOS_GAME_CONCEPT.md. Pure, so it tests fast.
import targets from "../../data/targets.json" with { type: "json" };
import { bulletMt, BULLET } from "./conflict.ts";
import { skyOf } from "./minds.ts";
import { place, type Probe } from "./spread.ts";
import type { ColonyMode, World } from "./types.ts";

/** What the maker sends travels at a tenth of light speed, as calcs/minds.py's REPLY_C and our own bullets. */
const REPLY_C = 0.1;

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
): Ladder {
  const none: Ladder = { warned: null, lost: [], cancelled: new Set(), colonyLost: null, strike: null };
  const w = world.minds?.watcher;
  const maker = w && world.minds!.old.find((o) => o.id === w.maker);
  if (!w || !maker) return none;
  const sky = skyOf(maker.pos);
  const M = place(sky.ra, sky.dec, maker.d);
  const builder = colony && (colony.mode === "settle" || colony.mode === "furnace") ? colony : null;
  // Launches from Earth, the ones the watcher here sees: our first-generation probes and a builder Mind.
  const launches = [...probes.filter((p) => p.gen === 1).map((p) => p.leaves), ...(builder ? [builder.leaves] : [])].sort((a, b) => a - b);
  if (!launches.length) return none;
  const warned = launches[0];
  // Contain: another builder launched after the warning. Word reaches the maker, and grams fly to every star we reached.
  const again = launches.find((t) => t > warned);
  const sent = again === undefined ? null : again + maker.d;
  const arrives = (S: readonly number[] | null) => (sent === null || !S ? Infinity : sent + dist(M, S) / REPLY_C);
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
  // crosses to the maker. It readies a bullet as any mind does, then fires it at Earth.
  let strike: Ladder["strike"] = null;
  for (const p of probes)
    for (const c of p.copies) {
      if (cancelled.has(c.star) || (lostAt.get(p.star) ?? Infinity) <= c.leaves) continue;
      const S = starAt(p.star);
      if (!S) continue;
      const chose = c.leaves + dist(S, M);
      const lands = chose + BULLET.ready + maker.d / REPLY_C;
      if (!strike || lands < strike.lands) strike = { chose, lands, mt: bulletMt() };
    }
  return { warned, lost, cancelled, colonyLost, strike };
}
