import { useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { useGame } from "@/components/game-provider";
import { Advice } from "@/components/picks";
import { useLeaveShell } from "@/components/wake";
import { Queue } from "@/components/queue";
import { Tour } from "@/components/tour";
import { realTime } from "@/lib/game/clock";

// The Projects tab: the queue, and before Begin, planning it, alone or with the Mind's tour. Begin itself is in the
// top bar.
export function Projects() {
  const { save, year, newGame } = useGame();
  const leaveShell = useLeaveShell();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  if (!save) return null;
  if (params.has("tour")) return <Tour onClose={close} />;
  const queued = !!save.plan?.builds.length;

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
      {year === null && (
        <Link
          to="/projects?tour"
          className="mt-3 flex items-center gap-3 rounded-xl border border-you/50 px-3 py-2.5 transition-colors hover:bg-you/10"
        >
          <svg width={14} height={14} viewBox="-7 -7 14 14" aria-hidden className="shrink-0">
            <circle r={6} fill="none" className="stroke-you" />
            <path d="M-1.8 -3 L3 0 L-1.8 3 Z" className="fill-you" />
          </svg>
          <span className="flex min-w-0 grow flex-col">
            <span className="text-[14.5px] leading-snug">Queue our first builds</span>
            <span className="text-[12.5px] leading-snug text-page-ink2">With the Mind, one build at a time.</span>
          </span>
          <span
            className={`shrink-0 font-mono ${queued ? "text-[10.5px] tracking-[.06em] text-you" : "text-[14px] text-muted"}`}
          >
            {queued ? "DONE" : "→"}
          </span>
        </Link>
      )}
      {year === null && <Advice />}
      <Queue />
      <div className="mt-auto flex shrink-0 flex-col gap-2 pt-4 pb-4">
        <button onClick={() => leaveShell(newGame)} className="h-9 rounded-full border border-ink text-sm">
          New game
        </button>
      </div>
    </>
  );
}
