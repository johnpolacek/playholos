import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useNext } from "@/components/begin";
import { useGame } from "@/components/game-provider";
import { CraftFacts } from "@/components/craft-art";
import { CRAFT_SHOT_SECS, type CraftKind } from "@/components/craft-view";
import { BuildCard } from "@/components/build-card";
import { BuildMark, buildTone } from "@/components/marks";
import { MindNote } from "@/components/mind-note";
import { usePlan, useSchedule } from "@/components/picks";
import { axis, farZoom, Thread, useReach, useTripLoop, VOYAGER, year } from "@/components/reach";
import { Thread as Stops } from "@/components/review";
import { useStepTap } from "@/components/scan";
import { tenths } from "@/lib/game/clock";
import { buildNamed, buildSlug, lacks, LATER, needs, openAt, ordered } from "@/lib/game/plan";
import type { Plan } from "@/lib/game/types";
import { LY_AU, NEAREST, PROBE_NEEDS, roads, sentinelRoad, zoomFor } from "@/lib/game/reach";
import { gsap, prefersReducedMotion, rise, riseFrom, useGSAP } from "@/lib/motion";

// How we reach, the third of the four things we would do before Begin, 2026-10-23. Scan's review shows what is out
// there, and this shows how we would get there: how far we have gone against the gap to the nearest star, the two roads
// open at Year 0, and the roads our builds open later. Each road's stop shows the builds it needs, ready to queue,
// since 2026-11-08. The map flies with each stop, out from Earth, then on to Proxima Centauri. Voyager 1
// and the gap were one stop, and the roads to come a stop of their own, 2026-10-27. Reaching the last stop counts as
// done, and the way on is the next of the four.

const GAP_AU = NEAREST.ly * LY_AU;

// How we reach and Voyager 1 were two stops, one stop since 2026-11-07.
// "Roads to come" said they came later, but the Fusion Drive and the Seed Ship are open at Year 0. Playtest 2026-11-07.
const STOPS = ["How we reach", "Send a sail", "Send a flyby probe", "More roads"];
/** What flies on each stop, for the map's counter. */
const NAMED = ["", "Sails", "Flyby probe", "Sentinel"];

/** What each road needs built, each ready to queue from its stop, as the review's builds are, 2026-11-08. Before, the
 *  walk queued none and left it to Build's step. A flyby probe needs all three of PROBE_NEEDS. */
const NEEDS_BUILT: Record<number, { name: string; how: string }[]> = {
  1: [{ name: "Laser Sail Array", how: "Pushes each sail to a fifth of light speed in 10 minutes." }],
  2: PROBE_NEEDS.map((name) => ({
    name,
    how:
      name === "Probe Yard"
        ? "Builds and fuels each probe in orbit."
        : name === "Fusion Drive"
          ? "The engine each probe flies on, thirty Years to build."
          : "Makes the 6 kt of deuterium each probe burns.",
  })),
};

/** The other roads, each a build. Speeds and sizes are plan.ts's and reach.ts's. */
const MORE_ROADS = [
  { build: "Fusion Drive", line: "Carries a craft heavy enough to stop at a star" },
  { build: "Solar Lens", line: "Uses the Sun as a lens, to picture one world’s face" },
  { build: "Seed Ship", line: "Carries a copy of our Mind, at a tenth of light’s speed" },
  { build: "Mind Link", line: "A laser that sends the Will to our Mind, wherever it stands" },
];

/** Where a road stands for us now: in our order, open, waiting on builds to order with it, or on one to be done. */
function standing(plan: Plan, open: string[], name: string) {
  if (ordered(plan).includes(name)) return "IN OUR ORDER";
  const lack = lacks(plan, name);
  if (open.includes(name)) return lack.length ? `ORDERED WITH ${needs(lack).toUpperCase()}` : "OPEN NOW";
  const after = LATER.find((b) => b.name === name)?.after;
  return after ? `OPENS AFTER THE ${after.toUpperCase()}` : "OPEN NOW";
}

/** The walk's head, held at the top as the page scrolls, as the review's: where we are, back and on, close, and the
 *  stops. A build opened from More roads keeps it, its stops leading back into the walk. 2026-10-28. */
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

/** A build page opened from More roads: the walk's head over it, at its last stop. Back, or a stop, goes into the
 *  walk there. Close leaves the walk for Reach. */
export function WalkBack() {
  const navigate = useNavigate();
  const last = STOPS.length - 1;
  const to = (k: number) => navigate("/play/reach?tour", { state: { at: k } });
  return <WalkHead at={last} go={to} back={() => to(last)} next={() => to(last)} nextOff onClose={() => navigate("/play/reach")} />;
}

/** The other roads, each with its mark and where it stands now. Each opens its build's page, 2026-10-27. */
function More() {
  const { year } = useGame();
  const { plan } = usePlan();
  const { done } = useSchedule();
  const at = tenths(year ?? 0);
  const open = useMemo(() => openAt(plan, done, at).map((b) => b.name), [plan, done, at]);
  return (
    <ol className="mt-3 flex flex-col">
      {MORE_ROADS.map((r) => (
        <li key={r.build} data-r>
          <Link
            to={`/play/build/${buildSlug(r.build)}`}
            state={{ back: { to: "/play/reach?tour", label: "More roads", state: { at: STOPS.length - 1 }, walk: true, stops: { n: STOPS.length, at: STOPS.length - 1 } } }}
            className="flex gap-3 pb-3"
          >
            <span className={`mt-[2px] shrink-0 ${buildTone(r.build, false)}`}>
              <BuildMark name={r.build} size={21} />
            </span>
            <span className="flex grow flex-col">
              <span className="text-[14.5px] font-medium">{r.build}</span>
              <span className="text-[13px] text-page-ink2">{r.line}</span>
              <span className="font-mono text-[10px] tracking-[.06em] text-muted">{standing(plan, open, r.build)}</span>
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
  const { fly, hold, flyLater, aim, showCraft, craft } = useReach();
  // A replay of the close-up runs the map's part again too.
  const shot = craft?.shot ?? 0;
  const { plan } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // At the end, the way on is the next of the four things we would do first, or back to the tab once all are done.
  const then = useNext("/play/reach?tour");
  const last = STOPS.length - 1;
  // Back from a build opened on More roads, the walk opens where it was. 2026-10-28.
  const back = (useLocation().state as { at?: number } | null)?.at;
  const [at, setAt] = useState(() => Math.max(0, Math.min(last, back ?? 0)));

  const from = clock === null ? 0 : Math.floor(clock * 10) / 10;
  const ways = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const { to } = axis(ways);
  const road = at === 1 || at === 2 ? ways[at - 1] : null;
  // The last stop's sentinel flies its road too, as the sail and the probe do: it showed up close, then nothing flew.
  // 2026-11-08.
  const stays = useMemo(() => sentinelRoad(plan, scale, from, NEAREST.name, NEAREST.ly), [plan, scale, from]);

  // The map follows the stops: out from Earth past Voyager 1 to the nearest star on the first, then each road's craft
  // flies there on the map, its Years counted, and its word comes home. The craft themselves are drawn on the page.
  // Playtest 2026-11-07: Voyager 1 and New Horizons had stops and name tags where the sail and probe should be.
  useEffect(() => aim(null), [aim]);
  useEffect(() => {
    if (at !== 0) {
      fly(farZoom(NEAREST.ly));
      return;
    }
    // Voyager 1 up close, then pulled back to where it is at Year 0, with New Horizons and their dotted roads from the
    // Sun, held there, then out until the nearest star shows, the two still marked by the Sun. Asked 2026-11-07.
    // A press on the ruler calls the flight out off, so it never takes the map from where we put it. 2026-11-08.
    hold(zoomFor(VOYAGER.au));
    return flyLater(CRAFT_SHOT_SECS + 2.5, farZoom(NEAREST.ly), 4.5);
  }, [at, fly, hold, flyLater, shot]);
  // Each craft opens up close on the map, then pulls back into its flight. 2026-11-07.
  const kind: CraftKind | null = at === 0 ? "voyager" : at === 1 ? "sail" : at === 2 ? "probe" : at === last ? "sentinel" : null;
  useEffect(() => {
    showCraft(kind);
    return () => showCraft(null);
  }, [kind, showCraft]);
  // Each road's craft flies on the map as the close shot pulls back, its Years counted. A sentinel stays, so it is at
  // Proxima b, not past it.
  useTripLoop(road ?? (at === last ? stays : null), (years, there, word) =>
    there ? `${at === last ? "At" : "Passed"} Proxima b · its word ${word} Years on its way home` : `${NAMED[at]} · ${years} Years out`,
  );

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

  const words = [
    {
      head: "How we reach",
      sub: `${NEAREST.name}, ${NEAREST.ly} light-years out`,
      mind: "Voyager 1, launched in 1977 for Jupiter and Saturn, flies at 17 km/s. New Horizons, launched in 2006 for Pluto, at 14. At those speeds the nearest star is at least 75,000 years away. Here is what could go a thousand times faster.",
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
      head: "More roads",
      sub: "Each one a build",
      mind: "To stay at a star, a craft must slow, and fuel for that weighs a hundred times the craft. A sentinel opens a wide magnetic loop and drags on the thin gas between stars instead. Only a heavy craft can, and carrying it takes a fusion drive, thirty Years to build, so these roads are slow.",
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
        {/* Too much small type on a road's stop: its icons, axis, legend and counter went, 2026-11-07. The counter is on
            the map, by the flight. What it costs and when we see is in plain words. */}
        {road && (
          <div data-r className="mt-3">
            <p className="text-[15.5px] leading-snug text-ink">
              {road.home === null
                ? "What it sees would not reach us within two centuries at our pace."
                : `${road.n ? "As queued" : `If we start the ${road.build}${road.works !== undefined ? ", a Fusion Drive and the Deuterium Works" : ""} now`}, we see Proxima b up close in Year ${year(road.home)}.`}
            </p>
            <div className="mt-2">
              <Thread road={road} i={at} to={to} />
            </div>
          </div>
        )}
        {kind && (
          <div data-r className="mt-4">
            <CraftFacts kind={kind} />
          </div>
        )}
        {at === 0 && (
          <div data-r>
            <Gap />
          </div>
        )}
        {at === last && <More />}
        <div data-r className="mt-3">
          <MindNote className="text-[14.5px] leading-snug">{words.mind}</MindNote>
        </div>
        {NEEDS_BUILT[at] && (
          <div data-r onPointerUp={(e) => e.stopPropagation()} className="mt-4 flex flex-col gap-2">
            <span className="font-mono text-[11px] tracking-[.08em] text-muted uppercase">
              {NEEDS_BUILT[at].length > 1 ? "Builds this needs" : "The build this needs"}
            </span>
            {NEEDS_BUILT[at].map((b) => {
              const build = buildNamed(b.name);
              return (
                build && (
                  <BuildCard
                    key={b.name}
                    build={build}
                    how={b.how}
                    back={{ to: "/play/reach?tour", label: STOPS[at], state: { at } }}
                  />
                )
              );
            })}
          </div>
        )}
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
