import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Begin } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { Menu } from "@/components/menu";
import { useShown } from "@/components/costs";
import { usePlan, useSchedule } from "@/components/picks";
import { Link } from "react-router";
import { Quiet } from "@/components/quiet";
import { announceJump, Arrived, type Snap, Specks, useJumpYear, useSnap, Warp } from "@/components/jump";
import { tenths, yearText } from "@/lib/game/clock";
import { ceiling, drawAt, kt, matterAt, ordered, schedule, searchOf, sharesAt, shortAt } from "@/lib/game/plan";
import { combedAt } from "@/lib/sim/works";
import { knownQuery } from "@/lib/game/known-query";

// What we have, from our order: matter we hold in orbit, growing with lift and less what our builds take, since
// 2026-10-20. Energy, the share of Earth's that our compute draws, and compute, how much of ours is at work, since
// 2026-10-21. Each with its number and a word under it, and energy with where Thought Fields takes it
// before the grid is full, from explorations/build-costs.html, 2026-10-22. Compute counts as Build's Mind does, what our
// builds can use, at work or idle, and never says spare, 2026-10-22. A build pointed at on Build shows here as if queued,
// in our blue, 2026-10-22.

const pct = (x: number) => `${Math.round(x * 100)}%`;

function Meter({
  label,
  at,
  to,
  value,
  sub,
  late = false,
  hint = false,
  go,
}: {
  label: string;
  at?: number;
  /** Where it is headed, dashed past where it is. */
  to?: number;
  value: string;
  sub: string;
  late?: boolean;
  /** Where its word under it leads, marked as a link. */
  go?: string;
  hint?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
      {label}
      {at !== undefined && (
        <b className="relative h-1 bg-track">
          <s
            className="absolute inset-y-0 left-0 bg-fill2 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${at * 100}%` }}
          />
          {to !== undefined && to > at && (
            <i
              className="absolute inset-y-0 border-y border-dashed border-muted/70"
              style={{ left: `${at * 100}%`, width: `${(to - at) * 100}%` }}
            />
          )}
        </b>
      )}
      <em className={`font-mono text-xs leading-tight font-semibold tracking-normal not-italic ${hint ? "text-you" : "text-ink"}`}>{value}</em>
      {go ? (
        <Link to={go} className="truncate text-[11px] leading-tight tracking-normal text-you hover:underline">
          {sub} ›
        </Link>
      ) : (
        <span className={`truncate text-[11px] leading-tight tracking-normal ${late ? "text-other" : ""}`}>{sub}</span>
      )}
    </span>
  );
}

/** The next stop, shared so the Mind's note on the map can offer the same jump as the pill. 2026-11-02. */
export type Ahead = { to: number; why: string | null; go(): void };
let ahead: Ahead | null = null;
const heed = new Set<() => void>();
function setAhead(a: Ahead | null) {
  ahead = a;
  heed.forEach((f) => f());
}
export const useAhead = () =>
  useSyncExternalStore(
    (f) => (heed.add(f), () => void heed.delete(f)),
    () => ahead,
    () => null,
  );

/** The skip: the next Year something new happens, from the server, which says when, never what. A tap jumps there.
 *  The clock still runs at 5 minutes a Year without it. 2026-10-29. */
function Skip() {
  const { save, year, skipTo } = useGame();
  // A skip past a long quiet says what passed. 2026-10-30.
  const [leap, setLeap] = useState<{ from: number; to: number; snap: Snap } | null>(null);
  const snapshot = useSnap();
  const [why, setWhy] = useState<string | null>(null);
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  // Undefined while we ask, null once the server says nothing comes. 2026-10-30.
  const [next, setNext] = useState<number | null | undefined>(undefined);
  const [hover, setHover] = useState(false);
  const seed = save?.seed;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const query = useMemo(() => knownQuery(save, tenth), [tenth, save?.plan, save?.will]);
  useEffect(() => {
    if (seed === undefined || tenth === null) return;
    let live = true;
    fetch(`/api/next?seed=${seed}&${query}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (v: { next: number | null; why?: string | null } | null) => {
          if (!live) return;
          setNext(v ? v.next : undefined);
          setWhy(v?.why ?? null);
        },
        () => live && setNext(undefined),
      );
    return () => void (live = false);
  }, [seed, query, tenth]);
  const quiet = leap && (
    <Quiet key={leap.to} from={leap.from} to={leap.to} onClose={() => setLeap(null)}>
      <Arrived from={leap.from} to={leap.to} snap={leap.snap} />
    </Quiet>
  );
  const stale = tenth === null || next === undefined || (next !== null && next <= tenth);
  // Shown and landed in tenths, as the Year is: a stop within the tenth we're in lands on the next tenth.
  const to = stale || next === null ? null : Math.max(Math.ceil(next * 10 - 1e-9) / 10, tenth + 0.1);
  const jump = () => {
    if (to === null || tenth === null) return;
    setLeap({ from: tenth, to, snap: snapshot() });
    announceJump(year ?? tenth, to);
    skipTo(to);
  };
  const go = useRef(jump);
  useEffect(() => void (go.current = jump));
  useEffect(() => {
    setAhead(to === null ? null : { to, why, go: () => go.current() });
    return () => setAhead(null);
  }, [to, why]);
  // A stop behind us is stale, while the server answers for the Year we skipped to.
  if (stale) return quiet;
  // The link vanished with no word until 2026-10-30, and players thought it broke.
  if (next === null)
    return (
      <>
        <span className="ml-2 text-muted" title="Nothing new comes in the next 100,000 Years unless we order it. The clock runs on.">
          Nothing ahead
        </span>
        {quiet}
      </>
    );
  if (to === null) return quiet;
  return (
    <>
      {/* A pill with faint specks of light, named for what it does: "Next" read as unclear in play. 2026-11-01. */}
      <button
        onClick={jump}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        // Filled, as the one move on a quiet screen: as a faint outline it read as a status. Playtest 2026-11-02.
        className="relative -my-1 ml-2 inline-flex h-7 items-center rounded-full bg-you px-3 text-[12.5px] font-medium text-paper transition-[filter] hover:brightness-110"
        title="Jump ahead to when something new happens"
      >
        <Specks on={hover} tone="--paper" />
        Jump to {yearText(to)}
        {why && <span className="ml-1.5 font-normal text-paper/75">· {why}</span>}
        <span className="ml-1">›</span>
      </button>
      {quiet}
    </>
  );
}

/** Whether anything we ordered still rises, and the Year the last was done. Once nothing rises, the clock holds until
 *  we order a build or play on, so our compute never sits idle unseen: at Year 198 it had sat idle since Year 15,
 *  with 16 builds open. Playtest 2026-11-02. */
export function useIdleNow() {
  const { save, year } = useGame();
  const { plan } = usePlan();
  // Not until Earth's past has loaded, which sets how fast we build.
  const { done, past } = useSchedule();
  const names = ordered(plan);
  const rising = year !== null && names.some((n) => done[n] == null || done[n]! > year);
  const last = Math.max(0, ...names.flatMap((n) => (done[n] == null ? [] : [done[n]!])));
  return { idle: year !== null && !!past && !rising, held: save?.held !== undefined, last };
}

function useIdle() {
  const { save, hold, playOn } = useGame();
  const { idle, held, last } = useIdleNow();
  useEffect(() => {
    // Not on a refuge's slow clock, where the sky's Years run on their own.
    if (idle && !held && !save?.will && (save?.heldFor ?? -1) < last) hold(last);
    if (held && !idle) playOn();
  }, [idle, held, last, save?.heldFor, save?.will, hold, playOn]);
  return { idle, held };
}

/** The clock held, as nothing is building: what to do, under the Year. */
function Held() {
  const { playOn } = useGame();
  return (
    <span className="ml-2 inline-flex items-baseline gap-2 text-[12.5px]">
      <span className="text-ink">Paused, nothing building.</span>
      <Link to="/build" className="text-you hover:underline">
        Build ›
      </Link>
      <button onClick={playOn} className="text-muted hover:text-ink">
        Play on
      </button>
    </span>
  );
}

export function Hud() {
  const { save, year } = useGame();
  const { idle, held } = useIdle();
  const { scale } = useSchedule();
  const { shown: plan, adding } = useShown();
  const done = useMemo(() => schedule(plan, scale), [plan, scale]);
  const hint = !!adding;
  const y = year === null ? null : tenths(year);
  // Through a jump, the Year counts up. 2026-11-01.
  const shown = useJumpYear(year);
  const now = Math.max(0, y ?? 0);
  const matter = matterAt(plan, done, now);
  const short = shortAt(plan, done, now);
  const { energy, compute } = useMemo(() => drawAt(plan, scale, now), [plan, scale, now]);
  const share = useMemo(() => sharesAt(plan, scale, now), [plan, scale, now]);
  // Thought Fields grows our compute a campus at a time, until the grid is full.
  const top = useMemo(() => ceiling(plan, scale), [plan, scale]);
  const full = ordered(plan).includes("Thought Fields") ? top.campuses.at(-1) : undefined;
  const most = top.step ** top.campuses.length / top.room;
  const over = share.short > 0.005;
  // In play, idle compute combs old recordings until it catches up with the present. 2026-10-28.
  const searched = useMemo(() => searchOf(plan, scale), [plan, scale]);
  const searching = y !== null && combedAt(searched, now) < now - 0.05;
  // Tall: the menu's galaxy and the Year, then the meters below. Wide: one band, the meters between the galaxy and the Year.
  return (
    <header
      data-shell="top"
      className="relative grid shrink-0 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-b border-faint bg-paper px-4 pt-4 pb-3 wide:col-span-2 wide:grid-cols-[auto_1fr_auto] wide:gap-x-10 wide:px-6 wide:py-3"
    >
      <div className="row-span-2 self-center">
        <Menu />
        <Warp />
      </div>
      <span data-year className="text-right text-[15px] font-medium wide:col-start-3">
        {/* To hundredths, so the Year visibly ticks, a hundredth every 3 seconds, and the pace needs no words. 2026-11-01. */}
        {!save ? "" : `Year ${Math.max(0, shown ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </span>
      <span className="text-right text-xs text-muted wide:col-start-3">
        {/* Before Begin, the count of what we would do first, which opens Begin. */}
        {save && y !== null && (
          <>
            {/* The calendar year and the pace read as noise beside the Year. Removed 2026-11-01. */}
            {held ? <Held /> : <Skip />}
          </>
        )}
        <Begin />
      </span>
      <div className="col-span-2 mt-1 grid grid-cols-3 gap-2.5 wide:col-span-1 wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:mt-0 wide:w-full wide:max-w-[520px] wide:self-center wide:justify-self-center">
        <Meter
          label="ENERGY"
          hint={hint}
          at={energy}
          to={full !== undefined && now < full ? most : undefined}
          value={pct(energy)}
          sub={full === undefined ? "of the grid" : now < full ? `${pct(most)} by Year ${Math.round(full)}` : "grid full"}
        />
        <Meter
          label="MATTER"
          hint={hint}
          value={kt(matter)}
          sub={short > 0 ? `${Math.round(short * 10) / 10} kt short` : "in orbit"}
          late={short > 0}
        />
        <Meter
          label="COMPUTE"
          hint={hint}
          at={compute}
          value={over ? `${pct(1 + share.short)} needed` : `${pct(compute)} at work`}
          sub={over ? `${pct(share.short)} short` : idle ? "nothing building" : compute < 0.995 ? `${pct(1 - compute)} ${searching ? "searching" : "idle"}` : "none idle"}
          late={over}
          go={idle && !over ? "/build" : undefined}
        />
      </div>
    </header>
  );
}
