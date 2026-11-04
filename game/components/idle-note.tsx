import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useMindPick } from "@/components/catalog";
import { useGame } from "@/components/game-provider";
import { useAhead, useIdleNow } from "@/components/hud";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { tenths, yearText } from "@/lib/game/clock";
import { buildSlug, drawAt, orderLater, searchOf } from "@/lib/game/plan";
import { combedAt } from "@/lib/sim/works";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// Nothing building: the Mind says so on the map, in gold, and names the build it would start, with a button to start
// it and go to its page. The Mind only advises: the tap is the Will's order. It sat in Build's panel above the
// Catalog until 2026-11-02, when the Will asked for it on the map as the Mind's word, and a way to start the build.
// And when something builds but nothing needs us, it says what comes next and offers the jump there, and names a build
// for compute sitting idle: a reload into a quiet screen gave no clue what to do. Playtest 2026-11-02.

/** Idle compute worth a word: less than this at work. */
const SPARE = 0.8;

export function IdleNote() {
  const { year, orderAt, playOn } = useGame();
  const { idle, held, last } = useIdleNow();
  const { plan, change } = usePlan();
  const { scale } = useSchedule();
  const { standing } = useLeads();
  const ahead = useAhead();
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const now = tenths(year ?? 0);
  const { compute } = useMemo(() => drawAt(plan, scale, now), [plan, scale, now]);
  // Compute combing old recordings isn't idle.
  const searching = useMemo(() => combedAt(searchOf(plan, scale), now) < now - 0.05, [plan, scale, now]);
  const spare = !idle && !searching && compute < SPARE;
  const needs = Object.values(standing).some((s) => s === "needs");
  const quiet = !idle && !needs && (spare || ahead !== null);
  // Put away until the next time nothing builds, or the next stop.
  const key = idle ? `idle ${last}` : `next ${ahead?.to ?? ""}`;
  const [away, setAway] = useState<string | null>(null);
  const shown = year !== null && (idle || quiet) && away !== key && path !== "/mind";
  const pick = useMindPick(shown && (idle || spare));
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (shown && !prefersReducedMotion()) gsap.fromTo(root.current, riseFrom, rise);
    },
    { dependencies: [shown, idle] },
  );
  if (!shown) return null;
  const start = () => {
    if (!pick || orderAt === null) return;
    change(orderLater(pick.build.name, tenths(orderAt)));
    navigate(`/build/${buildSlug(pick.build.name)}`);
  };
  const what = pick ? `${pick.build.what.charAt(0).toLowerCase()}${pick.build.what.slice(1)}` : "";
  return (
    <div
      ref={root}
      role="status"
      className="absolute top-10 left-2.5 z-20 w-[min(400px,calc(100%-20px))] rounded-xl border border-other/50 bg-paper/90 pt-2 pr-2 backdrop-blur-sm"
    >
      <button onClick={() => setAway(key)} aria-label="Put away" className="absolute top-0 right-0 z-10 flex size-9 items-center justify-center text-muted hover:text-ink">
        <svg aria-hidden width="10" height="10" viewBox="0 0 12 12">
          <path d="M1.5 1.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <MindNote edge={false} className="pr-6 text-[13.5px] leading-[1.45]">
        {idle ? (
          <p>
            <span className="font-medium text-other">Our compute sits idle.</span>{" "}
            <span className="text-page-ink2">{held ? "Nothing is building, so the clock waits." : "Nothing is building."}</span>
          </p>
        ) : (
          <p>
            <span className="font-medium text-other">Nothing needs us now.</span>{" "}
            <span className="text-page-ink2">
              {ahead && <>Next, at Year {yearText(ahead.to)}{ahead.why ? `: ${ahead.why}` : ""}. </>}
              {spare && `${Math.round((1 - compute) * 100)}% of our compute sits idle.`}
            </span>
          </p>
        )}
        {pick && (
          <p className="mt-1 text-page-ink2">
            {pick.fit ? `For our ${pick.strategy} strategy, we would start ` : "We would start "}
            <b className="font-medium text-ink">{pick.build.name}</b>: {what}
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
          {pick && orderAt !== null && (
            <button
              onClick={start}
              className="h-8 rounded-full bg-other px-4 text-[13px] font-medium text-paper transition-[filter] hover:brightness-110"
            >
              Start {pick.build.name}
            </button>
          )}
          {!idle && ahead && (
            <button
              onClick={ahead.go}
              className={`h-8 rounded-full px-4 text-[13px] font-medium transition-[filter] hover:brightness-110 ${pick ? "border border-you/60 text-you" : "bg-you text-paper"}`}
            >
              Jump to {yearText(ahead.to)} ›
            </button>
          )}
          <Link to="/build" className="text-[12.5px] text-you hover:underline">
            See the Catalog ›
          </Link>
          {held && (
            <button onClick={playOn} className="text-[12.5px] text-muted hover:text-ink">
              Play on
            </button>
          )}
        </div>
      </MindNote>
    </div>
  );
}
