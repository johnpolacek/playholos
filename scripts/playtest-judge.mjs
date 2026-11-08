import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { askJson } from "./claude-ask.mjs";
import { regime } from "./regime.mjs";

// The blind player's quiz and check-ins, graded by a reader who didn't play, against the full marks in the regime,
// playtests/regime.html. Any lead the player names is checked against what its log shows it saw. It asks on your own
// Claude login through the claude CLI, never an API key. 2026-11-08.
//
//   npm run playtest:judge playtests/<run>       grade a run into its scores.json, as blind.understood and blind.check-ins
//   npm run playtest:judge -- --validate         grade every case in playtests/judge/labels.json and compare
//
// JUDGE_MODEL picks the model, opus by default.

const root = fileURLToPath(new URL("../playtests/", import.meta.url));
const MODEL = process.env.JUDGE_MODEL ?? "opus";
const QUIZ = regime().quiz;
const ONCE = QUIZ.once.map((x) => x.id);

const git = (...a) => {
  try {
    return execFileSync("git", a, { cwd: join(root, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 });
  } catch {
    return null;
  }
};

const lines = (jsonl) =>
  (jsonl ?? "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

/** What the player saw, one short line a step, so the judge can tell a real lead from one made up. */
const seen = (log) =>
  log
    .filter((s) => !s.t)
    .map((s) => `#${s.n} saw: ${s.see ?? ""} | got: ${s.got ?? ""}`.slice(0, 300))
    .join("\n") || "(no log)";

const grading = `Go by the gist, not the words. The full marks line sets what earns a 10. Take points off only for what full marks asks for and the answer gets wrong or leaves out, never for style or length. Check every lead, find or event the player names against the play log. One the log never shows is made up, and an answer built on it gets at most 2.`;

const oncePrompt = (quiz, log) => `You grade a quiz a first-time player of the game Holos wrote after playing. You did not play. Grade each answer 0 to 10 against its full marks. ${grading} If the player says they never used a tab, grade that answer null.

<questions>
${QUIZ.once.map((x) => `${x.id}: ${x.q}\nFull marks: ${x.full}`).join("\n\n")}
</questions>

<play-log>
${seen(log)}
</play-log>

<quiz>
${quiz}
</quiz>

Reply with JSON only, no other text, one entry per question id:
{${ONCE.map((id) => `"${id}":{"grade":<0-10 or null>,"why":"<one short line>","wrong":"<a short quote of what is wrong or missing, or empty>"}`).join(",")}}`;

const checkinPrompt = (checkins, log) => `A first-time player of the game Holos answered check-in questions while playing. You did not play. Grade each check-in 0 to 10 against the full marks, using only the play log up to that check-in's step, #n. ${grading}

<questions>
${QUIZ.checkin.questions.map((x) => `${x.id}: ${x.q}`).join("\n")}
Full marks: ${QUIZ.checkin.full}
</questions>

<play-log>
${seen(log)}
</play-log>

<check-ins>
${checkins.map((c) => JSON.stringify(c)).join("\n")}
</check-ins>

Reply with JSON only, no other text, in check-in order:
[{"n":<its step>,"grade":<0-10>,"why":"<one short line>"}]`;

const ask = (text) => askJson(text, { model: MODEL });

const mean = (xs) => {
  const ok = xs.filter((x) => typeof x === "number");
  return ok.length ? Math.round((10 * ok.reduce((a, b) => a + b, 0)) / ok.length) / 10 : null;
};

/** The judge's grades for one run: the once answers and the check-ins. */
async function judge(quiz, jsonl) {
  const log = lines(jsonl);
  const checkins = log.filter((s) => s.t === "checkin");
  const [once, ins] = await Promise.all([ask(oncePrompt(quiz, log)), checkins.length ? ask(checkinPrompt(checkins, log)) : Promise.resolve([])]);
  for (const id of ONCE) if (!once[id] || (once[id].grade !== null && typeof once[id].grade !== "number")) throw new Error(`The judge gave no grade for ${id}.`);
  return { once, checkins: ins, understood: mean(ONCE.map((id) => once[id].grade)), checkinScore: mean(ins.map((c) => c.grade)) };
}

/** A run's files, from its folder or its pushed blind branch. */
function files(name) {
  const dir = existsSync(name) ? name : join(root, name);
  if (existsSync(join(dir, "quiz.md")))
    return { dir, quiz: readFileSync(join(dir, "quiz.md"), "utf8"), log: existsSync(join(dir, "blind.jsonl")) ? readFileSync(join(dir, "blind.jsonl"), "utf8") : "" };
  const run = basename(dir);
  const ref = `origin/playtest/blind-${run}`;
  const quiz = git("show", `${ref}:playtests/${run}/quiz.md`);
  if (!quiz) return null;
  return { dir: null, quiz, log: git("show", `${ref}:playtests/${run}/blind.jsonl`) ?? "" };
}

const args = process.argv.slice(2);

if (args.includes("--validate")) {
  const labels = JSON.parse(readFileSync(join(root, "judge/labels.json"), "utf8"));
  if (labels.version !== QUIZ.version) console.warn(`labels.json is for quiz version ${labels.version}, the regime's is ${QUIZ.version}.`);
  git("fetch", "--quiet", "origin", "+refs/heads/playtest/*:refs/remotes/origin/playtest/*");
  const cases = [
    ...Object.entries(labels.runs ?? {}).map(([name, want]) => ({ name, want, got: files(name) })),
    ...Object.entries(labels.fixtures ?? {}).map(([name, want]) => ({
      name: `fixture ${name}`,
      want,
      got: { quiz: readFileSync(join(root, `judge/${name}.quiz.md`), "utf8"), log: readFileSync(join(root, `judge/${name}.blind.jsonl`), "utf8") },
    })),
  ];
  const rows = await Promise.all(cases.map(async (c) => (!c.got ? { ...c, error: "no quiz found" } : judge(c.got.quiz, c.got.log).then((j) => ({ ...c, j }), (e) => ({ ...c, error: e.message })))));
  const diffs = [];
  console.log(`Judge ${MODEL} against playtests/judge/labels.json, quiz version ${QUIZ.version}\n`);
  for (const r of rows) {
    if (r.error) {
      console.log(`${r.name}: ${r.error}`);
      continue;
    }
    const per = ONCE.map((id) => {
      const want = r.want.once?.[id];
      const got = r.j.once[id].grade;
      if (want === undefined) return null;
      const off = want === null || got === null ? (want === got ? 0 : 10) : got - want;
      diffs.push(off);
      return `${id} ${want ?? "–"}/${got ?? "–"}${Math.abs(off) > 1 ? "!" : ""}`;
    }).filter(Boolean);
    (r.want.checkins ?? []).forEach((want, i) => {
      const got = r.j.checkins[i]?.grade;
      if (typeof got !== "number") return;
      diffs.push(got - want);
      per.push(`#${r.j.checkins[i].n} ${want}/${got}${Math.abs(got - want) > 1 ? "!" : ""}`);
      if (Math.abs(got - want) > 1) per.whys = [...(per.whys ?? []), `#${r.j.checkins[i].n}: ${r.j.checkins[i].why}`];
    });
    console.log(`${r.name}\n  ${per.join("  ")}`);
    for (const id of ONCE) {
      const want = r.want.once?.[id];
      const got = r.j.once[id].grade;
      if (want === undefined) continue;
      const off = want === null || got === null ? want !== got : Math.abs(got - want) > 1;
      if (off) console.log(`    ${id}: ${r.j.once[id].why}`);
    }
    for (const w of per.whys ?? []) console.log(`    ${w}`);
  }
  if (diffs.length) {
    const near = diffs.filter((d) => Math.abs(d) <= 1).length;
    const miss = diffs.reduce((a, d) => a + Math.abs(d), 0) / diffs.length;
    const lean = diffs.reduce((a, d) => a + d, 0) / diffs.length;
    console.log(`\n${near} of ${diffs.length} grades within 1 point. Mean miss ${miss.toFixed(2)}, lean ${lean >= 0 ? "+" : ""}${lean.toFixed(2)}.`);
  }
} else {
  const name = args.find((a) => !a.startsWith("--"));
  if (!name) {
    console.error("Usage: npm run playtest:judge playtests/<run>, or npm run playtest:judge -- --validate");
    process.exit(1);
  }
  const run = files(name);
  if (!run?.dir) {
    console.error(`No quiz.md in ${name}.`);
    process.exit(1);
  }
  const j = await judge(run.quiz, run.log);
  const path = join(run.dir, "scores.json");
  const scores = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
  scores.blind ??= {};
  // The player's own grade, if it gave one, is kept beside the judge's, never used.
  if (scores.blind.understood && scores.blind.understood.by !== "judge") scores.blind.self = scores.blind.understood;
  scores.quiz = QUIZ.version;
  scores.blind.understood = {
    score: j.understood,
    why: ONCE.map((id) => `${id}: ${j.once[id].grade ?? "never used"}, ${j.once[id].why}`).join(" "),
    evidence: ["quiz.md", "blind.jsonl"],
    by: "judge",
    model: MODEL,
    answers: j.once,
  };
  const first = j.checkins[0];
  const last = j.checkins.at(-1);
  scores.blind["check-ins"] = j.checkins.length
    ? {
        score: j.checkinScore,
        why: `${j.checkins.length} check-ins, first ${first.grade} at #${first.n}, last ${last.grade} at #${last.n}. Lowest: ${[...j.checkins].sort((a, b) => a.grade - b.grade)[0].why}`,
        evidence: ["blind.jsonl"],
        by: "judge",
        model: MODEL,
        checkins: j.checkins,
      }
    : { score: null, why: "No check-ins in blind.jsonl." };
  writeFileSync(path, JSON.stringify(scores, null, 2) + "\n");
  console.log(`understood ${j.understood}: ${scores.blind.understood.why}\ncheck-ins ${j.checkinScore}: ${scores.blind["check-ins"].why}`);
}
