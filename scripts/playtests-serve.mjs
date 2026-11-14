import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

// pnpm playtests:serve: the playtests folder at http://localhost:4400/, its home the regime page, playtests/regime.html,
// so the bare address opens it, and every run's screenshots, reports and captures beside it. Local only. It opens the
// page in the default browser, unless NO_OPEN is set, and if the server already runs, it only opens the page. 2026-11-08.

const root = fileURLToPath(new URL("../playtests/", import.meta.url));
const port = Number(process.env.PORT ?? 4400);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".jsonl": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif" };

const url = `http://localhost:${port}/`;
const open = () => {
  if (process.env.NO_OPEN) return;
  const cmd = process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  spawn(cmd[0], cmd[1], { stdio: "ignore", detached: true }).unref();
};

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  if (path === "/" || path === "/index.html") path = "/regime.html";
  const file = normalize(join(root, path));
  if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
});
server.on("error", (e) => {
  if (e.code !== "EADDRINUSE") throw e;
  console.log(`Playtests already served: ${url}`);
  open();
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Playtests: ${url}`);
  open();
});
