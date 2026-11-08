import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLI_BARE } from "../game/scripts/ask-mind.mjs";

// One question to a reader on your own Claude login through the claude CLI, never an API key, with no tools, so it
// sees only what we hand it: text, and screenshots as images. The reply is parsed as JSON. The judge, the screen
// critic and the run rater share it. 2026-11-08. With `costTo`, it adds the ask's time and tokens to cost.jsonl in that
// folder, for scripts/run-cost.mjs.

/** Asks `text`, with the PNG files in `images` before it, and resolves to the JSON in the reply. `via: "codex"` asks
 *  OpenAI's model through the codex CLI on your ChatGPT login instead, read-only, for a second reader's view. */
export function askJson(text, { images = [], model = "opus", costTo, step = "ask", via = "claude" } = {}) {
  if (via === "codex") return askCodex(text, { images, costTo, step });
  const started = Date.now();
  const dir = mkdtempSync(join(tmpdir(), "holos-ask-"));
  const content = [
    ...images.flatMap((file) => [
      { type: "text", text: `Screenshot ${file.split("/").pop()}:` },
      { type: "image", source: { type: "base64", media_type: "image/png", data: readFileSync(file).toString("base64") } },
    ]),
    { type: "text", text },
  ];
  return new Promise((resolve, reject) => {
    const child = spawn("claude", [...CLI_BARE, "--model", model, "--input-format", "stream-json", "--output-format", "stream-json", "--verbose"], { cwd: dir });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", () => reject(new Error("No claude CLI on this machine.")));
    child.on("close", (code) => {
      const last = out
        .split("\n")
        .filter((l) => l.includes('"type":"result"'))
        .at(-1);
      if (code || !last) return reject(new Error(err.trim().slice(0, 300) || `claude exited ${code}`));
      try {
        const done = JSON.parse(last);
        if (costTo)
          appendFileSync(
            join(costTo, "cost.jsonl"),
            JSON.stringify({ step, model, secs: Math.round((Date.now() - started) / 1000), usage: tokens(done.usage), usd: done.total_cost_usd ?? null }) + "\n",
          );
        const result = String(done.result);
        const open = result.search(/[[{]/);
        const close = Math.max(result.lastIndexOf("}"), result.lastIndexOf("]"));
        resolve(JSON.parse(result.slice(open, close + 1)));
      } catch {
        reject(new Error(`The reply wasn't JSON: ${last.slice(0, 300)}`));
      }
    });
    child.stdin.end(JSON.stringify({ type: "user", message: { role: "user", content } }) + "\n");
  });
}

/** The JSON in a reply's text: from its first brace or bracket to its last. */
const jsonIn = (text) => {
  const open = text.search(/[[{]/);
  const close = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  return JSON.parse(text.slice(open, close + 1));
};

// The second reader: Codex, in a read-only sandbox in an empty folder, so it too sees only what we hand it. Its model
// is CODEX_MODEL, else whatever ~/.codex/config.toml sets. 2026-11-08.
export const CODEX_MODEL = process.env.CODEX_MODEL;
export const codexLabel = () => `codex${CODEX_MODEL ? ` ${CODEX_MODEL}` : ""}`;
function askCodex(text, { images, costTo, step }) {
  const started = Date.now();
  const dir = mkdtempSync(join(tmpdir(), "holos-codex-"));
  const last = join(dir, "last.txt");
  const a = ["exec", "--skip-git-repo-check", "--ephemeral", "-s", "read-only", "--json", "-o", last, ...(CODEX_MODEL ? ["-m", CODEX_MODEL] : []), ...images.flatMap((f) => ["-i", f]), "-"];
  return new Promise((resolve, reject) => {
    const child = spawn("codex", a, { cwd: dir });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", () => reject(new Error("No codex CLI on this machine.")));
    child.on("close", (code) => {
      if (code) return reject(new Error(err.trim().split("\n").at(-1)?.slice(0, 300) || `codex exited ${code}`));
      try {
        const usage = codexUsage(out);
        if (costTo) appendFileSync(join(costTo, "cost.jsonl"), JSON.stringify({ step: `${step} (codex)`, model: codexLabel(), secs: Math.round((Date.now() - started) / 1000), usage, usd: null }) + "\n");
        resolve(jsonIn(readFileSync(last, "utf8")));
      } catch {
        reject(new Error(`Codex's reply wasn't JSON: ${(existsSync(last) ? readFileSync(last, "utf8") : out).slice(0, 300)}`));
      }
    });
    child.stdin.end(text);
  });
}

/** Codex's tokens from its --json events, in the same kinds as ours. */
export function codexUsage(jsonl) {
  const t = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
  for (const line of jsonl.split("\n")) {
    if (!line.includes('"turn.completed"')) continue;
    try {
      const u = JSON.parse(line).usage ?? {};
      t.cacheRead += u.cached_input_tokens ?? 0;
      t.input += (u.input_tokens ?? 0) - (u.cached_input_tokens ?? 0);
      t.cacheWrite += u.cache_write_input_tokens ?? 0;
      t.output += (u.output_tokens ?? 0) + (u.reasoning_output_tokens ?? 0);
    } catch {}
  }
  return t;
}

/** Runs `f` over `xs`, at most `n` at once, in order. */
export async function pool(xs, n, f) {
  const out = new Array(xs.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, xs.length) }, async () => {
      while (i < xs.length) {
        const k = i++;
        out[k] = await f(xs[k], k);
      }
    }),
  );
  return out;
}

/** A reply's tokens, by kind: new input, input written to the cache, input read from it, and output. */
export const tokens = (u = {}) => ({
  input: u.input_tokens ?? 0,
  cacheWrite: u.cache_creation_input_tokens ?? 0,
  cacheRead: u.cache_read_input_tokens ?? 0,
  output: u.output_tokens ?? 0,
});
