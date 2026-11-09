import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { laneOf, regime } from "./regime.mjs";

// SUMMARY.md for a lane run: each lane's ratings, then every kept finding across lanes, worst impact first, lettered so
// one letter picks a fix. playtest-local.mjs writes it when its lanes finish. Run it alone to rebuild one. 2026-11-09.
//
//   node scripts/playtest-lanes.mjs playtests/<stamp>

const R = regime();
const IMPACT = R.lanes.impact.map((x) => x.id);
const letter = (i) => (i < 26 ? String.fromCharCode(97 + i) : letter(Math.floor(i / 26) - 1) + String.fromCharCode(97 + (i % 26)));
const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : "–");
const json = (f) => {
  try {
    return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
  } catch {
    return null;
  }
};

export function summarize(dir, done = []) {
  const ids = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
  const order = R.lanes.list.map((l) => l.id);
  const lanes = ids
    .filter((id) => laneOf(id, R))
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((id) => {
      const d = join(dir, id);
      return { id, lane: laneOf(id, R), got: json(join(d, "lane.json")), scores: json(join(d, "scores.json")), runner: json(join(d, "runner.json")), ran: done.find((x) => x.lane === id) };
    });
  // Lanes that never wrote a folder, like one stopped before it began, still show.
  for (const x of done) if (!lanes.some((l) => l.id === x.lane)) lanes.push({ id: x.lane, lane: laneOf(x.lane, R), ran: x });

  const rows = lanes.map(({ id, lane, got, scores, runner, ran }) => {
    const status = ran?.code ? `stopped, code ${ran.code}` : got?.captures ? "shot" : got ? "rated" : "no rating";
    const ratings = lane?.ratings?.length ? lane.ratings.map((r) => `${r.id} ${fmt(got?.ratings?.[r.id]?.score)}`).join(", ") : got?.captures ? `see playtests/captures/${got.captures}/` : "–";
    const mins = ran?.minutes ?? runner?.minutes ?? "–";
    const tokens = scores?.cost?.total ? `${(scores.cost.total / 1e6).toFixed(1)}M` : "–";
    return `| ${lane?.title ?? id} | ${status} | ${ratings} | ${mins} | ${tokens} |`;
  });

  const all = lanes.flatMap(({ id, lane, got }) => (got?.findings ?? []).filter((f) => f.kept).map((f) => ({ ...f, lane: lane?.title ?? id, dir: id })));
  const rank = (f) => (IMPACT.includes(f.impact) ? IMPACT.indexOf(f.impact) : IMPACT.length);
  all.sort((a, b) => rank(a) - rank(b));
  const calls = all.map((f, i) => `- (${letter(i)}) **${f.impact}**, ${f.lane}: ${f.title} (${f.where}, ${(f.evidence ?? []).map((e) => `${f.dir}/${e}`).join(", ")})${f.fix ? `\n  - Fix: ${f.fix}` : ""}`);

  const md = [
    `# Lanes, ${basename(dir)}`,
    "",
    "| Lane | Status | Ratings | Minutes | Tokens |",
    "|---|---|---|---|---|",
    ...rows,
    "",
    `## Findings, worst first: ${IMPACT.map((i) => `${all.filter((f) => f.impact === i).length} ${i}`).join(", ")}`,
    "",
    ...(calls.length ? calls : ["None kept."]),
    "",
    "Each lane's own LANE.md lists what its reader dropped, and why.",
    "",
  ].join("\n");
  const file = join(dir, "SUMMARY.md");
  writeFileSync(file, md);
  return file;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  const dir = arg && (existsSync(arg) ? arg : join("playtests", arg));
  if (!dir || !existsSync(dir)) {
    console.error("Usage: node scripts/playtest-lanes.mjs playtests/<stamp>");
    process.exit(1);
  }
  console.log(readFileSync(summarize(dir), "utf8"));
}
