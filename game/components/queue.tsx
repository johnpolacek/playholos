import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { realTime, tenths } from "@/lib/game/clock";
import type { EarthPast } from "@/lib/game/past";
import { BUILDS, EMPTY, events, FOMALHAUT, schedule, SEARCHES, STUDIES } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// The queue: what Planning saved, on the Years it will take. Every row is a thread from Year 0 to the Year it is done
// or lands, on one shared axis, with a now mark on each. Before Begin the mark waits at Year 0. After, it moves
// at 5 real minutes a Year, the threads fill behind it, and what it passes is done. Dates are the game's own pacing,
// as Planning drew them.

interface Row {
  key: string;
  name: string;
  note: string;
  /** Years from Year 0. Null past 40 Years. */
  at: number | null;
  kind: "build" | "look" | "send" | "reply";
}

/** The axis runs to the last thing queued, at least 5 Years, at most 16. */
const span = (rows: Row[]) => Math.min(16, Math.max(5, Math.ceil(Math.max(0, ...rows.map((r) => r.at ?? 16)))));

function rowsOf(plan: typeof EMPTY, done: Record<string, number | null>): Row[] {
  const builds: Row[] = plan.builds.map((name, i) => ({
    key: name,
    name: `${i + 1} · ${name}`,
    note: BUILDS.find((b) => b.name === name)?.what ?? "",
    at: done[name] ?? null,
    kind: "build",
  }));
  const looks: Row[] = plan.observe.length
    ? [{ key: "look", name: FOMALHAUT.name, note: FOMALHAUT.what, at: FOMALHAUT.lands, kind: "look" }]
    : [];
  return [...builds, ...looks];
}

function Thread({ row, t, now }: { row: Row; t: number; now: number }) {
  const end = row.at === null ? 1 : Math.min(1, row.at / t);
  const fill = row.at === null ? Math.min(1, now / t) : Math.min(1, now / row.at) * end;
  const over = row.at !== null && now >= row.at;
  const color = row.kind === "reply" ? "bg-other" : "bg-you";
  return (
    <div className="relative mt-1.5 h-[5px]">
      {/* The whole thread, faint, then what has run of it. */}
      <span
        className={`absolute inset-y-[2px] left-0 origin-left ${row.at === null ? "border-t border-dashed border-muted/60" : "bg-track"}`}
        style={{ width: `${end * 100}%` }}
      />
      <span
        className={`absolute inset-y-0 left-0 origin-left rounded-full ${color} transition-[width] duration-1000 ease-linear`}
        style={{ width: `${fill * 100}%`, opacity: over ? 1 : 0.8 }}
      />
      {/* Now, a short mark across this thread only, so it never runs through the words. */}
      <span
        className="absolute -inset-y-1 border-l border-you/40"
        style={{ left: `${Math.min(1, now / t) * 100}%` }}
      />
      {row.at !== null && (
        <span
          className={`absolute top-1/2 size-[9px] -translate-1/2 rotate-45 border ${over ? `${color} border-transparent` : "border-muted bg-panel"}`}
          style={{ left: `${end * 100}%` }}
        />
      )}
    </div>
  );
}

function Item({ row, t, now, began }: { row: Row; t: number; now: number; began: boolean }) {
  const over = row.at !== null && now >= row.at;
  const when =
    row.at === null
      ? "past Year 40"
      : over
        ? row.kind === "build"
          ? "done"
          : "landed"
        : began
          ? `in ${realTime(row.at - now)}`
          : `Year ${tenths(row.at)}`;
  return (
    <li data-q="row" className="border-t border-rowline py-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 text-[13.5px] leading-snug">
          <b className={`font-medium ${row.kind === "reply" ? "text-other" : ""}`}>{row.name}</b>
          <span className="block text-[12px] text-muted">{row.note}</span>
        </span>
        <span
          className={`shrink-0 text-right font-mono text-[11px] tabular-nums ${over ? "text-you" : "text-page-ink2"}`}
        >
          {when}
        </span>
      </div>
      <Thread row={row} t={t} now={now} />
    </li>
  );
}

export function Queue() {
  const { save, year } = useGame();
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast, () => setPast(undefined));
  }, [seed]);

  const plan = save?.plan ?? EMPTY;
  const scale = past?.compute ?? 1;
  const done = useMemo(() => schedule(plan, scale), [plan, scale]);
  const queued = useMemo(() => rowsOf(plan, done), [plan, done]);
  const t = span(queued);
  const coming: Row[] = useMemo(
    () =>
      events(t).map((e) => ({
        key: `${e.star}${e.at}`,
        name: e.star,
        note: e.reply ? "A reply could come, at the soonest" : "Our message arrives",
        at: e.at,
        kind: e.reply ? "reply" : "send",
      })),
    [t],
  );
  const began = year !== null;
  const now = year ?? 0;
  const ticks = Array.from({ length: Math.floor(t / (t > 8 ? 2 : 1)) + 1 }, (_, i) => i * (t > 8 ? 2 : 1));

  useGSAP(
    () => {
      if (!past || prefersReducedMotion()) return;
      gsap.fromTo(root.current!.querySelectorAll('[data-q="row"]'), riseFrom, { ...rise, stagger: 0.06 });
    },
    { scope: root, dependencies: [!!past] },
  );

  if (!past) return <div className="min-h-[120px]" />;
  const studies = STUDIES.find(([s]) => s === plan.studies)?.[1] ?? `${plan.studies}`;
  const search = SEARCHES.find((s) => s.id === plan.search)!;

  return (
    <div ref={root} className="relative">
      {/* The axis, with now as a dot. */}
      <div className="relative mt-1 h-4 font-mono text-[9px] text-muted">
        {ticks.map((y) => (
          <span key={y} className="absolute -translate-x-1/2" style={{ left: `${(y / t) * 100}%` }}>
            {y === 0 ? "" : y}
          </span>
        ))}
        <span className="absolute left-0 text-you">Year 0</span>
      </div>
      <span
        className={`pointer-events-none absolute top-4 size-[7px] -translate-x-1/2 rounded-full bg-you ${began ? "" : "animate-pulse"}`}
        style={{ left: `${Math.min(1, now / t) * 100}%` }}
      />

      <h3 className="mt-2 text-[10.5px] tracking-[.08em] text-muted">
        {began ? "UNDER WAY" : "QUEUED"} · {queued.length}
      </h3>
      {queued.length ? (
        <ul>
          {queued.map((r) => (
            <Item key={r.key} row={r} t={t} now={now} began={began} />
          ))}
        </ul>
      ) : (
        <p data-q="row" className="border-t border-rowline py-2 text-[13px] text-muted">
          Nothing queued. Our instruments keep watch, and the Mind keeps studying.
        </p>
      )}

      <h3 className="mt-3 text-[10.5px] tracking-[.08em] text-muted">ALREADY ON ITS WAY</h3>
      <ul>
        {coming.map((r) => (
          <Item key={r.key} row={r} t={t} now={now} began={began} />
        ))}
      </ul>

      <dl
        data-q="row"
        className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-rowline pt-2 text-[12.5px]"
      >
        <dt className="text-muted">Studies</dt>
        <dd>{plan.studies ? `${studies} of our thought` : "None"}</dd>
        <dt className="text-muted">When idle</dt>
        <dd>{search.label}</dd>
      </dl>
    </div>
  );
}
