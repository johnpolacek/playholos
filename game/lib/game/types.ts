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
  /** What starts at Year 0, from Planning: builds in the order queued, observations, thought for studies, and what
   *  idle instruments sweep. Nothing in it happens before Begin. */
  plan?: Plan;
  /** Readings the Will has opened, by id. */
  seen?: string[];
}

export interface Plan {
  builds: string[];
  observe: string[];
  studies: number;
  search: "near" | "leads";
}
