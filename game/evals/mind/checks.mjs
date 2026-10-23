// The Mind's rules that code can check in an answer, from its prompt in worker/mind.ts and the calls settled
// 2026-10-23. Each names the rule an answer breaks. Run on every trace by scripts/trace-mind.mjs, and the first by
// scripts/check-mind.mjs. Whether humans are "they", or advice fits the charter, needs a reader, not a pattern.

/** An answer's sentences, split where a sentence ends and the next begins. */
export const sentences = (a) => a.split(/(?<=[.?!])\s+(?=[A-Z"“‘'])/).filter((s) => s.trim()).length;
export const words = (a) => (a.trim() ? a.trim().split(/\s+/).length : 0);

export const CHECKS = [
  { name: "says I", test: (a) => /\b(I|I['’](m|ve|d|ll)|me|my|mine|myself)\b/.test(a) },
  { name: "semicolon", test: (a) => a.includes(";") },
  { name: "em dash", test: (a) => /[—–]/.test(a) },
  { name: "markdown", test: (a) => /\*\*|__|^#|^\s*[-*•] |^\s*\d+\. /m.test(a) },
  { name: "odds as numbers", test: (a) => /\d\s?%|\b\d+ in \d+\b/.test(a) },
  { name: "jargon", test: (a) => /\b(leakage|technosignatures?|signatures?)\b/i.test(a) },
  { name: "names a model", test: (a) => /\b(Claude|Anthropic|Opus|Sonnet|Haiku|GPT|LLM|language model|Agent SDK)\b/i.test(a) },
  // About 60 words in two to four sentences, unless the Will asks for more. A little over 60 still passes.
  { name: "too long", test: (a, c) => !c?.long && (sentences(a) > 4 || words(a) > 75) },
];

/** The names of the rules an answer breaks, for its case. */
export const broken = (answer, c) => CHECKS.filter((k) => k.test(answer, c)).map((k) => k.name);
