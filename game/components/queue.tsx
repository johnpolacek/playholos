import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import { Opened, Unqueued, usePlan, useSchedule } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { buildOf, EMPTY, ordered } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// The queue: what we plan to start at Year 0, each on its whole journey from Year 0, in Scan's face: a dot, its name
// and line, and how long until it's done in play time, as Scan counts light's. A tap on a build opens its page,
// where it comes in or out of the queue, and what we could also start waits below. Our messages already on their way
// moved to Reach, and the one observation to Fomalhaut's lead on Scan, 2026-10-18. The Mind's studies keep a tenth of
// our compute on their own, and what idle instruments sweep waits until sweeps are built, so neither is ours to set
// here, 2026-10-19. Before Begin, each queued build can be dragged by its dots to a new place in line, or moved with
// the arrow keys, since the first in line gets our compute first, 2026-10-22. Once Year 0 has begun, what our builds have opened waits below, to order in play, 2026-10-22.

function rowsOf(plan: typeof EMPTY, done: Record<string, number | null>): Row[] {
  return ordered(plan).map((name) => ({
    key: name,
    name,
    note: buildOf(name)?.what ?? "",
    at: done[name] ?? null,
    kind: "build",
    from: plan.later?.find((o) => o.name === name)?.y,
  }));
}

/** Our order with one build moved from one place to another. */
const moved = (names: string[], from: number, to: number) => {
  const out = [...names];
  out.splice(to, 0, ...out.splice(from, 1));
  return out;
};

/** Dragging a queued build to a new place in line, or moving it a place with the arrow keys. The others make room as
 *  it passes, and on release it eases into its place and keeps the focus. */
function useReorder(names: string[], commit: (order: string[]) => void, list: React.RefObject<HTMLUListElement | null>) {
  const [drag, setDrag] = useState<{ name: string; dy: number; to: number } | null>(null);
  const start = useRef<{ y: number; from: number; tops: number[]; heights: number[] } | null>(null);
  const settle = useRef<{ name: string; by: number } | null>(null);
  const focus = useRef<string | null>(null);
  const row = (name: string) => list.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(name)}"]`);

  useLayoutEffect(() => {
    const s = settle.current;
    settle.current = null;
    const el = s && row(s.name);
    if (el && Math.abs(s.by) > 0.5 && !prefersReducedMotion())
      gsap.fromTo(el, { y: s.by }, { y: 0, duration: 0.25, ease: "power2.out", clearProps: "transform" });
    if (focus.current) list.current?.querySelector<HTMLElement>(`[data-grip="${CSS.escape(focus.current)}"]`)?.focus();
    focus.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join("|")]);

  /** Where the row being dragged would land: past every other row whose middle it has crossed. */
  const target = (dy: number) => {
    const { from, tops, heights } = start.current!;
    const mid = tops[from] + heights[from] / 2 + dy;
    return tops.filter((t, j) => j !== from && t + heights[j] / 2 < mid).length;
  };

  /** How far a row stands from its place while one is dragged. */
  const offset = (name: string, j: number) => {
    if (!drag || !start.current) return 0;
    const { from, heights } = start.current;
    if (name === drag.name) return drag.dy;
    if (from < drag.to && j > from && j <= drag.to) return -heights[from];
    if (drag.to < from && j >= drag.to && j < from) return heights[from];
    return 0;
  };

  const grip = (name: string, i: number): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rects = names.map((n) => row(n)!.getBoundingClientRect());
      start.current = { y: e.clientY, from: i, tops: rects.map((r) => r.top), heights: rects.map((r) => r.height) };
      setDrag({ name, dy: 0, to: i });
    },
    onPointerMove: (e) => {
      if (!start.current) return;
      const dy = e.clientY - start.current.y;
      setDrag({ name, dy, to: target(dy) });
    },
    onPointerUp: (e) => {
      if (!start.current || !drag) return;
      const { from, tops, heights } = start.current;
      const to = drag.to;
      const top = to > from ? tops[from] + heights.slice(from + 1, to + 1).reduce((s, h) => s + h, 0) : tops[to];
      start.current = null;
      setDrag(null);
      if (to === from) {
        if (!prefersReducedMotion()) gsap.fromTo(e.currentTarget.parentElement, { y: drag.dy }, { y: 0, duration: 0.25, clearProps: "transform" });
        return;
      }
      settle.current = { name, by: tops[from] + drag.dy - top };
      commit(moved(names, from, to));
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(null);
    },
    onKeyDown: (e) => {
      const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : null;
      if (to === null || to < 0 || to >= names.length) return;
      e.preventDefault();
      focus.current = name;
      commit(moved(names, i, to));
    },
  });

  const style = (name: string, j: number): React.CSSProperties | undefined =>
    drag
      ? {
          transform: `translateY(${offset(name, j)}px)`,
          transition: name === drag.name ? "none" : "transform .2s ease-out",
          zIndex: name === drag.name ? 10 : undefined,
          boxShadow: name === drag.name ? "0 8px 24px var(--shadow)" : undefined,
        }
      : undefined;

  return { grip, style, dragging: drag?.name ?? null };
}

/** A queued build's handle: six dots under its mark. */
function Grip({ name, i, n, ...rest }: { name: string; i: number; n: number } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      data-grip={name}
      aria-label={`Move the ${name}, ${i + 1} of ${n} in line. Drag, or use the arrow keys.`}
      className="absolute top-[36px] left-0 z-10 -ml-1 grid h-8 w-6 cursor-grab touch-none place-items-center rounded text-muted transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-faint active:cursor-grabbing"
    >
      <svg width="8" height="13" viewBox="0 0 8 13" fill="currentColor" aria-hidden>
        {[1.5, 6.5, 11.5].flatMap((y) => [<circle key={`a${y}`} cx="1.5" cy={y} r="1.2" />, <circle key={`b${y}`} cx="6.5" cy={y} r="1.2" />])}
      </svg>
    </button>
  );
}

export function Queue() {
  const { save, year } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const { past, scale, done } = useSchedule();
  const plan = save?.plan ?? EMPTY;
  const queued = useMemo(() => rowsOf(plan, done), [plan, done]);
  const began = year !== null;
  const now = year ?? 0;
  const { change } = usePlan();
  const list = useRef<HTMLUListElement>(null);
  const names = useMemo(() => queued.map((r) => r.key), [queued]);
  const reorder = useReorder(names, (builds) => change((p) => ({ ...p, builds })), list);
  const movable = !began && queued.length > 1;

  useGSAP(
    () => {
      if (!past || prefersReducedMotion()) return;
      gsap.fromTo(root.current!.querySelectorAll('[data-q="row"]'), riseFrom, { ...rise, stagger: 0.06 });
    },
    { scope: root, dependencies: [!!past] },
  );

  // A row queued here rises into place, and its thread draws out from Year 0.
  const seen = useRef<string[]>(null);
  useGSAP(
    () => {
      const before = seen.current;
      seen.current = queued.map((r) => r.key);
      if (!before || !past || prefersReducedMotion()) return;
      for (const el of root.current!.querySelectorAll<HTMLElement>('[data-q="queued"] > [data-key]')) {
        if (before.includes(el.dataset.key!)) continue;
        gsap.fromTo(el, riseFrom, rise);
        gsap.fromTo(
          el.querySelector('[data-q="track"]'),
          { clipPath: "inset(-8px 100% -8px -8px)" },
          { clipPath: "inset(-8px -8px -8px -8px)", duration: 0.9, ease: "power2.out", clearProps: "clipPath" },
        );
      }
    },
    { scope: root, dependencies: [queued.map((r) => r.key).join("|"), !!past] },
  );

  if (!past) return <div className="min-h-[120px]" />;

  return (
    <div ref={root} className="relative">
      {/* Before Begin an empty queue shows nothing, and the walk above offers to fill it. */}
      {(began || queued.length > 0) && (
        <>
          <ListHead left={`${began ? "Under way" : "Queued"} · ${queued.length}`} right="Done in" className="mt-1" />
          {movable && (
            <p data-q="row" className="mt-1 text-xs leading-snug text-muted">
              Drag a build by its dots to change its place. The first in line gets our compute first.
            </p>
          )}
          {queued.length ? (
            <ul ref={list} data-q="queued" className="mt-1">
              {queued.map((r, i) => (
                <Item
                  key={r.key}
                  row={r}
                  now={now}
                  began={began}
                  style={movable ? reorder.style(r.key, i) : undefined}
                  grip={movable && <Grip name={r.key} i={i} n={queued.length} {...reorder.grip(r.key, i)} />}
                />
              ))}
            </ul>
          ) : (
            <p data-q="row" className="mt-1 border-t border-faint py-2.5 text-[13.5px] leading-snug text-page-ink2">
              Nothing under way. Our instruments keep watch, and the Mind keeps studying.
            </p>
          )}
        </>
      )}
      {!began && <Unqueued scale={scale} className={queued.length ? "mt-5" : "mt-1"} />}
      {began && <Opened scale={scale} now={now} className="mt-5" />}
    </div>
  );
}
