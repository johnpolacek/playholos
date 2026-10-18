import { useGame } from "@/components/game-provider";
import { useLeaveShell, useReplan } from "@/components/wake";
import { Queue } from "@/components/queue";
import { realTime } from "@/lib/game/clock";

// The Projects tab: the queue, and before Begin a way back to Planning to change it. Begin itself is in the top bar.
export function Projects() {
  const { save, year, newGame } = useGame();
  const leaveShell = useLeaveShell();
  const replan = useReplan();
  if (!save) return null;

  return (
    <>
      <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
        {year === null ? (
          <>
            <span>Nothing has started</span>
            <span className="text-xs text-muted">Everything queued starts at Year 0, the moment you begin.</span>
          </>
        ) : (
          <>
            <span>Year 0 has begun</span>
            <span className="text-xs text-muted">
              <span className="font-mono tabular-nums">{realTime(year)}</span> since you began
            </span>
          </>
        )}
      </div>
      <Queue />
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4 pb-4">
        {year === null && (
          <button onClick={replan} className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper">
            Change plan
          </button>
        )}
        <button onClick={() => leaveShell(newGame)} className="h-9 rounded-full border border-ink text-sm">
          New game
        </button>
      </div>
    </>
  );
}
