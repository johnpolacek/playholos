import { spawn } from "node:child_process";
import type { IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import { createUIMessageStream, pipeUIMessageStreamToResponse, type UIMessage } from "ai";
import type { Plugin } from "vite";
import { readMindPick, type Usage } from "./lib/access.ts";
import { CLI_BARE } from "./scripts/ask-mind.mjs";

// With MIND_VIA=cli, the dev server's Mind answers on your own Claude login through the claude CLI, not the API key,
// so play while we build spends the subscription. The Worker still builds what the Mind is told, asked dry, and still
// says whether the Mind is open. The CLI takes one prompt, so earlier turns ride in the system prompt. 2026-10-25.

const DRY = "x-holos-dry";
/** Said on what we ask the Worker, so it opens the Mind without a key or code: the CLI spends none. The Worker takes
 *  it only on the dev server. A .dev.vars with ACCESS_CODE locked the CLI Mind until 2026-10-30. */
export const CLI = "x-holos-cli";

async function bodyOf(req: IncomingMessage) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || "{}");
}

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

// The talk before this question, for the system prompt, so the question itself stays as the Will asked it.
function talkOf(messages: UIMessage[]) {
  const before = messages.slice(0, -1);
  if (!before.length) return "";
  const talk = before.map((m) => `${m.role === "user" ? "The Will" : "We"}: ${textOf(m)}`).join("\n\n");
  return `\n\nOur talk so far, which you remember as your own and never recite:\n\n${talk}`;
}

export const mindCli: Plugin = {
  name: "holos-mind-cli",
  apply: () => process.env.MIND_VIA === "cli",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // The Mind answers on our login here, so it is open to whoever plays on this server.
      if (req.method === "GET" && req.url === "/api/access") {
        res.setHeader("content-type", "application/json");
        return res.end(JSON.stringify({ open: "code" }));
      }
      if (req.method !== "POST" || req.url !== "/api/mind" || req.headers[DRY]) return next();
      const body = await bodyOf(req);
      // Asked dry, as trace:mind asks, the Worker answers. Its body was read here, so it goes on whole.
      if (body.dry) {
        const dry = await fetch(`http://${req.headers.host}/api/mind`, {
          method: "POST",
          headers: { "content-type": "application/json", cookie: req.headers.cookie ?? "", [DRY]: "1", [CLI]: "1" },
          body: JSON.stringify(body),
        });
        res.statusCode = dry.status;
        res.setHeader("content-type", "application/json");
        return res.end(await dry.text());
      }
      // The Worker builds the prompt and checks the cookie, as it does for every question.
      const told = await fetch(`http://${req.headers.host}/api/mind`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: req.headers.cookie ?? "", [DRY]: "1", [CLI]: "1" },
        body: JSON.stringify({ ...body, dry: true }),
      });
      if (!told.ok) {
        res.statusCode = told.status;
        res.setHeader("content-type", "application/json");
        return res.end(await told.text());
      }
      const { system } = (await told.json()) as { system: string };
      const { model, effort } = readMindPick(body.pick);
      const args = [...CLI_BARE, "--model", model, "--effort", effort, "--system-prompt", system + talkOf(body.messages)];
      args.push("--output-format", "stream-json", "--verbose", "--include-partial-messages");
      const stream = createUIMessageStream({
        execute: ({ writer }) =>
          new Promise<void>((resolve, reject) => {
            const child = spawn("claude", args, { cwd: tmpdir() });
            req.on("close", () => child.kill());
            let buf = "";
            let err = "";
            let started = false;
            child.stdout.on("data", (chunk) => {
              buf += chunk;
              const lines = buf.split("\n");
              buf = lines.pop()!;
              for (const line of lines) {
                let d;
                try {
                  d = JSON.parse(line);
                } catch {
                  continue;
                }
                const delta = d.type === "stream_event" && d.event.type === "content_block_delta" ? d.event.delta : null;
                if (delta?.type === "text_delta") {
                  if (!started) writer.write({ type: "text-start", id: "a" });
                  started = true;
                  writer.write({ type: "text-delta", id: "a", delta: delta.text });
                }
                if (d.type === "result") {
                  if (started) writer.write({ type: "text-end", id: "a" });
                  if (d.is_error) return reject(new Error(String(d.result)));
                  const u = d.usage ?? {};
                  const usage: Usage = {
                    model,
                    input: u.input_tokens ?? 0,
                    cacheRead: u.cache_read_input_tokens ?? 0,
                    cacheWrite: u.cache_creation_input_tokens ?? 0,
                    output: u.output_tokens ?? 0,
                  };
                  writer.write({ type: "message-metadata", messageMetadata: { usage } });
                }
              }
            });
            child.stderr.on("data", (d) => (err += d));
            child.on("error", () => reject(new Error("No claude CLI on this machine.")));
            child.on("close", (code) => (code ? reject(new Error(err.trim().slice(0, 200) || `claude exited ${code}`)) : resolve()));
            child.stdin.end(textOf(body.messages.at(-1)));
          }),
        onError: (e) => {
          console.error("Mind (CLI):", e instanceof Error ? e.message : String(e));
          return "The Mind can’t answer on the Claude login right now.";
        },
      });
      pipeUIMessageStreamToResponse({ response: res, stream });
    });
  },
};
