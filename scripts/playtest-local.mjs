import { execFileSync, execSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromePath, playwright } from "./pw.mjs";
import { laneOf, pickLanes, regime } from "./regime.mjs";

// A playtest on this Mac, on your own Claude login, kept apart from your work. It copies the game as committed into
// ../.holos-playtests/<run>, runs that copy's dev server on a port of its own, plays or shoots against it, and copies
// the results back to playtests/. Your checkout, your dev server and your browser are never touched, so you can keep
// working and playing while it runs. 2026-11-08.
//
//   npm run playtest:local -- screens                 shoot every named state, then the critic, about 3 minutes
//   npm run playtest:local -- cloud [--scenario id]   an engineer plays a scenario, then the rater scores it
//   npm run playtest:local -- blind                   a first-timer plays from screenshots, then the judge grades it
//
//   --dirty          play your uncommitted changes too, not only what is committed
//   --model sonnet   the player's model, for cloud and blind. Sonnet plays faster, Opus sees more
//   --only a,b       for screens, shoot only these states, to recheck a fix fast
//   --keep           leave the copy in ../.holos-playtests/ when done
//   --smoke          the player only opens the game and takes one shot, to check the wiring in a minute
//   --player codex   play with OpenAI's model through the codex CLI, on your ChatGPT login, in its sandbox
//   --codex-open     let the codex player out of its sandbox, if Chrome won't start inside it
//   --both           a Claude player and a Codex player at once, each on its own copy and port, for two views
//
// The copy shares node_modules, the local worlds and your env files by APFS clone, so it takes seconds and no disk.

const repo = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
// Flags that take a value, so the kind is the one word left over, and for lanes, the pick after it.
const VALUED = ["--scenario", "--model", "--player", "--only", "--stamp", "--lane", "--parallel", "--port-base", "--sha"];
const words = args.filter((a, i) => !a.startsWith("--") && !VALUED.includes(args[i - 1]));
const asked = words[0] ?? "screens";
if (!["screens", "cloud", "blind", "lane"].includes(asked)) {
  console.error("Usage: npm run playtest:local -- screens | cloud [--scenario id] | blind | lane <pick> [--parallel n]  [--dirty] [--model sonnet] [--keep]");
  process.exit(1);
}
const R = regime();

// Lanes, 2026-11-09: focused playtests, each one question. A pick is one lane, several joined by commas, a group as
// @name, or all. Each lane runs as this script with --lane, on its own copy, ports and browser, up to --parallel at once.
//
//   npm run playtest:local -- lane rules
//   npm run playtest:local -- lane @play --parallel 3
//   npm run playtest:local -- lane all --parallel 1
//
// Results land in playtests/<stamp>/<lane>/, with SUMMARY.md on top: every lane's kept findings, worst first, lettered.
if (asked === "lane" && !opt("lane")) {
  let picked;
  try {
    picked = pickLanes(words[1] ?? "all", R);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const want = opt("parallel") ?? String(R.lanes.parallel ?? 2);
  const limit = want === "all" ? picked.length : Math.max(1, Number(want) || 1);
  const now = new Date().toISOString();
  const stamp = opt("stamp") ?? `${now.slice(0, 10)}-${now.slice(11, 13)}${now.slice(14, 16)}`;
  const pass = args.filter((a, i) => a !== "lane" && a !== words[1] && !["--parallel", "--stamp"].includes(a) && !["--parallel", "--stamp"].includes(args[i - 1]));
  // One snapshot for every lane, taken once: lanes starting together can't all run git stash create at once.
  const g = (...a) => execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim();
  const snap = args.includes("--dirty") ? g("stash", "create") || g("rev-parse", "HEAD") : g("rev-parse", "HEAD");
  pass.push("--sha", snap);
  const t0 = Date.now();
  const log = (m) => console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${m}`);
  log(`Lanes: ${picked.map((l) => l.id).join(", ")}. Up to ${limit} at once. Results in playtests/${stamp}/.`);
  const queue = picked.map((l, i) => ({ lane: l, slot: i }));
  const kids = new Set();
  const done = [];
  let stopping = false;
  // First Ctrl+C: start nothing new, let running lanes finish. Second: stop them too.
  process.on("SIGINT", () => {
    if (!stopping) {
      stopping = true;
      log(`Starting no more lanes. ${kids.size} still running will finish. Ctrl+C again to stop them.`);
      return;
    }
    for (const k of kids)
      try {
        process.kill(-k.pid, "SIGINT");
      } catch {}
  });
  const runOne = ({ lane, slot }) =>
    new Promise((ok) => {
      const started = Date.now();
      // Each lane looks for its ports from its own base, so lanes starting together never reach for the same one.
      const k = spawn("node", [fileURLToPath(import.meta.url), "lane", "--lane", lane.id, "--stamp", stamp, "--port-base", String(slot * 20), ...pass], { stdio: ["ignore", "pipe", "pipe"], detached: true });
      kids.add(k);
      const tag = lane.id;
      for (const s of [k.stdout, k.stderr]) {
        let buf = "";
        s.on("data", (d) => {
          buf += d;
          const parts = buf.split("\n");
          buf = parts.pop();
          for (const l of parts) console.log(`[${tag}] ${l}`);
        });
      }
      k.on("close", (code) => {
        kids.delete(k);
        done.push({ lane: lane.id, code, minutes: Math.round((Date.now() - started) / 60000) });
        log(`${lane.id} ${code ? `stopped with code ${code}` : "done"}. ${done.length} of ${picked.length} lanes finished.`);
        ok();
      });
    });
  const worker = async () => {
    while (queue.length && !stopping) await runOne(queue.shift());
  };
  await Promise.all(Array.from({ length: Math.min(limit, queue.length) }, worker));
  const { summarize } = await import("./playtest-lanes.mjs");
  const file = summarize(join(repo, "playtests", stamp), done);
  log(`All lanes done in ${Math.round((Date.now() - t0) / 60000)} min. Summary: ${file}`);
  console.log("\n" + readFileSync(file, "utf8"));
  process.exit(done.some((d) => d.code) ? 1 : 0);
}
// One lane: the lane says how it plays. A blind lane plays as the Blind Playtest, a screens lane shoots, the rest
// play from playtests/LANE.md with the lane's own steps.
const lane = asked === "lane" ? laneOf(opt("lane"), R) : null;
if (asked === "lane" && !lane) {
  console.error(`No lane ${opt("lane")}. The lanes: ${R.lanes.list.map((l) => l.id).join(", ")}.`);
  process.exit(1);
}
const kind = lane ? (lane.via === "screens" ? "screens" : lane.via === "blind" ? "blind" : "lane") : asked;

// Both players at once: this script twice, one a player, each with its own copy, ports and run folder.
if (args.includes("--both")) {
  const rest = args.filter((a) => a !== "--both");
  // One stamp for both, so their folders pair up: <run> and <run>-codex.
  const now = new Date().toISOString();
  const stamp = `${now.slice(0, 10)}-${now.slice(11, 13)}${now.slice(14, 16)}`;
  const lines = (tag, stream) => {
    let buf = "";
    stream.on("data", (d) => {
      buf += d;
      const parts = buf.split("\n");
      buf = parts.pop();
      for (const l of parts) console.log(`[${tag}] ${l}`);
    });
  };
  const kids = ["claude", "codex"].map((who) => {
    // Only the Claude run shoots the named screens: the copies are the same build.
    const k = spawn("node", [fileURLToPath(import.meta.url), ...rest, "--stamp", stamp, "--player", who, ...(who === "codex" ? ["--no-screens"] : [])], { stdio: ["ignore", "pipe", "pipe"] });
    lines(who, k.stdout);
    lines(who, k.stderr);
    return new Promise((ok) => k.on("close", ok));
  });
  process.on("SIGINT", () => {});
  await Promise.all(kids);
  // The two runs checked side by side: same build, both blind, and whether the judge reads them alike.
  const dirs = [stamp, `${stamp}-codex`].map((r) => join(repo, "playtests", r));
  if (dirs.every((d) => existsSync(join(d, "runner.json"))))
    await new Promise((ok) => spawn("node", [join(repo, "scripts/playtest-selfcheck.mjs"), "--pair", ...dirs], { stdio: "inherit" }).on("close", ok));
  else console.log("Pair self-check skipped: a run has no runner.json.");
  process.exit(0);
}
const who = opt("player") ?? "claude";
if (!["claude", "codex"].includes(who)) {
  console.error("--player is claude or codex.");
  process.exit(1);
}
const iso = new Date().toISOString();
const stamp = opt("stamp") ?? `${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}`;
const run = `${stamp}${lane ? `-${lane.id}` : ""}${who === "codex" ? "-codex" : ""}`;
// A lane's results sit under its stamp, beside the other lanes of the same run.
const outRel = lane ? join("playtests", stamp, lane.id) : join("playtests", run);
const base = resolve(repo, "..", ".holos-playtests");
const copy = join(base, run);
const started = Date.now();
const say = (m) => console.log(`[${Math.round((Date.now() - started) / 1000)}s] ${m}`);
const git = (...a) => execFileSync("git", a, { cwd: repo, encoding: "utf8" }).trim();

// Memory first: a dev server, a headless Chrome and the CLI at once are heavy.
try {
  const free = Number(execSync("memory_pressure", { encoding: "utf8" }).match(/free percentage: (\d+)/)?.[1]);
  if (free < 20) {
    console.error(`Only ${free}% of memory is free. Close something and try again.`);
    process.exit(1);
  }
} catch {}

// The snapshot: what is committed, or with --dirty, the working tree as it stands, without touching it.
const sha = opt("sha") ?? (args.includes("--dirty") ? git("stash", "create") || git("rev-parse", "HEAD") : git("rev-parse", "HEAD"));
const build = git("rev-parse", "--short", sha);
mkdirSync(copy, { recursive: true });
execSync(`git archive ${sha} | tar -x -C "${copy}"`, { cwd: repo });
// .gitattributes keeps playtests/ out of git archive, so the npx download stays small. The player still needs its
// prompts, the quiz in regime.html and the saved states, as this build has them. 2026-11-08.
for (const f of git("ls-tree", "-r", "--name-only", sha, "playtests/BLIND.md", "playtests/PROMPT.md", "playtests/LANE.md", "playtests/regime.html", "playtests/states").split("\n").filter(Boolean)) {
  mkdirSync(dirname(join(copy, f)), { recursive: true });
  writeFileSync(join(copy, f), execFileSync("git", ["show", `${sha}:${f}`], { cwd: repo }));
}
mkdirSync(join(copy, "playtests/states"), { recursive: true });
const clone = (from, to) => {
  if (!existsSync(join(repo, from))) return;
  mkdirSync(dirname(join(copy, to)), { recursive: true });
  // APFS clone: instant and free. Elsewhere, a plain copy.
  try {
    execFileSync("cp", ["-cR", join(repo, from), join(copy, to)]);
  } catch {
    cpSync(join(repo, from), join(copy, to), { recursive: true });
  }
};
for (const p of ["node_modules", "game/node_modules", "game/.wrangler", ".env.local", "game/.dev.vars", "game/.env.local"]) clone(p, p);
// With --dirty, new files not yet added to git come too: git stash create leaves them out.
if (args.includes("--dirty"))
  for (const f of git("ls-files", "--others", "--exclude-standard").split("\n").filter(Boolean)) if (!f.startsWith("playtests/")) clone(f, f);
say(`Copied build ${build}${args.includes("--dirty") ? " with your uncommitted changes" : ""} to ${copy}.`);

// Free ports, so nothing of yours is in the way.
const freePort = (from) =>
  new Promise((ok) => {
    const s = createServer();
    s.once("error", () => ok(freePort(from + 1)));
    s.listen(from, "127.0.0.1", () => s.close(() => ok(from)));
  });
// Codex looks from higher up, so two runners starting at once don't reach for the same port.
const portBase = Number(opt("port-base") ?? 0);
const port = await freePort((who === "codex" ? 5350 : 5300) + portBase);
const cdp = await freePort((who === "codex" ? 9450 : 9400) + portBase);
const url = `http://localhost:${port}`;

const procs = [];
let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  for (const p of procs)
    try {
      process.kill(-p.pid);
    } catch {}
  try {
    execFileSync("node", [join(repo, "scripts/blind.mjs"), "stop"], { env: { ...process.env, BLIND_DIR: join(copy, "playtests", run, "blind"), BLIND_PORT: String(cdp) }, stdio: "ignore" });
  } catch {}
  if (!args.includes("--keep")) rmSync(copy, { recursive: true, force: true });
}
process.on("SIGINT", () => {
  say("Stopped. Cleaning up.");
  cleanup();
  process.exit(130);
});
process.on("exit", cleanup);

// The copy's dev server, with the Mind on the claude CLI, as dev:cli runs it.
const vite = spawn(join(copy, "game/node_modules/.bin/vite"), ["--port", String(port), "--strictPort"], {
  cwd: join(copy, "game"),
  env: { ...process.env, MIND_VIA: "cli" },
  detached: true,
  stdio: ["ignore", openSync(join(copy, "vite.log"), "a"), openSync(join(copy, "vite.log"), "a")],
});
procs.push(vite);
for (let i = 0; ; i++) {
  try {
    if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).ok) break;
  } catch {}
  if (i > 90 || vite.exitCode !== null) {
    // Show why before cleanup takes the copy and its log away.
    const log = existsSync(join(copy, "vite.log")) ? readFileSync(join(copy, "vite.log"), "utf8").replace(/\x1b\[[0-9;]*m/g, "").split("\n").filter(Boolean).slice(0, 12).join("\n") : "";
    console.error(`The copy's dev server never answered on ${url}:\n${log}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 1000));
}
say(`The copy's game runs at ${url}.`);

// What the runner did, step by step, for the self-check at the end: scripts/playtest-selfcheck.mjs.
const steps = [];
const node = (script, a = [], env = {}) =>
  new Promise((ok, fail) => {
    const t = Date.now();
    const p = spawn("node", [join(repo, script), ...a], { cwd: repo, env: { ...process.env, HOLOS_URL: url, ...env }, stdio: "inherit" });
    p.on("close", (code) => {
      steps.push({ step: script.replace(/^scripts\//, ""), code, secs: Math.round((Date.now() - t) / 1000) });
      code ? fail(new Error(`${script} exited ${code}`)) : ok();
    });
  });

if (kind === "screens") {
  // The tools run from your checkout, against the copy's game. Results land in playtests/captures/<run>.
  await node("scripts/capture.mjs", ["--url", url, "--run", run, ...(opt("only") ? ["--only", opt("only")] : [])]).catch((e) => say(e.message));
  await node("scripts/playtest-critic.mjs", [run]);
  if (lane) {
    mkdirSync(join(repo, outRel), { recursive: true });
    writeFileSync(join(repo, outRel, "lane.json"), JSON.stringify({ lane: lane.id, captures: run }, null, 2) + "\n");
  }
  say(`Done in ${Math.round((Date.now() - started) / 60000)} min. See npm run playtests:serve, Screens.`);
  process.exit(0);
}

// A player: a Claude Code session in the copy, told the game is already running, on your login.
const file = kind === "cloud" ? "playtests/PROMPT.md" : kind === "lane" ? "playtests/LANE.md" : "playtests/BLIND.md";
// The lane's own part of the prompt: its question, who plays, where it starts, its steps and what is out of it.
const laneBrief = lane
  ? `## Your lane: ${lane.title}

Question: ${lane.question}
You are: ${lane.who}
${lane.from ? `Start from the saved state ${lane.from}.` : "Start fresh."}${lane.minutes ? ` Spend at most ${lane.minutes} minutes playing.` : ""}
${lane.steps ? `\nSteps:\n${lane.steps.map((x) => `- ${x}`).join("\n")}\n` : ""}
Out of this lane: ${lane.out.length ? lane.out.join(" ") : "nothing named"}
${lane.via === "blind" ? "\nAlso write findings.jsonl in the run's folder at the end, one line per finding, as playtests/LANE.md says under Findings. Keep playing as the file below says.\n" : ""}
---

`
  : "";
const scenario = opt("scenario");
const local = `LOCAL RUN. This overrides the file below wherever they differ.

- The game already runs at ${url}, from build ${build}, in this folder. Skip Setup entirely: don't install anything, don't start, stop or restart a dev server, don't run worlds, and revert nothing.
- The run's folder is playtests/${run}/. Write everything there.
- Don't make a branch, commit or push.
${kind === "blind" ? `- BLIND_URL, BLIND_PORT and BLIND_DIR are set for scripts/blind.mjs. Use them as they are. See only through it.\n` : `- Playwright: require it from ${join(repo, "node_modules/playwright")}. Launch Chrome headless with executablePath ${JSON.stringify(chromePath(playwright()))}.\n`}- Don't run playtest:rate, playtest:judge, playtest:capture, playtest:critic, run-cost or playtest:score. The runner does them once you stop.
${scenario ? `- Play the scenario ${scenario}.\n` : ""}${args.includes("--smoke") ? "- SMOKE TEST: open the game once, take one screenshot into the run's folder, write a one-line REPORT.md, and stop. Nothing else.\n" : ""}- When you have delivered the report, stop.

---

${laneBrief}${readFileSync(existsSync(join(copy, file)) ? join(copy, file) : join(repo, file), "utf8")}`;
const session = randomUUID();
const runDir = join(copy, "playtests", run);
mkdirSync(runDir, { recursive: true });
const model = opt("model");
say(`The ${kind} player starts on ${who}${model ? ` ${model}` : ""}. Its log: ${join(runDir, "player.jsonl")}`);
const playerEnv = { ...process.env, HOLOS_URL: url, BLIND_URL: `${url}/`, BLIND_PORT: String(cdp), BLIND_DIR: join(runDir, "blind") };
const player =
  who === "claude"
    ? spawn(
        "claude",
        ["-p", "--session-id", session, "--permission-mode", "acceptEdits", "--allowedTools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", ...(lane?.tools ?? []), "--output-format", "stream-json", "--verbose", ...(model ? ["--model", model] : [])],
        { cwd: copy, env: playerEnv, detached: true, stdio: ["pipe", "pipe", "inherit"] },
      )
    : spawn(
        "codex",
        [
          "exec", "--skip-git-repo-check", "--json", "-C", copy,
          // Its sandbox lets it write only in the copy, with the network open for the game and Chrome on localhost.
          ...(args.includes("--codex-open") ? ["--dangerously-bypass-approvals-and-sandbox"] : ["-s", "workspace-write", "-c", "sandbox_workspace_write.network_access=true"]),
          ...(model ? ["-m", model] : []),
          "-",
        ],
        { cwd: copy, env: playerEnv, detached: true, stdio: ["pipe", "pipe", "inherit"] },
      );
procs.push(player);
player.stdin.end(local);
player.stdout.on("data", (d) => appendFileSync(join(runDir, "player.jsonl"), d));

// A heartbeat while it plays: how long, and how far.
const beat = setInterval(() => {
  const shots = existsSync(runDir) ? readdirSync(runDir).filter((f) => f.endsWith(".png")).length + (existsSync(join(runDir, "blind")) ? readdirSync(join(runDir, "blind")).filter((f) => f.endsWith(".png")).length : 0) : 0;
  const lines = (f) => (existsSync(join(runDir, f)) ? readFileSync(join(runDir, f), "utf8").split("\n").filter(Boolean).length : 0);
  say(`playing: ${shots} screenshots, ${lines(kind === "blind" ? "blind.jsonl" : "log.jsonl")} log lines.`);
}, 60000);
const playerStarted = Date.now();
const playerCode = await new Promise((ok) => player.on("close", ok));
clearInterval(beat);
say("The player stopped.");

// The readers and the score, run here, on the run as the player left it.
const out = join(repo, outRel);
cpSync(runDir, out, { recursive: true, filter: (f) => !f.includes(`${run}/blind/profile`) });
for (const f of readdirSync(join(copy, "playtests/states")))
  if (!existsSync(join(repo, "playtests/states", f))) {
    cpSync(join(copy, "playtests/states", f), join(repo, "playtests/states", f));
    say(`New saved state: playtests/states/${f}`);
  }
// The build, so the scorer can tie each score to code, and the player's last message as REPORT.md if it wrote none.
{
  const sp = join(out, "scores.json");
  const sc = existsSync(sp) ? JSON.parse(readFileSync(sp, "utf8")) : {};
  if (!sc.build || (lane && !sc.lane)) writeFileSync(sp, JSON.stringify({ build, ...(lane ? { lane: lane.id } : {}), ...sc }, null, 2) + "\n");
  const rp = join(out, "REPORT.md");
  if (!existsSync(rp) && existsSync(join(out, "player.jsonl"))) {
    const ev = readFileSync(join(out, "player.jsonl"), "utf8").split("\n").flatMap((l) => {
      try {
        return [JSON.parse(l)];
      } catch {
        return [];
      }
    });
    const last = ev.filter((e) => e.type === "result").at(-1)?.result ?? ev.filter((e) => e.type === "item.completed" && e.item?.type === "agent_message").at(-1)?.item?.text;
    if (last) writeFileSync(rp, `# Report, ${run}\n\n${last}\n`);
  }
}
const readers =
  kind === "cloud"
    ? [["scripts/playtest-rate.mjs", [out]]]
    : kind === "lane"
      ? [["scripts/playtest-lane-rate.mjs", [out, "--lane", lane.id]]]
      : [["scripts/playtest-judge.mjs", [out]], ...(lane ? [["scripts/playtest-lane-rate.mjs", [out, "--lane", lane.id]]] : [])];
// A smoke run checks the wiring only: no quiz to judge, no screens to shoot.
const smoke = args.includes("--smoke");
if (!smoke) for (const [s, a] of readers) await node(s, a).catch((e) => say(e.message));
if (!smoke && !lane && !args.includes("--no-screens")) {
  await node("scripts/capture.mjs", ["--url", url, "--run", run]).catch((e) => say(e.message));
  await node("scripts/playtest-critic.mjs", [run]).catch((e) => say(e.message));
}
const costArgs = who === "codex" ? [out, "--codex", join(out, "player.jsonl"), "--started", new Date(started).toISOString()] : [out];
await node("scripts/run-cost.mjs", costArgs, { CLAUDE_CODE_SESSION_ID: session }).catch((e) => say(e.message));
await node("scripts/playtest-score.mjs", [out]).catch((e) => say(e.message));
writeFileSync(
  join(out, "runner.json"),
  JSON.stringify({ run, kind, lane: lane?.id ?? null, who, build, model: model ?? null, smoke: args.includes("--smoke"), player: { code: playerCode, minutes: Math.round((Date.now() - playerStarted) / 60000) }, steps, minutes: Math.round((Date.now() - started) / 60000) }, null, 2) + "\n",
);
await node("scripts/playtest-selfcheck.mjs", [out]).catch((e) => say(e.message));
say(`Done in ${Math.round((Date.now() - started) / 60000)} min. Report: ${join(out, "REPORT.md")}. Scorecard: ${join(out, "SCORECARD.md")}.`);
process.exit(0);
