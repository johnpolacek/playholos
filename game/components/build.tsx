import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { Advice } from "@/components/picks";
import { useLeaveShell } from "@/components/wake";
import { Queue } from "@/components/queue";
import { Tour } from "@/components/tour";
import { realTime } from "@/lib/game/clock";

// The Build tab: the Mind's note to decide what's next with it, and the queue. The Mind's tour opens from Begin,
// in the top bar.
export function Build() {
  const { save, year, newGame } = useGame();
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
      <Advice />
      <Queue />
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4 pb-4">
        <button onClick={() => leaveShell(newGame)} className="h-9 rounded-full border border-ink text-sm">
          New game
        </button>
      </div>
    </>
  );
}
