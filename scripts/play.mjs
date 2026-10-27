import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// npm run play: the game on your own machine, with the Mind and the neighbors answering on your own Claude login
// through the claude CLI. No API key. Installs what is missing, then starts the dev server and opens it. 2026-10-27.

const root = fileURLToPath(new URL("../", import.meta.url));
const game = fileURLToPath(new URL("../game/", import.meta.url));
const win = process.platform === "win32";
const npm = win ? "npm.cmd" : "npm";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`Holos needs Node 20.9 or later. This is ${process.versions.node}.`);
  process.exit(1);
}

if (spawnSync("claude", ["--version"], { shell: win }).status !== 0) {
  console.error("Holos plays on your Claude login through Claude Code, and it isn't installed.");
  console.error("Install it from https://claude.com/claude-code, run claude once to log in, then npm run play again.");
  process.exit(1);
}

for (const dir of [root, game]) {
  if (existsSync(dir + "node_modules")) continue;
  console.log(`Installing ${dir === root ? "the atlas" : "the game"}…`);
  if (spawnSync(npm, ["install"], { cwd: dir, stdio: "inherit", shell: win }).status !== 0) process.exit(1);
}

const dev = spawn(npm, ["run", "dev", "--", "--open"], { cwd: game, stdio: "inherit", shell: win, env: { ...process.env, MIND_VIA: "cli" } });
dev.on("close", (code) => process.exit(code ?? 0));
