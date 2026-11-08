import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "./pw.mjs";
import { regime } from "./regime.mjs";
import { language, measure } from "./screen-audit.mjs";
import { fixture, fromSave, seedPage, states, writeFixture, writeIndex } from "./states.mjs";

// Screenshots of every named state at every width, into one folder a run, for the screen critic and the contact sheet
// on playtests/regime.html. Each state opens straight from its saved game, with the clock stopped at its Year, so the
// same state shows the same screen every run. It asks for reduced motion, so entrances are skipped and each shot is the
// settled screen. The sky still moves, so two runs never match pixel for pixel: the sheet
// shows the last run beside this one for an eye to compare, and no diff fails a run. 2026-11-08.
//
//   node scripts/capture.mjs                        every state, at every width, against the dev server
//   node scripts/capture.mjs --only scan-y1,build-y1
//   node scripts/capture.mjs --url http://localhost:5173
//   node scripts/capture.mjs snap <id>              save the game open in the blind player's browser as state <id>
//   node scripts/capture.mjs snap <id> --from f.json  save a holos:save a player wrote to a file as state <id>
//   node scripts/capture.mjs list                   the states, and which have a saved game
//
// CHROME points at a Chrome to use, when Playwright's own isn't installed. Exits 1 if any state fails to open.

const root = fileURLToPath(new URL("../playtests/", import.meta.url));
const capDir = join(root, "captures");
const R = regime();
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const URL_ = (opt("url") ?? process.env.HOLOS_URL ?? "http://localhost:5173").replace(/\/$/, "");

const git = (...a) => {
  try {
    return execFileSync("git", a, { cwd: join(root, ".."), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
};

const [cmd] = args;

if (cmd === "list") {
  for (const s of states(R)) console.log(`${fixture(s.id) ? "saved  " : "no save"}  ${s.id.padEnd(18)} ${s.path}  ${s.title}`);
  process.exit(0);
}

if (cmd === "snap") {
  const id = args[1];
  if (!id) {
    console.error("Usage: node scripts/capture.mjs snap <id> [--from save.json] [--path /play/build] [--port 9333]");
    process.exit(1);
  }
  // From a file of the game's holos:save, as a player's own browser wrote it, or from the blind player's browser.
  let raw, where = opt("path");
  if (opt("from")) raw = readFileSync(opt("from"), "utf8");
  else {
    const browser = await playwright().chromium.connectOverCDP(`http://127.0.0.1:${opt("port") ?? process.env.BLIND_PORT ?? 9333}`);
    const page = browser.contexts()[0].pages()[0];
    raw = await page.evaluate(() => localStorage.getItem("holos:save"));
    where ??= new URL(page.url()).pathname;
  }
  if (!raw) {
    console.error("No saved game there.");
    process.exit(1);
  }
  const fx = fromSave(JSON.parse(raw));
  writeFixture(id, fx);
  console.log(`Saved state ${id}, Year ${fx.year ?? "before Begin"}, seed ${fx.save.seed}${where ? `, from ${where}` : ""}.`);
  if (!states(R).some((s) => s.id === id)) console.log(`Add it to "states" in playtests/regime.html, with its "path" and what the screen should show.`);
  process.exit(0);
}

const pw = playwright();
const only = opt("only")?.split(",");
const list = states(R).filter((s) => !only || only.includes(s.id));
const iso = new Date().toISOString();
const run = opt("run") ?? `${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}`;
const out = join(capDir, run);
mkdirSync(out, { recursive: true });

const browser = await pw.chromium.launch({
  executablePath: process.env.CHROME || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const now = Date.now();
const shots = [];
for (const s of list) {
  const fx = fixture(s.id);
  for (const vp of s.viewports ?? Object.keys(R.viewports)) {
    const v = R.viewports[vp];
    const file = `${s.id}-${vp}.png`;
    const shot = { state: s.id, viewport: vp, file, errors: [] };
    shots.push(shot);
    if (!fx) {
      shot.status = "no save";
      continue;
    }
    // Two retries, 15 seconds apart: a dev server that restarts mid-run drops a shot or two.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 15000));
      shot.errors = [];
      const context = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.scale ?? 1, isMobile: !!v.touch, hasTouch: !!v.touch, reducedMotion: "reduce" });
      const page = await context.newPage();
      page.on("console", (m) => m.type() === "error" && shot.errors.push(m.text().slice(0, 300)));
      page.on("pageerror", (e) => shot.errors.push(String(e).slice(0, 300)));
      try {
        // The clock reads the state's Year and stays there. Timers and the sky's motion still run.
        await page.clock.setFixedTime(now);
        await seedPage(page, fx, now);
        await page.goto(URL_ + s.path, { waitUntil: "networkidle", timeout: R.capture?.timeoutMs ?? 30000 });
        for (const step of s.steps ?? []) {
          if (step.click) await page.locator(step.click).first().click({ timeout: 10000 });
          if (step.wait) await page.waitForTimeout(step.wait);
        }
        await page.waitForTimeout(s.settleMs ?? R.capture?.settleMs ?? 2500);
        await page.screenshot({ path: join(out, file), timeout: 120000 });
        shot.status = "ok";
        // What code can tell: layout faults measured in the page, and the words on screen against the language rules.
        const a = R.audit ?? {};
        const { texts, faults } = await page.evaluate(measure, { touch: !!v.touch, minTarget: a.minTarget ?? 24, minFont: a.minFont ?? 9.5 });
        shot.text = file.replace(/\.png$/, ".text.json");
        writeFileSync(join(out, shot.text), JSON.stringify(texts, null, 1) + "\n");
        shot.faults = faults;
        shot.language = language(texts);
      } catch (e) {
        shot.status = "failed";
        shot.errors.push(String(e.message ?? e).split("\n")[0].slice(0, 300));
      }
      await context.close();
      if (shot.status === "ok") break;
    }
    const flags = shot.status === "ok" ? `  ${shot.faults.length} layout, ${shot.language.length} language` : "";
    console.log(`${shot.status.padEnd(8)} ${file}${flags}${shot.errors.length ? `  ${shot.errors.length} error(s): ${shot.errors[0]}` : ""}`);
  }
}
await browser.close();

// A rerun of some states into the same run keeps the shots it didn't take again.
const was = existsSync(join(out, "results.json")) ? JSON.parse(readFileSync(join(out, "results.json"), "utf8")).shots : [];
shots.unshift(...was.filter((x) => !shots.some((y) => y.state === x.state && y.viewport === x.viewport)));
const results = { run, build: git("rev-parse", "--short", "HEAD"), dirty: !!git("status", "--porcelain", "game"), at: new Date(now).toISOString(), secs: Math.round((Date.now() - now) / 1000), url: URL_, shots };
writeFileSync(join(out, "results.json"), JSON.stringify(results, null, 2) + "\n");
writeIndex();
const bad = shots.filter((s) => s.status === "failed");
const missing = shots.filter((s) => s.status === "no save");
console.log(`\n${shots.length - bad.length - missing.length} of ${shots.length} shots in playtests/captures/${run}.${missing.length ? ` ${new Set(missing.map((s) => s.state)).size} state(s) have no save yet.` : ""}`);
console.log("Score them blind: npm run playtest:critic. See them: npm run playtests, Screens.");
if (bad.length) process.exit(1);
