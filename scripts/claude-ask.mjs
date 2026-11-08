import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLI_BARE } from "../game/scripts/ask-mind.mjs";

// One question to a reader on your own Claude login through the claude CLI, never an API key, with no tools, so it
// sees only what we hand it: text, and screenshots as images. The reply is parsed as JSON. The judge, the screen
// critic and the run rater share it. 2026-11-08.

/** Asks `text`, with the PNG files in `images` before it, and resolves to the JSON in the reply. */
export function askJson(text, { images = [], model = "opus" } = {}) {
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
        const result = String(JSON.parse(last).result);
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
