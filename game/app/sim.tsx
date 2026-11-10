import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Play } from "@/components/icons";
import { placeLabel } from "@/components/place-label";
import { Sky, SkyArt, useSky } from "@/components/sky";
import { chain, DIALS, odds, PEER_YEARS, round } from "@/lib/about/dials";
import { Funnel, type Tier } from "@/components/funnel";
import { SimFlight } from "@/components/sim-flight";
import type { Dials, Mark } from "@/lib/drift";
import { YEAR_0 } from "@/lib/game/clock";
import { HOLOS_ODDS, type Odds } from "@/lib/sim/draw-minds";
import { pickablesOf, type Pickable } from "@/lib/sim/pick";
import { bodiesOf, DRAWN_TABS, KNOWN, placesOf, rankOf, REAL_TABS, realBodiesOf, type Place, type Tab } from "@/lib/sim/flight-stops";
import type { Target } from "@/lib/sim/flight-view";
import type { WorldOdds } from "@/lib/sim/draw-worlds";
import type { Ask, Drawn } from "@/lib/sim/draw-worker";
import { AHEAD, CENTER, UNIVERSE, clashesOf, framing, lightAt, timeOf, tourOf } from "@/lib/sim/tour";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { seededRandom } from "../../src/astronomy.js";

// Simulation mode, 2026-11-01: no game, only a sky drawn at the odds we set. The six steps from stars to minds, as on
// /about/research, and how far a mind may spread. Then a tour through what they make: our nearest mind, the old minds
// round us, our nearest peer, every peer. The browser draws it, so the Worker's limits never apply, and whatever today's
// sky rules out is flagged in rose, at the top. Gameplay could later draw its world the same way.

const STEPS = 1000;
const toSlider = (v: number, lo: number, hi: number) => Math.round((Math.log(v / lo) / Math.log(hi / lo)) * STEPS);
const fromSlider = (n: number, lo: number, hi: number) => lo * (hi / lo) ** (n / STEPS);
/** A mind's chance to spread, at its top: 1 in 900 up to 1 in 3. */
const SPREAD = { lo: 1 / 900, hi: 1 / 3 };
const ROSE = "#ff7e94";
const SECTIONS = [
  { id: "universe", label: "Universe", to: "/universe" },
  { id: "simulation", label: "Simulation", to: "/sim" },
] as const;
const KICK = "font-mono text-[10.5px] tracking-[.1em] text-muted";
/** One dials object for the whole page, so a new stop eases the view there, not a fresh flight. */
const DIALS_SIM: Dials = {};
/** While the flight has the screen, the map under it rests: our Sun, close, and not drawn at all. */
const RESTING = { minds: [], focus: null, zoom: 1.75, marks: [], rest: true };
/** Seconds the flight holds at each place before drifting on to the next. */
const HOLD = 7;
/** Seconds the line from Sol lingers before the view comes in close. Five until 2026-11-10: it dragged. */
const LINGER = 2.2;
/** With no peers, the flight stands back to see the whole Galaxy from above. */
const GALAXY_VIEW: Target = { id: "galaxy", pos: CENTER, stand: 95_000, dir: [0.2, 1, 0.35] };
const NONE: never[] = [];
/** Today, as a decimal year, and how far ahead the game's Year 0, 2040, lies: peers' glows are counted from it. */
const TODAY = 1970 + Date.now() / (365.25 * 864e5);
const TO_NOW = YEAR_0 - TODAY;
/** Seconds the play button takes to run all 20,000 years. */
const PLAY_SECONDS = 40;
/** The opening's notes: seconds before the first draws in, and between each. */
const NOTE_DELAY = 0.35;
/** The opening shot's length, as lib/drift.ts's INTRO. */
const INTRO_SECONDS = 10;
const NOTE_STAGGER = 0.25;

export default function Sim() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [spread, setSpread] = useState(HOLOS_ODDS.spreadTop);
  const [seed, setSeed] = useState(10);
  const [drawn, setDrawn] = useState<Drawn | null>(null);
  const [at, setAt] = useState(0);
  // The address picks the section: /universe, or /sim. Each section has its own tabs: the Universe's tour and its
  // flights through the real stars and known worlds, and the Simulation's flights through the drawn minds and peers.
  // `tab` is the flight in view, null on the tour. 2026-11-10.
  const onSim = useLocation().pathname === "/sim";
  const navigate = useNavigate();
  const [uTab, setUTab] = useState<"tour" | "stars" | "known">("tour");
  const [sTab, setSTab] = useState<Tab>("minds");
  const tab: Tab | null = onSim ? sTab : uTab === "tour" ? null : uTab;
  const tabs = onSim ? DRAWN_TABS : REAL_TABS;
  const [place, setPlace] = useState(0);
  // The flight drifts on by itself until we take it in hand.
  const [auto, setAuto] = useState(true);
  const [arrived, setArrived] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // Each place opens on its line from Sol, seen from the side. Once the line has had its moment, the place this was
  // set for is seen close.
  const [closeFor, setCloseFor] = useState<string | null>(null);
  const [fadeFor, setFadeFor] = useState<string | null>(null);
  // The opening shot plays once, on first arriving: the card and labels wait for it to land, and stepping on ends it.
  const [opening, setOpening] = useState(!onSim);

  const perStar = DIALS.reduce((p, d) => p * (values[d.key] ?? d.holos), 1);
  // The chain worked out at once, as a dial turns, ahead of the slower draw: the funnel, the count and the ring.
  const result = useMemo(() => chain(values, PEER_YEARS), [values]);
  const tiers: Tier[] = useMemo(() => {
    const v = (k: string) => values[k] ?? DIALS.find((d) => d.key === k)!.holos;
    let n = 2e11;
    const out: Tier[] = [{ label: "Stars", count: n, color: "rgb(230,227,219)" }];
    for (const [k, label, color] of [
      ["warm", "Rocky warm worlds", "rgb(230,227,219)"],
      ["air", "Keep their air", "rgb(168,198,255)"],
      ["start", "Life starts", "rgb(112,209,169)"],
      ["last", "Life lasts", "rgb(112,209,169)"],
      ["animals", "Animals", "rgb(255,206,150)"],
      ["minds", "Minds", "rgb(91,184,214)"],
    ] as const)
      out.push({ label, count: (n *= v(k)), color });
    return out;
  }, [values]);
  const odds_: Odds = useMemo(() => ({ starsPerMind: 1 / perStar, spreadTop: spread }), [perStar, spread]);
  // The steps a natural world turns on, from the same dials.
  const worldOdds: WorldOdds = useMemo(() => {
    const v = (k: string) => values[k] ?? DIALS.find((d) => d.key === k)!.holos;
    return {
      warm: v("warm"),
      air: v("air"),
      start: v("start"),
      last: v("last"),
      animals: v("animals"),
    };
  }, [values]);

  // The draw, off the page's thread. Only the latest answer counts.
  const worker = useRef<Worker | null>(null);
  const asked = useRef(0);
  useEffect(() => {
    const w = new Worker(new URL("../lib/sim/draw-worker.ts", import.meta.url), { type: "module" });
    w.onmessage = ({ data }: MessageEvent<Drawn>) => {
      if (data.id !== asked.current) return;
      setDrawn(data);
    };
    worker.current = w;
    return () => w.terminate();
  }, []);
  const key = `${seed}:${odds_.starsPerMind}:${odds_.spreadTop}:${Object.values(worldOdds).join(",")}`;
  const busy = drawn?.key !== key;
  useEffect(() => {
    const t = setTimeout(() => {
      const ask: Ask = {
        id: ++asked.current,
        key,
        seed,
        odds: odds_,
        worlds: worldOdds,
      };
      worker.current?.postMessage(ask);
    }, 120);
    return () => clearTimeout(t);
  }, [key, seed, odds_, worldOdds]);

  const tour = useMemo(
    () => (drawn ? tourOf(drawn.minds, odds_, drawn.names, drawn.worlds, drawn.near) : []),
    [drawn, odds_],
  );
  // Two sections: the universe as we see it, a tour up to our nearest stars, then the simulation, a flight.
  const split = Math.max(0, tour.findIndex((s) => s.id === "dials"));
  const section = tab ? "simulation" : "universe";
  const stop = tab ? undefined : tour[Math.min(at, Math.max(0, split - 1))];
  // A note tapped on the tour: the view flies in close to its place, until tapped again or the stop changes.
  const [closer, setCloser] = useState<{ stop: string; id: string } | null>(null);
  const closeNote = stop && closer?.stop === stop.id ? stop.notes?.find((n) => n.id === closer.id) : undefined;
  const clashes = useMemo(() => (drawn ? clashesOf(drawn.minds, odds_, drawn.fillers) : []), [drawn, odds_]);
  // Time passing, on the Peers list: years from now, and whether it runs by itself.
  const [years, setYears] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    let raf = 0,
      last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setYears((y) => {
        const next = Math.min(AHEAD, y + (dt * AHEAD) / PLAY_SECONDS);
        if (next >= AHEAD) setPlaying(false);
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  const revealed = onSim;
  const near = drawn?.near ?? NONE;
  const spokes = useMemo(() => (stop?.spokes ? near.map((n) => n.pos) : undefined), [stop?.spokes, near]);

  // The flight: each list nearest first, a place in view, and everything drawn round it.
  const places: Place[] = useMemo(
    () => (drawn && tab ? placesOf(tab, drawn.minds, drawn.names, drawn.near, TODAY, TO_NOW) : []),
    [drawn, tab],
  );
  const here: Place | undefined = places[Math.min(place, places.length - 1)];
  // Which peers glow at us at the chosen time, as a key, so the bodies are drawn again only when that changes.
  const glowing = useMemo(
    () => drawn?.minds.peers.map((p) => Number(p.flash[0] + TO_NOW <= years && years <= p.flash[1] + TO_NOW)).join("") ?? "",
    [drawn, years],
  );
  // The Universe section's flights draw only the real: Sol, the nearest stars, and the stars with known planets.
  const bodies = useMemo(
    () => (!drawn ? [] : onSim ? bodiesOf(drawn.minds, drawn.names, drawn.near, years, TO_NOW) : realBodiesOf(drawn.near)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawn, glowing, onSim],
  );
  const hereKey = here ? `${here.id}:${here.pos.join()}` : "";
  const close = !!here && closeFor === here.id;
  const target: Target = useMemo(
    () => (here ? (close ? { id: here.id, pos: here.pos, stand: here.stand } : beside(here)) : tab === "peers" ? GALAXY_VIEW : { id: "sol", pos: [0, 0, 0], stand: 30 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hereKey, tab, close],
  );
  // The line lingers, then fades as the view comes in close.
  useEffect(() => {
    if (!here || close || arrived !== `${here.id}:beside`) return;
    const fade = setTimeout(() => setFadeFor(here.id), LINGER * 1000);
    const near = setTimeout(() => setCloseFor(here.id), (LINGER + 0.6) * 1000);
    return () => (clearTimeout(fade), clearTimeout(near));
  }, [here, close, arrived]);
  // Held close for a while, then on to the next nearest.
  useEffect(() => {
    if (!auto || !here || arrived !== here.id || place >= places.length - 1) return;
    const t = setTimeout(() => setPlace((i) => Math.min(places.length - 1, i + 1)), HOLD * 1000);
    return () => clearTimeout(t);
  }, [auto, arrived, here, place, places.length]);
  const goTab = (t: Tab | "tour") => {
    const toSim = t === "minds" || t === "peers";
    if (toSim) setSTab(t);
    else setUTab(t);
    if (toSim !== onSim) navigate(toSim ? "/sim" : "/universe");
    setPlace(0);
    setAuto(true);
    setOpen(false);
    setOpening(false);
  };
  const go = (i: number) => {
    setPlace(Math.max(0, Math.min(places.length - 1, i)));
    setOpen(false);
  };
  // A tap flies to what is there, in whichever list holds it, and a second tap on the place in view reads it.
  const onTap = (id: string | null) => {
    if (!id || !drawn || !tab) return setOpen(false);
    if (id === here?.id) return setOpen((o) => !o);
    for (const t of [tab, ...tabs.map((x) => x.id).filter((x) => x !== tab)]) {
      const i = placesOf(t, drawn.minds, drawn.names, drawn.near, TODAY, TO_NOW).findIndex((p) => p.id === id);
      if (i < 0) continue;
      if (onSim) setSTab(t);
      else setUTab(t as "stars" | "known");
      setPlace(i);
      setAuto(false);
      setOpen(false);
      return;
    }
  };
  const pickables = useMemo(
    () => (drawn && tab && onSim ? pickablesOf(drawn.minds, [], drawn.names, drawn.starOf) : []),
    [drawn, tab, onSim],
  );
  const detail: Pickable | undefined = here && open ? (pickables.find((p) => p.id === here.id) ?? readOf(here)) : undefined;

  const sim = useMemo(
    () =>
      tab
        ? RESTING
        : {
            minds: NONE,
            // Before the first draw comes, the tour's opening: the universe we can see.
            focus: closeNote ? closeNote.pos : stop ? stop.focus : null,
            zoom: closeNote ? framing(closeNote.r ?? 1e5) : (stop?.zoom ?? UNIVERSE),
            clash: stop?.clash,
            bare: stop?.bare || !!closeNote,
            spokes,
            // From the first frame, not once the draw comes: the whole universe showed, then the view jumped in close.
            intro: opening && (!stop || stop.id === "universe") ? 1 : undefined,
            // The place in view first, so its name wins a crowded spot, then Sol, then the notes.
            marks: !stop ? NONE : [
              ...(stop?.focus ? [{ id: "here", pos: stop.focus }] : []),
              // Flown in to a note on the rim, its words stay by its place, not the rim as seen.
              ...(stop?.notes
                ? stop.notes.map((n) => (n === closeNote ? { ...n, rim: false } : n))
                : [{ id: "Sol", pos: [0, 0, 0] as [number, number, number] }]),
              ...(stop?.notes && stop.sol ? [{ id: "Sol", pos: [0, 0, 0] as [number, number, number] }] : []),
              ...(spokes ? near.map((n, i) => ({ id: `near-${i}`, pos: n.pos })) : []),
            ],
          },
    [tab, stop, spokes, near, opening, closeNote],
  );

  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  // A note's words sit off from its place, joined by a line that ends in a dot on the place.
  const leads = useRef<Record<string, SVGGElement | null>>({});
  const offs = useRef<Record<string, [number, number]>>({});
  const sizes = useRef<Record<string, [number, number]>>({});
  // When the stop's notes came, so each can draw itself in: its dot pops, its line runs out, its words slide in off the
  // line's end, one note after another.
  const notesAt = useRef(0);
  const order = useRef<Record<string, number>>({});
  useEffect(() => {
    offs.current = Object.fromEntries((stop?.notes ?? []).map((n) => [n.id, n.off]));
    order.current = Object.fromEntries((stop?.notes ?? []).map((n, i) => [n.id, i]));
    sizes.current = {};
    notesAt.current = opening ? Infinity : performance.now();
  }, [stop, opening]);
  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(() => setOpening(false), INTRO_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [opening]);
  // Where each mark was last seen on screen, so a tap can find the note under it.
  const seen = useRef<Record<string, { x: number; y: number; a: number }>>({});
  // Flown in close, only that note's words stay: the rest would crowd the frame's edges.
  const only = useRef<string | null>(null);
  useEffect(() => void (only.current = closeNote?.id ?? null), [closeNote]);
  const onMarks = useCallback((marks: Mark[]) => {
    seen.current = Object.fromEntries(marks.map((m) => [m.id, m]));
    if (only.current) marks = marks.map((m) => (m.id === only.current || !offs.current[m.id] ? m : { ...m, a: 0 }));
    const taken: Parameters<typeof placeLabel>[4] = [];
    const marked = new Set(marks.map((m) => m.id));
    for (const [id, n] of Object.entries(names.current)) if (n && !marked.has(id)) n.style.opacity = "0";
    for (const [id, g] of Object.entries(leads.current)) if (g && !marked.has(id)) g.style.opacity = "0";
    for (const { id, x, y, a } of marks) {
      const n = names.current[id];
      if (!n) continue;
      const off = offs.current[id];
      if (!off) {
        n.style.opacity = a <= 0 ? "0" : String(a * placeLabel(n, x, y, null, taken));
        continue;
      }
      // Its reveal, in seconds since the notes came: a quarter second after the one before.
      const t = (performance.now() - notesAt.current) / 1000 - NOTE_DELAY - NOTE_STAGGER * (order.current[id] ?? 0);
      const part = (from: number, to: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));
      const out = (k: number) => 1 - (1 - k) ** 3;
      const pop = part(0, 0.28),
        run = out(part(0.08, 0.5)),
        words = out(part(0.32, 0.75));
      // The words go out to the side the line leaves on, and the line meets them at their near end. Their size is
      // measured once, not every frame, so moving one note doesn't make the page lay out again for the next.
      const [w, h] = (sizes.current[id] ??= [n.offsetWidth, n.offsetHeight]);
      // Kept inside the frame: where the words would cross its edge, they and the line's end move in.
      const W = n.parentElement?.clientWidth ?? 0,
        H = n.parentElement?.clientHeight ?? 0;
      const fitX = (l: number) => Math.min(Math.max(l, 12), W - w - 12);
      const fitY = (yy: number) => Math.min(Math.max(yy, h / 2 + 12), H - h / 2 - 12);
      const left = fitX(off[0] < 0 ? x + off[0] - w - 8 : x + off[0] + 8);
      const ey = fitY(y + off[1]);
      const ex = off[0] < 0 ? left + w + 8 : left - 8;
      // They slide in from back along the line, as if carried out on it.
      const len = Math.hypot(off[0], off[1]) || 1;
      const back = (1 - words) * 28;
      n.style.transform = `translate(${left - (off[0] / len) * back}px, ${ey - h / 2 - (off[1] / len) * back}px)`;
      n.style.opacity = a <= 0 ? "0" : String(a * words);
      const g = leads.current[id];
      if (g) {
        g.style.opacity = a <= 0 ? "0" : String(a);
        const [line, dot] = g.children as unknown as [SVGLineElement, SVGCircleElement];
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(y));
        line.setAttribute("x2", String(x + (ex - x) * run));
        line.setAttribute("y2", String(y + (ey - y) * run));
        line.style.opacity = run > 0 ? "1" : "0";
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
        // The dot overshoots, then settles.
        dot.setAttribute("r", String(3 * (pop < 1 ? Math.sin(pop * Math.PI * 0.75) / Math.sin(Math.PI * 0.75) : 1)));
      }
    }
  }, []);

  // Each stop's card rises in as the view turns to it.
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!card.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      card.current.querySelectorAll("[data-rise]"),
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.15,
      },
    );
    return () => void t.kill();
  }, [stop?.id, here?.id, tab, opening]);

  // The dials slide in when the tour hands them over.
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!revealed || !panel.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      panel.current,
      { autoAlpha: 0, x: 40 },
      { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out" },
    );
    return () => void t.kill();
  }, [revealed]);

  /** The note at a point on the screen: its words, or close by its dot. */
  const noteAt = (x: number, y: number) => {
    for (const n of stop?.notes ?? []) {
      const el = names.current[n.id],
        m = seen.current[n.id];
      if (!el?.parentElement || !m || m.a <= 0 || Number(el.style.opacity) < 0.3) continue;
      const r = el.getBoundingClientRect(),
        frame = el.parentElement.getBoundingClientRect();
      const onWords = x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6;
      if (onWords || Math.hypot(x - frame.left - m.x, y - frame.top - m.y) < 16) return n;
    }
    return undefined;
  };
  // A tap on a note flies in to it, or on to its own stop; on it again, or on open sky, back out.
  const tapNote = (x: number, y: number) => {
    const n = noteAt(x, y);
    if (!stop || !n || n === closeNote) return setCloser(null);
    const i = n.go ? tour.findIndex((s) => s.id === n.go) : -1;
    if (i >= 0) return setAt(i);
    setCloser({ stop: stop.id, id: n.id });
  };

  // The bar comes up with the sky, not all at once on the dark page.
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (prefersReducedMotion() || !bar.current) return;
    const t = gsap.fromTo(bar.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, delay: 0.4, ease: "power1.out" });
    return () => void t.revert();
  }, []);

  const set = (key: string, v: number) => setValues((o) => ({ ...o, [key]: v }));
  // Labels sit on stars and glows, so each carries a dark halo to stay readable, and fades in and out with its stop.
  const label =
    "pointer-events-none absolute top-0 left-0 font-mono text-[13px] whitespace-nowrap opacity-0 transition-opacity duration-700 [text-shadow:0_0_3px_#000,0_0_6px_#000,0_0_10px_#000]";

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-paper text-ink">
      <Sky shade={false}>
        <div
          className={`flex min-h-0 grow flex-col ${revealed ? "wide:grid wide:grid-cols-[minmax(0,1fr)_clamp(340px,32vw,440px)]" : ""}`}
        >
          <div className="relative min-h-[46dvh] grow">
            <SkyArt
              mode="sim"
              dials={DIALS_SIM}
              sim={sim}
              onMarks={onMarks}
              className="absolute inset-0 overflow-hidden"
            >
              <span ref={(n) => void (names.current.Sol = n)} className={`${label} text-ink`}>
                Sol
              </span>
              <span
                ref={(n) => void (names.current.here = n)}
                className={label}
                style={{ color: stop?.clash ? ROSE : undefined }}
              >
                {stop?.label}
              </span>
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                {stop?.notes?.map((n) => (
                  <g key={n.id} ref={(el) => void (leads.current[n.id] = el)} className="opacity-0" stroke="var(--ink)">
                    <line strokeWidth={1} strokeOpacity={0.7} strokeDasharray="3 3" />
                    <circle r={0} fill="var(--ink)" stroke="none" />
                  </g>
                ))}
              </svg>
              {stop?.notes?.map((n) => (
                <span
                  key={n.id}
                  ref={(el) => void (names.current[n.id] = el)}
                  className={`${label} !text-[16px] !transition-none text-ink`}
                >
                  {n.text}
                </span>
              ))}
              {near.map((n, i) => (
                <span
                  key={n.name}
                  ref={(el) => void (names.current[`near-${i}`] = el)}
                  className={`${label} text-page-ink2`}
                >
                  {n.name} <span className="text-muted">{n.d.toFixed(1)} ly</span>
                </span>
              ))}
            </SkyArt>
            <Turn hit={tab || opening ? undefined : noteAt} onTap={tab || opening ? undefined : tapNote} />
            {tab && (
              <SimFlight
                className="absolute inset-0"
                bodies={bodies}
                target={target}
                light={tab === "peers" ? lightAt(years, TODAY) : null}
                thread={here && !close && fadeFor !== here.id ? here.pos : null}
                onArrive={setArrived}
                onTap={onTap}
                onTouch={() => setAuto(false)}
              />
            )}
            {detail && <Details item={detail} onClose={() => setOpen(false)} />}
            <nav ref={bar} className="absolute top-4 right-4 flex items-center gap-1 rounded-full border border-faint bg-paper/70 p-0.5 font-mono text-[11px] backdrop-blur-sm">
              {SECTIONS.map((s) => (
                <Link
                  key={s.id}
                  to={s.to}
                  aria-current={section === s.id ? "page" : undefined}
                  className={`rounded-full px-3 py-0.5 ${section === s.id ? "bg-ink/15 text-ink" : "text-muted hover:text-ink"}`}
                  onClick={() => (s.id === "universe" ? (goTab("tour"), setAt(0)) : goTab("minds"))}
                >
                  {s.label}
                </Link>
              ))}
              <Link to="/play" state={{ play: true }} className="flex items-center gap-1.5 rounded-full px-3 py-0.5 text-muted hover:text-ink">
                Play
                <Play size={11} />
              </Link>
            </nav>
            {onSim && <Reckoning minds={result.galaxy} perStar={perStar} />}
            <div className="pointer-events-none absolute bottom-4 left-4 flex max-w-xl flex-col items-start gap-2 pr-4">
              {tab && clashes.length > 0 && (
                <div
                  role="alert"
                  className="pointer-events-auto rounded-lg border-2 bg-paper/95 p-3 backdrop-blur-sm"
                  style={{ borderColor: ROSE }}
                >
                  <p className="font-mono text-[11px] font-semibold tracking-[.1em]" style={{ color: ROSE }}>
                    TODAY’S SKY RULES THIS OUT
                  </p>
                  {clashes.map((c) => (
                    <p key={c.title} className="mt-1.5 text-[13px] leading-snug">
                      <span className="font-semibold" style={{ color: ROSE }}>
                        {c.title}.
                      </span>{" "}
                      {c.words}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {stop && (
              <section
                ref={card}
                className={`absolute top-16 left-4 right-4 max-w-md md:top-4 md:right-80 rounded-lg border border-faint bg-paper/95 p-3 shadow-lg shadow-black/40 backdrop-blur-sm transition-opacity duration-700 ${opening ? "pointer-events-none opacity-0" : "opacity-100"}`}
              >
                <Tabs
                  tabs={[{ id: "tour", label: "Tour" }, ...REAL_TABS]}
                  active="tour"
                  onPick={(id) => (id === "tour" ? setAt(0) : goTab(id as Tab))}
                />
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className={KICK}>
                    UNIVERSE {Math.min(at, split - 1) + 1} / {split}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      className="rounded-full border border-faint px-3 py-0.5 font-mono text-[11px] disabled:opacity-30"
                      disabled={at <= 0}
                      onClick={() => setAt((a) => Math.max(0, a - 1))}
                    >
                      Back
                    </button>
                    <button
                      className="rounded-full border border-faint px-3 py-0.5 font-mono text-[11px]"
                      onClick={() => (at >= split - 1 ? goTab("stars") : (setOpening(false), setAt((a) => a + 1)))}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <h2 data-rise className="mt-1.5 font-semibold" style={{ color: stop.clash ? ROSE : undefined }}>
                  {stop.title}
                </h2>
                <p data-rise className="mt-1 text-[14px] leading-snug text-ink/85">
                  {stop.words}
                </p>
              </section>
            )}
            {tab && (
              <section
                ref={card}
                className="absolute top-16 left-4 right-4 max-w-md rounded-lg border border-faint bg-paper/95 p-3 shadow-lg shadow-black/40 backdrop-blur-sm md:top-4 md:right-80"
              >
                <Tabs
                  tabs={onSim ? DRAWN_TABS : [{ id: "tour", label: "Tour" }, ...REAL_TABS]}
                  active={tab}
                  onPick={(id) => goTab(id as Tab | "tour")}
                />
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className={KICK}>
                    {here ? `${rankOf(place, tabs.find((t) => t.id === tab)!.one).toUpperCase()} · ${place + 1} / ${places.length}` : "\u00a0"}
                    {busy && onSim ? " · DRAWING…" : ""}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      className="rounded-full border border-faint px-3 py-0.5 font-mono text-[11px] disabled:opacity-30"
                      disabled={place <= 0}
                      onClick={() => go(place - 1)}
                    >
                      Back
                    </button>
                    <button
                      className="rounded-full border border-faint px-3 py-0.5 font-mono text-[11px] disabled:opacity-30"
                      disabled={place >= places.length - 1}
                      onClick={() => go(place + 1)}
                    >
                      Next
                    </button>
                    <button
                      className="w-16 rounded-full border border-faint px-2 py-0.5 font-mono text-[11px] text-muted hover:text-ink"
                      onClick={() => setAuto((a) => !a)}
                    >
                      {auto ? "Hold" : "Drift"}
                    </button>
                  </div>
                </div>
                <h2 data-rise className="mt-1.5 font-semibold" style={{ color: here?.kind === "fills" ? ROSE : undefined }}>
                  {here ? here.title : drawn ? emptyOf(tab).title : "Drawing…"}
                </h2>
                <p data-rise className="mt-1 text-[14px] leading-snug text-ink/85">
                  {here ? here.words : drawn ? emptyOf(tab).words : ""}
                </p>
                {here && (
                  <button
                    className="mt-2.5 rounded-full border border-faint px-3 py-0.5 font-mono text-[11px] text-ink hover:bg-ink/10"
                    aria-expanded={open}
                    onClick={() => (setAuto(false), setOpen((o) => !o))}
                  >
                    {open ? "Close" : "Find out more"}
                  </button>
                )}
                {tab === "peers" && drawn && drawn.minds.peers.length > 0 && (
                  <Time
                    years={years}
                    playing={playing}
                    onYears={(y) => (setPlaying(false), setYears(y))}
                    onPlay={() => (years >= AHEAD && setYears(0), setPlaying((p) => !p))}
                    {...timeOf(drawn.minds, years, TO_NOW, TODAY)}
                  />
                )}
              </section>
            )}
          </div>

          {revealed && (
            <aside
              ref={panel}
              className="max-h-[54dvh] overflow-y-auto border-t border-faint bg-panel px-4 py-4 wide:max-h-none wide:border-t-0 wide:border-l"
            >
              <p className={KICK}>THE DIALS</p>
              <Funnel tiers={tiers} />
              <p className="mt-1 text-[13px] text-page-ink2">
                One star in {round(1 / perStar)} holds a mind. Each step can turn as far as the research allows. The
                mark is the Holos game’s.
              </p>
              {DIALS.map((d) => {
                const v = values[d.key] ?? d.holos;
                return (
                  <Dial
                    key={d.key}
                    label={d.label}
                    shows={odds(v)}
                    basis={d.basis}
                    value={toSlider(v, d.lo, d.hi)}
                    mark={toSlider(d.holos, d.lo, d.hi)}
                    onChange={(n) => set(d.key, fromSlider(n, d.lo, d.hi))}
                  />
                );
              })}
              <Dial
                label="A mind spreads, at most"
                shows={odds(spread)}
                basis="Earth is unsettled"
                value={toSlider(spread, SPREAD.lo, SPREAD.hi)}
                mark={toSlider(HOLOS_ODDS.spreadTop, SPREAD.lo, SPREAD.hi)}
                limit={
                  drawn
                    ? toSlider(Math.min(SPREAD.hi, Math.max(SPREAD.lo, drawn.safeTop)), SPREAD.lo, SPREAD.hi)
                    : undefined
                }
                onChange={(n) => setSpread(fromSlider(n, SPREAD.lo, SPREAD.hi))}
              />
              <p className="mt-2 text-[12px] leading-snug text-muted">
                Why it is held low: a mind that spreads settles its nearest stars, and each colony may spread again.
                Past a point, one family never stops and reaches every star. With {round(2e11 / (1 / perStar))} minds in
                our Galaxy, that point is about {drawn ? odds(drawn.safeTop) : "…"}, the rose tick. We find no settlers
                here, so the chance must stay under it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-faint px-3 py-1 font-mono text-[11px] hover:text-ink"
                  onClick={() => setSeed((s) => s + 1)}
                >
                  Roll again
                </button>
                <button
                  className="rounded-full border border-faint px-3 py-1 font-mono text-[11px] text-muted hover:text-ink"
                  onClick={() => {
                    setValues({});
                    setSpread(HOLOS_ODDS.spreadTop);
                  }}
                >
                  Holos game odds
                </button>
              </div>
              <p className="mt-2 text-[12px] text-muted">Same odds, a new roll of the dice.</p>
              <p className="mt-1 font-mono text-[10px] text-muted">ROLL {seed}</p>
            </aside>
          )}
        </div>
      </Sky>
    </div>
  );
}

function Dial({
  label,
  shows,
  basis,
  value,
  mark,
  limit,
  onChange,
}: {
  label: string;
  shows: string;
  basis: string;
  value: number;
  mark: number;
  /** Past here, today's sky rules the setting out. */
  limit?: number;
  onChange(n: number): void;
}) {
  const over = limit !== undefined && value > limit;
  return (
    <label className="mt-4 block">
      <span className="flex items-baseline justify-between gap-2 text-[13px]">
        <span>{label}</span>
        <span className="font-mono text-[12px]" style={{ color: over ? ROSE : undefined }}>
          {shows}
        </span>
      </span>
      <span className="relative mt-1.5 block h-5">
        <span
          className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-fill2"
          style={{ left: `${(mark / STEPS) * 100}%` }}
        />
        {limit !== undefined && (
          <span
            className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2"
            style={{ left: `${(limit / STEPS) * 100}%`, background: ROSE }}
          />
        )}
        <input
          type="range"
          min={0}
          max={STEPS}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full accent-[#5bb8d6]"
        />
      </span>
      <span className="mt-0.5 block font-mono text-[10px] text-muted">{basis}</span>
    </label>
  );
}

/** The years ahead, a slider and a play button, and what the sky holds then. */
function Time({
  years,
  playing,
  glowing,
  reached,
  light,
  onYears,
  onPlay,
}: {
  years: number;
  playing: boolean;
  glowing: number;
  reached: number;
  light: number;
  onYears(y: number): void;
  onPlay(): void;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2">
        <button
          className="w-14 shrink-0 rounded-full border border-faint px-2 py-0.5 font-mono text-[11px]"
          onClick={onPlay}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={AHEAD}
          step={10}
          value={years}
          aria-label="Years from now"
          onChange={(e) => onYears(Number(e.target.value))}
          className="w-full accent-[#5bb8d6]"
        />
      </div>
      <p className="mt-1.5 font-mono text-[11px] text-muted">
        <span className="text-ink">{Math.round(years).toLocaleString("en-US")}</span> years from now ·{" "}
        <span style={{ color: "var(--other)" }}>{glowing.toLocaleString("en-US")}</span> glowing at us · our light{" "}
        {Math.round(light).toLocaleString("en-US")} ly out, it has reached{" "}
        <span style={{ color: "var(--you)" }}>{reached.toLocaleString("en-US")}</span>
      </p>
    </div>
  );
}

/** The map turned by hand: a drag spins the view round and tips it, in every stop. It sits under the cards. A tap
 *  goes to onTap, in the page's coordinates. */
function Turn({ onTap, hit }: { onTap?(x: number, y: number): void; hit?(x: number, y: number): unknown }) {
  const sky = useSky();
  const from = useRef<{ x: number; y: number } | null>(null);
  // Where a press began, to tell a tap from a drag.
  const down = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      aria-hidden
      className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
      onPointerDown={(e) => {
        from.current = { x: e.clientX, y: e.clientY };
        down.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        // Over something a tap would open, the hand shows it.
        if (!from.current) return void (e.currentTarget.style.cursor = hit?.(e.clientX, e.clientY) ? "pointer" : "");
        const { width, height } = e.currentTarget.getBoundingClientRect();
        sky?.turn((e.clientX - from.current.x) / width, (e.clientY - from.current.y) / height);
        from.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        from.current = null;
        const d = down.current;
        down.current = null;
        if (!onTap || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
        onTap(e.clientX, e.clientY);
      }}
      onPointerCancel={() => (from.current = null)}
    />
  );
}

/** The count as it reads. Under ln 2 on average, more likely than not there is no other mind at all. */
const countText = (n: number) => (n < Math.LN2 ? "Likely none but us" : round(n));

/** The reckoning, one card at the foot of the simulation, 2026-11-10: a field of 1,600 drawn stars with the minds
 *  among them lit, one at the Holos odds, the count in our Galaxy counting to each new value as a dial turns, the odds
 *  in words, and where the real ends. */
function Reckoning({ minds, perStar }: { minds: number; perStar: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: minds });
  useEffect(() => {
    const write = () => el.current && (el.current.textContent = countText(shown.current.v));
    if (prefersReducedMotion()) {
      shown.current.v = minds;
      write();
      return;
    }
    // In the log, so a jump from a hundred to a hundred million counts up as steadily as one from a million to two.
    const from = Math.log10(Math.max(1, shown.current.v)),
      to = Math.log10(Math.max(1, minds));
    const k = { t: 0 };
    const tw = gsap.to(k, {
      t: 1,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        shown.current.v = k.t >= 1 ? minds : 10 ** (from + (to - from) * k.t);
        write();
      },
    });
    return () => void tw.kill();
  }, [minds]);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
      <div className="flex max-w-[640px] items-center gap-5 rounded-xl border border-faint bg-paper/85 py-3 pr-5 pl-4 shadow-lg shadow-black/40 backdrop-blur-sm">
        <Field perStar={perStar} />
        <div className="min-w-0">
          <span
            ref={el}
            className="block text-[36px] leading-none font-semibold tracking-tight"
            style={{ color: "var(--you)" }}
          >
            {countText(minds)}
          </span>
          <span className="mt-1 block font-mono text-[11px] tracking-[.1em] text-page-ink2">
            {minds < Math.LN2 ? "IN THE MILKY WAY" : "MINDS IN THE MILKY WAY"} · ONE STAR IN {round(1 / perStar).toUpperCase()}
          </span>
          <span className="mt-2 block border-t border-dashed border-[#b39ef2]/50 pt-1.5 font-mono text-[10.5px] leading-snug text-muted">
            <span className="tracking-[.12em] text-[#b39ef2]">SPECULATION</span> Real stars. The minds are drawn at the dials’ odds.
          </span>
        </div>
      </div>
    </div>
  );
}

/** 1,600 stars as a square of dots, each a chalk fleck, and the minds among them lit in our blue, breathing. At the
 *  Holos odds exactly one lights. Past 1 in 1,600 the one dims toward nothing, since no star in the field would hold a
 *  mind; the dials nearer, more light. A new count lights its stars one by one, scattered through the field. */
const FIELD = 40;
function Field({ perStar }: { perStar: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lit = useRef({ n: 0, dim: 0 });
  useEffect(() => {
    const c = canvas.current!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = 84;
    c.width = c.height = size * dpr;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    // Each dot's place in the lighting order, fixed, so the field reads the same from one odds to the next.
    const r = seededRandom(7);
    const order = Array.from({ length: FIELD * FIELD }, (_, i) => i).sort(() => r() - 0.5);
    const flecks = order.map(() => 0.5 + 0.5 * r());
    const pitch = size / FIELD;
    const want = () => Math.min(FIELD * FIELD, FIELD * FIELD * perStar);
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const w = want();
      // Whole stars light one by one; a fraction under one is the one star, dimmer the longer the odds.
      const target = Math.max(1, w);
      lit.current.n += (target - lit.current.n) * (1 - Math.exp(-dt * 6));
      lit.current.dim += (Math.min(1, w) - lit.current.dim) * (1 - Math.exp(-dt * 4));
      g.clearRect(0, 0, size, size);
      const breath = 0.8 + 0.2 * Math.sin(now / 900);
      for (let i = 0; i < FIELD * FIELD; i++) {
        const k = order[i];
        const x = (k % FIELD) * pitch + pitch / 2, y = Math.floor(k / FIELD) * pitch + pitch / 2;
        const on = i < lit.current.n ? Math.min(1, lit.current.n - i) : 0;
        if (on > 0) {
          const a = on * (i === 0 ? 0.25 + 0.75 * lit.current.dim : 1) * breath;
          g.fillStyle = `rgba(91,184,214,${a})`;
          g.beginPath();
          g.arc(x, y, 1.6, 0, 6.2832);
          g.fill();
          g.fillStyle = `rgba(91,184,214,${a * 0.3})`;
          g.beginPath();
          g.arc(x, y, 4.5, 0, 6.2832);
          g.fill();
          g.fillStyle = `rgba(91,184,214,${a * 0.1})`;
          g.beginPath();
          g.arc(x, y, 9, 0, 6.2832);
          g.fill();
        }
        if (on < 1) {
          g.fillStyle = `rgba(230,227,219,${(1 - on) * 0.55 * flecks[i]})`;
          g.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
        }
      }
    };
    if (prefersReducedMotion()) {
      lit.current.n = Math.max(1, want());
      lit.current.dim = Math.min(1, want());
      draw(performance.now());
      cancelAnimationFrame(raf);
      return;
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [perStar]);
  return <canvas ref={canvas} className="h-[84px] w-[84px] shrink-0" aria-hidden />;
}

/** What we know of a tapped world or mind: what is measured, then, set apart in violet, what the dials drew. */
function Details({ item, onClose }: { item: Pickable; onClose(): void }) {
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!box.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      box.current,
      { autoAlpha: 0, x: 24 },
      { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" },
    );
    return () => void t.kill();
  }, [item.id]);
  return (
    <section
      ref={box}
      className="absolute top-16 right-4 w-[min(340px,calc(100%-2rem))] rounded-lg border border-faint bg-paper/95 p-4 shadow-lg shadow-black/40 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{item.title}</h3>
        <button aria-label="Close" className="font-mono text-[12px] text-muted hover:text-ink" onClick={onClose}>
          ✕
        </button>
      </div>
      <p className="mt-3 font-mono text-[10.5px] tracking-[.12em] text-muted">MEASURED</p>
      {item.real.map((l) => (
        <p key={l} className="mt-1 text-[13px] leading-snug text-ink/90">
          {l}
        </p>
      ))}
      <p className="mt-3 font-mono text-[10.5px] tracking-[.12em] text-[#b39ef2]">SPECULATION</p>
      {item.drawn.map((l) => (
        <p
          key={l}
          className="mt-1 border-l border-dashed border-[#b39ef2]/60 pl-2 text-[13px] leading-snug text-page-ink2"
        >
          {l}
        </p>
      ))}
    </section>
  );
}

/** The tabs at a card's head: a section's lists, one lit. */
function Tabs({ tabs, active, onPick }: { tabs: { id: string; label: string }[]; active: string | null; onPick(id: string): void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 font-mono text-[11px]">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`rounded-full px-3 py-0.5 ${active === t.id ? "bg-ink/15 text-ink" : "text-muted hover:text-ink"}`}
          onClick={() => onPick(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** What a list says when it has nothing in it. */
function emptyOf(tab: Tab): { title: string; words: string } {
  if (tab === "peers")
    return { title: "Likely none but us", words: "No mind woke within 20,000 years of us at these odds, so none is young as we are. Here is the whole Galaxy, from above." };
  if (tab === "minds") return { title: "No minds drawn", words: "At these odds, no mind woke on any star near us." };
  return { title: "Nothing here yet", words: "The stars are still on their way." };
}

/** What we know of a star, a known world or a peer, for the places pick.ts does not cover. A known world's card
 *  adds its star's other planets, and any of our nearest star's known planets. */
function readOf(p: Place): Pickable {
  const real = p.kind === "star" || p.kind === "known";
  const lines = [p.words];
  const host = p.kind === "known" ? KNOWN.find((k) => `known:${k.name}` === p.id)?.host : p.kind === "star" ? p.title : undefined;
  if (host) {
    const others = KNOWN.filter((k) => k.host.toLowerCase() === host.toLowerCase() && `known:${k.name}` !== p.id);
    const warm = others.filter((k) => k.warm).length;
    if (others.length)
      lines.push(
        `${p.kind === "known" ? "Also round" : "Known planets round"} ${host}: ${others.map((k) => k.name).join(", ")}.` +
          (warm ? ` ${warm === 1 ? "One sits" : `${warm} sit`} in the warm zone.` : ""),
      );
    else if (p.kind === "star") lines.push("No planet found round it yet.");
  }
  return {
    id: p.id,
    pos: p.pos,
    d: p.d,
    title: p.title,
    real: real ? lines : ["No catalog reaches it. The dials placed it among the Galaxy’s stars."],
    drawn: real ? [`Nothing. This ${p.kind === "star" ? "star" : "world"} is as we know it.`] : [p.words],
  };
}

/** With the line to Sol on, the view stands off to the side, far enough back that Sol and the place both show. */
function beside(p: Place): Target {
  const [x, y, z] = p.pos;
  // Across the line from Sol, tipped up a little: the cross of the place's direction with straight up.
  const side = Math.hypot(z, x) > 1e-6 ? [-z, 0, x] : [1, 0, 0];
  const k = Math.hypot(side[0], side[2]) || 1;
  return {
    id: `${p.id}:beside`,
    mark: p.id,
    pos: [x / 2, y / 2, z / 2],
    stand: Math.max(p.stand, p.d * 1.25),
    dir: [side[0] / k, 0.35, side[2] / k],
  };
}
