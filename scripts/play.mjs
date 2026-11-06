import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// npm run play: the game on your own machine, with the Mind answering on your own Claude login through the claude
// CLI, or on your ChatGPT login through the codex CLI. No API key. Installs what is missing, then starts the dev server and opens it. 2026-10-27.

const root = fileURLToPath(new URL("../", import.meta.url));
const game = fileURLToPath(new URL("../game/", import.meta.url));
const win = process.platform === "win32";
const npm = win ? "npm.cmd" : "npm";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`Holos needs Node 20.9 or later. This is ${process.versions.node}.`);
  process.exit(1);
}

// The Mind answers through Claude Code on a Claude login, or through Codex on a ChatGPT login when Claude Code is
// missing. MIND_CLI picks one when both are there. 2026-11-05.
const has = (cmd) => spawnSync(cmd, ["--version"], { shell: win }).status === 0;
const pick = process.env.MIND_CLI;
const agent = pick === "claude" || pick === "codex" ? pick : has("claude") ? "claude" : has("codex") ? "codex" : null;
if (!agent || !has(agent)) {
  console.error("Holos's Mind answers through Claude Code or Codex, and neither is installed.");
  console.error("Install Claude Code from https://claude.com/claude-code or Codex from https://developers.openai.com/codex,");
  console.error("run it once to log in, then npm run play again.");
  process.exit(1);
}

for (const dir of [root, game]) {
  if (existsSync(dir + "node_modules")) continue;
  console.log(`Installing ${dir === root ? "the atlas" : "the game"}…`);
  if (spawnSync(npm, ["install"], { cwd: dir, stdio: "inherit", shell: win }).status !== 0) process.exit(1);
}

// The game reads its worlds from a local bucket, empty on a fresh copy. Only worlds not yet sent are sent. 2026-11-04.
console.log("Loading the worlds…");
if (spawnSync(npm, ["run", "--silent", "worlds:local"], { cwd: game, stdio: "inherit", shell: win }).status !== 0) process.exit(1);

const dev = spawn(npm, ["run", "dev", "--", "--open"], { cwd: game, stdio: "inherit", shell: win, env: { ...process.env, MIND_VIA: "cli", MIND_CLI: agent } });
dev.on("close", (code) => process.exit(code ?? 0));
