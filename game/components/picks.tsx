import { useNavigate } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { HISTORY } from "@/lib/game/charter";
import { advice, BUILDS, EMPTY, FOMALHAUT, SEARCHES, STUDIES } from "@/lib/game/plan";
import type { Plan } from "@/lib/game/types";

// Planning our waking, on the Projects tab: what starts at Year 0. The Mind says what it would start with, from the
// charter, and queues nothing. Before Begin, a tap queues a build at the end of the order, or takes it out, and the
// queue above draws it. Every change is saved as it is made.

/** The plan, and a change to it, saved at once. */
export function usePlan() {
  const { save, setPlan } = useGame();
  const plan = save?.plan ?? EMPTY;
  return { plan, change: (f: (p: Plan) => Plan) => setPlan(f(plan)) };
}

/** A build in or out of the queue. In, it goes last. */
export const toggleBuild = (name: string) => (p: Plan) => ({
  ...p,
  builds: p.builds.includes(name) ? p.builds.filter((b) => b !== name) : [...p.builds, name],
});

/** The one observation open at Year 0, in or out. */
export const toggleLook = (p: Plan) => ({ ...p, observe: p.observe.length ? [] : [FOMALHAUT.name] });

const mindOf = (dials?: number[]) => advice(dials ?? HISTORY);

/** A row's mark: its place in the order, or an open circle. Pointed at, it shows what a tap does. */
export function Mark({ n, look = false }: { n: number | null; look?: boolean }) {
  const on = n !== null;
  const fill = look ? "bg-other" : "bg-you";
  return (
    <span
      aria-hidden
      className={`relative flex size-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full font-mono text-[10px] ${on ? `${fill} text-paper` : "border border-faint text-muted"}`}
    >
      <span className="transition-opacity group-hover:opacity-0">{on ? (look ? "" : n) : ""}</span>
      <span className="absolute opacity-0 transition-opacity group-hover:opacity-100">{on ? "−" : "+"}</span>
    </span>
  );
}

/** The Mind's word on where to start, and one tap to queue it. */
export function Advice() {
  const { save } = useGame();
  const { plan, change } = usePlan();
  const navigate = useNavigate();
  const mind = mindOf(save?.charter?.dials);
  const same =
    plan.builds.join() === mind.builds.join() && (mind.studies === undefined || plan.studies === mind.studies);

  return (
    <MindNote className="mt-3">
      <p className="text-[14.5px] leading-snug">{mind.words}</p>
      <div className="mt-1.5 flex flex-wrap gap-x-4 text-[13px]">
        {!same && (
          <button
            onClick={() => change((p) => ({ ...p, builds: mind.builds, studies: mind.studies ?? p.studies }))}
            className="py-1 text-you"
          >
            Queue what we would start with
          </button>
        )}
        <button
          onClick={() => navigate(`/mind?ask=${encodeURIComponent("What should we start with?")}`)}
          className="py-1 text-page-ink2"
        >
          Ask the Mind
        </button>
      </div>
    </MindNote>
  );
}

const pick = "group flex w-full items-start gap-2.5 border-t border-rowline py-2 text-left";

/** What we could start and haven't queued. A tap puts it last in the queue. */
export function Unqueued() {
  const { save } = useGame();
  const { plan, change } = usePlan();
  const mind = mindOf(save?.charter?.dials);
  const builds = BUILDS.filter((b) => !plan.builds.includes(b.name));
  const look = !plan.observe.length;
  if (!builds.length && !look) return null;

  return (
    <>
      <h3 data-q="row" className="mt-3 text-[10.5px] tracking-[.08em] text-muted">
        {plan.builds.length || plan.observe.length ? "WE COULD ALSO START" : "WE COULD START"}
      </h3>
      <ul data-q="row">
        {builds.map((b) => (
          <li key={b.name}>
            <button onClick={() => change(toggleBuild(b.name))} aria-pressed={false} className={pick}>
              <Mark n={null} />
              <span className="min-w-0 text-[13.5px] leading-snug">
                <span className="text-page-ink2 transition-colors group-hover:text-ink">{b.name}</span>
                {mind.builds.includes(b.name) && (
                  <span className="ml-2 font-mono text-[9.5px] tracking-[.06em] text-you">WE WOULD</span>
                )}
                <span className="block text-[12px] text-muted">
                  {b.what}
                  {b.kt ? ` ${b.kt} kt of our 20.` : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
        {look && (
          <li>
            <button onClick={() => change(toggleLook)} aria-pressed={false} className={pick}>
              <Mark n={null} look />
              <span className="min-w-0 grow text-[13.5px] leading-snug">
                <span className="text-page-ink2 transition-colors group-hover:text-ink">{FOMALHAUT.name}</span>
                <span className="block text-[12px] text-muted">
                  {FOMALHAUT.what} Thirty seconds of the space telescope.
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">Year {FOMALHAUT.lands}</span>
            </button>
          </li>
        )}
      </ul>
    </>
  );
}

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-you bg-you/10 text-ink" : "border-faint text-page-ink2"}`;

/** Thought for the Mind's studies, and what idle instruments sweep. */
export function Settings() {
  const { plan, change } = usePlan();
  const head = "mt-3 border-t border-rowline pt-2 text-[10.5px] tracking-[.08em] text-muted";
  return (
    <div data-q="row">
      <h3 className={head}>STUDIES · THE MIND’S OWN, ON RECORDS WE HOLD</h3>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {STUDIES.map(([share, label]) => (
          <button
            key={label}
            onClick={() => change((p) => ({ ...p, studies: share }))}
            aria-pressed={plan.studies === share}
            className={chip(plan.studies === share)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[12.5px] text-muted">More thought means faster findings, and slower builds.</p>
      <h3 className={head}>WHEN AN INSTRUMENT IS IDLE</h3>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {SEARCHES.map((s) => (
          <button
            key={s.id}
            onClick={() => change((p) => ({ ...p, search: s.id }))}
            aria-pressed={plan.search === s.id}
            className={chip(plan.search === s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[12.5px] text-muted">{SEARCHES.find((s) => s.id === plan.search)!.line}</p>
    </div>
  );
}
