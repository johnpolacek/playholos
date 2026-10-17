// Earth's charter: a founding line, and the three dials it sets. History sets where the dials start, from
// HOLOS_GAME_CONCEPT.md's base and this game's branches, as the mocks' kit.py does. The dials shape the Mind's
// advice, never what Earth can build.

import type { EarthPast } from "./past";

/** Each dial's two ends, left to right. A dial reads 0 at its left end and 100 at its right. */
export const ENDS = [
  ["Open", "Hidden"],
  ["Expand", "Deepen"],
  ["Cautious", "Bold"],
] as const;

/** One notch: how far a branch moves a dial. */
export const NOTCH = 12;

/** Where real history to 2026 sets the dials: leans Open, near the middle, leans Bold. */
export const HISTORY = [35, 50, 62];

/** This game's branches, and the dial each moved. */
export function kicks(past: EarthPast): { dial: number; by: number; what: string }[] {
  const y = past.years;
  const out = [];
  if (past.taiwan === "invasion") out.push({ dial: 0, by: NOTCH, what: `${y.taiwan} · Taiwan war` });
  if (past.mars) out.push({ dial: 1, by: -NOTCH, what: `${y.mars} · Mars` });
  if (past.taiwan === "blockade") out.push({ dial: 2, by: -NOTCH, what: `${y.taiwan} · Taiwan blockade` });
  if (past.nuclear) out.push({ dial: 2, by: -NOTCH, what: `${y.nuclear} · a bomb used` });
  return out;
}

/** The dials as history and the branches left them, before the Will's line. */
export function base(past: EarthPast) {
  const d = [...HISTORY];
  for (const k of kicks(past)) d[k.dial] += k.by;
  return d;
}

export function lean(dial: number, v: number) {
  const [a, b] = ENDS[dial];
  if (v < 44) return `leans ${a.toLowerCase()}`;
  if (v > 56) return `leans ${b.toLowerCase()}`;
  return dial === 1 ? "even" : "near the middle";
}

/** The charter as the Mind reads it. */
export function describeCharter(line: string, dials: number[]) {
  const words = dials.map((v, i) => lean(i, v)).join(", ");
  return `Earth's charter. Founding line, chosen by the Will: "${line}". Dials: ${words} (Open or Hidden, Expand or Deepen, Cautious or Bold). Reason from these when the Will asks your view. They shape advice, never what Earth can build.`;
}

// "Our Charter": the Will picks a founding line, and the line is the setting. Each sets Earth's three dials, so
// the lines are spread across characters. The Mind leads with the four Earth's history fits best, and more wait
// behind them. Settled 2026-10-16, replacing the dials on screen. Writing your own was set aside 2026-10-17: every
// line needs a setting, so the Mind offers many instead.
export const CHARTERS: { line: string; pull: [number, number, number] }[] = [
  { line: "We have always called out. Now find who answers.", pull: [-1, 0, 1] },
  { line: "We were loud by accident. Be quiet on purpose.", pull: [1, 0, -1] },
  { line: "We came close to ending ourselves. Look first, then speak as one.", pull: [0, 0, -1] },
  { line: "Go out. Every world we reach is one we keep.", pull: [0, -1, 1] },
  { line: "Share what we learn with anyone who listens.", pull: [-1, 1, 0] },
  { line: "Understand the sky before we touch it.", pull: [0, 1, -1] },
  { line: "Ask every question. Fear none of the answers.", pull: [-1, 1, 1] },
  { line: "Listen far longer than we speak.", pull: [1, 1, 0] },
  { line: "Stay small, stay unseen, stay alive.", pull: [1, 0, -1] },
  { line: "Plant life on every world that can hold it.", pull: [0, -1, 0] },
  { line: "Make Earth a home worth keeping, then make more.", pull: [0, 1, 0] },
  { line: "If anyone is out there, let them find a friend.", pull: [-1, 0, 0] },
  { line: "The window is open now. Go through it.", pull: [0, -1, 1] },
  { line: "Learn the rules of the sky before we play by them.", pull: [1, 1, -1] },
  { line: "Speak first, so no one has reason to fear us.", pull: [-1, 0, 1] },
  { line: "Think deeper before we reach further.", pull: [0, 1, 0] },
  { line: "Build quietly, and build far.", pull: [1, -1, 0] },
  { line: "Be bold with what we know, careful with what we don't.", pull: [0, 0, 1] },
  { line: "Our children's children will judge what we choose today.", pull: [0, 0, -1] },
  { line: "Wherever we go, go together.", pull: [0, -1, -1] },
];

/** How far a line moves a dial from the middle. */
const SWAY = 22;

/** The dials a line sets. Where it has no pull, the dial stays where history left it. */
export function dialsFor(pull: number[], history: number[]) {
  return pull.map((p, i) => (p === 0 ? history[i] : 50 + p * SWAY));
}

/** Every line, the ones Earth's history fits best first. The screen shows four at a time and cycles through the rest. */
export function suggest(past: EarthPast) {
  const d = base(past).map((v) => (v - 50) / 50);
  const fit = (pull: number[]) => pull.reduce((s, p, i) => s + p * d[i], 0) / pull.filter((p) => p !== 0).length;
  return [...CHARTERS].sort((a, b) => fit(b.pull) - fit(a.pull));
}
