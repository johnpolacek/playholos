import { BUILDS } from "./plan";
import type { Save } from "./types";

// Saves live in the browser for now. A server store implements the same interface later.
export interface GameStore {
  load(): Promise<Save | null>;
  save(game: Save): Promise<void>;
  clear(): Promise<void>;
}

export const STORE_KEY = "holos:save";
const KEY = STORE_KEY;
/** Builds no longer in the game, which a save from before may hold. */
const RETIRED = new Set(["Strike Yard", "Helium-3 Harvest"]);

/** A build's name as it is now, from any name it had. */
const named = (b: string) =>
  b.toLowerCase() === "data center"
    ? "Thought Fields"
    : (BUILDS.find((x) => x.name.toLowerCase() === b.toLowerCase())?.name ?? b);

export const browserStore: GameStore = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      const game = raw ? (JSON.parse(raw) as Save) : null;
      // Builds are named in Title Case, and the data center is Thought Fields, since 2026-10-18: a plan queued before
      // keeps its builds.
      if (game?.plan) game.plan.builds = game.plan.builds.map(named);
      // Our bullets were retired 2026-11-13, with the two builds that readied and fuelled them, and the wrecks an old
      // mind made for one: a save from before drops them.
      if (game?.plan) {
        const plan = game.plan as typeof game.plan & { strikes?: unknown; wrecks?: unknown };
        plan.builds = plan.builds.filter((b) => !RETIRED.has(b));
        if (plan.later) plan.later = plan.later.filter((o) => !RETIRED.has(o.name));
        if (plan.stops) plan.stops = plan.stops.filter((o) => !RETIRED.has(o.name));
        if (plan.switches) plan.switches = plan.switches.filter((o) => !RETIRED.has(o.name));
        delete plan.strikes;
        delete plan.wrecks;
      }
      return game;
    } catch {
      return null;
    }
  },
  async save(game) {
    try {
      localStorage.setItem(KEY, JSON.stringify(game));
    } catch {}
  },
  async clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  },
};
