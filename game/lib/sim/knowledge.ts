// The knowledge wall: what Earth knows at a moment, from the seed's truth. Settled 2026-10-13: the Mind judges from
// what Earth knows, never the seed. So nothing here passes on who lives where, a world's rung, or anything not yet
// arrived and caught. Pure: no files, so it runs anywhere and tests fast.
import type { EarthView, FeltWorld, Heard, World } from "./types.ts";

/** A sender's voice bank: its knock reads as its hail and its close, and the close may carry its name. */
export type Voices = Record<string, { hail: string[]; close: string[] }>;

export function earthKnows(world: World, year: number, voices: Voices = {}): EarthView {
  const shown = (id: string) => world.stars[id]?.shown ?? id;
  // Earth's finds at Year 0: every world whose tug shows by 2040. Measured, not understood. Its star is in the catalogs.
  const felt: FeltWorld[] = world.finds.map((f) => ({
    star: shown(f.star), d: f.d, minMass: f.msini, periodDays: f.periodDays, a: f.a, by: f.by, year: f.year,
    kind: world.stars[f.star]?.kind, hz: world.stars[f.star]?.hz,
  }));
  // Signals that have arrived and were caught. Until Earth's works are ported, only Year 0's sky watch listens.
  const heard: Heard[] = [];
  for (const p of world.neighbors) {
    for (const i of p.inbound) {
      if (i.year > year || !i.kit0) continue;
      const bank = voices[p.name];
      heard.push({
        star: shown(p.star), d: p.d, sent: i.sent, arrived: i.year, move: i.move,
        text: bank && i.move === "knock" ? `${bank.hail[0]} ${bank.close[0]}` : null,
      });
    }
  }
  heard.sort((a, b) => a.arrived - b.arrived);
  return { year, felt, heard };
}

/** The view in words, for the Mind's prompt. It takes the view and nothing else, so the truth can't reach it. */
export function describe(view: EarthView): string {
  const one = (x: number) => x.toFixed(1);
  const felt = view.felt.length
    ? view.felt.map((f) =>
        `- ${f.star}, ${one(f.d)} ly: at least ${one(f.minMass)} Earth masses, a year of ${Math.round(f.periodDays)} days, ` +
        `${f.a.toFixed(2)} AU out. Felt by ${f.by} in ${2040 + f.year}. It doesn't cross its star, so its size and air are unread.`).join("\n")
    : "- None. The planet hunters felt no new world by 2040.";
  const heard = view.heard.length
    ? view.heard.map((h) =>
        `- From ${h.star}, ${one(h.d)} ly: a ${h.move} that arrived at Year ${one(h.arrived)}, sent in ${Math.round(2040 + h.sent)}.` +
        (h.text ? ` It reads: "${h.text}"` : "")).join("\n")
    : "- Nothing. Earth has heard no one.";
  return `Worlds Earth has felt by their tug on their stars, as of Year ${one(view.year)}. From here a home and a natural world look the same:
${felt}

Signals Earth's watch has caught:
${heard}`;
}
