import { useSyncExternalStore } from "react";

// The game's layouts. "tabs" is the game as it has been, and the default. "lightcone" lays a tab out on time: its
// lists become lanes on one axis of Years, components/kit/lanes.tsx. It is a design exploration, on the Reach tab
// first, and never the default. An address asks for it, as ?layout=lightcone, for playtests: main.tsx reads that once
// as the game loads, and it holds from page to page until the next full load. It is never kept. 2026-11-15.

export type Layout = "tabs" | "lightcone";

let layout: Layout = "tabs";
const heed = new Set<() => void>();

export function setLayout(to: Layout) {
  layout = to;
  heed.forEach((f) => f());
}

/** The layout an address asks for, or null. */
export const askedLayout = (search: string): Layout | null => (new URLSearchParams(search).get("layout") === "lightcone" ? "lightcone" : null);

export const useLayout = () =>
  useSyncExternalStore(
    (f) => (heed.add(f), () => void heed.delete(f)),
    () => layout,
    () => "tabs" as Layout,
  );
