import { useSyncExternalStore } from "react";

// The game's skins. A skin is a data-skin attribute on the page's root: its colors sit under that attribute in
// app/globals.css, and each kit part draws its own look for it. "chalk" is the game as it has been, and the default.
// "instrument" draws the game as a console: matte panels, engraved labels, lamps, knobs and switches. It is a design
// exploration, seen on /ui, and never the default. 2026-11-15.
// "log" draws the game as an observatory's logbook: dark ruled paper, a serif for the record and mono for the data,
// readings as dated entries, the Mind's notes in the margin, and buttons as stamped labels. Also an exploration, never
// the default. 2026-11-15.
// "hardware" draws the game as SPEC-01/HARDWARE draws its own kit: a light bench, soft white keys that stand off it
// and go down under a press, one hot red key, red lamps, black wells for what is drawn or typed, and a sound for every
// touch, lib/sound.ts. Light, where every other skin is dark, so each build's color has a darker partner here.
// Never the default. 2026-11-16.
// "arecibo" draws the game as a 1-bit world, after the message sent from Arecibo in 1974, 73 rows by 23 columns of
// pixels: one ink on black, fills dithered, edges stepped, a bitmap face for headings and labels. A press flips a
// control's pixels, a meter fills bit by bit, and a choice reads as on and off bits. Never the default. 2026-11-15.
// "infrared" draws the game as a thermal image, in an astronomer's false-color heat palette: idle controls are cold
// violet-black, and hover, an open list, a choice and a press heat a control toward amber and white. Meters are heat
// bars, focus is a heat bloom, and the Mind's note glows warm while it thinks. Text stays chalk. Never the default.
// 2026-11-15.

/** Each skin, with its name and what it draws the game as, in a few words for the /ui bar's picker. */
export const SKINS = [
  { id: "chalk", name: "Chalk", as: "The game as it is" },
  { id: "instrument", name: "Instrument", as: "A console" },
  { id: "log", name: "Log", as: "An observatory's logbook" },
  { id: "infrared", name: "Infrared", as: "A thermal image" },
  { id: "arecibo", name: "Arecibo", as: "A 1-bit message" },
  { id: "hardware", name: "Hardware", as: "A bench instrument" },
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

/** The skin, for a part whose markup differs by it. A part that only changes its classes uses `instrument:`, `log:`, `infrared:`,
 *  `arecibo:` or `hardware:`. */
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

/** The skin an address asks for, as ?skin=instrument, ?skin=log, ?skin=infrared, ?skin=arecibo or ?skin=hardware, or null. For playtests: main.tsx reads it once as the game
 *  loads, and it holds from page to page until the next full load. It is never kept, so the game opens in chalk
 *  again without it. 2026-11-15. */
export function askedSkin(search: string): Skin | null {
  const s = new URLSearchParams(search).get("skin");
  return SKINS.some((k) => k.id === s) ? (s as Skin) : null;
}
