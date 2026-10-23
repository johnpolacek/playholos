// Asks the live Mind a few questions on a running dev server and checks its answers by code: that it knows its own
// Earth's road to Year 0, a war over Taiwan, Mars, fusion, and doesn't claim what didn't happen, and that it speaks as
// we, never I. Each run spends a few cents of the key in .dev.vars. Run from game/, with npm run dev going:
// npm run check:mind, or with another address, npm run check:mind -- http://localhost:5181. 2026-10-23.
import { existsSync, readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:5173";
// The code in .dev.vars opens the Mind, as the Mind tab's cookie does. It is never printed.
const vars = new URL("../.dev.vars", import.meta.url);
const code = existsSync(vars)
  ? readFileSync(vars, "utf8")
      .match(/^ACCESS_CODE=(.*)$/m)?.[1]
      ?.trim()
      .replace(/^"|"$/g, "")
  : undefined;

const ASK_AWAY = "Are any of us living beyond Earth and the Moon? And does fusion power anything yet?";
const CASES = [
  // A war over Taiwan left this Earth a fifth of its compute.
  { seed: 3, ask: "Why will everything we build take so long?", must: [/taiwan/i, /fifth|20\s?%|20 percent|one in five/i] },
  // A few of us on Mars since 2034, fusion on the grid since 2039.
  { seed: 2, ask: ASK_AWAY, must: [/mars/i, /fusion/i], never: [/no one (is |has )?(on|set foot on) mars/i, /none feeds/i] },
  // Neither happened here.
  { seed: 5, ask: ASK_AWAY, must: [/mars/i], never: [/(live|living|outpost|lived) (on|at) mars/i, /fusion (joined|feeds|powers) our grid/i] },
];

let failed = 0;
for (const c of CASES) {
  let res;
  try {
    res = await fetch(`${base}/api/mind`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(code && { cookie: `holos-access=${encodeURIComponent(code)}` }) },
      body: JSON.stringify({
        messages: [{ id: "q", role: "user", parts: [{ type: "text", text: c.ask }] }],
        seed: c.seed,
        beganAt: null,
        charter: { line: "test", dials: [0, 0, 0] },
        observe: [],
        builds: [],
        later: [],
      }),
    });
  } catch {
    console.error(`Nothing answers at ${base}. Start the dev server first: npm run dev.`);
    process.exit(1);
  }
  // The answer streams back as events. Its words are the text deltas.
  let text = "";
  for (const line of (await res.text()).split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const d = JSON.parse(line.slice(6));
      if (d.type === "text-delta") text += d.delta;
      if (d.type === "error") text += `[error: ${d.errorText}]`;
    } catch {
      // The stream's last line, [DONE], isn't JSON.
    }
  }
  const missing = (c.must ?? []).filter((r) => !r.test(text));
  const said = (c.never ?? []).filter((r) => r.test(text));
  const i = /\bI\b|\bI[’']m\b/.test(text);
  const ok = res.ok && text && !missing.length && !said.length && !i;
  if (!ok) failed++;
  const why = [
    !res.ok && `http ${res.status}`,
    missing.length && `missing ${missing.join(" ")}`,
    said.length && `said ${said.join(" ")}`,
    i && "said I",
  ].filter(Boolean);
  console.log(`seed ${c.seed}: ${ok ? "pass" : `FAIL, ${why.join(", ") || "no answer"}`}\n  Q: ${c.ask}\n  A: ${text}\n`);
}
console.log(failed ? `${failed} of ${CASES.length} failed.` : `All ${CASES.length} passed.`);
process.exit(failed ? 1 : 0);
