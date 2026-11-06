// The Mind on a ChatGPT login, through the Codex CLI, for players who use Codex and not Claude Code. Codex is an agent,
// so it is asked bare: our system prompt in place of its own instructions, its tools, apps and web search off, no
// session kept, and nothing on disk it may write. Feature toggles go as config, which an older or newer Codex skips
// when it doesn't know one, where --disable stops on an unknown name. Codex sends its answer whole, not word by word.
// Shared by mind-cli.ts and ask-mind.mjs. 2026-11-05.
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const OFF = [
  "shell_tool", "unified_exec", "apps", "plugins", "multi_agent", "image_generation", "skill_search", "goals",
  "view_image", "sleep_tool", "tool_suggest", "browser_use", "computer_use",
];

/** Codex's arguments for one bare question, with the system prompt in a file. */
export function codexArgs(promptFile, effort) {
  const args = ["exec", "--json", "--ephemeral", "--skip-git-repo-check", "--ignore-user-config", "--ignore-rules"];
  args.push("-s", "read-only", "-c", `model_instructions_file=${JSON.stringify(promptFile)}`);
  args.push("-c", 'web_search="disabled"', "-c", "include_permissions_instructions=false");
  args.push("-c", "include_environment_context=false", "-c", "include_apps_instructions=false");
  for (const f of OFF) args.push("-c", `features.${f}=false`);
  if (effort) args.push("-c", `model_reasoning_effort="${effort}"`);
  // Codex picks its own model for the login unless the player names one.
  if (process.env.MIND_CODEX_MODEL) args.push("-m", process.env.MIND_CODEX_MODEL);
  return [...args, "-"];
}

/** Whether a command answers on this machine. */
export function has(cmd) {
  return spawnSync(cmd, ["--version"], { shell: process.platform === "win32" }).status === 0;
}

/** Which CLI the Mind answers through on this machine: MIND_CLI if set, else Claude Code, else Codex. */
export function mindCli() {
  const pick = process.env.MIND_CLI;
  if (pick === "claude" || pick === "codex") return pick;
  return has("claude") ? "claude" : "codex";
}

/**
 * One question to Codex. Resolves with its answer, or rejects with why not. `onSpawn` gets the child, so a caller can
 * stop it when the player leaves.
 * @returns {Promise<{ text: string, ms: number }>}
 */
export function askCodex({ system, ask, effort, onSpawn }) {
  const started = Date.now();
  // By file, as the Claude path does: a late game's prompt passes 128 KiB, past what Linux takes as one argument.
  const dir = mkdtempSync(path.join(tmpdir(), "holos-mind-"));
  const file = path.join(dir, "system.txt");
  writeFileSync(file, system);
  return new Promise((resolve, reject) => {
    const child = spawn("codex", codexArgs(file, effort), { cwd: dir, shell: process.platform === "win32" });
    onSpawn?.(child);
    let buf = "";
    let err = "";
    let text = "";
    let failed = "";
    child.stdout.on("data", (chunk) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        let d;
        try {
          d = JSON.parse(line);
        } catch {
          continue;
        }
        // Codex may speak more than once in a turn. The last message is the answer.
        if (d.type === "item.completed" && d.item?.type === "agent_message") text = d.item.text ?? "";
        if (d.type === "turn.failed") failed = d.error?.message ?? "Codex failed.";
        if (d.type === "error") failed = d.message ?? "Codex failed.";
      }
    });
    child.stderr.on("data", (d) => (err += d));
    child.on("error", () => {
      rmSync(dir, { recursive: true, force: true });
      reject(new Error("No codex CLI on this machine."));
    });
    child.on("close", (code) => {
      rmSync(dir, { recursive: true, force: true });
      // An error event can be a retry Codex recovers from, so an answer wins over it.
      if (text && !code) return resolve({ text, ms: Date.now() - started });
      reject(new Error(failed || err.trim().slice(0, 200) || `codex exited ${code}`));
    });
    child.stdin.end(ask);
  });
}
