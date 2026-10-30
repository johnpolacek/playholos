import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { YEAR_0, lyOf } from "@/lib/game/clock";
import type { Art } from "@/lib/game/leads";
import { VisitArt } from "@/components/visit-art";
import { prefersReducedMotion } from "@/lib/motion";

// A lead's page, drawn: a world's orbit against its star's warm zone, or our
// message's trip to Luyten's Star and the earliest a reply could come back, or a black hole shifting the stars behind
// it. Each moves, unless motion is reduced.

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

// Time runs left to right, from 2015 to past the last reply, and distance bottom to top, from Sol to Luyten's Star.
// Our messages climb out at the speed of light. A reply sent the moment one arrived would come back down. Now is
// marked where the game's clock is.
function Reply({ sent, ly }: { sent: number[]; ly: number }) {
  const { year: clock } = useGame();
  const [y0, y1] = [2015, Math.ceil(Math.max(...sent) + 2 * ly) + 3];
  const year = Math.min(y1, YEAR_0 + Math.max(0, clock ?? 0));
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
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Our messages to Luyten’s Star and the earliest replies">
      <line x1={X(y0)} x2={X(y1)} y1={sol} y2={sol} stroke="var(--muted)" strokeWidth={0.7} />
      <line x1={X(y0)} x2={X(y1)} y1={star} y2={star} stroke="var(--muted)" strokeWidth={0.7} />
      <text x={X(y0)} y={sol - 6} className="fill-muted font-mono text-[8px]">
        SOL
      </text>
      <text x={X(y0)} y={star - 6} className="fill-other font-mono text-[8px]">
        LUYTEN’S STAR · {lyOf(ly)} LY
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

// A black hole, dark, crossing a field of stars. Each star near it is pushed outward from it, by its ring's width
// squared over how far off it passes, as Einstein's lensing has it: the shift Gaia caught. Its ring is drawn faint,
// and the stars' true places as dots they are pushed from. Ours, 2026-10-26.
const FIELD = Array.from({ length: 70 }, (_, i) => {
  const r = (k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * W, y: r(2) * H, m: 0.5 + 1.4 * r(3) ** 3 };
});
function Dark({ mass, ly }: { mass: number; ly: number }) {
  const ring = 22 + 6 * Math.log10(mass / 5);
  const hole = useRef<SVGGElement>(null);
  const stars = useRef<(SVGCircleElement | null)[]>([]);
  useTicks((t) => {
    // It starts a third of the way across, so the page opens with it in view.
    const x = ((t * 9 + W / 3 + 60) % (W + 120)) - 60, y = H * 0.52 + 10 * Math.sin(t * 0.07);
    hole.current?.setAttribute("transform", `translate(${x} ${y})`);
    FIELD.forEach((s, i) => {
      const dx = s.x - x, dy = s.y - y, b = Math.max(Math.hypot(dx, dy), 2);
      const push = Math.min((ring * ring) / b, 60) / b;
      stars.current[i]?.setAttribute("cx", String(s.x + dx * push * 0.35));
      stars.current[i]?.setAttribute("cy", String(s.y + dy * push * 0.35));
    });
  }, 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`A black hole of ${mass} Suns, ${lyOf(ly)} light years away, shifting the stars behind it`}>
      {FIELD.map((s, i) => (
        <circle key={`t${i}`} cx={s.x} cy={s.y} r={0.5} fill="var(--muted)" opacity={0.35} />
      ))}
      {FIELD.map((s, i) => (
        <circle key={i} ref={(el) => void (stars.current[i] = el)} cx={s.x} cy={s.y} r={s.m} fill="#f4f6ff" opacity={0.85} />
      ))}
      <g ref={hole}>
        <circle r={ring} fill="none" stroke="var(--other)" strokeWidth={0.6} strokeDasharray="1 3" opacity={0.7} />
        <circle r={4.5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={0.8} />
      </g>
      <text x={10} y={H - 10} className="fill-muted font-mono text-[8px]">
        {mass} SUNS · {lyOf(ly)} LY · DOTS: WHERE STARS TRULY ARE
      </text>
    </svg>
  );
}

// A black hole with a star round it, from above, as Gaia BH1 is: the hole dark at one focus, its ring faint, and the
// star going round as Kepler has it, quick near the hole and slow far out. Earth's orbit for scale. Gaia found it by
// the star's swing on the sky. Ours, 2026-10-27.
function Pair({ mass, ly, a, e, days }: { mass: number; ly: number; a: number; e: number; days: number }) {
  const s = (H / 2 - 24) / (a * (1 + e));
  const [cx, cy] = [W / 2 + a * e * s * 0.5, H / 2 - 6];
  const b = a * Math.sqrt(1 - e * e);
  const dot = useRef<SVGCircleElement>(null);
  const halo = useRef<SVGCircleElement>(null);
  useTicks((t) => {
    // Eight seconds a turn: the shape and the speeding up are what show.
    const M = ((2 * Math.PI * t) / 8) % (2 * Math.PI);
    let E = M;
    for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const x = String(cx + a * (Math.cos(E) - e) * s), y = String(cy - b * Math.sin(E) * s);
    for (const n of [dot.current, halo.current]) {
      n?.setAttribute("cx", x);
      n?.setAttribute("cy", y);
    }
  }, 2.5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`A black hole of ${mass} Suns, ${lyOf(ly)} light years away, with a Sun-like star going round it every ${days} days`}>
      <circle cx={cx} cy={cy} r={s} fill="none" stroke="var(--muted)" strokeWidth={0.7} strokeDasharray="2 3" opacity={0.6} />
      <text x={cx + s * 0.72 + 3} y={cy + s * 0.72 + 9} className="fill-muted font-mono text-[7.5px]">
        Earth’s orbit
      </text>
      <ellipse cx={cx - a * e * s} cy={cy} rx={a * s} ry={b * s} fill="none" stroke="var(--ink)" strokeWidth={1} opacity={0.75} />
      <circle cx={cx} cy={cy} r={14} fill="none" stroke="var(--other)" strokeWidth={0.6} strokeDasharray="1 3" opacity={0.7} />
      <circle cx={cx} cy={cy} r={4.5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={0.8} />
      <circle ref={halo} cx={cx + a * (1 - e) * s} cy={cy} r={9} fill="#f4e7c5" opacity={0.15} />
      <circle ref={dot} cx={cx + a * (1 - e) * s} cy={cy} r={3.5} fill="#f4e7c5" />
      <text x={10} y={H - 10} className="fill-muted font-mono text-[8px]">
        {mass} SUNS · {lyOf(ly)} LY · ITS STAR ROUND IT EVERY {days} DAYS
      </text>
    </svg>
  );
}

// A grey glow, drawn as the case for it: the star with its faint halo breathing, and beside it the glow's color from
// 0.87 to 3 mm. Dust falls steeply with wavelength, a band from index 2.4 to 3.1 (MacGregor et al. 2016). This falls
// at about 1.6, as a body near 12 K does, its measures landing one by one. Ours, 2026-10-26. An elder's glow holds
// level: its halo stops breathing, and under it our yearly looks land on a flat line beside a young Mind's doubling,
// once a decade or so. 2026-10-28.
function GlowArt({ ly, steady }: { ly: number; steady?: boolean }) {
  const halo = useRef<SVGCircleElement>(null);
  const dots = useRef<(SVGGElement | null)[]>([]);
  const [x0, x1, y0, y1] = [150, 300, 40, 170];
  const lam = [0.87, 1.3, 2.0, 3.0];
  const X = (mm: number) => x0 + ((Math.log(mm) - Math.log(0.8)) / (Math.log(3.3) - Math.log(0.8))) * (x1 - x0);
  // Flux falls as wavelength to the minus index, pinned at 0.87 mm; drawn on a log scale, so each is a straight line.
  const Y = (mm: number, index: number) => y0 + 12 + index * 26 * Math.log(mm / 0.87);
  const looks = useRef<(SVGCircleElement | null)[]>([]);
  useTicks((t) => {
    const b = steady ? 0 : Math.sin(t * 0.9);
    halo.current?.setAttribute("r", String(30 + 4 * b));
    halo.current?.setAttribute("opacity", String(0.25 + 0.1 * b));
    dots.current.forEach((d, i) => d?.setAttribute("opacity", String(Math.min(1, Math.max(0, (t % 12) - 1 - i * 1.2)))));
    looks.current.forEach((d, i) => d?.setAttribute("opacity", String(Math.min(1, Math.max(0, (t % 12) - 2 - i * 1.4)))));
  }, 12);
  // Six Years of looks, from first seen. A young Mind doubling each decade would climb this much in that time.
  const [lx0, lx1, ly0] = [16, 122, 202];
  const LX = (yr: number) => lx0 + (yr / 6) * (lx1 - lx0);
  const young = Array.from({ length: 13 }, (_, k) => `${k ? "L" : "M"}${LX(k / 2)},${ly0 - 40 * (2 ** (k / 2 / 10) - 1)}`).join(" ");
  const band = `M${X(0.8)},${Y(0.8, 2.4)} L${X(3.3)},${Y(3.3, 2.4)} L${X(3.3)},${Y(3.3, 3.1)} L${X(0.8)},${Y(0.8, 3.1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`A grey glow round a star ${lyOf(ly)} light years away, its color unlike dust's`}>
      <circle ref={halo} cx={70} cy={105} r={30} fill="none" stroke="var(--muted)" strokeWidth={10} opacity={0.3} />
      <circle cx={70} cy={105} r={30} fill="none" stroke="var(--muted)" strokeWidth={0.6} strokeDasharray="1 3" />
      <circle cx={70} cy={105} r={4} fill="#f4f6ff" />
      <text x={70} y={160} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
        {lyOf(ly)} LY
      </text>
      {steady && (
        <g>
          <path d={young} fill="none" stroke="var(--muted)" strokeWidth={0.8} strokeDasharray="2 2" />
          <text x={lx1} y={ly0 - 26} textAnchor="end" className="fill-muted font-mono text-[7px]">
            YOUNG, DOUBLING
          </text>
          <line x1={lx0} x2={lx1} y1={ly0} y2={ly0} stroke="var(--other)" strokeWidth={1} />
          {[0, 1, 2, 3, 4, 5, 6].map((yr) => (
            <circle key={yr} ref={(el) => void (looks.current[yr] = el)} cx={LX(yr)} cy={ly0} r={2} fill="var(--other)" />
          ))}
          <text x={lx0} y={ly0 + 11} className="fill-other font-mono text-[7px]">
            THIS GLOW, YEAR BY YEAR: LEVEL
          </text>
        </g>
      )}
      <path d={band} fill="var(--fill2)" opacity={0.25} />
      <text x={x1} y={Y(3.3, 3.1) + 12} textAnchor="end" className="fill-muted font-mono text-[7.5px]">
        DUST 2.4 TO 3.1
      </text>
      <line x1={X(0.8)} y1={Y(0.8, 1.6)} x2={X(3.3)} y2={Y(3.3, 1.6)} stroke="var(--other)" strokeWidth={1} />
      <text x={X(1.5)} y={Y(1.5, 1.6) - 8} className="fill-other font-mono text-[7.5px]">
        THIS GLOW 1.6
      </text>
      {lam.map((mm, i) => (
        <g key={mm} ref={(el) => void (dots.current[i] = el)}>
          <line x1={X(mm)} x2={X(mm)} y1={Y(mm, 1.6) - 5} y2={Y(mm, 1.6) + 5} stroke="var(--other)" strokeWidth={0.8} />
          <circle cx={X(mm)} cy={Y(mm, 1.6)} r={2.4} fill="var(--other)" />
        </g>
      ))}
      <line x1={x0} x2={x1} y1={y1 + 10} y2={y1 + 10} stroke="var(--faint)" />
      {[0.87, 3].map((mm) => (
        <text key={mm} x={X(mm)} y={y1 + 22} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
          {mm} MM
        </text>
      ))}
      <text x={x0} y={y0 - 14} className="fill-muted font-mono text-[7.5px]">
        BRIGHTNESS, FALLING WITH WAVELENGTH
      </text>
    </svg>
  );
}

/** A warm glow, ranged: where it could lie on a line out from the Sun past the Galaxy's heart, by its reddening and the
 *  star behind it. A band, not a point, since no measure says more. Its middle pulses warm. 2026-10-29. */
function WarmArt({ near, far }: { near: number; far: number }) {
  const dot = useRef<SVGCircleElement>(null);
  const [x0, x1, y] = [24, 296, 112];
  const top = Math.max(80000, far * 1.15);
  const X = (ly: number) => x0 + (ly / top) * (x1 - x0);
  const mid = Math.sqrt(near * far);
  useTicks((t) => {
    const b = Math.sin(t * 1.4);
    dot.current?.setAttribute("r", String(5 + 1.5 * b));
    dot.current?.setAttribute("opacity", String(0.75 + 0.2 * b));
  }, 12);
  const k = (ly: number) => `${Math.round(ly / 1000)},000`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`A warm glow between ${k(near)} and ${k(far)} light years away`}>
      <text x={x0} y={40} className="fill-muted font-mono text-[7.5px]">
        WHERE IT LIES, BY ITS REDDENING AND THE STAR BEHIND IT
      </text>
      <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--faint)" />
      <rect x={X(near)} y={y - 14} width={X(far) - X(near)} height={28} rx={14} fill="var(--other)" opacity={0.18} />
      <circle ref={dot} cx={X(mid)} cy={y} r={5} fill="var(--other)" />
      <circle cx={x0} cy={y} r={3} fill="#f4f6ff" />
      <text x={x0} y={y + 26} className="fill-muted font-mono text-[7.5px]">
        SUN
      </text>
      <line x1={X(27000)} x2={X(27000)} y1={y - 8} y2={y + 8} stroke="var(--muted)" />
      <text x={X(27000)} y={y + 26} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
        GALAXY’S HEART
      </text>
      <text x={X(near)} y={y - 22} className="fill-other font-mono text-[7.5px]">
        {k(near)} TO {k(far)} LY
      </text>
      <text x={x0} y={y + 62} className="fill-muted font-mono text-[7.5px]">
        TOO FAR FOR PARALLAX. A RANGE, NOT A DISTANCE
      </text>
    </svg>
  );
}

/** A supernova as we saw it: its brightness day by day, a type II's curve at its distance, against the half Moon, Venus
 *  and what eyes can see. Bright for a season, seen by day while above Venus, and gone from our eyes in a few Years. A
 *  dot runs along it. Betelgeuse's, 2026-10-30. Its peak is a type II's, absolute magnitude -17, a sample. */
function NovaArt({ ly }: { ly: number }) {
  const dot = useRef<SVGCircleElement>(null);
  const [x0, x1, y0, y1] = [36, 300, 40, 150];
  const DAYS = 1800;
  const peak = -17 + 5 * Math.log10(ly / 3.2616 / 10);
  // A plateau of about 100 days, a drop of 2 magnitudes, then the tail fading a hundredth of a magnitude a day.
  const mag = (d: number) => (d < 110 ? peak + 0.004 * d : d < 140 ? peak + 0.44 + ((d - 110) / 30) * 2 : peak + 2.44 + 0.0098 * (d - 140));
  const X = (d: number) => x0 + (d / DAYS) * (x1 - x0);
  const Y = (m: number) => y0 + ((m + 12) / 19) * (y1 - y0);
  const path = Array.from({ length: 121 }, (_, i) => (i / 120) * DAYS).map((d, i) => `${i ? "L" : "M"}${X(d).toFixed(1)},${Y(Math.min(7, mag(d))).toFixed(1)}`).join(" ");
  useTicks((t) => {
    const d = ((t * 140) % DAYS);
    dot.current?.setAttribute("cx", String(X(d)));
    dot.current?.setAttribute("cy", String(Y(Math.min(7, mag(d)))));
  }, 24);
  const ref = (m: number, label: string) => (
    <g key={label}>
      <line x1={x0} x2={x1} y1={Y(m)} y2={Y(m)} stroke="var(--faint)" strokeDasharray="2 3" />
      <text x={x1} y={Y(m) - 3} textAnchor="end" className="fill-muted font-mono text-[7px]">
        {label}
      </text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Its brightness over five Years: as bright as a half Moon for a season, then fading from sight">
      <text x={x0} y={28} className="fill-muted font-mono text-[7.5px]">
        HOW BRIGHT IT SHONE, DAY BY DAY
      </text>
      {ref(-10, "HALF MOON")}
      {ref(-4.4, "VENUS, SEEN BY DAY ABOVE THIS")}
      {ref(6, "WHAT EYES CAN SEE")}
      <path d={path} fill="none" stroke="var(--other)" strokeWidth="1.6" />
      <circle ref={dot} cx={X(0)} cy={Y(peak)} r={3.5} fill="var(--other)" />
      {[0, 1, 2, 3, 4].map((yr) => (
        <text key={yr} x={X(yr * 365.25)} y={y1 + 16} textAnchor="middle" className="fill-muted font-mono text-[7px]">
          {yr ? `${yr} YR` : "SEEN"}
        </text>
      ))}
    </svg>
  );
}

// Here at home, from above. The Moon's L5: Earth, the Moon going round, and the point 60° behind it, where a dark body
// holds as the Sun's pull would clear rock away. A rock beside us: the Sun, Earth's orbit, and a rock sharing it on its
// horseshoe. A rock coming: Earth, and the rock's path in, ending in a flash if it struck. 2026-10-30.
function NearArt({ where, struck }: { where: "moon" | "co-orbital" | "warning" | "rock"; struck?: boolean }) {
  const moving = useRef<SVGCircleElement>(null);
  const point = useRef<SVGCircleElement>(null);
  const rock = useRef<SVGCircleElement>(null);
  const [cx, cy] = [W / 2, H / 2 - 6];
  const R = 74;
  useTicks((t) => {
    const a = -t * 0.35;
    const at = (r: number, ang: number) => [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
    if (where === "rock") {
      // In from the dark along a gentle curve, again each 8 seconds.
      const k = Math.min(1, (t % 8) / 6);
      const [x, y] = [W - 20 - k * (W - 20 - cx - 8), 26 + k * k * (cy - 26)];
      rock.current?.setAttribute("cx", String(x));
      rock.current?.setAttribute("cy", String(y));
      return;
    }
    const [mx, my] = at(R, a);
    moving.current?.setAttribute("cx", String(mx));
    moving.current?.setAttribute("cy", String(my));
    // The point 60° behind, the Moon's L5, or the rock's slow horseshoe beside Earth.
    const [px, py] = where === "co-orbital" ? at(R, a + 0.35 + 0.25 * Math.sin(t * 0.3)) : at(R, a + Math.PI / 3);
    point.current?.setAttribute("cx", String(px));
    point.current?.setAttribute("cy", String(py));
    point.current?.setAttribute("opacity", String(0.55 + 0.45 * Math.sin(t * 2)));
  }, 3);
  if (where === "rock")
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={struck ? "A rock's path in to Earth, ending in a strike" : "A rock's path in toward Earth"}>
        <path d={`M${W - 20},26 Q${cx + 60},${cy - 70} ${cx + 8},${cy}`} fill="none" stroke="var(--muted)" strokeWidth={0.8} strokeDasharray="2 3" />
        <circle cx={cx} cy={cy} r={9} fill="var(--you)" opacity={0.85} />
        {struck && <circle cx={cx + 7} cy={cy - 3} r={16} fill="none" stroke="var(--other)" strokeWidth={2} opacity={0.7} />}
        <circle ref={rock} cx={W - 20} cy={26} r={2.5} fill="#c9b8a0" />
        <text x={cx} y={cy + 28} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">EARTH</text>
        <text x={W - 20} y={18} textAnchor="end" className="fill-muted font-mono text-[7px]">{struck ? "ITS PATH IN" : "ITS PATH, AS WE MEASURE IT"}</text>
      </svg>
    );
  const co = where === "co-orbital";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={co ? "A rock sharing Earth's orbit, with something on it" : "Earth and the Moon, with a dark body holding at the Moon's L5 point"}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--muted)" strokeWidth={0.6} strokeDasharray="1 3" />
      <circle cx={cx} cy={cy} r={co ? 7 : 6} fill={co ? "#f4e9c8" : "var(--you)"} opacity={0.9} />
      <circle ref={moving} cx={cx + R} cy={cy} r={co ? 4.5 : 3.5} fill={co ? "var(--you)" : "#d8d8d8"} />
      <circle ref={point} cx={cx} cy={cy - R} r={2.4} fill="var(--other)" />
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted font-mono text-[7px]">{co ? "SUN" : "EARTH"}</text>
      <text x={16} y={H - 12} className="fill-muted font-mono text-[7px]">
        {co ? "A ROCK SHARING OUR ORBIT, AND WHAT RIDES IT" : where === "warning" ? "SOMEWHERE NEAR US, UNSEEN" : "THE MOON’S L5: 60° BEHIND IT, HOLDING"}
      </text>
    </svg>
  );
}

export function LeadArt({ art }: { art: Art }) {
  if (art.kind === "near") return <NearArt where={art.where} struck={art.struck} />;
  if (art.kind === "warm") return <WarmArt near={art.near} far={art.far} />;
  if (art.kind === "orbit") return <Orbit a={art.a} e={art.e} hz={art.hz} />;
  if (art.kind === "dark") return <Dark mass={art.mass} ly={art.ly} />;
  if (art.kind === "pair") return <Pair mass={art.mass} ly={art.ly} a={art.a} e={art.e} days={art.days} />;
  if (art.kind === "glow") return <GlowArt ly={art.ly} steady={art.steady} />;
  if (art.kind === "nova") return <NovaArt ly={art.ly} />;
  if (art.kind === "seed") return <VisitArt sight={art.sight} elder={art.elder} size={220} />;
  return <Reply sent={art.sent} ly={art.ly} />;
}
