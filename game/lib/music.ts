import { useSyncExternalStore } from "react";

// The game's music: one quiet track on a loop, under every screen. Browsers play sound only after a tap or a key, so
// it starts on the first one. The menu turns it off, and the choice is kept in this browser. It rests while the tab
// is hidden, and while the watcher's voice speaks. 2026-11-15.

const SRC = "/audio/background_music.mp3";
const KEY = "holos-music";
const VOLUME = 0.15;
const FADE = 2500;

let el: HTMLAudioElement | null = null;
let on = read();
let hushed = false;
let away = false;
let fading = 0;
const subs = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

// Eases the volume to a level over a time, then calls back.
function fade(to: number, ms: number, done?: () => void) {
  if (!el) return;
  cancelAnimationFrame(fading);
  const a = el;
  const from = a.volume;
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    a.volume = from + (to - from) * k;
    if (k < 1) fading = requestAnimationFrame(step);
    else done?.();
  };
  step();
}

function sync() {
  const play = on && !hushed && !away && document.visibilityState === "visible";
  if (play) {
    if (!el) {
      el = new Audio(SRC);
      el.loop = true;
      el.volume = 0;
    }
    if (el.paused) void el.play().catch(() => undefined);
    fade(VOLUME, FADE);
  } else if (el && !el.paused) {
    const a = el;
    fade(0, 600, () => a.pause());
  }
}

/** Starts the music on the first tap or key, as browsers allow. Call once, as the app starts. */
export function startMusic() {
  if (typeof window === "undefined") return;
  const first = () => {
    window.removeEventListener("pointerdown", first, true);
    window.removeEventListener("keydown", first, true);
    sync();
  };
  window.addEventListener("pointerdown", first, true);
  window.addEventListener("keydown", first, true);
  document.addEventListener("visibilitychange", () => el && sync());
}

/** Turns the music on or off, and keeps the choice. */
export function setMusic(next: boolean) {
  on = next;
  try {
    if (next) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, "off");
  } catch {
    // No storage: the choice holds until the page closes.
  }
  sync();
  subs.forEach((f) => f());
}

/** Keeps the music off while a page that is not the game is open, the kit's /ui and /design. 2026-11-21. */
export function musicAway(off: boolean) {
  away = off;
  if (el) sync();
}

/** Rests the music while another sound plays, and brings it back after. */
export function hushMusic(hush: boolean) {
  hushed = hush;
  if (el) sync();
}

export function useMusic() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => on,
    () => true,
  );
}
