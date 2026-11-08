import { execSync } from "node:child_process";
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
