import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Begin } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { Menu } from "@/components/menu";
import { useShown } from "@/components/costs";
import { usePlan, useSchedule } from "@/components/picks";
import { Link } from "react-router";
import {
  announceJump,
  setLeap,
  Specks,
  useJumpYear,
  useSnap,
  Warp,
} from "@/components/jump";
import { tenths, yearText } from "@/lib/game/clock";
import { deuteriumAt, inOrder } from "@/lib/game/reach";
import { CATALOG } from "@/lib/sim/works";
import {
  ceiling,
  drawAt,
  kt,
  matterAt,
  ordered,
  schedule,
  searchOf,
  sharesAt,
  shortAt,
} from "@/lib/game/plan";
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
  tip,
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
  /** What its word means, on hover. */
  tip?: string;
  hint?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
      {/* A preview says so: a blind first-timer read a pointed-at build's numbers as real, twice. 2026-11-07. */}
      <span className="truncate">
        {label}
        {hint && (
          <span className="animate-fade text-you motion-reduce:animate-none">
            {" "}
            · IF ADDED
          </span>
        )}
      </span>
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
      <em
        className={`font-mono text-xs leading-tight font-semibold tracking-normal not-italic transition-colors duration-300 ${hint ? "text-you" : "text-ink"}`}
      >
        {value}
      </em>
      {go ? (
        <Link
          to={go}
          className="truncate text-[11px] leading-tight tracking-normal text-you hover:underline"
        >
          {sub} ›
        </Link>
      ) : (
        <span
          title={tip}
          className={`truncate text-[11px] leading-tight tracking-normal ${late ? "text-other" : ""}`}
        >
          {sub}
        </span>
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
  const snapshot = useSnap();
  const [why, setWhy] = useState<string | null>(null);
  const tenth = year === null ? null : Math.floor(year * 10) / 10;
  // Undefined while we ask, null once the server says nothing comes. 2026-10-30.
  const [next, setNext] = useState<number | null | undefined>(undefined);
  const [hover, setHover] = useState(false);
  const seed = save?.seed;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const query = useMemo(
    () => knownQuery(save, tenth),
    [tenth, save?.plan, save?.will],
  );
  useEffect(() => {
    if (seed === undefined || tenth === null) return;
    let live = true;
    fetch(`/api/next?seed=${seed}`, {
      method: "POST",
      body: new URLSearchParams(query),
    })
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
  const stale =
    tenth === null || next === undefined || (next !== null && next <= tenth);
  // Shown and landed in tenths, as the Year is: a stop within the tenth we're in lands on the next tenth.
  const to =
    stale || next === null
      ? null
      : Math.max(Math.ceil(next * 10 - 1e-9) / 10, tenth + 0.1);
  // A beat after each jump before the next: a reflex second tap flew a blind first-timer 3.9 Years past the biggest
  // news, and the card it replaced went unread. 2026-11-07.
  const [rest, setRest] = useState(false);
  useEffect(() => {
    if (!rest) return;
    const t = setTimeout(() => setRest(false), 1500);
    return () => clearTimeout(t);
  }, [rest]);
  const jump = () => {
    if (to === null || tenth === null || rest) return;
    setRest(true);
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
  if (stale) return null;
  // The link vanished with no word until 2026-10-30, and players thought it broke.
  if (next === null)
    return (
      <span
        className="ml-2 text-muted"
        title="Nothing new comes in the next 100,000 Years unless we order it. The clock runs on."
      >
        Nothing ahead
      </span>
    );
  if (to === null) return null;
  return (
    <>
      {/* A pill with faint specks of light, named for what it does: "Next" read as unclear in play. 2026-11-01. */}
      <button
        onClick={jump}
        disabled={rest}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        // Filled, as the one move on a quiet screen: as a faint outline it read as a status. Playtest 2026-11-02.
        className="relative -my-1 ml-2 inline-flex h-7 items-center rounded-full bg-you px-3 text-[12.5px] font-medium text-paper transition-[filter,opacity] hover:brightness-110 disabled:opacity-60"
        title="Jump ahead to when something new happens"
      >
        <Specks on={hover} tone="--paper" />
        {/* What comes next, never its Year, so a finding stays a surprise till it lands: "Jump to 579.5 · something new in
            the sky" read as cryptic. The long quiet says the Years once we're there. 2026-11-04. */}
        Jump to {why ?? "what comes next"}
        <span className="ml-1">›</span>
      </button>
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
  const rising =
    year !== null && names.some((n) => done[n] == null || done[n]! > year);
  const last = Math.max(
    0,
    ...names.flatMap((n) => (done[n] == null ? [] : [done[n]!])),
  );
  // The latest build done by now, and whether it left our compute mostly unused.
  const ended =
    year === null
      ? -1
      : Math.max(
          -1,
          ...names.flatMap((n) =>
            done[n] != null && done[n]! <= year ? [done[n]!] : [],
          ),
        );
  const { scale } = useSchedule();
  const now = tenths(year ?? 0);
  const compute = useMemo(
    () => drawAt(plan, scale, now).compute,
    [plan, scale, now],
  );
  const spare =
    year !== null && !!past && rising && ended >= 0 && compute < SPARE;
  return {
    idle: year !== null && !!past && !rising,
    spare,
    held: save?.held !== undefined,
    last,
    ended,
  };
}

/** Below this share of our compute at work, a build finishing holds the clock, as the Mind's note on the map has it. */
const SPARE = 0.8;

function useIdle() {
  const { save, hold, playOn } = useGame();
  const { plan } = usePlan();
  const { idle, spare, held, last, ended } = useIdleNow();
  // A build finishing that leaves most of our compute unused holds the clock too, until we order another or play on:
  // at Year 2 our compute fell to 39% at work and ran on for Years unseen. Playtest 2026-11-07.
  const count = ordered(plan).length;
  const at = useRef<number | null>(null);
  useEffect(() => {
    // Not on a refuge's slow clock, where the sky's Years run on their own.
    if (
      !held &&
      !save?.will &&
      (save?.heldFor ?? -1) < (idle ? last : ended) &&
      (idle || spare)
    ) {
      at.current = count;
      hold(idle ? last : ended);
      return;
    }
    if (!held) return;
    at.current ??= count;
    // Released once a build rises again, or we order one, even if it leaves compute to spare.
    if (!idle && (!spare || count > at.current)) playOn();
  }, [
    idle,
    spare,
    held,
    last,
    ended,
    count,
    save?.heldFor,
    save?.will,
    hold,
    playOn,
  ]);
  return { idle, held };
}

/** The clock held, as nothing is building or a build left compute to spare: what to do, under the Year. */
function Held({ idle }: { idle: boolean }) {
  const { playOn } = useGame();
  return (
    <span className="ml-2 inline-flex items-baseline gap-2 text-[12.5px]">
      <span className="text-ink">
        {idle ? "Paused, nothing building." : "Paused, compute to spare."}
      </span>
      <Link to="/play/build" className="text-you hover:underline">
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
  // Our deuterium, once the Works is ordered: free stock, or the Year all we have sent for is in. 2026-11-07.
  const works = done["Deuterium Works"] ?? null;
  const fuel = inOrder(plan, "Deuterium Works") ? { d: deuteriumAt(plan, works, now) } : null;
  const { energy, compute } = useMemo(
    () => drawAt(plan, scale, now),
    [plan, scale, now],
  );
  const share = useMemo(() => sharesAt(plan, scale, now), [plan, scale, now]);
  // Thought Fields grows our compute a campus at a time, until the grid is full.
  const top = useMemo(() => ceiling(plan, scale), [plan, scale]);
  const full = ordered(plan).includes("Thought Fields")
    ? top.campuses.at(-1)
    : undefined;
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
      <span
        data-year
        className="text-right text-[15px] font-medium wide:col-start-3"
      >
        {/* To hundredths, so the Year visibly ticks, a hundredth every 3 seconds, and the pace needs no words. 2026-11-01. */}
        {!save
          ? ""
          : `Year ${Math.max(0, shown ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </span>
      <span className="text-right text-xs text-muted wide:col-start-3">
        {/* Before Begin, the count of what we would do first, which opens Begin. */}
        {save && y !== null && (
          <>
            {/* The calendar year and the pace read as noise beside the Year. Removed 2026-11-01. */}
            {held ? <Held idle={idle} /> : <Skip />}
          </>
        )}
        <Begin />
      </span>
      <div className={`col-span-2 mt-1 grid ${fuel ? "grid-cols-4" : "grid-cols-3"} gap-2.5 wide:col-span-1 wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:mt-0 wide:w-full wide:max-w-[520px] wide:self-center wide:justify-self-center`}>
        <Meter
          label="ENERGY"
          hint={hint}
          at={energy}
          to={full !== undefined && now < full ? most : undefined}
          value={pct(energy)}
          sub={
            full === undefined
              ? "of the grid"
              : now < full
                ? `${pct(most)} by Year ${Math.round(full)}`
                : "grid full"
          }
        />
        <Meter
          label="MATTER"
          hint={hint}
          value={kt(matter)}
          sub={
            short > 0 ? `${Math.round(short * 10) / 10} kt short` : "in orbit"
          }
          late={short > 0}
        />
        {fuel && (
          <Meter
            label="DEUTERIUM"
            hint={hint}
            at={fuel.d ? fuel.d.fill : 0}
            value={kt(fuel.d?.stock ?? 0)}
            sub={
              !fuel.d || works === null
                ? "Works not done"
                : works > now
                  ? `from Year ${Math.round(works)}`
                  : fuel.d.until !== null
                    ? `spoken for to Year ${yearText(fuel.d.until)}`
                    : `+${Math.round(CATALOG.deuterium.perYear)} kt a Year`
            }
            late={fuel.d?.until != null && !hint}
            tip={`The Deuterium Works makes ${Math.round(CATALOG.deuterium.perYear)} kt a Year. Each flyby probe draws ${CATALOG.probe.fuel} kt and each sentinel ${CATALOG.sentinel.fuel} kt, in the order sent.`}
            go={fuel.d?.until != null && !hint ? "/play/reach" : undefined}
          />
        )}
        <Meter
          label="COMPUTE"
          hint={hint}
          at={compute}
          value={
            over ? `${pct(1 + share.short)} needed` : `${pct(compute)} at work`
          }
          // Says what short means: a blind first-timer queued past our compute and never learned it slowed everything. 2026-11-07.
          sub={
            over
              ? `${pct(share.short)} short, builds slow`
              : idle && !hint
                ? "nothing building"
                : compute < 0.995
                  ? `${pct(1 - compute)} ${searching ? "searching" : "idle"}`
                  : "none idle"
          }
          // A preview's shortfall stays in the preview's blue: orange read as an alarm. Blind playtest 2026-11-07.
          late={over && !hint}
          // "Searching" said nothing on its own: a blind first-timer asked the Mind what it meant. 2026-11-07.
          tip={
            searching && !over && compute < 0.995
              ? "Compute our builds can’t use combs old recordings for signals no one caught."
              : undefined
          }
          go={idle && !over && !hint ? "/play/build" : undefined}
        />
      </div>
    </header>
  );
}
