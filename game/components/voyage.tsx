import type { Road } from "@/lib/game/reach";
import { lyOf, yearText } from "@/lib/game/clock";

// A craft of ours on its way, drawn: the road from the Sun to its star on a ruler where each step is ten times farther,
// as Reach measures the Galaxy, so the first light-year and the ten-thousandth both fit. The craft sits where it is now:
// in its yard, in flight with its wake behind it, or there, with its word crossing back as a line of light. A line of
// text, "A sentinel of ours is on its way", was all Prometheus's page said of a craft 10,000 ly from home. 2026-11-13.

const W = 340;
const H = 104;
const X0 = 22;
const X1 = W - 26;
const Y = 50;
/** The ruler's first step: about 630 AU, out past the Sun's lens. */
const NEAR = 0.01;

/** Landmarks a craft passes on its way, real distances in light-years. */
const MARKS: [string, number][] = [
  ["Oort cloud", 1],
  ["Proxima", 4.24],
  ["Pleiades", 444],
  ["Orion Nebula", 1344],
  ["The Galaxy’s heart", 26_700],
];

const STARS = Array.from({ length: 36 }, (_, k) => ({ x: (k * 97.3) % W, y: (k * 53.7) % H, r: k % 7 ? 0.45 : 0.8, o: 0.15 + ((k * 13) % 10) / 30 }));

type Phase = "yard" | "flight" | "word" | "home";

export function Voyage({ road, craft, star, ly, now, warm }: { road: Road; craft: string; star: string; ly: number; now: number; warm: boolean }) {
  const { leaves, arrives, home } = road;
  const phase: Phase = leaves === null || now < leaves ? "yard" : arrives === null || now < arrives ? "flight" : home === null || now < home ? "word" : "home";
  // Where the craft is, light-years out: cruising nearly all the way, so even pace stands in for its burns.
  const flown = phase === "yard" ? 0 : phase === "flight" ? (ly * (now - leaves!)) / (arrives! - leaves!) : ly;
  // Where its word is, on the way home.
  const word = phase === "word" ? Math.max(0, ly - (now - arrives!)) : null;
  const top = Math.log10(Math.max(ly, NEAR * 10));
  const x = (d: number) => X0 + ((Math.log10(Math.max(d, NEAR)) - Math.log10(NEAR)) / (top - Math.log10(NEAR))) * (X1 - X0);
  const at = x(flown);
  const marks = MARKS.filter(([, d]) => d < ly * 0.8);
  const target = warm ? "var(--other)" : "var(--you)";
  const status =
    phase === "yard"
      ? road.fuelWait && now >= road.fuelWait.built
        ? `Built, waiting on ${road.fuelWait.fuel}. It leaves in Year ${yearText(leaves!)}.`
        : leaves === null
          ? "In our yard. No Year to leave yet."
          : `In our yard. It leaves in Year ${yearText(leaves)}.`
      : phase === "flight"
        ? `In flight at ${road.speed.toFixed(2)} of light’s speed. It arrives in Year ${yearText(arrives!)}.`
        : phase === "word"
          ? `There. Its first word is crossing back, home by Year ${yearText(home!)}.`
          : "There, and its word is home.";
  return (
    <section data-m className="mt-3 overflow-hidden rounded-xl border border-you/40 bg-[radial-gradient(120%_90%_at_0%_50%,rgba(91,184,214,.10),transparent_60%)] px-3 pt-2.5 pb-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] tracking-[.1em] text-you uppercase">
          {craft} · bound for {star}
        </span>
        <span className="font-mono text-[10px] text-muted tabular-nums">{lyOf(ly)} ly</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block w-full" role="img" aria-label={`${craft}, ${lyOf(flown)} of ${lyOf(ly)} light-years out. ${status}`}>
        <defs>
          <radialGradient id="voy-sun">
            <stop offset="0" stopColor="#fff6d8" />
            <stop offset=".3" stopColor="#ffd98a" stopOpacity=".7" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="voy-craft">
            <stop offset="0" stopColor="#e9f8ff" />
            <stop offset=".4" stopColor="var(--you)" stopOpacity=".8" />
            <stop offset="1" stopColor="var(--you)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="voy-wake" x1="0" x2="1">
            <stop offset="0" stopColor="var(--you)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--you)" stopOpacity=".9" />
          </linearGradient>
        </defs>
        {STARS.map((s, k) => (
          <circle key={k} cx={s.x} cy={s.y} r={s.r} fill="#cfd6e4" opacity={s.o} />
        ))}
        {/* The road: still to fly, dashed and flowing outward; flown, solid. */}
        <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="var(--you)" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 4" className="animate-[voy-flow_2.4s_linear_infinite] motion-reduce:animate-none" />
        {flown > 0 && <line x1={X0} y1={Y} x2={at} y2={Y} stroke="var(--you)" strokeWidth="1.4" />}
        {/* Each step ten times farther. */}
        {Array.from({ length: Math.floor(top - Math.log10(NEAR)) + 1 }, (_, k) => 10 ** (Math.log10(NEAR) + k)).map((d) => (
          <g key={d}>
            <line x1={x(d)} y1={Y - 3} x2={x(d)} y2={Y + 3} stroke="var(--muted)" strokeOpacity=".5" strokeWidth=".6" />
            {/* The first step sits on the Sun, which names it. */}
            {d > NEAR && (
              <text x={x(d)} y={Y + 13} textAnchor="middle" fontSize="6.5" className="fill-muted font-mono" opacity=".75">
                {d < 1 ? d : lyOf(d)}
              </text>
            )}
          </g>
        ))}
        {marks.map(([name, d], k) => (
          <g key={name}>
            <line x1={x(d)} y1={Y - 4} x2={x(d)} y2={Y - 14 - (k % 2) * 9} stroke="var(--muted)" strokeOpacity=".35" strokeWidth=".5" />
            <text x={x(d)} y={Y - 16 - (k % 2) * 9} textAnchor="middle" fontSize="6.5" className="fill-page-ink2 font-mono">
              {name}
            </text>
          </g>
        ))}
        <circle cx={X0} cy={Y} r="11" fill="url(#voy-sun)" />
        <circle cx={X0} cy={Y} r="2.2" fill="#fff6d8" />
        <text x={X0} y={Y + 24} textAnchor="middle" fontSize="7" className="fill-muted font-mono">Sun</text>
        {/* Where it goes, breathing as Scan draws a warm glow. */}
        <circle cx={X1} cy={Y} r="7" fill="none" stroke={target} strokeWidth="1" strokeDasharray="1.6 2.2" className="origin-center animate-[spin_30s_linear_infinite] motion-reduce:animate-none" style={{ transformBox: "fill-box" }} />
        <circle cx={X1} cy={Y} r="2.4" fill={target} className="animate-pulse motion-reduce:animate-none" />
        <text x={X1} y={Y + 24} textAnchor="end" fontSize="7" className="font-mono" fill={target}>{star}</text>
        {/* Its first word home, a line of light running back. */}
        {word !== null && (
          <line x1={x(word)} y1={Y + 1.5} x2={X1} y2={Y + 1.5} stroke="var(--other)" strokeWidth="1.2" strokeDasharray="5 3" className="animate-[voy-back_1.2s_linear_infinite] motion-reduce:animate-none" />
        )}
        {/* The craft: its wake behind it in flight, still in the yard before. */}
        {phase === "flight" && <line x1={Math.max(X0, at - 34)} y1={Y} x2={at} y2={Y} stroke="url(#voy-wake)" strokeWidth="2.6" strokeLinecap="round" />}
        {phase !== "home" && (
          <g>
            <circle cx={at} cy={Y} r={phase === "yard" ? 6 : 8} fill="url(#voy-craft)" className="animate-pulse motion-reduce:animate-none" />
            <circle cx={at} cy={Y} r="1.8" fill="#e9f8ff" />
          </g>
        )}
      </svg>
      <p className="mt-1 text-[13px] leading-snug text-ink">{status}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 font-mono text-[10px] text-muted">
        <div>
          <dt className="tracking-[.08em] uppercase">Flown</dt>
          <dd className="mt-0.5 text-[12px] text-ink tabular-nums">{lyOf(flown)} ly</dd>
        </div>
        <div>
          <dt className="tracking-[.08em] uppercase">Arrives</dt>
          <dd className="mt-0.5 text-[12px] text-ink tabular-nums">{arrives === null ? "Not yet" : `Year ${yearText(arrives)}`}</dd>
        </div>
        <div>
          <dt className="tracking-[.08em] uppercase">Word home</dt>
          <dd className="mt-0.5 text-[12px] text-ink tabular-nums">{home === null ? "Not yet" : `Year ${yearText(home)}`}</dd>
        </div>
      </dl>
    </section>
  );
}
