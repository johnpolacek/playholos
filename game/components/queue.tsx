import { useEffect, useMemo, useRef, useState } from "react";
import { type Beam, useBeams } from "@/components/beams";
import { useGame } from "@/components/game-provider";
import { realTime, tenths, YEAR_0 } from "@/lib/game/clock";
import { SENDS } from "@/lib/game/knocks";
import type { EarthPast } from "@/lib/game/past";
import {
  type Aim,
  buildStory,
  focusable,
  Mark,
  MarkButton,
  pointer,
  Settings,
  Story,
  toggleBuild,
  toggleLook,
  Unqueued,
  usePlan,
  WASH,
} from "@/components/picks";
import { useWorks, type Work } from "@/components/works";
import { BUILDS, EMPTY, events, FOMALHAUT, schedule, SEARCHES, STUDIES } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// The queue: what we plan to start at Year 0, and what is already on its way, each on its whole journey. Before Begin,
// a tap on a queued row takes it out, and what we could also start waits below it. A message's thread
// starts the year we sent it, decades back, with a notch at Year 0, and a reply runs out and back. A build's starts at
// Year 0. Before Begin now waits at Year 0. After, it moves at 5 real minutes a Year, and what it passes is done.
// Picking a message takes the map out to its star, to show where its light is now, and opens its story. A build with a
// place on the map is picked the same way, by its row, and its mark takes it out. Chosen from
// explorations/projects-timeline.html, 04.

interface Row {
  key: string;
  name: string;
  note: string;
  /** Years from Year 0. Null past 40 Years. */
  at: number | null;
  kind: "build" | "look" | "send" | "reply";
  /** A build's place in the order, from 1. */
  n?: number;
  /** A message's name, the decimal year we sent it, and its star's distance in light-years. */
  msg?: string;
  sent?: number;
  ly?: number;
}

/** The axis runs to the last thing queued, at least 5 Years, at most 16. */
const span = (rows: Row[]) => Math.min(16, Math.max(5, Math.ceil(Math.max(0, ...rows.map((r) => r.at ?? 16)))));
const over = (row: Row, now: number) => row.at !== null && now >= row.at;

function rowsOf(plan: typeof EMPTY, done: Record<string, number | null>): Row[] {
  const builds: Row[] = plan.builds.map((name, i) => ({
    key: name,
    name,
    n: i + 1,
    note: BUILDS.find((b) => b.name === name)?.what ?? "",
    at: done[name] ?? null,
    kind: "build",
  }));
  const looks: Row[] = plan.observe.length
    ? [{ key: "look", name: FOMALHAUT.name, note: FOMALHAUT.what, at: FOMALHAUT.lands, kind: "look" }]
    : [];
  return [...builds, ...looks];
}

/** One row's whole journey, from the year we sent it or from Year 0. The head glows where the light is now. */
function Journey({ row, now, shown }: { row: Row; now: number; shown: boolean }) {
  const start = row.sent ?? YEAR_0;
  const total = YEAR_0 + (row.at ?? 40) - start;
  const p = Math.min(1, (YEAR_0 + now - start) / total);
  const zero = (YEAR_0 - start) / total;
  const done = over(row, now);
  const reply = row.kind === "reply";
  // A reply's first leg is ours going out, the second theirs coming home.
  const head = reply && p < 0.5 ? "you" : reply ? "other" : "you";
  const run = (from: number, to: number, c: string) => (
    <span
      className={`absolute top-[5.5px] h-[2px] rounded-full bg-linear-to-r ${c}`}
      style={{ left: `${from * 100}%`, width: `${Math.max(0, to - from) * 100}%` }}
    />
  );
  return (
    <>
      <div data-q="track" className="relative mt-[7px] h-[13px]">
        <span
          className={`absolute inset-x-0 top-1.5 border-t border-dashed ${row.at === null ? "border-muted/60" : "border-muted/30"}`}
        />
        {reply ? (
          <>
            {run(0, Math.min(p, 0.5), "from-you/5 to-you/95")}
            {run(0.5, p, "from-other/5 to-other/95")}
            <span
              className="absolute top-[6.5px] size-[7px] -translate-1/2 rounded-full bg-ink"
              style={{ left: "50%" }}
            />
          </>
        ) : (
          run(0, p, row.kind === "send" ? "from-you/5 to-you/95" : "from-you/20 to-you/95")
        )}
        {row.sent !== undefined && (
          <span className="absolute top-px h-[11px] border-l border-muted" style={{ left: `${zero * 100}%` }} />
        )}
        {row.at !== null && (
          <span
            className={`absolute top-[6.5px] left-full size-[9px] -translate-1/2 rotate-45 border transition-colors duration-700 ${done ? (reply ? "border-other bg-other" : "border-you bg-you") : "border-muted bg-panel"}`}
          />
        )}
        {!done && (
          <span className="absolute top-[6.5px] -translate-1/2" style={{ left: `${p * 100}%` }}>
            <span
              className={`absolute top-1/2 left-1/2 size-[15px] -translate-1/2 animate-pulse rounded-full ${head === "you" ? "bg-you/25" : "bg-other/25"}`}
            />
            <span
              className={`relative block size-[7px] rounded-full ${head === "you" ? "bg-you shadow-[0_0_10px_var(--you)]" : "bg-other shadow-[0_0_10px_var(--other)]"}`}
            />
          </span>
        )}
      </div>
      <div className="mt-[3px] flex justify-between gap-2.5 font-mono text-[9.5px] text-muted">
        <span>{row.sent !== undefined ? `sent ${Math.floor(row.sent)} · ${row.msg}` : "from Year 0"}</span>
        {row.ly !== undefined && (
          <span>
            {`${row.ly.toFixed(1)} ly${reply ? " there and back" : ""} `}
            <span className={shown ? "text-you" : ""}>↗</span>
          </span>
        )}
      </div>
    </>
  );
}

/** A row: before Begin, a queued row's tap takes it out. A row that shows on the map is picked by a tap instead, and a
 *  queued build of these is taken out by its mark. */
function Item({ row, now, began, aim, take }: { row: Row; now: number; began: boolean; aim?: Aim; take?(): void }) {
  const done = over(row, now);
  const when =
    row.at === null
      ? "past Year 40"
      : done
        ? row.kind === "build"
          ? "done"
          : "landed"
        : began
          ? `in ${realTime(row.at - now)}`
          : `Year ${tenths(row.at)}`;
  const split = !!(aim && take);
  const keys = (act: () => void) => (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    act();
  };
  return (
    <li
      data-q="row"
      data-key={row.key}
      {...(aim && pointer(aim))}
      {...(aim && !split && focusable(aim))}
      {...(take &&
        !split && {
          role: "button",
          tabIndex: 0,
          "aria-pressed": true,
          onClick: take,
          onKeyDown: keys(take),
        })}
      className={`group border-t border-rowline py-2 outline-none transition-[background-color,box-shadow] duration-200 ${aim || take ? "cursor-pointer" : ""} ${aim?.lit ? WASH : ""}`}
    >
      <div className="flex items-start gap-2.5">
        {take &&
          (split ? (
            <MarkButton n={row.n ?? 0} label={`Take ${row.name} out of the queue`} onClick={take} />
          ) : (
            <Mark n={row.n ?? 0} look={row.kind === "look"} />
          ))}
        <div
          {...(split && focusable(aim!))}
          className="flex min-w-0 grow items-baseline justify-between gap-3 outline-none"
        >
          <span className="min-w-0 text-[13.5px] leading-snug">
            <b className={`font-medium ${row.kind === "reply" ? "text-other" : ""}`}>
              {row.n && !take ? `${row.n} · ${row.name}` : row.name}
            </b>
            <span className="block text-[12px] text-muted">{row.note}</span>
          </span>
          <span
            className={`shrink-0 text-right font-mono text-[11px] tabular-nums ${done ? "text-you" : "text-page-ink2"}`}
          >
            {when}
          </span>
        </div>
      </div>
      <Journey row={row} now={now} shown={!!aim?.shown} />
      {row.msg && SENDS[row.msg] && (
        <Story
          lines={[
            ["HOLDS", SENDS[row.msg].holds],
            ["WHY", SENDS[row.msg].why],
            ["FROM", SENDS[row.msg].from],
            ["SINCE", SENDS[row.msg].since],
          ]}
          tone={row.kind === "reply" ? "other" : "you"}
          open={!!aim?.shown}
        />
      )}
      {row.kind === "build" && SITES[row.name] && <Story lines={buildStory(row.name)} tone="you" open={!!aim?.shown} />}
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
        msg: e.msg,
        sent: e.sent,
        ly: e.ly,
      })),
    [t],
  );
  const began = year !== null;
  const now = year ?? 0;
  const { change } = usePlan();

  // Our messages, for the map. Picking one takes the map out to it, and pointing at another while it is out turns to
  // that one. Our builds with places are the same, and the map shows one thing at a time. Leaving Projects brings the
  // map home.
  const beams = useBeams();
  const { pick, peek, picked } = beams;
  const list: Beam[] = useMemo(
    () => coming.map((r) => ({ key: r.key, star: r.name, sent: r.sent!, ly: r.ly!, reply: r.kind === "reply" })),
    [coming],
  );
  useEffect(() => () => pick([], null), [pick]);
  const works = useWorks();
  const { set: place, pick: pickWork, peek: peekWork } = works;
  const placed: Work[] = useMemo(
    () =>
      Object.entries(SITES).map(([name, { site }]) => {
        const queued = plan.builds.includes(name);
        return { name, site, queued, done: queued ? (done[name] ?? null) : null };
      }),
    [plan.builds, done],
  );
  useEffect(() => place(placed), [place, placed]);
  useEffect(() => () => pickWork(null), [pickWork]);
  const [hover, setHover] = useState<string | null>(null);
  const aim = (i: number): Aim => ({
    shown: picked === i,
    lit: picked === i || hover === list[i].key,
    toggle: () => {
      pick(list, picked === i ? null : i);
      pickWork(null);
    },
    point: (on) => {
      setHover(on ? list[i].key : null);
      peek(on ? i : null);
    },
  });
  const aimWork = (name: string): Aim => ({
    shown: works.picked === name,
    lit: works.picked === name || hover === name,
    toggle: () => pickWork(works.picked === name ? null : name),
    point: (on) => {
      setHover(on ? name : null);
      peekWork(on ? name : null);
    },
  });

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
  const studies = STUDIES.find(([s]) => s === plan.studies)?.[1] ?? `${plan.studies}`;
  const search = SEARCHES.find((s) => s.id === plan.search)!;

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        pick(list, null);
        pickWork(null);
      }}
    >
      <h3 className="mt-2 text-[10.5px] tracking-[.08em] text-muted">
        {began ? "UNDER WAY" : "QUEUED"} · {queued.length}
      </h3>
      {queued.length ? (
        <ul data-q="queued">
          {queued.map((r) => (
            <Item
              key={r.key}
              row={r}
              now={now}
              began={began}
              aim={r.kind === "build" && SITES[r.name] ? aimWork(r.name) : undefined}
              take={began ? undefined : () => change(r.kind === "look" ? toggleLook : toggleBuild(r.key))}
            />
          ))}
        </ul>
      ) : (
        <p data-q="row" className="border-t border-rowline py-2 text-[13px] text-muted">
          Nothing queued. Our instruments keep watch, and the Mind keeps studying.
        </p>
      )}
      {!began && <Unqueued aim={aimWork} />}

      <h3 className="mt-3 text-[10.5px] tracking-[.08em] text-muted">ALREADY ON ITS WAY</h3>
      <ul>
        {coming.map((r, i) => (
          <Item key={r.key} row={r} now={now} began={began} aim={aim(i)} />
        ))}
      </ul>

      {began ? (
        <dl
          data-q="row"
          className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-rowline pt-2 text-[12.5px]"
        >
          <dt className="text-muted">Studies</dt>
          <dd>{plan.studies ? `${studies} of our thought` : "None"}</dd>
          <dt className="text-muted">When idle</dt>
          <dd>{search.label}</dd>
        </dl>
      ) : (
        <Settings />
      )}
    </div>
  );
}
