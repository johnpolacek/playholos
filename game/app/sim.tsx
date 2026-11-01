import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { placeLabel } from "@/components/place-label";
import { Sky, SkyArt } from "@/components/sky";
import { DIALS, odds, round } from "@/lib/about/dials";
import type { Dials, Mark } from "@/lib/drift";
import { HOLOS_ODDS, type Odds } from "@/lib/sim/draw-minds";
import type { WorldOdds } from "@/lib/sim/draw-worlds";
import type { Ask, Drawn } from "@/lib/sim/draw-worker";
import { clashesOf, namedOf, pointsOf, tourOf } from "@/lib/sim/tour";
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

export default function Sim() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [spread, setSpread] = useState(HOLOS_ODDS.spreadTop);
  const [seed, setSeed] = useState(10);
  const [drawn, setDrawn] = useState<Drawn | null>(null);
  const [at, setAt] = useState(0);

  const perStar = DIALS.reduce((p, d) => p * (values[d.key] ?? d.holos), 1);
  const odds_: Odds = useMemo(() => ({ starsPerMind: 1 / perStar, spreadTop: spread }), [perStar, spread]);
  // The steps a natural world turns on, from the same dials.
  const worldOdds: WorldOdds = useMemo(() => {
    const v = (k: string) => values[k] ?? DIALS.find((d) => d.key === k)!.holos;
    return { warm: v("warm"), air: v("air"), start: v("start"), last: v("last"), animals: v("animals") };
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
      const ask: Ask = { id: ++asked.current, key, seed, odds: odds_, worlds: worldOdds };
      worker.current?.postMessage(ask);
    }, 250);
    return () => clearTimeout(t);
  }, [key, seed, odds_, worldOdds]);

  const tour = useMemo(() => (drawn ? tourOf(drawn.minds, odds_, drawn.names, drawn.worlds) : []), [drawn, odds_]);
  const clashes = useMemo(() => (drawn ? clashesOf(drawn.minds, odds_, drawn.fillers) : []), [drawn, odds_]);
  const points = useMemo(() => (drawn ? pointsOf(drawn.minds, drawn.worlds) : []), [drawn]);
  const stop = tour[Math.min(at, tour.length - 1)];
  const named = useMemo(() => (drawn ? namedOf(drawn.minds, drawn.names, drawn.worlds) : []), [drawn]);

  const sim = useMemo(
    () => ({
      minds: points,
      focus: stop?.focus ?? null,
      zoom: stop?.zoom,
      clash: stop?.clash,
      // The place in view first, so its name wins a crowded spot, then Sol, then the minds round us.
      marks: [
        ...(stop?.focus ? [{ id: "here", pos: stop.focus }] : []),
        { id: "Sol", pos: [0, 0, 0] as [number, number, number] },
        ...(stop && stop.zoom < NAMES_UNTIL ? named.filter((n) => n.pos.join() !== stop.focus?.join()) : []),
      ],
    }),
    [points, stop, named],
  );

  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const onMarks = useCallback((marks: Mark[]) => {
    const taken: Parameters<typeof placeLabel>[4] = [];
    const marked = new Set(marks.map((m) => m.id));
    for (const [id, n] of Object.entries(names.current)) if (n && !marked.has(id)) n.style.opacity = "0";
    for (const { id, x, y, a } of marks) {
      const n = names.current[id];
      if (!n) continue;
      n.style.opacity = a <= 0 ? "0" : String(a * placeLabel(n, x, y, null, taken));
    }
  }, []);

  // Each stop's card rises in as the view turns to it.
  const card = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!card.current || prefersReducedMotion()) return;
    const t = gsap.fromTo(card.current.querySelectorAll("[data-rise]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.15 });
    return () => void t.kill();
  }, [stop?.id]);

  const set = (key: string, v: number) => setValues((o) => ({ ...o, [key]: v }));
  const label = "pointer-events-none absolute top-0 left-0 font-mono text-[10px] whitespace-nowrap opacity-0";

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-paper text-ink">
      <Sky shade={false}>
        <div className="flex min-h-0 grow flex-col wide:grid wide:grid-cols-[minmax(0,1fr)_clamp(340px,32vw,440px)]">
          <div className="relative min-h-[46dvh] grow">
            <SkyArt mode="sim" dials={DIALS_SIM} sim={sim} onMarks={onMarks} className="absolute inset-0 overflow-hidden">
              <span ref={(n) => void (names.current.Sol = n)} className={`${label} text-ink`}>
                Sol
              </span>
              <span ref={(n) => void (names.current.here = n)} className={label} style={{ color: stop?.clash ? ROSE : undefined }}>
                {stop?.label}
              </span>
              {named.map((n) => (
                <span key={n.id} ref={(el) => void (names.current[n.id] = el)} className={`${label} text-muted`}>
                  {n.label}
                </span>
              ))}
            </SkyArt>
            <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <div>
                <p className={KICK}>SIMULATION</p>
                <h1 className="mt-1 text-lg font-semibold">The sky at our odds</h1>
              </div>
              <Link to="/" className="rounded-full border border-faint px-3 py-1 font-mono text-[11px] text-muted hover:text-ink">
                Play the game
              </Link>
            </header>
            {clashes.length > 0 && (
              <div
                role="alert"
                className="absolute inset-x-4 top-20 max-w-xl rounded-lg border-2 bg-paper/90 p-3"
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
            {stop && (
              <section ref={card} className="absolute inset-x-4 bottom-4 max-w-xl rounded-lg border border-faint bg-paper/85 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className={KICK}>
                    STOP {Math.min(at, tour.length - 1) + 1} OF {tour.length}
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
                      onClick={() => setAt((a) => Math.min(tour.length - 1, a + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
                <h2 data-rise className="mt-1.5 font-semibold" style={{ color: stop.clash ? ROSE : undefined }}>
                  {stop.title}
                </h2>
                <p data-rise className="mt-1 text-[13px] leading-snug text-page-ink2">
                  {stop.words}
                </p>
              </section>
            )}
          </div>

          <aside className="max-h-[54dvh] overflow-y-auto border-t border-faint bg-panel px-4 py-4 wide:max-h-none wide:border-t-0 wide:border-l">
            <p className={KICK}>THE DIALS</p>
            <p className="mt-1 text-[13px] text-page-ink2">
              One star in {round(1 / perStar)} holds a mind. Each step can turn as far as the research allows. The mark is
              Holos’s own.
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
              limit={drawn ? toSlider(Math.min(SPREAD.hi, Math.max(SPREAD.lo, drawn.safeTop)), SPREAD.lo, SPREAD.hi) : undefined}
              onChange={(n) => setSpread(fromSlider(n, SPREAD.lo, SPREAD.hi))}
            />
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Why it is held low: a mind that spreads settles its nearest stars, and each colony may spread again. Past a
              point, one family never stops and reaches every star. With {round(2e11 / (1 / perStar))} minds in our Galaxy,
              that point is about {drawn ? odds(drawn.safeTop) : "…"}, the rose tick. We find no settlers here, so the
              chance must stay under it.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="rounded-full border border-faint px-3 py-1 font-mono text-[11px] hover:text-ink"
                onClick={() => setSeed((s) => s + 1)}
              >
                Another sky
              </button>
              <button
                className="rounded-full border border-faint px-3 py-1 font-mono text-[11px] text-muted hover:text-ink"
                onClick={() => {
                  setValues({});
                  setSpread(HOLOS_ODDS.spreadTop);
                }}
              >
                Holos’s odds
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted">SKY {seed}</p>
          </aside>
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
        <span className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-fill2" style={{ left: `${(mark / STEPS) * 100}%` }} />
        {limit !== undefined && (
          <span className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2" style={{ left: `${(limit / STEPS) * 100}%`, background: ROSE }} />
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
