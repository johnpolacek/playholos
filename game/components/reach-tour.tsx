import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildTone } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { axis, farZoom, Thread, useReach, VOYAGER, year, Years } from "@/components/reach";
import { Thread as Stops } from "@/components/review";
import { useStepTap } from "@/components/scan";
import { LIGHT_HOUR_AU, LY_AU, NEAREST, roads, zoomFor } from "@/lib/game/reach";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// How we reach, the third of the four things we would do before Begin, 2026-10-23. Scan's review shows what is out
// there, and this shows how we would get there: how far we have gone, the gap to the nearest star, and the two roads
// open at Year 0. It explains the roads and queues neither, since a road is a build and Build's step queues them. The
// map flies with each stop, out to Voyager 1, then on to Proxima Centauri. The ways that open later are left for their
// destinations to name. Reaching the last stop counts as done, and the way on is the next of the four.

/** Voyager 1's speed out of the Solar System, about 17 km/s, in AU a year. */
const VOYAGER_AU_YEAR = (17 * 3.156e7) / 149597870.7;
const GAP_AU = NEAREST.ly * LY_AU;

const STOPS = ["How we reach", "Voyager 1", "The gap", "By sail", "By probe"];

/** The gap to the nearest star at true scale: Voyager 1 is a mark at Earth's end, all of our reach so far. */
function Gap() {
  return (
    <svg viewBox="0 0 360 54" className="mt-4 w-full overflow-visible" aria-hidden>
      <line x1={8} x2={352} y1={26} y2={26} strokeDasharray="2 4" className="stroke-muted/60" />
      <line x1={8} x2={8 + Math.max(1.5, (VOYAGER.au / GAP_AU) * 344)} y1={26} y2={26} strokeWidth={3} className="stroke-you" />
      <circle cx={8} cy={26} r={3} className="fill-you" />
      <text x={8} y={14} className="fill-you font-mono text-[8.5px]">
        Earth · Voyager 1
      </text>
      <circle cx={352} cy={26} r={3.5} className="fill-ink" />
      <text x={352} y={14} textAnchor="end" className="fill-ink font-mono text-[8.5px]">
        {NEAREST.name}
      </text>
      <text x={352} y={44} textAnchor="end" className="fill-muted font-mono text-[8px]">
        {NEAREST.ly} ly, to scale
      </text>
    </svg>
  );
}

export function ReachTour({ onClose }: { onClose(): void }) {
  const { year: clock, did } = useGame();
  const { fly, tour, aim } = useReach();
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // At the end, the way on is the next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/reach?tour");
  const [at, setAt] = useState(0);
  const last = STOPS.length - 1;

  const from = clock === null ? 0 : Math.floor(clock * 10) / 10;
  const ways = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const { to, step: tick } = axis(ways);
  const road = at >= 3 ? ways[at - 3] : null;

  // The map follows the stops: out from Earth on the first, held at Voyager 1, then on to the nearest star.
  useEffect(() => aim(null), [aim]);
  useEffect(() => {
    if (at === 0) tour(0.3);
    else fly(at === 1 ? zoomFor(VOYAGER.au) : farZoom(NEAREST.ly));
  }, [at, fly, tour]);

  useEffect(() => {
    if (at === last) did("reached");
  }, [at, last, did]);

  const go = (k: number) => setAt(Math.max(0, Math.min(last, k)));
  // A tap anywhere on the words steps it, as the review does. The map keeps its taps, for its ruler.
  const step = (by: 1 | -1) => (by > 0 && at === last ? then && navigate(then.to) : go(at + by));
  const tap = useStepTap(step);
  useEffect(() => void root.current?.closest("main")?.scrollTo({ top: 0 }), [at]);
  useEffect(() => {
    const keys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (document.querySelector("dialog[open]")) return;
      const by = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (e.key === "Escape") onClose();
      else if (by) setAt((a) => Math.max(0, Math.min(last, a + by)));
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [last, onClose]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-r]", riseFrom, { ...rise, stagger: 0.05 });
      gsap.fromTo('[data-reach="road"]', { attr: { width: 0 } }, { attr: { width: 360 }, duration: 1.4, delay: 0.3, ease: "power2.inOut" });
    },
    { scope: root, dependencies: [at] },
  );

  const hours = Math.round(VOYAGER.au / LIGHT_HOUR_AU);
  const crawl = Math.round(GAP_AU / VOYAGER_AU_YEAR / 1000);
  const words = [
    {
      head: "How we reach",
      sub: `${NEAREST.name}, ${NEAREST.ly} light-years out`,
      mind: "Everything we have ever sent is still inside the Sun’s own neighborhood. The nearest star is a different kind of far. Here is how far we have gone, and the two ways we could go farther.",
    },
    {
      head: "Voyager 1",
      sub: `Launched 1977 · ${VOYAGER.au} AU out`,
      mind: `Our farthest craft, and silent now. A word from it would take ${hours} hours to reach us. It carries the Golden Record, for whoever finds it.`,
    },
    {
      head: "The gap",
      sub: `${Math.round(GAP_AU).toLocaleString("en-US")} AU to ${NEAREST.name}`,
      mind: `Voyager 1 has gone about one twelve-hundredth of the way. At its speed, the rest would take about ${crawl} thousand years. To cross in a lifetime, we would need a real share of light’s speed.`,
    },
    {
      head: "By sail",
      sub: "A fifth of light’s speed · Laser Sail Array",
      mind: `Sails a few grams heavy, pushed by light from the ground. They cross in ${year(NEAREST.ly / 0.2)} Years and pass Proxima b in minutes. Their word comes home ${NEAREST.ly} Years after that, at light’s speed.`,
    },
    {
      head: "By probe",
      sub: "An eighth of light’s speed · Probe Yard",
      mind: `A heavier probe, built and fueled in orbit, leaves 12 Years after its yard is done and crosses in ${year(NEAREST.ly / 0.125)}. It carries far more than a sail can. These are the two roads open at Year 0. Others open as we build.`,
    },
  ][at];

  return (
    <div ref={root} {...tap} className="flex grow flex-col">
      {/* In place of the tab's head, held at the top as the page scrolls, as the review's. */}
      <div className="sticky -top-3 z-10 -mx-4 -mt-3 bg-panel px-4 pt-3 pb-1">
        <div className="flex items-center justify-between pt-1 pb-0.5 text-[11px] tracking-[.08em] text-muted">
          <span className="grow">
            {at ? `REACH · ${at} OF ${last}` : "REACH · HOW WE REACH"}
            {at === last && <span className="text-you"> · DONE</span>}
          </span>
          <button
            onClick={() => go(at - 1)}
            disabled={!at}
            aria-label="Back"
            className="-my-3 size-11 text-xl leading-none text-ink disabled:text-faint wide:hidden"
          >
            ‹
          </button>
          <button
            onClick={() => (at === last ? then && navigate(then.to) : go(at + 1))}
            disabled={at === last && !then}
            aria-label={at === last && then ? then.name : "Next"}
            className="-my-3 size-11 text-xl leading-none text-you disabled:text-faint wide:hidden"
          >
            ›
          </button>
          <button onClick={onClose} aria-label="Close the walk" className="-my-3 -mr-3 size-11 text-xl leading-none">
            ×
          </button>
        </div>
        <Stops stops={STOPS.map((name) => ({ name }))} at={at} go={go} />
      </div>

      <div key={at} aria-live="polite" className="mt-2 flex touch-pan-y flex-col">
        {road ? (
          <div data-r className="flex items-start gap-2.5">
            <span className={`mt-[4px] shrink-0 ${buildTone(road.build, road.n !== null)}`}>
              <BuildMark name={road.build} size={18} />
            </span>
            <h2 className="text-[19px] leading-snug font-medium">{words.head}</h2>
          </div>
        ) : (
          <h2 data-r className="text-[19px] leading-snug font-medium">
            {words.head}
          </h2>
        )}
        <p data-r className="mt-0.5 text-[13.5px] text-page-ink2">
          {words.sub}
        </p>
        {at === 2 && (
          <div data-r>
            <Gap />
          </div>
        )}
        {road && (
          <div data-r className="mt-3">
            <Thread road={road} i={at} to={to} />
            <Years to={to} step={tick} />
            <p className="mt-1 text-[12.5px] text-muted">
              {road.home === null
                ? "Its word would not come home within two centuries at our pace."
                : `Begun now, its word comes home at Year ${year(road.home)}.`}
            </p>
          </div>
        )}
        <div data-r className="mt-3">
          <MindNote className="text-[14.5px] leading-snug">{words.mind}</MindNote>
        </div>
        {at === 0 && (
          <p data-r className="mt-4 text-center font-mono text-[10px] tracking-[.1em] text-muted wide:hidden">
            TAP ANYWHERE TO GO ON
          </p>
        )}
      </div>

      {/* Wide, the way on stays in reach under the words. At the last stop, on a phone too, so the next step is plain. */}
      <div
        className={`sticky bottom-0 mt-auto grid-cols-[1fr_1.4fr] gap-2 bg-panel pt-3 pb-3 ${at === last ? "grid" : "hidden wide:grid"}`}
      >
        <button
          onClick={() => (at ? go(at - 1) : onClose())}
          className="h-11 rounded-full border border-ink text-[15px] font-medium"
        >
          {at ? "Back" : "Not now"}
        </button>
        <button
          onClick={() => (at === last ? (then ? navigate(then.to) : onClose()) : go(at + 1))}
          className="h-11 rounded-full bg-ink text-[15px] font-medium text-paper"
        >
          {at === last ? (then?.name ?? "Back to Reach") : `Next · ${STOPS[at + 1]}`}
        </button>
      </div>
    </div>
  );
}
