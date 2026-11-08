import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// Playwright, wherever it is installed: PLAYWRIGHT_PATH, this project, the cloud's tools, or the global one. The blind
// player and the screen capture share it. 2026-11-08.
export function playwright() {
  const req = createRequire(join(process.cwd(), "x.js"));
  const tries = [process.env.PLAYWRIGHT_PATH, "playwright", "/opt/node-tools/node_modules/playwright"];
  try {
    tries.push(join(execSync("npm root -g", { encoding: "utf8" }).trim(), "playwright"));
  } catch {}
  for (const t of tries.filter(Boolean))
    try {
      return req(t);
    } catch {}
  console.error("Playwright isn't installed. Run: npm i -g playwright && npx playwright install chromium");
  process.exit(1);
}

/** The Chrome to run: CHROME, else Playwright's own when downloaded, else the Mac's Google Chrome. Undefined lets
 *  Playwright say what is missing. */
export function chromePath(pw) {
  if (process.env.CHROME) return process.env.CHROME;
  try {
    const own = pw.chromium.executablePath();
    if (existsSync(own)) return own;
  } catch {}
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return existsSync(mac) ? mac : undefined;
}
