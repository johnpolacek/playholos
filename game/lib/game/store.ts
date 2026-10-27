import { BUILDS } from "./plan";
import type { Save } from "./types";

// Saves live in the browser for now. A server store implements the same interface later.
export interface GameStore {
  load(): Promise<Save | null>;
  save(game: Save): Promise<void>;
  clear(): Promise<void>;
}

const KEY = "holos:save";

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
