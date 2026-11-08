import { execFileSync, execSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromePath, playwright } from "./pw.mjs";
import { regime } from "./regime.mjs";

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
// Flags that take a value, so the kind is the one word left over.
const VALUED = ["--scenario", "--model", "--player"];
const kind = args.find((a, i) => !a.startsWith("--") && !VALUED.includes(args[i - 1])) ?? "screens";
if (!["screens", "cloud", "blind"].includes(kind)) {
  console.error("Usage: npm run playtest:local -- screens | cloud [--scenario id] | blind  [--dirty] [--model sonnet] [--keep]");
  process.exit(1);
}
const R = regime();

// Both players at once: this script twice, one a player, each with its own copy, ports and run folder.
if (args.includes("--both")) {
  const rest = args.filter((a) => a !== "--both");
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
    const k = spawn("node", [fileURLToPath(import.meta.url), ...rest, "--player", who, ...(who === "codex" ? ["--no-screens"] : [])], { stdio: ["ignore", "pipe", "pipe"] });
    lines(who, k.stdout);
    lines(who, k.stderr);
    return new Promise((ok) => k.on("close", ok));
  });
  process.on("SIGINT", () => {});
  await Promise.all(kids);
  process.exit(0);
}
const who = opt("player") ?? "claude";
if (!["claude", "codex"].includes(who)) {
  console.error("--player is claude or codex.");
  process.exit(1);
}
const iso = new Date().toISOString();
const run = `${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}${who === "codex" ? "-codex" : ""}`;
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
const sha = args.includes("--dirty") ? git("stash", "create") || git("rev-parse", "HEAD") : git("rev-parse", "HEAD");
const build = git("rev-parse", "--short", sha);
mkdirSync(copy, { recursive: true });
execSync(`git archive ${sha} | tar -x -C "${copy}"`, { cwd: repo });
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
say(`Copied build ${build}${args.includes("--dirty") ? " with your uncommitted changes" : ""} to ${copy}.`);

// Free ports, so nothing of yours is in the way.
const freePort = (from) =>
  new Promise((ok) => {
    const s = createServer();
    s.once("error", () => ok(freePort(from + 1)));
    s.listen(from, "127.0.0.1", () => s.close(() => ok(from)));
  });
// Codex looks from higher up, so two runners starting at once don't reach for the same port.
const port = await freePort(who === "codex" ? 5350 : 5300);
const cdp = await freePort(who === "codex" ? 9450 : 9400);
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
  if (i > 90) throw new Error(`The copy's dev server never answered on ${url}. See ${join(copy, "vite.log")}.`);
  await new Promise((r) => setTimeout(r, 1000));
}
say(`The copy's game runs at ${url}.`);

const node = (script, a = [], env = {}) =>
  new Promise((ok, fail) => {
    const p = spawn("node", [join(repo, script), ...a], { cwd: repo, env: { ...process.env, HOLOS_URL: url, ...env }, stdio: "inherit" });
    p.on("close", (code) => (code ? fail(new Error(`${script} exited ${code}`)) : ok()));
  });

if (kind === "screens") {
  // The tools run from your checkout, against the copy's game. Results land in playtests/captures/<run>.
  await node("scripts/capture.mjs", ["--url", url, "--run", run]).catch((e) => say(e.message));
  await node("scripts/playtest-critic.mjs", [run]);
  say(`Done in ${Math.round((Date.now() - started) / 60000)} min. See npm run playtests:serve, Screens.`);
  process.exit(0);
}

// A player: a Claude Code session in the copy, told the game is already running, on your login.
const file = kind === "cloud" ? "playtests/PROMPT.md" : "playtests/BLIND.md";
const scenario = opt("scenario");
const local = `LOCAL RUN. This overrides the file below wherever they differ.

- The game already runs at ${url}, from build ${build}, in this folder. Skip Setup entirely: don't install anything, don't start, stop or restart a dev server, don't run worlds, and revert nothing.
- The run's folder is playtests/${run}/. Write everything there.
- Don't make a branch, commit or push.
- Playwright: require it from ${join(repo, "node_modules/playwright")}. Launch Chrome headless with executablePath ${JSON.stringify(chromePath(playwright()))}.
${kind === "blind" ? `- BLIND_URL, BLIND_PORT and BLIND_DIR are set for scripts/blind.mjs. Use them as they are.\n` : ""}- Don't run playtest:rate, playtest:judge, playtest:capture, playtest:critic, run-cost or playtest:score. The runner does them once you stop.
${scenario ? `- Play the scenario ${scenario}.\n` : ""}${args.includes("--smoke") ? "- SMOKE TEST: open the game once, take one screenshot into the run's folder, write a one-line REPORT.md, and stop. Nothing else.\n" : ""}- When you have delivered the report, stop.

---

${readFileSync(join(copy, file), "utf8")}`;
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
        ["-p", "--session-id", session, "--permission-mode", "acceptEdits", "--allowedTools", "Bash", "Read", "Write", "Edit", "Glob", "Grep", "--output-format", "stream-json", "--verbose", ...(model ? ["--model", model] : [])],
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
  say(`playing: ${shots} screenshots, ${lines(kind === "cloud" ? "log.jsonl" : "blind.jsonl")} log lines.`);
}, 60000);
await new Promise((ok) => player.on("close", ok));
clearInterval(beat);
say("The player stopped.");

// The readers and the score, run here, on the run as the player left it.
const out = join(repo, "playtests", run);
cpSync(runDir, out, { recursive: true, filter: (f) => !f.includes(`${run}/blind/profile`) });
for (const f of readdirSync(join(copy, "playtests/states")))
  if (!existsSync(join(repo, "playtests/states", f))) {
    cpSync(join(copy, "playtests/states", f), join(repo, "playtests/states", f));
    say(`New saved state: playtests/states/${f}`);
  }
const steps = kind === "cloud" ? [["scripts/playtest-rate.mjs", [out]]] : [["scripts/playtest-judge.mjs", [out]]];
for (const [s, a] of steps) await node(s, a).catch((e) => say(e.message));
if (!args.includes("--no-screens")) {
  await node("scripts/capture.mjs", ["--url", url, "--run", run]).catch((e) => say(e.message));
  await node("scripts/playtest-critic.mjs", [run]).catch((e) => say(e.message));
}
const costArgs = who === "codex" ? [out, "--codex", join(out, "player.jsonl"), "--started", new Date(started).toISOString()] : [out];
await node("scripts/run-cost.mjs", costArgs, { CLAUDE_CODE_SESSION_ID: session }).catch((e) => say(e.message));
await node("scripts/playtest-score.mjs", [out]).catch((e) => say(e.message));
say(`Done in ${Math.round((Date.now() - started) / 60000)} min. Report: ${join(out, "REPORT.md")}. Scorecard: ${join(out, "SCORECARD.md")}.`);
process.exit(0);
