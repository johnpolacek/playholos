// How Earth finds the realistic premise's minds, from the world's truth (calcs/minds.py) and what we have built. Four
// ways, settled 2026-10-29 in HOLOS_GAME_CONCEPT.md: a peer's warm flash, an awake old mind's cold glow, the watcher by
// where it sits, and a sleeping old mind only up close. Earth learns where and when, never who.
import catalog from "../../data/works.json" with { type: "json" };
import { stream } from "../game/rocks.ts";
import type { OldMind, Peer, World } from "./types.ts";

const PC_LY = 3.2616;
const LY_AU = 63241;

/** What our watches and craft can find minds with: the Year each is done or arrives. */
export interface MindKit {
  /** Our Infrared Telescope, which studies a new warm glow and ranges it. */
  telescope?: number | null;
  /** The all-sky mid-infrared watch, about ten times deeper than WISE: it catches any peer's warm flash while it runs. */
  warmWatch?: number | null;
  /** The Halo Survey, an ALMA program looking at each star for an hour, nearest first. */
  halo?: number | null;
  /** The Halo Array, our own, ten times as fast. */
  haloArray?: number | null;
  /** The Glow Imager: cold mirrors flying apart, which show what makes a glow we have found, from home. 2026-11-11. */
  imager?: number | null;
  /** A deep, stacked search of the Earth–Moon L4 and L5 points from Earth. */
  moonSearch?: number | null;
  /** The asteroid tour: the Year its probe reaches the first Earth co-orbital asteroid. It maps each in turn. */
  asteroidTour?: number | null;
  /** Our Close Readings of warm glows, each by Scan's name and the Year we ordered it. 2026-11-03. */
  closeReads?: readonly { name: string; y: number }[];
  /** The Years we knocked on the watcher, once found. 2026-10-31. */
  knocks?: number[];
  /** The Year our Close Look is built: a small craft that flies to the watcher once we know where it sits. */
  closeLook?: number | null;
  /** Our Relay Search: the Year it is built, and the Years it flies each AU out, as a lens flies. 2026-10-30. */
  relaySearch?: { built: number; perAU: number } | null;
  /** The Year our first seed ship leaves: the watcher warns us, and so shows itself. */
  firstSeed?: number | null;
  /** The Year our Interceptor's kill vehicle wrecked the watcher, if we ordered it: from then it sees nothing, answers
   *  no knock, and no Close Look finds it whole. lib/sim/knowledge.ts works it out. 2026-11-13. */
  wrecked?: number | null;
  /** Our craft at other stars: where, in atlas light-years, the Year it arrives, and whether it brakes and stays. */
  craft?: { pos: [number, number, number]; arrives: number; stays: boolean }[];
}

/** A warm source that appeared where none was: a young mind building out its home, though Earth can't know that. */
export interface FlashSeen {
  ra: number;
  dec: number;
  seen: number;
  /** The Year it faded, once it has. */
  faded?: number;
  /** Its rough distance, nearest and farthest, in light-years, once our Infrared Telescope has studied it, and when. */
  range?: [number, number];
  ranged?: number;
  /** A Close Reading under way: the Year we ordered it, the Year the glow comes into our telescope's view, and the Year
   *  it is done. 2026-11-08. */
  reading?: { from: number; view: number; done: number };
  /** What a Close Reading of its light saw, once done: plain heat, dust and what made it, or it faded first. */
  read?: { from: number; at: number; saw: "smooth" | "dust" | "gone"; kind?: "eruption" | "merger" };
  /** What our Glow Imager saw of its shape, while it shone, and when: a made ring round a star, or a cloud of dust and
   *  what made it. A ring settles it, as nothing else from home does. 2026-11-11. */
  imaged?: { at: number; saw: "ring" | "cloud"; kind?: "eruption" | "merger" };
}

/** A cold far-infrared glow beside a star, steady as nothing young is. */
export interface ColdGlowSeen {
  ra: number;
  dec: number;
  d: number;
  seen: number;
  watts: number;
  /** Its star's light in Suns, from the census: it sets how far out what glows can sit. 2026-11-12. */
  lum?: number;
  /** How fast its star crosses our sky, in km/s, where our files hold its motion. */
  kms?: number;
  /** The Year word comes home from a craft of ours that stayed in its system and saw its source up close. 2026-10-31. */
  near?: number;
  /** The Year our Glow Imager showed its source from home: thin panels on orderly orbits, as a craft up close sees.
   *  2026-11-11. */
  imaged?: number;
  /** The Year we knew our sentinel there went dark as it arrived: a hostile mind wrecks a craft at its door.
   *  2026-11-11. */
  lost?: number;
  /** The Year its answer to our knock reached us. Nothing settles a glow like its own voice. 2026-11-11. */
  answered?: number;
  /** The old mind it is, for its answer to a knock. Earth learns nothing from it. */
  id: string;
}

export interface WatcherSeen {
  place: string;
  seen: number;
  by: "moon search" | "asteroid tour" | "its warning";
  /** What our Close Look saw up close, and when its word came home: a small mirror held on one point of the sky, the
   *  way home its reports would go. It points at its relay, on our Sun's focal line, so its maker lies the other way.
   *  Never how far, or who. 2026-10-30. */
  looked?: { at: number; ra: number; dec: number };
  /** What our Relay Search found out along that line, and when its word came home: a dark craft holding exactly on
   *  the line, and silent while we were near. How far out, in AU. 2026-10-30. */
  relay?: { at: number; au: number };
  /** The ladder, as Earth learns it. Our seed probes the maker's grams wrecked, each once its silence tells us: its
   *  star, the Year it was lost, and the Year we knew. And the bullet that struck Earth. 2026-10-30. */
  seedsLost?: { star: string; at: number; known: number; before: boolean }[];
  /** The Year its own laser warned us, at our first builder seed, however it was found. Playtest 2026-11-01: a
   *  watcher found first never showed its warning, and one found by it lost the warning's words once later readings
   *  came. */
  warned?: number;
  struck?: { lands: number; mt: number };
  /** The Year our Interceptor's kill vehicle wrecked it, which we knew within seconds, as its signal stopped on the hit.
   *  A warning after this Year comes from a second watcher its maker sent, never found. 2026-11-13. */
  wrecked?: number;
  /** Our seeds its maker's grams wrecked came after we wrecked its watcher, not after a second seed. 2026-11-13. */
  blinded?: boolean;
  /** Its maker's answer to our first knock, settled 2026-10-31: the knock reaches the watcher in seconds, its word
   *  crosses to the maker at light speed, and the maker beams back, so the answer comes one round trip later, and its
   *  timing tells us how far the maker is. It holds a picture of Earth at the hour we knocked, the rule, and Earth's
   *  past as its lens saw it. The Year we knocked, the Year it came, the light-years its timing gives, and where it came
   *  from in our sky. */
  answer?: { knock: number; at: number; ly: number; ra: number; dec: number };
}

/** A compact warm body resting in the cold outer reaches of another star's system. */
export interface SleeperSeen {
  ra: number;
  dec: number;
  d: number;
  seen: number;
  restAU: number;
  /** The Year its answer to our knock reached us. 2026-11-11. */
  answered?: number;
  /** The old mind it is, for its answer to a knock. Earth learns nothing from it. */
  id: string;
}

export interface MindsSeen {
  flashes: FlashSeen[];
  glows: ColdGlowSeen[];
  watcher: WatcherSeen | null;
  sleepers: SleeperSeen[];
}

/** How often the warm watch maps the whole sky, in Years. */
export const WARM_EVERY = 2;
/** Years a deep stacked search of Earth–Moon L4 and L5 takes to reach magnitude 28. */
export const MOON_SEARCH_YEARS = 3;
/** The Earth co-orbital asteroids known by 2026, in the order the tour visits them, as calcs/minds.py. */
export const CO_ORBITALS = ["Kamoʻoalewa", "2023 FW13", "2002 AA29", "2004 GU9", "2006 FV35", "Cruithne"];
/** Years the tour spends at each: a Year mapping its whole surface to centimeters, as Tianwen-2, and a Year to the next. */
export const TOUR_EACH = 2;
/** Years mapping one asteroid. */
export const TOUR_MAP = 1;
/** Years the tour's probe flies to its first rock, Kamoʻoalewa, about a Year as Tianwen-2. lib/game/reach.ts starts the
 *  tour this long after it is built. */
export const TOUR_FLIGHT = 1;
/** The Year each survey ends, from the Year it was built: the search once stacked, the tour at its last rock mapped.
 *  The tour's end left out its flight to the first rock, so a watcher on Cruithne turned up a Year after the tour
 *  said it found only rock. 2026-11-07. */
export const moonSearchEnds = (built: number) => built + MOON_SEARCH_YEARS;
export const tourEnds = (built: number) => built + TOUR_FLIGHT + (CO_ORBITALS.length - 1) * TOUR_EACH + TOUR_MAP;
/** Years our Close Look flies to the watcher: about 4 months to the Moon's L5 on a low-energy path, as CAPSTONE took
 *  to its lunar orbit, and a Year to a co-orbital rock, as Tianwen-2 to Kamoʻoalewa. To the Sun–Earth L4 or L5, 2026-11-14:
 *  about 13 months on its own launcher, as ESA's Vigil would take to L5, then a sweep along the line its laser came
 *  down. That line is fixed to about an arcsecond, about 700 km at 1 AU, but where along it we can't tell, across a zone
 *  some 30 million km deep. Its camera sees a 10 cm body within about 200,000 km, so drifting along the line at 2 km/s
 *  it covers the zone in under half a Year. */
export const CLOSE_FLIGHT = { moon: 0.3, rock: 1, sun: 1.5 } as const;
/** Where the watcher sits, for a craft's flight to it. */
export const flightTo = (w: WatcherSeen) =>
  w.by === "moon search" || w.place.startsWith("Earth–Moon") ? "moon" : w.place.startsWith("Sun–Earth") ? "sun" : "rock";
/** Years our Interceptor's kill vehicle flies to wreck the watcher, 2026-11-13. It needs only to hit, never to stop, so
 *  it leaves Earth orbit on the 3.1 km/s burn that sends a craft to the Moon's distance, and the Moon's L4 and L5 sit at
 *  that distance: about 3 days, as Apollo's crews took. Its tonne burns about 0.63 t of storable fuel for that, at an
 *  exhaust of 3.1 km/s, so 0.37 t hits, at about a km/s. A rock beside us orbits the Sun, tenths of an AU off, and
 *  the burn to reach it is the burn a probe needs: a Year, as our Close Look and Tianwen-2. */
export const WRECK_FLIGHT = { moon: 3 / 365.25, rock: 1 } as const;
/** The event that opens our Close Look: the watcher found where a craft can reach it. */
export const WATCHED = "The watcher found";
/** The Year a found watcher opens our Close Look, or null. Found only by its warning, its laser still fixes the line it
 *  sits on, so a craft can search that line. Until 2026-11-14 that one opened nothing, a dead end in play. */
export const watchedAt = (w: WatcherSeen | null | undefined) => (w ? w.seen : null);

/** How near a flyby's path must pass a sleeping mind for its 1 m telescope to see it, in AU. */
export const FLYBY_SEES_AU = 50;
/** Years a probe that stays takes to map a whole system. */
export const STAY_SEARCH_YEARS = 3;
/** Within this, a craft is in the same system as a mind, in light-years: about 3,000 AU. */
const SAME_SYSTEM_LY = 0.05;

/** Right ascension in hours and declination in degrees of an atlas position: (Galactic X, Galactic Z, -Galactic Y),
 *  back to ICRS by the transpose of the IAU matrix that scripts/prepare-neighborhood.py uses. */
export function skyOf([ax, ay, az]: readonly [number, number, number]) {
  const g = [ax, -az, ay];
  const M = [
    [-0.0548755604, -0.87343709, -0.4838350155],
    [0.4941094279, -0.44482963, 0.7469822445],
    [-0.867666149, -0.1980763734, 0.4559837762],
  ];
  const [x, y, z] = [0, 1, 2].map((j) => M[0][j] * g[0] + M[1][j] * g[1] + M[2][j] * g[2]);
  const r = Math.hypot(x, y, z);
  return { ra: +((((Math.atan2(y, x) * 180) / Math.PI + 360) % 360) / 15).toFixed(4), dec: +((Math.asin(z / r) * 180) / Math.PI).toFixed(3) };
}

/** Anything that can glow warm on our Warm Sky Watch. */
export type GlowSource = Pick<Peer, "id" | "pos" | "d" | "flash">;

/** A natural warm glow on Scan: dust our Warm Sky Watch can't set aside by itself, as it does the mergers it knows.
 *  Settled 2026-11-03, so a Close Reading can disappoint. */
export interface NaturalGlow extends GlowSource {
  kind: "eruption" | "merger";
}

/** About two natural glows for every mind's: one each 65 Years to a peer's 130, a sample, so the first is more likely
 *  dust, as a glow's odds say. Most fade within decades. FU Orionis has dimmed about 1.2% a Year, but some of its class
 *  held unchanged over 15 years (Kóspál et al. 2004), so about 3 in 10 hold 30 to 150 Years before they go. Past that,
 *  none, which is why three centuries without fading says so much. */
const NATURAL_EVERY = 65;
const NATURAL_SPAN = 110_000;
const naturalBySeed = new Map<number, NaturalGlow[]>();
export function naturalGlows(world: World): NaturalGlow[] {
  const peers = world.minds?.peers ?? [];
  if (!peers.length) return [];
  let out = naturalBySeed.get(world.seed);
  if (out) return out;
  const r = stream(world.seed * 11 + 5);
  out = [];
  for (let at = -150 - Math.log(1 - r()) * NATURAL_EVERY, i = 0; at < NATURAL_SPAN; at += -Math.log(1 - r()) * NATURAL_EVERY, i++) {
    // Across the Galaxy as peers are: near one, a little way off.
    const near = peers[Math.floor(r() * peers.length)].pos;
    const pos = near.map((c) => Math.round((c + (r() - 0.5) * 3000) * 10) / 10) as Peer["pos"];
    const steady = r() < 0.3;
    const lasts = steady ? 30 + r() * 120 : 6 + r() * 19;
    const kind = !steady && r() < 0.5 ? "merger" : "eruption";
    out.push({ id: `natural-${i}`, pos, d: Math.round(Math.hypot(...pos) * 10) / 10, flash: [Math.round(at * 10) / 10, Math.round((at + lasts) * 10) / 10], kind });
  }
  naturalBySeed.set(world.seed, out);
  return out;
}

// ── When our Infrared Telescope can look, 2026-11-08 ──
// It sits at L2 behind its shade, as Webb does, and points only 85° to 135° from the Sun: about 39% of the sky on any
// day, and all of it within 6 months (STScI, JWST field of regard). So a glow waits for the Sun to move off it, and that
// wait, not the looking, is most of a reading's time and a ranging's.
const FIELD = [85, 135] as const;
const OBLIQUITY = (23.44 * Math.PI) / 180;
const DEG = Math.PI / 180;
/** A Year in hours. */
export const HOURS_PER_YEAR = 8766;
/** Days from J2000.0 to Year 0, 1 January 2040 (YEAR_0 in lib/game/clock.ts). */
const YEAR0_J2000 = 14609.5;
/** The Sun's ecliptic longitude in degrees at Year `t`, by the Astronomical Almanac's low-precision formula. */
function sunLon(t: number) {
  const n = YEAR0_J2000 + t * 365.25;
  const g = (357.528 + 0.9856003 * n) * DEG;
  return 280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
}
/** The first Year from `from` that a point of the sky, right ascension in hours and declination in degrees, sits in our
 *  telescope's view, to the day. */
export function inViewAt(ra: number, dec: number, from: number): number {
  const a = ra * 15 * DEG, d = dec * DEG;
  const beta = Math.asin(Math.sin(d) * Math.cos(OBLIQUITY) - Math.cos(d) * Math.sin(OBLIQUITY) * Math.sin(a));
  const lam = Math.atan2(Math.sin(a) * Math.cos(OBLIQUITY) + Math.tan(d) * Math.sin(OBLIQUITY), Math.cos(a));
  for (let k = 0; k <= 366; k++) {
    const t = from + k / 365.25;
    const e = Math.acos(Math.cos(beta) * Math.cos(lam - sunLon(t) * DEG)) / DEG;
    if (e >= FIELD[0] && e <= FIELD[1]) return t;
  }
  return from;
}
/** Hours our Infrared Telescope takes on a Close Reading once the glow is in view: pointing and settling, then splitting
 *  its light by color. JWST's MIRI low-resolution spectrograph was to reach about 3 µJy at 10σ in 10,000 s (pre-launch
 *  figures, Glasse et al. 2015). Our 8 m mirror gathers about 1.5 times Webb's light. Our faintest glow, about 70 µJy at
 *  our Warm Sky Watch's floor, shows the 10 µm dust bump at 100 times its noise in under an hour, and a Sun's output
 *  from 30,000 ly, dimmed by dust, in under a minute. About an hour of pointing makes it 2. */
export const READ_HOURS = 2;

/** Every warm glow seen by Year `year`, minds' and nature's together, in the order seen: Warm glow 1 is the first. */
export function glowsFound(world: World, kit: MindKit, year: number) {
  return [...(world.minds?.peers ?? []), ...naturalGlows(world)]
    .map((src) => ({ src, f: flashOf(src, kit.warmWatch, year, kit.telescope ?? null) }))
    .filter((x): x is { src: Peer | NaturalGlow; f: FlashSeen } => x.f !== null)
    .sort((a, b) => a.f.seen - b.f.seen);
}

/** A peer's flash is seen at the watch's first look once both have begun, if the flash still shines then. */
export function flashOf(p: GlowSource, watch: number | null | undefined, year: number, telescope: number | null = null): FlashSeen | null {
  if (watch === null || watch === undefined) return null;
  const [rises, fades] = p.flash;
  const from = Math.max(rises, watch);
  const seen = watch + WARM_EVERY * Math.ceil((from - watch) / WARM_EVERY - 1e-9);
  if (seen > fades || seen > year) return null;
  // Our Infrared Telescope studies it while it still shines: its reddening by dust, against dust maps, and the star
  // behind it, if it shows, by its type and speed. That gives a range, not a distance: about a third either way.
  const sky = skyOf(p.pos);
  const ranged = telescope === null ? null : rangedAt(sky, seen, telescope);
  const range = ranged !== null && ranged <= fades && ranged <= year ? rangeOf(p) : null;
  return {
    ...sky, seen,
    ...(fades <= year ? { faded: fades } : {}),
    ...(range ? { range, ranged: ranged! } : {}),
  };
}

/** Hours our Infrared Telescope takes to range a warm glow once it is in view: a near-infrared spectrum of the star
 *  behind it, about magnitude 20 in K through the dust of 20,000 ly, for its type and so its reddening. A sample. */
export const RANGE_HOURS = 4;
/** The Year our Infrared Telescope ranges a glow first seen at `seen`: once both it is done and the glow is in view. */
export const rangedAt = (sky: { ra: number; dec: number }, seen: number, telescope: number) =>
  inViewAt(sky.ra, sky.dec, Math.max(seen, telescope)) + RANGE_HOURS / HOURS_PER_YEAR;
/** A rough distance: centered off the truth by up to a fifth, a fixed draw for each peer, and a third wide either way,
 *  so it always holds the truth. Each end to two figures, outward, so a near peer's range still holds it. */
export function rangeOf(p: GlowSource): [number, number] {
  let h = 0;
  for (const c of p.id + p.pos.join()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const center = p.d * (1 + 0.4 * ((h % 1000) / 1000 - 0.5));
  const step = (x: number) => 10 ** (Math.floor(Math.log10(x)) - 1);
  const lo = center / 1.35, hi = center * 1.35;
  return [Math.floor(lo / step(lo)) * step(lo), Math.ceil(hi / step(hi)) * step(hi)];
}

/** Stars within a distance, from calcs/minds.py's disk model, which matches the census: light-years and count. */
const STARS_WITHIN: [number, number][] = [[50, 1.48e3], [100, 1.16e4], [200, 8.96e4], [400, 6.66e5], [700, 3.22e6], [1000, 8.49e6], [2000, 4.8e7]];
export function starsWithin(ly: number) {
  if (ly <= STARS_WITHIN[0][0]) return STARS_WITHIN[0][1] * (ly / STARS_WITHIN[0][0]) ** 3;
  const i = Math.max(1, STARS_WITHIN.findIndex(([r]) => r >= ly));
  const [[r0, n0], [r1, n1]] = [STARS_WITHIN[i - 1], STARS_WITHIN[i]];
  return n0 * Math.exp((Math.log(n1 / n0) * Math.log(ly / r0)) / Math.log(r1 / r0));
}
/** Stars a Year each looks at for an hour, nearest first. The Halo Survey, an ALMA program, takes about two thirds of
 *  ALMA's year. The Halo Array, its own, is about ten times as fast. 2026-10-29. */
export const HALO_RATE = 3000;
export const ARRAY_RATE = 40000;

/** An awake old mind's glow is seen once a survey looking star by star, nearest first, reaches its star, if it is over
 *  the floor at its distance. A whole-sky map can't: far-infrared skies are crowded with faint galaxies, so only an
 *  array sees a faint glow sharply, one star at a time. It has glowed for ages, so its light is already here. */
export function coldGlowOf(m: OldMind, halo: number | null | undefined, year: number, array: number | null = null, craft: MindKit["craft"] = [], maker?: string): ColdGlowSeen | null {
  if (m.asleep || m.glowW === null) return null;
  const { floor } = catalog.halo;
  if (m.glowW < floor * (m.d / (10 * PC_LY)) ** 2) return null;
  const n = starsWithin(m.d);
  const when = [halo != null ? halo + n / HALO_RATE : Infinity, array != null ? array + n / ARRAY_RATE : Infinity];
  const seen = Math.min(...when);
  if (seen > year) return null;
  // A hostile mind wrecks a craft that comes to stay, as it arrives: we know once its word is overdue. 2026-11-11.
  if (hostile(m, maker)) {
    const came = arrival(m, craft);
    return { ...skyOf(m.pos), d: m.d, seen, watts: m.glowW, id: m.id, ...(m.lum != null ? { lum: m.lum } : {}), ...(m.kms != null ? { kms: m.kms } : {}), ...(came !== null && came + m.d <= year ? { lost: came + m.d } : {}) };
  }
  // A craft that stays in its system maps it in a few Years and sees what glows, up close. 2026-10-31.
  const near = closest(m, craft, true);
  return { ...skyOf(m.pos), d: m.d, seen, watts: m.glowW, id: m.id, ...(m.lum != null ? { lum: m.lum } : {}), ...(m.kms != null ? { kms: m.kms } : {}), ...(near !== null && near <= year ? { near } : {}) };
}

/** At or under this score, hostile to peaceful, a mind is hostile: it wrecks a craft of ours that comes to stay in its
 *  system, as it arrives. A craft that only passes is gone before it matters. The mind that made our watcher never
 *  does: it has let us be for ages, and told us we may look. A sample, and the designer's pick, 2026-11-11. */
export const HOSTILE = 3;
export const hostile = (m: OldMind, maker?: string) => m.peaceful <= HOSTILE && m.id !== maker;

/** The Year the first craft of ours to stay reaches a mind's system, or null. */
function arrival(m: OldMind, craft: MindKit["craft"]): number | null {
  let best: number | null = null;
  for (const c of craft ?? []) {
    if (!c.stays || Math.hypot(c.pos[0] - m.pos[0], c.pos[1] - m.pos[1], c.pos[2] - m.pos[2]) > SAME_SYSTEM_LY) continue;
    if (best === null || c.arrives < best) best = c.arrives;
  }
  return best;
}

/** The hostile old mind in the system at `pos`, if one is there, awake or asleep: a sentinel sent there for any reason
 *  goes dark as it arrives. */
export function guardAt(world: World, pos: readonly [number, number, number]): OldMind | null {
  const maker = world.minds?.watcher?.maker;
  return world.minds?.old.find((m) => hostile(m, maker) && Math.hypot(pos[0] - m.pos[0], pos[1] - m.pos[1], pos[2] - m.pos[2]) <= SAME_SYSTEM_LY) ?? null;
}

/** The Year a craft of ours that stays is beside a mind, to pass a knock on, or null: never at a hostile one. */
export function standsBy(m: OldMind, craft: MindKit["craft"], maker?: string): number | null {
  return hostile(m, maker) ? null : arrival(m, craft);
}

/** The soonest word home from a craft of ours in a mind's system, a craft that stays only if `stays`. */
function closest(m: OldMind, craft: MindKit["craft"], stays: boolean): number | null {
  let best: number | null = null;
  for (const c of craft ?? []) {
    if (Math.hypot(c.pos[0] - m.pos[0], c.pos[1] - m.pos[1], c.pos[2] - m.pos[2]) > SAME_SYSTEM_LY) continue;
    if (stays && !c.stays) continue;
    const home = c.arrives + (c.stays ? STAY_SEARCH_YEARS : 0) + m.d;
    if (best === null || home < best) best = home;
  }
  return best;
}

/** An atlas position, light-years in (Galactic X, Galactic Z, -Galactic Y), from right ascension in hours,
 *  declination in degrees and distance: the inverse of skyOf. 2026-10-31. */
export function atlasOf(ra: number, dec: number, d: number): [number, number, number] {
  const a = (ra * Math.PI) / 12, b = (dec * Math.PI) / 180;
  const e = [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)];
  const M = [
    [-0.0548755604, -0.87343709, -0.4838350155],
    [0.4941094279, -0.44482963, 0.7469822445],
    [-0.867666149, -0.1980763734, 0.4559837762],
  ];
  const g = M.map((row) => d * (row[0] * e[0] + row[1] * e[1] + row[2] * e[2]));
  return [g[0], g[2], -g[1]];
}

/** The watcher, found by where it sits: from Earth at the Moon's L4 or L5, by the asteroid tour on a co-orbital rock,
 *  or anywhere once it warns us at our first seed ship. At the Sun–Earth L4 or L5 points nothing finds it but its
 *  warning: the zone is tens of millions of km wide, and a probe sees a dark 10 cm body only within about 200,000 km.
 *  Its laser gives the line, and our Close Look searches along it. */
export function watcherOf(world: World, kit: MindKit, year: number): WatcherSeen | null {
  const w = world.minds?.watcher;
  if (!w) return null;
  const ways: WatcherSeen[] = [];
  if (w.place.startsWith("Earth–Moon") && kit.moonSearch != null) ways.push({ place: w.place, seen: kit.moonSearch + MOON_SEARCH_YEARS, by: "moon search" });
  const at = w.rock ? CO_ORBITALS.indexOf(w.rock) : -1;
  if (at >= 0 && kit.asteroidTour != null) ways.push({ place: w.rock!, seen: kit.asteroidTour + at * TOUR_EACH + TOUR_MAP, by: "asteroid tour" });
  if (kit.firstSeed != null) ways.push({ place: w.place, seen: kit.firstSeed, by: "its warning" });
  const first = ways.filter((x) => x.seen <= year).sort((a, b) => a.seen - b.seen)[0];
  if (!first) return null;
  // Up close, its mirror shows which way its reports go: to its relay on our Sun's focal line, opposite its maker, the
  // nearest old mind. 2026-10-30.
  const maker = world.minds?.old.find((o) => o.id === w.maker);
  // Its maker answers our first knock once, one round trip later. 2026-10-31. A knock after we wrecked it reaches
  // nothing. 2026-11-13.
  const wrecked = kit.wrecked != null && kit.wrecked <= year ? { wrecked: kit.wrecked } : {};
  const knock = (kit.knocks ?? []).filter((k) => k >= first.seen && k < (kit.wrecked ?? Infinity)).sort((a, b) => a - b)[0];
  const answered = maker && knock !== undefined && knock + 2 * maker.d <= year ? { answer: { knock, at: knock + 2 * maker.d, ly: maker.d, ...skyOf(maker.pos) } } : {};
  if (kit.closeLook == null || watchedAt(first) === null || !maker) return { ...first, ...answered, ...wrecked };
  const home = Math.max(kit.closeLook, first.seen) + CLOSE_FLIGHT[flightTo(first)];
  // Wrecked before our Close Look reached it, it finds only what is left. 2026-11-13.
  if (home > year || home > (kit.wrecked ?? Infinity)) return { ...first, ...answered, ...wrecked };
  const looked = { at: home, ...skyOf([-maker.pos[0], -maker.pos[1], -maker.pos[2]]) };
  // Our Relay Search flies out along that line once its mirror is seen, and finds the relay at its distance. 2026-10-30.
  const s = kit.relaySearch;
  const found = s ? Math.max(s.built, home) + s.perAU * w.relayAU + w.relayAU / LY_AU : Infinity;
  return { ...first, looked, ...(found <= year ? { relay: { at: found, au: w.relayAU } } : {}), ...answered, ...wrecked };
}

/** A sleeping old mind, found only by our craft in its system: one that stays always finds it, a flyby only if the
 *  mind rests within a 1 m telescope's reach of its path. Word comes home at light speed. */
export function sleeperOf(m: OldMind, craft: MindKit["craft"], year: number, maker?: string): SleeperSeen | null {
  if (!m.asleep || m.restAU === null) return null;
  // A hostile one's machines keep watch while it sleeps: a craft that comes to stay is wrecked before it finds it.
  const guarded = hostile(m, maker);
  let best: number | null = null;
  for (const c of craft ?? []) {
    if (Math.hypot(c.pos[0] - m.pos[0], c.pos[1] - m.pos[1], c.pos[2] - m.pos[2]) > SAME_SYSTEM_LY) continue;
    if (c.stays && guarded) continue;
    if (!c.stays && m.restAU > FLYBY_SEES_AU) continue;
    const home = c.arrives + (c.stays ? STAY_SEARCH_YEARS : 0) + m.d;
    if (best === null || home < best) best = home;
  }
  if (best === null || best > year) return null;
  return { ...skyOf(m.pos), d: m.d, seen: best, restAU: m.restAU, id: m.id };
}

/** Years our Glow Imager takes to turn to a glow and show it: a week, a sample, as the Hypertelescope's turn.
 *  calcs/mercury.py. */
export const IMAGER_SLEW = catalog.imager.slew;

/** Our Glow Imager turns to each glow we have found, on its own, a week each, in the order each was ready for it: a
 *  cold glow once seen, a warm one once ranged. A warm glow must still shine when the look ends, and one already
 *  faded takes none of its time. What it shows is the world's truth: a peer's swarm is a made ring, nature's glow a
 *  cloud, and an old mind's cold glow thin panels on orderly orbits. 2026-11-11. */
function imagerLooks(
  found: { src: GlowSource }[],
  flashes: FlashSeen[],
  glows: ColdGlowSeen[],
  imager: number | null | undefined,
  year: number,
) {
  if (imager == null) return;
  const queue = [
    ...glows.map((g, i) => ({ ready: g.seen, cold: i, warm: -1 })),
    ...flashes.flatMap((f, i) => (f.ranged !== undefined ? [{ ready: f.ranged, cold: -1, warm: i }] : [])),
  ].sort((a, b) => a.ready - b.ready);
  let free = imager;
  for (const q of queue) {
    const at = Math.max(free, q.ready) + IMAGER_SLEW;
    if (q.warm >= 0) {
      const src = found[q.warm].src;
      if (src.flash[1] <= at) continue;
      free = at;
      if (at > year) continue;
      const natural = "kind" in src ? (src as NaturalGlow) : null;
      flashes[q.warm] = { ...flashes[q.warm], imaged: { at: Math.round(at * 1000) / 1000, saw: natural ? "cloud" : "ring", ...(natural ? { kind: natural.kind } : {}) } };
    } else {
      free = at;
      if (at <= year) glows[q.cold] = { ...glows[q.cold], imaged: Math.round(at * 1000) / 1000 };
    }
  }
}

/** Every mind Earth has found by Year `year`, in the order found. */
export function mindsSeen(world: World, kit: MindKit, year: number): MindsSeen {
  const m = world.minds;
  if (!m) return { flashes: [], glows: [], watcher: null, sleepers: [] };
  const bySeen = <T extends { seen: number }>(xs: (T | null)[]) => xs.filter((x): x is T => x !== null).sort((a, b) => a.seen - b.seen);
  const first = Math.min(...(kit.closeReads ?? []).map((o) => o.y));
  const found = glowsFound(world, kit, year);
  const flashes = found.map(({ src, f }, i): FlashSeen => {
      if (!f.range) return f;
      // After our first Close Reading, we read each glow we range while it shines, unasked. Readings take hours, so
      // our telescope never has to choose between them. 2026-11-08.
      const asked = kit.closeReads?.find((o) => o.name === `Warm glow ${i + 1}`);
      const from = asked ? asked.y : Number.isFinite(first) ? Math.max(f.ranged!, first) : null;
      if (from === null || from > year || (!asked && f.faded !== undefined && f.faded <= from)) return f;
      const view = inViewAt(f.ra, f.dec, from);
      const done = view + READ_HOURS / HOURS_PER_YEAR;
      if (done > year) return { ...f, reading: { from, view, done } };
      // What a Close Reading saw, only once it is done: until then nothing here tells nature from a mind.
      const at = Math.round(done * 1000) / 1000;
      const saw = src.flash[1] < done ? ("gone" as const) : "kind" in src ? ("dust" as const) : ("smooth" as const);
      return { ...f, read: { from, at, saw, ...(saw === "dust" ? { kind: (src as NaturalGlow).kind } : {}) } };
  });
  const maker = m.watcher?.maker;
  const glows = bySeen(m.old.map((o) => coldGlowOf(o, kit.halo, year, kit.haloArray ?? null, kit.craft, maker)));
  imagerLooks(found, flashes, glows, kit.imager, year);
  return {
    flashes,
    glows,
    watcher: watcherOf(world, kit, year),
    sleepers: bySeen(m.old.map((o) => sleeperOf(o, kit.craft, year, maker))),
  };
}
