import { useGame } from "@/components/game-provider";
import { useLocation } from "react-router";
import { Arrival } from "@/components/arrival";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BeamsMap, useBeams } from "@/components/beams";
import { BeginOnMap } from "@/components/begin";
import { useTalkSubject } from "@/components/mind-chat";
import { IdleNote } from "@/components/idle-note";
import { Through } from "@/components/through";
import { WideLeads } from "@/components/wide-leads";
import { Globe, Lens } from "@/components/icons";
import { FlightCount, ReachMap, Ruler, useReach } from "@/components/reach";
import { MapKey } from "@/components/leads";
import { ScanMap, useLeads, useStepTap } from "@/components/scan";
import { SkyArt, useSky } from "@/components/sky";
import { placedOf, useWorks, WorksMap } from "@/components/works";
import { useJumpLead } from "@/components/jump";
import { usePlan, useSchedule } from "@/components/picks";
import type { Stop } from "@/lib/flight";
import type { Mark, SimMind } from "@/lib/drift";
import type { Place } from "@/lib/game/named-places";
import { placeLabel } from "@/components/place-label";
import { PLANETS } from "../../src/astronomy.js";
import { CraftView } from "@/components/craft-view";
import { CLOSE } from "@/lib/game/close";
import { type Lead, starName } from "@/lib/game/leads";

// The map's five stops, and its outward button: each tap travels one stop out, and the last comes home.
const STAGES: { id: Stop; name: string; next: string }[] = [
  { id: "earth", name: "EARTH", next: "Solar System" },
  { id: "solar", name: "SOLAR SYSTEM", next: "Nearby Stars" },
  { id: "stars", name: "NEARBY STARS", next: "Milky Way" },
  { id: "galaxy", name: "MILKY WAY", next: "Other Galaxies" },
  { id: "group", name: "LOCAL GROUP", next: "Back to Earth" },
];

const LABEL =
  "pointer-events-none absolute top-2 left-2.5 rounded-[9px] border border-faint bg-paper px-[7px] py-0.5 font-mono text-[9.5px] tracking-[.06em]";
const PILL = "inline-flex h-8 items-center gap-1.5 rounded-full border border-faint bg-paper pr-3 pl-2.5 text-xs";
const BUTTON = `absolute right-2.5 bottom-3 ${PILL}`;

// The board: a strip of the map under the top bar, a window onto the game's one sky, which flies here from the
// charter. On Scan and a lead's page it shows Earth's leads, and a lead open whose system we know has a Close View into
// it. On Build, a build's page takes it to where it would stand,
// and Close View on down to the ground there, where a drag walks round it. On Reach it flies out from Earth to the
// nearest star. A message picked on Scan takes it out to its star. Elsewhere it rests at a stop, turning slowly,
// travels outward a stop a tap, and turns with a drag. A lens marks going closer or farther, and Earth coming home.
export function MapStrip() {
  const { pathname: path, search } = useLocation();
  // The walkthroughs, the Scan review and the Build tour, need room under the map on a phone for the Mind's words.
  // Build before Begin is the Mind's guide, so it gets that room too: under a 45% map its words and the first builds
  // sat under the tab bar. Screen critic, 2026-11-08.
  const { year } = useGame();
  const guided = /[?&](review|tour)\b/.test(search) || (path === "/play/build" && year === null);
  const scan = path === "/play" || path.startsWith("/play/lead/");
  // On the Mind tab, the map opens on what our talk is on, until sent home. 2026-11-04.
  const subject = useTalkSubject();
  const [sentHome, setSentHome] = useState<string | null>(null);
  const talking = path === "/play/mind" && subject && subject.from !== sentHome ? subject : null;
  const talked = talking?.lead ?? null;
  // Or the build the Mind offers, where it would stand, as its page shows it. 2026-11-08.
  const talkedBuild = talking?.build ?? null;
  // Or a star that isn't a lead, two places side by side, or a stop the Will asks for. 2026-11-08.
  const talkedPlaces = talking?.places ?? null;
  const talkedStop = talking?.stop ?? null;
  // A jump's card open off Scan shows its lead there too, until the card closes. 2026-11-08.
  // But not over a page about one thing, a destination on Reach or a build: Tau Ceti's Reach page showed Groombridge 34
  // from the card. Blind playtest 2026-11-08.
  const onePage = /^\/play\/(reach|build)\/./.test(path);
  const jumped = useJumpLead();
  // Reach's map stays on a destination's page, and flies out to its star.
  const reaching = path === "/play/reach" || path.startsWith("/play/reach/");
  const beams = useBeams();
  // A message just sent from the Mind shows there too. 2026-11-07.
  const aimed = (path === "/play" || path === "/play/mind") && beams.picked !== null;
  const works = useWorks();
  const built = (path === "/play/build" || path.startsWith("/play/build/")) && works.picked !== null;
  const reach = useReach();
  // Where a close-up pulls back to: Voyager 1's place on the map, or the Sun, where every other craft leaves from.
  const { markOf } = reach;
  const voyagerAt = useCallback(() => markOf("voyager"), [markOf]);
  const sunAt = useCallback(() => markOf("sun"), [markOf]);
  // Which way each flies on the map: Voyager 1 out from the Sun to its place, the rest from the Sun to the star.
  // Zoomed far out the two marks share a pixel and say no way at all, so each keeps the last way it could read: a
  // replay from out by Proxima had Voyager 1 flying up and left. 2026-11-07.
  const ways = useRef<Record<string, [{ x: number; y: number }, { x: number; y: number }]>>({});
  const wayOf = useCallback(
    (to: string) => {
      const [a, b] = [markOf("sun"), markOf(to)];
      if (a && b && Math.hypot(b.x - a.x, b.y - a.y) > 150) ways.current[to] = [a, b];
      return ways.current[to] ?? null;
    },
    [markOf],
  );
  const voyagerWay = useCallback(() => wayOf("voyager"), [wayOf]);
  const starWay = useCallback(() => wayOf("alpha"), [wayOf]);
  const leads = useLeads();
  // In the review, a tap on the map steps it as one on the words does, but not in a system's Close View, there to look.
  const reviewing = path === "/play" && /[?&]review\b/.test(search);
  const tap = useStepTap(leads.step);
  const [tall, setTall] = useState(false);

  // Tall, the strip opens wider at its handle, and gives a walkthrough more room. Wide, the map fills the left of the
  // screen, and needs no handle.
  return (
    <div
      data-shell="map"
      className={`relative shrink-0 overflow-hidden border-b border-faint transition-[height] duration-300 wide:col-start-1 wide:row-span-2 wide:row-start-2 wide:h-auto wide:border-b-0 ${tall ? "h-[72%]" : guided ? "h-[34%]" : "h-[45%]"}`}
    >
      {aimed ? (
        <>
          <BeamsMap className="absolute inset-0" />
          <span className={LABEL}>MESSAGES</span>
          <button onClick={() => beams.pick(beams.list, null)} className={BUTTON}>
            <Globe />
            Back to Earth
          </button>
        </>
      ) : jumped && !scan && !onePage ? (
        <>
          <ScanMap quick className="absolute inset-0" />
          <TalkLook lead={jumped} />
          <span className={LABEL}>
            {starName(jumped.star).toUpperCase()}
            {leads.close && " · CLOSE VIEW"}
          </span>
          {leads.look?.system && (
            <button onClick={() => leads.setClose(!leads.close)} className={`absolute top-2 right-2.5 ${PILL}`}>
              <Lens closer={!leads.close} />
              {leads.close ? "Pull Back" : "Close View"}
            </button>
          )}
        </>
      ) : talkedBuild ? (
        <>
          <WorksMap className="absolute inset-0" />
          <TalkBuild name={talkedBuild} />
          {works.close && <Turn />}
          <span className={LABEL}>
            {talkedBuild.toUpperCase()}
            {works.close && " · CLOSE VIEW"}
          </span>
          <div className="absolute right-2.5 bottom-3 flex gap-1.5">
            {CLOSE[talkedBuild] && (
              <button onClick={() => works.setClose(!works.close)} className={PILL}>
                <Lens closer={!works.close} />
                {works.close ? "Pull Back" : "Close View"}
              </button>
            )}
            <button onClick={() => setSentHome(subject!.from)} className={PILL}>
              <Globe />
              Back to Earth
            </button>
          </div>
        </>
      ) : talked ? (
        <>
          <ScanMap quick className="absolute inset-0" />
          <TalkLook lead={talked} />
          <span className={LABEL}>
            {starName(talked.star).toUpperCase()}
            {leads.close && " · CLOSE VIEW"}
          </span>
          {leads.look?.system && (
            <button onClick={() => leads.setClose(!leads.close)} className={`absolute top-2 right-2.5 ${PILL}`}>
              <Lens closer={!leads.close} />
              {leads.close ? "Pull Back" : "Close View"}
            </button>
          )}
          <button onClick={() => setSentHome(subject!.from)} className={BUTTON}>
            <Globe />
            Back to Earth
          </button>
        </>
      ) : talkedPlaces ? (
        <>
          <TalkPlaces key={talkedPlaces.map((p) => p.name).join("|")} places={talkedPlaces} />
          <span className={LABEL}>{talkedPlaces.map((p) => p.name.toUpperCase()).join(" · ")}</span>
          <button onClick={() => setSentHome(subject!.from)} className={BUTTON}>
            <Globe />
            Back to Earth
          </button>
        </>
      ) : talkedStop ? (
        <>
          <Stops key={`talk-${talkedStop}`} from={talkedStop} />
          <button onClick={() => setSentHome(subject!.from)} className={`absolute top-2 right-2.5 ${PILL}`}>
            <Globe />
            Back to Earth
          </button>
        </>
      ) : scan ? (
        <>
          <ScanMap className="absolute inset-0" />
          {reviewing && !leads.close && <div {...tap} className="absolute inset-0" />}
          <span className={LABEL}>
            {leads.close && leads.look ? `${leads.look.star.toUpperCase()} · CLOSE VIEW` : "LEADS"}
          </span>
          {/* A lead's Close View flies into its system, as a destination's does on Reach, and Pull Back out again. */}
          {leads.look?.system && (
            <button onClick={() => leads.setClose(!leads.close)} className={`absolute top-2 right-2.5 ${PILL}`}>
              <Lens closer={!leads.close} />
              {leads.close ? "Pull Back" : "Close View"}
            </button>
          )}
          {!leads.close && <MapKey className={`absolute right-2.5 ${leads.look?.system ? "top-12" : "top-2"}`} />}
          <WideLeads />
        </>
      ) : built ? (
        <>
          <WorksMap className="absolute inset-0" />
          {works.close && <Turn />}
          <span className={LABEL}>
            {works.picked!.toUpperCase()}
            {works.close && " · CLOSE VIEW"}
          </span>
          <div className="absolute right-2.5 bottom-3 flex gap-1.5">
            {CLOSE[works.picked!] && (
              <button onClick={() => works.setClose(!works.close)} className={PILL}>
                <Lens closer={!works.close} />
                {works.close ? "Pull Back" : "Close View"}
              </button>
            )}
            <button onClick={() => works.pick(null)} className={PILL}>
              <Globe />
              Back to Earth
            </button>
          </div>
        </>
      ) : reaching ? (
        <>
          <ReachMap className="absolute inset-0" />
          {/* Reach's walk: a craft up close over the map, then its flight. 2026-11-07. */}
          {reach.craft && !reach.close && <CraftView key={`${reach.craft.kind}:${reach.craft.shot}`} kind={reach.craft.kind} shot={reach.craft.shot} anchor={reach.craft.kind === "voyager" ? voyagerAt : sunAt} heading={reach.craft.kind === "voyager" ? voyagerWay : starWay} className="absolute inset-0" />}
          <span className={LABEL}>
            {reach.close ? `${reach.target.name.toUpperCase()} · CLOSE VIEW` : "FROM EARTH"}
          </span>
          {/* The walk's flight, counted by the flight itself. 2026-11-07. */}
          <FlightCount />
          {/* The ruler is the map's zoom, so it lies on the map, along its foot, clear of the handle on a phone. Inside a
              system it has nothing to measure, so it steps aside. */}
          {!reach.close && (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-page/80 via-page/40 to-transparent px-4 pt-6 pb-5 wide:px-10 wide:pb-6">
              <Ruler />
            </div>
          )}
          <div className="absolute top-2 right-2.5 flex gap-1.5">
            {/* A destination's Close View flies into its system, and Pull Back out again. */}
            {reach.target.system && (
              <button onClick={() => reach.setClose(!reach.close)} className={PILL}>
                <Lens closer={!reach.close} />
                {reach.close ? "Pull Back" : "Close View"}
              </button>
            )}
            {reach.craft && !reach.close && (
              <button onClick={() => reach.showCraft(reach.craft!.kind)} className={PILL}>
                <Lens closer />
                See It Close
              </button>
            )}
            {!reach.close && !reach.craft && (
              <button onClick={() => reach.tour()} className={PILL}>
                <Lens closer={false} />
                Fly Out Again
              </button>
            )}
          </div>
        </>
      ) : (
        <Stops />
      )}
      {/* Reach's ruler lies along the foot, so there Begin waits at the top. */}
      <BeginOnMap className={reaching ? "top-2" : "bottom-[9%]"} />
      <IdleNote />
      <Through />
      <button
        onClick={() => setTall(!tall)}
        aria-label={tall ? "Show less of the map" : "Show more of the map"}
        aria-expanded={tall}
        className="absolute bottom-0 left-1/2 flex h-5 w-16 -translate-x-1/2 items-end justify-center pb-[5px] wide:hidden"
      >
        <span className="h-1 w-9 rounded-sm bg-faint" />
      </button>
      <Arrival />
    </div>
  );
}

/** Holds the lead our talk is on in the map's view, as its page does, as the Mind's shot of it: a dashed line, then a
 *  drift in. A jump's card holds its lead the same way, off Scan. */
function TalkLook({ lead }: { lead: Lead }) {
  const { leads, dials, setLook } = useLeads();
  const i = leads.findIndex((l) => l.slug === lead.slug);
  useEffect(() => {
    if (i < 0) return;
    Object.assign(dials, { focus: i + 1, chart: 1 });
    setLook(leads[i]);
    return () => {
      Object.assign(dials, { focus: 0, chart: 0 });
      setLook(null);
    };
  }, [dials, i, leads, setLook]);
  return null;
}

/** Holds the build the Mind offers in the map's view, among our builds with places, as its page does. 2026-11-08. */
function TalkBuild({ name }: { name: string }) {
  const { set, pick } = useWorks();
  const { plan } = usePlan();
  const { scale, done } = useSchedule();
  const placed = useMemo(() => placedOf(plan, done, scale), [plan, done, scale]);
  useEffect(() => set(placed), [set, placed]);
  useEffect(() => {
    pick(name);
    return () => pick(null);
  }, [pick, name]);
  return null;
}

const NO_MINDS: SimMind[] = [];
const LY_AU = 63241.077;
/** How far out to look from a place so that this many light-years round it are in view, as log10 AU. */
const framing = (ly: number) => Math.log10(2.8 * Math.max(ly, 1.5) * LY_AU);
const NAME =
  "pointer-events-none absolute top-0 left-0 font-mono text-[11px] whitespace-nowrap opacity-0 [text-shadow:0_0_3px_#000,0_0_6px_#000,0_0_10px_#000]";

/** The stars our talk names that aren't leads, at their real places: one, with its line out from Sol, or two side by
 *  side, framed with Sol, with the light-years between them. 2026-11-08. */
function TalkPlaces({ places }: { places: Place[] }) {
  const [a, b] = places;
  const sim = useMemo(() => {
    if (!b)
      return {
        minds: NO_MINDS,
        focus: a.pos,
        zoom: framing(Math.hypot(...a.pos)),
        marks: [{ id: "a", pos: a.pos }, { id: "Sol", pos: [0, 0, 0] as [number, number, number] }],
      };
    const mid = a.pos.map((v, i) => (v + b.pos[i]) / 2) as [number, number, number];
    const span = Math.max(Math.hypot(...a.pos.map((v, i) => v - mid[i])), Math.hypot(...mid));
    return {
      minds: NO_MINDS,
      focus: mid,
      // Wider than one place's: the view tilts, so two places and Sol need room to its edges.
      zoom: framing(1.8 * span),
      bare: true,
      marks: [
        { id: "a", pos: a.pos },
        { id: "b", pos: b.pos },
        { id: "Sol", pos: [0, 0, 0] as [number, number, number] },
      ],
    };
  }, [a, b]);
  const apart = b ? Math.hypot(...a.pos.map((v, i) => v - b.pos[i])) : 0;
  const names = useRef<Record<string, HTMLElement | null>>({});
  const line = useRef<SVGLineElement>(null);
  const dots = useRef<Record<string, SVGCircleElement | null>>({});
  const onMarks = useCallback((marks: Mark[]) => {
    const taken: Parameters<typeof placeLabel>[4] = [];
    const at: Record<string, Mark> = {};
    for (const m of marks) {
      at[m.id] = m;
      const n = names.current[m.id];
      if (n) n.style.opacity = m.a <= 0 ? "0" : String(m.a * placeLabel(n, m.x, m.y, null, taken));
      const dot = dots.current[m.id];
      if (dot) {
        dot.setAttribute("cx", String(m.x));
        dot.setAttribute("cy", String(m.y));
        dot.style.opacity = String(Math.max(0, m.a));
      }
    }
    // Between the two, a dashed line and the light-years it spans, at its middle.
    const [p, q, l, gap] = [at.a, at.b, line.current, names.current.gap];
    if (p && q && l && gap) {
      l.setAttribute("x1", String(p.x));
      l.setAttribute("y1", String(p.y));
      l.setAttribute("x2", String(q.x));
      l.setAttribute("y2", String(q.y));
      const seen = Math.min(p.a, q.a);
      l.style.opacity = String(Math.max(0, seen));
      // Beside the line's middle, not on it: out along the line's normal, far enough to clear the words' box.
      const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      let [nx, ny] = [-(q.y - p.y) / len, (q.x - p.x) / len];
      if (ny < 0) [nx, ny] = [-nx, -ny];
      const [w, h] = [gap.offsetWidth, gap.offsetHeight];
      const off = 6 + Math.abs(nx) * (w / 2) + Math.abs(ny) * (h / 2);
      gap.style.transform = `translate(${(p.x + q.x) / 2 + nx * off - w / 2}px, ${(p.y + q.y) / 2 + ny * off - h / 2}px)`;
      gap.style.opacity = String(Math.max(0, seen));
    }
  }, []);
  return (
    <>
      <SkyArt mode="sim" sim={sim} onMarks={onMarks} className="absolute inset-0 overflow-hidden">
        {b && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <line ref={line} stroke="var(--ink)" strokeWidth={1} strokeOpacity={0.7} strokeDasharray="3 3" className="opacity-0" />
            {(["a", "b"] as const).map((id) => (
              <circle key={id} ref={(el) => void (dots.current[id] = el)} r={3} fill="var(--ink)" className="opacity-0" />
            ))}
          </svg>
        )}
        <span ref={(n) => void (names.current.a = n)} className={`${NAME} text-ink`}>
          {a.name}
        </span>
        {b && (
          <span ref={(n) => void (names.current.b = n)} className={`${NAME} text-ink`}>
            {b.name}
          </span>
        )}
        <span ref={(n) => void (names.current.Sol = n)} className={`${NAME} text-you`}>
          Sol
        </span>
        {b && (
          <span ref={(n) => void (names.current.gap = n)} className={`${NAME} text-muted`}>
            {apart.toFixed(1)} ly apart
          </span>
        )}
      </SkyArt>
      <Turn />
    </>
  );
}

// The map at its stops. Back from Scan or our messages, it opens on Earth again. Out at the Sun's family, each planet
// is named beside its point, 2026-10-29.
function Stops({ from }: { from?: Stop } = {}) {
  const sky = useSky();
  const [stage, setStage] = useState(() => Math.max(0, STAGES.findIndex((s) => s.id === from)));
  // Opened by our talk on a stop, as the Milky Way: it flies there, and home again once the talk moves on. 2026-11-08.
  useEffect(() => {
    if (!from) return;
    sky?.go(from);
    return () => sky?.go("earth");
  }, [sky, from]);
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback((marks: Mark[]) => {
    // Earth's name first, then the rest outward: one too close to a name already placed gives way.
    const kept: { x: number; y: number }[] = [];
    for (const { id, x, y, a } of [...marks].sort((m, k) => Number(k.id === "body:Earth") - Number(m.id === "body:Earth"))) {
      const n = names.current[id];
      if (!n) continue;
      const clear = a > 0 && !kept.some((k) => Math.abs(k.x - x) < 46 && Math.abs(k.y - y) < 12);
      if (clear) kept.push({ x, y });
      n.style.transform = `translate(${x + 7}px, ${y}px) translate(0, -50%)`;
      n.style.opacity = String(clear ? a : 0);
    }
  }, []);

  function travel() {
    const next = (stage + 1) % STAGES.length;
    sky?.go(STAGES[next].id);
    setStage(next);
  }

  return (
    <>
      <SkyArt mode="map" onMarks={onMarks} className="absolute inset-0">
        {PLANETS.map((b: { name: string }) => (
          <span
            key={b.name}
            ref={(n) => {
              names.current[`body:${b.name}`] = n;
            }}
            className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 [text-shadow:0_0_4px_#121314,0_0_8px_#121314] ${b.name === "Earth" ? "text-you" : "text-muted"}`}
          >
            {b.name}
          </span>
        ))}
      </SkyArt>
      <Turn />
      <span className={LABEL}>{STAGES[stage].name}</span>
      <button onClick={travel} className={BUTTON}>
        {stage === STAGES.length - 1 ? <Globe /> : <Lens closer={false} />}
        {STAGES[stage].next}
      </button>
    </>
  );
}

// A drag across the map turns the view: round Earth at the stops, or round a build in its Close View.
function Turn() {
  const sky = useSky();
  const held = useRef<{ x: number; y: number } | null>(null);
  const press = (e: React.PointerEvent<HTMLDivElement>) => {
    held.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    const from = held.current;
    if (!from) return;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    sky?.turn((e.clientX - from.x) / width, (e.clientY - from.y) / height);
    held.current = { x: e.clientX, y: e.clientY };
  };
  const release = () => (held.current = null);
  return (
    <div
      onPointerDown={press}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
    />
  );
}
