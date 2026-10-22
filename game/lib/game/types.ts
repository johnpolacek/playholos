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
}

export interface Plan {
  builds: string[];
  observe: string[];
  /** Builds ordered in play, once what each waits on was done, in the order we ordered them. Since 2026-10-22. */
  later?: Ordered[];
}

/** A build ordered in play: its name, and the Year we ordered it. */
export interface Ordered {
  name: string;
  y: number;
}
