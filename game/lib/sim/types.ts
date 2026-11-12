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
  /** How fast it crosses our sky, in km/s, from Gaia's motion of it. Since 2026-11-12. */
  kms?: number;
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
/** At a hole, feed it or hide in it. At a star, settle and build out, or keep small: a receiver and a cold Mind made
 *  from a comet's worth of rock, which no watcher counts as growth. 2026-10-30. */
export type ColonyMode = "furnace" | "refuge" | "settle" | "quiet";

export interface Find {
  star: string;
  d: number;
  msini: number;
  a: number;
  periodDays: number;
  by: string;
  year: number;
  /** What the world is. Every find is natural since the neighbors retired, 2026-10-29. */
  truth: { kind: "natural"; rung?: string };
}

export interface World {
  v: 1;
  seed: number;
  earth: Record<string, unknown>;
  worlds: { star: string; d: number; a: number; radius: number; mass: number; felt: boolean; swept: boolean; rung: string; field?: boolean }[];
  finds: Find[];
  stars: Record<string, Star>;
  /** Lone black holes in the region, from calcs/holes.py: where, how heavy, how fast it spins, its speed across the
   *  sky, whether Gaia's fifth catalog found it by Year 0, and the Years a star mapper would catch a star it shifts.
   *  The truth: Earth knows one only once found. 2026-10-26. */
  holes?: Hole[];
  /** The realistic premise's minds, from calcs/minds.py: old minds out to 1,000 ly, young peers across the Galaxy,
   *  and the watcher. Drawn beside the old neighbors until the rework retires them. The truth. 2026-10-29. */
  minds?: Minds;
}

/** Positions are atlas light-years, (Galactic X, Galactic Z, -Galactic Y), as data/gcns-326ly.bin. Times are game Years. */
export interface Minds {
  old: OldMind[];
  peers: Peer[];
  watcher: Watcher;
}

export interface OldMind {
  id: string;
  pos: [number, number, number];
  d: number;
  /** Its star's index in data/gcns-326ly.bin, or null at a seeded place beyond the catalog. */
  star: number | null;
  /** Years older than us. */
  age: number;
  asleep: boolean;
  /** Its cold far-infrared glow, awake. Null asleep. */
  glowW: number | null;
  /** Asleep, how far from its star it rests, folded up small, in AU. Null awake. */
  restAU: number | null;
  /** Its star's light in Suns, read from the census: it sets how far out its cold works sit. Null at a seeded place
   *  beyond the catalog. Missing on a world drawn before 2026-11-12. */
  lum?: number | null;
  /** How fast its star crosses our sky, in km/s, from Gaia's motion of it, which we hold for every census star. It sets
   *  how far a beam aimed where the star will be passes the star as it is. Null where we hold none. */
  kms?: number | null;
  /** Its part in the settling, when the Galaxy's first groups became one under one rule: it helped set the rule, it
   *  spread and was made to stop, or it was born after. calcs/minds.py's nature, 2026-11-11. */
  part: "founder" | "stopped" | "after";
  /** Three scores, 1 to 10, tilted by its part: hidden to open, hostile to peaceful, withholding to generous. */
  open: number;
  peaceful: number;
  generous: number;
  /** Asleep, whether a knock from a craft beside it wakes it. Null awake. */
  wakes: boolean | null;
}

export interface Peer {
  id: string;
  pos: [number, number, number];
  d: number;
  /** When it woke, before (negative) or after our Year 0. */
  wake: number;
  buildYears: number;
  /** Its chance to spread, and the stars its family settled. No cap on reach (2026-10-30). */
  spreadChance: number;
  settlements: number;
  reachLy: number;
  seedC: number | null;
  outwardYears: number;
  asleep: boolean;
  /** The Years its warm phase shines at Earth. */
  flash: [number, number];
  /** The Year our waking's light reaches it. */
  ourLight: number;
  atContact: "inward" | "outward" | "unborn";
}

export interface Watcher {
  place: string;
  /** On an Earth co-orbital asteroid, which one. */
  rock: string | null;
  kg: number;
  arrivedYearsAgo: number;
  /** The id of the old mind that sent it. */
  maker: string;
  /** How far out its relay holds on our Sun's focal line, opposite its maker, in AU. 2026-10-30. */
  relayAU: number;
  /** Warn, contain, strike: what triggers each, who acts, and the Years after we act that it arrives. Data, so it
   *  can vary per mind later. */
  ladder: { rung: "warn" | "contain" | "strike"; on: string; by: "watcher" | "maker"; delay: number }[];
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
  /** Its star, from the catalogs: its kind, its warm zone in AU, and its light in Suns. */
  kind?: string;
  hz?: [number, number];
  lum?: number;
  /** How fast its star crosses our sky, in km/s. */
  kms?: number;
  /** What our Infrared Telescope has made of it so far, once built. */
  read?: Read;
  /** What our 15 m Mirror has made of it, once built, if it can read more of it than the Infrared Telescope can. */
  wide?: Read;
  /** What our Far-Side Array has heard there, once it has gathered enough to hear a magnetic field at a red dwarf's
   *  world this far: whether it has one, and the Year. 2026-11-11. */
  field?: FieldHeard;
}

/** Whether a world has a magnetic field, as our Far-Side Array heard, and the Year it could tell. */
export interface FieldHeard {
  has: boolean;
  at: number;
}

/** A world our Far-Side Array found by the radio of its magnetic field, known no other way. The radio rises and falls
 *  with its turning, which this close to a red dwarf is its year, so we have its orbit and no mass. 2026-11-11. */
export interface FieldWorld {
  star: string;
  d: number;
  a: number;
  periodDays: number;
  /** The Year it was heard. */
  at: number;
  kind?: string;
  hz?: [number, number];
  /** Its star's light in Suns, from the catalogs, and its speed across our sky in km/s. */
  lum?: number;
  kms?: number;
  /** What the Infrared Telescope has read of it, and the 15 m Mirror, where each can split it from its star: few can.
   *  A mirror that can't split it never turns there, so it has no read. 2026-11-12. */
  read?: Read;
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
  /** Missed when it came, and dug out of old recordings by our idle thought at this Year. 2026-10-28. */
  found?: number;
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
  /** Word from our colony of a move it made by its own choice, and whose news it was on. 2026-10-28. */
  ours?: { chose: string; on?: string };
  /** A warning sent to us about another world, which it names as it knows it. 2026-10-28. */
  warning?: true;
}

/** What a flyby saw of a world, and sent home. Pictures show what is larger than a pixel: haze, bare ground, cloud
 *  and sea, forest, ice, or cities and cleared land. A probe reads its air too. A lens at the Sun's focus pictures a
 *  felt world from home, a pixel kilometers wide, since 2026-10-26. */
export interface Visit {
  star: string;
  world: string;
  by: "sails" | "probe" | "lens" | "sentinel" | "seed" | "hyper";
  /** The Year it passed, or for a lens the Year it began to look, and the Year its word reached us. */
  passed: number;
  home: number;
  sight: "haze" | "bare" | "seas" | "green" | "ice" | "dark" | "rocks" | "far" | "works" | "dusty";
  air?: { water: boolean; oxygen: boolean };
  /** A lens's or the Hypertelescope's pixel, in km across the world. */
  km?: number;
  /** At a black hole: its spin, measured, and how slow a clock runs on its innermost stable orbit. */
  spin?: number;
  clock?: number;
  lost?: "catch" | "strike";
  /** What a sentinel found making a warm glow's heat: a mind's works, or dust round a young star or two stars merged. */
  glow?: "mind" | "eruption" | "merger";
  /** A pass that found no world, at a black hole. */
  hole?: boolean;
  /** A seed probe's: its generation, 1 for one we sent, the star it was built at, and where its place is in our sky, for
   *  a star with no lead of its own. Word that it sent a copy on carries the copy's star. 2026-10-26. */
  gen?: number;
  from?: string | null;
  at?: [number, number, number];
  sent?: string;
}

/** A bullet of ours that has landed, by our reckoning, and what we saw of it. Nothing comes home from a bullet: we
 *  know it landed only by its light, and only where something of ours could catch that. lib/sim/strikes.ts. 2026-11-12. */
export interface StrikeSeen {
  star: string;
  d: number;
  fired: number;
  lands: number;
  /** The Year its light reaches us. */
  home: number;
  /** We knew a world there when it was fired, so it had something to aim at. Without one it flies on through. */
  world: boolean;
  /** Its flash over the world's own light. */
  ratio?: number;
  /** What caught its flash, once its light is home: a sentinel of ours that stays there, or a telescope that splits
   *  the world from its star. Absent with its light home: nothing of ours could. */
  seen?: "sentinel" | "hyper" | "wide" | "near";
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
  /** The realistic premise's minds Earth has found: warm flashes, cold glows, the watcher, sleepers. lib/sim/minds.ts. */
  minds?: import("./minds.ts").MindsSeen;
  /** What our 15 m Mirror has read of Proxima b, once built. */
  proxima?: Read;
  /** Worlds our Far-Side Array found by their magnetic fields, and what it heard of Proxima b's. 2026-11-11. */
  fields?: FieldWorld[];
  proximaField?: FieldHeard;
  /** Each bullet of ours that has landed, oldest first. 2026-11-12. */
  strikes?: StrikeSeen[];
  /** What ground telescopes saw of Proxima b by Year 0: its true mass, tilt and brightness. 2026-10-31. */
  proximaSeen?: import("./proxima.ts").ProximaSeen;
}
