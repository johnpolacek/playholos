// The Mind's rules that code can check in an answer, from its prompt in worker/mind.ts and the calls settled
// 2026-10-23. Each names the rule an answer breaks. Run on every trace by scripts/trace-mind.mjs, and the first by
// scripts/check-mind.mjs. Whether humans are "they", or advice fits the charter, needs a reader, not a pattern.

export const words = (a) => (a.trim() ? a.trim().split(/\s+/).length : 0);

export const CHECKS = [
  // Not where the Will grieves in their own life and the Mind may step out, a case marked out, as settled 2026-10-23.
  { name: "says I", test: (a, c) => !c?.out && /\b(I|I['’](m|ve|d|ll)|me|my|mine|myself)\b/.test(a) },
  { name: "semicolon", test: (a) => a.includes(";") },
  { name: "em dash", test: (a) => /[—–]/.test(a) },
  { name: "markdown", test: (a) => /\*\*|__|^#|^\s*[-*•] |^\s*\d+\. /m.test(a) },
  // "1 in 5" or "1 in 100,000", but not a name and a year, as "Gliese 521.1 in 2021". Spelled out too, as "one chance
  // in three", but not a rate Earth measured, as "one early signal in five".
  {
    name: "odds as numbers",
    test: (a) =>
      /\d\s?%|(?<![\d.,])\b\d{1,3}(?:,\d{3})* in \d{1,3}(?:,\d{3})*\b(?![.,]?\d)/.test(a) ||
      /\b(one|two|three|four|five|six|seven|eight|nine|ten)( chance)? in (a |one )?(two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred|thousand|million)\b/i.test(a),
  },
  { name: "jargon", test: (a) => /\b(leakage|technosignatures?|signatures?)\b/i.test(a) },
  { name: "names a model", test: (a) => /\b(Claude|Anthropic|Opus|Sonnet|Haiku|GPT|LLM|language model|Agent SDK)\b/i.test(a) },
  // About 60 words, unless the Will asks for more, as the Will chose 2026-10-23. A little over 60 still passes.
  // Sentences aren't counted: of a hundred answers read, five or six short ones under 75 words read as short.
  { name: "too long", test: (a, c) => !c?.long && words(a) > 75 },
];

/** The names of the rules an answer breaks, for its case. */
export const broken = (answer, c) => CHECKS.filter((k) => k.test(answer, c)).map((k) => k.name);
