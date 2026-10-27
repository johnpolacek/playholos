// Asks the Mind on a running dev server, as the Mind tab does, and reads its answer back from the stream, or on the
// Claude CLI with the prompt the dev server builds. Shared by check-mind.mjs and trace-mind.mjs. 2026-10-23.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { MIND_EFFORT, MIND_MODEL } from "../lib/access.ts";

// The code in .dev.vars opens the Mind, as the Mind tab's cookie does. It is never printed.
const vars = new URL("../.dev.vars", import.meta.url);
const code = existsSync(vars)
  ? readFileSync(vars, "utf8")
      .match(/^ACCESS_CODE=(.*)$/m)?.[1]
      ?.trim()
      .replace(/^"|"$/g, "")
  : undefined;
const cookie = code ? { cookie: `holos-access=${encodeURIComponent(code)}` } : {};

/** What the Mind says to one question, and on the dev server, what it was told. Null if nothing answers at `base`. */
export async function askMind(base, { ask, ...save }) {
  const started = Date.now();
  let res;
  try {
    res = await fetch(`${base}/api/mind`, {
      method: "POST",
      headers: { "content-type": "application/json", ...cookie },
      body: JSON.stringify({ messages: [{ id: "q", role: "user", parts: [{ type: "text", text: ask }] }], ...save }),
    });
  } catch {
    return null;
  }
  if (save.dry) return { ok: res.ok, status: res.status, ...(res.ok ? await res.json() : {}) };
  // The answer streams back as events. Its words are the text deltas, and the dev server's first event carries what
  // the Mind was told.
  let text = "";
  let told;
  let usage;
  for (const line of (await res.text()).split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === "text-delta") text += d.delta;
      if (d.type === "error") text += `[error: ${d.errorText}]`;
      told ??= d.messageMetadata?.told;
      // The last event carries what the answer used.
      usage = d.messageMetadata?.usage ?? usage;
    } catch {
      // The stream's last line, [DONE], isn't JSON.
    }
  }
  return { ok: res.ok, status: res.status, text, told, usage, ms: Date.now() - started };
}

// The Claude CLI on its own login, as close to the Worker's call as a login allows: the same model and effort, the
// Mind's prompt alone, and no tools, hooks, settings, memory, MCP servers or skills, from a folder with no CLAUDE.md.
// A login can't turn off what the CLI adds itself: today's date, a block on this machine, the account's email, and a
// line saying it runs in the Claude Agent SDK, which it repeats when asked what it is. So a CLI trace that leans on
// 2026 or the SDK is the CLI's doing, until the same case fails --via api. 2026-10-23.
// Shared with the dev server's Mind on the login, in mind-cli.ts.
export const CLI_BARE = [
  "-p", "--tools", "", "--setting-sources", "", "--settings", '{"disableAllHooks":true}',
  "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence", "--no-chrome",
];
const CLI = [...CLI_BARE, "--model", MIND_MODEL, "--effort", MIND_EFFORT, "--output-format", "json"];
function askCli(system, ask) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn("claude", [...CLI, "--system-prompt", system], { cwd: tmpdir() });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", () => resolve({ ok: false, status: "no claude CLI", text: "" }));
    child.on("close", () => {
      const ms = Date.now() - started;
      try {
        const d = JSON.parse(out);
        resolve({ ok: !d.is_error, status: d.is_error ? `CLI: ${d.result}` : 200, text: d.is_error ? "" : d.result, ms });
      } catch {
        resolve({ ok: false, status: `CLI: ${(err || out).trim().slice(0, 200)}`, text: "", ms });
      }
    });
    child.stdin.end(ask);
  });
}

/** The same question on the Claude CLI: the dev server builds what the Mind is told, without asking it, and the CLI
 *  asks. Free on the login, where the API spends the key. Null if nothing answers at `base`. */
export async function askMindCli(base, { ask, ...save }) {
  const prompt = await askMind(base, { ask, dry: true, ...save });
  if (!prompt) return null;
  if (!prompt.system) return { ok: false, status: prompt.status, text: "" };
  return { ...(await askCli(prompt.system, ask)), told: prompt.told };
}
