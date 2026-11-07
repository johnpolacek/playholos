import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { ProbeArt, SailArt, SentinelArt } from "@/components/craft-art";
import { BuildMark, buildTone } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { axis, Brings, farZoom, Key, Thread, tripAt, useReach, VOYAGER, year, Years } from "@/components/reach";
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

// How we reach and Voyager 1 were two stops, one stop since 2026-11-07.
const STOPS = ["How we reach", "Send a sail", "Send a flyby probe", "Roads to come"];

/** The roads our builds open later, each with the build it waits on. Speeds and sizes are plan.ts's and reach.ts's. */
const LATER_ROADS = [
  { build: "Fusion Drive", line: "Carries a craft heavy enough to stop at a star", after: "Deuterium Works" },
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
  const to = (k: number) => navigate("/play/reach?tour", { state: { at: k } });
  return <WalkHead at={last} go={to} back={() => to(last)} next={() => to(last)} nextOff onClose={() => navigate("/play/reach")} />;
}

/** The roads to come, each with its mark and the build it waits on. Each opens its build's page, 2026-10-27. */
function Later() {
  return (
    <ol className="mt-3 flex flex-col">
      {LATER_ROADS.map((r) => (
        <li key={r.build} data-r>
          <Link
            to={`/play/build/${buildSlug(r.build)}`}
            state={{ back: { to: "/play/reach?tour", label: "Roads to come", state: { at: STOPS.length - 1 }, walk: true, stops: { n: STOPS.length, at: STOPS.length - 1 } } }}
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
  const { fly, tour, aim, setTrip } = useReach();
  const flown = useRef<HTMLSpanElement>(null);
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // At the end, the way on is the next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/play/reach?tour");
  const last = STOPS.length - 1;
  // Back from a build opened on Roads to come, the walk opens where it was. 2026-10-28.
  const back = (useLocation().state as { at?: number } | null)?.at;
  const [at, setAt] = useState(() => Math.max(0, Math.min(last, back ?? 0)));

  const from = clock === null ? 0 : Math.floor(clock * 10) / 10;
  const ways = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const { to, step: tick } = axis(ways);
  const road = at === 1 || at === 2 ? ways[at - 1] : null;

  // The map follows the stops: out from Earth past Voyager 1 to the nearest star on the first, then each road's craft
  // flies there on the map, its Years counted, and its word comes home. The craft themselves are drawn on the page.
  // Playtest 2026-11-07: Voyager 1 and New Horizons had stops and name tags where the sail and probe should be.
  useEffect(() => aim(null), [aim]);
  useEffect(() => {
    if (at === 0) tour(0.3);
    else fly(farZoom(NEAREST.ly));
  }, [at, fly, tour]);
  useEffect(() => {
    if (!road || road.leaves === null || road.arrives === null || road.home === null) return;
    const { leaves, arrives, home } = road;
    const show = (t: number) => {
      setTrip(tripAt(road, leaves + Math.min(t, home - leaves - 1e-6)));
      if (flown.current)
        flown.current.textContent =
          leaves + t < arrives ? `${Math.floor(t)} Years out` : `Passed Proxima b · its word ${Math.floor(leaves + t - arrives)} Years on its way home`;
    };
    if (prefersReducedMotion()) {
      show(arrives - leaves);
      return () => setTrip(null);
    }
    // Five Years a second, so a sail's 21 Years and a probe's 52 read as the gap they are.
    const o = { t: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.2 });
    tl.fromTo(o, { t: 0 }, { t: home - leaves, duration: (home - leaves) / 5, ease: "none", onUpdate: () => show(o.t) });
    return () => {
      tl.kill();
      setTrip(null);
    };
  }, [road, setTrip]);

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
      mind: `Our farthest craft, Voyager 1, has gone ${hours} light-hours in ${2040 - 1977} years. At its speed the nearest star is about ${(crawl * 1000).toLocaleString()} years away. To arrive within a lifetime, we must go about a thousand times faster. Here is what could.`,
    },
    {
      head: "Send a sail",
      sub: "A fifth of light’s speed · Laser Sail Array",
      mind: "Too fast to stop, a sail is past Proxima b within minutes and sends home pictures. The light that misses it goes on, and outshines our Sun in its color at the star it is aimed at. Anyone there awake would see where we are.",
    },
    {
      head: "Send a flyby probe",
      sub: "A tenth of light’s speed · Probe Yard",
      mind: "Slower than a sail, but it reads a world’s air, where a sail sends only pictures. Its engine is fusion, so it waits on a Fusion Drive no one has flown, and each one burns deuterium the Works must make.",
    },
    {
      head: "Roads to come",
      sub: "Opened by what we build",
      mind: "To stay at a star, a craft must slow, and fuel for that weighs a hundred times the craft. A sentinel opens a wide magnetic loop and drags on the thin gas between stars instead. Only a heavy craft can, and carrying it takes a fusion drive, thirty Years to build, so these roads open slowly.",
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
        {/* Each craft, drawn: what it is and how it moves. 2026-11-07. */}
        {(at === 1 || at === 2 || at === last) && (
          <div data-r className="mt-3">
            {at === 1 ? <SailArt tone={buildTone("Laser Sail Array")} /> : at === 2 ? <ProbeArt tone={buildTone("Probe Yard")} /> : <SentinelArt tone={buildTone("Fusion Drive")} />}
          </div>
        )}
        {road && (
          <div data-r className="mt-3">
            <Brings road={road} />
          </div>
        )}
        {at === 0 && (
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
            {road.home !== null && (
              <p className="mt-1 font-mono text-[10px] tracking-[.08em] text-muted uppercase">
                On the map · <span ref={flown} />
              </p>
            )}
            <p className="mt-1 text-[12.5px] text-muted">
              {road.home === null
                ? "What it sees would not reach us within two centuries at our pace."
                : `${road.n ? "As queued" : `If we start the ${road.build}${road.works !== undefined ? ", a Fusion Drive and the Deuterium Works" : ""} now`}, we see Proxima b up close in Year ${year(road.home)}.`}
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
