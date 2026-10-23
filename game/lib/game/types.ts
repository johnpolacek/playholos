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
  /** Opened a destination on Reach, another of the four. */
  looked?: boolean;
  /** Had an answer from the Mind, the last of the four. */
  asked?: boolean;
  /** What the Mind has explained on Build before Begin, kept so a reload doesn't explain it again. Since 2026-10-22. */
  guide?: Guide;
}

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
}

/** A build ordered in play, or taken back: its name, and the Year. */
export interface Ordered {
  name: string;
  y: number;
}
