import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { regime } from "./regime.mjs";

// Named game states, so a capture, a critic or a player can start at the moment it needs, never replaying the opening
// to get there. Each lives in playtests/states/<id>.json as a save with its Year in place of its Begin time:
// { "year": 233.4, "save": { ...the game's holos:save, without beganAt } }. The regime lists them, with what each
// screen is meant to show. 2026-11-08.

const dir = fileURLToPath(new URL("../playtests/states/", import.meta.url));
// 5 real minutes = 1 Year, as game/lib/game/clock.ts sets it.
export const MS_PER_YEAR = 5 * 60 * 1000;

export const states = (r = regime()) => r.states ?? [];
export const fixtureFile = (id) => `${dir}${id}.json`;

/** A state's fixture, or null when it has no save yet. */
export function fixture(id) {
  const f = fixtureFile(id);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null;
}

/** The save to put in the browser for a fixture, its Begin set so the clock reads its Year at `now`. */
export function saveAt(fx, now = Date.now()) {
  const { year, save } = fx;
  return { ...save, beganAt: year === null || year === undefined ? null : now - year * MS_PER_YEAR };
}

/** A fixture from a save in a running game: the Year it reads now, and the save without its Begin time. */
export function fromSave(save, now = Date.now()) {
  const { beganAt, held, ...rest } = save;
  const at = held ?? now;
  return { year: beganAt === null ? null : Math.round(((at - beganAt) / MS_PER_YEAR) * 1000) / 1000, save: rest };
}

export const writeFixture = (id, fx) => writeFileSync(fixtureFile(id), JSON.stringify(fx, null, 2) + "\n");

/** Puts a fixture's save in a page's browser before the game loads, so it opens on that state. */
export const seedPage = (page, fx, now = Date.now()) =>
  page.addInitScript((s) => {
    if (!sessionStorage.getItem("holos:state")) {
      localStorage.setItem("holos:save", s);
      sessionStorage.setItem("holos:state", "1");
    }
  }, JSON.stringify(saveAt(fx, now)));

/** Every capture run here, oldest first, with its critic's scores, for the regime page, as a script it loads. */
export function writeIndex() {
  const capDir = fileURLToPath(new URL("../playtests/captures/", import.meta.url));
  if (!existsSync(capDir)) return;
  const runs = readdirSync(capDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(capDir, d.name, "results.json")))
    .map((d) => d.name)
    .sort()
    .map((name) => {
      const read = (f) => (existsSync(join(capDir, name, f)) ? JSON.parse(readFileSync(join(capDir, name, f), "utf8")) : null);
      return { ...read("results.json"), critic: read("critic.json"), critic2: read("critic.codex.json"), since: read("since.json"), fixes: read("fixes.json") };
    });
  writeFileSync(fileURLToPath(new URL("../playtests/captures.js", import.meta.url)), `window.CAPTURES = ${JSON.stringify(runs)};\n`);
}

