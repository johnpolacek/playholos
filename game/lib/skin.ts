import { useSyncExternalStore } from "react";

// The game's skins. A skin is a data-skin attribute on the page's root: its colors sit under that attribute in
// app/globals.css, and each kit part draws its own look for it. "chalk" is the game as it has been, and the default.
// "instrument" draws the game as a console: matte panels, engraved labels, lamps, knobs and switches. It is a design
// exploration, seen on /ui, and never the default. 2026-11-15.
// "log" draws the game as an observatory's logbook: dark ruled paper, a serif for the record and mono for the data,
// readings as dated entries, the Mind's notes in the margin, and buttons as stamped labels. Also an exploration, never
// the default. 2026-11-15.
// "schematic" draws the game as a technical drawing: thin cyan-white lines on a deep blue-black, nothing filled. A
// control that is pressed, chosen or queued is hatched, a meter or a slider is a dimension line with its ticks, and
// focus is a crosshair. The art already reads as a diagram, so only the controls change. Never the default.
// 2026-11-15.

export const SKINS = [
  { id: "chalk", name: "Chalk" },
  { id: "instrument", name: "Instrument" },
  { id: "log", name: "Log" },
  { id: "schematic", name: "Schematic" },
] as const;

export type Skin = (typeof SKINS)[number]["id"];

let skin: Skin = "chalk";
const heed = new Set<() => void>();

export const getSkin = () => skin;

/** Set the skin for the whole page. The root carries it, so a sheet or a list drawn outside the page wears it too. */
export function setSkin(to: Skin) {
  skin = to;
  if (typeof document !== "undefined") document.documentElement.dataset.skin = to;
  heed.forEach((f) => f());
}

/** The skin, for a part whose markup differs by it. A part that only changes its classes uses `instrument:`, `log:` or `schematic:`. */
export const useSkin = () =>
  useSyncExternalStore(
    (f) => (heed.add(f), () => void heed.delete(f)),
    () => skin,
    () => "chalk" as Skin,
  );

// The skin picked on /ui, kept per viewer. Storage can be shut, as in a private window, so each call is guarded.
const KEY = "holos:ui-skin";

export function savedSkin(): Skin {
  try {
    const s = localStorage.getItem(KEY);
    return SKINS.some((k) => k.id === s) ? (s as Skin) : "chalk";
  } catch {
    return "chalk";
  }
}

export function saveSkin(to: Skin) {
  try {
    localStorage.setItem(KEY, to);
  } catch {
    // Nowhere to keep it: the pick holds for this visit.
  }
}

/** The skin an address asks for, as ?skin=instrument, ?skin=log or ?skin=schematic, or null. For playtests: main.tsx reads it once as the game
 *  loads, and it holds from page to page until the next full load. It is never kept, so the game opens in chalk
 *  again without it. 2026-11-15. */
export function askedSkin(search: string): Skin | null {
  const s = new URLSearchParams(search).get("skin");
  return SKINS.some((k) => k.id === s) ? (s as Skin) : null;
}
