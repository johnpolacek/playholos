import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { tokens } from "./claude-ask.mjs";

// How long a playtest run took and how many tokens it spent, into its scores.json as "cost". The player's own tokens
// and time come from this Claude Code session's transcript, from its first message to now, with any subagents it
// spawned. The readers' come from cost.jsonl, which the rater, the judge and the critic add to as they ask. The game's
// Mind answers on its own CLI calls, which keep no transcript, so its tokens are not counted. 2026-11-08.
//
//   node scripts/run-cost.mjs playtests/<run>          run last, from the session that played, before playtest:score
//
// CLAUDE_CODE_SESSION_ID names the session. Without it, the newest transcript for this folder is taken.

const arg = process.argv[2];
const dir = arg && (existsSync(arg) ? arg : join("playtests", arg));
if (!dir || !existsSync(dir)) {
  console.error("Usage: node scripts/run-cost.mjs playtests/<run>");
  process.exit(1);
}

const projects = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"), "projects");
const slug = process.cwd().replace(/[^a-zA-Z0-9]/g, "-");
const jsonls = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith(".jsonl")).map((f) => join(d, f)) : []);

/** This session's transcript: by its id in any project folder, or the newest in this folder's. */
function transcript() {
  const id = process.env.CLAUDE_CODE_SESSION_ID;
  if (id && existsSync(projects))
    for (const p of readdirSync(projects)) {
      const f = join(projects, p, `${id}.jsonl`);
      if (existsSync(f)) return f;
    }
  return jsonls(join(projects, slug)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0] ?? null;
}

const add = (a, b) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + (b[k] ?? 0)]));
const zero = () => tokens({});
const sum = (t) => t.input + t.cacheWrite + t.cacheRead + t.output;

// The player: every reply once, by message id, as a reply split into parts repeats its usage on each.
const main = transcript();
let player = null;
if (main) {
  const files = [main, ...jsonls(join(main.replace(/\.jsonl$/, ""), "subagents"))];
  const seen = new Set();
  let t = zero(), first = null, replies = 0;
  const models = new Set();
  for (const f of files)
    for (const line of readFileSync(f, "utf8").split("\n")) {
      if (!line.trim()) continue;
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      if (f === main && e.timestamp && (!first || e.timestamp < first)) first = e.timestamp;
      const m = e.message;
      if (e.type !== "assistant" || !m?.usage || seen.has(m.id)) continue;
      seen.add(m.id);
      replies++;
      if (m.model) models.add(m.model);
      t = add(t, tokens(m.usage));
    }
  player = { session: basename(main, ".jsonl"), started: first, replies, models: [...models], tokens: t, total: sum(t) };
}

// The readers, from cost.jsonl here and beside the run's capture.
const readers = {};
for (const f of [join(dir, "cost.jsonl"), join("playtests", "captures", basename(dir), "cost.jsonl")])
  for (const line of existsSync(f) ? readFileSync(f, "utf8").split("\n") : []) {
    if (!line.trim()) continue;
    const c = JSON.parse(line);
    const r = (readers[c.step] ??= { asks: 0, secs: 0, tokens: zero(), usd: 0 });
    r.asks++;
    r.secs += c.secs ?? 0;
    r.tokens = add(r.tokens, c.usage ?? {});
    r.usd += c.usd ?? 0;
  }
for (const r of Object.values(readers)) {
  r.total = sum(r.tokens);
  r.usd = Math.round(r.usd * 100) / 100;
}

const ended = new Date().toISOString();
const minutes = player?.started ? Math.round((Date.parse(ended) - Date.parse(player.started)) / 60000) : null;
const total = (player?.total ?? 0) + Object.values(readers).reduce((a, r) => a + r.total, 0);
const output = (player?.tokens.output ?? 0) + Object.values(readers).reduce((a, r) => a + r.tokens.output, 0);
const cost = { minutes, started: player?.started ?? null, ended, total, output, player, readers };

const path = join(dir, "scores.json");
const scores = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
scores.cost = cost;
writeFileSync(path, JSON.stringify(scores, null, 2) + "\n");

const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);
console.log(`Run took ${minutes ?? "?"} min and ${k(total)} tokens, ${k(output)} of them output.`);
if (player) console.log(`  player: ${k(player.total)} over ${player.replies} replies, ${k(player.tokens.cacheRead)} read from cache. Transcript ${player.session}.`);
else console.log("  player: no transcript found, so no time or player tokens.");
for (const [step, r] of Object.entries(readers)) console.log(`  ${step}: ${k(r.total)} over ${r.asks} ask(s), ${r.secs}s.`);
