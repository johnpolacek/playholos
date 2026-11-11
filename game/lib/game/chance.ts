import { type Lead, lifeOf, type Odds, type Reading, starName } from "@/lib/game/leads";

// The chance that something lives at a lead, and that a mind arose there, as the Mind works them out from what Earth
// knows by this Year, never from the seed's truth: the Mind's word, read as a percent, widened by how little we have to
// go on. Numbers were allowed 2026-11-01, and each shows as a range, wide while we guess and narrow once we read.

/** Each word's middle, after the intelligence analysts' scale the words come from. "Unlikely" is a quarter, as about
 *  1 warm world in 4 has had life (Kipping 2025). */
const MIDDLE: Record<Odds, number> = {
  "almost no chance": 0.02,
  "very unlikely": 0.1,
  "unlikely": 0.25,
  "roughly even": 0.5,
  "likely": 0.75,
  "very likely": 0.9,
  "almost certain": 0.98,
};

/** What the chance rests on, from least to most, and how far either way it may be, in log-odds. */
const BASES = {
  tug: { say: "from its gravity", spread: 1.1 },
  glow: { say: "from its glow", spread: 0.9 },
  moves: { say: "from how it moves", spread: 0.8 },
  pull: { say: "from its pull", spread: 0.6 },
  silence: { say: "from its silence", spread: 0.6 },
  light: { say: "from its light", spread: 0.75 },
  air: { say: "air read", spread: 0.45 },
  close: { say: "seen up close", spread: 0.25 },
} as const;

/** Living worlds that reach animals, about 1 in 7: within 50 ly, about 36 living and a handful with animals. And 1
 *  world with animals in 10 makes a mind. Settled 2026-10-28 and 2026-10-31. */
const ANIMALS = 1 / 7;
const MINDS = 1 / 10;
/** How far either way the mind's chance may be beyond life's, for the steps from life to a mind no one has measured. */
const UNMEASURED = 0.8;

export interface Range {
  lo: number;
  hi: number;
}
export interface Chances {
  life?: Range;
  /** Unknown where we have nothing to go by, as at a black hole. */
  mind?: Range | "unknown";
  basis: string;
  /** 0 for a guess, 1 for seen up close: how sharp the band is drawn. */
  sure: number;
  /** A reading settled it: no life and no mind here. */
  ruledOut?: boolean;
}

const logit = (p: number) => Math.log(p / (1 - p));
const logistic = (x: number) => 1 / (1 + Math.exp(-x));
const around = (p: number, spread: number): Range => ({ lo: logistic(logit(p) - spread), hi: logistic(logit(p) + spread) });

/** A reading the latest first. */
const latest = (rs: readonly Reading[]) => [...rs].sort((a, b) => b.at - a.at);

function basisOf(lead: Lead, readings: readonly Reading[]) {
  if (readings.some((r) => r.sight) || lead.art.kind === "seed") return BASES.close;
  // Said as it was learned: air read only once a band of it was, and a world seen beside its star but too faint or too
  // close in to read rests on its light. One too close to split taught us nothing, and keeps its first basis. A blind
  // first-timer saw "air read" beside "its air stays unread". The Will's call, 2026-11-07.
  if (readings.some((r) => r.air?.split && [r.air.water, r.air.oxygen, r.air.ozone].some((g) => g !== undefined))) return BASES.air;
  if (readings.some((r) => r.air?.split)) return BASES.light;
  switch (lead.art.kind) {
    case "orbit":
      return lead.facts.some(([label]) => label === "It reflects") ? BASES.light : BASES.tug;
    case "glow":
    case "warm":
      return BASES.glow;
    case "near":
      return BASES.moves;
    case "dark":
    case "pair":
      return BASES.pull;
    case "reply":
      return BASES.silence;
    default:
      return BASES.light;
  }
}

/** A thing a lead could be that is a mind, or made by one. */
const MINDFUL = /\bmind\b|made|built|someone/i;

/** The Mind's word that a mind made what is here, when it rests on evidence: a reading's own odds, or a lead our
 *  sentinel has seen up close. Null when only the first guess stands. */
function madeByEvidence(lead: Lead, readings: readonly Reading[]): number | null {
  const now = latest(readings).find((r) => r.now.length)?.now;
  // Resolved from home by our Glow Imager counts as seen: it showed the panels themselves. Its page read "0.07 to 2%,
  // from its glow" under a drawing of what it had resolved. 2026-11-11.
  // And a sentinel wrecked as it arrived: something there met it, which is what a mind did. 2026-11-11.
  const close = lead.facts.some(([k]) => k === "Up close" || k === "Resolved" || k === "Our sentinel" || k === "It answered");
  if (!now && !close) return null;
  const words = lead.could.flatMap((c, i) => (MINDFUL.test(c.what) ? [now?.[i] ?? c.odds] : []));
  return words.length ? Math.max(...words.map((w) => MIDDLE[w])) : null;
}

/** The chance of life and of a mind at a lead, from its readings so far. Null where neither is the question. */
export function chancesOf(lead: Lead, readings: readonly Reading[]): Chances | null {
  // Settled: a warm glow read as dust holds no mind. Its band said 0.8 to 5% beside "nothing more for us to do here",
  // and a playtest couldn't tell which to believe. 2026-11-07.
  // By its light, a Close Reading's dust, or by its shape, our Glow Imager's cloud. 2026-11-11.
  const ruled = readings.find((r) => r.ruledOut);
  if (ruled) return { mind: { lo: 0, hi: 0 }, basis: ruled.id.endsWith("-imaged") ? "ruled out by its shape" : "ruled out by its light", sure: 1, ruledOut: true };
  const basis = basisOf(lead, readings);
  const word = lifeOf(lead, readings);
  const sure = 1 - (basis.spread - BASES.close.spread) / (BASES.tug.spread - BASES.close.spread);
  if (word) {
    const life = MIDDLE[word];
    const chain = life * ANIMALS * MINDS;
    // Hard evidence of something made, seen up close or read in what it did, outranks the steps up from life: the
    // watcher spoke to us in eleven languages and still showed a mind at 0.03 to 0.7%. Playtest 2026-11-07, the Will's
    // call. A glow seen only as a dot keeps the chain.
    const made = madeByEvidence(lead, readings);
    // Said as it was learned: seen up close only when it was. A watcher known only by its laser read "seen up close",
    // and a playtest caught it. 2026-11-07.
    const seen = basis === BASES.close || lead.facts.some(([k]) => k === "Up close");
    const resolved = !seen && lead.facts.some(([k]) => k === "Resolved");
    if (made !== null && made > chain) return { life: around(life, basis.spread), mind: around(made, BASES.close.spread), basis: seen ? "seen up close" : resolved ? "resolved from home" : "from what it did", sure: seen || resolved ? 1 : 0.8 };
    return { life: around(life, basis.spread), mind: around(chain, basis.spread + UNMEASURED), basis: basis.say, sure };
  }
  // A black hole: whether minds gather at them, no search has looked, so we have nothing to go by. 2026-11-01.
  if (lead.art.kind === "dark" || lead.art.kind === "pair") return { mind: "unknown", basis: "nothing to go by", sure: 0 };
  // A star we messaged and know nothing else of: about 1 star in 1,600 holds a mind, settled 2026-10-31.
  if (lead.art.kind === "reply") return { mind: around(1 / 1600, basis.spread), basis: basis.say, sure };
  // Not a world: the mind's chance is the Mind's word on whatever here a mind would have made.
  const now = latest(readings).find((r) => r.now.length)?.now;
  const words = lead.could.flatMap((c, i) => (MINDFUL.test(c.what) ? [now?.[i] ?? c.odds] : []));
  if (!words.length) return null;
  const mind = Math.max(...words.map((w) => MIDDLE[w]));
  // A warm glow our Glow Imager showed as a made ring rests on that, not on its glow. 2026-11-11.
  if (lead.facts.some(([k]) => k === "Resolved")) return { mind: around(mind, BASES.close.spread), basis: "resolved from home", sure: 1 };
  return { mind: around(mind, basis.spread), basis: basis.say, sure };
}

/** A percent as a screen shows it: whole from 1%, then tenths, then hundredths, and less than a hundredth as such. */
export function pct(p: number) {
  const x = p * 100;
  if (x >= 99.5) return ">99";
  if (x >= 9.5) return String(Math.round(x));
  if (x >= 1) return x.toFixed(0);
  if (x >= 0.1) return x.toFixed(1);
  if (x >= 0.01) return x.toFixed(2);
  return "<0.01";
}

/** A range as words: "11–47%", or one figure when both ends round the same. The Mind's say "11 to 47%", since it
 *  writes no dashes. */
export const rangeText = ({ lo, hi }: Range, to = "–") => (pct(lo) === pct(hi) ? `${pct(lo)}%` : `${pct(lo)}${to}${pct(hi)}%`);

/** Our chances at each lead, for the Mind, as Scan shows them. */
export function describeChances(leads: Lead[], readings: Record<string, Reading[]>): string {
  const lines = leads.flatMap((l) => {
    const c = chancesOf(l, readings[l.slug] ?? []);
    if (!c) return [];
    const mind = c.ruledOut ? "ruled out, no mind" : c.mind === "unknown" ? "a mind unknown" : c.mind && `a mind ${rangeText(c.mind, " to ")}`;
    const parts = [c.life && `life ${rangeText(c.life, " to ")}`, mind].filter(Boolean).join(", ");
    return [`- ${starName(l.star)}, ${l.what.toLowerCase()}: ${parts}, ${c.basis}.`];
  });
  return lines.length
    ? `Our chances, worked out from what Earth knows now, as Scan shows them. Each is a range, wide while we guess:\n${lines.join("\n")}`
    : "";
}
