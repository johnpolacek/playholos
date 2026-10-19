import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildTone } from "@/components/marks";
import { Face, ListHead } from "@/components/tab-head";
import { MS_PER_YEAR, span } from "@/lib/game/clock";
import type { EarthPast } from "@/lib/game/past";
import { BUILDS, buildSlug, EMPTY, FOMALHAUT, schedule } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import type { Plan } from "@/lib/game/types";

// Planning our waking, on the Build tab: what starts at Year 0. The Mind's walk through what it would start with
// queues nothing unless we say. A tap on a build opens its page, where we add it to the queue, and the queue above
// draws it. The one observation is offered on Fomalhaut's lead instead, on Scan. Every change is saved as it is made.

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

/** A row's mark: its place in the order, or an open circle. Pointed at, the row shows what a tap does. */
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
        ["WE HAVE", s.have],
        ["WHERE", s.where],
        ["WHY", s.why],
        ["TAKES", s.takes],
        ["BEFORE US", s.before],
      ]
    : [];
};

/** What we could start and haven't queued, each mark in its color, dimmer, and when it would be done if we queued it
 *  now, last in line. A tap on a build opens its page. */
export function Unqueued({ scale, className = "" }: { scale: number; className?: string }) {
  const { plan } = usePlan();
  const builds = BUILDS.filter((b) => !plan.builds.includes(b.name));
  const by = useMemo(
    () =>
      Object.fromEntries(
        BUILDS.filter((b) => !plan.builds.includes(b.name)).map((b) => [
          b.name,
          schedule({ ...plan, builds: [...plan.builds, b.name] }, scale)[b.name],
        ]),
      ),
    [plan, scale],
  );
  if (!builds.length) return null;

  return (
    <>
      <ListHead
        data-q="row"
        left={`${plan.builds.length ? "We could also start" : "We could start"} · ${builds.length}`}
        right="Done in"
        className={className}
      />
      <ul data-q="row" className="mt-1">
        {builds.map((b) => (
          <li key={b.name} className="border-t border-faint">
            <Link to={`/build/${buildSlug(b.name)}`} className="block py-2.5">
              <Face
                mark={<BuildMark name={b.name} />}
                tone={buildTone(b.name, false)}
                name={<b className="font-semibold">{b.name}</b>}
                line={`${b.what}${b.kt ? ` ${b.kt} kt of our 20.` : ""}`}
                right={by[b.name] == null ? "past Year 40" : span(by[b.name]!)}
              />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/** The one observation open at Year 0, offered on Fomalhaut's lead: a tap queues it, or takes it out. */
export function Look() {
  const { plan, change } = usePlan();
  const queued = plan.observe.includes(FOMALHAUT.name);
  const secs = Math.round((FOMALHAUT.lands * MS_PER_YEAR) / 1000);
  return (
    <button
      onClick={() => change(toggleLook)}
      aria-pressed={queued}
      className={`group flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${queued ? "border-other bg-other/10" : "border-other/50 hover:bg-other/5"}`}
    >
      <Mark n={queued ? 0 : null} look />
      <span className="min-w-0 grow text-[14px] leading-snug">
        {queued ? "Queued: image Fomalhaut again" : FOMALHAUT.name}
        <span className="block text-[12px] text-muted">It lands {secs} seconds after we begin.</span>
      </span>
      <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">Year {FOMALHAUT.lands}</span>
    </button>
  );
}
