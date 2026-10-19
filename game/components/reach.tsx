import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { distance, placeNames } from "@/components/inherit";
import { Messages } from "@/components/messages";
import { MindNote } from "@/components/mind-note";
import { Mark, toggleBuild, usePlan, useSchedule } from "@/components/picks";
import { SkyArt } from "@/components/sky";
import type { Dials, Mark as Place } from "@/lib/drift";
import { HISTORY } from "@/lib/game/charter";
import { lean } from "@/lib/game/plan";
import {
  auFor,
  LIGHT,
  LIGHT_HOUR_AU,
  LY_AU,
  MARKS,
  NEAR_AU,
  NEAREST,
  type Road,
  roads,
  slows,
  VOYAGER_AU_PER_YEAR,
  zoomFor,
} from "@/lib/game/reach";
import type { Plan } from "@/lib/game/types";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// Reach at Year 0: how far we have gone, drawn on one line out from Earth where each step is ten times farther, and
// the two roads to the nearest star on the Years they would take. The line is also the map's: as the tab opens the map
// flies out from Earth past Voyager 1 to Alpha Centauri, a mark on the line keeping pace, and a tap or a drag on the
// line flies the map there. Before Begin, a tap on a road queues it last in our order, or takes it out, as on Build.
// The Mind advises from the charter, and queues nothing. Last, our messages still on their way, our farthest reach.

const W = 360;
const L = 14;
const R = W - 14;
const FAR = NEAREST.ly * LY_AU;
const SPAN = Math.log10(FAR / NEAR_AU);
const at = (au: number) => L + (Math.log10(au / NEAR_AU) / SPAN) * (R - L);
const auAt = (x: number) => NEAR_AU * 10 ** (((Math.min(R, Math.max(L, x)) - L) / (R - L)) * SPAN);
const year = (y: number) => (Math.round(y * 10) / 10).toString();
const [NEAR_ZOOM, FAR_ZOOM] = [zoomFor(NEAR_AU), zoomFor(FAR)];
const VOYAGER = MARKS.at(-1)!;

interface ReachView {
  /** The map's zoom, which the scene reads each frame. A new object each change when motion is reduced, so the still
   *  sky redraws. */
  dials: Dials;
  /** Flies the map to a zoom, or jumps there when motion is reduced. */
  fly(zoom: number): void;
  /** Holds the map at a zoom, as a drag does. */
  hold(zoom: number): void;
  /** Out from Earth, a pause at Voyager 1, then on to the nearest star, after `delay` seconds. */
  tour(delay?: number): void;
}

const ReachContext = createContext<ReachView>({ dials: {}, fly() {}, hold() {}, tour() {} });
export const useReach = () => use(ReachContext);

export function ReachProvider({ children }: { children: React.ReactNode }) {
  // With motion, one object for good: the tweens move it and the scene reads it each frame.
  const [dials, setDials] = useState<Dials>(() => ({ zoom: FAR_ZOOM }));
  const jump = useCallback((zoom: number) => setDials({ zoom }), []);
  const fly = useCallback(
    (zoom: number) => {
      if (prefersReducedMotion()) return jump(zoom);
      const far = Math.abs(zoom - (dials.zoom ?? zoom));
      gsap.to(dials, { zoom, duration: Math.min(3, 0.5 + 0.35 * far), ease: "power2.inOut", overwrite: true });
    },
    [dials, jump],
  );
  const hold = useCallback(
    (zoom: number) => {
      if (prefersReducedMotion()) return jump(zoom);
      gsap.killTweensOf(dials);
      Object.assign(dials, { zoom });
    },
    [dials, jump],
  );
  const tour = useCallback(
    (delay = 0) => {
      if (prefersReducedMotion()) return jump(FAR_ZOOM);
      gsap.killTweensOf(dials);
      gsap
        .timeline({ delay })
        .fromTo(dials, { zoom: NEAR_ZOOM }, { zoom: zoomFor(VOYAGER.au), duration: 5, ease: "power2.inOut" })
        .to(dials, { zoom: FAR_ZOOM, duration: 3.5, ease: "power2.inOut" }, "+=1.2");
    },
    [dials, jump],
  );
  const value = useMemo(() => ({ dials, fly, hold, tour }), [dials, fly, hold, tour]);
  return <ReachContext value={value}>{children}</ReachContext>;
}

/** What the map names on the way out, by the scene's marks. */
const NAMES: Record<string, string> = {
  earth: "Earth",
  moon: "the Moon · south-pole stations",
  l2: "Roman · JWST · L2",
  sun: "the Sun",
  horizons: "New Horizons · 100 AU",
  voyager: "Voyager 1 · silent · 220 AU",
  alpha: `${NEAREST.name} · ${NEAREST.ly.toFixed(1)} ly`,
};

/** The map on Reach: the flight out from Earth, its places named, and a scale bar in light-time. It flies out once each
 *  time the tab opens. */
export function ReachMap({ className }: { className: string }) {
  const { dials, tour } = useReach();
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const bar = useRef<HTMLDivElement>(null);
  const span = useRef<HTMLSpanElement>(null);
  const toured = useRef(false);
  const onMarks = useCallback((marks: Place[]) => placeNames(names.current, marks), []);
  const onScale = useCallback((kmPerPx: number, w: number, h: number) => {
    const px = Math.min(w, h) * 0.46;
    if (bar.current) bar.current.style.width = `${px}px`;
    if (span.current) span.current.textContent = distance(px * kmPerPx);
  }, []);
  // The tour starts as the camera arrives from wherever the map was.
  const onReady = useCallback(
    (flight: number) => {
      if (toured.current) return;
      toured.current = true;
      tour(Math.max(0, flight - 0.5));
    },
    [tour],
  );
  return (
    <SkyArt mode="reach" dials={dials} onReady={onReady} onMarks={onMarks} onScale={onScale} className={className}>
      {Object.entries(NAMES).map(([id, name]) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === "earth" || id === "alpha" ? "text-you" : "text-muted"}`}
        >
          {name}
        </span>
      ))}
      <div className="pointer-events-none absolute bottom-5 left-1/2 flex flex-col items-start gap-1 wide:bottom-8">
        <span ref={span} className="font-mono text-[9px] text-muted" />
        <div ref={bar} className="h-1.5 border-x border-b border-muted/80" />
      </div>
    </SkyArt>
  );
}

/** The line out: Earth to the nearest star, each step ten times farther. What we have sent is lit, the rest is dashed.
 *  It is the map's zoom too: a mark keeps pace with the map, and a tap or a drag flies it there. */
function Gap() {
  const { dials, fly, hold } = useReach();
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGGElement>(null);
  const press = useRef<{ x: number; moved: boolean } | null>(null);
  // Labels climb as the marks crowd toward our farthest craft.
  const lift = [0, 0, 0, 0, 16, 32];

  // The view's mark follows the map's zoom, however it moves.
  useEffect(() => {
    const follow = () => {
      const x = at(auFor(dials.zoom ?? FAR_ZOOM));
      view.current?.setAttribute("transform", `translate(${Math.min(R, Math.max(L, x))} 0)`);
    };
    follow();
    gsap.ticker.add(follow);
    return () => gsap.ticker.remove(follow);
  }, [dials]);

  const xOf = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * W;
  };
  // A tap near a mark flies to it, anywhere else to that distance. A drag holds the map under the pointer.
  const snap = (x: number) => {
    const near = [...MARKS.map((m) => m.au), FAR].find((au) => Math.abs(at(au) - x) < 10);
    return zoomFor(near ?? auAt(x));
  };
  const step = (by: number) => fly(Math.min(FAR_ZOOM, Math.max(NEAR_ZOOM, (dials.zoom ?? FAR_ZOOM) + by)));

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} 112`}
      className="mt-2 w-full cursor-pointer touch-none overflow-visible outline-none select-none focus-visible:ring-2 focus-visible:ring-you/50"
      role="slider"
      tabIndex={0}
      aria-label={`The map's view, from Earth to ${NEAREST.name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(((dials.zoom ?? FAR_ZOOM) - NEAR_ZOOM) / (FAR_ZOOM - NEAR_ZOOM) * 100)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        press.current = { x: xOf(e), moved: false };
      }}
      onPointerMove={(e) => {
        const p = press.current;
        if (!p) return;
        if (!p.moved && Math.abs(xOf(e) - p.x) < 4) return;
        p.moved = true;
        hold(zoomFor(auAt(xOf(e))));
      }}
      onPointerUp={(e) => {
        const p = press.current;
        press.current = null;
        if (p && !p.moved) fly(snap(xOf(e)));
      }}
      onPointerCancel={() => (press.current = null)}
      onKeyDown={(e) => {
        const by = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[e.key];
        if (by) step(by);
        else if (e.key === "Home") fly(NEAR_ZOOM);
        else if (e.key === "End") fly(FAR_ZOOM);
        else return;
        e.preventDefault();
      }}
    >
      {Array.from({ length: Math.floor(SPAN) + 1 }, (_, k) => NEAR_AU * 10 ** k).map((au) => (
        <line key={au} x1={at(au)} x2={at(au)} y1={58} y2={66} className="stroke-faint" />
      ))}
      <line x1={at(VOYAGER.au)} x2={R} y1={62} y2={62} strokeDasharray="2 4" className="stroke-muted" />
      <line x1={L} x2={at(VOYAGER.au)} y1={62} y2={62} strokeWidth={2} className="stroke-you" />
      {LIGHT.map(([label, au]) => (
        <g key={label}>
          <line x1={at(au)} x2={at(au)} y1={66} y2={74} className="stroke-muted" />
          <text x={at(au)} y={86} textAnchor="middle" className="fill-muted font-mono text-[8px]">
            {label}
          </text>
        </g>
      ))}
      {MARKS.map((m, i) => (
        <g key={m.name}>
          {lift[i] > 0 && <line x1={at(m.au)} x2={at(m.au)} y1={58} y2={50 - lift[i]} className="stroke-faint" />}
          <circle cx={at(m.au)} cy={62} r={m.craft ? 3 : 2.5} className={m.craft ? "fill-you" : "fill-ink"} />
          <text
            x={at(m.au) + (i === 0 ? -3 : 0)}
            y={46 - lift[i]}
            textAnchor={i === 0 ? "start" : "middle"}
            className={`font-mono text-[8.5px] ${m.craft ? "fill-you" : "fill-page-ink2"}`}
          >
            {m.name}
          </text>
        </g>
      ))}
      <circle cx={R} cy={62} r={4} className="fill-ink" />
      <circle cx={R} cy={62} r={8} className="fill-ink/15" />
      <text x={R + 4} y={46} textAnchor="end" className="fill-ink font-mono text-[8.5px]">
        {NEAREST.name}
      </text>
      <text x={L - 3} y={104} className="fill-muted font-mono text-[8px]">
        each tick ten times farther · tap or drag to fly the map
      </text>
      <text x={R} y={104} textAnchor="end" className="fill-muted font-mono text-[8px]">
        {NEAREST.ly.toFixed(1)} ly
      </text>
      {/* The map's view: where it is looking out to, now. */}
      <g ref={view} className="pointer-events-none">
        <line x1={0} x2={0} y1={52} y2={72} strokeWidth={1.5} className="stroke-other" />
        <path d="M-4 48 L4 48 L0 53 Z" className="fill-other" />
      </g>
    </svg>
  );
}

/** One road as a thread on the Years: the build, solid, the craft's wait, its flight, dashed, and its word home, dotted. */
function Thread({ road, i, to }: { road: Road; i: number; to: number }) {
  const x = (y: number) => L + (Math.min(y, to) / to) * (R - L);
  const { done, leaves, arrives, home } = road;
  return (
    <svg viewBox={`0 0 ${W} 40`} className="w-full overflow-visible" aria-hidden>
      <defs>
        <clipPath id={`reach-road-${i}`}>
          <rect data-reach="road" x={0} y={0} width={W} height={40} />
        </clipPath>
      </defs>
      <g clipPath={`url(#reach-road-${i})`} opacity={road.n ? 1 : 0.6}>
        <line x1={L} x2={R} y1={20} y2={20} className="stroke-track" />
        {done !== null && <line x1={L} x2={x(done)} y1={20} y2={20} strokeWidth={3} className="stroke-you" />}
        {done !== null && leaves !== null && leaves > done && (
          <line x1={x(done)} x2={x(leaves)} y1={20} y2={20} strokeWidth={3} className="stroke-you/45" />
        )}
        {leaves !== null && arrives !== null && (
          <line x1={x(leaves)} x2={x(arrives)} y1={20} y2={20} strokeWidth={2} strokeDasharray="5 3" className="stroke-you" />
        )}
        {arrives !== null && home !== null && (
          <line x1={x(arrives)} x2={x(home)} y1={20} y2={20} strokeWidth={2} strokeDasharray="1.5 3" className="stroke-other" />
        )}
        {done !== null && <circle cx={x(done)} cy={20} r={3} className="fill-you" />}
        {arrives !== null && (
          <>
            <circle cx={x(arrives)} cy={20} r={3.5} className="fill-ink" />
            <text x={x(arrives)} y={10} textAnchor="middle" className="fill-ink font-mono text-[8.5px]">
              arrives {year(arrives)}
            </text>
          </>
        )}
        {home !== null && (
          <>
            <circle cx={x(home)} cy={20} r={3} className="fill-other" />
            <text x={x(home)} y={36} textAnchor="middle" className="fill-other font-mono text-[8.5px]">
              home {year(home)}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** Years along the bottom of the roads. */
function Years({ to }: { to: number }) {
  const ticks = Array.from({ length: Math.floor(to / 20) + 1 }, (_, k) => k * 20);
  return (
    <svg viewBox={`0 0 ${W} 18`} className="w-full overflow-visible" aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L + (t / to) * (R - L)} x2={L + (t / to) * (R - L)} y1={0} y2={4} className="stroke-muted" />
          <text x={L + (t / to) * (R - L)} y={14} textAnchor="middle" className="fill-muted font-mono text-[8px]">
            {t ? t : "Year 0"}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** What could join the plan to bring the probe's word home soonest, if anything would by a Year or more. */
function sooner(plan: Plan, scale: number, from: number, now: number | null) {
  if (now === null) return null;
  let best: { name: string; by: number } | null = null;
  for (const name of ["Orbital Yard", "Thought Fields"]) {
    if (plan.builds.includes(name)) continue;
    const home = roads({ ...plan, builds: [...plan.builds, name] }, scale, from)[1].home;
    if (home !== null && now - home >= 1 && (!best || now - home > best.by)) best = { name, by: now - home };
  }
  return best;
}

/** The Mind's word on the roads, from the charter and the plan. It advises, and queues nothing. */
function says(
  plan: Plan,
  dials: number[],
  [sail, probe]: Road[],
  tip: ReturnType<typeof sooner>,
  slow: ReturnType<typeof slows>,
  before: boolean,
) {
  if (sail.home === null) return `Neither road reaches ${NEAREST.name} within two centuries at our pace.`;
  const out = [`By sail, the soonest word from ${NEAREST.name} comes home at Year ${year(sail.home)}.`];
  if (before) {
    const { i, low } = lean(dials);
    if (i === 1 && low && !sail.n) out.push("Our charter leans to reach. The Laser Sail Array takes no matter, so we would queue it.");
    else if (!(i === 1 && low)) out.push("We would wait on both. Our first builds pay back sooner.");
    if (slow)
      out.push(`The Probe Yard ${probe.n ? "slows" : "would slow"} our ${slow.name} by ${year(slow.by)} Years.`);
    if (probe.n && plan.builds.includes("Moon Vault")) out.push("With the vault, it takes all 20 kt we hold in orbit.");
  }
  if (probe.n && tip)
    out.push(`Queuing ${tip.name === "Orbital Yard" ? "an Orbital Yard" : "Thought Fields"} would bring the probe’s word home ${Math.round(tip.by)} Years sooner.`);
  return out.join(" ");
}

export function Reach() {
  const { save, year: clock } = useGame();
  const { plan, change } = usePlan();
  const { scale } = useSchedule();
  const root = useRef<HTMLDivElement>(null);

  // Begun now: Year 0 before Begin, and after it the tenth of a Year, so the dates move at most every thirty seconds.
  const before = clock === null;
  const from = before ? 0 : Math.floor(clock * 10) / 10;
  const list = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  const tip = useMemo(() => sooner(plan, scale, from, list[1].home), [plan, scale, from, list]);
  const slow = useMemo(() => (before ? slows(plan, scale, "Probe Yard") : null), [before, plan, scale]);
  // The Years run to the last word home, in steps of twenty.
  const to = Math.max(60, Math.ceil(Math.max(...list.map((r) => r.home ?? 0)) / 20) * 20);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "power2.inOut" } })
        .fromTo('[data-reach="road"]', { attr: { width: 0 } }, { attr: { width: W }, duration: 1.4, stagger: 0.3 }, 0.6)
        .fromTo('[data-reach="say"]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.2);
    },
    { scope: root },
  );

  if (!save) return null;
  const far = MARKS.at(-1)!;
  const hours = Math.round(far.au / LIGHT_HOUR_AU);
  const crawl = Math.round((NEAREST.ly * LY_AU - far.au) / VOYAGER_AU_PER_YEAR / 1000);

  return (
    <div ref={root} className="flex flex-col pb-4">
      <h2 className="mt-1 text-[19px] leading-snug font-medium">How far we’ve gone</h2>
      <p className="mt-0.5 text-[13.5px] text-page-ink2">
        {far.name}, our farthest, is {hours} light-hours out. At its speed, {NEAREST.name} is {crawl},000 years away.
      </p>
      <Gap />

      <h2 className="mt-5 text-[19px] leading-snug font-medium">Two roads to {NEAREST.name}</h2>
      <p className="mt-0.5 text-[13.5px] text-page-ink2">
        {before ? "Either can start at Year 0, last in our order." : "Begun now, last in line."}
      </p>
      <div className="mt-2 flex flex-col">
        {list.map((road, i) => {
          const head = (
            <>
              {before && <Mark n={road.n} />}
              <span className="flex min-w-0 grow flex-col">
                <span className="text-[14.5px] leading-snug font-medium">{road.name}</span>
                <span className="text-[12px] leading-snug text-muted">
                  {road.build}, then {road.craft.toLowerCase()}
                  {road.build === "Probe Yard" ? ". 10 kt of our 20." : ". No matter."}
                </span>
              </span>
              {before && (
                <span className={`shrink-0 font-mono text-[10px] tracking-[.06em] ${road.n ? "text-you" : "text-muted"}`}>
                  {road.n ? "QUEUED" : "IF QUEUED"}
                </span>
              )}
            </>
          );
          return (
            <div key={road.name} className="border-t border-rowline pt-2">
              {before ? (
                <button
                  onClick={() => change(toggleBuild(road.build))}
                  aria-pressed={!!road.n}
                  className="group flex w-full items-start gap-2.5 text-left"
                >
                  {head}
                </button>
              ) : (
                <div className="flex items-start gap-2.5">{head}</div>
              )}
              <Thread road={road} i={i} to={to} />
            </div>
          );
        })}
        <Years to={to} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-4 bg-you" />
          building
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-you" />
          flight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dotted border-other" />
          its word home
        </span>
      </div>

      <div data-reach="say" className="mt-4">
        <MindNote className="text-[14.5px] leading-snug">
          {says(plan, save.charter?.dials ?? HISTORY, list, tip, slow, before)}
        </MindNote>
      </div>

      <Messages />
    </div>
  );
}
