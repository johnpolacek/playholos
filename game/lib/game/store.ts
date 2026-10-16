import type { Save } from "./types";

// Saves live in the browser for now. A server store implements the same interface later.
export interface GameStore {
  load(): Promise<Save | null>;
  save(game: Save): Promise<void>;
  clear(): Promise<void>;
}

const KEY = "holos:save";

export const browserStore: GameStore = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Save) : null;
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
