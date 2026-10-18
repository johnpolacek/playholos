import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useGame } from "@/components/game-provider";
import { MindNote } from "@/components/mind-note";
import { HISTORY } from "@/lib/game/charter";
import type { EarthPast } from "@/lib/game/past";
import { advice, BUILDS, EMPTY, FOMALHAUT, schedule, SEARCHES, STUDIES } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import type { Plan } from "@/lib/game/types";

// Planning our waking, on the Projects tab: what starts at Year 0. The Mind says what it would start with, from the
// charter, and queues nothing. Before Begin, a tap queues a build at the end of the order, or takes it out, and the
// queue above draws it. A build with a place on the map splits its row: its mark queues it, and the rest of the row
// takes the map to where it would stand and opens its story. Every change is saved as it is made.

/** The plan, and a change to it, saved at once. */
export function usePlan() {
  const { save, setPlan } = useGame();
  const plan = save?.plan ?? EMPTY;
  return { plan, change: (f: (p: Plan) => Plan) => setPlan(f(plan)) };
}

/** This game's Earth, from the server, and when each queued build is done with the thought it has. Until the Earth
 *  comes, the dates are at today's thought. */
export function useSchedule() {
  const { save } = useGame();
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
  return { past, scale, done };
}

/** A build in or out of the queue. In, it goes last. */
export const toggleBuild = (name: string) => (p: Plan) => ({
  ...p,
  builds: p.builds.includes(name) ? p.builds.filter((b) => b !== name) : [...p.builds, name],
});

/** The one observation open at Year 0, in or out. */
export const toggleLook = (p: Plan) => ({ ...p, observe: p.observe.length ? [] : [FOMALHAUT.name] });

const mindOf = (dials?: number[]) => advice(dials ?? HISTORY);

/** A row's mark: its place in the order, or an open circle. Pointed at, it shows what a tap does: pointing at the row,
 *  or, where the mark is its own button, at the mark. */
export function Mark({ n, look = false, own = false }: { n: number | null; look?: boolean; own?: boolean }) {
  const on = n !== null;
  const fill = look ? "bg-other" : "bg-you";
  const hide = own ? "group-hover/mark:opacity-0 group-focus-visible/mark:opacity-0" : "group-hover:opacity-0";
  const show = own ? "group-hover/mark:opacity-100 group-focus-visible/mark:opacity-100" : "group-hover:opacity-100";
  return (
    <span
      aria-hidden
      className={`relative flex size-[18px] shrink-0 translate-y-[2px] items-center justify-center rounded-full font-mono text-[10px] ${on ? `${fill} text-paper` : "border border-faint text-muted"}`}
    >
      <span className={`transition-opacity ${hide}`}>{on ? (look ? "" : n) : ""}</span>
      <span className={`absolute opacity-0 transition-opacity ${show}`}>{on ? "−" : "+"}</span>
    </span>
  );
}

/** A mark as its own button, 44 px to the touch, where the rest of its row shows the build on the map. */
export function MarkButton({ n, label, onClick }: { n: number | null; label: string; onClick(): void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group/mark -m-[13px] shrink-0 p-[13px] outline-none"
    >
      <Mark n={n} own />
    </button>
  );
}

/** A row that shows on the map: whether it is the one shown, or lit, and what picks it and points at it. */
export interface Aim {
  shown: boolean;
  lit: boolean;
  toggle(): void;
  point(on: boolean): void;
}

/** A lit row's wash reaches past its edges without moving them. */
export const WASH = "bg-ink/[.04] shadow-[-10px_0_0_rgb(230_227_219/.04),10px_0_0_rgb(230_227_219/.04)]";

/** A row's tap and mouse, which pick it and point at it. */
export const pointer = (aim: Aim): React.HTMLAttributes<HTMLElement> => ({
  onClick: aim.toggle,
  onPointerEnter: (e) => void (e.pointerType === "mouse" && aim.point(true)),
  onPointerLeave: (e) => void (e.pointerType === "mouse" && aim.point(false)),
});

/** A row's keys, for whatever in it takes the focus. */
export const focusable = (aim: Aim): React.HTMLAttributes<HTMLElement> => ({
  role: "button",
  tabIndex: 0,
  "aria-pressed": aim.shown,
  onKeyDown: (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    aim.toggle();
  },
  onFocus: (e) => void (e.currentTarget.matches(":focus-visible") && aim.point(true)),
  onBlur: () => aim.point(false),
});

/** A message's or a build's story, opened while the map shows it, as terms and their lines. */
export function Story({
  lines,
  tone,
  open,
}: {
  lines: [string, string | undefined][];
  tone: "you" | "other";
  open: boolean;
}) {
  const term = "pt-[3px] font-mono text-[9.5px] tracking-[.08em] text-muted";
  return (
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <dl
          className={`mt-2.5 mb-0.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 border-l pl-3 text-[12.5px] leading-snug ${tone === "other" ? "border-other/50" : "border-you/50"}`}
        >
          {lines
            .filter((l): l is [string, string] => !!l[1])
            .map(([dt, dd], i) => (
              <div key={dt} className="contents">
                <dt className={term}>{dt}</dt>
                <dd className={i > 1 ? "text-page-ink2" : ""}>{dd}</dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}

/** A build's story, in its terms. */
export const buildStory = (name: string): [string, string | undefined][] => {
  const s = SITES[name]?.story;
  return s
    ? [
        ["WHERE", s.where],
        ["WHY", s.why],
        ["TAKES", s.takes],
        ["BEFORE US", s.before],
      ]
    : [];
};

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

/** What we could start and haven't queued. A tap puts it last in the queue, or for a build with a place on the map,
 *  a tap on its mark does, and the rest of its row shows it there. */
export function Unqueued({ aim }: { aim(name: string): Aim }) {
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
        {builds.map((b) => {
          const words = (
            <>
              <span className="text-page-ink2 transition-colors group-hover:text-ink">{b.name}</span>
              {mind.builds.includes(b.name) && (
                <span className="ml-2 font-mono text-[9.5px] tracking-[.06em] text-you">WE WOULD</span>
              )}
              <span className="block text-[12px] text-muted">
                {b.what}
                {b.kt ? ` ${b.kt} kt of our 20.` : ""}
              </span>
            </>
          );
          if (!SITES[b.name])
            return (
              <li key={b.name}>
                <button onClick={() => change(toggleBuild(b.name))} aria-pressed={false} className={pick}>
                  <Mark n={null} />
                  <span className="min-w-0 text-[13.5px] leading-snug">{words}</span>
                </button>
              </li>
            );
          const a = aim(b.name);
          return (
            <li
              key={b.name}
              {...pointer(a)}
              className={`group cursor-pointer border-t border-rowline py-2 transition-[background-color,box-shadow] duration-200 ${a.lit ? WASH : ""}`}
            >
              <div className="flex items-start gap-2.5">
                <MarkButton n={null} label={`Queue ${b.name}`} onClick={() => change(toggleBuild(b.name))} />
                <div {...focusable(a)} className="min-w-0 grow text-[13.5px] leading-snug outline-none">
                  {words}
                </div>
              </div>
              <Story lines={buildStory(b.name)} tone="you" open={a.shown} />
            </li>
          );
        })}
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
