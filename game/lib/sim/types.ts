// Two kinds of data, kept apart on purpose. Settled 2026-10-13: the Mind judges from what Earth knows, never the seed.
// - World is the seed's truth, as calcs/export_worlds.py drew it. Only the server reads it.
// - EarthView is what Earth knows at a moment. It is all the Mind is ever told.
// Times are game Years: Year 0 is 2040.

export interface Star {
  name: string;
  /** The name players see: Gliese 432 A, not Gl 432A. */
  shown: string;
  kind: string;
  d: number;
  lum?: number;
  north?: boolean;
  hz?: [number, number];
}

export interface Inbound {
  what: string;
  move: string;
  sent: number;
  year: number;
  sends: number;
  watts: number | null;
  /** Would Year 0's sky watch catch it? Would the all-sky watch? */
  kit0: boolean | null;
  allsky: boolean | null;
  /** Sent as laser flashes, which no radio watch hears, and whether the deep flash watch would catch them. */
  laser?: boolean;
  flash?: boolean;
}

export interface Neighbor {
  name: string;
  star: string;
  d: number;
  dead: boolean;
  waking: number;
  disposition: string;
  dials: string;
  thinks: number;
  heard: boolean;
  heardSince: number | null;
  world: { mass: number; a: number; pole: number; tug: number };
  foundBy2040: boolean;
  swept: boolean;
  inbound: Inbound[];
  afterSilence: { at: number; move: string } | null;
  probes: Record<string, number | string | boolean>[];
}

export interface Find {
  star: string;
  d: number;
  msini: number;
  a: number;
  periodDays: number;
  by: string;
  year: number;
  truth: { kind: "home" | "dead" | "natural"; who?: string; rung?: string };
}

export interface World {
  v: 1;
  seed: number;
  earth: Record<string, unknown>;
  neighbors: Neighbor[];
  worlds: { star: string; d: number; a: number; radius: number; mass: number; felt: boolean; swept: boolean; rung: string }[];
  colonies: { root: string; star: string; lands: number; stands: number }[];
  finds: Find[];
  stars: Record<string, Star>;
}

/** A world Earth has felt by its tug: what the planet hunters measured, and nothing about who is there. */
export interface FeltWorld {
  star: string;
  d: number;
  minMass: number;
  periodDays: number;
  a: number;
  by: string;
  year: number;
  /** Its star, from the catalogs: its kind, and its warm zone in AU. */
  kind?: string;
  hz?: [number, number];
  /** What our Infrared Telescope has made of it so far, once built: whether it can split it from its star, each band
   *  of its air read, true if it shows, and the Year of the latest, or of its first look. */
  read?: { split: boolean; readable?: boolean; water?: boolean; oxygen?: boolean; ozone?: boolean; at?: number };
}

/** A signal Earth's watch caught, as received. */
export interface Heard {
  star: string;
  d: number;
  sent: number;
  arrived: number;
  move: string;
  /** What it holds, read at once. Its sender may sign it. */
  text: string | null;
  /** The build that caught it, when Year 0's sky watch would have missed it. */
  by?: string;
  /** It came as laser flashes. */
  laser?: boolean;
}

/** What a flyby saw of a world, and sent home. Pictures show what is larger than a pixel: haze, bare ground, cloud
 *  and sea, or forest. A probe reads its air too. */
export interface Visit {
  star: string;
  world: string;
  by: "sails" | "probe";
  /** The Year it passed, and the Year its word reached us. */
  passed: number;
  home: number;
  sight: "haze" | "bare" | "seas" | "green";
  air?: { water: boolean; oxygen: boolean };
}

export interface EarthView {
  year: number;
  felt: FeltWorld[];
  heard: Heard[];
  visits: Visit[];
}
