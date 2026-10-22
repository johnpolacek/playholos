import { useMemo } from "react";
import { Begin } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { Menu } from "@/components/menu";
import { usePlan, useSchedule } from "@/components/picks";
import { realTime, tenths, YEAR_0 } from "@/lib/game/clock";
import { ceiling, drawAt, kt, matterAt, sharesAt, shortAt } from "@/lib/game/plan";

// What we have, from our order: matter we hold in orbit, growing with lift and less what our builds take, since
// 2026-10-20. Energy, the share of Earth's that our compute draws, and compute, how much of ours is at work, since
// 2026-10-21. Each with its number and a word under it, and energy with where Thought Fields takes it
// before the grid is full, from explorations/build-costs.html, 2026-10-22.

const pct = (x: number) => `${Math.round(x * 100)}%`;

function Meter({
  label,
  at,
  to,
  value,
  sub,
  late = false,
}: {
  label: string;
  at?: number;
  /** Where it is headed, dashed past where it is. */
  to?: number;
  value: string;
  sub: string;
  late?: boolean;
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
      <em className="font-mono text-xs leading-tight font-semibold tracking-normal text-ink not-italic">{value}</em>
      <span className={`truncate text-[11px] leading-tight tracking-normal ${late ? "text-other" : ""}`}>{sub}</span>
    </span>
  );
}

export function Hud() {
  const { save, year } = useGame();
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const y = year === null ? null : tenths(year);
  const now = Math.max(0, y ?? 0);
  const matter = matterAt(plan, done, now);
  const short = shortAt(plan, done, now);
  const { energy } = useMemo(() => drawAt(plan, scale, now), [plan, scale, now]);
  const share = useMemo(() => sharesAt(plan, scale, now), [plan, scale, now]);
  // Thought Fields grows our compute a campus at a time, until the grid is full.
  const top = useMemo(() => ceiling(plan, scale), [plan, scale]);
  const full = plan.builds.includes("Thought Fields") ? top.campuses.at(-1) : undefined;
  const most = top.step ** top.campuses.length / top.room;
  const over = share.short > 0.005;
  // Tall: the menu's galaxy and the Year, then the meters below. Wide: one band, the meters between the galaxy and the Year.
  return (
    <header
      data-shell="top"
      className="grid shrink-0 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-b border-faint bg-paper px-4 pt-4 pb-3 wide:col-span-2 wide:grid-cols-[auto_1fr_auto] wide:gap-x-10 wide:px-6 wide:py-3"
    >
      <div className="row-span-2 self-center">
        <Menu />
      </div>
      <span data-year className="text-right text-[15px] font-medium wide:col-start-3">
        {!save ? "" : y === null ? YEAR_0 : `Year ${y}`}
      </span>
      <span className="text-right text-xs text-muted wide:col-start-3">
        {/* Before Begin, the count of what we would do first, which opens Begin. */}
        {save && y !== null && (
          <>
            {(YEAR_0 + y).toFixed(1)} · 1 Year = <span className="font-mono tabular-nums">{realTime(1)}</span>
          </>
        )}
        <Begin />
      </span>
      <div className="col-span-2 mt-1 grid grid-cols-3 gap-2.5 wide:col-span-1 wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:mt-0 wide:w-full wide:max-w-[520px] wide:self-center wide:justify-self-center">
        <Meter
          label="ENERGY"
          at={energy}
          to={full !== undefined && now < full ? most : undefined}
          value={pct(energy)}
          sub={full === undefined ? "of Earth’s" : now < full ? `${pct(most)} by Year ${Math.round(full)}` : "grid full"}
        />
        <Meter
          label="MATTER"
          value={kt(matter)}
          sub={short > 0 ? `${Math.round(short * 10) / 10} kt short` : "in orbit"}
          late={short > 0}
        />
        <Meter
          label="COMPUTE"
          at={1 - share.idle}
          value={over ? `${pct(1 + share.short)} needed` : `${pct(1 - share.idle)} at work`}
          sub={over ? `${pct(share.short)} short` : share.idle > 0.005 ? `${pct(share.idle)} idle` : `${pct(share.spare)} spare`}
          late={over}
        />
      </div>
    </header>
  );
}
