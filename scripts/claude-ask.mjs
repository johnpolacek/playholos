import { spawn } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLI_BARE } from "../game/scripts/ask-mind.mjs";

// One question to a reader on your own Claude login through the claude CLI, never an API key, with no tools, so it
// sees only what we hand it: text, and screenshots as images. The reply is parsed as JSON. The judge, the screen
// critic and the run rater share it. 2026-11-08. With `costTo`, it adds the ask's time and tokens to cost.jsonl in that
// folder, for scripts/run-cost.mjs.

/** Asks `text`, with the PNG files in `images` before it, and resolves to the JSON in the reply. */
export function askJson(text, { images = [], model = "opus", costTo, step = "ask" } = {}) {
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
