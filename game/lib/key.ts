import { useEffect, useSyncExternalStore } from "react";
import { track } from "@/lib/track";
import type { Access, Wrong } from "@/lib/access";

// What opens the Mind in this browser, for the menu and the Mind tab. The cookie hides it from the page, so they ask
// the Worker, and share one answer so a key forgotten in the menu locks the Mind tab too.

let access: Access | undefined;
/** Beside it: the Turnstile key when a pass is on offer, and on a pass, the questions left today and whether today's
 *  allowance is spent. 2026-11-08. */
export type Allowance = { free?: string; left?: number; spent?: boolean };
let allowance: Allowance = {};
const heard = new Set<() => void>();

const listen = (hear: () => void) => {
  heard.add(hear);
  return () => void heard.delete(hear);
};

type State = { open: Access; wrong?: Wrong } & Allowance;

function set({ open, free, left, spent }: State) {
  access = open;
  allowance = { free, left, spent };
  for (const hear of heard) hear();
}

async function ask(init?: RequestInit) {
  const res = await fetch("/api/access", init);
  return (await res.json()) as State;
}

/** The key, the code or nothing, and undefined until the Worker answers. */
export function useAccess() {
  useEffect(() => {
    if (access === undefined) ask().then(set);
  }, []);
  return useSyncExternalStore(listen, () => access);
}

/** The pass's allowance, and the offer of one. */
export function useAllowance() {
  return useSyncExternalStore(listen, () => allowance);
}

/** Asks again what opens the Mind, as after an answer spends one of today's questions. */
export async function refreshAccess() {
  set(await ask());
}

/** Trades a passed Turnstile check for a pass. Returns "check" if it didn't take. */
export async function earnPass(turnstile: string) {
  const state = await ask({ method: "POST", body: JSON.stringify({ turnstile }) });
  set(state);
  if (state.open === "free") track("unlock", "free");
  return state.wrong;
}

/** One field takes either. Returns which one it was, if it doesn't open the Mind. */
export async function unlock(entry: string) {
  const state = await ask({ method: "POST", body: JSON.stringify({ entry }) });
  const { open, wrong } = state;
  set(state);
  // Which way opened the Mind, never the key or the code. 2026-11-08.
  if (open) track("unlock", open);
  return wrong;
}

export async function forgetKey() {
  set(await ask({ method: "DELETE" }));
}
