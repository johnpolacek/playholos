import { BUILDS, LATER } from "@/lib/game/plan";
import type { Ordered, Size, Will } from "@/lib/game/types";
import type { ColonyMode } from "@/lib/sim/types";
import { GIFT_STEPS } from "@/lib/sim/messages";

// Our order, as the browser sends it from the save, checked against what Earth can build before the server paces it.

// What the plan observes, from the save. Checked, since it comes from the browser.
export function readObserve(o: unknown) {
  return Array.isArray(o) ? o.filter((x): x is string => typeof x === "string").slice(0, 8) : [];
}

// What we have queued, in order, from the save. Checked against what Earth can build, since it comes from the browser.
export function readQueue(b: unknown) {
  const names = new Set(BUILDS.map((build) => build.name));
  return Array.isArray(b) ? b.filter((x): x is string => typeof x === "string" && names.has(x)) : [];
}

// What we have ordered in play, once our builds opened it or after we took one back, and what we have taken back, from
// the save. Checked the same way.
export function readLater(l: unknown): Ordered[] {
  const names = new Set([...BUILDS, ...LATER].map((build) => build.name));
  return Array.isArray(l)
    ? l
        .filter((o): o is Ordered => !!o && names.has(o.name) && typeof o.y === "number" && Number.isFinite(o.y) && o.y >= 0)
        .slice(0, 32)
    : [];
}
export const readStops = readLater;

// Neighbors' gifts from the save: a star's name, the Year all of it reached us, and its size. Checked, one a star, at
// most 32.
export function readGifts(g: unknown): (Ordered & { size?: Size })[] {
  if (!Array.isArray(g)) return [];
  const seen = new Set<string>();
  return g
    .filter((o): o is Ordered & { size?: unknown } => !!o && typeof o.name === "string" && typeof o.y === "number" && Number.isFinite(o.y) && o.y >= 0)
    .filter((o) => !seen.has(o.name) && !!seen.add(o.name))
    .map(({ name, y, size }) => ({ name, y, ...(typeof size === "string" && size in GIFT_STEPS ? { size: size as Size } : {}) }))
    .slice(0, 32);
}

// Lenses or sentinels we sent, from the save: a star's name and the Year we ordered it. Checked, one a star, at most 16.
export function readLenses(l: unknown): Ordered[] {
  if (!Array.isArray(l)) return [];
  const seen = new Set<string>();
  return l
    .filter((o): o is Ordered => !!o && typeof o.name === "string" && o.name.length < 80 && typeof o.y === "number" && Number.isFinite(o.y) && o.y >= 0)
    .filter((o) => !seen.has(o.name) && !!seen.add(o.name))
    .map(({ name, y }) => ({ name, y }))
    .slice(0, 16);
}
export const readSentinels = readLenses;
export const readSeeds = readLenses;
export const readPickets = readLenses;
export const readStrikes = readLenses;

// Our colony at a black hole or a star, from the save: one, by its name, the Year we sent it and its mode. Checked.
export function readColony(c: unknown): (Ordered & { mode: ColonyMode }) | undefined {
  if (!c || typeof c !== "object") return undefined;
  const o = c as Record<string, unknown>;
  if (typeof o.name !== "string" || o.name.length > 80 || typeof o.y !== "number" || !Number.isFinite(o.y) || o.y < 0) return undefined;
  if (o.mode !== "furnace" && o.mode !== "refuge" && o.mode !== "settle") return undefined;
  return { name: o.name, y: o.y, mode: o.mode };
}

/** Where the Will lives, from the browser, if it moved to a hole. 2026-10-26. */
export function readWill(w: unknown): Will | null {
  const x = (w ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  return typeof x.hole === "string" && num(x.d) && num(x.y) && num(x.at) && num(x.rate) && (x.rate as number) >= 1 && (x.rate as number) <= 20
    ? { hole: x.hole.slice(0, 80), d: x.d as number, y: x.y as number, at: x.at as number, rate: x.rate as number }
    : null;
}
