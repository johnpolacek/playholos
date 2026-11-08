import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromePath, playwright } from "./pw.mjs";

// The blind first-timer's hands and eyes: it sees the game only as screenshots, and acts only by clicking where it
// looks, typing and pressing keys, as a person would. No page text, no element lists, no addresses. playtests/BLIND.md
// says how it plays. 2026-11-07.
//
//   BLIND_DIR=playtests/<run>/blind node scripts/blind.mjs start      open the game, take the first look
//   node scripts/blind.mjs click 640 400                             click there, then look
//   node scripts/blind.mjs type "What is a warm glow?"               type, then look
//   node scripts/blind.mjs key Enter                                 press a key, then look
//   node scripts/blind.mjs scroll 640 400 600                        scroll at a point, down by 600 px, then look
//   node scripts/blind.mjs wait 30                                   let the game run, then look
//   node scripts/blind.mjs look                                      look again
//   node scripts/blind.mjs stop                                      close the browser
//
// Each look saves the next numbered screenshot and prints its path. Every action is logged to actions.jsonl beside it.

const W = 1280, H = 800, PORT = Number(process.env.BLIND_PORT ?? 9333);
const URL = process.env.BLIND_URL ?? "http://localhost:5173/";
const dir = resolve(process.env.BLIND_DIR ?? "playtests/blind");
mkdirSync(dir, { recursive: true });
const stateFile = join(dir, "state.json");
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : { n: 0 };
const save = () => writeFileSync(stateFile, JSON.stringify(state));

const [cmd, ...args] = process.argv.slice(2);
const pw = playwright();

if (cmd === "start") {
  const chrome = chromePath(pw);
  const child = spawn(
    chrome,
    ["--headless=new", "--no-sandbox", `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(dir, "profile")}`, `--window-size=${W},${H}`, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "about:blank"],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
  state.pid = child.pid;
  state.n = 0;
  save();
  for (let i = 0; i < 40; i++) {
    try {
      await fetch(`http://127.0.0.1:${PORT}/json/version`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

if (cmd === "stop") {
  try {
    process.kill(state.pid);
  } catch {}
  log({ cmd });
  console.log("closed");
  process.exit(0);
}

const browser = await pw.chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
const context = browser.contexts()[0];
const page = context.pages()[0] ?? (await context.newPage());
await page.setViewportSize({ width: W, height: H });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));

function log(entry) {
  appendFileSync(join(dir, "actions.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
}

const num = (i) => {
  const v = Number(args[i]);
  if (!Number.isFinite(v)) throw new Error(`${cmd} needs numbers`);
  return v;
};

let settle = 1500;
switch (cmd) {
  case "start":
    await page.goto(URL);
    settle = 4000;
    break;
  case "click":
    await page.mouse.click(num(0), num(1));
    break;
  case "type":
    await page.keyboard.type(args.join(" "), { delay: 20 });
    break;
  case "key":
    await page.keyboard.press(args[0]);
    break;
  case "scroll":
    await page.mouse.move(num(0), num(1));
    await page.mouse.wheel(0, num(2));
    break;
  case "wait":
    settle = Math.min(600, num(0)) * 1000;
    break;
  case "look":
    settle = 300;
    break;
  default:
    console.error("Commands: start, click X Y, type TEXT, key KEY, scroll X Y DY, wait SECONDS, look, stop");
    process.exit(1);
}
await page.waitForTimeout(settle);
state.n += 1;
save();
const shot = join(dir, `${String(state.n).padStart(3, "0")}.png`);
await page.screenshot({ path: shot });
log({ n: state.n, cmd, args, shot, ...(errors.length ? { errors } : {}) });
console.log(shot);
if (errors.length) console.log(`console errors: ${errors.length}`);
// Leave the browser running for the next action: exiting drops only our connection.
process.exit(0);
