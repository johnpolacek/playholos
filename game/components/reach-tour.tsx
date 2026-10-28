import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { BuildMark, buildTone } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { axis, Brings, farZoom, Key, Thread, useReach, VOYAGER, year, Years } from "@/components/reach";
import { Thread as Stops } from "@/components/review";
import { useStepTap } from "@/components/scan";
import { buildSlug } from "@/lib/game/plan";
import { LIGHT_HOUR_AU, LY_AU, NEAREST, roads } from "@/lib/game/reach";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// How we reach, the third of the four things we would do before Begin, 2026-10-23. Scan's review shows what is out
// there, and this shows how we would get there: how far we have gone against the gap to the nearest star, the two roads
// open at Year 0, and the roads our builds open later. It explains the roads and queues none, since a road is a build
// and Build's step queues them. The map flies with each stop, out from Earth, then on to Proxima Centauri. Voyager 1
// and the gap were one stop, and the roads to come a stop of their own, 2026-10-27. Reaching the last stop counts as
// done, and the way on is the next of the four.

/** Voyager 1's speed out of the Solar System, about 17 km/s, in AU a year. */
const VOYAGER_AU_YEAR = (17 * 3.156e7) / 149597870.7;
const GAP_AU = NEAREST.ly * LY_AU;

const STOPS = ["How we reach", "Voyager 1", "Send a sail", "Send a flyby probe", "Roads to come"];

/** The roads our builds open later, each with the build it waits on. Speeds and sizes are plan.ts's and reach.ts's. */
const LATER_ROADS = [
  { build: "Fusion Drive", line: "Slows a craft at a star, so it can stay", after: "Deuterium Works" },
  { build: "Solar Lens", line: "Uses the Sun as a lens, to picture one world’s face", after: "Orbital Yard" },
  { build: "Seed Ship", line: "Carries a copy of our Mind, at a tenth of light’s speed", after: "Fusion Drive" },
  { build: "Mind Link", line: "A laser that sends the Will to our Mind, wherever it stands", after: "Seed Ship" },
];

/** The walk's head, held at the top as the page scrolls, as the review's: where we are, back and on, close, and the
 *  stops. A build opened from Roads to come keeps it, its stops leading back into the walk. 2026-10-28. */
export function WalkHead(props: {
  at: number;
  go(k: number): void;
  back(): void;
  next(): void;
  nextOff?: boolean;
  nextLabel?: string;
  onClose(): void;
}) {
  const { at, go, back, next, nextOff, nextLabel = "Next", onClose } = props;
  const last = STOPS.length - 1;
  return (
    <div className="sticky -top-3 z-10 -mx-4 -mt-3 bg-panel px-4 pt-3 pb-1">
      <div className="flex items-center justify-between pt-1 pb-0.5 text-[11px] tracking-[.08em] text-muted">
        <span className="grow">
          {at ? `REACH · ${at} OF ${last}` : "REACH · HOW WE REACH"}
          {at === last && <span className="text-you"> · DONE</span>}
        </span>
        <button onClick={back} disabled={!at} aria-label="Back" className="-my-3 size-11 text-xl leading-none text-ink disabled:text-faint wide:hidden">
          ‹
        </button>
        <button onClick={next} disabled={nextOff} aria-label={nextLabel} className="-my-3 size-11 text-xl leading-none text-you disabled:text-faint wide:hidden">
          ›
        </button>
        <button onClick={onClose} aria-label="Close the walk" className="-my-3 -mr-3 size-11 text-xl leading-none">
          ×
        </button>
      </div>
      <Stops stops={STOPS.map((name) => ({ name }))} at={at} go={go} />
    </div>
  );
}

/** A build page opened from Roads to come: the walk's head over it, at its last stop. Back, or a stop, goes into the
 *  walk there. Close leaves the walk for Reach. */
export function WalkBack() {
  const navigate = useNavigate();
  const last = STOPS.length - 1;
  const to = (k: number) => navigate("/reach?tour", { state: { at: k } });
  return <WalkHead at={last} go={to} back={() => to(last)} next={() => to(last)} nextOff onClose={() => navigate("/reach")} />;
}

/** The roads to come, each with its mark and the build it waits on. Each opens its build's page, 2026-10-27. */
function Later() {
  return (
    <ol className="mt-3 flex flex-col">
      {LATER_ROADS.map((r) => (
        <li key={r.build} data-r>
          <Link
            to={`/build/${buildSlug(r.build)}`}
            state={{ back: { to: "/reach?tour", label: "Roads to come", state: { at: STOPS.length - 1 }, walk: true, stops: { n: STOPS.length, at: STOPS.length - 1 } } }}
            className="flex gap-3 pb-3"
          >
            <span className={`mt-[2px] shrink-0 ${buildTone(r.build, false)}`}>
              <BuildMark name={r.build} size={21} />
            </span>
            <span className="flex grow flex-col">
              <span className="text-[14.5px] font-medium">{r.build}</span>
              <span className="text-[13px] text-page-ink2">{r.line}</span>
              <span className="font-mono text-[10px] tracking-[.06em] text-muted">AFTER THE {r.after.toUpperCase()}</span>
            </span>
            <span className="self-center text-muted">›</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

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
  const { orderAt: clock, did } = useGame();
  const { fly, tour, aim } = useReach();
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // At the end, the way on is the next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/reach?tour");
  const last = STOPS.length - 1;
  // Back from a build opened on Roads to come, the walk opens where it was. 2026-10-28.
  const back = (useLocation().state as { at?: number } | null)?.at;
  const [at, setAt] = useState(() => Math.max(0, Math.min(last, back ?? 0)));

  const from = clock === null ? 0 : Math.floor(clock * 10) / 10;
  const ways = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const { to, step: tick } = axis(ways);
  const road = at === 2 || at === 3 ? ways[at - 2] : null;

  // The map follows the stops: out from Earth on the first, then on to the nearest star.
  useEffect(() => aim(null), [aim]);
  useEffect(() => {
    if (at === 0) tour(0.3);
    else fly(farZoom(NEAREST.ly));
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
      mind: "Everything we have ever sent is still inside the Sun’s own neighborhood. The nearest star is a different kind of far. Here is how far we have gone, two ways we could go farther now, and the roads to come.",
    },
    {
      head: "Voyager 1",
      sub: `Launched 1977 · ${hours} light-hours gone · ${NEAREST.ly} light-years to go`,
      mind: `Our farthest craft, now silent, carrying the Golden Record. It has gone less than a thousandth of the way. At its speed, the rest would take about ${(crawl * 1000).toLocaleString()} years. To arrive within a lifetime, we must go nearly a thousand times faster, at least a twentieth of light’s speed.`,
    },
    {
      head: "Send a sail",
      sub: "A fifth of light’s speed · Laser Sail Array",
      mind: "Sails weighing a few grams, pushed by a beam from Earth. Too fast to stop, they are past Proxima b within minutes, and send home pictures. More compute can speed the array’s build, but nothing speeds the flight.",
    },
    {
      head: "Send a flyby probe",
      sub: "An eighth of light’s speed · Probe Yard",
      mind: "A heavier probe, built and fueled in orbit. It flies past too, but reads the world’s air, where sails send only pictures. These are our two roads at Year 0.",
    },
    {
      head: "Roads to come",
      sub: "Opened by what we build",
      mind: "A flyby is past a world in minutes. To stay, a craft must slow, and that takes a fusion drive no one has flown yet. Each waits on a build before it, and the drive alone takes thirty Years, so these roads open slowly.",
    },
  ][at];

  return (
    <div ref={root} {...tap} className="flex grow flex-col">
      {/* In place of the tab's head, held at the top as the page scrolls, as the review's. */}
      <WalkHead
        at={at}
        go={go}
        back={() => go(at - 1)}
        next={() => (at === last ? then && navigate(then.to) : go(at + 1))}
        nextOff={at === last && !then}
        nextLabel={at === last && then ? then.name : "Next"}
        onClose={onClose}
      />

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
        {road && (
          <div data-r className="mt-2.5">
            <Brings road={road} />
          </div>
        )}
        {at === 1 && (
          <div data-r>
            <Gap />
          </div>
        )}
        {at === last && <Later />}
        {road && (
          <div data-r className="mt-3">
            <Thread road={road} i={at} to={to} />
            <Years to={to} step={tick} />
            <Key road={road} from={from} />
            <p className="mt-1 text-[12.5px] text-muted">
              {road.home === null
                ? "What it sees would not reach us within two centuries at our pace."
                : `${road.n ? "As queued" : `If we start the ${road.build} now`}, we see Proxima b up close in Year ${year(road.home)}.`}
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
