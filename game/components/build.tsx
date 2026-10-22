import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { Ceilings, Costs, PreviewProvider } from "@/components/costs";
import { useGame } from "@/components/game-provider";
import { useLeaveShell } from "@/components/wake";
import { Queue } from "@/components/queue";
import { Tour } from "@/components/tour";
import { realTime } from "@/lib/game/clock";

// The Build tab, laid out as Scan is: the queue and what we could start, in Scan's rows. The walk through what we
// could start, as Scan's review, opens from the tab's head at any time and from Begin, in the top bar. Asking
// the Mind is on each build's page, 2026-10-19. Above the queue, what it costs, drawn, 2026-10-22.
export function Build() {
  const { save, year, newGame } = useGame();
  const leaveShell = useLeaveShell();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (!save) return null;
  if (params.has("tour")) return <Tour onClose={close} />;

  return (
    <PreviewProvider>
      {year !== null && (
        <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
          <span>Year 0 has begun</span>
          <span className="text-xs text-muted">
            <span className="font-mono tabular-nums">{realTime(year)}</span> since you began
          </span>
        </div>
      )}
      <Costs />
      <Ceilings />
      <Queue />
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4 pb-4">
        <button onClick={() => leaveShell(newGame)} className="h-9 rounded-full border border-ink text-sm">
          New game
        </button>
      </div>
    </PreviewProvider>
  );
}
