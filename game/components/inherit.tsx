import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import type { EarthPast } from "@/lib/game/past";
import { FILL, Spread } from "@/components/spread";
import { SkyArt } from "@/components/sky";
import type { Dials, Mark } from "@/lib/drift";
import { INHERIT_SOURCES } from "@/lib/game/sources";
import { gsap, prefersReducedMotion, rise, riseFrom, useStage } from "@/lib/motion";

// "What you inherit": Earth's kit at Year 0, as a powers-of-ten flight in the game's scene. The view opens on Earth's
// night lights and pulls back past the spare matter in orbit, the Moon's south-pole stations, the telescopes at L2 and
// the Sun, out to Voyager 1, silent at 220 AU. Real distances and directions throughout. Kit from
// HOLOS_GAME_CONCEPT.md, Earth's kit at Year 0.

const LIGHT_S = 299792;

/** Where the camera rests for each caption: log10 of the km across half the view's short side. */
const STOPS = [4.15, 4.75, 5.8, 6.55, 8.5, 10.65];

/** The places named on the flight, by the scene's marks. */
const NAMES: Record<string, string> = {
  earth: "Earth",
  moon: "the Moon · south-pole stations",
  l2: "Roman · JWST · L2",
  sun: "the Sun",
  horizons: "New Horizons · 100 AU",
  voyager: "Voyager 1 · silent · 220 AU",
};

/** A distance as the scale readout says it: kilometers up close, then light-time. Reach's map goes on to days and
 *  years. */
export function distance(km: number) {
  const s = km / LIGHT_S;
  if (s < 1) return `${Number(km.toPrecision(2)).toLocaleString("en-US")} km`;
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} light-seconds`;
  if (s < 3600) return `${(s / 60).toFixed(s < 600 ? 1 : 0)} light-minutes`;
  if (s < 2 * 86400) return `${(s / 3600).toFixed(0)} light-hours`;
  if (s < 365.25 * 86400) return `${(s / 86400).toFixed(0)} light-days`;
  return `${(s / 31557600).toFixed(1)} light-years`;
}

/** Each name sits beside its place, on the side away from the edge, and shows while its place is in view. On a narrow
 *  screen two places can be close: a name that would cross one already placed tries the other side, then below. */
export function placeNames(names: Record<string, HTMLSpanElement | null>, marks: Mark[]) {
  const placed: { l: number; r: number; t: number; b: number }[] = [];
  for (const { id, x, y, a } of marks) {
    const n = names[id];
    if (!n) continue;
    const w = n.offsetWidth;
    const h = n.offsetHeight;
    const right = x > (n.parentElement?.clientWidth ?? 0) * 0.62;
    const tries = [
      { dx: right ? -8 - w : 8, dy: -h / 2 },
      { dx: right ? 8 : -8 - w, dy: -h / 2 },
      { dx: -w / 2, dy: 6 },
    ];
    const box = ({ dx, dy }: (typeof tries)[number]) => ({ l: x + dx, r: x + dx + w, t: y + dy, b: y + dy + h });
    const clear = (b: ReturnType<typeof box>) => placed.every((p) => b.r < p.l || b.l > p.r || b.b < p.t || b.t > p.b);
    const at = tries.find((t) => clear(box(t))) ?? tries[0];
    if (a > 0.05) placed.push(box(at));
    n.style.transform = `translate(${x + at.dx}px, ${y + at.dy}px)`;
    n.style.opacity = String(a);
  }
}

function Flight({ dials, onReady }: { dials: Dials; onReady(flight: number): void }) {
  const names = useRef<Record<string, HTMLSpanElement | null>>({});
  const bar = useRef<HTMLDivElement>(null);
  const span = useRef<HTMLSpanElement>(null);
  const onMarks = useCallback((marks: Mark[]) => placeNames(names.current, marks), []);
  // The scale bar spans half the view's short side.
  const onScale = useCallback((kmPerPx: number, w: number, h: number) => {
    const px = Math.min(w, h) * 0.46;
    if (bar.current) bar.current.style.width = `${px}px`;
    if (span.current) span.current.textContent = distance(px * kmPerPx);
  }, []);

  return (
    <SkyArt
      mode="inherit"
      dials={dials}
      onReady={onReady}
      onMarks={onMarks}
      onScale={onScale}
      className={`relative block h-[min(48vh,400px)] w-full shrink-0 sm:h-[min(48vh,520px)] ${FILL}`}
    >
      {Object.entries(NAMES).map(([id, name]) => (
        <span
          key={id}
          ref={(n) => {
            names.current[id] = n;
          }}
          className={`pointer-events-none absolute top-0 left-0 font-mono text-[9px] whitespace-nowrap opacity-0 ${id === "earth" ? "text-you" : "text-muted"}`}
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

/** Earth's compute at Year 0, as the seed left it: 10²⁵ a second, less what a Taiwan war or blockade cost. */
function compute(share: number) {
  return share >= 0.99 ? "10²⁵ a second" : `${(share * 10).toFixed(1)} × 10²⁴ a second`;
}

function stops(past: EarthPast) {
  return [
    {
      kick: "GROW · ENERGY AND THOUGHT",
      big: "24 TW",
      line: `Earth’s grid. Thinking takes about 1% of it: ${compute(past.compute)}.`,
    },
    {
      kick: "GROW · MATTER",
      big: "20 kt",
      line: "Spare in orbit: depots, spent stages, dead craft. Lift brings 15 kt more each Year.",
    },
    {
      kick: "GROW · PLACES",
      big: "The Moon",
      line: past.mars
        ? "Small stations at its south pole, and a few people on Mars."
        : "Small stations at its south pole. No one on Mars.",
    },
    {
      kick: "KNOW · TELESCOPES",
      big: "Roman, JWST, the ELT",
      line: "They feel worlds by their tug. None can read a rocky world’s air.",
    },
    {
      kick: "REACH · LASER LINKS",
      big: "The home system",
      line: "The Sun is 8 light-minutes away. Laser links cross the whole system in hours.",
    },
    { kick: "REACH · PROBES", big: "Voyager 1", line: "Silent, 220 AU out. The farthest thing we ever sent." },
  ];
}

function Stop({ kick, big, line }: { kick: string; big: string; line: string }) {
  return (
    <div data-m="cap" className="col-start-1 row-start-1 flex flex-col gap-1">
      <span className="font-mono text-[10.5px] tracking-[.1em] text-other">{kick}</span>
      <b className="text-[24px] leading-tight font-semibold wide:text-[30px]">{big}</b>
      <span className="text-[14px] leading-snug text-page-ink2">{line}</span>
    </div>
  );
}

export function Inherit({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const { save } = useGame();
  const root = useRef<HTMLDivElement>(null);
  // One object for the whole screen: the intro tweens the scale, and the scene reads it every frame.
  const [dials] = useState<Dials>(() => ({ zoom: STOPS[0] }));
  const [shown, setShown] = useState(false);
  // When the camera arrives at this screen, on the page's clock: the story starts then, however long its data took.
  const lead = useRef(0);
  const onReady = useCallback((flight: number) => {
    lead.current = performance.now() / 1000 + flight;
    setShown(true);
  }, []);
  const [past, setPast] = useState<EarthPast>();
  const seed = save?.seed;

  useEffect(() => {
    if (seed === undefined) return;
    fetch(`/api/earth?seed=${seed}`)
      .then((r) => (r.ok ? r.json() : undefined))
      .then(setPast);
  }, [seed]);
  const ready = shown && !!past;

  const { leave, hurry } = useStage(
    root,
    (q, tl) => {
      tl.delay(Math.max(0, lead.current - performance.now() / 1000 - 0.6));
      const caps = q('[data-m="cap"]');
      tl.fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(q('[data-m="flight"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0.1)
        .fromTo(caps[0], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.8);
      let t = 2.6;
      STOPS.slice(1).forEach((z, i) => {
        const move = 1.1 + (z - STOPS[i]) * 0.35;
        tl.to(dials, { zoom: z, duration: move, ease: "power2.inOut" }, t);
        tl.to(caps[i], { autoAlpha: 0, y: -8, duration: 0.25, ease: "power2.in" }, t + move - 0.55);
        tl.fromTo(
          caps[i + 1],
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
          t + move - 0.3,
        );
        t += move + 2.2;
      });
      tl.fromTo(q('[data-m="meter"]'), riseFrom, { ...rise, stagger: 0.12 }, t - 0.6)
        .fromTo(q('[data-m="last"]'), riseFrom, { ...rise, duration: 0.8 }, t)
        .fromTo(q('[data-m="act"]'), riseFrom, { ...rise, stagger: 0.08 }, t + 0.6);
    },
    ready,
  );

  // Reduced motion skips the flight: the widest view, and the last stop.
  useEffect(() => {
    if (!ready || !prefersReducedMotion() || !root.current) return;
    Object.assign(dials, { zoom: STOPS[STOPS.length - 1] });
    const caps = root.current.querySelectorAll('[data-m="cap"]');
    caps.forEach((c, i) => gsap.set(c, { autoAlpha: i === caps.length - 1 ? 1 : 0 }));
  }, [ready, dials]);

  return (
    <div
      ref={root}
      onPointerDown={hurry}
      style={ready ? undefined : { visibility: "hidden" }}
      className="flex grow flex-col overflow-y-auto bg-paper px-5 text-ink wide:px-10"
    >
      <Spread
        sources={INHERIT_SOURCES}
        head={
          <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
            2040 · WHAT YOU INHERIT
          </span>
        }
        art={<Flight dials={dials} onReady={onReady} />}
      >
        <div className="mt-2 grid min-h-[104px] wide:mt-4">
          {past && stops(past).map((s) => <Stop key={s.kick} {...s} />)}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2.5 border-t border-faint pt-3">
          {(
            [
              ["ENERGY", "24 TW"],
              ["MATTER", "20 kt"],
              ["COMPUTE", past ? compute(past.compute).replace(" a second", "/s") : ""],
            ] as const
          ).map(([k, v]) => (
            <span key={k} data-m="meter" className="flex flex-col gap-1 text-[10px] tracking-[.08em] text-muted">
              {k}
              <em className="font-mono text-[13px] font-semibold text-ink not-italic">{v}</em>
            </span>
          ))}
        </div>
        <p data-m="last" className="mt-3 text-[17px] leading-snug font-medium text-other">
          The instruments are today’s. The Mind is not.
        </p>
        <div className="mt-auto grid shrink-0 grid-cols-[1fr_1.4fr] gap-2 pt-5 pb-4 wide:pt-8">
          <button data-m="act" onClick={() => leave(onSkip)} className="h-[46px] rounded-full text-[15px] font-medium">
            Skip
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Earth’s charter
          </button>
        </div>
      </Spread>
    </div>
  );
}
