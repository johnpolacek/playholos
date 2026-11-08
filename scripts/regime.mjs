import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The playtest regime, read from the JSON block in playtests/regime.html, its source of truth. The scorer, the judge
// and the routines read it here. 2026-11-08.
//
//   node scripts/regime.mjs scenario <id>     a scenario's steps and expectations, for the cloud playtest
//   node scripts/regime.mjs scenarios         the scenario ids, in turn
//   node scripts/regime.mjs quiz              the blind quiz's questions, with no full marks, for the blind player
//   node scripts/regime.mjs players           the players and their ratings, with anchors, for rating a run
//   node scripts/regime.mjs formats           the files a run writes
//   node scripts/regime.mjs gaps              known gaps, not to report

const file = fileURLToPath(new URL("../playtests/regime.html", import.meta.url));

export function regime() {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<script type="application\/json" id="regime">([\s\S]*?)<\/script>/);
  if (!m) throw new Error("No regime block in playtests/regime.html.");
  return JSON.parse(m[1]);
}

/** Each player's rating ids, in order. */
export const povs = (r = regime()) => Object.fromEntries(r.players.map((p) => [p.id, p.ratings.map((x) => x.id)]));

const print = (lines) => console.log(lines.join("\n"));

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = regime();
  const [what, id] = process.argv.slice(2);
  if (what === "scenarios") print(r.scenarios.map((s, i) => `${i + 1}. ${s.id}: ${s.what}`));
  else if (what === "scenario") {
    const s = r.scenarios.find((x) => x.id === id);
    if (!s) {
      console.error(`No scenario ${id}. The scenarios: ${r.scenarios.map((x) => x.id).join(", ")}.`);
      process.exit(1);
    }
    print([`# Scenario: ${s.id}`, "", s.what, "", "## Steps", "", ...s.steps.map((x) => `- ${x}`), "", "## Expect", "", ...s.expect.map((x, i) => `${s.id}-${i + 1}. ${x}`), "", `Stop: ${s.stop}`]);
  } else if (what === "quiz") {
    const q = r.quiz;
    print([
      `# Blind quiz, version ${q.version}`,
      "",
      `## Check-ins, every ${q.checkin.every} actions`,
      "",
      ...q.checkin.questions.map((x) => `- ${x.id}: ${x.q}`),
      "",
      "## Once, when play stops",
      "",
      ...q.once.map((x) => `- ${x.id}: ${x.q}`),
      ...q.ungraded.map((x) => `- ${x.id}: ${x.q}`),
    ]);
  } else if (what === "players")
    print(
      r.players.flatMap((p) => [
        `## ${p.id}`,
        "",
        p.who,
        "",
        ...p.ratings.map((x) =>
          x.code || x.judge ? `- ${x.id} (${x.code ? "code" : "judge"}, leave out): ${x.q}` : `- ${x.id}: ${x.q} ${x.anchors.map((a, i) => `${r.anchorBands[i]}: ${a}.`).join(" ")}`,
        ),
        "",
      ]).concat(["## Rules", "", ...r.ratingRules.map((x) => `- ${x}`)]),
    );
  else if (what === "gaps") print(r.knownGaps.map((x) => `- ${x}`));
  else if (what === "formats")
    print(Object.entries(r.formats).flatMap(([k, v]) => [`## ${k}`, "", ...(Array.isArray(v) ? v.map((x) => (x.startsWith("{") ? x : `- ${x}`)) : [v]), ""]));
  else {
    console.error("Usage: node scripts/regime.mjs scenarios | scenario <id> | quiz | players | formats | gaps");
    process.exit(1);
  }
}
