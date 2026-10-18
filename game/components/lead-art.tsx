import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { YEAR_0, yearAt } from "@/lib/game/clock";
import type { Art } from "@/lib/game/leads";
import { prefersReducedMotion } from "@/lib/motion";

// A lead's page, drawn: a world's orbit against its star's warm zone, Fomalhaut's belt and its two clouds, or our
// message's trip to Luyten's Star and the earliest a reply could come back. Each moves, unless motion is reduced.

const W = 320;
const H = 220;

/** Runs a frame each tick with the seconds since it began, or one still frame. */
function useTicks(draw: (t: number) => void, still: number) {
  const tick = useRef(draw);
  useEffect(() => {
    tick.current = draw;
  });
  useEffect(() => {
    if (prefersReducedMotion()) return tick.current(still);
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      tick.current((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [still]);
}

/** A ring between two radii, for the warm zone. */
const ring = (cx: number, cy: number, r0: number, r1: number) =>
  `M${cx - r1},${cy}a${r1},${r1} 0 1,0 ${2 * r1},0a${r1},${r1} 0 1,0 ${-2 * r1},0Z` +
  `M${cx - r0},${cy}a${r0},${r0} 0 1,0 ${2 * r0},0a${r0},${r0} 0 1,0 ${-2 * r0},0Z`;

// From above: the star, its warm zone, Earth's orbit for scale when it fits, and the world going round as Kepler has
// it, quick near the star and slow far out. It lights when it is in the warm zone.
function Orbit({ a, e, hz }: { a: number; e: number; hz?: [number, number] }) {
  const far = Math.max(a * (1 + e), hz?.[1] ?? 0);
  const s = (H / 2 - 18) / far;
  const [cx, cy] = [W / 2 + a * e * s * 0.5, H / 2];
  const b = a * Math.sqrt(1 - e * e);
  const dot = useRef<SVGCircleElement>(null);
  const earth = s > 4 && s < (W / 2 - 8) ? s : null;
  useTicks((t) => {
    // Ten seconds a turn, whatever its year: the shape and the speeding up are what show.
    const M = ((2 * Math.PI * t) / 10) % (2 * Math.PI);
    let E = M;
    for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const x = a * (Math.cos(E) - e);
    const y = b * Math.sin(E);
    const r = Math.hypot(x, y);
    const warm = !!hz && r >= hz[0] && r <= hz[1];
    const n = dot.current;
    if (!n) return;
    n.setAttribute("cx", String(cx + x * s));
    n.setAttribute("cy", String(cy - y * s));
    n.style.fill = warm ? "var(--you)" : "var(--ink)";
    n.setAttribute("r", warm ? "4.5" : "3.5");
  }, 2.5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Its orbit, from above">
      {hz && <path d={ring(cx, cy, hz[0] * s, hz[1] * s)} fillRule="evenodd" fill="var(--you)" opacity={0.13} />}
      {hz && (
        <text x={cx} y={cy - hz[1] * s + 11} textAnchor="middle" className="fill-you font-mono text-[8px] tracking-[.08em]">
          WARM ZONE
        </text>
      )}
      {earth && (
        <>
          <circle cx={cx} cy={cy} r={earth} fill="none" stroke="var(--muted)" strokeWidth={0.7} strokeDasharray="2 3" opacity={0.6} />
          <text x={cx + earth * 0.72 + 3} y={cy + earth * 0.72 + 9} className="fill-muted font-mono text-[7.5px]">
            Earth’s orbit
          </text>
        </>
      )}
      <ellipse cx={cx - a * e * s} cy={cy} rx={a * s} ry={b * s} fill="none" stroke="var(--ink)" strokeWidth={1} opacity={0.75} />
      <circle cx={cx} cy={cy} r={5} fill="#f4e7c5" />
      <circle cx={cx} cy={cy} r={11} fill="#f4e7c5" opacity={0.12} />
      <circle ref={dot} cx={cx + a * (1 - e) * s} cy={cy} r={3.5} fill="var(--ink)" />
    </svg>
  );
}

// Fomalhaut's belt, tilted as we see it, and its clouds on the inner side: the first, from 2004, drifting outward and
// fading as it did, and the second, from 2023, still bright. Once our first image lands, the second has faded and a
// third, new, sits beside it.
function Clouds({ third }: { third: boolean }) {
  const [cx, cy] = [W / 2, H / 2];
  const first = useRef<SVGGElement>(null);
  const second = useRef<SVGCircleElement>(null);
  const fresh = useRef<SVGCircleElement>(null);
  useTicks((t) => {
    const k = (t % 8) / 8;
    first.current?.setAttribute("transform", `translate(${-14 * k} ${4 * k})`);
    first.current?.setAttribute("opacity", String(1 - 0.8 * k));
    (third ? fresh : second).current?.setAttribute("r", String(9 + 3 * Math.sin(t * 1.6)));
  }, 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Fomalhaut's belt and its two clouds">
      <g transform={`rotate(-22 ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={138} ry={56} fill="none" stroke="var(--fill2)" strokeWidth={12} opacity={0.1} />
        <ellipse cx={cx} cy={cy} rx={138} ry={56} fill="none" stroke="var(--fill2)" strokeWidth={0.8} opacity={0.45} />
      </g>
      <circle cx={cx} cy={cy} r={6} fill="#f4f6ff" />
      <circle cx={cx} cy={cy} r={14} fill="#f4f6ff" opacity={0.12} />
      <g ref={first}>
        <circle cx={cx - 72} cy={cy + 6} r={7} fill="var(--you)" opacity={0.35} />
        <circle cx={cx - 72} cy={cy + 6} r={2.5} fill="var(--you)" />
      </g>
      <text x={cx - 58} y={cy + 9} className="fill-muted font-mono text-[8px]">
        2004
      </text>
      <g opacity={third ? 0.45 : 1}>
        <circle ref={second} cx={cx - 62} cy={cy + 26} r={third ? 12 : 9} fill="var(--you)" opacity={third ? 0.2 : 0.3} />
        <circle cx={cx - 62} cy={cy + 26} r={third ? 2 : 3} fill="var(--you)" />
        <text x={cx - 46} y={cy + 29} className="fill-ink font-mono text-[8px]">
          {third ? "2023 · FADING" : "2023"}
        </text>
      </g>
      {third && (
        <>
          <circle ref={fresh} cx={cx - 40} cy={cy + 40} r={9} fill="var(--you)" opacity={0.35} />
          <circle cx={cx - 40} cy={cy + 40} r={3} fill="var(--you)" />
          <text x={cx - 24} y={cy + 43} className="fill-you font-mono text-[8px]">
            NEW · YEAR 0.1
          </text>
        </>
      )}
    </svg>
  );
}

// Time runs left to right, from 2015 to past the last reply, and distance bottom to top, from Sol to Luyten's Star.
// Our messages climb out at the speed of light. A reply sent the moment one arrived would come back down. Now is
// marked where the game's clock is.
function Reply({ sent, ly }: { sent: number[]; ly: number }) {
  const { save } = useGame();
  const [y0, y1] = [2015, Math.ceil(Math.max(...sent) + 2 * ly) + 3];
  const year = Math.min(y1, YEAR_0 + Math.max(0, yearAt(save?.beganAt ?? null) ?? 0));
  const X = (y: number) => 18 + ((y - y0) / (y1 - y0)) * (W - 36);
  const [sol, star] = [H - 34, 34];
  const pulse = useRef<SVGCircleElement>(null);
  const first = sent[0];
  useTicks((t) => {
    // One trip out and back in six seconds.
    const k = (t % 6) / 6;
    const y = first + 2 * ly * k;
    const up = k < 0.5 ? k * 2 : 2 - k * 2;
    pulse.current?.setAttribute("cx", String(X(y)));
    pulse.current?.setAttribute("cy", String(sol + (star - sol) * up));
  }, 1.5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Our messages to Luyten's Star and the earliest replies">
      <line x1={X(y0)} x2={X(y1)} y1={sol} y2={sol} stroke="var(--muted)" strokeWidth={0.7} />
      <line x1={X(y0)} x2={X(y1)} y1={star} y2={star} stroke="var(--muted)" strokeWidth={0.7} />
      <text x={X(y0)} y={sol - 6} className="fill-muted font-mono text-[8px]">
        SOL
      </text>
      <text x={X(y0)} y={star - 6} className="fill-other font-mono text-[8px]">
        LUYTEN’S STAR · {ly.toFixed(1)} LY
      </text>
      {sent.map((s) => (
        <g key={s}>
          <line x1={X(s)} y1={sol} x2={X(s + ly)} y2={star} stroke="var(--you)" strokeWidth={1} />
          <line x1={X(s + ly)} y1={star} x2={X(s + 2 * ly)} y2={sol} stroke="var(--other)" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={X(s + 2 * ly)} cy={sol} r={3} fill="var(--other)" />
        </g>
      ))}
      {[first, first + ly].map((y) => (
        <text key={y} x={X(y)} y={sol + 13} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
          {Math.floor(y)}
        </text>
      ))}
      <text x={X(first + 2 * ly)} y={sol + 13} textAnchor="middle" className="fill-other font-mono text-[7.5px]">
        YEAR {(Math.floor((first + 2 * ly - YEAR_0) * 10) / 10).toFixed(1)}
      </text>
      <line x1={X(year)} x2={X(year)} y1={star - 2} y2={sol + 2} stroke="var(--ink)" strokeWidth={0.8} strokeDasharray="1 2" />
      <text x={X(year)} y={star + 12} textAnchor="middle" className="fill-ink font-mono text-[7.5px]">
        NOW
      </text>
      <circle ref={pulse} cx={X(first)} cy={sol} r={2.5} fill="var(--ink)" />
    </svg>
  );
}

/** `read` is the latest reading's id, for art that changes once one lands. */
export function LeadArt({ art, read }: { art: Art; read?: string }) {
  if (art.kind === "orbit") return <Orbit a={art.a} e={art.e} hz={art.hz} />;
  if (art.kind === "clouds") return <Clouds third={read === "fomalhaut-third-cloud"} />;
  return <Reply sent={art.sent} ly={art.ly} />;
}
