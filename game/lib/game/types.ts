import type { UIMessage } from "ai";
import type { ColonyMode } from "@/lib/sim/types";
// Stubs. The simulation lives in calcs/ (Python) until it is ported.

/** One game. The seed is drawn when a new game begins, and the player never sees it. */
export interface Save {
  seed: number;
  /** Epoch ms of the tap on Begin. Null while planning before Year 0. */
  beganAt: number | null;
  /** Past the first screen. Missing on saves from before it. */
  woke?: boolean;
  /** Earth's founding line and dials, from the charter screen. */
  charter?: { line: string; dials: number[] };
  /** What starts at Year 0, planned on the Build tab: builds in the order queued, and the one observation. Nothing
   *  in it happens before Begin. */
  plan?: Plan;
  /** Readings the Will has opened, by id. */
  seen?: string[];
  /** Reviewed our scans with the Mind, to the last lead: one of the four things we would do before Begin. */
  reviewed?: boolean;
  /** Walked through how we reach with the Mind, to the last road: another of the four. Since 2026-10-23. */
  reached?: boolean;
  /** Had an answer from the Mind, the last of the four. */
  asked?: boolean;
  /** What the Mind has explained on Build before Begin, kept so a reload doesn't explain it again. Since 2026-10-22. */
  guide?: Guide;
  /** Our talk with the Mind, kept so a reload doesn't lose it. A new game starts a new talk. Since 2026-10-25. */
  talk?: UIMessage[];
  /** The Year up to which the Mind has told us its news unasked, so a reload never tells it twice. 2026-10-31. */
  told?: number;
  /** The Mind's latest words we have read, by message id, so the Mind tab marks what we haven't. 2026-10-31. */
  read?: string;
  /** Epoch ms the clock stopped at, while it waits: once the last build is done and nothing rises, it holds until we
   *  order one or play on. 2026-11-02. */
  held?: number;
  /** The Year of the last build done that the clock has held for, so playing on never holds for it again. */
  heldFor?: number;
  /** Builds we told the Mind not to suggest. It names the next one instead, and the Catalog still has them. The Mind
   *  kept offering the Interceptor, which may start a war, with no way to say no. Playtest 2026-11-07. */
  passed?: string[];
  /** What we have sent, in the order sent. The list only grows: a stop is marked, never removed. Since 2026-10-26. */
  sent?: Sent[];
  /** The Will, sent by the Mind Link to live at our Mind at a hole or a star. Since 2026-10-26. */
  will?: Will;
}

/** The Will living at our Mind at a black hole or a star: where, kept as `hole` since saves began so, how far it is
 *  from Earth, the Year it was sent, the Year it arrived, dark between, and how many of the sky's Years go by in one of
 *  ours there, 1 unless a refuge's slow clock. */
export interface Will {
  hole: string;
  d: number;
  y: number;
  at: number;
  rate: number;
  /** Earth's Mind was lost, and the Will crossed to a vault or colony that still stood. 2026-10-28. */
  lost?: boolean;
}

/** One message we sent: aimed at a star, or every way at once. Our words as the Will said them, and the Mind's label,
 *  which is what a star reacts to. Settled 2026-10-26, HOLOS_GAME_CONCEPT.md's What Earth sends. */
export interface Sent {
  /** The Mind's answer that offered it, so its card shows it sent. */
  id: string;
  /** The Year it left. */
  y: number;
  /** A star's name as players see it, or every way at once. */
  to: string | "everywhere";
  /** Light-years to the star. */
  d?: number;
  /** A far warm glow's range in light-years, kept with the send: once the glow faded, Scan lost it and gave one
   *  distance. Playtest 2026-11-07. */
  range?: [number, number];
  /** Where a star past the 50 ly census sits, right ascension in hours and declination, so a save keeps a lead's
   *  star out to 326 ly. 2026-10-31. */
  ra?: number;
  dec?: number;
  /** What the Will asked, and what travels, in the Mind's words, as they will read it. */
  asked: string;
  travels: string;
  holds: Kind[];
  size: Size;
  /** The false part, if any. Marked for us only. */
  lie?: string;
  /** Every way at once: how far it can be read, light-years, and whether it repeats until stopped, and when it was. */
  reach?: number;
  repeat?: boolean;
  stopped?: number;
}

export type Kind = "words" | "pictures" | "questions" | "knowledge";
/** How big it is, by the sizes calcs/messages.py marks: a page, a collection like Cosmic Call 2's, one genome, an
 *  encyclopedia like Wikipedia's text, or every book. */
export type Size = "page" | "collection" | "genome" | "encyclopedia" | "books";

/** What the Mind draws beside an idea on Build: a build's need and what more it takes, a build's time before and after
 *  a change, Thought Fields' climb, the builds short of their need, or our compute against what it would have been. */
export type GuideFig =
  | { kind: "more"; name: string; need: number; more: number }
  | { kind: "moved"; name: string; was: number; now: number; tone: "late" | "soon" }
  | { kind: "grow"; campuses: number[]; step: number }
  | { kind: "short"; names: string[] }
  | { kind: "less"; compute: number };

type Moved = { name: string; by: number } | null;

/** The Mind's talk on Build before Begin, in components/guide.tsx's words: our builds as it last saw them, each idea it
 *  has explained in the order met, the one shown, the last build in or out and what it did, and how many there have
 *  been. */
export interface Guide {
  builds: string[];
  seen: string[];
  now: string;
  ideas: Record<string, { say: string; fig?: GuideFig; at: number }>;
  last: { name: string; adding: boolean; at: number | null; late: Moved; soon: Moved } | null;
  changes: number;
}

export interface Plan {
  builds: string[];
  observe: string[];
  /** Builds ordered in play, once what each waits on was done, in the order we ordered them. Since 2026-10-22. A build
   *  taken back and ordered again is here again, from 2026-10-23. */
  later?: Ordered[];
  /** Builds taken back in play, at the Year each was. Each keeps its work, and ordering it again picks up there.
   *  2026-10-23. */
  stops?: Ordered[];
  /** Another mind's gifts of knowledge, in a reply, each by its star, the Year all of it reached us, and its size. From then our
   *  thought goes further, by messages.ts's GIFT_STEPS. A gift saved without a size counts as a collection, as all
   *  did before 2026-10-26's sizes. */
  gifts?: (Ordered & { size?: Size })[];
  /** Close Readings of warm glows, each by Scan's name and the Year we ordered it. 2026-11-03. */
  closeReads?: Ordered[];
  /** Lenses we sent to the Sun's focus, each by the star it looks at and the Year we ordered it. It leaves once the
   *  Solar Lens is done. One a star. 2026-10-26. */
  lenses?: Ordered[];
  /** Sentinels we sent, each by its star and the Year we ordered it: a probe that brakes and stays to watch. It is
   *  built once the Probe Yard, a Fusion Drive and the Deuterium Works are done. One a star. 2026-10-26. */
  sentinels?: Ordered[];
  /** Sails and flyby probes we sent past a star, each by its star, the Year we ordered it, how far we took it to be and
   *  which craft. One of each a star. Proxima's first flew by itself once queued before Begin. 2026-11-05. */
  flybys?: (Ordered & { d: number; by: "sails" | "probe" })[];
  /** Our standing order: a flyby probe to each warm glow as we find it, from this Year on. 2026-11-05. Read as
   *  glowOrders.warm since 2026-11-07, and cleared once that is set. */
  probeGlows?: number;
  /** Our standing orders for glows, by kind: from which Year, what we send, and how far out. 2026-11-07. */
  glowOrders?: { warm?: GlowOrder; cold?: GlowOrder };
  /** Seed probes we sent, each by its star and the Year we ordered it: a seed ship with no Mind, that brakes, stays, and
   *  copies itself on to the nearest stars, for so many generations. Built once the Seed Ship, a Fusion Drive and the
   *  Deuterium Works are done. One a star. 2026-10-26. */
  seeds?: Ordered[];
  /** A copy of our Mind sent on the Seed Ship to stay: the hole or star, the Year we sent it, and whether it feeds a
   *  hole for power, hides in its shadow, or settles at a star. One a game, since the Seed Ship carries one.
   *  2026-10-26, a star since 2026-10-27. */
  colony?: Ordered & { mode: ColonyMode };
  /** Our bullets, each by the star it is fired at and the Year we ordered it, readied by the Strike Yard. One a star.
   *  2026-10-28. */
  strikes?: (Ordered & { d?: number })[];
}

/** A build ordered in play, or taken back: its name, and the Year. */
/** "For each new glow within `within` ly, send `by`", from Year `since`. */
export interface GlowOrder {
  since: number;
  by: "sails" | "probe" | "sentinel";
  within: number;
}

export interface Ordered {
  name: string;
  y: number;
}
