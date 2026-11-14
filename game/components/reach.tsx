import { SAIL_C } from "@/lib/sim/speeds";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useGame } from "@/components/game-provider";
import { placeNames } from "@/components/inherit";
import { Item, type Row } from "@/components/journey";
import { BringsMark, BuildMark, LeadMark } from "@/components/marks";
import { type Aim, usePlan, useSchedule, WASH } from "@/components/picks";
import { useLeads } from "@/components/scan";
import { SkyArt } from "@/components/sky";
import { Face, ListHead } from "@/components/tab-head";
import { GlowOrderCard } from "@/components/glow-orders";
import { CRAFT_SHOT_SECS, type CraftKind } from "@/components/craft-view";
import type { Dials, Mark as Place } from "@/lib/drift";
import { steadySide } from "@/lib/steady-side";
import { YEAR_0, lyOf, yearText } from "@/lib/game/clock";
import { LANDMARKS } from "@/lib/game/landmarks";
import { chancesOf, rangeText } from "@/lib/game/chance";
import { type Lead, skyId, starName, visitReading } from "@/lib/game/leads";
import { type CraftOrder, lean, type moves, recall } from "@/lib/game/plan";
import { target as starOf } from "@/lib/game/sends";
import {
  auFor,
  LIGHT,
  LY_AU,
  MARKS,
  NEAR_AU,
  NEAREST,
  lensRoad,
  type Road,
  roads,
  flybyRoad,
  seedRoad,
  sentinelRoad,
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
// With thousands marked, as every other screen: "Year 80035.6" read raw until a playtest, 2026-11-01.
export const year = (y: number) => yearText(y);
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
  /** How far, in words, where we know only a range: a far warm glow. Playtest 2026-11-01. */
  far?: string;
  /** Its system, which Close View flies into. */
  system?: System;
}
const NEAREST_TARGET: Target = { id: NEAREST.name, name: NEAREST.name, ly: NEAREST.ly };
/** A lead's star as the map's target: named as we name it, with its distance in words where we know only a range. */
export const targetOf = (star: string, ly: number, system?: System, range?: [number, number]): Target => ({
  id: skyId(star),
  name: starName(star),
  ly,
  system,
  ...(range ? { far: `${lyOf(range[0])} to ${lyOf(range[1])} ly` } : {}),
});

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
  /** Flies the map to a zoom, or jumps there when motion is reduced, in `secs` if given. */
  fly(zoom: number, secs?: number): void;
  /** Holds the map at a zoom, as a drag does. */
  hold(zoom: number): void;
  /** Flies the map to a zoom after `delay` seconds, unless anything flies or holds it first, as a press on the ruler
   *  does. Gives back what calls it off. The walk's first stop flew out after a drag had put the map elsewhere until
   *  2026-11-08. */
  flyLater(delay: number, zoom: number, secs?: number): () => void;
  /** Out from Earth, a pause at Voyager 1, then on to the star in view, after `delay` seconds. */
  tour(delay?: number): void;
  /** Where the map and its ruler run out to. */
  target: Target;
  /** Turns the map to a destination and flies it out there, or with null, back to the nearest star. */
  aim(to: Target | null): void;
  /** In the destination's system, or not, and the way in and out. */
  close: boolean;
  setClose(on: boolean): void;
  /** Our craft on its way to the target, and its word home, drawn on the map. Null for none. */
  setTrip(trip: Trip | null): void;
  /** A craft up close over the map, for Reach's walk, and how many times its shot has run. Null for none. 2026-11-07. */
  craft: { kind: CraftKind; shot: number } | null;
  showCraft(kind: CraftKind | null): void;
  /** The walk's flight counter, drawn on the map by the flight. */
  countAt(n: HTMLSpanElement | null): void;
  /** Where a map mark is on screen now, in the map's pixels, as the scene last placed it. */
  markOf(id: string): { x: number; y: number } | null;
  noteMarks(marks: Place[]): void;
  setCount(text: string): void;
}

/** Where a craft is on its road, as shares of the way: out to its star, then its word back. */
export type Trip = { craft: number; signal: number };
export function tripAt(road: Pick<Road, "leaves" | "arrives" | "home">, now: number): Trip | null {
  const { leaves, arrives, home } = road;
  if (leaves === null || arrives === null || home === null || now >= home) return null;
  const share = (a: number, b: number) => Math.min(1, Math.max(0, (now - a) / Math.max(1e-9, b - a)));
  return { craft: share(leaves, arrives), signal: now <= arrives ? -1 : share(arrives, home) };
}

const ReachContext = createContext<ReachView>({
  dials: {},
  fly() {},
  hold() {},
  flyLater: () => () => {},
  tour() {},
  target: NEAREST_TARGET,
  aim() {},
  close: false,
  setClose() {},
  setTrip() {},
  craft: null,
  showCraft() {},
  countAt() {},
  markOf: () => null,
  noteMarks() {},
  setCount() {},
});
export const useReach = () => use(ReachContext);

/** The walk's flight, counted on the map by the flight itself. Empty when nothing flies. 2026-11-07. */
export function FlightCount() {
  const { countAt } = useReach();
  return <span ref={countAt} className="pointer-events-none absolute top-12 left-3 font-mono text-[13px] tracking-[.06em] text-other empty:hidden" />;
}

export function ReachProvider({ children }: { children: React.ReactNode }) {
  // With motion, one object for good: the tweens move it and the scene reads it each frame.
  const [dials, setDials] = useState<Dials>(() => ({ zoom: FAR_ZOOM }));
  // Without motion a jump is a new object, so the ruler redraws. The callbacks read it through a ref, so a jump never
  // makes them new: a page that aims on each new aim had jumped, and aimed again, for good. Fixed 2026-10-26.
  const now = useRef(dials);
  useEffect(() => void (now.current = dials), [dials]);
  const jump = useCallback((zoom: number) => setDials((d) => (d.zoom === zoom ? d : { ...d, zoom })), []);
  const later = useRef<gsap.core.Tween | null>(null);
  const fly = useCallback(
    (zoom: number, secs?: number) => {
      later.current?.kill();
      if (prefersReducedMotion()) return jump(zoom);
      const d = now.current;
      const far = Math.abs(zoom - (d.zoom ?? zoom));
      gsap.to(d, { zoom, duration: secs ?? Math.min(3, 0.5 + 0.35 * far), ease: "power2.inOut", overwrite: true });
    },
    [jump],
  );
  const hold = useCallback(
    (zoom: number) => {
      later.current?.kill();
      if (prefersReducedMotion()) return jump(zoom);
      gsap.killTweensOf(now.current);
      Object.assign(now.current, { zoom });
    },
    [jump],
  );
  const flyLater = useCallback(
    (delay: number, zoom: number, secs?: number) => {
      later.current?.kill();
      const call = gsap.delayedCall(delay, () => {
        later.current = null;
        fly(zoom, secs);
      });
      later.current = call;
      return () => void call.kill();
    },
    [fly],
  );
  const [target, setTarget] = useState<Target>(NEAREST_TARGET);
  // Close View: the scene reads it from the dials each frame, and the screen from here.
  const [close, setCloseState] = useState(false);
  const setClose = useCallback((on: boolean) => {
    Object.assign(now.current, { close: on ? 1 : 0 });
    setCloseState(on);
  }, []);
  const setTrip = useCallback((trip: Trip | null) => void Object.assign(now.current, trip ?? { craft: -1, signal: -1 }), []);
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
  const [craft, setCraft] = useState<{ kind: CraftKind; shot: number } | null>(null);
  const count = useRef<HTMLSpanElement | null>(null);
  const marks = useRef<Place[]>([]);
  const noteMarks = useCallback((m: Place[]) => void (marks.current = m), []);
  const markOf = useCallback((id: string) => marks.current.find((m) => m.id === id) ?? null, []);
  const countAt = useCallback((n: HTMLSpanElement | null) => void (count.current = n), []);
  const setCount = useCallback((text: string) => void (count.current && (count.current.textContent = text)), []);
  const showCraft = useCallback((kind: CraftKind | null) => setCraft((was) => (kind ? { kind, shot: (was?.shot ?? 0) + 1 } : null)), []);
  const value = useMemo(
    () => ({ dials, fly, hold, flyLater, tour, target, aim, close, setClose, setTrip, craft, showCraft, countAt, setCount, markOf, noteMarks }),
    [dials, fly, hold, flyLater, tour, target, aim, close, setClose, setTrip, craft, showCraft, countAt, setCount, markOf, noteMarks],
  );
  return <ReachContext value={value}>{children}</ReachContext>;
}

/** A craft's whole road played on the map, out to its star and its word home, five Years a second, and again. It
 *  starts as a close shot pulls back, after `delay` seconds, and `count` says on the map where it is, if given. Without
 *  motion it rests where it arrives. The walk's, shared with a way picked on a destination, 2026-11-08. */
export function useTripLoop(
  road: Pick<Road, "leaves" | "arrives" | "home"> | null,
  count?: (years: number, there: boolean, word: number) => string,
  delay = CRAFT_SHOT_SECS - 1,
) {
  const { setTrip, setCount } = useReach();
  // Its words read through a ref, so new words each render never restart the flight.
  const words = useRef(count);
  useEffect(() => void (words.current = count));
  const [leaves, arrives, home] = [road?.leaves ?? null, road?.arrives ?? null, road?.home ?? null];
  useEffect(() => {
    if (leaves === null || arrives === null || home === null) return;
    const way = { leaves, arrives, home };
    const show = (t: number) => {
      setTrip(tripAt(way, leaves + Math.min(t, home - leaves - 1e-6)));
      const say = words.current;
      if (say) setCount(say(Math.floor(t), leaves + t >= arrives, Math.floor(leaves + t - arrives)));
    };
    const stop = () => {
      setTrip(null);
      if (words.current) setCount("");
    };
    if (prefersReducedMotion()) {
      show(arrives - leaves);
      return stop;
    }
    // Five Years a second, so a sail's 21 Years and a probe's 52 read as the gap they are.
    const o = { t: 0 };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay });
    tl.fromTo(o, { t: 0 }, { t: home - leaves, duration: (home - leaves) / 5, ease: "none", onUpdate: () => show(o.t) });
    return () => {
      tl.kill();
      stop();
    };
  }, [leaves, arrives, home, delay, setTrip, setCount]);
}

/** Craft of one kind folded into one row: a line of where each is, from leaving to its word home, and opened, each.
 *  The probes and sails we sent past stars first, 2026-11-05, every kind of craft 2026-11-08. */
function Fleet({ title, build, rows, now, children }: { title: string; build: string; rows: { id: string; leaves: number; home: number }[]; now: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!rows.length) return null;
  const home = rows.filter((r) => r.home <= now).length;
  // None gone yet says when the first goes: "On their way" read as flying for probes that leave in Year 37.7. Blind
  // playtest 2026-11-07.
  const first = Math.min(...rows.map((r) => r.leaves));
  const next = Math.min(...rows.filter((r) => r.home > now).map((r) => r.home));
  const line = now < first ? `The first leaves in Year ${year(first)}.` : home === rows.length ? "All have sent word home." : `${home ? `${home} have sent word home. ` : ""}Next word home in Year ${year(next)}.`;
  return (
    <li className="border-t border-faint">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="block w-full py-2.5 text-left">
        <Face mark={<BuildMark name={build} />} tone="text-you" name={<b className="font-semibold">{title} · {rows.length}</b>} line={line} right={open ? "Close" : "Open"} more={false} />
        {/* Each craft on one line, from leaving to its word home. */}
        <span className="relative mt-1.5 ml-7 block h-3" aria-hidden>
          <i className="absolute inset-x-0 top-1/2 border-t border-dashed border-faint" />
          {rows.map((r, i) => {
            const f = Math.max(0, Math.min(1, (now - r.leaves) / Math.max(0.1, r.home - r.leaves)));
            return (
              <i
                key={r.id}
                className={`absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 animate-fade rounded-full motion-reduce:animate-none ${f >= 1 ? "bg-other" : now < r.leaves ? "bg-muted/60" : "bg-you"}`}
                style={{ left: `${f * 100}%`, animationDelay: `${i * 30}ms` }}
              />
            );
          })}
        </span>
      </button>
      {open && children}
    </li>
  );
}

/** The probes and sails we sent past stars: there can be dozens. Opened, each by its glow's chance of a mind,
 *  likeliest first. 2026-11-05. */
function Flybys({ rows, now, aimAt }: { rows: { id: string; slug?: string; name: string; mind?: string; mindAt: number; note: string; home: number; leaves: number; craft: CraftKind | null; recall?: () => void }[]; now: number; aimAt(id: string): Aim }) {
  const sorted = [...rows].sort((a, b) => b.mindAt - a.mindAt || a.home - b.home);
  return (
    <Fleet title="Flyby probes and sails" build="Probe Yard" rows={rows} now={now}>
        <ul className="mb-1 pl-7">
          {sorted.map((r) => {
            const words = (
              <>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium">{r.name}</span>
                  <span className="block text-[12px] leading-snug text-muted">{r.note}</span>
                </span>
                {r.mind && <span className="shrink-0 font-mono text-[11.5px] text-other tabular-nums">Mind {r.mind}</span>}
              </>
            );
            // Its destination shows it on the map, the craft up close too. With no destination to open, as a glow we
            // no longer list, it shows on the map here: it linked back to Reach and did nothing until 2026-11-08.
            const aim = aimAt(r.id);
            return (
              <li key={r.id} className="border-t border-faint first:border-t-0">
                {r.slug ? (
                  <Link to={`/play/reach/${r.slug}`} state={{ craft: r.craft }} className="flex items-baseline justify-between gap-3 py-1.5">
                    {words}
                  </Link>
                ) : (
                  <button
                    onClick={aim.toggle}
                    onPointerEnter={() => aim.point(true)}
                    onPointerLeave={() => aim.point(false)}
                    aria-pressed={aim.shown}
                    className={`flex w-full items-baseline justify-between gap-3 py-1.5 text-left transition-colors duration-200 ${aim.lit ? WASH : ""}`}
                  >
                    {words}
                  </button>
                )}
                {r.recall && <CancelCraft go={r.recall} />}
              </li>
            );
          })}
        </ul>
    </Fleet>
  );
}

/** Cancels a craft that has not left. Inside a row that shows on the map, so a tap here only cancels it. */
function CancelCraft({ go }: { go(): void }) {
  return (
    <div className="mt-1.5 flex justify-end pl-7">
      <button
        onClick={(e) => {
          e.stopPropagation();
          go();
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="h-7 rounded-full border border-faint px-3 text-[12.5px] font-medium hover:border-ink"
      >
        Cancel
      </button>
    </div>
  );
}

/** How many destinations show before All. */
const FEW = 5;

/** Every destination on one line by distance, ten times farther at each tick, so the near and the Galaxy-wide fit
 *  together. Ours on the way or reached are lit. 2026-11-08. */
function Spread({ places }: { places: { lead: Lead; reached: number | null; bound: number | null }[] }) {
  if (places.length < 2) return null;
  const top = Math.max(5, Math.ceil(Math.log10(Math.max(...places.map((p) => p.lead.range?.[1] ?? p.lead.ly)))));
  const x = (ly: number) => 2 + (Math.max(0, Math.log10(Math.max(1, ly))) / top) * 96;
  return (
    <div className="mt-2 mb-1" aria-hidden>
      <div className="relative h-4">
        <i className="absolute inset-x-[2%] top-1/2 h-px bg-faint" />
        {places.map((p, i) => {
          const ours = p.reached !== null || p.bound !== null;
          return (
            <i
              key={p.lead.slug}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade rounded-full motion-reduce:animate-none ${ours ? "size-2 bg-you" : p.lead.reply ? "size-1.5 bg-other" : "size-1 bg-muted/60"}`}
              style={{ left: `${x(p.lead.range ? Math.sqrt(p.lead.range[0] * p.lead.range[1]) : p.lead.ly)}%`, animationDelay: `${i * 15}ms` }}
            />
          );
        })}
      </div>
      {/* The tick before the farthest goes unlabeled: the farthest, ending at its mark, ran into it, “10,000 ly100,000 ly”.
          Screen critic, 2026-11-08. */}
      <div className="relative h-3 font-mono text-[10px] text-muted">
        {Array.from({ length: top }, (_, k) => k + 1)
          .filter((k) => (k % (top > 5 ? 2 : 1) === 0 || k === 1) && k !== top - 1).map((k) => (
          // The farthest tick ends at its mark, not centered on it, so “100,000 ly” stays inside the panel on one line.
          // It ran off the edge and wrapped “ly” under itself. Screen critic, 2026-11-08.
          <span key={k} className={`absolute whitespace-nowrap ${k === top ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${x(10 ** k)}%` }}>
            {(10 ** k).toLocaleString("en-US")} ly
          </span>
        ))}
      </div>
    </div>
  );
}

/** What the map names on the way out, by the scene's marks. */
const NAMES: Record<string, string> = {
  earth: "Earth",
  moon: "the Moon · south-pole stations",
  l2: "Roman · JWST · L2",
  sun: "the Sun",
  home: "Sol",
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
  const dx = steadySide(card, x, w * 0.55) ? -14 - card.offsetWidth : 14;
  const dy = Math.min(Math.max(-card.offsetHeight / 2, 8 - y), h - 8 - y - card.offsetHeight);
  card.style.transform = `translate(${dx}px, ${dy}px)`;
  n.style.transform = `translate(${x}px, ${y}px)`;
  n.style.opacity = String(a > 0.3 && x > 0 && x < w && y > 0 && y < h ? 1 : 0);
}

/** The map on Reach: the flight out from Earth, and its places named. The ruler along its bottom says how far it looks.
 *  It flies out once each time the tab opens. */
export function ReachMap({ className }: { className: string }) {
  const { dials, tour, target, noteMarks } = useReach();
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const toured = useRef(false);
  // The scene rings the star it is given, and the name follows it.
  const star = useMemo(() => [target.id], [target.id]);
  const named: Record<string, string> = { ...NAMES, alpha: `${target.name} · ${target.far ?? `${lyOf(target.ly)} ly`}` };
  target.system?.worlds.forEach((w, i) => {
    named[`w${i}`] = worldName(w);
  });
  const sights = useRef<Place[]>([]);
  const sight = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<string | null>(null);
  const onMarks = useCallback((marks: Place[]) => {
    noteMarks(marks);
    placeNames(names.current, marks);
    sights.current = marks.filter((m) => m.id in SIGHTS);
    const n = sight.current;
    const m = sights.current.find((m) => m.id === n?.dataset.id);
    if (n && m) placeSight(n, m);
  }, [noteMarks]);
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
  // Labels climb as the marks crowd toward our farthest craft, a full line each: at 10 px apart “New Horizons” sat on
  // “Neptune” on a phone. Screen critic, 2026-11-09.
  const lift = [0, 0, 0, 0, 12, 24];

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
        // A press takes the map where it is, and calls off any flight still to come. 2026-11-08.
        hold(dials.zoom ?? end);
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
      {/* Its name ends short of the view's mark, which stands at the end when the map looks out that far and cut it. */}
      <text x={r - 6} y={33} textAnchor="end" className="fill-page-ink2 font-mono text-[8px]">
        {target.name}
      </text>
      <text x={l - 2} y={80} className="fill-muted/80 font-mono text-[7.5px]">
        each tick ten times farther · tap or drag to fly the map
      </text>
      <text x={r} y={80} textAnchor="end" className="fill-muted/80 font-mono text-[7.5px]">
        {target.far ?? `${lyOf(target.ly)} ly`}
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
  // A label stays whole inside the view: "built 603.8" lost its start to the left edge until 2026-11-05.
  const met = road.build === "Solar Lens" ? "at focus" : road.craft === "A sentinel" || road.craft === "A seed probe" ? "stays" : road.craft === "A Mind" ? "lands" : road.craft === "The Will" ? "lives there" : road.craft === "A pellet screen" ? "stands" : road.craft === "A bullet" ? "lands" : "passes";
  const inView = (at: number, words: string) => {
    const half = words.length * 2.6 + 1;
    return Math.min(W - half, Math.max(half, at));
  };
  const { done, leaves, arrives, home } = road;
  // Long after a craft flew, its build and its pass sit close on a long axis: "built" gives way so "passes" reads
  // whole. They printed over each other until 2026-11-05.
  const builtWords = done === null ? "" : `built ${year(done)}`;
  const metWords = arrives === null ? "" : `${met} ${year(arrives)}`;
  const crowded =
    done !== null && arrives !== null &&
    Math.abs(inView(x(done), builtWords) - inView(x(arrives), metWords)) < (builtWords.length + metWords.length) * 2.6 + 6;
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
            {!crowded && (
              <text x={inView(x(done), builtWords)} y={10} textAnchor="middle" className="fill-you font-mono text-[8.5px]">
                {builtWords}
              </text>
            )}
          </>
        )}
        {/* Both roads fly by, so the craft passes its star and never stops. A lens reaches the Sun's focus. */}
        {arrives !== null && (
          <>
            <circle cx={x(arrives)} cy={20} r={3.5} className="fill-ink" />
            <text x={inView(x(arrives), `${met} ${year(arrives)}`)} y={10} textAnchor="middle" className="fill-ink font-mono text-[8.5px]">
              {met} {year(arrives)}
            </text>
          </>
        )}
        {home !== null && (
          <>
            <circle cx={x(home)} cy={20} r={3} className="fill-other" />
            <text x={inView(x(home), `we see it ${year(home)}`)} y={36} textAnchor="middle" className="fill-other font-mono text-[8.5px]">
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
  // Past 300 Years, a round step that keeps about eight ticks: a sentinel to a warm glow 10,000 ly off drew a tick
  // every 100 Years to Year 88,000, and their labels ran together into thick bars. Playtest 2026-11-13.
  const step = last <= 120 ? 20 : last <= 300 ? 50 : niceStep(last / 8);
  return { to: Math.max(60, Math.ceil(last / step) * step), step };
}

/** The least of 1, 2 or 5 times a power of ten that is at least `x`, and at least 100. */
function niceStep(x: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(100, x)));
  return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= x) ?? 10 * p;
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
            {t ? t.toLocaleString("en-US") : "Year 0"}
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
          {/* Says what the wait is: "waiting 12 Years" read as unexplained. Blind playtest 2026-11-07. */}
          readying the craft{span(road?.done ?? null, road?.leaves ?? null)}
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
  const { fly, aim, setTrip, showCraft } = useReach();
  const { leads, visits, readings } = useLeads();
  const { plan, change } = usePlan();
  const { scale } = useSchedule();
  // A craft row, picked, shows it on the map: its star, where it is on its road, and the craft up close. One at a time,
  // and picked again, the map goes back to what it shows by itself. Voyager 1 takes the map out to it. 2026-11-08.
  const [picked, setPicked] = useState<string | null>(null);
  const [pointed, setPointed] = useState<string | null>(null);
  const aimAt = (id: string): Aim => ({
    shown: picked === id,
    lit: picked === id || pointed === id,
    toggle: () => setPicked(picked === id ? null : id),
    point: (on) => setPointed((p) => (on ? id : p === id ? null : p)),
  });

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
          // A road that has flown went to the nearest star, so a time already past is no road to any other. At Year
          // 20,858, Proxima's soonest still read Year 125.1. Playtest 2026-11-01.
          const ly = l.range?.[0] ?? l.ly;
          const ahead = base.map((r) => toward(r, ly, from).arrives).filter((y): y is number => y !== null && y > from);
          // What we truly sent: Proxima's first roads, flown by themselves, and any sail or probe sent from a page. Only
          // these reach a star: Proxima read "Reached" with no craft sent until 2026-11-05.
          const sent = [
            ...(l.star === NEAREST.name ? base.filter((r) => r.n !== null).map((r) => toward(r, ly).arrives) : []),
            ...(plan.flybys ?? []).filter((o) => o.name === l.star).map((o) => flybyRoad(plan, scale, o.y, o).arrives),
          ].filter((y): y is number => y !== null);
          const past = sent.filter((y) => y <= from);
          const coming = sent.filter((y) => y > from);
          return {
            lead: l,
            soonest: ahead.length ? Math.min(...ahead) : null,
            reached: past.length ? Math.min(...past) : null,
            bound: coming.length ? Math.min(...coming) : null,
          };
        }),
    [leads, base, from, plan, scale],
  );
  // Cold glows no craft of ours has seen up close gather in one row, as on Scan, and faded warm glows we haven't
  // messaged in another. Playtest 2026-11-01.
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  // The nearest few, the rest behind All. 2026-11-08.
  const [allPlaces, setAllPlaces] = useState(false);
  const messaged = new Set((save?.sent ?? []).map((m) => m.to));
  type Place = (typeof places)[number];
  const groups = [
    {
      key: "cold-glows",
      title: "Cold glows",
      line: "A sentinel can go to any of them",
      test: (p: Place) => p.lead.slug.startsWith("cold-glow-") && !p.lead.facts.some(([k]) => k === "Up close" || k === "Resolved"),
    },
    {
      key: "faded-glows",
      title: "Faded warm glows",
      line: "A message or a craft can go to any of them",
      test: (p: Place) => p.lead.slug.startsWith("warm-glow-") && p.lead.facts.some(([k]) => k === "Faded") && !messaged.has(p.lead.star),
    },
  ].map((g) => ({ ...g, members: places.filter(g.test) }));
  const groupOf = (p: Place) => groups.find((g) => g.members.length > 1 && g.test(p));
  const shown = places.filter((p) => {
    const g = groupOf(p);
    return !g || p === g.members[0];
  }).length;

  // Our sails and probe join Voyager 1 once they leave, each on its way from leaving to its word home from Proxima b.
  const flying = base
    .filter((r) => r.n !== null && r.leaves !== null && r.home !== null && clock !== null && clock >= r.leaves)
    .map((r) => {
      const seen = visits.find((v) => v.star === NEAREST.name && v.by === (r.build === "Laser Sail Array" ? "sails" : "probe"));
      const they = r.build === "Laser Sail Array" ? "they" : "it";
      return {
        key: r.build,
        name: r.craft,
        note: seen
          ? `Passed Proxima b in Year ${year(r.arrives!)}. What ${they} saw has reached us: ${visitReading(seen).title.toLowerCase()}.`
          : clock! >= r.arrives!
            ? `Passed Proxima b in Year ${year(r.arrives!)}. What ${they} saw is on its way to us.`
            : `Bound for Proxima b at ${r.speed === SAIL_C ? "a fifth" : "a tenth"} of light speed, passing it in Year ${year(r.arrives!)}.`,
        at: r.home,
        kind: "flight" as const,
        msg: "to Proxima b",
        sent: YEAR_0 + r.leaves!,
        ly: NEAREST.ly,
        road: r,
        craft: (r.build === "Laser Sail Array" ? "sail" : "probe") as CraftKind,
      };
    });

  // Our craft sent to other stars: lenses, sentinels, seed probes, and sails and probes passing. Reach listed only
  // Voyager 1 after all of these went, playtest 2026-11-01, and each showed only once it left, so a send seemed to do
  // nothing until 2026-11-05.
  const stays: (Row & { id: string; star: string; y: number; home: number; road: Road; flyby: boolean; craft: CraftKind | null; recall?: () => void })[] = clock === null ? [] : [
    ...(plan.lenses ?? []).map((o) => ({ o, road: lensRoad(plan, scale, from, o.name), what: "A lens", to: "at its Sun’s focus, toward", order: "lens" as CraftOrder })),
    ...(plan.sentinels ?? []).map((o) => ({ o, road: sentinelRoad(plan, scale, from, o.name, leads.find((l) => l.star === o.name)?.ly ?? starOf(o.name)?.d ?? 0), what: "A sentinel", to: "to stay at", order: "sentinel" as CraftOrder })),
    ...(plan.seeds ?? []).map((o) => ({ o, road: seedRoad(plan, scale, from, o.name, starOf(o.name)?.d ?? 0), what: "A seed probe", to: "to stay at", order: "seed" as CraftOrder })),
    ...(plan.flybys ?? []).map((o) => ({ o, road: flybyRoad(plan, scale, o.y, o), what: o.by === "sails" ? "Sails" : "A flyby probe", to: "to pass", order: o.by as CraftOrder })),
  ].flatMap(({ o, road: r, what, to, order }) => {
    // A lens and a seed probe have no close-up of their own yet.
    const craft: CraftKind | null = what === "Sails" ? "sail" : what === "A flyby probe" ? "probe" : what === "A sentinel" ? "sentinel" : null;
    if (r.leaves === null || r.home === null || r.arrives === null) return [];
    const star = starName(o.name);
    const there = what === "A lens" ? `Reached its focus in Year ${year(r.arrives)}` : to === "to pass" ? `Passed ${star} in Year ${year(r.arrives)}` : `Reached ${star} in Year ${year(r.arrives)}`;
    return [{
      star: o.name,
      y: o.y,
      home: r.home,
      road: r,
      craft,
      flyby: to === "to pass",
      // Until it leaves, we can cancel it. It said sent, and could not be, while it waited Years to go. 2026-11-10.
      recall: clock < r.leaves ? () => change((p) => recall(p, order, o.name)) : undefined,
      id: `${what}:${o.name}`,
      key: r.build,
      name: `${what}, ${star}`,
      note: clock < r.leaves ? `Leaves in Year ${year(r.leaves)}, bound ${to} ${star}, arriving in Year ${year(r.arrives)}.` : clock >= r.home ? `${there}. Its first word has reached us.` : clock >= r.arrives ? `${there}. Its first word is on its way to us.` : `Bound ${to} ${star}, arriving in Year ${year(r.arrives)}.`,
      at: r.home,
      kind: "flight" as const,
      msg: `to ${star}`,
      sent: YEAR_0 + r.leaves,
      ly: what === "A lens" ? 3 / 365.25 : "d" in o ? (o.d as number) : (leads.find((l) => l.star === o.name)?.ly ?? starOf(o.name)?.d ?? 0),
    }];
  });

  // Voyager 1 stands for what we have sent only until we order a craft of our own: beside one it read as clutter.
  // 2026-11-08, from the order rather than the leaving since 2026-11-10.
  const gone = flying.length > 0 || stays.length > 0;

  // The map shows the way to our latest craft still on its way, or the nearest star with none. 2026-11-05. A craft
  // picked shows its own way instead, 2026-11-08.
  const latest = [...stays].filter((s) => (clock ?? 0) < s.home).sort((a, b) => b.y - a.y)[0];
  const pick = picked === SENT.key ? null : [...flying.map((r) => ({ ...r, id: r.key, star: NEAREST.name })), ...stays].find((r) => r.id === picked);
  const shows = picked === null ? latest : pick;
  const bound = shows?.star;
  // And the craft itself on the way, then its word coming home, a tenth of a Year at a time.
  const trip = shows && clock !== null ? tripAt(shows.road, Math.floor(clock * 10) / 10) : null;
  const [tripCraft, tripSignal] = [trip?.craft, trip?.signal];
  useEffect(() => {
    if (tripCraft === undefined) return;
    setTrip({ craft: tripCraft, signal: tripSignal! });
    return () => setTrip(null);
  }, [setTrip, tripCraft, tripSignal]);
  // With none bound, the nearest star as its lead, with its system, so Close View flies into it on Reach too. Its
  // plain target had no system, so the tab had no Close View. 2026-11-08.
  const going = leads.find((l) => l.star === bound) ?? leads.find((l) => l.star === NEAREST.name);
  // A star we have no lead on, as a glow forgotten: its star as the row has it.
  const [goingStar, goingLy, goingSystem, goingRange] = going ? [going.star, going.ly, going.system, going.range] : [bound, shows?.ly, undefined, undefined];
  useEffect(() => {
    if (goingStar) aim(targetOf(goingStar, goingLy ?? NEAREST.ly, goingSystem, goingRange));
    else aim(null);
    if (picked === SENT.key) fly(zoomFor(VOYAGER.au));
    return () => aim(null);
  }, [aim, fly, picked, goingStar, goingLy, goingSystem, goingRange]);
  // The picked craft up close, played again with each pick.
  const upClose: CraftKind | null = picked === SENT.key ? "voyager" : (pick?.craft ?? null);
  useEffect(() => {
    if (!upClose) return;
    showCraft(upClose);
    return () => showCraft(null);
  }, [upClose, picked, showCraft]);

  // A lead's chance of a mind, where we have a word on it, as Scan shows it. 2026-11-05.
  const mindOf = (lead: Lead) => {
    const c = chancesOf(lead, readings[lead.slug] ?? []);
    if (c?.ruledOut) return " · Mind ruled out";
    const m = c?.mind;
    return m && m !== "unknown" ? ` · Mind ${rangeText(m)}` : "";
  };
  if (!save) return null;

  const place = ({ lead, soonest, reached, bound }: (typeof places)[number]) => (
    <li key={lead.slug} className="border-t border-faint">
      <Link to={`/play/reach/${lead.slug}`} className="block py-2.5">
        <Face
          mark={<LeadMark art={lead.art} />}
          tone={lead.reply ? "text-other" : "text-you"}
          name={<b className="font-semibold">{starName(lead.star)}</b>}
          line={`${lead.what} · ${lead.range ? `${lyOf(lead.range[0])} to ${lyOf(lead.range[1])}` : lyOf(lead.ly)} ly${mindOf(lead)}`}
          right={reached !== null ? `Reached, Year ${year(reached)}` : bound !== null ? `${clock === null ? "" : "On its way, "}Year ${year(bound)}` : soonest !== null ? `Year ${year(soonest)}` : "Not yet"}
        />
      </Link>
    </li>
  );

  return (
    <div className="flex flex-col pb-4">
      <GlowOrderCard from={from} />

      {/* "Sent" read as our messages too, and a blind first-timer missed theirs here twice. 2026-11-07. */}
      {/* "Craft sent · 2" counted a sentinel still Years from leaving. 2026-11-10. */}
      <ListHead left={`Craft · ${(gone ? 0 : 1) + flying.length + stays.length}`} right="Word home" className="mt-4" />
      <ul className="mt-1">
        {flying.map((r) => (
          <Item key={r.key} row={r} now={clock ?? 0} began={clock !== null} aim={aimAt(r.key)} />
        ))}
        {/* Two or more of a kind fold into one row, a line of where each is, opened for each. 2026-11-08. */}
        {(["A lens", "A sentinel", "A seed probe"] as const).map((what) => {
          const kin = stays.filter((r) => !r.flyby && r.id.startsWith(`${what}:`));
          if (kin.length < 2)
            return kin.map((r) => <Item key={r.id} row={r} now={clock ?? 0} began={clock !== null} aim={aimAt(r.id)}>
                    {r.recall && <CancelCraft go={r.recall} />}
                  </Item>);
          return (
            <Fleet
              key={what}
              title={{ "A lens": "Lenses", "A sentinel": "Sentinels", "A seed probe": "Seed probes" }[what]}
              build={kin[0].key}
              rows={kin.map((r) => ({ id: r.id, leaves: r.road.leaves ?? r.home, home: r.home }))}
              now={clock ?? 0}
            >
              <ul className="mb-1 pl-7">
                {kin.map((r) => (
                  <Item key={r.id} row={r} now={clock ?? 0} began={clock !== null} aim={aimAt(r.id)}>
                    {r.recall && <CancelCraft go={r.recall} />}
                  </Item>
                ))}
              </ul>
            </Fleet>
          );
        })}
        <Flybys
          now={clock ?? 0}
          rows={stays.filter((r) => r.flyby).map((r) => {
            const lead = leads.find((l) => l.star === r.star);
            const c = lead ? chancesOf(lead, readings[lead.slug] ?? []) : null;
            const m = c?.mind && c.mind !== "unknown" ? c.mind : null;
            return { id: r.id, slug: lead?.slug, name: r.name, note: r.note, home: r.home, leaves: r.road.leaves ?? r.home, craft: r.craft, recall: r.recall, mind: c?.ruledOut ? "ruled out" : m ? rangeText(m) : undefined, mindAt: m ? (m.lo + m.hi) / 2 : -1 };
          })}
          aimAt={aimAt}
        />
        {!gone && <Item row={SENT} now={clock ?? 0} began={clock !== null} aim={aimAt(SENT.key)} />}
      </ul>
      {/* Craft are here, and our messages on Scan: a blind first-timer looked for a message just sent, found only
          Voyager, and had to ask the Mind where it went. 2026-11-07. */}
      <Link to="/play#messages" className="border-t border-faint py-2.5 text-[13px] text-page-ink2 hover:text-ink">
        {(save?.sent ?? []).length ? `Our messages, ${(save?.sent ?? []).length.toLocaleString("en-US")} sent, are on Scan. To send one, open a destination below` : "Messages we send are listed on Scan. To send one, open a destination below"}{" "}
        <span className="text-you">›</span>
      </Link>

      <ListHead left={`Destinations · ${places.length}`} right="Soonest" className="mt-5" />
      <Spread places={places} />
      <ul className="mt-1">
        {places
          .filter((p) => {
            const g = groupOf(p);
            return !g || p === g.members[0];
          })
          .slice(0, allPlaces ? undefined : FEW)
          .map((p) => {
          const g = groupOf(p);
          if (!g) return place(p);
          const open = openGroup === g.key;
          const near = (q: Place) => q.lead.range?.[0] ?? q.lead.ly;
          const far = (q: Place) => q.lead.range?.[1] ?? q.lead.ly;
          const soonest = g.members.map((q) => q.soonest).filter((y): y is number => y !== null);
          return (
            <li key={g.key} className="border-t border-faint">
              <button onClick={() => setOpenGroup(open ? null : g.key)} aria-expanded={open} className="block w-full py-2.5 text-left">
                <Face
                  mark={<LeadMark art={p.lead.art} />}
                  tone="text-you"
                  name={<b className="font-semibold">{g.title} · {g.members.length.toLocaleString("en-US")}</b>}
                  line={`${g.line} · ${lyOf(Math.min(...g.members.map(near)))} to ${lyOf(Math.max(...g.members.map(far)))} ly`}
                  right={soonest.length ? `Year ${year(Math.min(...soonest))}` : "Not yet"}
                  more={false}
                />
              </button>
              {open && <ul className="mb-1 pl-5">{g.members.map(place)}</ul>}
            </li>
          );
        })}
      </ul>
      {shown > FEW && (
        <button onClick={() => setAllPlaces(!allPlaces)} className="border-t border-faint py-2.5 text-left text-[13px] text-you">
          {allPlaces ? "Fewer ‹" : `All ${shown.toLocaleString("en-US")} ›`}
        </button>
      )}
    </div>
  );
}

