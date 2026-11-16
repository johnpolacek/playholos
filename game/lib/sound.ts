import { useSyncExternalStore } from "react";
import { getSkin, onSkin } from "@/lib/skin";

// The UI's sounds, 2026-11-16, in the manner of SPEC-01/HARDWARE (spec-01.vercel.app): every control speaks as it is
// touched, as a key, a latch or a dial would. Nothing is recorded. Each voice is made as it plays, in Web Audio, from
// a short burst of filtered noise for the click and a falling tone for the body, each a little different every time,
// so a run of taps never sounds like one sample looped.
//
// It listens once, at the document, for ui-sdk's parts by their data-slot, so every screen's controls speak without a
// line in them: a button goes down and comes up, a toggle or a choice latches, a slider ticks, a list's item blips as
// it is reached, a popup opens, and a field types. A control we draw ourselves joins by being a ui-sdk part.
//
// Sounds are the Hardware skin's own, on by default there and off in the others. The menu and the /ui bar turn them
// on or off in any skin, and that choice is kept in this browser. Browsers let a page sound only after a tap or a
// key, so nothing plays before one. The game's music, lib/music.ts, is its own.

const KEY = "holos-sounds";

type Voice = "down" | "down-primary" | "up" | "latch-down" | "latch-up" | "tick" | "blip" | "open" | "type" | "type-space" | "type-big";

let chosen = read();
const subs = new Set<() => void>();

function read(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "on" ? true : v === "off" ? false : null;
  } catch {
    return null;
  }
}

/** Whether the UI makes sounds: the choice made, or else the skin's own. */
export const soundOn = () => chosen ?? getSkin() === "hardware";

/** Turns the sounds on or off, and keeps the choice. */
export function setSound(next: boolean) {
  chosen = next;
  try {
    localStorage.setItem(KEY, next ? "on" : "off");
  } catch {
    // No storage: the choice holds until the page closes.
  }
  subs.forEach((f) => f());
  if (next) play("latch-down");
}

export function useSound() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      const off = onSkin(f);
      return () => {
        subs.delete(f);
        off();
      };
    },
    soundOn,
    () => false,
  );
}

// The engine: one context, one quiet master, and half a second of noise to cut clicks from.
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;

function engine() {
  if (ctx?.state === "closed") ctx = null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: "interactive" });
    out = ctx.createGain();
    out.gain.value = 0.42;
    out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== "running") void ctx.resume().catch(() => undefined);
  return ctx;
}

/** A little drift, so no two plays are the same. */
const drift = (by: number) => 1 + (Math.random() * 2 - 1) * by;

/** A click: noise through a filter, struck and gone. */
function click(t: number, o: { freq: number; q?: number; level: number; decay: number; type?: BiquadFilterType }) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = drift(0.1);
  const f = c.createBiquadFilter();
  f.type = o.type ?? "bandpass";
  f.frequency.value = o.freq * drift(0.06);
  f.Q.value = o.q ?? 1;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(o.level * drift(0.15), t + 0.0008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.decay);
  src.connect(f).connect(g).connect(out!);
  src.start(t, Math.random() * 0.4);
  src.stop(t + o.decay + 0.02);
}

/** A body: a tone that falls, or rises, as it fades. */
function tone(t: number, o: { freq: number; to?: number; level: number; decay: number; type?: OscillatorType; attack?: number }) {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = o.type ?? "sine";
  const f0 = o.freq * drift(0.04);
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, ((o.to ?? o.freq) / o.freq) * f0), t + o.decay);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(o.level * drift(0.12), t + (o.attack ?? 0.001));
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.decay);
  osc.connect(g).connect(out!);
  osc.start(t);
  osc.stop(t + o.decay + 0.02);
}

// Our voices, tuned by ear for Holos: a little lower and softer than a bench's, as a console far from home would be.
const VOICES: Record<Voice, (t: number) => void> = {
  down: (t) => (click(t, { freq: 2400, q: 0.9, level: 0.3, decay: 0.022 }), tone(t, { freq: 190, to: 120, level: 0.36, decay: 0.05 })),
  "down-primary": (t) => (click(t, { freq: 1900, q: 0.8, level: 0.34, decay: 0.028 }), tone(t, { freq: 150, to: 92, level: 0.5, decay: 0.075 })),
  up: (t) => (click(t, { freq: 3600, q: 1.2, level: 0.14, decay: 0.012 }), tone(t, { freq: 280, to: 230, level: 0.08, decay: 0.018 })),
  "latch-down": (t) => (
    click(t, { freq: 1900, q: 0.8, level: 0.18, decay: 0.02 }), tone(t, { freq: 150, to: 104, level: 0.2, decay: 0.045 }), click(t + 0.004, { freq: 1100, q: 13, level: 0.035, decay: 0.05 })
  ),
  "latch-up": (t) => (click(t, { freq: 3000, q: 1, level: 0.11, decay: 0.012 }), click(t + 0.003, { freq: 1500, q: 12, level: 0.03, decay: 0.04 })),
  tick: (t) => (click(t, { type: "highpass", freq: 3000, q: 0.7, level: 0.18, decay: 0.006 }), tone(t, { freq: 4100, level: 0.03, decay: 0.01 })),
  blip: (t) => tone(t, { type: "square", freq: 2200, level: 0.03, decay: 0.045, attack: 0.002 }),
  open: (t) => (click(t, { freq: 2500, q: 1, level: 0.09, decay: 0.012 }), tone(t, { freq: 480, to: 780, level: 0.04, decay: 0.06, attack: 0.003 })),
  type: (t) => (click(t, { freq: 3100, q: 1.1, level: 0.2, decay: 0.014 }), tone(t, { freq: 240, to: 180, level: 0.15, decay: 0.03 })),
  "type-space": (t) => (
    click(t, { freq: 2100, q: 0.8, level: 0.24, decay: 0.022 }), tone(t, { freq: 160, to: 116, level: 0.24, decay: 0.05 }), click(t + 0.006, { freq: 860, q: 6, level: 0.05, decay: 0.03 })
  ),
  "type-big": (t) => (click(t, { freq: 2400, q: 0.9, level: 0.24, decay: 0.018 }), tone(t, { freq: 185, to: 130, level: 0.26, decay: 0.045 })),
};

let last = 0;
let lastVoice: Voice | null = null;
/** Plays a voice now, if sounds are on and the page may sound. The same voice twice at once plays once. */
export function play(v: Voice) {
  if (typeof window === "undefined" || !soundOn()) return;
  const now = performance.now();
  if (v === lastVoice && now - last < 30) return;
  const c = engine();
  if (!c || !out) return;
  last = now;
  lastVoice = v;
  VOICES[v](c.currentTime + 0.002);
}

// What speaks, by ui-sdk's data-slot. A key goes down and comes up; a latch speaks as its state changes, so the keys
// and a tap sound the same; a field types.
const KEYS = '[data-slot="button"], [data-slot="select-trigger"], [data-slot="collapsible-trigger"], [data-slot="dialog-trigger"], [data-slot="drawer-trigger"], [data-slot="dialog-close"], [data-slot="drawer-close"], [data-slot="tabs-tab"], a[href], button';
const LATCHES = '[data-slot="toggle"], [data-slot="segmented-control-item"], [data-slot="switch"], [data-slot="checkbox"], [data-slot="radio"]';
const FIELDS = 'input:not([type="range"], [type="checkbox"], [type="radio"]), textarea, [contenteditable="true"]';
const POPUPS = /-(content|popup|positioner)$/;
const QUIET_POPUPS = /^(tooltip|hover-card)-/;
// The one move: a key in the solid fill, or ours or theirs.
const PRIMARY = ".bg-button, .bg-you, .bg-other";

const keyOf = (t: EventTarget | null) => {
  const el = t instanceof Element ? t : null;
  if (!el || el.closest(LATCHES)) return null;
  const k = el.closest(KEYS);
  if (!k || k.matches(":disabled, [data-disabled], [aria-disabled='true']")) return null;
  return k;
};

/** Listens once, as the app starts, for every control in the game. */
export function startSounds() {
  if (typeof window === "undefined") return;
  let down: Element | null = null;

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      const k = keyOf(e.target);
      if (!k) return;
      down = k;
      play(k.matches(PRIMARY) ? "down-primary" : "down");
    },
    true,
  );
  document.addEventListener(
    "pointerup",
    () => {
      if (down) play("up");
      down = null;
    },
    true,
  );
  document.addEventListener("pointercancel", () => (down = null), true);

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.matches(FIELDS)) {
        if (e.key === " ") play("type-space");
        else if (e.key === "Enter" || e.key === "Backspace" || e.key === "Delete") play("type-big");
        else if (e.key.length === 1) play("type");
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        const k = keyOf(t);
        if (k) play(k.matches(PRIMARY) ? "down-primary" : "down");
      }
    },
    true,
  );
  document.addEventListener(
    "keyup",
    (e) => {
      const t = e.target instanceof Element ? e.target : null;
      if (t?.matches(FIELDS)) return;
      if ((e.key === "Enter" || e.key === " ") && keyOf(t)) play("up");
    },
    true,
  );

  // States, as they change: a latch set or let go, a slider's value, a list's item reached, a popup opened.
  let lastTick = 0;
  const seen = new WeakSet<Element>();
  new MutationObserver((records) => {
    let sound: Voice | null = null;
    const rank: Voice[] = ["blip", "tick", "latch-up", "open", "latch-down"];
    const say = (v: Voice) => {
      if (!sound || rank.indexOf(v) > rank.indexOf(sound)) sound = v;
    };
    for (const r of records) {
      if (r.type !== "attributes" || !(r.target instanceof Element)) continue;
      const el = r.target;
      const slot = el.getAttribute("data-slot") ?? "";
      const now = r.attributeName ? el.hasAttribute(r.attributeName) : false;
      if ((r.attributeName === "data-pressed" || r.attributeName === "data-checked") && el.matches(LATCHES)) {
        if (now) say("latch-down");
        else if (el.matches('[data-slot="toggle"], [data-slot="switch"], [data-slot="checkbox"]')) say("latch-up");
      } else if (r.attributeName === "data-highlighted" && now && slot.endsWith("-item")) {
        say("blip");
      } else if (r.attributeName === "value" && slot === "slider-thumb-input") {
        // A slider's value, as its hidden range takes it: from a drag, a tap on its track, or its keys.
        say("tick");
      } else if (r.attributeName === "data-open") {
        if (now && POPUPS.test(slot) && !QUIET_POPUPS.test(slot) && !seen.has(el)) {
          seen.add(el);
          say("open");
        } else if (!now) seen.delete(el);
      }
    }
    if (!sound) return;
    const t = performance.now();
    // A slider's ticks are kept apart, so a fast drag is a run of ticks, not a buzz. An open right after a press is
    // the press's own.
    if (sound === "tick" && t - lastTick < 35) return;
    if (sound === "open" && t - last < 150) return;
    if (sound === "tick") lastTick = t;
    play(sound);
  }).observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-pressed", "data-checked", "data-highlighted", "data-open", "value"],
  });
}
