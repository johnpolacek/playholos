"use client";

import { useState } from "react";
import { useGame } from "@/components/game-provider";
import { useLeaveShell } from "@/components/wake";
import { seenYearZero, YearZero } from "@/components/year-zero";
import { Queue } from "@/components/queue";
import { realTime } from "@/lib/game/clock";

// Begin: Year 0 starts at the tap, and the clock runs from then, offline too. Settled 2026-10-10. The tap plays 2040
// becoming Year 0, over the screen the first time and in the top bar after.
export function Begin() {
  const { save, year, begin, newGame } = useGame();
  const leaveShell = useLeaveShell();
  const [moment, setMoment] = useState<"full" | "roll" | null>(null);
  if (!save) return null;
  const zero = <YearZero on={!!moment} full={moment === "full"} onDone={() => setMoment(null)} />;

  if (year === null) {
    return (
      <>
        <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
          <span>Nothing has started</span>
          <span className="text-xs text-muted">Everything queued starts at Year 0, the moment you begin.</span>
        </div>
        <Queue />
        <div className="mt-auto mb-3 pt-4">
          <div className="rounded-xl border border-l-[3px] border-frame border-l-you bg-paper px-[11px] py-[9px] text-[12.5px] leading-[1.4]">
            <span className="mb-0.5 block font-mono text-[9.5px] tracking-[.08em] text-you">THE MIND</span>
            Nothing here sends anything. When you begin, one Year passes every five of your minutes, and we keep going
            while you’re away.
          </div>
        </div>
        <button
          onClick={() => {
            setMoment(seenYearZero() ? "roll" : "full");
            begin();
          }}
          className="mb-2 h-[46px] shrink-0 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          Begin · Year 0 starts now
        </button>
        <button
          onClick={() => leaveShell(newGame)}
          className="mb-4 h-9 shrink-0 rounded-full border border-ink text-sm"
        >
          New game
        </button>
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
        <span>Year 0 has begun</span>
        <span className="text-xs text-muted">
          <span className="font-mono tabular-nums">{realTime(year)}</span> since you began
        </span>
      </div>
      <Queue />
      <button
        onClick={() => leaveShell(newGame)}
        className="mt-auto mb-4 h-9 shrink-0 rounded-full border border-ink text-sm"
      >
        New game
      </button>
      {zero}
    </>
  );
}
