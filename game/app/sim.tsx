import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { SIM_COLOR, SimMark } from "@/components/icons";
import { placeLabel } from "@/components/place-label";
import { Sky, SkyArt, useSky } from "@/components/sky";
import { chain, DIALS, far, odds, PEER_YEARS, round } from "@/lib/about/dials";
import { Funnel, type Tier } from "@/components/funnel";
import type { Dials, Mark } from "@/lib/drift";
import { YEAR_0 } from "@/lib/game/clock";
import { HOLOS_ODDS, type Odds } from "@/lib/sim/draw-minds";
import { pickablesOf, type Pickable } from "@/lib/sim/pick";
import type { WorldOdds } from "@/lib/sim/draw-worlds";
import type { Ask, Drawn } from "@/lib/sim/draw-worker";
import { AHEAD, UNIVERSE, clashesOf, lightAt, timeOf, namedOf, pointsOf, tourOf } from "@/lib/sim/tour";
import { gsap, prefersReducedMotion } from "@/lib/motion";

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
const KICK = "font-mono text-[10.5px] tracking-[.1em] text-muted";
/** One dials object for the whole page, so a new stop eases the view there, not a fresh flight. */
const DIALS_SIM: Dials = {};
/** Past this view, log10 AU, the minds round us crowd at Sol, so the map names only the place in view. */
const NAMES_UNTIL = 8.5;
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
  // The opening shot plays once, on first arriving: the card and labels wait for it to land, and stepping on ends it.
  const [opening, setOpening] = useState(true);

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
  const clashes = useMemo(() => (drawn ? clashesOf(drawn.minds, odds_, drawn.fillers) : []), [drawn, odds_]);
  const points = useMemo(() => (drawn ? pointsOf(drawn.minds, drawn.worlds, TO_NOW) : []), [drawn]);
  // Time passing, on its stop: years from now, and whether it runs by itself.
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
  const stop = tour[Math.min(at, tour.length - 1)];
  const named = useMemo(() => (drawn ? namedOf(drawn.minds, drawn.names, drawn.worlds) : []), [drawn]);
  // Before the dials, the sky as we know it: no drawn minds or worlds, and no dials.
  const revealed = !!stop?.reveal;
  const near = drawn?.near ?? NONE;
  const spokes = useMemo(() => (stop?.spokes ? near.map((n) => n.pos) : undefined), [stop?.spokes, near]);
  // On the dials stop, each world and mind can be tapped: once to fly to it, again to read what we know of it.
  const picking = stop?.id === "dials";
  const pickables = useMemo(
    () => (drawn && picking ? pickablesOf(drawn.minds, drawn.worlds, drawn.names, drawn.starOf) : []),
    [drawn, picking],
  );
  // A pick holds only on the stop it was made on, so stepping on lets it go.
  const [pick, setPick] = useState<{ id: string; open: boolean; stop: string } | null>(null);
  const picked: Pickable | undefined =
    pick && pick.stop === stop?.id ? pickables.find((p) => p.id === pick.id) : undefined;
  const pickAt = useRef<Record<string, { x: number; y: number; a: number }>>({});
  const onTap = useCallback((x: number, y: number) => {
    let best: string | null = null,
      gap = 22;
    for (const [id, p] of Object.entries(pickAt.current)) {
      const g = Math.hypot(p.x - x, p.y - y);
      if (p.a > 0 && g < gap) [best, gap] = [id, g];
    }
    setPick((was) => (best ? { id: best, open: was?.id === best, stop: "dials" } : null));
  }, []);

  const sim = useMemo(
    () => ({
      minds: revealed ? points : NONE,
      // Before the first draw comes, the tour's opening: the universe we can see.
      focus: picked ? picked.pos : stop ? stop.focus : null,
      zoom: picked ? Math.min(8.3, Math.max(6.5, Math.log10(5 * picked.d * 63241.077))) : (stop?.zoom ?? UNIVERSE),
      clash: stop?.clash,
      spokes,
      time: stop?.time ? { years, light: lightAt(years, TODAY) } : undefined,
      ring: stop?.id === "dials" && !result.nearest.beyond ? result.nearest.ly : undefined,
      intro: opening && stop?.id === "universe" ? 1 : undefined,
      // The place in view first, so its name wins a crowded spot, then Sol, then the minds round us.
      marks: [
        ...(picked ? [{ id: "here", pos: picked.pos }] : stop?.focus ? [{ id: "here", pos: stop.focus }] : []),
        ...(picked ? [{ id: "Sol", pos: [0, 0, 0] as [number, number, number] }] : []),
        ...pickables.map((p) => ({ id: `pick:${p.id}`, pos: p.pos })),
        ...(stop?.notes ? stop.notes : [{ id: "Sol", pos: [0, 0, 0] as [number, number, number] }]),
        ...(spokes ? near.map((n, i) => ({ id: `near-${i}`, pos: n.pos })) : []),
        ...(stop?.id === "dials" ? [{ id: "ring", pos: [0, 0, 0] as [number, number, number], ring: true }] : []),
        ...(revealed && stop.zoom < NAMES_UNTIL ? named.filter((n) => n.pos.join() !== stop.focus?.join()) : []),
      ],
    }),
    [points, stop, named, revealed, spokes, near, years, opening, result, picked, pickables],
  );

  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  // A note's words sit off from its place, joined by a line that ends in a dot on the place.
  const leads = useRef<Record<string, SVGGElement | null>>({});
  const offs = useRef<Record<string, [number, number]>>({});
  // When the stop's notes came, so each can draw itself in: its dot pops, its line runs out, its words slide in off the
  // line's end, one note after another.
  const notesAt = useRef(0);
  const order = useRef<Record<string, number>>({});
  useEffect(() => {
    offs.current = Object.fromEntries((stop?.notes ?? []).map((n) => [n.id, n.off]));
    order.current = Object.fromEntries((stop?.notes ?? []).map((n, i) => [n.id, i]));
    notesAt.current = opening ? Infinity : performance.now();
  }, [stop, opening]);
  useEffect(() => {
    if (!opening || stop?.id !== "universe") return;
    const t = setTimeout(() => setOpening(false), INTRO_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [opening, stop?.id]);
  const onMarks = useCallback((marks: Mark[]) => {
    const taken: Parameters<typeof placeLabel>[4] = [];
    const marked = new Set(marks.map((m) => m.id));
    for (const [id, n] of Object.entries(names.current)) if (n && !marked.has(id)) n.style.opacity = "0";
    for (const [id, g] of Object.entries(leads.current)) if (g && !marked.has(id)) g.style.opacity = "0";
    pickAt.current = {};
    for (const { id, x, y, a } of marks) {
      if (id.startsWith("pick:")) pickAt.current[id.slice(5)] = { x, y, a };
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
      // The words go out to the side the line leaves on, and the line meets them at their near end.
      const w = n.offsetWidth,
        h = n.offsetHeight;
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
  }, [stop?.id, opening]);

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
                {picked ? `${picked.title} · ${far(picked.d)}` : stop?.label}
              </span>
              <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                {stop?.notes?.map((n) => (
                  <g key={n.id} ref={(el) => void (leads.current[n.id] = el)} className="opacity-0" stroke="var(--ink)">
                    <line strokeWidth={1} strokeOpacity={0.55} />
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
              <span
                ref={(el) => void (names.current.ring = el)}
                className={`${label} text-[13px]`}
                style={{ color: "var(--you)" }}
              >
                Our nearest mind, likely within {far(result.nearest.ly)}
              </span>
              {near.map((n, i) => (
                <span
                  key={n.name}
                  ref={(el) => void (names.current[`near-${i}`] = el)}
                  className={`${label} text-page-ink2`}
                >
                  {n.name} <span className="text-muted">{n.d.toFixed(1)} ly</span>
                </span>
              ))}
              {named.map((n) => (
                <span
                  key={n.id}
                  ref={(el) => void (names.current[n.id] = el)}
                  className={`${label} inline-flex items-center gap-1 text-muted`}
                >
                  <span style={{ color: SIM_COLOR[n.kind] }}>
                    <SimMark kind={n.kind} />
                  </span>
                  {n.label}
                </span>
              ))}
            </SkyArt>
            <Turn onTap={picking ? onTap : undefined} />
            {picked && pick?.open && (
              <Details item={picked} onClose={() => setPick({ id: picked.id, open: false, stop: "dials" })} />
            )}
            <Link
              to="/"
              className="absolute top-4 right-4 rounded-full border border-faint bg-paper/70 px-3 py-1 font-mono text-[11px] text-muted hover:text-ink"
            >
              Play the game
            </Link>
            {stop?.id === "dials" && <Count minds={result.galaxy} />}
            <div className="pointer-events-none absolute bottom-4 left-4 flex max-w-xl flex-col items-start gap-2 pr-4">
              {clashes.length > 0 && (
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
            {/* Where the real ends: from the dials on, the minds and their worlds are drawn, not seen. */}
            {revealed && (
              <p className="pointer-events-none absolute right-4 bottom-4 flex max-w-[320px] items-start gap-2 rounded-lg border border-dashed border-[#b39ef2]/60 bg-paper/90 px-3 py-1.5 font-mono text-[11px] text-[#b39ef2] backdrop-blur-sm">
                <span className="tracking-[.12em]">SPECULATION</span>
                <span className="text-page-ink2">
                  Real stars. The minds and their worlds are drawn at the dials’ odds.
                </span>
              </p>
            )}
            {stop && (
              <section
                ref={card}
                className={`absolute top-4 left-4 right-36 max-w-md rounded-lg border border-faint bg-paper/95 p-3 shadow-lg shadow-black/40 backdrop-blur-sm transition-opacity duration-700 ${opening ? "pointer-events-none opacity-0" : "opacity-100"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={KICK}>
                    {Math.min(at, tour.length - 1) + 1} / {tour.length}
                    {busy ? " · DRAWING…" : ""}
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
                      className="rounded-full border border-faint px-3 py-0.5 font-mono text-[11px] disabled:opacity-30"
                      disabled={at >= tour.length - 1}
                      onClick={() => (setOpening(false), setAt((a) => Math.min(tour.length - 1, a + 1)))}
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
                {stop.time && drawn && (
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

/** The map turned by hand: a drag spins the view round and tips it, in every stop. It sits under the cards. */
function Turn({ onTap }: { onTap?(x: number, y: number): void }) {
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
        if (!from.current) return;
        const { width, height } = e.currentTarget.getBoundingClientRect();
        sky?.turn((e.clientX - from.current.x) / width, (e.clientY - from.current.y) / height);
        from.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        from.current = null;
        const d = down.current;
        down.current = null;
        if (!onTap || !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
        const r = e.currentTarget.getBoundingClientRect();
        onTap(e.clientX - r.left, e.clientY - r.top);
      }}
      onPointerCancel={() => (from.current = null)}
    />
  );
}

/** The count as it reads. Under ln 2 on average, more likely than not there is no other mind at all. */
const countText = (n: number) => (n < Math.LN2 ? "Likely none but us" : round(n));

/** The minds in our Galaxy at these odds, large, counting to each new value as a dial turns. */
function Count({ minds }: { minds: number }) {
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
    <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center [text-shadow:0_0_8px_#000,0_0_16px_#000]">
      <span
        ref={el}
        className="block text-[44px] leading-none font-semibold tracking-tight"
        style={{ color: "var(--you)" }}
      >
        {countText(minds)}
      </span>
      <span className="mt-1 block font-mono text-[12px] text-page-ink2">
        {minds < Math.LN2 ? "IN THE MILKY WAY" : "MINDS IN THE MILKY WAY"}
      </span>
    </div>
  );
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
