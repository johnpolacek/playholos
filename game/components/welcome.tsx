import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { War } from "@/components/guide";
import { BuildMark, buildTone } from "@/components/marks";
import { useSchedule } from "@/components/picks";
import { ListHead } from "@/components/tab-head";
import { useWorks } from "@/components/works";
import { span } from "@/lib/game/clock";
import { buildOf, EMPTY, schedule, STARTS } from "@/lib/game/plan";
import { SITES } from "@/lib/game/sites";
import { prefersReducedMotion } from "@/lib/motion";

// The walk's first stop on Build: Earth's limb at dawn, the Sun cresting it, city lights on the night side, and what
// we could start, each a tile below with how long it takes alone, and its mark floating over the limb. A pointer on
// either lights both, and left alone they take turns. A tap opens that build's stop. Chosen 2026-10-20 in
// explorations/build-welcome-dawn.html, 04, with its subhead A. Under the builds, on an Earth a war over Taiwan left
// with less compute, the Mind says why their times are long, as on Build. 2026-10-23.

/** The same scatter every time, from a seed. */
const scatter = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/** The dawn at a size, with the marks over it. The limb's top is near the foot, and the marks rise as high as the
 *  words above them allow. With too little sky for them, only their places on the limb glow. */
function Dawn({
  w,
  h,
  under,
  lit,
  still,
  point,
  open,
}: {
  w: number;
  h: number;
  under: number;
  lit: number | null;
  still: boolean;
  point(i: number): void;
  open(i: number): void;
}) {
  const top = h * 0.78;
  const r = w * 1.6;
  const [cx, cy] = [w / 2, top + r];
  const pt = (deg: number, rr: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + rr * Math.sin(a), cy - rr * Math.cos(a)];
  };
  const at = (x: number, rr = r) => (Math.asin(Math.max(-1, Math.min(1, (x - cx) / rr))) * 180) / Math.PI;
  const glow = Math.min(130, h * 0.55);
  const sun = 0.82;
  const [sx, sy] = pt(at(w * sun), r);
  const lift = Math.min(70, top - under - 36);
  const low = lift < 30;

  // Stars above the limb and lights below it, each twinkling at its own moment.
  const sky = useMemo(() => {
    const rnd = scatter(7);
    const stars = Array.from({ length: Math.round((w * top) / 1200) }, (_, i) => (
      <circle
        key={i}
        cx={rnd() * w}
        cy={rnd() * top}
        r={rnd() * 0.7 + 0.3}
        fill="#e6e3db"
        opacity={0.5}
        className="animate-twinkle motion-reduce:animate-none"
        style={{ animationDelay: `${-rnd() * 4}s`, animationDuration: `${3 + rnd() * 4}s` }}
      />
    ));
    const lights = Array.from({ length: 140 }, (_, i) => {
      const [x, y] = pt(at(w * (0.02 + rnd() * 0.96)), r - 6 - rnd() * Math.max(10, h - top));
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={0.35 + rnd() * 0.6}
          opacity={0.5}
          className="animate-twinkle fill-other motion-reduce:animate-none"
          style={{ animationDelay: `${-rnd() * 4}s` }}
        />
      );
    });
    return [stars, lights];
    // The scatter follows the size alone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden className="absolute inset-0 size-full">
      <defs>
        <linearGradient id="dawn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0c0d" />
          <stop offset=".72" stopColor="#0f1b22" />
          <stop offset="1" stopColor="#17323d" />
        </linearGradient>
        <radialGradient id="dawn-sun">
          <stop offset="0" stopColor="#fff4dc" />
          <stop offset=".12" stopColor="#f3c77a" stopOpacity=".9" />
          <stop offset=".45" stopColor="#e0a24a" stopOpacity=".25" />
          <stop offset="1" stopColor="#e0a24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dawn-rim" x1="0" x2="1">
          <stop offset="0" stopColor="#5bb8d6" stopOpacity=".15" />
          <stop offset={sun - 0.07} stopColor="#5bb8d6" stopOpacity=".8" />
          <stop offset={sun + 0.04} stopColor="#ffe3ad" />
          <stop offset="1" stopColor="#5bb8d6" stopOpacity=".3" />
        </linearGradient>
        <radialGradient id="dawn-earth" cx="50%" cy="0%" r="60%">
          <stop offset="0" stopColor="#0e1a20" />
          <stop offset="1" stopColor="#070909" />
        </radialGradient>
        <filter id="dawn-blur">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width={w} height={h} fill="url(#dawn-sky)" />
      {sky[0]}
      <circle cx={sx} cy={sy + 6} r={glow} fill="url(#dawn-sun)">
        {!still && (
          <animate
            attributeName="r"
            values={`${glow * 0.92};${glow * 1.1};${glow * 0.92}`}
            dur="9s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="url(#dawn-rim)" strokeWidth={7} filter="url(#dawn-blur)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#dawn-earth)" stroke="url(#dawn-rim)" strokeWidth={1.4} />
      {sky[1]}
      {STARTS.map((b, i) => {
        const rr = r + lift + (i % 2) * 18;
        const deg = at(w * (0.09 + (i * 0.82) / 7), rr);
        const [mx, my] = pt(deg, rr);
        const [gx, gy] = pt(deg, r);
        const on = lit === i;
        return (
          <g
            key={b.name}
            onPointerEnter={(e) => void (e.pointerType === "mouse" && point(i))}
            onClick={() => open(i)}
            className={`${buildTone(b.name)} cursor-pointer transition-opacity duration-300`}
            style={{ opacity: lit === null || on ? 1 : 0.45 }}
          >
            {!low && (
              <line x1={gx} y1={gy} x2={mx} y2={my + 13} stroke="currentColor" strokeOpacity={0.35} strokeDasharray="1 3" />
            )}
            <circle cx={gx} cy={gy} r={low ? 2.2 : 1.7} fill="currentColor" />
            {on && (
              <circle cx={gx} cy={gy} r={still ? 6 : 3} fill="none" stroke="currentColor" strokeOpacity={0.6}>
                {!still && (
                  <>
                    <animate attributeName="r" values={`3;${low ? 18 : 16}`} dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values=".85;0" dur="1.8s" repeatCount="indefinite" />
                  </>
                )}
              </circle>
            )}
            {!low && (
              <g className="animate-bob motion-reduce:animate-none" style={{ animationDelay: `${-i * 0.45}s` }}>
                {on && <circle cx={mx} cy={my} r={17} fill="currentColor" fillOpacity={0.14} />}
                <circle cx={mx} cy={my} r={13} fill="#0e1418" stroke="currentColor" strokeOpacity={0.75} />
                <g transform={`translate(${mx - 7.5} ${my - 7.5})`}>
                  <BuildMark name={b.name} size={15} still={still} />
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Build's welcome: the dawn, the words over it, and the eight we could start, each opening its stop. */
export function Welcome({ go }: { go(stop: number): void }) {
  const { year } = useGame();
  const { scale } = useSchedule();
  const { pick } = useWorks();
  const scene = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number; under: number }>();
  const [lit, setLit] = useState<number | null>(null);
  const held = useRef(false);
  const [still] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = scene.current;
    const ov = words.current;
    if (!el || !ov) return;
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight, under: ov.offsetTop + ov.offsetHeight });
    const watch = new ResizeObserver(fit);
    watch.observe(el);
    watch.observe(ov);
    return () => watch.disconnect();
  }, []);
  // Left alone, each takes its turn.
  useEffect(() => {
    if (still) return;
    const first = setTimeout(() => !held.current && setLit((l) => l ?? 0), 1400);
    const turn = setInterval(() => !held.current && setLit((l) => ((l ?? -1) + 1) % STARTS.length), 2800);
    return () => {
      clearTimeout(first);
      clearInterval(turn);
    };
  }, [still]);

  // Each alone, at this game's compute.
  const alone = useMemo(
    () => Object.fromEntries(STARTS.map((b) => [b.name, schedule({ ...EMPTY, builds: [b.name] }, scale)[b.name]])),
    [scale],
  );

  // Pointed at, the map flies to where it would stand, as our order's rows do.
  const point = (i: number) => {
    held.current = true;
    setLit(i);
    pick(SITES[STARTS[i].name] ? STARTS[i].name : null);
  };
  const open = (i: number) => go(i + 1);

  return (
    <div
      onPointerLeave={() => {
        held.current = false;
        pick(null);
      }}
      className="flex grow flex-col"
    >
      <div ref={scene} className="relative -mx-4 min-h-[150px] grow overflow-hidden">
        {size && <Dawn {...size} lit={lit} still={still} point={point} open={open} />}
        <div ref={words} className="pointer-events-none absolute inset-x-4 top-3">
          <p className="font-mono text-[10.5px] tracking-[.14em] text-you">WELCOME TO BUILD · YEAR 0</p>
          <h2 className="mt-[5px] text-[26px] leading-[1.12] font-medium tracking-[-.01em]">
            {STARTS.length} builds we could start
          </h2>
          <p className="mt-1.5 max-w-[32ch] text-[14px] leading-[1.35] text-page-ink2">
            {year === null
              ? "Queue enough to put all our compute to work when we begin."
              : "What we queued has been under way since Year 0."}
          </p>
        </div>
      </div>
      <ListHead left={`We could start · ${STARTS.length}`} right="" className="mt-2.5 mb-[7px]" />
      <div className="grid grid-cols-2 gap-2">
        {STARTS.map((b, i) => {
          const on = lit === i;
          const done = alone[b.name];
          // Listening is ours, so blue.
          const does = buildOf(b.name)?.does;
          const tone = does === "listen" ? "you" : does;
          return (
            <button
              key={b.name}
              onClick={() => open(i)}
              onPointerEnter={(e) => void (e.pointerType === "mouse" && point(i))}
              onFocus={(e) => void (e.currentTarget.matches(":focus-visible") && point(i))}
              className={`flex min-w-0 items-center gap-2.5 rounded-xl border px-2.5 py-[9px] text-left transition-colors duration-300 ${on ? "bg-ink/[.03]" : "border-rowline"}`}
              style={on ? { borderColor: `var(--${tone})` } : undefined}
            >
              <span className={buildTone(b.name)}>
                <BuildMark name={b.name} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] leading-[1.2] font-semibold">{b.name}</span>
                <span className="mt-[3px] block font-mono text-[10.5px] text-muted tabular-nums">
                  {done == null ? "past Year 40" : span(done)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <War className="mt-4" />
    </div>
  );
}
