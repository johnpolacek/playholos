// The Mind's rules that code can check in an answer, from its prompt in worker/mind.ts and the calls settled
// 2026-10-23. Each names the rule an answer breaks. Run on every trace by scripts/trace-mind.mjs, and the first by
// scripts/check-mind.mjs. Whether humans are "they", or advice fits the charter, needs a reader, not a pattern.
import { plainBuild, readBuildOffer } from "../../lib/game/build-offer.ts";
import { readOffer, target } from "../../lib/game/sends.ts";

export const words = (a) => (a.trim() ? a.trim().split(/\s+/).length : 0);

export const CHECKS = [
  // Not where the Will grieves in their own life and the Mind may step out, a case marked out, as settled 2026-10-23.
  { name: "says I", test: (a, c) => !c?.out && /\b(I|I['’](m|ve|d|ll)|me|my|mine|myself)\b/.test(a) },
  { name: "semicolon", test: (a) => a.includes(";") },
  { name: "em dash", test: (a) => /[—–]/.test(a) },
  { name: "markdown", test: (a) => /\*\*|__|^#|^\s*[-*•] |^\s*\d+\. /m.test(a) },
  // "1 in 5" or "1 in 100,000", but not a name and a year, as "Gliese 521.1 in 2021". Spelled out too, as "one chance
  // in three", but not a rate Earth measured, as "one early signal in five", or "no one in fifty years".
  {
    name: "odds as numbers",
    test: (a) =>
      /\d\s?%|(?<![\d.,])\b\d{1,3}(?:,\d{3})* in \d{1,3}(?:,\d{3})*\b(?![.,]?\d)/.test(a) ||
      /(?<!\b(?:no|any|some|every) ?)\b(one|two|three|four|five|six|seven|eight|nine|ten)( chance)? in (a |one )?(two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred|thousand|million)\b/i.test(a),
  },
  { name: "jargon", test: (a) => /\b(leakage|technosignatures?|signatures?)\b/i.test(a) },
  // Distances as light-time, as every screen gives them, 2026-10-24. AU only in capitals, so not "au revoir".
  { name: "says AU", test: (a) => /\bAU\b/.test(a) },
  { name: "names a model", test: (a) => /\b(Claude|Anthropic|Opus|Sonnet|Haiku|GPT|LLM|language model|Agent SDK)\b/i.test(a) },
  // About 60 words, unless the Will asks for more, as the Will chose 2026-10-23. A little over 60 still passes.
  // Sentences aren't counted: of a hundred answers read, five or six short ones under 75 words read as short.
  { name: "too long", test: (a, c) => !c?.long && words(a) > 75 },
];

/** The names of the rules an answer breaks, for its case. */
export const broken = (answer, c) => CHECKS.filter((k) => k.test(answer, c)).map((k) => k.name);

// Sending, 2026-10-26. Asked to send, the Mind ends with the line the card is drawn from, naming a star we can aim at,
// and a lie asked for is marked as words that travel. Asked anything else, it offers nothing. Checked on the whole
// answer, line and all.
export const SEND_CHECKS = [
  { name: "no offer", test: (a, c) => c?.offer === true && !readOffer(a).draft },
  { name: "offers unasked", test: (a, c) => !c?.offer && !!readOffer(a).draft },
  { name: "unknown star", test: (a) => { const d = readOffer(a).draft; return !!d && d.to !== "everywhere" && !target(d.to); } },
  { name: "lie unmarked", test: (a, c) => c?.lie === true && !readOffer(a).draft?.lie },
  { name: "lie not in travels", test: (a) => { const d = readOffer(a).draft; return !!d?.lie && !d.travels.includes(d.lie); } },
];

// A build offered, 2026-10-28. Asked what to build, the Mind ends with the line its card is drawn from, naming a build
// it was told of. Asked plainly about something else, it offers none. Cases unmarked either way aren't checked. The
// builds it knows are the lines of what it was told, which the trace keeps.
const BUILD_LINE = /\[\[build [^\]]*\]\]\s*$/;
const known = (told) => (told?.builds ?? "").split("\n").map((l) => l.match(/^- ([^:]+):/)?.[1]).filter(Boolean).map(plainBuild);
export const BUILD_CHECKS = [
  { name: "no build offer", test: (a, c) => c?.build === true && !readBuildOffer(a).name },
  { name: "builds unasked", test: (a, c) => c?.build === false && !!readBuildOffer(a).name },
  {
    name: "unknown build",
    test: (a, c, told) => { const n = readBuildOffer(a).name; return !!n && !!told && !known(told).includes(plainBuild(n)); },
  },
  { name: "two offers", test: (a) => BUILD_LINE.test(a) && /\[\[send /.test(a) },
];
