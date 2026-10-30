// The sky doing what it does without us: stars exploding across our galaxy and stars merging in dust, at real rates,
// and Betelgeuse, once. None is a mind, and none stops a skip, save Betelgeuse: at 1.6 a century they would stop one
// every few decades. A long skip says what passed instead. The same sky every time for a seed. Settled 2026-10-30,
// sources in HOLOS_RESEARCH.md, "The natural sky".
import { stream } from "./rocks.ts";

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

/** The sky so far, in words, for the Mind: counts since Year 0, the latest seen by eye, and Betelgeuse once gone. */
export function describeSky(seed: number, year: number | null, watch: number | null) {
  if (year === null || year < 1) return "";
  const { supernovae, mergers, betelgeuse } = skyBetween(seed, 0, year, watch);
  const eye = supernovae.filter((e) => e.eye);
  const n = (x: number) => x.toLocaleString("en-US");
  const last = eye.at(-1);
  return [
    `The natural sky since Year 0. ${n(supernovae.length)} stars have exploded in our galaxy, about 1.6 a century as expected. Our neutrino detectors caught every one. ${n(eye.length)} shone bright enough to see by eye${last ? `, the latest at Year ${n(Math.floor(last.at))}, about ${n(Math.round(last.ly / 100) * 100)} ly away` : ""}. None is a mind's doing.`,
    watch === null ? "" : `Our Warm Sky Watch has seen ${n(mergers.length)} pairs of stars merge and glow warm in their own dust, and set each aside as natural, as it must before any glow can mean a mind.`,
    betelgeuse ? `Betelgeuse exploded at Year ${n(skyOf(seed).betelgeuse)}, ${BETELGEUSE.ly} ly away: for a season as bright as a half Moon, seen by day for more than a Year, and harmless at that distance.` : "",
  ].filter(Boolean).join(" ");
}
