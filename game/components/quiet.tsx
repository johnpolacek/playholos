import { useMemo, useRef } from "react";
import { IceKey, IceSky } from "@/components/ice-sky";
import { BuildMark, buildColor } from "@/components/marks";
import { useGame } from "@/components/game-provider";
import { usePlan, useSchedule } from "@/components/picks";
import { yearText } from "@/lib/game/clock";
import { iceBetween, skyBetween } from "@/lib/game/natural";
import { buildOf, ordered } from "@/lib/game/plan";
import { moonSearchEnds, tourEnds } from "@/lib/sim/minds";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// A long skip, said: the Years that passed in quiet, drawn as a span filling, the watches that kept it, and the Mind's
// word on why the sky is so quiet. A skip of 37,197 Years landed with no word, and the player read it as nothing
// happening. Playtest 2026-10-30. Rates from HOLOS_GAME_CONCEPT.md, raised 2026-10-31: about 125 million minds in our Galaxy,
// the nearest old one typically about 50 ly away, and a young mind's warm glow reaching us about every 50 Years. And what the
// natural sky did meanwhile, lib/game/natural.ts: each star that exploded drawn where it was in our galaxy, top down,
// flaring in turn, and the mergers our Warm Sky Watch set aside. 2026-10-30.
// These are the Mind's words, said in its note on the map, not a card of their own. 2026-11-04.

/** Our galaxy top down, its middle at the drawing's: 88 px for 40,000 ly, so nearly every star fits. */
const PX = 88 / 40_000;
const gx = (x: number) => 150 + x * PX;
const gy = (y: number) => 90 - y * PX;

/** A skip at least this long, in Years, is a long quiet. */
export const LONG_QUIET = 100;

export function Quiet({ from, to, children }: { from: number; to: number; children?: React.ReactNode }) {
  // Every jump says what reached us, and a long one says what the quiet held too. 2026-11-01.
  const long = to - from >= LONG_QUIET;
  const { plan } = usePlan();
  const { done } = useSchedule();
  const { save } = useGame();
  const seed = save?.seed;
  const watch = ordered(plan).includes("Warm Sky Watch") ? (done["Warm Sky Watch"] ?? null) : null;
  const sky = useMemo(() => (seed === undefined ? null : skyBetween(seed, from, to, watch)), [seed, from, to, watch]);
  const eye = sky?.supernovae.filter((e) => e.eye).length ?? 0;
  // What our Deep Ice Watch heard meanwhile, in the galaxies round us, if it stood by the quiet's end. 2026-11-11.
  const iceAt = ordered(plan).includes("Deep Ice Watch") ? (done["Deep Ice Watch"] ?? null) : null;
  const ice = useMemo(() => (seed === undefined || iceAt === null || iceAt >= to ? null : iceBetween(seed, iceAt, from, to)), [seed, iceAt, from, to]);
  const root = useRef<HTMLDivElement>(null);
  const span = to - from;
  // Our watches standing through the quiet: each listening or seeing build done by its start, less the searches that
  // had ended and the Close Look, which looks once.
  const watches = useMemo(() => {
    const ended = (n: string, at: number) =>
      n === "Close Look" || n === "Relay Search" || (n === "Moon Search" && moonSearchEnds(at) <= from) || (n === "Asteroid Tour" && tourEnds(at) <= from);
    return ordered(plan).filter((n) => {
      const at = done[n];
      return ["listen", "see"].includes(buildOf(n)?.does ?? "") && at != null && at <= from && !ended(n, at);
    });
  }, [plan, done, from]);
  // A tick every power of ten that gives a handful across the span: every 1,000 Years across 37,000 shows 37.
  const step = 10 ** Math.max(1, Math.floor(Math.log10(span / 4)));
  const ticks = Math.min(60, Math.floor(span / step));
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-fill]", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.inOut", transformOrigin: "0 50%" });
      gsap.fromTo("[data-tick]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: 1.4 / Math.max(ticks, 1) });
      gsap.fromTo("[data-sn]", { autoAlpha: 0, scale: 3, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: { amount: 1.6 }, ease: "power2.out" });
      gsap.fromTo("[data-q]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.5, stagger: 0.12, ease: "power3.out" });
    },
    { scope: root, dependencies: [from, to] },
  );
  return (
    <div ref={root} className="flex flex-col gap-2.5">
      {/* The note that holds this puts it away, from its top corner, where late words and rows never move it. */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] tracking-[.1em] text-muted uppercase">
          {long ? "A long quiet" : "We jumped ahead"} · {span < 10 ? span.toFixed(1) : Math.round(span).toLocaleString("en-US")} Years
        </span>
        <b className="text-[17px] leading-snug font-semibold">Year {yearText(to)}</b>
      </div>
      {children}
      {long && (
      <>
      <svg viewBox="0 0 300 34" className="w-full" aria-hidden>
        <line x1="4" x2="296" y1="14" y2="14" className="stroke-track" strokeWidth="3" strokeLinecap="round" />
        <line data-fill x1="4" x2="296" y1="14" y2="14" stroke="var(--you)" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: ticks }, (_, i) => {
          const x = 4 + (292 * (i + 1) * step) / span;
          return x < 294 ? <line key={i} data-tick x1={x} x2={x} y1="9" y2="19" stroke="var(--you)" strokeOpacity=".5" /> : null;
        })}
        <text x="4" y="32" className="fill-muted font-mono" fontSize="9">
          Year {yearText(from)}
        </text>
        <text x="296" y="32" textAnchor="end" className="fill-muted font-mono" fontSize="9">
          Year {yearText(to)}
        </text>
      </svg>
      <p data-q className="text-[13px] leading-snug text-page-ink2">
        {/* The skip stops because something new has come, so the quiet ends here. A playtest read "Nothing new" as the
            stop's own news, 2026-11-01. */}
        {`Nothing else reached us on the way. ${watches.length ? "On watch all the while:" : "No watch of ours was running."}`}
      </p>
      {watches.length > 0 && (
        <ul data-q className="flex flex-wrap gap-x-3 gap-y-1.5">
          {watches.map((n) => (
            <li key={n} className="flex items-center gap-1.5 text-[12px]">
              <span style={{ color: buildColor(n) }}>
                <BuildMark name={n} size={14} />
              </span>
              {n}
            </li>
          ))}
        </ul>
      )}
      {sky && sky.supernovae.length > 0 && (
        <>
          <svg viewBox="0 0 300 180" className="w-full" role="img" aria-label={`Where the ${sky.supernovae.length} stars that exploded meanwhile were, in our galaxy`}>
            <defs>
              <radialGradient id="quiet-disk">
                <stop offset="0" stopColor="var(--ink)" stopOpacity=".22" />
                <stop offset=".35" stopColor="var(--ink)" stopOpacity=".08" />
                <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="150" cy="90" r="88" fill="url(#quiet-disk)" />
            {sky.supernovae.map((e, i) => (
              <circle key={i} data-sn cx={gx(e.x)} cy={gy(e.y)} r={e.eye ? 1.9 : 1} fill={e.eye ? "var(--other)" : "var(--ink)"} fillOpacity={e.eye ? 1 : 0.55} />
            ))}
            {sky.mergers.map((e, i) => (
              <circle key={`m${i}`} data-sn cx={gx(e.x)} cy={gy(e.y)} r="1.6" fill="none" stroke="var(--you)" strokeOpacity=".8" />
            ))}
            <circle cx={gx(8.15 * 3261.6)} cy={gy(0)} r="2.4" fill="var(--you)" />
            <text x={gx(8.15 * 3261.6) + 5} y={gy(0) + 3} className="fill-muted font-mono" fontSize="8">
              us
            </text>
          </svg>
          <p data-q className="text-[13px] leading-snug text-page-ink2">
            Meanwhile {sky.supernovae.length.toLocaleString("en-US")} stars exploded across our galaxy. Our neutrino detectors caught
            each one, and{" "}
            {eye ? (
              <>
                <span className="text-other">{eye.toLocaleString("en-US")}</span> shone bright enough to see by eye.
              </>
            ) : (
              "none shone bright enough to see by eye."
            )}
            {sky.mergers.length > 0 && (
              <>
                {" "}
                Our Warm Sky Watch saw <span className="text-you">{sky.mergers.length.toLocaleString("en-US")}</span> pairs of stars
                merge and glow in their dust, and set each aside as natural.
              </>
            )}
            {sky.betelgeuse && " Betelgeuse exploded, as bright as a half Moon for a season."}
          </p>
        </>
      )}
      {ice && seed !== undefined && iceAt !== null && ice.bright + ice.dark > 0 && (
        <>
          <IceSky seed={seed} since={iceAt} from={from} to={to} />
          <IceKey />
          <p data-q className="text-[13px] leading-snug text-page-ink2">
            In the galaxies round us, our Deep Ice Watch heard {ice.bright.toLocaleString("en-US")} star{ice.bright === 1 ? "" : "s"} explode
            and <span className="text-other">{ice.dark.toLocaleString("en-US")}</span> die dark, with no flash.
            {to - Math.max(from, iceAt) > 20 && " The latest 20 Years of them are drawn."}
          </p>
        </>
      )}
      <p data-q className="text-[13px] leading-snug text-page-ink2">
        A quiet sky is what we expected. Minds are common, about 125 million in our galaxy, the nearest old one likely
        about 50 ly off, and they keep quiet. A young one’s warm glow reaches us about once in 50 Years, if we watch for
        it. Each quiet Year tells us where they are not.
      </p>
      </>
      )}
    </div>
  );
}
