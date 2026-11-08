import { CHECKS } from "../game/evals/mind/checks.mjs";

// Rules a playtest's log can be checked against by code, the same answer every time, so a score never rests only on a
// player's opinion. Run by scripts/playtest-score.mjs on every run it reads. Each check takes the run's log.jsonl lines
// and its scores.json, and returns the lines that break it, or null when the run gave it nothing to check. 2026-11-08.

// The Mind's own rules that hold for any answer, from evals/mind/checks.mjs. Length and markdown are left out: a
// logged answer carries the card the Mind drew, with its buttons.
const MIND_RULES = ["says I", "semicolon", "em dash", "jargon", "says AU", "can't see the screen", "names a model"];

/** The Mind's words in a logged answer, without the chat's own labels or a harness note like “[card: …]”. */
const said = (a) =>
  String(a ?? "")
    .replace(/\[(card|note|harness)\b[^\]]*\]/gi, "")
    .replace(/^THE MIND\s*/, "")
    .replace(/\s*↑\s*$/, "")
    .trim();
const sentences = (text) => String(text ?? "").split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim());

// One distance in light-years, not the end of a range: "about 900 light-years", not "14,000 to 28,000 ly".
const ONE_DISTANCE = /(?<![\d,.]\s*(?:to|–|-)\s*)(?<![\d,.])\d[\d,.]*\s*(?:light-years?|ly)\b/i;
// A glow or a find called a mind outright, with no doubt in the sentence.
const CLAIMS_MIND = /\b(it|this|that|the glow|warm glow \d+|cold glow \d+)\s+(is|must be)\s+(definitely |certainly |clearly |surely )?(a|an)\s+(mind|civili[sz]ation|alien)/i;
const DOUBT = /\b(could|may|might|if|whether|not|unlikely|likely|odds|chance|perhaps|maybe)\b|%/i;

const SLOW_SECS = 30;

/** Every text a player saw in the log that the game or the Mind wrote, with where it came from. */
const texts = (log) =>
  log.flatMap((e, i) => {
    const line = i + 1;
    if (e.t === "mind") return [{ line, from: "mind", text: said(e.a) }];
    if (e.t === "next" && e.what) return [{ line, from: "next", text: String(e.what) }];
    return [];
  });

export const RUN_CHECKS = [
  {
    name: "build named",
    why: "scores.json names the build it played, so the trend can tie a score to code.",
    test: (log, scores) => (!scores ? null : !scores.build || scores.build === "?" ? [{ line: 0, text: "no build hash" }] : []),
  },
  {
    name: "no console errors",
    why: "The game logged no console errors.",
    test: (log) => (!log.length ? null : log.flatMap((e, i) => (e.t === "error" ? [{ line: i + 1, text: String(e.text).slice(0, 160) }] : []))),
  },
  {
    name: "Next goes forward",
    why: "Every Next stop lands later than where it left.",
    test: (log) => {
      const stops = log.map((e, i) => ({ e, line: i + 1 })).filter(({ e }) => e.t === "next" && typeof e.from === "number" && typeof e.year === "number");
      if (!stops.length) return null;
      return stops.filter(({ e }) => !(e.year > e.from)).map(({ e, line }) => ({ line, text: `Year ${e.from} to ${e.year}` }));
    },
  },
  {
    name: "Mind answers",
    why: `The Mind answered every question, in words, within ${SLOW_SECS} seconds.`,
    test: (log) => {
      const asks = log.map((e, i) => ({ e, line: i + 1 })).filter(({ e }) => e.t === "mind");
      if (!asks.length) return null;
      return asks.flatMap(({ e, line }) => {
        const words = said(e.a).split(/\s+/).filter(Boolean).length;
        if (words < 3) return [{ line, text: `empty answer to “${e.q}”` }];
        if (typeof e.secs === "number" && e.secs > SLOW_SECS) return [{ line, text: `${e.secs} s for “${e.q}”` }];
        return [];
      });
    },
  },
  ...MIND_RULES.map((rule) => ({
    name: `Mind: ${rule}`,
    why: `No answer breaks the Mind's rule “${rule}”, from game/evals/mind/checks.mjs.`,
    test: (log) => {
      const asks = log.map((e, i) => ({ e, line: i + 1 })).filter(({ e }) => e.t === "mind");
      if (!asks.length) return null;
      const check = CHECKS.find((c) => c.name === rule);
      return asks.filter(({ e }) => check.test(said(e.a), {})).map(({ e, line }) => ({ line, text: said(e.a).slice(0, 160) }));
    },
  })),
  {
    name: "warm glows ranged",
    why: "A warm glow's distance is a range, never one number, in the Mind and at every stop.",
    test: (log) => {
      const all = texts(log);
      if (!all.some(({ text }) => /warm glow/i.test(text))) return null;
      return all.flatMap(({ line, text }) =>
        sentences(text)
          .filter((s) => /warm glow/i.test(s) && ONE_DISTANCE.test(s))
          .map((s) => ({ line, text: s.slice(0, 160) })),
      );
    },
  },
  {
    name: "no claimed mind",
    why: "Nothing calls a find a mind outright, without doubt in the same sentence.",
    test: (log) => {
      const all = texts(log);
      if (!all.length) return null;
      return all.flatMap(({ line, text }) =>
        sentences(text)
          .filter((s) => CLAIMS_MIND.test(s) && !DOUBT.test(s))
          .map((s) => ({ line, text: s.slice(0, 160) })),
      );
    },
  },
  {
    name: "scenario expectations",
    why: "Every expectation the scenario lists, in playtests/regime.html, that the run reached, held.",
    test: (log) => {
      const checked = log.map((e, i) => ({ e, line: i + 1 })).filter(({ e }) => e.t === "expect" && e.pass !== null && e.pass !== undefined);
      if (!checked.length) return null;
      return checked.filter(({ e }) => !e.pass).map(({ e, line }) => ({ line, text: `${e.id}: ${e.note ?? ""}`.slice(0, 160) }));
    },
  },
];

/** Each check's result for a run: `fails` is null when the run gave it nothing to check. */
export const runChecks = (log, scores) => RUN_CHECKS.map((c) => ({ name: c.name, why: c.why, fails: c.test(log, scores) }));

/** How many checks ran, and how many of those failed. */
export const tally = (results) => {
  const ran = results.filter((r) => r.fails);
  return { ran: ran.length, failed: ran.filter((r) => r.fails.length).length };
};
