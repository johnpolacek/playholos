import { useEffect, useSyncExternalStore } from "react";
import type { Access, Wrong } from "@/lib/access";

// What opens the Mind in this browser, for the menu and the Mind tab. The cookie hides it from the page, so they ask
// the Worker, and share one answer so a key forgotten in the menu locks the Mind tab too.

let access: Access | undefined;
const heard = new Set<() => void>();

const listen = (hear: () => void) => {
  heard.add(hear);
  return () => void heard.delete(hear);
};

function set(next: Access) {
  access = next;
  for (const hear of heard) hear();
}

async function ask(init?: RequestInit) {
  const res = await fetch("/api/access", init);
  return (await res.json()) as { open: Access; wrong?: Wrong };
}

/** The key, the code or nothing, and undefined until the Worker answers. */
export function useAccess() {
  useEffect(() => {
    if (access === undefined) ask().then(({ open }) => set(open));
  }, []);
  return useSyncExternalStore(listen, () => access);
}

/** One field takes either. Returns which one it was, if it doesn't open the Mind. */
export async function unlock(entry: string) {
  const { open, wrong } = await ask({ method: "POST", body: JSON.stringify({ entry }) });
  set(open);
  return wrong;
}

export async function forgetKey() {
  set((await ask({ method: "DELETE" })).open);
}
