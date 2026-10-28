// What the Mind knows of strikes, screens and watched probes: only what has reached us. A bullet coming is dark until
// it lands, and a probe braking in shows only to our X-ray watch in its last weeks. Settled 2026-10-28.
import { tenths } from "@/lib/game/clock";
import { restoreOf, survivorAt, type Hit } from "@/lib/game/hits";

/** A share, as a percent: tenths below one. */
const pct = (x: number) => (x < 0.01 ? `${(x * 100).toFixed(1)}%` : `${Math.round(x * 100)}%`);
import { HARM_WORDS, probeFate, probesToUs, strikesBetween, strikesOnUs, type ProbeToUs } from "@/lib/sim/conflict";
import catalog from "@/data/works.json";

const { speed: SENTINEL_V, burns: SENTINEL_BURNS } = catalog.sentinel;
import type { World } from "@/lib/sim/types";
import type { Reaction } from "@/lib/game/types";

export function describeConflict(
  world: World,
  reactions: readonly Reaction[],
  kit: { sentinels?: { star: string; leaves: number }[]; xray?: number | null; interceptor?: number | null; screens?: { star: string; done: number }[]; strikes?: { star: string; fired: number }[] },
  hits: readonly Hit[],
  done: Record<string, number | null>,
  colony: { stands: number | null; d: number; star: string } | null,
  year: number | null,
): string {
  const now = year ?? 0;
  const lines: string[] = [];
  for (const h of hits) {
    const from = h.from === "a rock" ? "A rock" : `A bullet from ${h.from}`;
    lines.push(
      h.screened
        ? `${from} struck our screen at Year ${tenths(h.lands)} and burst into spray, a flash high in the air and nothing worse.`
        : `${from} struck Earth at Year ${tenths(h.lands)} with about ${Math.round(h.mt).toLocaleString("en-US")} Mt: ${HARM_WORDS[h.harm.tier]}. ${h.harm.ends ? "" : `We lost ${Math.round(h.harm.share * 100)}% of our thought and grid, won back over about ${Math.round(h.harm.recover)} Years.`}`.trim(),
    );
  }
  const end = hits.find((h) => !h.screened && h.harm.ends);
  if (end) {
    const lives = survivorAt(done, end.lands, colony)?.name;
    const r = lives ? restoreOf(lives, done, end.lands) : null;
    lines.push(
      lives && r
        ? `Earth's Mind was lost at Year ${tenths(end.lands)}. Our backup woke in ${lives} with ${pct(r.from)} of the thought Earth had, on what stood off Earth, and its industry copies itself to double that every ${r.doubling} Years, back to all of it. It can build only off Earth: in orbit, on the Moon and among the rocks. Works on Earth and its data centers were lost with it. Until it woke, the backup sent nothing and built nothing, so no one saw it.`
        : `Earth's Mind was lost at Year ${tenths(end.lands)}, and no Mind of ours stood anywhere else. The game is over.`,
    );
  }
  const seen = probesToUs(world, reactions).flatMap((p: ProbeToUs) => {
    const f = probeFate(p, kit.xray ?? null, kit.interceptor ?? null);
    return f.seen !== null && f.seen <= now ? [{ p, ...f }] : [];
  });
  for (const { p, seen: at, caught } of seen)
    lines.push(
      caught !== null && caught <= now
        ? `Our X-Ray Watch saw a probe from ${p.star}'s direction braking in at Year ${tenths(at!)}. Our Interceptor wrecked it as it stopped, at Year ${tenths(caught)}. Its sender will learn it went dark.`
        : `Our X-Ray Watch saw a probe from ${p.star}'s direction braking into our system at Year ${tenths(at!)}, a flame of about a terawatt. It stops within weeks.`,
    );
  // A launch or a strike shows only in its own system, so we see one only where a sentinel of ours stands watching,
  // and its word comes home a light-time later. One aimed at us is warning: it flies ten times as long as its word.
  // 2026-10-28.
  const dOf = (star: string) => world.neighbors.find((p) => (world.stars[p.star]?.shown ?? p.star) === star)?.d;
  const watch = new Map(
    (kit.sentinels ?? []).flatMap((x) => {
      const d = dOf(x.star);
      return d === undefined ? [] : [[x.star, { stands: x.leaves + d / SENTINEL_V + SENTINEL_BURNS, d }] as const];
    }),
  );
  const witnessed = (star: string, at: number) => {
    const w = watch.get(star);
    return w && at >= w.stands && at + w.d <= now ? at + w.d : null;
  };
  for (const b of strikesBetween(world, reactions)) {
    const launch = witnessed(b.from, b.fired);
    if (launch !== null) lines.push(`Our sentinel at ${b.from} saw it fire a bullet of about 1,000 t toward ${b.to} at Year ${tenths(b.fired)}. Word reached us at Year ${tenths(launch)}.`);
    const hit = witnessed(b.to, b.lands);
    if (hit !== null) lines.push(`Our sentinel at ${b.to} saw ${b.screened ? "a bullet from " + b.from + " burst on a screen there" : "a bullet from " + b.from + " strike it, about 110,000 Mt"} at Year ${tenths(b.lands)}.`);
  }
  for (const b of strikesOnUs(world, reactions)) {
    const launch = witnessed(b.star, b.fired);
    if (launch !== null && b.lands > now)
      lines.push(`Our sentinel at ${b.star} saw it fire a bullet of about 1,000 t at us at Year ${tenths(b.fired)}. It lands about Year ${tenths(b.lands)}, unless a screen on that line stands first.`);
  }
  for (const s of kit.screens ?? []) if (s.done <= now) lines.push(`Our pellet screen on the line to ${s.star} stands since Year ${tenths(s.done)}.`);
  for (const s of kit.strikes ?? [])
    if (s.fired <= now) lines.push(`We fired a bullet at ${s.star} at Year ${tenths(s.fired)}. Its launch flame shows only in our own system, to any probe of theirs watching here.`);
  return lines.length ? `Strikes, screens and probes, as they have reached us:\n${lines.map((l) => `- ${l}`).join("\n")}` : "";
}
