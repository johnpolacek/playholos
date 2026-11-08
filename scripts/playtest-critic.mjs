import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { askJson, pool } from "./claude-ask.mjs";
import { regime } from "./regime.mjs";
import { writeIndex } from "./states.mjs";

// Readers who never played and never saw the code judge a capture run from its screenshots alone, against the anchors
// in playtests/regime.html. They know what each screen should show, never what a change meant to do, so they grade the
// pixels, not the intent. Three passes, on your own Claude login through the claude CLI. 2026-11-08.
//
//   screens   each state on its own, laptop and phone: purpose, hierarchy, legibility, wonder
//   design    every state at once, so it can judge how they hold together: consistency, spacing, type, clutter
//   editor    each state's words beside its screenshot: clarity and concision, with the lines rewritten shorter
//
//   npm run playtest:critic                         every pass on the newest capture run
//   npm run playtest:critic <run>                   a capture run in playtests/captures/
//   npm run playtest:critic -- --only design,editor
//
// CRITIC_MODEL picks the model, opus by default. It prints every rating that fell 2 or more since the last scored run.

const capDir = fileURLToPath(new URL("../playtests/captures/", import.meta.url));
const MODEL = process.env.CRITIC_MODEL ?? "opus";
const R = regime();
const args = process.argv.slice(2);
const onlyAt = args.indexOf("--only");
const PASSES = onlyAt < 0 ? ["screens", "design", "editor"] : args[onlyAt + 1].split(",");
const named = args.find((a, i) => !a.startsWith("--") && i !== onlyAt + 1);

const runs = existsSync(capDir)
  ? readdirSync(capDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(capDir, d.name, "results.json")))
      .map((d) => d.name)
      .sort()
  : [];
const name = named ?? runs.at(-1);
if (!name || !runs.includes(name)) {
  console.error(name ? `No capture run ${name} in playtests/captures/.` : "No capture runs yet. Run npm run playtest:capture first.");
  process.exit(1);
}
const dir = join(capDir, name);
const results = JSON.parse(readFileSync(join(dir, "results.json"), "utf8"));
const ask = (text, images, step) => askJson(text, { images: images.map((f) => join(dir, f)), model: MODEL, costTo: dir, step });

const anchorsOf = (ratings) => ratings.map((r) => `${r.id}: ${r.q}\n${r.anchors.map((a, i) => `  ${R.anchorBands[i]}: ${a}`).join("\n")}`).join("\n");
const rulesOf = (rules) => rules.map((r) => `- ${r}`).join("\n");
const scoresOf = (ratings) => ratings.map((r) => `"${r.id}":{"score":<0-10>,"why":"<one short line>"}`).join(",");
const okShots = (id) => results.shots.filter((x) => x.state === id && x.status === "ok");
const states = R.states.filter((s) => okShots(s.id).length);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const path = join(dir, "critic.json");
const critic = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
Object.assign(critic, { model: MODEL, at: new Date().toISOString() });

// Each screen on its own.
const screensPass = async () => {
  const S = R.screens;
  const ids = S.ratings.map((r) => r.id);
  const prompt = (state, vps) => `You review screens of a space game, Holos, as a careful player who has never played it. You never saw its code. You see only the screenshots above${vps.length > 1 ? `, one for each width: ${vps.join(", ")}` : ""}.

The screen is "${state.title}". What it should show: ${state.description}

Score each width 0 to 10 on each rating, from its anchors:
${anchorsOf(S.ratings)}

Rules:
${rulesOf(S.rules)}

Reply with JSON only, no other text:
{${vps.map((vp) => `"${vp}":{${scoresOf(S.ratings)},"worst":"<the worst thing on screen, and where>","fix":"<one fix>"}`).join(",")}}`;
  critic.states = Object.fromEntries(
    await pool(states, 4, async (state) => {
      const shots = okShots(state.id);
      const vps = shots.map((x) => x.viewport);
      try {
        const got = await ask(prompt(state, vps), shots.map((x) => x.file), "critic");
        for (const vp of vps) for (const id of ids) if (typeof got[vp]?.[id]?.score !== "number") throw new Error(`no ${vp} ${id} score`);
        console.log(`screens ${state.id}: ${vps.map((vp) => `${vp} ${ids.map((id) => got[vp][id].score).join("/")}`).join(", ")}`);
        return [state.id, got];
      } catch (e) {
        console.warn(`screens ${state.id}: ${e.message}`);
        return [state.id, { error: e.message }];
      }
    }),
  );
};

// Every screen at once, for how they hold together.
const designPass = async () => {
  const D = R.design;
  const shots = states.flatMap((s) => okShots(s.id));
  const prompt = `You are a product designer reviewing every screen of a space game, Holos, at once. You never saw its code. The screenshots above are named <state>-<width>.png. The screens:
${states.map((s) => `- ${s.id}: ${s.title}. ${s.description}`).join("\n")}

Score the screens together, 0 to 10 on each rating, from its anchors:
${anchorsOf(D.ratings)}

Rules:
${rulesOf(D.rules)}

Reply with JSON only, no other text:
{${scoresOf(D.ratings)},"issues":[{"state":"<state id>","viewport":"<width>","where":"<where on screen>","issue":"<what is wrong>","fix":"<one fix>"}]}`;
  try {
    const got = await ask(prompt, shots.map((x) => x.file), "design");
    for (const r of D.ratings) if (typeof got[r.id]?.score !== "number") throw new Error(`no ${r.id} score`);
    critic.design = got;
    console.log(`design: ${D.ratings.map((r) => `${r.id} ${got[r.id].score}`).join(", ")}, ${got.issues?.length ?? 0} issues`);
  } catch (e) {
    critic.design = { error: e.message };
    console.warn(`design: ${e.message}`);
  }
};

// Each screen's words, cut.
const editorPass = async () => {
  const E = R.editor;
  const prompt = (state, lines) => `You edit the words of a space game, Holos. The screenshot above is the screen "${state.title}". What it should show: ${state.description}

Its words, one piece of text a line, as [kind] text. Lines marked (scrolled) are on the screen but scrolled out of sight:
${lines.map((t) => `[${t.kind}]${t.view ? "" : " (scrolled)"} ${t.text}`).join("\n")}

Score the screen's words 0 to 10 on each rating, from its anchors:
${anchorsOf(E.ratings)}

Rules:
${rulesOf(E.rules)}

Reply with JSON only, no other text:
{${scoresOf(E.ratings)},"rewrites":[{"was":"<the line exactly as it is>","now":"<the line as it should be>"}]}`;
  critic.editor = Object.fromEntries(
    await pool(states, 4, async (state) => {
      // The widest shot holds the most words in view. Its words, and the phone's, are the same text.
      const shot = okShots(state.id)[0];
      const lines = shot.text && existsSync(join(dir, shot.text)) ? JSON.parse(readFileSync(join(dir, shot.text), "utf8")) : [];
      if (!lines.length) return [state.id, { error: "no words captured" }];
      try {
        const got = await ask(prompt(state, lines), [shot.file], "editor");
        for (const r of E.ratings) if (typeof got[r.id]?.score !== "number") throw new Error(`no ${r.id} score`);
        const rewrites = (got.rewrites ?? []).map((x) => ({ ...x, saved: words(x.was ?? "") - words(x.now ?? "") }));
        const total = lines.reduce((a, t) => a + words(t.text), 0);
        const out = { ...got, rewrites, words: total, saved: rewrites.reduce((a, x) => a + Math.max(0, x.saved), 0) };
        console.log(`editor ${state.id}: ${E.ratings.map((r) => `${r.id} ${got[r.id].score}`).join(", ")}, ${out.saved} of ${total} words cut in ${rewrites.length} lines`);
        return [state.id, out];
      } catch (e) {
        console.warn(`editor ${state.id}: ${e.message}`);
        return [state.id, { error: e.message }];
      }
    }),
  );
};

// The three passes ask at once: none reads another's answer.
await Promise.all([
  PASSES.includes("screens") && screensPass(),
  PASSES.includes("design") && designPass(),
  PASSES.includes("editor") && editorPass(),
]);

writeFileSync(path, JSON.stringify(critic, null, 2) + "\n");
writeIndex();

// What fell since the last run the critic scored.
const before = runs
  .filter((r) => r < name && existsSync(join(capDir, r, "critic.json")))
  .map((r) => ({ r, c: JSON.parse(readFileSync(join(capDir, r, "critic.json"), "utf8")) }))
  .at(-1);
const drops = [];
const fell = (label, was, now, why) => typeof was === "number" && typeof now === "number" && was - now >= 2 && drops.push(`${label}: ${was} to ${now}. ${why ?? ""}`);
for (const [id, s] of Object.entries(critic.states ?? {}))
  for (const [vp, v] of Object.entries(s)) if (v && typeof v === "object") for (const k of R.screens.ratings.map((r) => r.id)) fell(`${id} ${vp} ${k}`, before?.c.states?.[id]?.[vp]?.[k]?.score, v[k]?.score, v[k]?.why);
for (const r of R.design.ratings) fell(`design ${r.id}`, before?.c.design?.[r.id]?.score, critic.design?.[r.id]?.score, critic.design?.[r.id]?.why);
for (const [id, v] of Object.entries(critic.editor ?? {})) for (const r of R.editor.ratings) fell(`editor ${id} ${r.id}`, before?.c.editor?.[id]?.[r.id]?.score, v[r.id]?.score, v[r.id]?.why);
// Code's flags, from the capture, beside the readers' scores.
const faults = results.shots.reduce((a, x) => a + (x.faults?.length ?? 0), 0);
const lang = results.shots.reduce((a, x) => a + (x.language?.length ?? 0), 0);
console.log(`\nScored ${name} by ${MODEL}. Code flagged ${faults} layout faults and ${lang} language lines.`);
if (before) console.log(drops.length ? `Fell 2 or more since ${before.r}:\n${drops.map((d) => `  ${d}`).join("\n")}` : `Nothing fell 2 or more since ${before.r}.`);
