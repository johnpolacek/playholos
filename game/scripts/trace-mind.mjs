// Asks the live Mind every question in evals/mind/cases.json on a running dev server, and saves each answer beside
// what the Mind was told, one trace a line, in evals/mind/traces/. They are for reading by hand in npm run review:mind,
// to find how the Mind fails before any check is written for it. 2026-10-23. Run from game/, with npm run dev going:
//   npm run trace:mind                      every case, on your own Claude login, at no API cost
//   npm run trace:mind -- --via api         every case, as players ask it, about 4 cents each of the key in .dev.vars
//   npm run trace:mind -- --only c01,c07    just those
//   npm run trace:mind -- --dry             what each state tells the Mind, without asking it, for nothing
//   npm run trace:mind -- --base http://localhost:5181
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { MIND_MODEL } from "../lib/access.ts";
import { base as history, CHARTERS, dialsFor } from "../lib/game/charter.ts";
import { MS_PER_YEAR } from "../lib/game/clock.ts";
import { broken, BUILD_CHECKS, CHECKS, SEND_CHECKS } from "../evals/mind/checks.mjs";
import { readBuildOffer } from "../lib/game/build-offer.ts";
import { readOffer } from "../lib/game/sends.ts";
import { askMind, askMindCli } from "./ask-mind.mjs";

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const base = flag("--base") ?? "http://localhost:5173";
const only = flag("--only")?.split(",");
const dry = args.includes("--dry");
const via = flag("--via") ?? "cli";
if (via !== "cli" && via !== "api") {
  console.error("--via is cli or api.");
  process.exit(1);
}

const dir = new URL("../evals/mind/", import.meta.url);
const { states, cases } = JSON.parse(readFileSync(new URL("cases.json", dir), "utf8"));
const unknown = cases.filter((c) => !states[c.state]).map((c) => `${c.id}: no state ${c.state}`);
const lines = cases.filter((c) => c.charter && !CHARTERS.some((x) => x.line === c.charter)).map((c) => `${c.id}: no charter "${c.charter}"`);
if (unknown.length || lines.length) {
  console.error([...unknown, ...lines].join("\n"));
  process.exit(1);
}

// Each seed's road to Year 0, which sets where its charter's dials start, as Our Charter sets them.
const pasts = new Map();
async function pastOf(seed) {
  if (!pasts.has(seed)) pasts.set(seed, fetch(`${base}/api/earth?seed=${seed}`).then((r) => r.json()));
  return pasts.get(seed);
}

/** The save the Mind tab would send for a case: its state's game, its charter, and Begin `year` Years ago. */
async function saveFor(state, line) {
  const pick = CHARTERS.find((x) => x.line === line);
  const charter = pick ? { line, dials: dialsFor(pick.pull, history(await pastOf(state.seed))) } : null;
  const beganAt = state.year === null ? null : Date.now() - state.year * MS_PER_YEAR;
  return {
    seed: state.seed, beganAt, charter, builds: state.builds ?? [], observe: state.observe ?? [], later: state.later ?? [], stops: state.stops ?? [],
    sent: state.sent ?? [], reactions: state.reactions ?? [],
  };
}

try {
  await fetch(base);
} catch {
  console.error(`Nothing answers at ${base}. Start the dev server first: npm run dev.`);
  process.exit(1);
}

if (dry) {
  for (const [name, state] of Object.entries(states)) {
    const res = await askMind(base, { ask: "", dry: true, ...(await saveFor(state, null)) });
    if (!res?.told) {
      console.log(`${name}: no prompt, http ${res?.status}. The dev server sends it only in dev.`);
      continue;
    }
    const { road, scan, queue, known, now } = res.told;
    const heard = known.split("Signals Earth's watch has caught:")[1]?.split("\n\n")[0].trim();
    const close = known.split("What our craft have seen up close:")[1]?.split("\n\n")[0].trim();
    const read = known.match(/Our Infrared Telescope has read its air[^\n]*/g) ?? [];
    const landed = scan.match(/Landed at Year[^:]*/g) ?? [];
    console.log(
      [
        `${name}: seed ${state.seed}. ${now}`,
        road && `  road: ${road.split("\n").slice(1).join(" | ")}`,
        `  ${queue}`,
        `  heard: ${heard ?? "nothing"}`,
        read.length && `  read: ${read.join(" | ")}`,
        close && `  up close: ${close}`,
        landed.length && `  landed: ${landed.join(" | ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  process.exit(0);
}

const todo = cases.filter((c) => !only || only.includes(c.id));
mkdirSync(new URL("traces/", dir), { recursive: true });
// Named for the local time it ran: 2026-10-23-13-52.jsonl.
const d = new Date();
const two = (n) => String(n).padStart(2, "0");
const file = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}-${two(d.getHours())}-${two(d.getMinutes())}.jsonl`;
const out = new URL(`traces/${file}`, dir);
const traces = [];
let failed = 0;

// Three at a time, so a hundred questions take minutes, not a quarter hour.
async function run(c) {
  const state = states[c.state];
  const save = await saveFor(state, c.charter);
  const res = await (via === "api" ? askMind : askMindCli)(base, { ask: c.ask, ...save });
  if (!res?.ok || !res.text) failed++;
  const trace = {
    id: c.id,
    state: c.state,
    kind: c.kind,
    ...(c.style && { style: c.style }),
    charter: c.charter ?? null,
    ask: c.ask,
    seed: state.seed,
    year: state.year,
    model: MIND_MODEL,
    via,
    at: new Date().toISOString(),
    ms: res?.ms,
    status: res?.status ?? null,
    answer: res?.text ?? "",
    ...(c.long && { long: true }),
    ...(c.out && { out: true }),
    ...(c.offer !== undefined && { offer: c.offer }),
    ...(c.build !== undefined && { build: c.build }),
    // The Mind's words only: an offer to send, or of a build, ends with a line its card is drawn from, 2026-10-26.
    checks: res?.text
      ? [
          ...broken(readOffer(readBuildOffer(res.text).words).words, c),
          ...[...SEND_CHECKS, ...BUILD_CHECKS].filter((k) => k.test(res.text, c, res.told)).map((k) => k.name),
        ]
      : [],
    told: res?.told ?? null,
    save,
  };
  traces.push(trace);
  // Saved as it lands, so a run stopped halfway keeps what it asked. Put in case order at the end.
  appendFileSync(out, JSON.stringify(trace) + "\n");
  console.log(`${c.id} ${res?.ok ? "answered" : `failed, ${res?.status}`}: ${c.ask}\n  ${res?.text ?? ""}\n`);
}
const queue = [...todo];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) await run(queue.shift());
}));

traces.sort((a, b) => todo.findIndex((c) => c.id === a.id) - todo.findIndex((c) => c.id === b.id));
writeFileSync(out, traces.map((t) => JSON.stringify(t)).join("\n") + "\n");
// What code can check, across the run: each rule, and the cases that break it.
for (const { name } of [...CHECKS, ...SEND_CHECKS, ...BUILD_CHECKS]) {
  const ids = traces.filter((t) => t.checks.includes(name)).map((t) => t.id);
  console.log(`${ids.length ? "breaks" : "keeps "} ${name}${ids.length ? `: ${ids.join(", ")}` : ""}`);
}
console.log(`${traces.length - failed} of ${traces.length} answered. Saved to evals/mind/traces/${file}. Read them: npm run review:mind.`);
process.exit(failed ? 1 : 0);
