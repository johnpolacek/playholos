import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { askJson } from "./claude-ask.mjs";
import { laneOf, regime, settledLines } from "./regime.mjs";

// Rates one lane of a playtest, by a reader who didn't play. It sees only what the lane left: its logs, its findings,
// its report and its screenshots. It rates the lane's own question, checks each finding against its evidence, sets
// each one's impact by what it does to a player, and drops any outside the lane. Writes lane.json and LANE.md.
// 2026-11-09.
//
//   node scripts/playtest-lane-rate.mjs playtests/<stamp>/<lane> [--lane <id>]
//
// RATER_MODEL picks the model, opus by default.

const MODEL = process.env.RATER_MODEL ?? "opus";
const R = regime();
const MAX_SHOTS = 60;
const MAX_BYTES = 18 << 20;
const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--lane");
if (!dir || !existsSync(dir)) {
  console.error("Usage: node scripts/playtest-lane-rate.mjs playtests/<stamp>/<lane> [--lane <id>]");
  process.exit(1);
}
const read = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : null);
const id = args.includes("--lane") ? args[args.indexOf("--lane") + 1] : JSON.parse(read("scores.json") ?? "{}").lane ?? basename(dir);
const lane = laneOf(id);
if (!lane) {
  console.error(`No lane ${id}.`);
  process.exit(1);
}
const IMPACT = R.lanes.impact.map((x) => x.id);

// Screenshots, in the order taken: those the findings cite first, then the rest spread evenly, within one ask.
const pngs = [...(existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".png")) : []), ...(existsSync(join(dir, "blind")) ? readdirSync(join(dir, "blind")).filter((f) => f.endsWith(".png")).map((f) => `blind/${f}`) : [])].sort();
const findingsText = read("findings.jsonl") ?? "";
const cited = new Set(pngs.filter((f) => findingsText.includes(basename(f))));
const rest = pngs.filter((f) => !cited.has(f));
const picked = [...cited];
const room = Math.max(0, MAX_SHOTS - picked.length);
for (let i = 0; i < Math.min(room, rest.length); i++) picked.push(rest[Math.floor((i * rest.length) / Math.min(room, rest.length))]);
let bytes = 0;
const shots = pngs.filter((f) => picked.includes(f)).filter((f) => (bytes += (statSync(join(dir, f)).size * 4) / 3) <= MAX_BYTES);
if (shots.length < pngs.length) console.log(`Showing ${shots.length} of ${pngs.length} screenshots.`);

const numbered = (text, cap) =>
  (text ?? "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => `${i + 1}: ${l}`)
    .join("\n")
    .slice(0, cap);
const block = (name, text, cap = 120_000) => (text ? `<${name}>\n${numbered(text, cap)}\n</${name}>` : `<${name}>(none)</${name}>`);

const prompt = `You read one lane of a playtest of the space game Holos. You did not play it. A lane asks one question and only that.

Lane: ${lane.title}
Its question: ${lane.question}
Who played: ${lane.who}
Out of this lane: ${lane.out.length ? lane.out.join(" ") : "nothing named"}

Above are the lane's screenshots, in the order taken. Below are what the player left: its logs, its findings and its report. Judge what the screenshots and logs show, not what the player says it meant.

1. Rate the lane's question on each rating below, 0.0 to 10.0, from its anchors. Use one decimal: the band sets the whole number's range, the decimal where in it. Cite a screenshot file or a log line, as file:line, for each. If the run never reached it, give null and say why.
${lane.ratings.map((r) => `- ${r.id}: ${r.q}\n${r.anchors.map((a, i) => `    ${R.anchorBands[i]}: ${a}`).join("\n")}`).join("\n")}

2. List the findings. Start from the player's findings, then add any the logs and screenshots plainly show that it missed. For each:
- Keep it only if it is inside the lane's question and the evidence shows it. Set "kept": false with a reason if not.
- Set its impact by what it does to a player, worst first:
${R.lanes.impact.map((x) => `  - ${x.id}: ${x.what}`).join("\n")}
- Drop any that are known gaps or settled design calls:
${R.knownGaps.map((x) => `  - gap: ${x}`).join("\n")}
${settledLines(R).map((x) => `  ${x}`).join("\n")}
- Write the title as one plain sentence saying what is wrong. Write fix as one plain sentence saying what would make it right, or null.

${block("findings.jsonl", findingsText)}

${block("log.jsonl", read("log.jsonl"))}

${block("blind.jsonl", read("blind.jsonl"))}

${read("quiz.md") ? `<quiz.md>\n${read("quiz.md").slice(0, 20_000)}\n</quiz.md>` : ""}

<REPORT.md>
${(read("REPORT.md") ?? "(none)").slice(0, 20_000)}
</REPORT.md>

Reply with JSON only, no other text:
{"ratings":{${lane.ratings.map((r) => `"${r.id}":{"score":<0.0-10.0 or null>,"why":"<one short line>","evidence":["<file or file:line>"]}`).join(",")}},"findings":[{"title":"<one sentence>","impact":"<${IMPACT.join("|")}>","kept":<true|false>,"reason":"<why dropped, or null>","where":"<screen or place>","evidence":["<file or file:line>"],"fix":"<one sentence or null>","from":"<player|reader>"}]}`;

const got = await askJson(prompt, { images: shots.map((f) => join(dir, f)), model: MODEL, costTo: dir, step: "lane-rater" });
const rank = (f) => (IMPACT.includes(f.impact) ? IMPACT.indexOf(f.impact) : IMPACT.length);
const findings = (got.findings ?? []).sort((a, b) => Number(b.kept) - Number(a.kept) || rank(a) - rank(b));
const out = { lane: lane.id, model: MODEL, shots: shots.length, of: pngs.length, ratings: got.ratings ?? {}, findings };
writeFileSync(join(dir, "lane.json"), JSON.stringify(out, null, 2) + "\n");

const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : "–");
const kept = findings.filter((f) => f.kept);
const md = [
  `# ${lane.title}, ${basename(join(dir, ".."))}`,
  "",
  `**${lane.question}**`,
  "",
  "| Rating | Score | Why | Evidence |",
  "|---|---|---|---|",
  ...lane.ratings.map((r) => {
    const g = got.ratings?.[r.id] ?? {};
    return `| ${r.id} | ${fmt(g.score)} | ${(g.why ?? "").replace(/\|/g, "/")} | ${(g.evidence ?? []).join(", ")} |`;
  }),
  "",
  `## Findings, ${kept.length} kept`,
  "",
  ...IMPACT.flatMap((imp) => {
    const fs = kept.filter((f) => f.impact === imp);
    return fs.length ? [`### ${imp}`, "", ...fs.map((f) => `- ${f.title} (${f.where}, ${f.evidence.join(", ")})${f.fix ? `\n  - Fix: ${f.fix}` : ""}`), ""] : [];
  }),
  ...(findings.length > kept.length ? ["## Dropped", "", ...findings.filter((f) => !f.kept).map((f) => `- ${f.title}: ${f.reason}`), ""] : []),
].join("\n");
writeFileSync(join(dir, "LANE.md"), md);
console.log(`${lane.id}: ${lane.ratings.map((r) => `${r.id} ${fmt(got.ratings?.[r.id]?.score)}`).join(", ")}. ${kept.length} findings kept: ${IMPACT.map((i) => `${kept.filter((f) => f.impact === i).length} ${i}`).join(", ")}.`);
