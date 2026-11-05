import { useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";
import { buildSlug } from "@/lib/game/plan";

// Through a strategy's builds, one page at a time, from a gold button on the map's top right. On a strategy's stop
// in Build's walk it opens the first build. On a build page opened so, it goes on to the next, and after the last,
// back to the strategy. 2026-11-01.

export interface Walk {
  /** The strategy, as its stop is named. */
  name: string;
  builds: string[];
  /** The walk's stop it goes back to. */
  at: number;
}

// The strategy at the walk's stop now, set by Build's walk while it shows one.
let shown: Walk | null = null;
const listeners = new Set<() => void>();
export function showWalk(walk: Walk | null) {
  if (shown?.name === walk?.name && shown?.builds.join() === walk?.builds.join() && shown?.at === walk?.at) return;
  shown = walk;
  listeners.forEach((f) => f());
}
const listen = (f: () => void) => {
  listeners.add(f);
  return () => void listeners.delete(f);
};

/** A build page's state when opened through a strategy: its way back, and the walk on. */
export const throughState = (walk: Walk) => ({ back: { to: "/play/build?tour", label: walk.name, state: { at: walk.at } }, through: walk });

export function Through() {
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const atStop = useSyncExternalStore(listen, () => shown);
  const walk = (state as { through?: Walk } | null)?.through;
  const page = pathname.startsWith("/play/build/") && walk;
  const stop = !page && pathname === "/play/build" && /[?&]tour\b/.test(search) ? atStop : null;
  const on = page ? walk : stop;
  if (!on?.builds.length) return null;

  const i = page ? on.builds.findIndex((b) => buildSlug(b) === pathname.slice("/play/build/".length)) : -1;
  // A build reached from one of these, not among them, has no place in the walk.
  if (page && i < 0) return null;
  const next = on.builds[i + 1];
  const go = () =>
    next ? navigate(`/play/build/${buildSlug(next)}`, { state: throughState(on) }) : navigate("/play/build?tour", { state: { at: on.at } });
  return (
    <button
      onClick={go}
      className="absolute top-2 right-2.5 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-other/70 bg-paper/90 pr-2 pl-3 text-xs text-other backdrop-blur-sm transition-colors hover:bg-other/10"
    >
      {!page ? `View ${next}` : next ? `Next · ${next}` : `Back to ${on.name}`}
      {next && (
        <span className="font-mono text-[10px] text-other/70 tabular-nums">
          {i + 2} of {on.builds.length}
        </span>
      )}
      <span aria-hidden className="text-[14px] leading-none">
        ›
      </span>
    </button>
  );
}
