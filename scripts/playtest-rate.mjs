import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { askJson, codexLabel } from "./claude-ask.mjs";
import { regime } from "./regime.mjs";

// Rates a cloud playtest as its three players, by a reader who didn't play. The player who played knows what each step
// meant to test, so it grades the intent. The rater sees only what the run left: its log and its screenshots, never
// the player's report or the code. It asks on your own Claude login through the claude CLI. 2026-11-08.
//
//   pnpm playtest:rate playtests/<run>        rate the run into its scores.json, then run pnpm playtest:score
//
// RATER_MODEL picks the model, opus by default. Ratings the player wrote itself are kept under "self", never scored.

const MODEL = process.env.RATER_MODEL ?? "opus";
const R = regime();
const PLAYERS = R.players.filter((p) => R.routines.find((r) => r.id === "cloud").players.includes(p.id));
// What one ask can carry: the API takes up to 100 images and 32 MB a request.
const MAX_SHOTS = 60;
const MAX_BYTES = 18 << 20;

const arg = process.argv[2];
const dir = arg && (existsSync(arg) ? arg : join("playtests", arg));
if (!dir || !existsSync(dir)) {
  console.error("Usage: pnpm playtest:rate playtests/<run>");
  process.exit(1);
}
const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : null);
const log = read("log.jsonl") ?? "";
const scores = JSON.parse(read("scores.json") ?? "{}");
const scenario = R.scenarios.find((s) => s.id === scores.scenario);

// The screenshots, in the order taken. Those the log cites come first, then the rest spread evenly, within what one
// ask can carry.
const pngs = readdirSync(dir)
  .filter((f) => f.endsWith(".png"))
  .sort();
const cited = new Set([...log.matchAll(/"shot":"([^"]+\.png)"/g)].map((m) => m[1]).filter((f) => pngs.includes(f)));
const rest = pngs.filter((f) => !cited.has(f));
const picked = [...cited];
const room = Math.max(0, MAX_SHOTS - picked.length);
for (let i = 0; i < Math.min(room, rest.length); i++) picked.push(rest[Math.floor((i * rest.length) / Math.min(room, rest.length))]);
let bytes = 0;
const shots = pngs.filter((f) => picked.includes(f)).filter((f) => (bytes += (statSync(join(dir, f)).size * 4) / 3) <= MAX_BYTES);
if (shots.length < pngs.length) console.log(`Showing ${shots.length} of ${pngs.length} screenshots.`);

const ratings = (p) => p.ratings.filter((r) => !r.code && !r.judge);
const rules = R.ratingRules.filter((r) => !/computed|playtest:rate/.test(r));

const prompt = `You rate a playtest of the space game Holos. You did not play it. Someone else played${scenario ? ` the scenario "${scenario.title}": ${scenario.what}` : ""}, and left the screenshots above, in the order taken, and the log below, one JSON line per event: Next stops, questions to the Mind with its answers, console errors, checks. Notes in a "note" field are the player's own.

Rate the run as each player below, 0.0 to 10.0 a rating, from its anchors. Use one decimal, like 6.5: the band sets the whole number's range, and the decimal says where in it, so 6.0 only just reached the band and 8.9 nearly reached the next. Judge what the screenshots and the log show, not what the player says it meant.

${PLAYERS.map((p) => `## ${p.id}\n${p.who}\n${ratings(p).map((r) => `- ${r.id}: ${r.q}\n${r.anchors.map((a, i) => `    ${R.anchorBands[i]}: ${a}`).join("\n")}`).join("\n")}`).join("\n\n")}

Rules:
${rules.map((r) => `- ${r}`).join("\n")}
- Evidence is a screenshot's file name from above, or a log line as log.jsonl:<line>.

<log>
${log
  .split("\n")
  .filter((l) => l.trim())
  .map((l, i) => `${i + 1}: ${l}`)
  .join("\n")
  .slice(0, 200_000) || "(no log)"}
</log>

Reply with JSON only, no other text:
{${PLAYERS.map((p) => `"${p.id}":{${ratings(p).map((r) => `"${r.id}":{"score":<0.0-10.0 or null>,"why":"<one short line>","evidence":["<file or log line>"]}`).join(",")}}`).join(",")}}`;

// Claude rates, and the second reader the regime names rates the same run at once, kept apart and never averaged in.
const second = (process.env.SECOND_READER ?? R.secondReader) === "codex" && !process.argv.includes("--claude-only");
const images = shots.map((f) => join(dir, f));
const [got, other] = await Promise.all([
  askJson(prompt, { images, model: MODEL, costTo: dir, step: "rater" }),
  second ? askJson(prompt, { images, costTo: dir, step: "rater", via: "codex" }).catch((e) => (console.warn(`Second reader: ${e.message}`), null)) : null,
]);

for (const p of PLAYERS) {
  const mine = scores[p.id] ?? {};
  // The player's own ratings, if it gave any, are kept apart and never scored.
  const own = Object.fromEntries(Object.entries(mine).filter(([k, v]) => ratings(p).some((r) => r.id === k) && v?.by !== "rater"));
  if (Object.keys(own).length) scores.self = { ...scores.self, [p.id]: own };
  scores[p.id] = { ...mine };
  for (const r of ratings(p)) {
    const g = got[p.id]?.[r.id];
    if (!g || (g.score !== null && typeof g.score !== "number")) throw new Error(`The rater gave no ${p.id} ${r.id}.`);
    scores[p.id][r.id] = { score: g.score, why: g.why, evidence: g.evidence ?? [], by: "rater", model: MODEL };
  }
}
if (other) scores.second = { via: "codex", model: codexLabel(), ratings: other };
scores.rated = { by: "rater", model: MODEL, shots: shots.length, of: pngs.length };
writeFileSync(join(dir, "scores.json"), JSON.stringify(scores, null, 2) + "\n");
for (const p of PLAYERS) console.log(`${p.id}: ${ratings(p).map((r) => `${r.id} ${scores[p.id][r.id].score ?? "–"}${other ? `/${other[p.id]?.[r.id]?.score ?? "–"}` : ""}`).join(", ")}${other ? "  (Claude/second reader)" : ""}`);
console.log(`\nWrote ${join(dir, "scores.json")}. Next: pnpm playtest:score ${dir}`);
