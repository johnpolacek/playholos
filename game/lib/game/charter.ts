// Earth's charter: three dials and a founding line. History sets the dials, from HOLOS_GAME_CONCEPT.md's base and
// this game's branches, as the mocks' kit.py does. The Will may nudge each one notch either way. The dials shape the
// Mind's advice, never what Earth can build.

import type { EarthPast } from "./past";

/** Each dial's two ends, left to right. A dial reads 0 at its left end and 100 at its right. */
export const ENDS = [
  ["Open", "Hidden"],
  ["Expand", "Deepen"],
  ["Cautious", "Bold"],
] as const;

/** One notch: how far a branch moves a dial, and how far the Will may. */
export const NOTCH = 12;

/** Where real history to 2026 sets the dials: leans Open, near the middle, leans Bold. */
export const HISTORY = [35, 50, 62];

/** What set each dial, from real history. */
export const WHY = ["Radars · Arecibo · Voyager", "Apollo out · compute in", "The race for minds"];

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

/** The dials as history and the branches left them, before the Will's nudges. */
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

// Founding lines, each fitted to dial ends: -1 for the left end, 1 for the right, 0 for no pull. The first three
// are the mocks'. The rest are samples.
const LINES: [string, [number, number, number]][] = [
  ["We have always called out. Now find who answers.", [-1, 0, 1]],
  ["We were loud by accident. Be quiet on purpose.", [1, 0, 0]],
  ["We came close to ending ourselves. Look first, then speak as one.", [0, 0, -1]],
  ["Let them see us. We have nothing to hide.", [-1, 0, 0]],
  ["Share what we learn with anyone who listens.", [-1, 1, 0]],
  ["Watch first. Be seen only when we choose.", [1, 0, -1]],
  ["Go out. Every world we reach is one we keep.", [0, -1, 1]],
  ["Earth is a cradle. Leave it well.", [0, -1, 0]],
  ["Understand the sky before we touch it.", [0, 1, -1]],
  ["Know more before we go further.", [0, 1, 0]],
  ["Move first. Learn on the way.", [0, -1, 1]],
  ["Measure twice. Send once.", [1, 1, -1]],
];

/** The three lines the Mind offers, best fitted to the dials first. */
export function offers(dials: number[]) {
  const d = dials.map((v) => (v - 50) / 50);
  // The mocks' lines get a small edge, so the Mind leads with them where they fit.
  const fit = ([line, pull]: (typeof LINES)[number]) => {
    const used = pull.filter((p) => p !== 0).length;
    return pull.reduce((s, p, i) => s + p * d[i], 0) / used + (LINES.findIndex((l) => l[0] === line) < 3 ? 0.05 : 0);
  };
  return [...LINES]
    .sort((a, b) => fit(b) - fit(a))
    .slice(0, 3)
    .map(([line]) => line);
}

/** The Mind's answer to a nudge: how far from history the dial now sits. */
export function reply(dial: number, nudge: number) {
  if (nudge === 0) return "Back where our history set us.";
  const lines = [
    ["More open than our history. We’ll speak when it matters.", "Quieter than our history. We’ll keep our voice low."],
    [
      "Further out than our history. We’ll look for places to go.",
      "Deeper in than our history. We’ll look for things to know.",
    ],
    ["More careful than our history. We’ll look twice.", "Bolder than our history. We’ll act sooner."],
  ];
  return lines[dial][nudge < 0 ? 0 : 1];
}

/** The charter as the Mind reads it. */
export function describeCharter(line: string, dials: number[]) {
  const words = dials.map((v, i) => lean(i, v)).join(", ");
  return `Earth's charter. Founding line, chosen by the Will: "${line}". Dials: ${words} (Open or Hidden, Expand or Deepen, Cautious or Bold). Reason from these when the Will asks your view. They shape advice, never what Earth can build.`;
}
