import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import { readFile } from "node:fs/promises";

// npm run playtest:page: scores every run, local and on pushed playtest branches, into playtests/runs.json, then serves
// playtests/regime.html, the regime and its results, and opens it. 2026-11-08.

const port = Number(process.env.PORT || 4181);
spawnSync(process.execPath, [new URL("./playtest-score.mjs", import.meta.url).pathname], { stdio: "inherit" });

const FILES = { "/": ["regime.html", "text/html; charset=utf-8"], "/runs.json": ["runs.json", "application/json"] };
http
  .createServer(async (req, res) => {
    const f = FILES[req.url?.split("?")[0]];
    if (!f) return res.writeHead(404).end("Not found");
    try {
      res.setHeader("Content-Type", f[1]);
      res.setHeader("Cache-Control", "no-store");
      res.end(await readFile(new URL(`../playtests/${f[0]}`, import.meta.url)));
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`\nHolos playtests: ${url}`);
    if (!process.env.NO_OPEN) spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore", detached: true }).unref();
  });
