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
  /** What we have sent, in the order sent. The list only grows: a stop is marked, never removed. Since 2026-10-26. */
  sent?: Sent[];
  /** How each neighbor took a message of ours once it landed, decided then and kept. Plain in the save: reading ahead
   *  spoils only this game. Since 2026-10-26. */
  reactions?: Reaction[];
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

/** A neighbor's move on a message, ours or another neighbor's, by the star it lives at: what it did, and what it sent,
 *  if anything, with the Year that reaches Earth when it does. "unheard" when a people before its Mind missed it. */
export interface Reaction {
  /** The message's id and the star. */
  key: string;
  sent: string;
  star: string;
  d: number;
  /** The Year our message landed there. */
  at: number;
  move: string;
  text?: string;
  /** How big what they sent is, which sets how long their dishes take to send it, and the Year all of it reaches
   *  Earth. */
  size?: Size;
  arrives?: number;
  /** What they doubted in our message, weighed against what they can see of Earth. Theirs, never shown. */
  doubts?: string;
  /** Whose message it took, when not ours: another neighbor's star. Neighbors hear each other, 2026-10-26. */
  from?: string;
  /** Where what they sent goes, when not back to the sender: every way at once. */
  to?: string;
  /** On news of a craft of ours at a black hole, not a message: which, in words. 2026-10-26. */
  about?: string;
  /** Sent from the hole, by their Mind standing there, not from home: the hole's name, and its light-years from us. */
  via?: { star: string; d: number };
  /** A catch or a strike: the Year it ends our craft there. */
  ends?: number;
  /** A bullet fired at Earth: the Year it lands and its megatons. Dark until then. 2026-10-28. */
  lands?: number;
  mt?: number;
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
  /** Neighbors' gifts of knowledge, each by its star, the Year all of it reached us, and its size. From then our
   *  thought goes further, by messages.ts's GIFT_STEPS. A gift saved without a size counts as a collection, as all
   *  did before 2026-10-26's sizes. */
  gifts?: (Ordered & { size?: Size })[];
  /** Lenses we sent to the Sun's focus, each by the star it looks at and the Year we ordered it. It leaves once the
   *  Solar Lens is done. One a star. 2026-10-26. */
  lenses?: Ordered[];
  /** Sentinels we sent, each by its star and the Year we ordered it: a probe that brakes and stays to watch. It is
   *  built once the Probe Yard, a Fusion Drive and the Deuterium Works are done. One a star. 2026-10-26. */
  sentinels?: Ordered[];
  /** Seed probes we sent, each by its star and the Year we ordered it: a seed ship with no Mind, that brakes, stays, and
   *  copies itself on to the nearest stars, for so many generations. Built once the Seed Ship, a Fusion Drive and the
   *  Deuterium Works are done. One a star. 2026-10-26. */
  seeds?: Ordered[];
  /** A copy of our Mind sent on the Seed Ship to stay: the hole or star, the Year we sent it, and whether it feeds a
   *  hole for power, hides in its shadow, or settles at a star. One a game, since the Seed Ship carries one.
   *  2026-10-26, a star since 2026-10-27. */
  colony?: Ordered & { mode: ColonyMode };
  /** Pellet screens on the line to a star, each by the star and the Year we ordered it, built by the Picket Yard. A
   *  bullet from that star that crosses one is wrecked. One a star. 2026-10-28. */
  pickets?: Ordered[];
  /** Our bullets, each by the star it is fired at and the Year we ordered it, readied by the Strike Yard. One a star.
   *  2026-10-28. */
  strikes?: (Ordered & { d?: number })[];
}

/** A build ordered in play, or taken back: its name, and the Year. */
export interface Ordered {
  name: string;
  y: number;
}
