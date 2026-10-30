import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { placeNames } from "@/components/inherit";
import { Item, type Row } from "@/components/journey";
import { BringsMark, LeadMark } from "@/components/marks";
import { type Aim, usePlan, useSchedule } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { SkyArt } from "@/components/sky";
import { Face, ListHead } from "@/components/tab-head";
import type { Dials, Mark as Place } from "@/lib/drift";
import { YEAR_0, lyOf } from "@/lib/game/clock";
import { LANDMARKS } from "@/lib/game/landmarks";
import { starName, visitReading } from "@/lib/game/leads";
import { lean, type moves } from "@/lib/game/plan";
import {
  auFor,
  LIGHT,
  LY_AU,
  MARKS,
  NEAR_AU,
  NEAREST,
  type Road,
  roads,
  toward,
  zoomFor,
} from "@/lib/game/reach";
import { type System, worldName } from "@/lib/game/systems";
import type { Plan } from "@/lib/game/types";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// Reach at Year 0: how far we have gone, drawn on one line out from Earth where each step is ten times farther, and
// the two roads to the nearest star on the Years they would take. The line is also the map's: as the tab opens the map
// flies out from Earth past Voyager 1 to Proxima Centauri, a mark on the line keeping pace, and a tap or a drag on the
// line flies the map there. The roads go to Proxima b, the world next door on Scan, whose air no telescope we have can
// read. Before Begin, a tap on a road queues it last in our order, or takes it out, as on Build. The Mind advises from
// the charter, and queues nothing. Reach holds what we launch, and our messages, which are light, live on Scan with
// the sky they cross. So under the line, what we have sent: Voyager 1, silent, carrying the Golden Record. Our sails
// and probes join it once they fly. Settled 2026-10-19. They do since 2026-10-22, each until its word comes home from
// Proxima b. The tab's head opens the nearest star at any time.

// The roads' Years, drawn 360 wide.
const W = 360;
const L = 14;
const R = W - 14;
export const year = (y: number) => (Math.round(y * 10) / 10).toString();
/** The map's zoom that frames a star `ly` out. */
export const farZoom = (ly: number) => zoomFor(ly * LY_AU);
const [NEAR_ZOOM, FAR_ZOOM] = [zoomFor(NEAR_AU), farZoom(NEAREST.ly)];
export const VOYAGER = MARKS.at(-1)!;

/** Where the map and its ruler run out to: the nearest star, or the destination open on Reach. */
export interface Target {
  /** Its star as the sky names it. */
  id: string;
  name: string;
  ly: number;
  /** Its system, which Close View flies into. */
  system?: System;
}
const NEAREST_TARGET: Target = { id: NEAREST.name, name: NEAREST.name, ly: NEAREST.ly };

/** What we have sent so far: Voyager 1, silent by Year 0, 40,000 years from passing another star. */
const SENT: Row = {
  key: "voyager-1",
  name: "Voyager 1",
  note: "Silent, 30 light-hours out. It carries the Golden Record, for whoever finds it.",
  at: 40000,
  kind: "craft",
  msg: "The Golden Record",
  sent: 1977.68,
};

interface ReachView {
  /** The map's zoom, which the scene reads each frame. A new object each change when motion is reduced, so the still
   *  sky redraws. */
  dials: Dials;
  /** Flies the map to a zoom, or jumps there when motion is reduced. */
  fly(zoom: number): void;
  /** Holds the map at a zoom, as a drag does. */
  hold(zoom: number): void;
  /** Out from Earth, a pause at Voyager 1, then on to the star in view, after `delay` seconds. */
  tour(delay?: number): void;
  /** Where the map and its ruler run out to. */
  target: Target;
  /** Turns the map to a destination and flies it out there, or with null, back to the nearest star. */
  aim(to: Target | null): void;
  /** In the destination's system, or not, and the way in and out. */
  close: boolean;
  setClose(on: boolean): void;
}

const ReachContext = createContext<ReachView>({
  dials: {},
  fly() {},
  hold() {},
  tour() {},
  target: NEAREST_TARGET,
  aim() {},
  close: false,
  setClose() {},
});
export const useReach = () => use(ReachContext);

export function ReachProvider({ children }: { children: React.ReactNode }) {
  // With motion, one object for good: the tweens move it and the scene reads it each frame.
  const [dials, setDials] = useState<Dials>(() => ({ zoom: FAR_ZOOM }));
  // Without motion a jump is a new object, so the ruler redraws. The callbacks read it through a ref, so a jump never
  // makes them new: a page that aims on each new aim had jumped, and aimed again, for good. Fixed 2026-10-26.
  const now = useRef(dials);
  useEffect(() => void (now.current = dials), [dials]);
  const jump = useCallback((zoom: number) => setDials((d) => (d.zoom === zoom ? d : { ...d, zoom })), []);
  const fly = useCallback(
    (zoom: number) => {
      if (prefersReducedMotion()) return jump(zoom);
      const d = now.current;
      const far = Math.abs(zoom - (d.zoom ?? zoom));
      gsap.to(d, { zoom, duration: Math.min(3, 0.5 + 0.35 * far), ease: "power2.inOut", overwrite: true });
    },
    [jump],
  );
  const hold = useCallback(
    (zoom: number) => {
      if (prefersReducedMotion()) return jump(zoom);
      gsap.killTweensOf(now.current);
      Object.assign(now.current, { zoom });
    },
    [jump],
  );
  const [target, setTarget] = useState<Target>(NEAREST_TARGET);
  // Close View: the scene reads it from the dials each frame, and the screen from here.
  const [close, setCloseState] = useState(false);
  const setClose = useCallback((on: boolean) => {
    Object.assign(now.current, { close: on ? 1 : 0 });
    setCloseState(on);
  }, []);
  const tour = useCallback(
    (delay = 0) => {
      setClose(false);
      if (prefersReducedMotion()) return jump(farZoom(target.ly));
      const d = now.current;
      gsap.killTweensOf(d);
      gsap
        .timeline({ delay })
        .fromTo(d, { zoom: NEAR_ZOOM }, { zoom: zoomFor(VOYAGER.au), duration: 5, ease: "power2.inOut" })
        .to(d, { zoom: farZoom(target.ly), duration: 3.5, ease: "power2.inOut" }, "+=1.2");
    },
    [jump, target, setClose],
  );
  const aim = useCallback(
    (to: Target | null) => {
      const next = to ?? NEAREST_TARGET;
      setClose(false);
      setTarget((was) => (was.id === next.id && was.system === next.system ? was : next));
      fly(farZoom(next.ly));
    },
    [fly, setClose],
  );
  const value = useMemo(
    () => ({ dials, fly, hold, tour, target, aim, close, setClose }),
    [dials, fly, hold, tour, target, aim, close, setClose],
  );
  return <ReachContext value={value}>{children}</ReachContext>;
}

/** What the map names on the way out, by the scene's marks. */
const NAMES: Record<string, string> = {
  earth: "Earth",
  moon: "the Moon · south-pole stations",
  l2: "Roman · JWST · L2",
  sun: "the Sun",
  horizons: "New Horizons · 14 light-hours",
  voyager: "Voyager 1 · silent · 30 light-hours",
};

/** What a tap on Reach's map can name, beyond where we can go: the Milky Way's center and the big galaxies near us.
 *  Distances are the atlas's: GRAVITY 2022 for the center, the Local Volume Database for the rest. The odds on
 *  Andromeda are Sawala et al. 2025. */
const SIGHTS: Record<string, { name: string; line: string }> = {
  ...Object.fromEntries(LANDMARKS.map(({ id, name, line }) => [id, { name, line }])),
  gc: {
    name: "The Milky Way’s center · 27,000 light-years",
    line: "Its bulge and long bar, behind dust. At its heart is Sagittarius A*, a black hole of four million Suns.",
  },
  lmc: {
    name: "Large Magellanic Cloud · 160,000 light-years",
    line: "A small galaxy circling ours. The pink is the Tarantula, the brightest nursery of stars in the Local Group.",
  },
  smc: {
    name: "Small Magellanic Cloud · 200,000 light-years",
    line: "The Large Cloud’s smaller partner. The two tug at each other and trail a long stream of gas.",
  },
  m31: {
    name: "Andromeda · 2.5 million light-years",
    line: "The nearest big spiral, and the farthest thing we see by eye. Whether it merges with ours in ten billion years is a coin flip.",
  },
  m33: {
    name: "Triangulum · 2.8 million light-years",
    line: "The Local Group’s third spiral, smaller and looser than ours, and still busy making stars.",
  },
};

/** A named sight's ring sits on it, and its card beside it, on the side away from the edge, kept inside the map. It
 *  hides while its sight is out of view. */
function placeSight(n: HTMLDivElement, { x, y, a }: Place) {
  const card = n.querySelector<HTMLElement>("[data-card]")!;
  const w = n.parentElement?.clientWidth ?? 0;
  const h = n.parentElement?.clientHeight ?? 0;
  const dx = x > w * 0.55 ? -14 - card.offsetWidth : 14;
  const dy = Math.min(Math.max(-card.offsetHeight / 2, 8 - y), h - 8 - y - card.offsetHeight);
  card.style.transform = `translate(${dx}px, ${dy}px)`;
  n.style.transform = `translate(${x}px, ${y}px)`;
  n.style.opacity = String(a > 0.3 && x > 0 && x < w && y > 0 && y < h ? 1 : 0);
}

/** The map on Reach: the flight out from Earth, and its places named. The ruler along its bottom says how far it looks.
 *  It flies out once each time the tab opens. */
export function ReachMap({ className }: { className: string }) {
  const { dials, tour, target } = useReach();
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const toured = useRef(false);
  // The scene rings the star it is given, and the name follows it.
  const star = useMemo(() => [target.id], [target.id]);
  const named: Record<string, string> = { ...NAMES, alpha: `${target.name} · ${lyOf(target.ly)} ly` };
  target.system?.worlds.forEach((w, i) => {
    named[`w${i}`] = worldName(w);
  });
  const sights = useRef<Place[]>([]);
  const sight = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<string | null>(null);
  const onMarks = useCallback((marks: Place[]) => {
    placeNames(names.current, marks);
    sights.current = marks.filter((m) => m.id in SIGHTS);
    const n = sight.current;
    const m = sights.current.find((m) => m.id === n?.dataset.id);
    if (n && m) placeSight(n, m);
  }, []);
  // A tap names what it lands on: the nearest sight whose glow it falls within, or whose center is a fingertip away. The
  // view drifts, so a fingertip is generous.
  const tap = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const [x, y] = [e.clientX - box.left, e.clientY - box.top];
    let best: { id: string; by: number } | null = null;
    for (const m of sights.current) {
      if (m.a < 0.3 || m.x < 0 || m.y < 0 || m.x > box.width || m.y > box.height) continue;
      const by = Math.hypot(m.x - x, m.y - y) / Math.max(m.r ?? 0, 36);
      if (by < 1 && (!best || by < best.by)) best = { id: m.id, by };
    }
    setSeen(best && best.id !== seen ? best.id : null);
  };
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
    <SkyArt
      mode="reach"
      dials={dials}
      leads={star}
      system={target.system}
      onReady={onReady}
      onMarks={onMarks}
      className={className}
    >
      <div onClick={tap} className="absolute inset-0" />
      <div
        ref={sight}
        data-id={seen ?? ""}
        className={`pointer-events-none absolute top-0 left-0 transition-opacity duration-300 ${seen ? "" : "!opacity-0"}`}
      >
        <span className="absolute -top-[7px] -left-[7px] size-3.5 rounded-full border border-you/70" />
        <div data-card className="absolute w-[236px] rounded-lg border border-faint bg-paper/90 px-2.5 py-1.5">
          <div className="font-mono text-[9.5px] tracking-[.06em] text-ink">{seen && SIGHTS[seen].name}</div>
          <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{seen && SIGHTS[seen].line}</p>
        </div>
      </div>
      {Object.entries(named).map(([id, name]) => (
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
    </SkyArt>
  );
}

/** The ruler along the bottom of Reach's map: Earth to the star in view, each step ten times farther. What we have sent
 *  is lit, the rest is dashed. It is the map's zoom: a mark keeps pace with the map, and a tap or a drag flies it there.
 *  It sat atop the tab until 2026-10-19, and moved onto the map it moves. Drawn at its own width in pixels, so its words
 *  stay small however wide it runs, and quiet, so the sky leads. It stretches to a destination when one is open. */
export function Ruler() {
  const { dials, fly, hold, target } = useReach();
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<SVGGElement>(null);
  const press = useRef<{ x: number; moved: boolean } | null>(null);
  const [w, setW] = useState(560);
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const watch = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  const [l, r] = [8, w - 8];
  const far = target.ly * LY_AU;
  const decades = Math.log10(far / NEAR_AU);
  const at = useCallback((au: number) => l + (Math.log10(au / NEAR_AU) / decades) * (r - l), [l, r, decades]);
  const auAt = (x: number) => NEAR_AU * 10 ** (((Math.min(r, Math.max(l, x)) - l) / (r - l)) * decades);
  const end = farZoom(target.ly);
  // Labels climb as the marks crowd toward our farthest craft.
  const lift = [0, 0, 0, 0, 10, 20];

  // The view's mark follows the map's zoom, however it moves.
  useEffect(() => {
    const follow = () => {
      const x = at(auFor(dials.zoom ?? end));
      view.current?.setAttribute("transform", `translate(${Math.min(r, Math.max(l, x))} 0)`);
    };
    follow();
    gsap.ticker.add(follow);
    return () => gsap.ticker.remove(follow);
  }, [dials, at, end, l, r]);

  const xOf = (e: React.PointerEvent) => e.clientX - svg.current!.getBoundingClientRect().left;
  // A tap near a mark flies to it, anywhere else to that distance. A drag holds the map under the pointer.
  const snap = (x: number) => {
    const near = [...MARKS.map((m) => m.au), far].find((au) => Math.abs(at(au) - x) < 10);
    return zoomFor(near ?? auAt(x));
  };
  const step = (by: number) => fly(Math.min(end, Math.max(NEAR_ZOOM, (dials.zoom ?? end) + by)));

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${w} 84`}
      className="w-full cursor-pointer touch-none overflow-visible opacity-80 outline-none select-none focus-visible:ring-2 focus-visible:ring-you/50"
      role="slider"
      tabIndex={0}
      aria-label={`The map's view, from Earth to ${target.name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((((dials.zoom ?? end) - NEAR_ZOOM) / (end - NEAR_ZOOM)) * 100)}
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
        else if (e.key === "End") fly(end);
        else return;
        e.preventDefault();
      }}
    >
      {Array.from({ length: Math.floor(decades) + 1 }, (_, k) => NEAR_AU * 10 ** k).map((au) => (
        <line key={au} x1={at(au)} x2={at(au)} y1={42} y2={48} className="stroke-faint" />
      ))}
      <line x1={at(VOYAGER.au)} x2={r} y1={45} y2={45} strokeDasharray="2 4" className="stroke-muted/60" />
      <line x1={l} x2={at(VOYAGER.au)} y1={45} y2={45} strokeWidth={1.5} className="stroke-you/70" />
      {LIGHT.filter(([, au]) => au < far).map(([label, au]) => (
        <g key={label}>
          <line x1={at(au)} x2={at(au)} y1={48} y2={54} className="stroke-muted/60" />
          <text x={at(au)} y={64} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
            {label}
          </text>
        </g>
      ))}
      {MARKS.map((m, i) => (
        <g key={m.name}>
          {lift[i] > 0 && <line x1={at(m.au)} x2={at(m.au)} y1={42} y2={36 - lift[i]} className="stroke-faint" />}
          <circle cx={at(m.au)} cy={45} r={m.craft ? 2.5 : 2} className={m.craft ? "fill-you/80" : "fill-ink/60"} />
          <text
            x={at(m.au) + (i === 0 ? -2 : 0)}
            y={33 - lift[i]}
            textAnchor={i === 0 ? "start" : "middle"}
            className={`font-mono text-[8px] ${m.craft ? "fill-you/80" : "fill-muted"}`}
          >
            {m.name}
          </text>
        </g>
      ))}
      <circle cx={r} cy={45} r={3} className="fill-ink/70" />
      <circle cx={r} cy={45} r={6.5} className="fill-ink/10" />
      <text x={r + 3} y={33} textAnchor="end" className="fill-page-ink2 font-mono text-[8px]">
        {target.name}
      </text>
      <text x={l - 2} y={80} className="fill-muted/80 font-mono text-[7.5px]">
        each tick ten times farther · tap or drag to fly the map
      </text>
      <text x={r} y={80} textAnchor="end" className="fill-muted/80 font-mono text-[7.5px]">
        {lyOf(target.ly)} ly
      </text>
      {/* The map's view: where it is looking out to, now. */}
      <g ref={view} className="pointer-events-none">
        <line x1={0} x2={0} y1={37} y2={53} strokeWidth={1.25} className="stroke-other/80" />
        <path d="M-3.5 33 L3.5 33 L0 37.5 Z" className="fill-other/80" />
      </g>
    </svg>
  );
}

/** One road as a thread on the Years: the build, solid, the craft's wait, its flight, dashed, and its word home, dotted. */
export function Thread({ road, i, to }: { road: Road; i: number; to: number }) {
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
        {done !== null && (
          <>
            <circle cx={x(done)} cy={20} r={3} className="fill-you" />
            <text x={x(done)} y={10} textAnchor="middle" className="fill-you font-mono text-[8.5px]">
              built {year(done)}
            </text>
          </>
        )}
        {/* Both roads fly by, so the craft passes its star and never stops. A lens reaches the Sun's focus. */}
        {arrives !== null && (
          <>
            <circle cx={x(arrives)} cy={20} r={3.5} className="fill-ink" />
            <text x={x(arrives)} y={10} textAnchor="middle" className="fill-ink font-mono text-[8.5px]">
              {road.build === "Solar Lens" ? "at focus" : road.craft === "A sentinel" || road.craft === "A seed probe" ? "stays" : road.craft === "A Mind" ? "lands" : road.craft === "The Will" ? "lives there" : road.craft === "A pellet screen" ? "stands" : road.craft === "A bullet" ? "lands" : "passes"} {year(arrives)}
            </text>
          </>
        )}
        {/* A screen and a bullet send nothing home: their Year is when they stand or land. */}
        {home !== null && road.craft !== "A pellet screen" && road.craft !== "A bullet" && (
          <>
            <circle cx={x(home)} cy={20} r={3} className="fill-other" />
            <text x={x(home)} y={36} textAnchor="middle" className="fill-other font-mono text-[8.5px]">
              we see it {year(home)}
            </text>
          </>
        )}
      </g>
    </svg>
  );
}

/** The Years a destination's roads run to: the last word home, rounded up to a tick, and the step between ticks. */
export function axis(roads: Road[]) {
  const last = Math.max(...roads.map((r) => r.home ?? 0));
  const step = last <= 120 ? 20 : last <= 300 ? 50 : 100;
  return { to: Math.max(60, Math.ceil(last / step) * step), step };
}

/** Years along the bottom of the roads. */
export function Years({ to, step }: { to: number; step: number }) {
  const ticks = Array.from({ length: Math.floor(to / step) + 1 }, (_, k) => k * step);
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

/** What a road brings home, drawn. Both fly past, since stopping takes a fusion drive, and both send pictures. Only the
 *  probe reads the world's air, as the knowledge wall has it. 2026-10-25. */
export function Brings({ road }: { road: Road }) {
  const air = road.build === "Probe Yard";
  const item = (what: "pass" | "pictures" | "air", label: string, on = true) => (
    <span className={`flex items-center gap-1.5 ${on ? "text-page-ink2" : "text-muted/70"}`}>
      <BringsMark what={what} />
      {label}
    </span>
  );
  if (road.craft === "A Mind")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "stays for good")}
        {item("pictures", "thinks there")}
        {item("air", "a Mind of ours")}
      </div>
    );
  if (road.craft === "The Will")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "lives there")}
        {item("pictures", "news a light-time late")}
        {item("air", "orders a light-time late")}
      </div>
    );
  if (road.craft === "A pellet screen")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "stands on the line")}
        {item("pictures", "wrecks a bullet from here")}
        {item("air", "2 kt of pellets")}
      </div>
    );
  if (road.craft === "A bullet")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "lands with 110,000 Mt")}
        {item("pictures", "sends nothing home")}
        {item("air", "its flame seen only here")}
      </div>
    );
  if (road.craft === "A seed probe")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "stays, and copies itself")}
        {item("pictures", "sends pictures")}
        {item("air", "reads its air")}
      </div>
    );
  if (road.craft === "A sentinel")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pass", "stays to watch")}
        {item("pictures", "sends pictures")}
        {item("air", "reads its air")}
      </div>
    );
  if (road.build === "Solar Lens")
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
        {item("pictures", "pictures its face")}
        {item("air", "can’t read air", false)}
      </div>
    );
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px]">
      {item("pass", "flies past")}
      {item("pictures", "sends pictures")}
      {item("air", air ? "reads its air" : "can’t read air", air)}
    </div>
  );
}

/** What each line on a road means. Given one road, each says how many Years it takes from `from`, and the wait shows
 *  only when that road has one. Without a road it keys them all. */
export function Key({ road, from = 0 }: { road?: Road; from?: number }) {
  const span = (a: number | null, b: number | null) => (road && a !== null && b !== null ? ` ${year(b - a)} Years` : "");
  const wait = !road || (road.done !== null && road.leaves !== null && road.leaves > road.done);
  return (
    <div className="mt-1 mb-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-[3px] w-4 bg-you" />
        building{span(from, road?.done ?? null)}
      </span>
      {wait && (
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-4 bg-you/45" />
          waiting{span(road?.done ?? null, road?.leaves ?? null)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="w-4 border-t-2 border-dashed border-you" />
        flight{span(road?.leaves ?? null, road?.arrives ?? null)}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 border-t-2 border-dotted border-other" />
        back to us{span(road?.arrives ?? null, road?.home ?? null)}
      </span>
    </div>
  );
}

/** What could join the plan to bring the probe's word home soonest from a star `ly` away, if anything would by a Year
 *  or more. */
export function sooner(plan: Plan, scale: number, from: number, now: number | null, ly: number) {
  if (now === null) return null;
  let best: { name: string; by: number } | null = null;
  for (const name of ["Orbital Yard", "Thought Fields"]) {
    if (plan.builds.includes(name)) continue;
    const home = toward(roads({ ...plan, builds: [...plan.builds, name] }, scale, from)[1], ly).home;
    if (home !== null && now - home >= 1 && (!best || now - home > best.by)) best = { name, by: now - home };
  }
  return best;
}

/** The Mind's word on the roads to a star, from the charter and the plan. It advises, and queues nothing. */
export function says(
  name: string,
  plan: Plan,
  dials: number[],
  [sail, probe]: Road[],
  tip: ReturnType<typeof sooner>,
  slow: ReturnType<typeof moves>["late"],
  before: boolean,
) {
  if (sail.home === null) return `Neither road reaches ${name} within two centuries at our pace.`;
  const out = [`By sail, the first sight of ${name} reaches us in Year ${year(sail.home)}.`];
  if (before) {
    const { i, low } = lean(dials);
    if (i === 1 && low && !sail.n) out.push("Our charter leans to reach. The Laser Sail Array needs none of the matter we hold in orbit, so we would queue it.");
    else if (!(i === 1 && low)) out.push("We would wait on both. Our first builds pay back sooner.");
    if (slow)
      out.push(`The Probe Yard ${probe.n ? "slows" : "would slow"} our ${slow.name} by ${year(slow.by)} Years.`);
    if (probe.n && plan.builds.includes("Moon Vault")) out.push("With the vault, it takes all 20 kt we hold in orbit.");
  }
  if (probe.n && tip)
    out.push(`Queuing ${tip.name === "Orbital Yard" ? "an Orbital Yard" : "Thought Fields"} would let what the probe sees reach us ${Math.round(tip.by)} Years sooner.`);
  return out.join(" ");
}

export function Reach() {
  const { save, year: clock, orderAt } = useGame();
  const { fly } = useReach();
  const { leads, visits } = useLeads();
  const { plan } = usePlan();
  const { scale } = useSchedule();
  // Voyager 1, picked, takes the map out to it, and again home to the nearest star.
  const [out, setOut] = useState(false);
  const [hover, setHover] = useState(false);
  const voyager: Aim = {
    shown: out,
    lit: out || hover,
    toggle: () => {
      setOut(!out);
      fly(out ? FAR_ZOOM : zoomFor(VOYAGER.au));
    },
    point: setHover,
  };

  // Begun now: Year 0 before Begin, and after it the tenth of a Year, so the dates move at most every thirty seconds.
  // Ordered from a hole, it begins on Earth a light-time later. 2026-10-26.
  const from = orderAt === null ? 0 : Math.floor(orderAt * 10) / 10;
  const base = useMemo(() => roads(plan, scale, from), [plan, scale, from]);
  // Our leads' stars, nearest first, each with the soonest either road could arrive.
  const places = useMemo(
    () =>
      // What is here at home has no road to it. 2026-10-30.
      leads.filter((l) => l.art.kind !== "near")
        .sort((a, b) => a.ly - b.ly)
        .map((l) => {
          const at = base.map((r) => toward(r, l.ly).arrives).filter((y): y is number => y !== null);
          return { lead: l, soonest: at.length ? Math.min(...at) : null };
        }),
    [leads, base],
  );

  // Our sails and probe join Voyager 1 once they leave, each on its way from leaving to its word home from Proxima b.
  const flying: Row[] = base
    .filter((r) => r.n !== null && r.leaves !== null && r.home !== null && clock !== null && clock >= r.leaves)
    .map((r) => {
      const seen = visits.find((v) => v.by === (r.build === "Laser Sail Array" ? "sails" : "probe"));
      const they = r.build === "Laser Sail Array" ? "they" : "it";
      return {
        key: r.build,
        name: r.craft,
        note: seen
          ? `Passed Proxima b in Year ${year(r.arrives!)}. What ${they} saw has reached us: ${visitReading(seen).title.toLowerCase()}.`
          : clock! >= r.arrives!
            ? `Passed Proxima b in Year ${year(r.arrives!)}. What ${they} saw is on its way to us.`
            : `Bound for Proxima b at ${r.speed === 0.2 ? "a fifth" : "an eighth"} of light speed, passing it in Year ${year(r.arrives!)}.`,
        at: r.home,
        kind: "flight",
        msg: "to Proxima b",
        sent: YEAR_0 + r.leaves!,
        ly: NEAREST.ly,
      };
    });

  if (!save) return null;

  return (
    <div className="flex flex-col pb-4">
      <ListHead left={`Sent · ${1 + flying.length}`} right="Word home" className="mt-1" />
      <ul className="mt-1">
        {flying.map((r) => (
          <Item key={r.key} row={r} now={clock ?? 0} began={clock !== null} />
        ))}
        <Item row={SENT} now={clock ?? 0} began={clock !== null} aim={voyager} />
      </ul>

      <ListHead left={`Destinations · ${places.length}`} right="Soonest" className="mt-5" />
      <ul className="mt-1">
        {places.map(({ lead, soonest }) => (
          <li key={lead.slug} className="border-t border-faint">
            <Link to={`/reach/${lead.slug}`} className="block py-2.5">
              <Face
                mark={<LeadMark art={lead.art} />}
                tone={lead.reply ? "text-other" : "text-you"}
                name={<b className="font-semibold">{starName(lead.star)}</b>}
                line={`${lead.what} · ${lyOf(lead.ly)} ly`}
                right={soonest === null ? "Not yet" : `Year ${year(soonest)}`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
