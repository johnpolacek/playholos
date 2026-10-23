// Serves evals/mind/review.html, for reading the Mind's traces by hand and marking each pass or fail with a note. The
// marks are kept in evals/mind/labels.json, keyed by trace file and case, as each is made. 2026-10-23. Run from game/:
// npm run review:mind, then open http://localhost:5190. With another port: npm run review:mind -- 5191.
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 5190);
const dir = new URL("../evals/mind/", import.meta.url);
const labelsAt = new URL("labels.json", dir);
const readLabels = () => (existsSync(labelsAt) ? JSON.parse(readFileSync(labelsAt, "utf8")) : {});

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (req.method === "GET" && pathname === "/") return send(res, 200, readFileSync(new URL("review.html", dir)), "text/html; charset=utf-8");
  if (req.method === "GET" && pathname === "/traces") {
    const files = existsSync(new URL("traces/", dir)) ? readdirSync(new URL("traces/", dir)).filter((f) => f.endsWith(".jsonl")) : [];
    return send(res, 200, files.sort().reverse());
  }
  const file = pathname.match(/^\/traces\/([\w-]+\.jsonl)$/)?.[1];
  if (req.method === "GET" && file) {
    const at = new URL(`traces/${file}`, dir);
    if (!existsSync(at)) return send(res, 404, { error: "No such file." });
    return send(res, 200, readFileSync(at, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line)));
  }
  if (req.method === "GET" && pathname === "/labels") return send(res, 200, readLabels());
  // One mark at a time, merged into the file, written whole and then moved into place so a crash can't half-write it.
  if (req.method === "POST" && pathname === "/labels") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { key, label } = JSON.parse(body);
    if (typeof key !== "string") return send(res, 400, { error: "No key." });
    const labels = readLabels();
    if (label) labels[key] = label;
    else delete labels[key];
    writeFileSync(new URL("labels.json.tmp", dir), JSON.stringify(labels, null, 2) + "\n");
    renameSync(new URL("labels.json.tmp", dir), labelsAt);
    return send(res, 200, { ok: true });
  }
  send(res, 404, { error: "Not found." });
}).listen(port, () => console.log(`Reading the Mind's traces at http://localhost:${port}`));
