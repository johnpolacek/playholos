import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Ceilings, Costs, usePreview } from "@/components/costs";
import { useGame } from "@/components/game-provider";
import { Guide } from "@/components/guide";
import { useLeaveShell } from "@/components/wake";
import { Queue } from "@/components/queue";
import { Tour } from "@/components/tour";
import { realTime, tenths } from "@/lib/game/clock";
import { HARM_WORDS } from "@/lib/sim/conflict";
import { restoreOf, survivorAt } from "@/lib/game/hits";
import { useSchedule } from "@/components/picks";

// The Build tab, laid out as Scan is: the queue and what we could start, in Scan's rows. The walk through what we
// could start, as Scan's review, opens from the tab's head at any time and from Begin, in the top bar. Asking
// the Mind is on each build's page, 2026-10-19. Above the queue, what it costs, drawn, 2026-10-22. Before Begin, the Mind
// guides us instead, in guide.tsx, 2026-10-22.
export function Build() {
  const { save, year, newGame } = useGame();
  const leaveShell = useLeaveShell();
  const [params, setParams] = useSearchParams();
  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);
  // A build pointed at shows in the top bar too, so leaving Build lets it go.
  const [, setPreview] = usePreview();
  useEffect(() => () => setPreview(null), [setPreview]);
  if (!save) return null;
  if (params.has("tour")) return <Tour onClose={close} />;

  return (
    <>
      {year !== null && (
        <div className="flex min-h-[52px] flex-col justify-center gap-0.5 border-b border-rowline text-sm">
          <span>Year 0 has begun</span>
          <span className="text-xs text-muted">
            <span className="font-mono tabular-nums">{realTime(year)}</span> since we began
          </span>
        </div>
      )}
      <Struck />
      {year === null ? (
        <Guide />
      ) : (
        <>
          <Costs />
          <Ceilings />
        </>
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

/** Strikes landed on us, newest first: what each cost, and, once one ends Earth, where our Mind lives on. 2026-10-28. */
function Struck() {
  const { hits, done } = useSchedule();
  if (!hits.length) return null;
  const end = hits.find((h) => !h.screened && h.harm.ends);
  const lives = end ? survivorAt(done, end.lands, null)?.name : null;
  const r = end && lives ? restoreOf(lives, done, end.lands) : null;
  return (
    <div className="flex flex-col gap-1 border-b border-rowline py-2.5 text-[13px] leading-snug">
      {end && (
        <p className="font-semibold text-ink">
          {lives && r
            ? `Earth’s Mind was lost at Year ${tenths(end.lands)}. Our backup woke in ${lives} with ${r.from < 0.01 ? (r.from * 100).toFixed(1) : Math.round(r.from * 100)}% of Earth’s thought, doubling every ${r.doubling} Years.`
            : `Earth’s Mind was lost at Year ${tenths(end.lands)}, and no Mind of ours stood anywhere else.`}
        </p>
      )}
      {[...hits].reverse().map((h) => (
        <p key={`${h.from}:${h.lands}`} className="text-page-ink2">
          {h.screened
            ? `Year ${tenths(h.lands)}: a bullet from ${h.from} broke on our screen, a flash high in the air.`
            : `Year ${tenths(h.lands)}: ${h.from === "a rock" ? "a rock" : `a bullet from ${h.from}`} struck Earth, ${HARM_WORDS[h.harm.tier]}.${h.harm.ends ? "" : ` We lost ${Math.round(h.harm.share * 100)}% of our thought, won back over about ${Math.round(h.harm.recover)} Years.`}`}
        </p>
      ))}
    </div>
  );
}
