// The sky doing what it does without us: stars exploding across our galaxy and stars merging in dust, at real rates,
// and Betelgeuse, once. None is a mind, and none stops a skip, save Betelgeuse: at 1.6 a century they would stop one
// every few decades. A long skip says what passed instead. The same sky every time for a seed. Settled 2026-10-30,
// sources in HOLOS_RESEARCH.md, "The natural sky".
import { stream } from "./rocks.ts";
import { CATALOG } from "../sim/works.ts";

/** Core-collapse supernovae in our galaxy, a Year: 1.63 a century, Rozwadowska, Vissani and Cappellaro 2021. */
const SN_RATE = 0.0163;
/** Near enough to see by eye through the dust, in light-years: the nearest fifth, as seven seen in two thousand years
 *  suggests against about 32 that happened. Kepler's, the farthest seen, was about 20,000 ly off. Dust hid the rest
 *  until 2026-10-30, when a draw by chance alone let one 46,000 ly away be seen. Neutrino detectors catch every one. */
const EYE_LY = 20_000;
/** Stellar mergers bright enough to glow warm in dust for decades, as V838 Mon did, a Year: about one a century, a
 *  sample between Kochanek et al. 2014's 0.03 and the five times fewer ZTF finds. Only our Warm Sky Watch sees them. */
const MERGE_RATE = 0.01;
/** The disk's scale length and the Sun's distance from the middle, in light-years: 2.6 and 8.15 kpc. */
const DISK = 2.6 * 3261.6;
const R0 = 8.15 * 3261.6;
/** How far ahead this sky is drawn, in Years. */
const SPAN = 200_000;
/** Betelgeuse: about 550 ly away, early in burning helium in its core, so its end is of order 100,000 Years off,
 *  Joyce et al. 2020. Drawn between 50,000 and 200,000, a sample. */
export const BETELGEUSE = { ly: 548, from: 50_000, to: 200_000 };

export interface SkyEvent {
  kind: "supernova" | "merger";
  /** The Year its light reaches us. */
  at: number;
  /** Where in the galaxy, top down, in light-years from its middle, the Sun at (R0, 0). */
  x: number;
  y: number;
  /** Light-years from us. */
  ly: number;
  /** A supernova bright enough to see by eye. */
  eye?: boolean;
}

/** A place in the disk: denser toward the middle, as an exponential disk is, each place weighted by its ring. */
function inDisk(r: () => number) {
  const R = -DISK * Math.log((1 - r()) * (1 - r()));
  const θ = 2 * Math.PI * r();
  const x = R * Math.cos(θ);
  const y = R * Math.sin(θ);
  return { x, y, ly: Math.hypot(x - R0, y) };
}

const skies = new Map<number, { events: SkyEvent[]; betelgeuse: number }>();

/** This seed's natural sky, from Year 0 out to 200,000. */
export function skyOf(seed: number) {
  let sky = skies.get(seed);
  if (sky) return sky;
  const r = stream(seed * 7 + 3);
  const events: SkyEvent[] = [];
  for (const [kind, rate] of [["supernova", SN_RATE], ["merger", MERGE_RATE]] as const)
    for (let at = -Math.log(1 - r()) / rate; at < SPAN; at += -Math.log(1 - r()) / rate)
      events.push(((e) => ({ ...e, ...(kind === "supernova" && e.ly < EYE_LY ? { eye: true } : {}) }))({ kind, at, ...inDisk(r) }));
  events.sort((a, b) => a.at - b.at);
  sky = { events, betelgeuse: Math.round((BETELGEUSE.from + r() * (BETELGEUSE.to - BETELGEUSE.from)) * 10) / 10 };
  skies.set(seed, sky);
  return sky;
}

/** What the sky did after Year `from` and by `to`: the supernovae, and the mergers our Warm Sky Watch saw, if it ran
 *  from `watch`. */
export function skyBetween(seed: number, from: number, to: number, watch: number | null = null) {
  const all = skyOf(seed).events.filter((e) => e.at > from && e.at <= to);
  const supernovae = all.filter((e) => e.kind === "supernova");
  const mergers = watch === null ? [] : all.filter((e) => e.kind === "merger" && e.at >= watch);
  return { supernovae, mergers, betelgeuse: skyOf(seed).betelgeuse > from && skyOf(seed).betelgeuse <= to };
}

/** The sky so far, in words, for the Mind: counts since Year 0, the latest seen by eye, and Betelgeuse once gone.
 *  `fifths`: the Year each fifth of our Far-Side Array was done, for the star storms it hears. */
export function describeSky(seed: number, year: number | null, watch: number | null, ice: number | null = null, fifths: readonly number[] = []) {
  if (year === null || year < 1) return "";
  const { supernovae, mergers, betelgeuse } = skyBetween(seed, 0, year, watch);
  const eye = supernovae.filter((e) => e.eye);
  const n = (x: number) => x.toLocaleString("en-US");
  const last = eye.at(-1);
  return [
    `The natural sky since Year 0. ${n(supernovae.length)} stars have exploded in our galaxy, about 1.6 a century as expected. Our neutrino detectors caught every one. ${n(eye.length)} shone bright enough to see by eye${last ? `, the latest at Year ${n(Math.floor(last.at))}, about ${n(Math.round(last.ly / 100) * 100)} ly away` : ""}. None is a mind's doing.`,
    watch === null ? "" : `Our Warm Sky Watch has seen ${n(mergers.length)} pairs of stars merge and glow warm in their own dust, and set each aside as natural, as it must before any glow can mean a mind.`,
    betelgeuse ? `Betelgeuse exploded at Year ${n(skyOf(seed).betelgeuse)}, ${BETELGEUSE.ly} ly away: for a season as bright as a half Moon, seen by day for more than a Year, and harmless at that distance.` : "",
    ice === null || year < ice ? "" : describeIce(seed, ice, year),
    describeStorms(fifths, year),
  ].filter(Boolean).join(" ");
}

// ── Stars dying in the galaxies round us, heard by our Deep Ice Watch ──
// A detector of about 10 Mt in the South Pole's ice, after MICA, Böser et al. 2015. It hears a star explode out to about
// 9 Mpc and one die dark, straight to a black hole with no flash, out to about 25, since those run hotter. About 2 and 4
// a Year, so none stops a skip, save three firsts: its first catch, the first dark death made sure, and the Year the
// share that die dark is settled. That share is 1 in 6, the designer's pick, 2026-11-11. It can't tell where a death
// lies: the count of neutrinos gives how far, and a telescope finds which galaxy. Numbers in calcs/senses.py, sources
// in HOLOS_RESEARCH.md, "New senses". The same sky every time for a seed.
export const ICE = CATALOG.ice;
/** Light-years in a megaparsec, in millions: the game speaks in light-years. */
export const MLY = 3.2616;

export interface Death {
  /** The Year its neutrinos reach us. */
  at: number;
  /** A star that died dark. */
  dark: boolean;
  /** How far, in Mpc. */
  mpc: number;
  /** Its galaxy, when it lies within the few Mpc where a galaxy can be named. */
  host?: string;
  /** Its direction for the drawing, right ascension in hours: a named galaxy's own, else drawn. */
  ra: number;
}

/** One Year's own numbers, the same every time: a seed and a Year mixed to a start, then the stream rocks.ts runs. */
function yearStream(seed: number, y: number) {
  let s = (Math.imul(seed | 0, 0x9e3779b1) ^ Math.imul((y | 0) + 0x7f4a7c15, 0x85ebca6b)) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How many came in a Year, when so many come on average. */
function poisson(mean: number, r: () => number) {
  const limit = Math.exp(-mean);
  let k = 0;
  for (let p = r(); p > limit; p *= r()) k++;
  return k;
}

/** A Year's counts: stars heard exploding, dark deaths near enough to read, and dark deaths farther off. */
function countsIn(r: () => number) {
  return [poisson(ICE.bright, r), poisson(ICE.near, r), poisson(ICE.dark - ICE.near, r)] as const;
}

const HOST_SUM = ICE.hosts.reduce((s, h) => s + h.rate, 0);

/** The deaths whose neutrinos reach us in the Year from `y` to `y` + 1, in turn. */
export function deathsIn(seed: number, y: number): Death[] {
  const r = yearStream(seed, y);
  const [bright, near, far] = countsIn(r);
  const out: Death[] = [];
  const add = (dark: boolean, from: number, to: number) => {
    // As many again in each equal volume of space.
    const mpc = Math.cbrt(from ** 3 + r() * (to ** 3 - from ** 3));
    const at = y + r();
    const ra = 24 * r();
    let pick = r() * HOST_SUM;
    const host = mpc <= ICE.hostsMpc ? (ICE.hosts.find((h) => (pick -= h.rate) <= 0) ?? ICE.hosts.at(-1)!) : null;
    out.push(host ? { at, dark, mpc: host.mpc, host: host.name, ra: host.ra } : { at, dark, mpc, ra });
  };
  for (let i = 0; i < bright; i++) add(false, 0, ICE.brightMpc);
  for (let i = 0; i < near; i++) add(true, 0, ICE.brightMpc);
  for (let i = 0; i < far; i++) add(true, ICE.brightMpc, ICE.darkMpc);
  return out.sort((a, b) => a.at - b.at);
}

export interface IceFirsts {
  /** The Year of its first catch. */
  first: number;
  /** The Year the first dark death is sure: read near, then a telescope finds the star gone. */
  sure: number;
  /** The Year the share that die dark is settled, by enough dark deaths read near. */
  settled: number;
  /** The first dark death made sure: where and when its neutrinos reached us. 2026-11-13. */
  dark?: Death;
}

const firsts = new Map<string, IceFirsts>();

/** The three firsts of a Deep Ice Watch done at `since`: each stops a skip, once. */
export function iceFirsts(seed: number, since: number): IceFirsts {
  const key = `${seed}:${since}`;
  const had = firsts.get(key);
  if (had) return had;
  let first: number | null = null;
  let sure: number | null = null;
  let settled: number | null = null;
  let dark: Death | undefined;
  let read = 0;
  // Far past any likely wait: the share settles in about 50 Years.
  for (let y = Math.floor(since); settled === null && y < since + 5000; y++)
    for (const d of deathsIn(seed, y)) {
      if (d.at < since) continue;
      first ??= d.at;
      if (!d.dark || d.mpc > ICE.brightMpc) continue;
      dark ??= d;
      sure ??= d.at + ICE.confirm;
      if (++read === ICE.settle) settled = Math.max(d.at, sure);
    }
  const out = { first: first ?? since, sure: sure ?? since + 5000, settled: settled ?? since + 5000, dark };
  firsts.set(key, out);
  return out;
}

/** What a Deep Ice Watch done at `since` heard after Year `from` and by `to`: stars that exploded, stars that died
 *  dark, and those dark ones read near. Whole Years between are counted, not drawn, since a long game holds hundreds
 *  of thousands. */
export function iceBetween(seed: number, since: number, from: number, to: number) {
  const start = Math.max(from, since);
  let bright = 0, dark = 0, near = 0;
  if (to <= start) return { bright, dark, near };
  const tally = (y: number) => {
    for (const d of deathsIn(seed, y)) {
      if (d.at <= start || d.at > to) continue;
      if (!d.dark) bright++;
      else {
        dark++;
        if (d.mpc <= ICE.brightMpc) near++;
      }
    }
  };
  const y0 = Math.floor(start), y1 = Math.floor(to);
  tally(y0);
  for (let y = y0 + 1; y < y1; y++) {
    const [b, n, f] = countsIn(yearStream(seed, y));
    bright += b;
    near += n;
    dark += n + f;
  }
  if (y1 > y0) tally(y1);
  return { bright, dark, near };
}

/** The latest deaths heard by `to`, back at most `years` Years and to Year `from`, for the drawing: a handful, however
 *  long the span. */
export function iceLatest(seed: number, since: number, from: number, to: number, years = 20): Death[] {
  const start = Math.max(from, since, to - years);
  const out: Death[] = [];
  for (let y = Math.floor(start); y <= Math.floor(to); y++) out.push(...deathsIn(seed, y).filter((d) => d.at > start && d.at <= to));
  return out;
}

/** The share that die dark as one star in so many, and as our count brackets it once settled: 6, between 9 and 4.5. */
export function iceRange() {
  const part = (x: number) => (Math.abs(x - Math.round(x)) < 0.05 ? String(Math.round(x)) : x.toFixed(1));
  return { low: part(1 / (ICE.share * (2 / 3))), high: part(1 / (ICE.share * (4 / 3))), mid: part(1 / ICE.share) };
}

/** What our Deep Ice Watch has heard by a Year, in words, for the Mind. */
function describeIce(seed: number, since: number, year: number) {
  const { bright, dark } = iceBetween(seed, since, since, year);
  const f = iceFirsts(seed, since);
  const n = (x: number) => x.toLocaleString("en-US");
  const mly = (mpc: number) => Math.round(mpc * MLY);
  const range = iceRange();
  return [
    `Our Deep Ice Watch, done at Year ${n(since)}, hears stars die in the galaxies round us by their neutrinos. It has heard ${n(bright)} explode, each followed by its flash, out to about ${mly(ICE.brightMpc)} million ly, and ${n(dark)} bursts that no flash followed, out to about ${mly(ICE.darkMpc)} million ly: a star falling straight to a black hole would sound so, hotter and cut short, and be heard that far. It can't tell where one lies: the count gives how far, and our telescopes find which galaxy, by the flash or by a star gone missing.`,
    year >= f.sure
      ? `At Year ${n(Math.round(f.sure * 10) / 10)} we were sure of the first dark death${f.dark ? `, heard at Year ${n(Math.round(f.dark.at * 10) / 10)} from ${f.dark.host ?? "a galaxy"} about ${n(mly(f.dark.mpc))} million ly away` : ""}: a telescope found the star gone, with no flash. Some heavy stars do end as black holes in silence. Before it, only two candidates, N6946-BH1 and M31-2014-DS1, both disputed.`
      : "No dark death is sure yet: that needs one near enough to read, and then a telescope to find the star gone.",
    year >= f.settled
      ? `By Year ${n(Math.round(f.settled * 10) / 10)}, with ${ICE.settle} dark deaths read near, the share was settled: about 1 heavy star in ${range.mid} dies dark, between 1 in ${range.low} and 1 in ${range.high}.`
      : year >= f.sure
        ? "How large a share die dark isn't settled yet: too few have been read near."
        : "",
  ].filter(Boolean).join(" ");
}

// ── Star storms, heard by our Far-Side Array ──
// A star throws off a storm of gas, and its shock makes a radio burst that drifts lower as it climbs. From a red dwarf
// it falls to and below what Earth's air lets through, so the far side hears it. Each red dwarf gives storms by one
// law, Konijn et al. 2025's, fewer the farther it is and more as the array grows. The count is the same in every
// game: what it settles is our universe's answer, that storms do not follow flares. calcs/senses.py. 2026-11-12.
export const STORMS = CATALOG.storms;
/** Storms the array hears a Year from one star `ly` away, with so many fifths standing. */
export const stormsAYear = (ly: number, fifths = 1) => STORMS.at10 * (10 / ly) ** STORMS.fall * fifths ** STORMS.grow;
/** Storms heard by a Year from every red dwarf within 50 ly, given the Year each fifth was done, in order. */
export function stormsHeard(fifths: readonly number[], year: number) {
  let total = 0;
  fifths.forEach((start, k) => {
    const end = k + 1 < fifths.length ? Math.min(year, fifths[k + 1]) : year;
    if (end > start) total += (end - start) * STORMS.perYear * (k + 1) ** STORMS.grow;
  });
  return total;
}
/** The Year the array has heard so many storms, or null if it never will, with no fifth standing. */
function stormsReach(fifths: readonly number[], count: number): number | null {
  let have = 0;
  for (let k = 0; k < fifths.length; k++) {
    const rate = STORMS.perYear * (k + 1) ** STORMS.grow, end = k + 1 < fifths.length ? fifths[k + 1] : Infinity;
    if (have + rate * (end - fifths[k]) >= count) return fifths[k] + (count - have) / rate;
    have += rate * (end - fifths[k]);
  }
  return null;
}
/** Its two firsts, each of which stops a skip, once: the first storm heard, and the Year enough are heard to settle
 *  whether storms follow flares. Null with no fifth standing. */
export function stormFirsts(fifths: readonly number[]): { first: number; settled: number } | null {
  const first = stormsReach(fifths, 1), settled = stormsReach(fifths, STORMS.settle);
  return first === null || settled === null ? null : { first, settled };
}
/** What the array has heard of star storms by a Year, in words, for the Mind. */
function describeStorms(fifths: readonly number[], year: number) {
  const f = stormFirsts(fifths);
  if (!f || year < f.first) return "";
  const n = (x: number) => Math.floor(x).toLocaleString("en-US");
  const heard = `Our Far-Side Array hears star storms: bursts of radio from the shocks of gas thrown off by red dwarfs, too low for any ear on Earth. It has heard ${n(stormsHeard(fifths, year))} from the ${STORMS.stars} red dwarfs within 50 ly, about ${Math.round(stormsAYear(4.2465, fifths.filter((y) => y <= year).length))} a Year from Proxima Centauri alone.`;
  const active = Math.round(STORMS.active * 10);
  return year >= f.settled
    ? `${heard} At Year ${Math.floor(f.settled * 10) / 10} that settled an open question: storms do not follow flares. About ${active} red dwarfs in 10 are active and flare hundreds of times oftener than the rest, yet they give only ${active} storms in 10. Their strong fields hold all but the strongest storms in. A storm strips a world's air only while it lasts, and steady light strips far more, so this moves no world's odds of air.`
    : `${heard} Too few yet to say whether storms follow flares, which no one has measured.`;
}
