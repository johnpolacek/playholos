import { useEffect, useRef, useState } from "react";
import { useReach, type Target } from "@/components/reach";
import { placeLeads } from "@/lib/game/places";
import { flybyBeta, flybyYears, SAIL_REACH, sailArrives, sailYears } from "@/lib/sim/speeds";
import { gsap, prefersReducedMotion } from "@/lib/motion";

// How we reach's first stop, 2026-11-13: how far the galaxy is, in place of Voyager 1. Four places, each far past the
// last: the nearest star, the nearest black hole we know, the galaxy's center, and the nearest big galaxy. The map
// flies to each in turn and the times count up, light's and a Seed Ship's. A ladder of the four on the right steps
// through them, and plays on by itself. The times are light's, a sail's and a flyby probe's, 2026-11-13. Past 16 ly
// dust wears a sail away, and past about 12,500 ly it holds a probe under a tenth of light speed.
//
// Distances: Proxima from the sky file, Gaia BH1 from El-Badry et al. 2023, the center from GRAVITY 2022 (8.28 kpc),
// Andromeda from the atlas's Local Volume Database (776 kpc). The craft's Years are speeds.ts's.

/** Each place, where it is in the sky (right ascension in hours, declination in degrees) and what it is. */
const PLACES = [
  {
    id: "Proxima Centauri",
    name: "Proxima Centauri",
    kind: "The nearest star",
    ly: 4.24,
    far: "4.24 ly",
    line: "A world as heavy as Earth goes round it, where it is warm enough for water.",
  },
  {
    id: "Gaia BH1",
    name: "Gaia BH1",
    kind: "The nearest black hole we know",
    ly: 1560,
    far: "1,560 ly",
    at: [17.478083, -0.58098] as const,
    line: "Ten Suns of mass, dark, with a star like ours going round it every six months.",
  },
  {
    id: "Sagittarius A*",
    name: "The galaxy’s center",
    kind: "Sagittarius A*",
    ly: 27000,
    far: "27,000 ly",
    at: [17.761122, -29.00781] as const,
    line: "A black hole of four million Suns, hidden from our eyes behind a wall of dust.",
  },
  {
    id: "Andromeda",
    name: "Andromeda",
    kind: "The nearest big galaxy",
    ly: 2.53e6,
    far: "2.5 million ly",
    at: [0.712261, 41.265667] as const,
    line: "About a trillion stars. The light we see from it left before our kind walked the Earth.",
  },
].map((p) => ({ ...p, sail: sailArrives(p.ly) ? sailYears(p.ly) : null, probe: flybyYears(p.ly), probeBeta: flybyBeta(p.ly) }));

// The map finds the far three as it finds a black hole found in play.
placeLeads(Object.fromEntries(PLACES.flatMap((p) => (p.at ? [[p.id, [p.at[0], p.at[1], p.ly] as [number, number, number]]] : []))));

const targetOf = (p: (typeof PLACES)[number]): Target => ({ id: p.id, name: p.name, ly: p.ly, far: p.far });

/** How long each place holds before the next. */
const DWELL = 7.5;

/** Years in words: a tenth under ten, three figures to a million, then millions. */
function yearsText(y: number) {
  if (y < 10) return y.toFixed(1);
  if (y >= 1e6) return `${Number((y / 1e6).toPrecision(2)).toLocaleString("en-US")} million`;
  return Number(y.toPrecision(3)).toLocaleString("en-US");
}

/** A number of years that counts up from nothing as it opens. */
function Count({ years }: { years: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const n = ref.current;
    if (!n) return;
    if (prefersReducedMotion()) return void (n.textContent = yearsText(years));
    // On a log scale, so the small numbers show a moment too.
    const d = { k: 0 };
    const t = gsap.to(d, {
      k: 1,
      duration: 1.6,
      ease: "power3.out",
      onUpdate: () => void (n.textContent = yearsText(years ** d.k * Math.min(1, d.k * 4))),
    });
    return () => void t.kill();
  }, [years]);
  return <span ref={ref}>{yearsText(years)}</span>;
}

export function ReachScale() {
  const { aim } = useReach();
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const fill = useRef<(HTMLSpanElement | null)[]>([]);
  const place = PLACES[at];

  // The map flies to each place, and back to the nearest star as the stop closes.
  useEffect(() => aim(targetOf(place)), [aim, place]);
  useEffect(() => () => aim(null), [aim]);

  // The fill runs down the line to the next place, and moves on when full. A tap on a place starts it from there.
  useEffect(() => {
    fill.current.forEach((n) => n && gsap.set(n, { scaleY: 0 }));
    if (!playing) return;
    const n = fill.current[at];
    const next = () => setAt((a) => (a + 1) % PLACES.length);
    const t = n ? gsap.to(n, { scaleY: 1, duration: DWELL, ease: "none", onComplete: next }) : gsap.delayedCall(DWELL, next);
    return () => void t.kill();
  }, [at, playing]);

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* The place in view, and how long to get there. */}
      <div key={at} className="rounded-lg border border-faint bg-paper/40 px-3.5 py-3">
        <div className="font-mono text-[10px] tracking-[.08em] text-muted uppercase">{place.kind}</div>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <span className="text-[17px] font-medium text-ink">{place.name}</span>
          <span className="font-mono text-[12px] text-you">{place.far}</span>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-page-ink2">{place.line}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { label: "BY LIGHT", years: place.ly, note: "nothing is faster", tone: "text-ink" },
            { label: "BY SAIL", years: place.sail, note: place.sail === null ? `dust wears it away past ${Math.round(SAIL_REACH)} ly` : "a fifth of light", tone: "text-you" },
            { label: "BY FLYBY PROBE", years: place.probe, note: place.probeBeta < 0.1 ? "slowed so dust spares its shield" : "a tenth of light", tone: "text-you" },
          ].map((t) => (
            <div key={t.label}>
              <div className="font-mono text-[9px] tracking-[.06em] whitespace-nowrap text-muted">{t.label}</div>
              {t.years === null ? (
                <div className="text-[19px] leading-tight font-medium text-muted">Worn away</div>
              ) : (
                <div className={`text-[19px] leading-tight font-medium tabular-nums ${t.tone}`}>
                  <Count years={t.years} />
                </div>
              )}
              <div className="text-[11px] leading-snug text-muted">{t.years === null ? t.note : `years, ${t.note}`}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The four places down a line, each far past the last. A tap flies there. */}
      <nav aria-label="Places" onPointerUp={(e) => e.stopPropagation()} className="relative">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[.08em] text-muted">OUT FROM EARTH</span>
          <button
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Hold here" : "Play on"}
            className="-my-2 -mr-2 flex h-9 items-center gap-1.5 px-2 font-mono text-[10px] tracking-[.08em] text-muted"
          >
            {playing ? (
              <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden className="fill-current">
                <rect width="3" height="10" />
                <rect x="6" width="3" height="10" />
              </svg>
            ) : (
              <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden className="fill-current">
                <path d="M0 0 L9 5 L0 10 Z" />
              </svg>
            )}
            {playing ? "HOLD" : "PLAY"}
          </button>
        </div>
        <ol className="flex flex-col">
          {PLACES.map((p, i) => {
            const on = i === at;
            const past = i < at;
            const next = PLACES[i + 1];
            return (
              <li key={p.id} className="relative">
                <button onClick={() => setAt(i)} aria-current={on ? "step" : undefined} className="flex w-full items-center gap-3 py-1.5 text-left">
                  <span className="relative flex size-5 shrink-0 items-center justify-center">
                    {on && <span className="absolute inset-0 animate-ping rounded-full bg-you/30 motion-reduce:hidden" />}
                    <span className={`rounded-full transition-all duration-500 ${on ? "size-3 bg-you shadow-[0_0_12px] shadow-you" : past ? "size-2 bg-you/60" : "size-2 bg-muted/60"}`} />
                  </span>
                  <span className="flex grow items-baseline justify-between gap-2">
                    <span className={`text-[14px] transition-colors ${on ? "font-medium text-ink" : "text-page-ink2"}`}>{p.name}</span>
                    <span className={`font-mono text-[11px] ${on ? "text-you" : "text-muted"}`}>{p.far}</span>
                  </span>
                </button>
                {next && (
                  <div className="relative ml-[9px] flex h-7 items-center pl-[22px]">
                    <span className="absolute top-0 bottom-0 -left-px w-0.5 rounded-full bg-faint" />
                    <span
                      ref={(n) => {
                        fill.current[i] = n;
                      }}
                      className="absolute top-0 bottom-0 -left-px w-0.5 origin-top scale-y-0 rounded-full bg-you shadow-[0_0_6px] shadow-you"
                    />
                    <span className="font-mono text-[10px] text-muted">{Math.round(next.ly / p.ly).toLocaleString("en-US")}× farther</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
