import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { regime, settledHit } from "./regime.mjs";
import { writeIndex } from "./states.mjs";

// The hill climb's next calls: what the newest capture run says most needs fixing, worst first, lettered so one
// letter picks it. Both readers agreeing outranks one, and code's flags are facts. With --since, how each rating and
// flag moved from an earlier run, so a fix shows whether it climbed. 2026-11-08. The --since also writes since.json into
// the newer run, so the Screens tab on playtests/regime.html shows each reshot screen before and after. 2026-11-08.
//
//   npm run playtest:climb                       the calls from the newest capture run
//   npm run playtest:climb -- --since <run>      what rose and fell since that run
//   npm run playtest:climb -- --run <run> --max 20
//   npm run playtest:climb -- --noise <run>      how far scores drift with no change: that run against the newest,
//                                                both shot from the same build. Saved to captures/noise.json
//
// The loop: npm run playtest:local -- screens, then this. Pick letters. Fix ONE. Then
// npm run playtest:local -- screens --dirty --only <its states>, look at the after shot, and run this with --since.
// It prints KEEP or REVERT for each screen it shot, by the climb rule, so the call never drifts. 2026-11-08.

const capDir = fileURLToPath(new URL("../playtests/captures/", import.meta.url));
const R = regime();
const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i < 0 ? undefined : args[i + 1];
};
const TARGET = R.climb?.target ?? 8;
const runs = readdirSync(capDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(capDir, d.name, "critic.json")))
  .map((d) => d.name)
  .sort();
const load = (name) => {
  const read = (f) => (existsSync(join(capDir, name, f)) ? JSON.parse(readFileSync(join(capDir, name, f), "utf8")) : null);
  return { name, results: read("results.json"), a: read("critic.json"), b: read("critic.codex.json") };
};
const now = opt("run") ?? runs.at(-1);
if (!now) {
  console.error("No scored capture runs yet. Run npm run playtest:local -- screens first.");
  process.exit(1);
}
const cur = load(now);
const title = (id) => R.states.find((s) => s.id === id)?.title ?? id;

// Every reader score, flat: where, what, and each reader's number.
function ratings(run) {
  const out = [];
  for (const [id, st] of Object.entries(run.a?.states ?? {}))
    for (const [vp, v] of Object.entries(st))
      if (v && typeof v === "object")
        for (const r of R.screens.ratings) out.push({ key: `${id} ${vp} ${r.id}`, state: id, vp, rating: r.id, a: v[r.id]?.score, b: run.b?.states?.[id]?.[vp]?.[r.id]?.score, worst: v.worst, fix: v.fix });
  for (const r of R.design.ratings) out.push({ key: `design ${r.id}`, state: "all", rating: r.id, a: run.a?.design?.[r.id]?.score, b: run.b?.design?.[r.id]?.score, why: run.a?.design?.[r.id]?.why });
  for (const [id, v] of Object.entries(run.a?.editor ?? {}))
    for (const r of R.editor.ratings) out.push({ key: `words ${id} ${r.id}`, state: id, rating: r.id, a: v[r.id]?.score, b: run.b?.editor?.[id]?.[r.id]?.score, why: v[r.id]?.why });
  return out.filter((x) => typeof x.a === "number");
}
// Code's flags, grouped by rule and text, with the shots they show on.
function flags(run) {
  const by = new Map();
  for (const s of run.results?.shots ?? [])
    for (const f of [...(s.faults ?? []), ...(s.language ?? [])]) {
      const k = `${f.rule}|${f.text}`;
      const g = by.get(k) ?? { rule: f.rule, text: f.text, note: f.note, shots: [] };
      g.shots.push(`${s.state} ${s.viewport}`);
      by.set(k, g);
    }
  return [...by.values()];
}

// Noise: the same build shot twice. Any move between them is the readers, not the game. The 90th-percentile move,
// for each reader, is how far a score must move before we believe it. 2026-11-08.
const NOISE_FILE = join(capDir, "noise.json");
if (opt("noise")) {
  const was = load(opt("noise"));
  if (!was.a) {
    console.error(`No scored capture run ${opt("noise")}.`);
    process.exit(1);
  }
  if (was.results?.build !== cur.results?.build || was.results?.dirty || cur.results?.dirty)
    console.log(`Warning: ${was.name} is build ${was.results?.build}${was.results?.dirty ? " dirty" : ""}, ${cur.name} is ${cur.results?.build}${cur.results?.dirty ? " dirty" : ""}. Noise needs the same committed build.\n`);
  const before = new Map(ratings(was).map((x) => [x.key, x]));
  const da = [], db = [];
  for (const x of ratings(cur)) {
    const y = before.get(x.key);
    if (!y) continue;
    da.push(Math.abs(x.a - y.a));
    if (typeof x.b === "number" && typeof y.b === "number") db.push(Math.abs(x.b - y.b));
  }
  const p90 = (xs) => { const s = [...xs].sort((p, q) => p - q); return s.length ? Math.round(s[Math.floor(s.length * 0.9)] * 10) / 10 : 0; };
  const max = (xs) => Math.round(Math.max(0, ...xs) * 10) / 10;
  const n = { from: was.name, to: cur.name, build: cur.results?.build, a: p90(da), b: p90(db), maxA: max(da), maxB: max(db), count: da.length };
  writeFileSync(NOISE_FILE, JSON.stringify(n, null, 2) + "\n");
  console.log(`Noise over ${n.count} scores, same build twice:\n  Claude: 90% move ${n.a} or less, largest ${n.maxA}\n  second reader: 90% move ${n.b} or less, largest ${n.maxB}\nSaved to playtests/captures/noise.json. --since now trusts only moves past these.`);
  process.exit(0);
}

if (opt("since")) {
  const was = load(opt("since"));
  if (!was.a) {
    console.error(`No scored capture run ${opt("since")}.`);
    process.exit(1);
  }
  const before = new Map(ratings(was).map((x) => [x.key, x]));
  const moved = ratings(cur)
    .map((x) => ({ ...x, da: x.a - (before.get(x.key)?.a ?? x.a), db: typeof x.b === "number" && typeof before.get(x.key)?.b === "number" ? x.b - before.get(x.key).b : 0 }))
    .filter((x) => before.has(x.key) && (x.da || x.db));
  // One decimal, as every score reads: float sums printed +0.8999999999999995. 2026-11-08.
  const sign = (n) => (n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1));
  const up = moved.filter((x) => x.da + x.db > 0).sort((p, q) => q.da + q.db - (p.da + p.db));
  const down = moved.filter((x) => x.da + x.db < 0).sort((p, q) => p.da + p.db - (q.da + q.db));
  console.log(`# Since ${was.name}, now ${cur.name}\n`);
  console.log(`Rose (Claude, second reader):\n${up.map((x) => `  ${x.key}: ${sign(x.da)}, ${sign(x.db)}`).join("\n") || "  nothing"}\n`);
  console.log(`Fell:\n${down.map((x) => `  ${x.key}: ${sign(x.da)}, ${sign(x.db)}`).join("\n") || "  nothing"}\n`);
  // Only the states this run shot, so a partial rerun isn't read as fixes everywhere else.
  const shot = new Set((cur.results?.shots ?? []).map((s) => `${s.state} ${s.viewport}`));
  const fb = flags(was).map((g) => ({ ...g, shots: g.shots.filter((s) => shot.has(s)) })).filter((g) => g.shots.length);
  const fa = flags(cur);
  const key = (g) => `${g.rule}|${g.text}`;
  const gone = fb.filter((g) => !fa.some((h) => key(h) === key(g)));
  const fresh = fa.filter((g) => !fb.some((h) => key(h) === key(g)));
  console.log(`Code flags cleared: ${gone.length}${gone.length ? `\n${gone.map((g) => `  ${g.rule}: ${g.text}`).join("\n")}` : ""}`);
  console.log(`Code flags new: ${fresh.length}${fresh.length ? `\n${fresh.map((g) => `  ${g.rule}: ${g.text} (${g.shots.join(", ")})`).join("\n")}` : ""}`);
  // The pairing for the Screens tab: this run's shots after, the earlier run's before, and what moved between.
  const tenth = (n) => Math.round(n * 10) / 10;
  const pair = (x) => ({ kind: x.key.split(" ")[0] === "design" ? "design" : x.key.startsWith("words") ? "words" : "screen", state: x.state, vp: x.vp, rating: x.rating, a: tenth(x.da), b: tenth(x.db) });
  const flag = (g) => ({ rule: g.rule, text: g.text, shots: g.shots });
  writeFileSync(join(capDir, cur.name, "since.json"), JSON.stringify({ since: was.name, rose: up.map(pair), fell: down.map(pair), cleared: gone.map(flag), fresh: fresh.map(flag) }, null, 2) + "\n");
  writeIndex();
  // The climb rule, applied here so it never drifts: a screen climbed when one rating rose past the noise for both
  // readers on average, or past it for one with the other not falling, or a code flag on it cleared. It fell when
  // any rating fell past the noise for either reader. Noise is captures/noise.json, never under 2. 2026-11-08.
  const noise = existsSync(NOISE_FILE) ? JSON.parse(readFileSync(NOISE_FILE, "utf8")) : null;
  const barA = Math.max(2, noise?.a ?? 0), barB = Math.max(2, noise?.b ?? 0);
  const rose = (x) => (x.da / barA + x.db / barB) / 2 >= 0.75 || (x.da >= barA && x.db >= 0) || (x.db >= barB && x.da >= 0);
  const fell = (x) => x.da <= -barA || x.db <= -barB;
  const screens = [...shot].map((k) => {
    const [state, vp] = k.split(" ");
    const mine = moved.filter((x) => x.state === state && x.vp === vp);
    const up2 = mine.filter(rose), down2 = mine.filter(fell);
    const clr = gone.filter((g) => g.shots.includes(k));
    const verdict = down2.length ? "REVERT" : up2.length || clr.length ? "KEEP" : "FLAT";
    return { k, verdict, why: [...up2.map((x) => `${x.rating} ${sign(x.da)}, ${sign(x.db)}`), ...clr.map((g) => `cleared ${g.rule}`), ...down2.map((x) => `fell ${x.rating} ${sign(x.da)}, ${sign(x.db)}`)].join("; ") };
  });
  const wordsFell = moved.filter((x) => x.key.startsWith("words") && fell(x) && (shot.has(`${x.state} phone`) || shot.has(`${x.state} laptop`)));
  console.log(`\n# Verdict, bar ${barA} and ${barB}${noise ? ` from noise ${noise.from} and ${noise.to}` : ", no noise measured yet: npm run playtest:climb -- --noise <run>"}`);
  for (const s of screens) console.log(`  ${s.verdict.padEnd(6)} ${s.k}${s.why ? `: ${s.why}` : ""}`);
  for (const x of wordsFell) console.log(`  REVERT words ${x.state}: fell ${x.rating} ${sign(x.da)}, ${sign(x.db)}`);
  const any = (v) => screens.some((s) => s.verdict === v);
  const call = any("REVERT") || wordsFell.length ? "REVERT" : any("KEEP") ? "KEEP" : "REVERT (flat: nothing rose past the noise)";
  console.log(`\nCall: ${call}. Check the after shot by eye before keeping: npm run playtests, Screens, ${cur.name}.`);
  process.exit(0);
}

// The calls, worst first. Both readers under the target outranks one, and a fault code saw outranks a taste.
const calls = [];
const BAD = { clipped: 0, covered: 0, "off screen": 0, "page scrolls sideways": 0, "small target": 2, "low contrast": 2, "long button": 3, "long sentence": 3, "long heading": 3, "tiny text": 5 };
for (const g of flags(cur).filter((g) => (BAD[g.rule] ?? 1) <= 3))
  calls.push({ rank: BAD[g.rule] ?? 1, what: `${g.rule}: “${g.text}”${g.note ? `, ${g.note}` : ""}`, where: g.shots.join(", "), by: "code" });
const tiny = flags(cur).filter((g) => g.rule === "tiny text");
if (tiny.length) calls.push({ rank: 5, what: `tiny text: ${tiny.length} pieces under ${R.audit?.minFont ?? 9.5} px, like “${tiny[0].text}”`, where: [...new Set(tiny.flatMap((g) => g.shots))].join(", "), by: "code" });
// Per screen and width, its lowest rating under the target, with the reader's worst thing and fix.
const low = new Map();
for (const x of ratings(cur).filter((x) => x.state !== "all" && !x.key.startsWith("words") && (x.a < TARGET || (x.b ?? 10) < TARGET))) {
  const k = `${x.state} ${x.vp}`;
  const m = Math.min(x.a, x.b ?? x.a);
  if (!low.has(k) || m < low.get(k).m) low.set(k, { ...x, m });
}
for (const x of low.values()) {
  const both = x.a < TARGET && (x.b ?? 0) < TARGET;
  calls.push({ rank: both ? 1 + x.m / 10 : 4 + x.m / 10, what: `${title(x.state)}, ${x.vp}: ${x.rating} ${x.a}${typeof x.b === "number" ? ` · ${x.b}` : ""}. ${x.worst ?? ""}`, where: `Fix: ${x.fix ?? ""}`, by: both ? "both readers" : "one reader" });
}
for (const r of R.design.ratings) {
  const a = cur.a?.design?.[r.id]?.score, b = cur.b?.design?.[r.id]?.score;
  if (typeof a === "number" && (a < TARGET || (b ?? 10) < TARGET))
    calls.push({ rank: 2 + Math.min(a, b ?? a) / 10, what: `All screens, ${r.id} ${a}${typeof b === "number" ? ` · ${b}` : ""}: ${cur.a.design[r.id].why}`, where: (cur.a.design.issues ?? []).filter((i) => i.state).slice(0, 2).map((i) => `${i.state}: ${i.fix}`).join(" "), by: typeof b === "number" && b < TARGET ? "both readers" : "one reader" });
}
for (const [id, v] of Object.entries(cur.a?.editor ?? {}))
  for (const w of (v.rewrites ?? []).filter((w) => w.saved >= 3)) calls.push({ rank: 3.5, what: `Words on ${title(id)}: “${w.was}”`, where: `Cut to: “${w.now}”, ${w.saved} fewer words`, by: "editor" });

// A call that raises a settled design call is set aside, not lettered, and said so below. So is a line in the blind
// player's report from this run. 2026-11-08.
const aside = [];
for (const c of [...calls]) {
  const hit = settledHit(`${c.what} ${c.where}`, R);
  if (hit) {
    aside.push(`${hit.id}: ${c.what.slice(0, 90)}`);
    calls.splice(calls.indexOf(c), 1);
  }
}
const report = join(capDir, "..", now, "REPORT.md");
if (existsSync(report))
  for (const line of readFileSync(report, "utf8").split("\n")) {
    const hit = /^\s*(\d+\.|-)\s/.test(line) && settledHit(line, R);
    if (hit) aside.push(`${hit.id}, in the player's report: ${line.replace(/[*]/g, "").trim().slice(0, 90)}`);
  }

const letter = (i) => (i < 26 ? String.fromCharCode(97 + i) : String.fromCharCode(97 + Math.floor(i / 26) - 1) + String.fromCharCode(97 + (i % 26)));
const max = Number(opt("max") ?? 12);
const top = calls.sort((p, q) => p.rank - q.rank).slice(0, max);
console.log(`# Climb calls from ${now}, target ${TARGET}\n`);
top.forEach((c, i) => console.log(`(${letter(i)}) ${c.what}\n    ${c.where}\n    by ${c.by}\n`));
if (aside.length) console.log(`Settled, not called (${aside.length}):\n${aside.map((x) => `  ${x}`).join("\n")}\n`);
console.log(`${calls.length - top.length} more. Pick letters, fix them, rerun the screens they touch, then: npm run playtest:climb -- --since ${now}`);
