import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { runChecks, tally } from "./playtest-checks.mjs";
import { povs } from "./regime.mjs";

// npm run playtest:score playtests/<folder>: adds the code ratings to a playtest's scores.json, writes SCORECARD.md
// beside it and prints the trend across past runs. The ratings and anchors live in playtests/regime.html. 2026-11-06.

// The players and their ratings come from the regime, playtests/regime.html. 2026-11-08.
const POVS = povs();

const root = fileURLToPath(new URL("../playtests/", import.meta.url));

const git = (...a) => {
  try {
    return execFileSync("git", a, { cwd: join(root, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
};

// A run is a folder here, or one on a pushed playtest branch: cloud runs live only on their branch.
const local = (dir) => (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : null);
const onBranch = (ref, name) => (f) => git("show", `${ref}:playtests/${name}/${f}`);

const readLog = (read, file = "log.jsonl") => {
  const text = read(file);
  if (!text) return [];
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        throw new Error(`${file}:${i + 1} is not JSON`);
      }
    });
};

// Pacing: the share of Next stops with something new, times 10.
const pacing = (log) => {
  const stops = log.filter((e) => e.t === "next");
  if (!stops.length) return { score: null, why: "No Next stops in log.jsonl." };
  const news = stops.filter((e) => e.news).length;
  return {
    score: Math.round((10 * news) / stops.length),
    why: `${news} of ${stops.length} Next stops brought something new.`,
    evidence: ["log.jsonl"],
  };
};

// The blind player's three code ratings, from its think-aloud log: how many of the six first goals it found, how
// often it knew what to do, and how often the game did what it expected.
const GOALS = ["began", "build", "lead", "mind", "jump", "send"];
const strict = (bad, all) => Math.max(0, Math.round(10 * (10 - (25 * bad) / all)) / 10);
const blindRatings = (steps) => {
  if (!steps.length) return {};
  const firsts = GOALS.filter((g) => steps.some((s) => s.first === g));
  const stuck = steps.filter((s) => s.stuck).length;
  const judged = steps.filter((s) => typeof s.match === "boolean");
  const matched = judged.filter((s) => s.match).length;
  const ev = ["blind.jsonl"];
  return {
    reach: { score: Math.round((10 * firsts.length) / GOALS.length), why: `Found ${firsts.length} of ${GOALS.length} first goals${firsts.length < GOALS.length ? `, never ${GOALS.filter((g) => !firsts.includes(g)).join(", ")}` : ""}.`, evidence: ev },
    // Each percent of steps stuck or surprised costs a quarter point: a share of steps rounded to 10 out of 10 at 7
    // stuck in 149, with no room left to climb. 2026-11-07.
    sure: { score: strict(stuck, steps.length), why: `Stuck on ${stuck} of ${steps.length} steps.`, evidence: ev },
    expect: judged.length
      ? { score: strict(judged.length - matched, judged.length), why: `The game did what it expected ${matched} of ${judged.length} times.`, evidence: ev }
      : { score: null, why: "No expectations judged." },
  };
};

const mean = (xs) => {
  const ok = xs.filter((x) => typeof x === "number");
  return ok.length ? Math.round((10 * ok.reduce((a, b) => a + b, 0)) / ok.length) / 10 : null;
};

/** Reads a folder's scores, with the code ratings filled in, or null when it has none. */
const load = (read) => {
  const text = read("scores.json");
  if (!text) return null;
  const scores = JSON.parse(text);
  scores["long-hauler"] = { ...scores["long-hauler"], pacing: pacing(readLog(read)) };
  // A check-in line, {"t":"checkin"}, is an answer, not a step. 2026-11-08.
  const blind = readLog(read, "blind.jsonl").filter((s) => !s.t);
  if (blind.length) scores.blind = { ...scores.blind, ...blindRatings(blind) };
  // A run rates only the players it had: a feature playtest has no blind player, and a blind run none of the rest.
  for (const p of Object.keys(POVS)) if (!scores[p] || !Object.values(scores[p]).some((r) => typeof r?.score === "number")) delete scores[p];
  const avg = {};
  for (const [pov, keys] of Object.entries(POVS)) avg[pov] = mean(keys.map((k) => scores[pov]?.[k]?.score));
  // Overall is the three feature-test players. The blind player stands apart: it plays a different run.
  avg.overall = mean(["first-timer", "astronomer", "long-hauler"].map((p) => avg[p]));
  // The code checks over the log, scripts/playtest-checks.mjs. 2026-11-08.
  const checks = runChecks(readLog(read), scores);
  return { scores, avg, checks, tally: tally(checks) };
};

const fmt = (x) => (x == null ? "–" : String(x));

const card = (name, { scores, avg, checks, tally: t }) => {
  const lines = [`# Scorecard, ${name}`, "", `Build \`${scores.build ?? "?"}\`. Overall **${fmt(avg.overall)}** of 10.`, ""];
  if (scores.scenario || scores.seed) lines.push(`Scenario ${scores.scenario ?? "?"}, seed ${scores.seed ?? "?"}.`, "");
  // Time and tokens, from scripts/run-cost.mjs. 2026-11-08.
  const c = scores.cost;
  if (c) {
    const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);
    const who = [c.player && `player ${k(c.player.total)}`, ...Object.entries(c.readers ?? {}).map(([s, r]) => `${s} ${k(r.total)}`)].filter(Boolean).join(", ");
    lines.push(`Took ${c.minutes ?? "?"} min and ${k(c.total)} tokens, ${k(c.output)} output: ${who}. The Mind's own answers aren't counted.`, "");
  }
  lines.push(`## Checks: ${t.ran - t.failed} of ${t.ran} pass`, "", "| Check | Result | Lines |", "|---|---|---|");
  for (const c of checks) {
    const result = !c.fails ? "not run" : c.fails.length ? `**fail** ×${c.fails.length}` : "pass";
    const where = (c.fails ?? []).slice(0, 5).map((f) => (f.line ? `${f.line}: ${f.text}` : f.text).replace(/\|/g, "/")).join("<br>");
    lines.push(`| ${c.name} | ${result} | ${where} |`);
  }
  lines.push("");
  for (const [pov, keys] of Object.entries(POVS)) {
    if (!scores[pov]) continue;
    lines.push(`## ${pov}: ${fmt(avg[pov])}`, "", "| Rating | Score | Why | Evidence |", "|---|---|---|---|");
    for (const k of keys) {
      const r = scores[pov]?.[k];
      if (!r) {
        lines.push(`| ${k} | missing | | |`);
        continue;
      }
      const ev = (r.evidence ?? []).map((e) => (/\.(png|jpe?g)$/i.test(e) ? `[${e}](${e})` : e)).join(", ");
      lines.push(`| ${k} | ${fmt(r.score)} | ${(r.why ?? "").replace(/\|/g, "/")} | ${ev} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
};

const arg = process.argv[2];
if (arg) {
  const dir = existsSync(arg) ? arg : join(root, arg);
  const run = load(local(dir));
  if (!run) {
    console.error(`No scores.json in ${dir}. Rate the run per playtests/regime.html first: node scripts/regime.mjs players.`);
    process.exit(1);
  }
  const missing = Object.entries(POVS).flatMap(([p, ks]) => (run.scores[p] ? ks.filter((k) => !run.scores[p][k]).map((k) => `${p} ${k}`) : []));
  if (missing.length) console.warn(`Missing ratings: ${missing.join(", ")}`);
  for (const c of run.checks.filter((c) => c.fails?.length)) {
    console.warn(`Check failed: ${c.name}`);
    for (const f of c.fails.slice(0, 5)) console.warn(`  ${f.line ? `log.jsonl:${f.line} ` : ""}${f.text}`);
  }
  writeFileSync(join(dir, "SCORECARD.md"), card(basename(dir), run));
  console.log(`Wrote ${join(dir, "SCORECARD.md")}\n`);
}

// The trend: every scored run, here or on a pushed playtest/ branch, oldest first.
const found = new Map();
for (const d of readdirSync(root, { withFileTypes: true }))
  if (d.isDirectory()) found.set(d.name, local(join(root, d.name)));
git("fetch", "--quiet", "origin", "+refs/heads/playtest/*:refs/remotes/origin/playtest/*");
for (const ref of (git("for-each-ref", "--format=%(refname:short)", "refs/remotes/origin/playtest/") ?? "").split("\n").filter(Boolean))
  for (const name of (git("ls-tree", "--name-only", `${ref}:playtests/`) ?? "").split("\n").filter(Boolean))
    if (!found.has(name) && git("cat-file", "-e", `${ref}:playtests/${name}/scores.json`) !== null) found.set(name, onBranch(ref, name));
const runs = [...found.keys()]
  .sort()
  .map((name) => ({ name, run: load(found.get(name)) }))
  .filter((r) => r.run);
const cols = ["first-timer", "astronomer", "long-hauler", "blind", "overall"];
const checked = ({ ran, failed }) => (ran ? `${ran - failed}/${ran}` : "–");
console.log(["run".padEnd(18), "build".padEnd(8), "scenario".padEnd(14), ...cols.map((c) => c.padStart(12)), "checks".padStart(8)].join(" "));
for (const { name, run } of runs)
  console.log(
    [name.padEnd(18), String(run.scores.build ?? "?").padEnd(8), String(run.scores.scenario ?? "–").padEnd(14), ...cols.map((c) => fmt(run.avg[c]).padStart(12)), checked(run.tally).padStart(8)].join(" "),
  );
if (!runs.length) console.log("No scored runs yet.");
// For the regime page, playtests/regime.html, as a script it loads, so the page opens straight from the file. 2026-11-08.
writeFileSync(
  join(root, "runs.js"),
  "window.RUNS = " +
  JSON.stringify(
    runs.map(({ name, run }) => ({
      name,
      build: run.scores.build ?? null,
      scenario: run.scores.scenario ?? null,
      seed: run.scores.seed ?? null,
      replay: !!run.scores.replay,
      minutes: run.scores.cost?.minutes ?? null,
      tokens: run.scores.cost?.total ?? null,
      avg: run.avg,
      tally: run.tally,
      checks: run.checks.map((c) => ({ name: c.name, fails: c.fails && c.fails.slice(0, 5) })),
    })),
  ) +
    ";\n",
);
// --strict: exit 1 when the run named fails a check, so a routine can stop on it.
if (arg && process.argv.includes("--strict")) {
  const dir = existsSync(arg) ? arg : join(root, arg);
  if (load(local(dir))?.tally.failed) process.exit(1);
}
