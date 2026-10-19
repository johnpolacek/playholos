import { useMemo, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { Item, type Row } from "@/components/journey";
import { Unqueued, useSchedule } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { BUILDS, EMPTY } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// The queue: what we plan to start at Year 0, each on its whole journey from Year 0, in Scan's face: a dot, its name
// and line, and how long until it's done in play time, as Scan counts light's. A tap on a build opens its page,
// where it comes in or out of the queue, and what we could also start waits below. Our messages already on their way
// moved to Reach, and the one observation to Fomalhaut's lead on Scan, 2026-10-18. The Mind's studies keep a tenth of
// our thought on their own, and what idle instruments sweep waits until sweeps are built, so neither is ours to set
// here, 2026-10-19.

function rowsOf(plan: typeof EMPTY, done: Record<string, number | null>): Row[] {
  return plan.builds.map((name) => ({
    key: name,
    name,
    note: BUILDS.find((b) => b.name === name)?.what ?? "",
    at: done[name] ?? null,
    kind: "build",
  }));
}

export function Queue() {
  const { save, year } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const { past, scale, done } = useSchedule();
  const plan = save?.plan ?? EMPTY;
  const queued = useMemo(() => rowsOf(plan, done), [plan, done]);
  const began = year !== null;
  const now = year ?? 0;

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
      {/* Before Begin an empty queue shows nothing, and the Mind's walk above offers to fill it. */}
      {(began || queued.length > 0) && (
        <>
          <ListHead left={`${began ? "Under way" : "Queued"} · ${queued.length}`} right="Done in" className="mt-1" />
          {queued.length ? (
            <ul data-q="queued" className="mt-1">
              {queued.map((r) => (
                <Item key={r.key} row={r} now={now} began={began} />
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
    </div>
  );
}
