// Uploads each seed's world, game/data/worlds/<seed>.json.gz, to the private R2 bucket the Worker reads them from.
// Run: npm run worlds (the live bucket, before each deploy), or npm run worlds:local (the dev server's copy).
// Only worlds whose bytes changed are sent: a sidecar of hashes records what the bucket holds. 2026-10-31.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const BUCKET = "holos-worlds";
const local = process.argv.includes("--local");
const DIR = path.join(import.meta.dirname, "../data/worlds");
const SENT = path.join(import.meta.dirname, "../.wrangler", local ? "worlds-local.json" : "worlds-remote.json");

const sent = existsSync(SENT) ? JSON.parse(readFileSync(SENT, "utf8")) : {};
let n = 0;
for (const name of readdirSync(DIR).filter((f) => f.endsWith(".json.gz")).sort()) {
  const file = path.join(DIR, name);
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  if (sent[name] === hash) continue;
  execFileSync("npx", ["wrangler", "r2", "object", "put", `${BUCKET}/${name}`, "--file", file,
    "--content-type", "application/gzip", local ? "--local" : "--remote"], { stdio: ["ignore", "ignore", "inherit"], shell: process.platform === "win32" });
  sent[name] = hash; n++;
  writeFileSync(SENT, JSON.stringify(sent, null, 2));
}
console.log(`${n} worlds sent to ${local ? "the local" : "the live"} ${BUCKET}, the rest unchanged.`);
