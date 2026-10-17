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
  return (
    <header data-shell="top" className="flex shrink-0 flex-col gap-1.5 border-b border-faint px-4 pt-4 pb-3">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-xl font-semibold">
          <i className="size-2.5 rounded-full bg-you" />
          Earth
        </span>
        <span className="text-[15px] font-medium">{!save ? "" : y === null ? "Before Year 0" : `Year ${y}`}</span>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>Sol</span>
        {!save ? null : y === null ? (
          <span>The clock starts when you begin</span>
        ) : (
          <span>
            {(YEAR_0 + y).toFixed(1)} · 1 Year = <span className="font-mono tabular-nums">{realTime(1)}</span>
          </span>
        )}
      </div>
      <div className="mt-1 grid grid-cols-3 gap-2.5">
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
