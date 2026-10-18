import { useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Spread } from "@/components/spread";
import { HISTORY } from "@/lib/game/charter";
import { realTime } from "@/lib/game/clock";
import type { EarthPast } from "@/lib/game/past";
import { advice, BUILDS, EMPTY, events, FOMALHAUT, schedule, SEARCHES, STUDIES } from "@/lib/game/plan";
import { PLAN_SOURCES } from "@/lib/game/sources";
import type { Plan as PlanT } from "@/lib/game/types";
import { rise, riseFrom, useStage } from "@/lib/motion";

// "Plan our waking.": what starts at Year 0. The Mind says what it would start with, from the charter, and queues
// nothing. The Will picks builds in order, the one observation open, thought for studies, and what idle instruments
// sweep. Beside it the first Years are drawn as they would run: each build a thread out to the Year it is done,
// paced by this game's thought from the order picked, with our messages and the first possible replies on the way.

const LANE = 30;
const PAD = { l: 8, r: 64, t: 30 };
/** The width of a character of the drawing's 9px mono labels, for keeping them apart. */
const CH = 5.5;
const ROWS = 3;

const ease = "transform 0.7s cubic-bezier(.2,.8,.2,1), opacity 0.4s";

/** Messages arriving point right, replies that could come point left. Each takes the first row it fits in, its
 *  label after its mark, or before it near the right edge. */
function placeEvents(evs: ReturnType<typeof events>, x: (y: number) => number, w: number) {
  const ends = Array<number>(ROWS).fill(-Infinity);
  return evs.flatMap((e) => {
    const label = `${e.reply ? "← " : "→ "}${e.star.replace(" Star", "")} ${e.at.toFixed(1)}`;
    const at = x(e.at);
    const wide = 6 + (label.length - 2) * CH;
    const left = at + wide > w;
    const from = left ? at - wide : at - 4;
    const row = ends.findIndex((end) => from > end + 6);
    if (row < 0 || from < 0) return [];
    ends[row] = left ? at + 4 : at + wide;
    return [{ ...e, label, at, row, left }];
  });
}

/** One build or observation: a thread from Year 0 to the Year it is done, grown out when it first appears. */
function Lane({
  label,
  y,
  from,
  to,
  open,
  look,
  at,
}: {
  label: string;
  y: number;
  from: number;
  to: number;
  open: boolean;
  look: boolean;
  at: string;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const len = grown ? to - from : 0;
  return (
    <g style={{ transform: `translate(0, ${y}px)`, transition: ease }}>
      <text x={from + 6} y={-6} className="fill-ink text-[10px]">
        {label}
      </text>
      <g style={{ transform: `translateX(${from}px) scaleX(${Math.max(len, 0.001)})`, transition: ease }}>
        <line
          x1={0}
          x2={1}
          vectorEffect="non-scaling-stroke"
          className={look ? "stroke-other" : "stroke-you"}
          strokeWidth={1.5}
          strokeDasharray={open ? "3 3" : undefined}
        />
      </g>
      <g style={{ transform: `translateX(${from + len}px)`, transition: ease }}>
        <circle r={3} className={look ? "fill-other" : "fill-you"} />
        <text x={7} y={3} className="fill-muted">
          {at}
        </text>
      </g>
    </g>
  );
}

function Timeline({ plan, done }: { plan: PlanT; done: Record<string, number | null> }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(340);
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const last = Math.max(0, ...Object.values(done).map((y) => y ?? 12));
  const T = Math.min(16, Math.max(6, Math.ceil(last + 0.5)));
  const x = (y: number) => PAD.l + (Math.min(y, T) / T) * (w - PAD.l - PAD.r);
  const evs = placeEvents(events(T), x, w);
  const lanes = [
    ...plan.builds.map((b) => ({ id: b, label: b, at: done[b], look: false })),
    ...plan.observe.map((o) => ({ id: o, label: "Fomalhaut, imaged", at: FOMALHAUT.lands, look: true })),
  ];
  const top = PAD.t + ROWS * 12 + 6;
  const studiesY = top + lanes.length * LANE + (lanes.length ? 18 : 40);
  const axisY = studiesY + 16;
  const h = axisY + 30;
  const step = T <= 8 ? 1 : 2;
  const ticks = Array.from({ length: Math.floor(T / step) + 1 }, (_, i) => i * step);
  const studies = STUDIES.find(([s]) => s === plan.studies)?.[1] ?? "";

  return (
    <div ref={box} className="relative w-full">
      <svg width={w} height={h} className="block overflow-visible font-mono text-[9px]">
        <text x={x(0)} y={10} className="fill-muted">
          → our messages arrive
        </text>
        <text x={x(0) + 25 * CH} y={10} className="fill-other">
          ← a reply could come
        </text>
        {/* Year 0, where everything starts: the moment we begin. */}
        <line x1={x(0)} x2={x(0)} y1={PAD.t - 6} y2={axisY} className="stroke-you/50" />
        <circle cx={x(0)} cy={axisY} r={3.5} className="animate-pulse fill-you" />
        {evs.map((e) => (
          <g key={e.label} style={{ transform: `translate(${e.at}px, ${PAD.t + e.row * 12}px)`, transition: ease }}>
            <path d="M0,-3 L3,0 L0,3 L-3,0 Z" className={e.reply ? "fill-other" : "fill-muted"} />
            <text
              x={e.left ? -6 : 6}
              y={3}
              textAnchor={e.left ? "end" : "start"}
              className={e.reply ? "fill-other" : "fill-muted"}
            >
              {e.label.slice(2)}
            </text>
          </g>
        ))}
        {lanes.map((l, i) => (
          <Lane
            key={l.id}
            label={l.label}
            y={top + i * LANE + 16}
            from={x(0)}
            to={x(l.at === null ? T : l.at)}
            open={l.at === null}
            look={l.look}
            at={l.at === null ? "past Year 40" : `Year ${l.at.toFixed(1)}`}
          />
        ))}
        {!lanes.length && (
          <text x={x(0) + 8} y={top + 14} className="fill-muted text-[10px]">
            Nothing queued yet. Nothing starts until we begin.
          </text>
        )}
        {/* The Mind's studies run the whole way, on the thought set aside for them. */}
        <g style={{ transform: `translate(0, ${studiesY}px)`, transition: ease }}>
          <line
            x1={x(0)}
            x2={x(T)}
            className="stroke-muted"
            strokeDasharray="1 4"
            strokeLinecap="round"
            strokeWidth={plan.studies ? 2 : 0}
          />
          <text x={x(0) + 6} y={-5} className="fill-muted">
            {plan.studies ? `studies · ${studies.toLowerCase()} of our thought` : "no studies"}
          </text>
        </g>
        <line x1={x(0)} x2={x(T)} y1={axisY} y2={axisY} className="stroke-muted/50" />
        {ticks.map((t) => (
          <g key={t} style={{ transform: `translateX(${x(t)}px)`, transition: ease }}>
            <line y1={axisY} y2={axisY + 4} className="stroke-muted/60" />
            <text y={axisY + 14} textAnchor="middle" className="fill-muted">
              {t === 0 ? "Year 0" : t}
            </text>
            {t > 0 && (
              <text y={axisY + 25} textAnchor="middle" className="fill-muted/70">
                {realTime(t).slice(0, 5)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function Plan({ onNext }: { onSkip(): void; onNext(): void }) {
  const { save, setPlan } = useGame();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const [past, setPast] = useState<EarthPast>();
  const [plan, setPlanState] = useState<PlanT>(() => save?.plan ?? EMPTY);
  const seed = save?.seed;
  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast, () => setPast(undefined));
  }, [seed]);
  const scale = past?.compute ?? 1;
  const done = useMemo(() => schedule(plan, scale), [plan, scale]);
  const mind = advice(save?.charter?.dials ?? HISTORY);

  const toggle = (name: string) =>
    setPlanState((p) => ({
      ...p,
      builds: p.builds.includes(name) ? p.builds.filter((b) => b !== name) : [...p.builds, name],
    }));
  const take = () => setPlanState((p) => ({ ...p, builds: mind.builds, studies: mind.studies ?? p.studies }));

  const { leave } = useStage(
    root,
    (q, tl) => {
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="art"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 0.2)
        .fromTo(q('[data-m="who"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.3)
        .fromTo(q('[data-m="words"]'), riseFrom, { ...rise, duration: 0.7 }, 0.5)
        .fromTo(q('[data-m="part"]'), riseFrom, { ...rise, stagger: 0.12 }, 1.2)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, 1.8);
    },
    !!save,
  );

  // The queue waits on the Projects tab, with Begin.
  function queue() {
    setPlan(plan);
    leave(() => {
      navigate("/projects");
      onNext();
    });
  }

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-you bg-you/10 text-ink" : "border-faint text-page-ink2"}`;

  return (
    <div ref={root} className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10">
      <Spread
        sources={PLAN_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · PLAN OUR WAKING
          </span>
        }
        art={
          <div
            data-m="art"
            className="mt-4 flex w-full flex-col gap-2 wide:max-w-[720px] wide:justify-center wide:self-center wide:px-6"
          >
            <span className="font-mono text-[10px] tracking-[.1em] text-muted">THE FIRST YEARS, AS THEY WOULD RUN</span>
            <Timeline plan={plan} done={done} />
          </div>
        }
      >
        <span data-m="who" className="mt-4 font-mono text-[10px] tracking-[.1em] text-you wide:mt-3">
          THE MIND
        </span>
        <div data-m="words" className="mt-1.5 flex flex-col items-start gap-1.5">
          <p className="text-[17px] leading-snug font-medium wide:text-[19px]">{mind.words}</p>
          <button onClick={take} className="py-1 text-[13px] text-you">
            Queue what we would start with
          </button>
        </div>

        <section data-m="part" className="mt-4">
          <h2 className="font-mono text-[10px] tracking-[.1em] text-muted">BUILDS · IN THE ORDER PICKED</h2>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {BUILDS.map((b) => {
              const n = plan.builds.indexOf(b.name);
              const on = n >= 0;
              const at = done[b.name];
              return (
                <li key={b.name}>
                  <button
                    onClick={() => toggle(b.name)}
                    aria-pressed={on}
                    className={`flex w-full items-baseline gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-you bg-you/10" : "border-faint"}`}
                  >
                    <span
                      className={`flex size-5 shrink-0 translate-y-[3px] items-center justify-center rounded-full font-mono text-[10px] ${on ? "bg-you text-paper" : "border border-faint"}`}
                    >
                      {on ? n + 1 : ""}
                    </span>
                    <span className="flex min-w-0 grow flex-col">
                      <span className="text-[14.5px] leading-snug">
                        {b.name}
                        {mind.builds.includes(b.name) && (
                          <span className="ml-2 font-mono text-[9.5px] tracking-[.06em] text-you">WE WOULD</span>
                        )}
                      </span>
                      <span className="text-[12.5px] leading-snug text-page-ink2">
                        {b.what}
                        {b.kt ? ` ${b.kt} kt of our 20.` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right font-mono text-[10.5px] text-muted tabular-nums">
                      {on && at !== undefined ? (at === null ? "past 40" : `Year ${at.toFixed(1)}`) : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section data-m="part" className="mt-4">
          <h2 className="font-mono text-[10px] tracking-[.1em] text-muted">AN OBSERVATION · SPACE TELESCOPE</h2>
          <button
            onClick={() => setPlanState((p) => ({ ...p, observe: p.observe.length ? [] : [FOMALHAUT.name] }))}
            aria-pressed={!!plan.observe.length}
            className={`mt-1.5 flex w-full items-baseline justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${plan.observe.length ? "border-other bg-other/10" : "border-faint"}`}
          >
            <span className="flex flex-col">
              <span className="text-[14.5px] leading-snug">{FOMALHAUT.name}</span>
              <span className="text-[12.5px] text-page-ink2">{FOMALHAUT.what} Thirty seconds of the telescope.</span>
            </span>
            <span className="shrink-0 font-mono text-[10.5px] text-muted">Year {FOMALHAUT.lands}</span>
          </button>
        </section>

        <section data-m="part" className="mt-4">
          <h2 className="font-mono text-[10px] tracking-[.1em] text-muted">
            STUDIES · THE MIND’S OWN, ON RECORDS WE HOLD
          </h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {STUDIES.map(([share, label]) => (
              <button
                key={label}
                onClick={() => setPlanState((p) => ({ ...p, studies: share }))}
                aria-pressed={plan.studies === share}
                className={chip(plan.studies === share)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[12.5px] text-page-ink2">More thought means faster findings, and slower builds.</p>
        </section>

        <section data-m="part" className="mt-4">
          <h2 className="font-mono text-[10px] tracking-[.1em] text-muted">WHEN AN INSTRUMENT IS IDLE</h2>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {SEARCHES.map((s) => (
              <button
                key={s.id}
                onClick={() => setPlanState((p) => ({ ...p, search: s.id }))}
                aria-pressed={plan.search === s.id}
                className={chip(plan.search === s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[12.5px] text-page-ink2">{SEARCHES.find((s) => s.id === plan.search)!.line}</p>
        </section>

        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button
            data-m="act"
            onClick={() =>
              leave(() => {
                setPlan(plan);
                navigate(`/mind?ask=${encodeURIComponent("What should we start with?")}`);
                onNext();
              })
            }
            className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
          >
            Ask the Mind
          </button>
          <button
            data-m="act"
            onClick={queue}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Queue that
          </button>
        </div>
      </Spread>
    </div>
  );
}
