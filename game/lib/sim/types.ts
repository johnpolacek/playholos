// Two kinds of data, kept apart on purpose. Settled 2026-10-13: the Mind judges from what Earth knows, never the seed.
// - World is the seed's truth, as calcs/export_worlds.py drew it. Only the server reads it.
// - EarthView is what Earth knows at a moment. It is all the Mind is ever told.
// Times are game Years: Year 0 is 2040.

export interface Star {
  /** Where it sits in the sky, from the census: right ascension in hours, declination. Since 2026-10-26. */
  ra?: number;
  dec?: number;
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

/** How our Mind lives where the Seed Ship sets it down: feeding a hole, hiding in its shadow, or settled at a star on
 *  its light and its rock. A star since 2026-10-27. */
export type ColonyMode = "furnace" | "refuge" | "settle";

export interface Neighbor {
  name: string;
  star: string;
  d: number;
  dead: boolean;
  waking: number;
  disposition: string;
  /** Years its computing takes to double after waking: 10 for most, 5 for those that turn inward. */
  doubling: number;
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
  /** An elder, awake for millennia before us and done growing: asleep, or computing cold at a steady ceiling, in watts.
   *  One a game, 2026-10-28. */
  elder?: { asleep: boolean; ceiling: number };
}

export interface Find {
  star: string;
  d: number;
  msini: number;
  a: number;
  periodDays: number;
  by: string;
  year: number;
  truth: { kind: "home" | "dead" | "natural"; who?: string; rung?: string; elder?: "awake" | "asleep" };
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
  /** Lone black holes in the region, from calcs/holes.py: where, how heavy, how fast it spins, its speed across the
   *  sky, whether Gaia's fifth catalog found it by Year 0, and the Years a star mapper would catch a star it shifts.
   *  The truth: Earth knows one only once found. 2026-10-26. */
  holes?: Hole[];
}

export interface Hole {
  id: string;
  d: number;
  ra: number;
  dec: number;
  mass: number;
  spin: number;
  vt: number;
  found2040: boolean;
  events: number[];
  /** Neighbors bound for it, soonest first: a sentinel to watch, or a colony to stay, a bright furnace or a dark
   *  refuge. From calcs/holes.py's claim(). */
  claims?: { who: string; kind: "sentinel" | "colony"; mode?: "furnace" | "refuge"; arrives: number; stands?: number }[];
}

/** A black hole Earth has found, by how it shifted a star behind it: its name, where, its mass as measured, and when
 *  and how it was found. Its spin is unknown until something goes there. */
export interface DarkMass {
  name: string;
  d: number;
  ra: number;
  dec: number;
  mass: number;
  found: number;
  by: "Gaia" | "Star Mapper";
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
  /** What our Infrared Telescope has made of it so far, once built. */
  read?: Read;
  /** What our 15 m Mirror has made of it, once built, if it can read more of it than the Infrared Telescope can. */
  wide?: Read;
}

export type Gas = "water" | "oxygen" | "ozone";

/** What one of our telescopes has made of a world so far: whether it can split it from its star, each gas of its air
 *  read, true if it shows, the gases whose bands lie past this mirror's reach there, and the Year of the latest, or of
 *  its first look. */
export interface Read {
  split: boolean;
  readable?: boolean;
  water?: boolean;
  oxygen?: boolean;
  ozone?: boolean;
  beyond?: Gas[];
  at?: number;
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
  /** An answer to one of our messages, sent in play: what ours said. Our record with that star. 2026-10-26. */
  answers?: string;
  /** It was a gift of knowledge, all of it come, and our thought goes this many times as far from its Year. 1 when it
   *  holds nothing for our thinking. */
  gift?: number;
  /** A call every way at once, on another world's news, not ours: the neighbors talking among themselves. 2026-10-26. */
  overheard?: boolean;
  /** Sent on news of a craft of ours at a black hole, which it names. 2026-10-26. */
  about?: string;
}

/** What a flyby saw of a world, and sent home. Pictures show what is larger than a pixel: haze, bare ground, cloud
 *  and sea, forest, ice, or cities and cleared land. A probe reads its air too. A lens at the Sun's focus pictures a
 *  felt world from home, a pixel kilometers wide, since 2026-10-26. */
export interface Visit {
  star: string;
  world: string;
  by: "sails" | "probe" | "lens" | "sentinel" | "seed";
  /** The Year it passed, or for a lens the Year it began to look, and the Year its word reached us. */
  passed: number;
  home: number;
  sight: "haze" | "bare" | "seas" | "green" | "ice" | "cities" | "dark" | "rocks";
  air?: { water: boolean; oxygen: boolean };
  /** A lens's pixel, in km across the world. */
  km?: number;
  /** What a sentinel, staying, saw that a pass can't: someone living there, or the ruins of those who did. */
  lives?: boolean;
  ruins?: boolean;
  /** An elder's home, as a craft there sees it: cold works far out, humming, or dark and still. 2026-10-28. */
  elder?: "awake" | "asleep";
  /** At a black hole: its spin, measured, and how slow a clock runs on its innermost stable orbit. */
  spin?: number;
  clock?: number;
  /** Who else is there when our sentinel arrives, as it sees them, never by name: a craft watching, or works. */
  others?: { kind: "sentinel" | "colony"; mode?: "furnace" | "refuge" }[];
  /** Word from a sentinel at a black hole after it arrived: someone else braking in at `passed`, from the star its
   *  track runs back to, or its own end. */
  came?: string;
  lost?: "catch" | "strike";
  /** A seed probe's: its generation, 1 for one we sent, the star it was built at, and where its place is in our sky, for
   *  a star with no lead of its own. Word that it sent a copy on carries the copy's star. 2026-10-26. */
  gen?: number;
  from?: string | null;
  at?: [number, number, number];
  sent?: string;
}

/** A grey glow our Halo Survey has seen at a star: cold computing's waste heat, line-free, whose color fits no dust.
 *  2026-10-26. */
export interface Glow {
  star: string;
  d: number;
  /** The Year the survey first saw it, and how bright it is now, in watts, as its light shows it. */
  seen: number;
  watts: number;
  /** It has held steady over five Years of looks or more: not growing, as nothing young is. An elder's. 2026-10-28. */
  steady?: boolean;
  /** Where its star sits: right ascension in hours, declination. */
  ra?: number;
  dec?: number;
}

export interface EarthView {
  year: number;
  felt: FeltWorld[];
  heard: Heard[];
  visits: Visit[];
  /** Our Mind sent to a black hole or a star, as its word has reached us. */
  colony?: {
    star: string;
    mode: ColonyMode;
    leaves: number;
    lands?: number;
    stands?: number;
    d?: number;
    /** Who was there first. At a star, a people at home, or the ruins of one. */
    others?: { kind: "sentinel" | "colony" | "home" | "ruins" | "elder"; mode?: "furnace" | "refuge" }[];
    /** Who braked in after it, each as it saw them and when, and its end, as far as its word has reached us. */
    came?: { kind: "sentinel" | "colony"; at: number; from: string }[];
    lost?: { at: number; how: "catch" | "strike" };
    watts?: number;
    /** At a star, not a hole. */
    atStar?: boolean;
    /** Its hole's spin, measured once it landed, and the clock on its innermost stable orbit. */
    spin?: number;
    clock?: number;
  };
  /** Where the Will lives, when not on Earth: Earth's news reaches it this many Years late. */
  will?: { hole: string; d: number };
  /** Black holes found, by Gaia before Year 0 and by our Star Mapper since. */
  holes?: DarkMass[];
  /** Once the Halo Survey is done, every grey glow it has seen. */
  glows?: Glow[];
  /** What our 15 m Mirror has read of Proxima b, once built. */
  proxima?: Read;
}
