import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { usePlan } from "@/components/picks";
import { useLeaveShell } from "@/components/wake";
import { Queue } from "@/components/queue";
import { Walk } from "@/components/tab-head";
import { Tour } from "@/components/tour";
import { realTime } from "@/lib/game/clock";

// The Build tab, laid out as Scan is: the Mind's walk through what it would start with, as Scan's review, then the
// queue and what we could start, in Scan's rows. The walk opens from here and from Begin, in the top bar. Asking the
// Mind is on each build's page, 2026-10-19.
export function Build() {
  const { save, year, newGame } = useGame();
  const { plan } = usePlan();
  const leaveShell = useLeaveShell();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (!save) return null;
  if (params.has("tour")) return <Tour onClose={close} />;

  return (
    <>
      {year !== null && (
        <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
          <span>Year 0 has begun</span>
          <span className="text-xs text-muted">
            <span className="font-mono tabular-nums">{realTime(year)}</span> since you began
          </span>
        </div>
      )}
      {(year === null || !plan.builds.length) && (
        <Walk
          to="/build?tour"
          title="Queue our first builds"
          line="With the Mind, one build at a time."
          done={plan.builds.length > 0}
        />
      )}
      <Queue />
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4 pb-4">
        <button onClick={() => leaveShell(newGame)} className="h-9 rounded-full border border-ink text-sm">
          New game
        </button>
      </div>
    </>
  );
}
