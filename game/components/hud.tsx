"use client";

import { useGame } from "@/components/game-provider";
import { realTime, tenths, YEAR_0 } from "@/lib/game/clock";

// Placeholder values: the mock's screen before Year 0. Real resources replace them.
const BEFORE_YEAR_0 = { energy: 1, matter: "20 kt", compute: 0 };

function Meter({ label, pct }: { label: string; pct: number }) {
  return (
    <span className="flex flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
      {label}
      <b className="h-1 bg-track">
        <s className="block h-1 bg-fill2" style={{ width: `${pct}%` }} />
      </b>
    </span>
  );
}

export function Hud() {
  const { save, year } = useGame();
  const { energy, matter, compute } = BEFORE_YEAR_0;
  const y = year === null ? null : tenths(year);
  // Tall: Earth and the Year, then the meters below. Wide: one band, the meters between Earth and the Year.
  return (
    <header
      data-shell="top"
      className="grid shrink-0 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-b border-faint bg-paper px-4 pt-4 pb-3 wide:col-span-2 wide:grid-cols-[auto_1fr_auto] wide:gap-x-10 wide:px-6 wide:py-3"
    >
      <span className="flex items-center gap-2 text-xl font-semibold">
        <i className="size-2.5 rounded-full bg-you" />
        Earth
      </span>
      <span data-year className="text-right text-[15px] font-medium wide:col-start-3">
        {!save ? "" : y === null ? YEAR_0 : `Year ${y}`}
      </span>
      <span className="text-xs text-muted">Sol</span>
      <span className="text-right text-xs text-muted wide:col-start-3">
        {!save ? null : y === null ? (
          "The clock starts when you begin"
        ) : (
          <>
            {(YEAR_0 + y).toFixed(1)} · 1 Year = <span className="font-mono tabular-nums">{realTime(1)}</span>
          </>
        )}
      </span>
      <div className="col-span-2 mt-1 grid grid-cols-3 gap-2.5 wide:col-span-1 wide:col-start-2 wide:row-span-2 wide:row-start-1 wide:mt-0 wide:w-full wide:max-w-[520px] wide:self-center wide:justify-self-center">
        <Meter label="ENERGY" pct={energy} />
        <span className="flex flex-col gap-[3px] text-[10px] tracking-[.08em] text-muted">
          MATTER
          <em className="font-mono text-xs leading-tight font-semibold text-ink not-italic">{matter}</em>
        </span>
        <Meter label="COMPUTE" pct={compute} />
      </div>
    </header>
  );
}
