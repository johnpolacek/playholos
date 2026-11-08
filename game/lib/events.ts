// Every event the game notes, shared by the page that sends them and the Worker that keeps them, so the Worker keeps
// nothing else. 2026-11-08.
export const EVENT_NAMES = [
  // A page opened, by its address.
  "page",
  // The first screen passed, the charter set, Begin tapped, a new game.
  "wake",
  "charter",
  "begin",
  "new_game",
  // Before Begin: reviewed the scans, walked the roads.
  "reviewed",
  "reached",
  // The Mind: opened with a key or the code, a question asked, an answer that failed and why.
  "unlock",
  "ask",
  "mind_error",
  // Orders: a build queued before Begin or ordered in play, a build taken back, a Close Reading, a lens, a sentinel.
  "build",
  "stop",
  "close_read",
  "lens",
  "sentinel",
  // What we sent, the Will moved, a skip ahead, a build snoozed.
  "send",
  "will",
  "skip",
  "snooze",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];
