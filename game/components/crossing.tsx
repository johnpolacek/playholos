import { useGame } from "@/components/game-provider";
import { lyOf, span, tenths } from "@/lib/game/clock";

// The Will's crossing, lights out: once it leaves Earth by the Mind Link, until all of it has reached our Mind far
// away, the Will is dark. It orders nothing and hears nothing, a Year for each light-year, and Earth goes on by our
// orders and charter. The screen shows only the transfer: the beam from Sol to our Mind there, its front where the
// light has got to, and how long is left. The clock runs on with the app closed. HOLOS_GAME_CONCEPT.md, settled
// 2026-10-16, built 2026-10-27.

const W = 360;
const [X0, X1, Y] = [24, 336, 70];

/** A few faint stars behind the beam, the same each time. */
const FIELD = Array.from({ length: 40 }, (_, i) => {
  const r = (k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * W, y: r(2) * 140, o: 0.15 + 0.35 * r(3) };
});

export function Crossing() {
  const { save, year } = useGame();
  const will = save?.will;
  if (!will || year === null || year < will.y || year >= will.at) return null;
  const u = Math.min(1, (year - will.y) / (will.at - will.y));
  const front = X0 + u * (X1 - X0);
  return (
    <div role="dialog" aria-modal aria-label="The Will is crossing" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper px-4">
      <p className="font-mono text-[11px] tracking-[.14em] text-muted">THE WILL IS CROSSING</p>
      <h1 className="mt-2 text-center text-[22px] leading-snug font-medium">To our Mind at {will.hole}</h1>
      <p className="mt-1 text-[13.5px] text-page-ink2">
        {lyOf(will.d)} ly · Year {tenths(year)} · we wake in <span className="font-mono tabular-nums">{span(will.at - year)}</span>
      </p>
      <svg viewBox={`0 0 ${W} 140`} className="mt-6 w-full max-w-[520px]" role="img" aria-label={`The beam is ${Math.round(u * 100)}% of the way`}>
        {FIELD.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={0.6} fill="var(--ink)" opacity={s.o} />
        ))}
        <line x1={X0} x2={X1} y1={Y} y2={Y} stroke="var(--muted)" strokeWidth={0.7} strokeDasharray="2 4" opacity={0.6} />
        <line x1={X0} x2={front} y1={Y} y2={Y} stroke="var(--you)" strokeWidth={1.4} />
        <circle cx={front} cy={Y} r={9} fill="var(--you)" opacity={0.18} className="motion-safe:animate-pulse" />
        <circle cx={front} cy={Y} r={2.6} fill="var(--you)" />
        <circle cx={X0} cy={Y} r={4} fill="#f4e7c5" />
        <circle cx={X1} cy={Y} r={4.5} fill="var(--paper)" stroke="var(--you)" strokeWidth={1} />
        <text x={X0} y={Y + 22} textAnchor="middle" className="fill-muted font-mono text-[8px]">
          SOL
        </text>
        <text x={X1} y={Y + 22} textAnchor="middle" className="fill-muted font-mono text-[8px]">
          OUR MIND
        </text>
      </svg>
      <p className="mt-6 max-w-[34ch] text-center text-[14px] leading-snug text-page-ink2">
        We are light now, between the stars. Earth goes on by our orders and our charter. We wake knowing only what we knew when we left.
      </p>
    </div>
  );
}
