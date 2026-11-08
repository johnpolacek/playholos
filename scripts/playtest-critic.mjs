import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { askJson, pool } from "./claude-ask.mjs";
import { regime } from "./regime.mjs";
import { writeIndex } from "./states.mjs";

// The screen critic: a reader who never played and never saw the code scores each captured state from its screenshots
// alone, against the screen anchors in playtests/regime.html. It knows what each screen should show, never what a
// change meant to do, so it grades the pixels, not the intent. It asks on your own Claude login through the claude CLI.
// 2026-11-08.
//
//   npm run playtest:critic                         score the newest capture run
//   npm run playtest:critic <run>                   score a capture run in playtests/captures/
//
// CRITIC_MODEL picks the model, opus by default. It prints every rating that fell 2 or more since the last scored run.

const capDir = fileURLToPath(new URL("../playtests/captures/", import.meta.url));
const MODEL = process.env.CRITIC_MODEL ?? "opus";
const R = regime();
const S = R.screens;
const IDS = S.ratings.map((r) => r.id);

const runs = existsSync(capDir)
  ? readdirSync(capDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(capDir, d.name, "results.json")))
      .map((d) => d.name)
      .sort()
  : [];
const name = process.argv[2] ?? runs.at(-1);
if (!name || !runs.includes(name)) {
  console.error(name ? `No capture run ${name} in playtests/captures/.` : "No capture runs yet. Run npm run playtest:capture first.");
  process.exit(1);
}
const dir = join(capDir, name);
const results = JSON.parse(readFileSync(join(dir, "results.json"), "utf8"));

const anchors = S.ratings.map((r) => `${r.id}: ${r.q}\n${r.anchors.map((a, i) => `  ${R.anchorBands[i]}: ${a}`).join("\n")}`).join("\n");

const prompt = (state, vps) => `You review screens of a space game, Holos, as a careful player who has never played it. You never saw its code. You see only the screenshots above${vps.length > 1 ? `, one for each width: ${vps.join(", ")}` : ""}.

The screen is "${state.title}". What it should show: ${state.description}

Score each width 0 to 10 on each rating, from its anchors:
${anchors}

Rules:
${S.rules.map((r) => `- ${r}`).join("\n")}

Reply with JSON only, no other text:
{${vps.map((vp) => `"${vp}":{${IDS.map((id) => `"${id}":{"score":<0-10>,"why":"<one short line>"}`).join(",")},"worst":"<the worst thing on screen, and where>","fix":"<one fix>"}`).join(",")}}`;

const states = R.states.filter((s) => results.shots.some((x) => x.state === s.id && x.status === "ok"));
const scored = await pool(states, 4, async (state) => {
  const shots = results.shots.filter((x) => x.state === state.id && x.status === "ok");
  const vps = shots.map((x) => x.viewport);
  try {
    const got = await askJson(prompt(state, vps), { images: shots.map((x) => join(dir, x.file)), model: MODEL, costTo: dir, step: "critic" });
    for (const vp of vps) for (const id of IDS) if (typeof got[vp]?.[id]?.score !== "number") throw new Error(`no ${vp} ${id} score`);
    console.log(`${state.id}: ${vps.map((vp) => `${vp} ${IDS.map((id) => got[vp][id].score).join("/")}`).join(", ")}`);
    return [state.id, got];
  } catch (e) {
    console.warn(`${state.id}: ${e.message}`);
    return [state.id, { error: e.message }];
  }
});

const critic = { model: MODEL, at: new Date().toISOString(), states: Object.fromEntries(scored) };
writeFileSync(join(dir, "critic.json"), JSON.stringify(critic, null, 2) + "\n");
writeIndex();

// What fell since the last run the critic scored.
const before = runs
  .filter((r) => r < name && existsSync(join(capDir, r, "critic.json")))
  .map((r) => ({ r, c: JSON.parse(readFileSync(join(capDir, r, "critic.json"), "utf8")) }))
  .at(-1);
const mean = (xs) => (xs.length ? Math.round((10 * xs.reduce((a, b) => a + b, 0)) / xs.length) / 10 : null);
const all = Object.values(critic.states).flatMap((s) => Object.values(s).flatMap((v) => (v && typeof v === "object" ? IDS.map((id) => v[id]?.score).filter((x) => typeof x === "number") : [])));
console.log(`\nScored ${name}: mean ${mean(all)} over ${all.length} ratings, by ${MODEL}.`);
if (before) {
  const drops = [];
  for (const [id, s] of Object.entries(critic.states))
    for (const [vp, v] of Object.entries(s))
      for (const k of IDS) {
        const was = before.c.states[id]?.[vp]?.[k]?.score;
        const now = v?.[k]?.score;
        if (typeof was === "number" && typeof now === "number" && was - now >= 2) drops.push(`${id} ${vp} ${k}: ${was} to ${now}. ${v[k].why}`);
      }
  console.log(drops.length ? `Fell 2 or more since ${before.r}:\n${drops.map((d) => `  ${d}`).join("\n")}` : `Nothing fell 2 or more since ${before.r}.`);
}
