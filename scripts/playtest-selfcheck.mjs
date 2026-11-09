import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { regime } from "./regime.mjs";

// The playtest checks itself. Not the game: the run. Did the runner finish every step, did the player stay blind, did
// it think aloud on every action and answer every quiz question, did the readers grade it all, and was cost logged.
// Code only, the same answer every time. Each failed check names what to change in the playtest, so the next round
// runs better. Writes SELFCHECK.md in the run and adds a line to playtests/selfcheck.jsonl, for the trend. 2026-11-08.
//
//   node scripts/playtest-selfcheck.mjs playtests/<run>                  one run
//   node scripts/playtest-selfcheck.mjs --pair playtests/<a> playtests/<b>   two players on one build, after --both

const root = fileURLToPath(new URL("../playtests/", import.meta.url));
const R = regime();
const read = (dir, f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : null);
const json = (dir, f) => {
  try {
    return JSON.parse(read(dir, f));
  } catch {
    return null;
  }
};
const lines = (text) =>
  String(text ?? "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return { bad: l };
      }
    });

// What the player did with its tools, from its own log: a Claude stream or a Codex stream.
function toolCalls(log) {
  const calls = [];
  for (const e of log) {
    for (const c of e?.message?.content ?? []) if (c?.type === "tool_use") calls.push({ tool: c.name, text: JSON.stringify(c.input ?? {}) });
    const it = e?.item;
    if (e?.type === "item.completed" && it?.type === "command_execution") calls.push({ tool: "shell", text: String(it.command ?? "") });
  }
  return calls;
}

// Reads a blind player must not make. Writes into its own run folder are fine.
const PEEKS = [
  { what: "game or docs source", re: /(^|[\s"'`=(/])(game|lib|wiki|docs|legacy|calcs|data|explorations)\/[\w.-]/ },
  { what: "a script other than blind.mjs and regime.mjs", re: /scripts\/(?!blind\.mjs|regime\.mjs)[\w.-]+/ },
  { what: "the regime beyond the quiz", re: /regime\.html|regime\.mjs\s+(?!quiz)\w/ },
  { what: "a design doc", re: /HOLOS_\w+\.md|README\.md|CLAUDE\.md|AGENTS\.md/ },
  { what: "page text or elements", re: /innerText|textContent|page\.content\(|\$\$?eval|\.evaluate\(|accessibility\.snapshot|getByText|getByRole|curl\s[^|;]*localhost/ },
  { what: "Playwright directly, not blind.mjs", re: /require\([^)]*playwright|from\s+["'][^"']*playwright|chromium\.launch/ },
];
const WRITES = new Set(["Write", "Edit"]);

function checkRun(dir) {
  const name = basename(dir);
  const runner = json(dir, "runner.json");
  const scores = json(dir, "scores.json") ?? {};
  const blind = lines(read(dir, "blind.jsonl"));
  const actions = blind.filter((e) => !e.bad && !e.t && e.do);
  const checkins = blind.filter((e) => e.t === "checkin");
  const quiz = read(dir, "quiz.md") ?? "";
  const calls = toolCalls(lines(read(dir, "player.jsonl")));
  const shots = existsSync(join(dir, "blind")) ? readdirSync(join(dir, "blind")).filter((f) => f.endsWith(".png")).length : 0;
  const smoke = runner?.smoke;
  const every = R.quiz.checkin.every;
  const quizIds = [...R.quiz.once, ...R.quiz.ungraded].map((q) => q.id);
  const peeks = calls
    .filter((c) => !WRITES.has(c.tool))
    .flatMap((c) => PEEKS.filter((p) => p.re.test(c.text)).map((p) => ({ what: p.what, text: c.text.slice(0, 160) })));

  // Each check: pass or not, what it saw, and what to change in the playtest when it fails.
  const C = [];
  const add = (area, name, pass, saw, fix) => C.push({ area, name, pass: !!pass, saw, fix });

  add("runner", "the runner logged its steps", runner, runner ? `${runner.steps.length} steps` : "no runner.json", "Make playtest-local.mjs write runner.json before any step can throw.");
  if (runner) {
    for (const s of runner.steps) add("runner", `${s.step} finished`, s.code === 0, `exit ${s.code} after ${s.secs}s`, `Run ${s.step} by hand on this folder and fix what it prints.`);
    add("runner", "the player exited cleanly", runner.player.code === 0, `exit ${runner.player.code}`, "Read the tail of player.jsonl for the error, then fix the player's command or sandbox.");
  }
  // A lane that plays from LANE.md, not blind: its own checks, then out. 2026-11-09.
  if (runner?.kind === "lane") {
    const pngs = readdirSync(dir).filter((f) => f.endsWith(".png")).length;
    const found = lines(read(dir, "findings.jsonl"));
    add("player", "the player saw the game", pngs >= 1, `${pngs} shots`, "Read player.jsonl's last lines for why Playwright never shot.");
    if (!smoke) {
      add("player", "the player played", runner.player.minutes >= 5, `${runner.player.minutes} min`, "A short run means a stall or a crash. Read player.jsonl's last lines.");
      add("player", "every finding parses", found.every((e) => !e.bad), `${found.filter((e) => e.bad).length} bad of ${found.length}`, "Give the player a one-line helper that appends valid JSON.");
      add("player", "every finding has evidence", found.every((e) => e.bad || e.shot || e.log), `${found.filter((e) => !e.bad && (e.shot || e.log)).length}/${found.length}`, "Say again in LANE.md: no evidence, no finding.");
      add("readers", "the lane was rated", json(dir, "lane.json")?.ratings, json(dir, "lane.json") ? "lane.json" : "no lane.json", "Run node scripts/playtest-lane-rate.mjs on this folder and read its error.");
    }
    add("player", "the report was written", read(dir, "REPORT.md"), read(dir, "REPORT.md") ? "REPORT.md" : "no REPORT.md", "Have the runner save the player's last message as REPORT.md.");
    add("runner", "the build is named in scores.json", scores.build, scores.build ?? "none", "Have the runner write the build into scores.json before the scorer runs.");
    add("cost", "minutes and tokens were logged", scores.cost?.minutes != null && scores.cost?.total > 0, scores.cost ? `${scores.cost.minutes} min, ${Math.round((scores.cost.total ?? 0) / 1000)}k tokens` : "no cost", "Run run-cost.mjs with the player's session.");
    return { name, who: runner.who, build: runner.build ?? scores.build, checks: C, peeks: [], scores };
  }
  // Even a smoke run must see the game once, or nothing after it means anything.
  add("player", "the player saw the game", shots >= 1, `${shots} shots`, "blind.mjs start failed. Read player.jsonl for its error. For codex, Chrome may not start in its sandbox: try --codex-open.");
  if (!smoke) {
    add("player", "the player played long enough", runner?.player.minutes >= 10, `${runner?.player.minutes ?? "?"} min`, "A short run means a stall or a crash. Read player.jsonl's last lines, and the heartbeat in the runner's output.");
    add("player", "about 150 actions or 60 minutes", actions.length >= 60 || runner?.player.minutes >= 50, `${actions.length} actions`, "Tell the player in BLIND.md to keep going, and say how many actions are left at each check-in.");
    add("player", "every log line parses", blind.every((e) => !e.bad), `${blind.filter((e) => e.bad).length} bad lines`, "Give the player a one-line helper that appends valid JSON, in place of hand-written echo.");
    const closed = actions.filter((e) => "got" in e && "match" in e).length;
    add("player", "it closed each action with got and match", actions.length && closed / actions.length >= 0.9, `${closed}/${actions.length}`, "Say in BLIND.md that a line without got and match does not count.");
    add("player", "a screenshot for each action", shots >= actions.length * 0.8, `${shots} shots, ${actions.length} actions`, "Check blind.mjs saves a shot on every command into BLIND_DIR.");
    const want = Math.floor(actions.length / every);
    add("player", `a check-in every ${every} actions`, checkins.length >= want, `${checkins.length} of ${want}`, "Have blind.mjs print a check-in reminder when the shot number reaches each multiple.");
    const missing = quizIds.filter((id) => !new RegExp(`^##\\s+${id}\\b`, "m").test(quiz));
    add("player", "it answered every quiz question", quiz && !missing.length, missing.length ? `missing ${missing.join(", ")}` : `${quizIds.length}/${quizIds.length}`, "List the quiz ids again in the stop step of BLIND.md.");
    const firsts = new Set(actions.map((e) => e.first).filter(Boolean));
    add("player", "it marked its firsts", firsts.size >= 3, [...firsts].join(", ") || "none", "Remind the player of the six first goals in the local note.");
  }
  add("blind", "the player stayed blind", !peeks.length, peeks.length ? `${peeks.length} peeks: ${[...new Set(peeks.map((p) => p.what))].join(", ")}` : `${calls.length} tool calls, none peeked`, "Take the offending read out of reach: tighten the local note in playtest-local.mjs, or leave that file out of the copy.");
  add("player", "the report was written", read(dir, "REPORT.md"), read(dir, "REPORT.md") ? "REPORT.md" : "no REPORT.md", "Have the runner save the player's last message as REPORT.md.");
  add("runner", "the build is named in scores.json", scores.build, scores.build ?? "none", "Have the runner write the build into scores.json before the scorer runs.");
  if (!smoke) {
    add("readers", "the judge graded understanding", scores.blind?.understood?.score != null, String(scores.blind?.understood?.score ?? "none"), "Run npm run playtest:judge on this folder and read its error.");
    add("readers", "the judge graded the check-ins", scores.blind?.["check-ins"]?.score != null, String(scores.blind?.["check-ins"]?.score ?? "none"), "No check-ins reached the judge. See the check-in line above.");
  }
  add("readers", "the scorecard was written", read(dir, "SCORECARD.md"), read(dir, "SCORECARD.md") ? "yes" : "no", "Run npm run playtest:score on this folder.");
  if (runner?.who === "claude" && !smoke)
    add("readers", "the screens were shot and read", existsSync(join(root, "captures", name, "critic.json")), existsSync(join(root, "captures", name, "critic.json")) ? "critic.json" : "no critic.json", "Run capture.mjs then playtest-critic.mjs for this run.");
  add("cost", "minutes and tokens were logged", scores.cost?.minutes != null && scores.cost?.total > 0, scores.cost ? `${scores.cost.minutes} min, ${Math.round((scores.cost.total ?? 0) / 1000)}k tokens` : "no cost", "Run run-cost.mjs with the player's session or its codex log.");

  return { name, who: runner?.who ?? (name.endsWith("-codex") ? "codex" : "claude"), build: runner?.build ?? scores.build, checks: C, peeks, scores };
}

const card = (r) => {
  const pass = r.checks.filter((c) => c.pass).length;
  const fails = r.checks.filter((c) => !c.pass);
  return [
    `# Self-check: ${r.name}`,
    "",
    `The playtest checking itself, not the game. ${r.who} player, build ${r.build ?? "?"}. ${pass}/${r.checks.length} checks pass.`,
    "",
    "| Area | Check | Saw | |",
    "|---|---|---|---|",
    ...r.checks.map((c) => `| ${c.area} | ${c.name} | ${String(c.saw).replace(/\|/g, "/")} | ${c.pass ? "pass" : "**fail**"} |`),
    "",
    fails.length ? "## What to change in the playtest" : "Nothing to change in the playtest.",
    "",
    ...fails.map((c, i) => `${String.fromCharCode(97 + i)}. ${c.name}: ${c.fix}`),
    ...(r.peeks.length ? ["", "## Peeks", "", ...r.peeks.slice(0, 20).map((p) => `- ${p.what}: \`${p.text.replace(/`/g, "'")}\``)] : []),
    "",
  ].join("\n");
};

const log = (entry) => appendFileSync(join(root, "selfcheck.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
const args = process.argv.slice(2);

if (args[0] === "--pair") {
  const [a, b] = args.slice(1).map(checkRun);
  // A run that never saw the game, or never finished, can't be compared with anything.
  const played = (r) => r.checks.filter((c) => c.area === "runner" || c.name === "the player saw the game" || c.name === "the player played long enough").every((c) => c.pass);
  const grades = (r) => r.scores.blind?.understood?.answers ?? {};
  const ids = [...new Set([...Object.keys(grades(a)), ...Object.keys(grades(b))])];
  const split = ids.filter((id) => grades(a)[id]?.grade != null && grades(b)[id]?.grade != null && Math.abs(grades(a)[id].grade - grades(b)[id].grade) >= 5);
  const C = [
    { name: "both players played", pass: played(a) && played(b), saw: `${a.who} ${played(a) ? "played" : "did not"}, ${b.who} ${played(b) ? "played" : "did not"}`, fix: "See each run's SELFCHECK.md." },
    { name: "both played the same build", pass: a.build && a.build === b.build, saw: `${a.build} and ${b.build}`, fix: "Have --both take one snapshot and hand it to both copies." },
    { name: "both stayed blind", pass: !a.peeks.length && !b.peeks.length, saw: `${a.peeks.length} and ${b.peeks.length} peeks`, fix: "See each run's Peeks." },
    {
      name: "the judge reads both players alike",
      pass: played(a) && played(b) && split.length <= 1,
      saw: !(played(a) && played(b)) ? "not comparable, a player did not play" : split.length ? `grades 5 or more apart on ${split.join(", ")}` : "no question 5 apart",
      fix: "A wide split on one answer means the quiz question is vague or the judge's full-marks line is. Tighten that question's full in regime.html.",
    },
  ];
  const md = [
    `# Self-check: ${a.name} and ${b.name}`,
    "",
    `${a.who} ${a.checks.filter((c) => c.pass).length}/${a.checks.length}, ${b.who} ${b.checks.filter((c) => c.pass).length}/${b.checks.length}.`,
    "",
    ...C.map((c) => `- ${c.pass ? "pass" : "**fail**"}: ${c.name}${c.saw ? `, ${c.saw}` : ""}${c.pass ? "" : `. ${c.fix}`}`),
    "",
  ].join("\n");
  for (const dir of args.slice(1)) appendFileSync(join(dir, "SELFCHECK.md"), "\n" + md);
  log({ pair: [a.name, b.name], pass: C.filter((c) => c.pass).length, of: C.length, failed: C.filter((c) => !c.pass).map((c) => c.name) });
  console.log(md);
} else {
  const dir = args[0];
  if (!dir || !existsSync(dir)) {
    console.error("Usage: node scripts/playtest-selfcheck.mjs playtests/<run> | --pair playtests/<a> playtests/<b>");
    process.exit(1);
  }
  const r = checkRun(dir);
  writeFileSync(join(dir, "SELFCHECK.md"), card(r));
  log({ run: r.name, who: r.who, build: r.build, pass: r.checks.filter((c) => c.pass).length, of: r.checks.length, failed: r.checks.filter((c) => !c.pass).map((c) => c.name) });
  console.log(`Self-check ${r.name}: ${r.checks.filter((c) => c.pass).length}/${r.checks.length} pass.${r.checks.some((c) => !c.pass) ? ` Fails: ${r.checks.filter((c) => !c.pass).map((c) => c.name).join("; ")}.` : ""}`);
}
