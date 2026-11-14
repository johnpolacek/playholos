import { useEffect, useRef } from "react";
import { useGame } from "@/components/game-provider";
import { lyOf, yearText } from "@/lib/game/clock";
import type { Art, Window } from "@/lib/game/leads";
import { VisitArt } from "@/components/visit-art";
import { CoOrbitArt, MoonStack, TourMap } from "@/components/watcher-art";
import { prefersReducedMotion } from "@/lib/motion";

// A lead's page, drawn: a world's orbit against its star's warm zone, or every star we messaged at the Year a reply
// could first come back, or a black hole shifting the stars behind
// it. Each moves, unless motion is reduced.

const W = 320;
const H = 220;

/** Runs a frame each tick with the seconds since it began, or one still frame. */
export function useTicks(draw: (t: number) => void, still: number) {
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

// Every star we messaged, at the Year a reply could first reach us, left to right, and its distance, bottom to top.
// Windows passed are faint, with none come. The next to open breathes in their color, and now is marked where the
// game's clock is. Luyten's Star alone was drawn here until 2026-11-01.
function Reply({ windows }: { windows: Window[] }) {
  const { year: clock } = useGame();
  const now = Math.max(0, clock ?? 0);
  const [x0, x1] = [Math.floor(Math.min(...windows.map((w) => w.at)) / 10) * 10 - 2, Math.ceil(Math.max(...windows.map((w) => w.at)) / 10) * 10 + 2];
  const [d0, d1] = [0, Math.ceil(Math.max(...windows.map((w) => w.ly)) / 10) * 10];
  const X = (y: number) => 22 + ((y - x0) / (x1 - x0)) * (W - 44);
  const Y = (d: number) => H - 30 - ((d - d0) / (d1 - d0)) * (H - 62);
  const next = windows.find((w) => w.at > now);
  const glow = useRef<SVGCircleElement>(null);
  useTicks((t) => glow.current?.setAttribute("r", String(5 + 3 * Math.sin(t * 2.4) ** 2)), 0.3);
  // Names close together share one label, as 55 Cancri and HD 10307 do.
  const labels: { x: number; y: number; names: string[]; up: boolean }[] = [];
  for (const w of windows) {
    const near = labels.find((l) => Math.abs(l.x - X(w.at)) < 14 && Math.abs(l.y - Y(w.ly)) < 10);
    if (near) near.names.push(w.star);
    else labels.push({ x: X(w.at), y: Y(w.ly), names: [w.star], up: labels.length % 2 === 0 });
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Reply windows for the ${windows.length} stars we messaged`}>
      <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke="var(--muted)" strokeWidth={0.7} />
      {[0, 20, 40].filter((y) => y > x0 && y < x1).map((y) => (
        <text key={y} x={X(y)} y={Y(0) + 13} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
          YEAR {y}
        </text>
      ))}
      <text x={X(x0)} y={14} className="fill-muted font-mono text-[7.5px]">
        {d1} LY
      </text>
      {windows.map((w) => {
        const passed = w.at <= now;
        return (
          <g key={w.star}>
            <line x1={X(w.at)} x2={X(w.at)} y1={Y(0)} y2={Y(w.ly)} stroke={passed ? "var(--faint)" : "var(--other)"} strokeOpacity={passed ? 1 : 0.35} strokeWidth={0.7} />
            <circle cx={X(w.at)} cy={Y(w.ly)} r={2.6} fill={passed ? "var(--paper)" : "var(--other)"} stroke={passed ? "var(--muted)" : "none"} strokeWidth={0.8} />
          </g>
        );
      })}
      {next && <circle ref={glow} cx={X(next.at)} cy={Y(next.ly)} r={6} fill="none" stroke="var(--other)" strokeOpacity={0.7} />}
      {labels.map((l) => (
        <text key={l.names.join()} x={l.x} y={l.up ? l.y - 7 : l.y + 12} textAnchor="middle" className="fill-page-ink2 font-mono text-[7px]">
          {l.names.join(" · ")}
        </text>
      ))}
      <line x1={X(now)} x2={X(now)} y1={22} y2={Y(0) + 2} stroke="var(--ink)" strokeWidth={0.8} strokeDasharray="1 2" />
      <text x={X(now)} y={18} textAnchor="middle" className="fill-ink font-mono text-[7.5px]">
        NOW
      </text>
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
  // As the lead's text says it: 7,400, not 7,000. Playtest 2026-11-01.
  const k = (ly: number) => ly.toLocaleString("en-US");
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

/** A cold glow as our Glow Imager shows it from home: its star, and thin dark panels far out round it, each on its
 *  own orbit, the outer ones slower, as nothing but made things keep. 2026-11-11. */
function PanelsArt({ ly }: { ly: number }) {
  const [cx, cy] = [160, 104];
  const orbits = [{ rx: 58, n: 11, w: 0.2 }, { rx: 92, n: 15, w: 0.1 }, { rx: 128, n: 19, w: 0.055 }];
  const panels = orbits.flatMap((o, k) => Array.from({ length: o.n }, (_, i) => ({ ...o, k, a0: (i / o.n) * 2 * Math.PI + k * 0.7 })));
  const els = useRef<(SVGRectElement | null)[]>([]);
  useTicks((t) => {
    panels.forEach((p, i) => {
      const a = p.a0 + t * p.w;
      const front = Math.sin(a) > 0;
      const el = els.current[i];
      if (!el) return;
      el.setAttribute("x", String(cx + p.rx * Math.cos(a) - 2.2));
      el.setAttribute("y", String(cy + p.rx * 0.3 * Math.sin(a) - 0.8));
      el.setAttribute("opacity", String(front ? 0.95 : 0.4));
    });
  }, 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Thin dark panels on orderly orbits round a star ${lyOf(ly)} light years away, as our Glow Imager shows them`}>
      <text x={16} y={26} className="fill-muted font-mono text-[7.5px]">
        AS OUR GLOW IMAGER SHOWS IT, FROM HOME
      </text>
      {orbits.map((o) => (
        <ellipse key={o.rx} cx={cx} cy={cy} rx={o.rx} ry={o.rx * 0.3} fill="none" stroke="var(--faint)" strokeWidth={0.5} strokeDasharray="1 4" />
      ))}
      <circle cx={cx} cy={cy} r={3.5} fill="#f4f6ff" />
      {panels.map((p, i) => (
        <rect key={i} ref={(el) => void (els.current[i] = el)} width={4.4} height={1.6} rx={0.3} fill="var(--faint)" stroke="var(--muted)" strokeWidth={0.7} />
      ))}
      <text x={16} y={196} className="fill-muted font-mono text-[7.5px]">
        {lyOf(ly)} LY · PANELS NEAR 12 K, EACH ON ITS OWN ORBIT
      </text>
      <text x={16} y={208} className="fill-other font-mono text-[7.5px]">
        TOO ORDERLY FOR RUBBLE. SOMETHING MADE THEM
      </text>
    </svg>
  );
}

/** A warm glow as our Glow Imager shows it from home. A made ring: collectors in one thin band round a star, even all
 *  the way round, turning. Or nature's: a ragged cloud of dust that hides its star. 2026-11-11. */
function ShapeArt({ shape, near, far }: { shape: "ring" | "cloud"; near: number; far: number }) {
  const [cx, cy] = [160, 104];
  const ring = shape === "ring";
  const n = ring ? 96 : 14;
  const els = useRef<(SVGCircleElement | null)[]>([]);
  // The cloud's clumps, placed once: uneven in size and place, as dust is.
  const clumps = Array.from({ length: n }, (_, i) => {
    const h = Math.sin(i * 12.9898) * 43758.5453, u = h - Math.floor(h), g = Math.sin(i * 78.233) * 12543.123, v = g - Math.floor(g);
    return { x: cx + (u - 0.5) * 150, y: cy + (v - 0.5) * 70, r: 9 + 16 * ((u * 7) % 1) };
  });
  useTicks((t) => {
    els.current.forEach((el, i) => {
      if (!el) return;
      if (ring) {
        const a = (i / n) * 2 * Math.PI + t * 0.12;
        el.setAttribute("cx", String(cx + 96 * Math.cos(a)));
        el.setAttribute("cy", String(cy + 22 * Math.sin(a)));
        el.setAttribute("opacity", String(Math.sin(a) > 0 ? 0.95 : 0.35));
      } else {
        el.setAttribute("opacity", String(0.1 + 0.05 * Math.sin(t * 0.5 + i)));
      }
    });
  }, 6);
  const k = (ly: number) => ly.toLocaleString("en-US");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ring ? "A thin made ring round a star, as our Glow Imager shows it" : "A ragged cloud of dust, as our Glow Imager shows it"}>
      <text x={16} y={26} className="fill-muted font-mono text-[7.5px]">
        AS OUR GLOW IMAGER SHOWS IT, FROM HOME
      </text>
      {ring && <circle cx={cx} cy={cy} r={3.5} fill="#f4f6ff" />}
      {Array.from({ length: n }, (_, i) =>
        ring ? (
          <circle key={i} ref={(el) => void (els.current[i] = el)} r={1.1} fill="var(--other)" />
        ) : (
          <circle key={i} ref={(el) => void (els.current[i] = el)} cx={clumps[i].x} cy={clumps[i].y} r={clumps[i].r} fill="var(--other)" opacity={0.12} />
        ),
      )}
      <text x={16} y={196} className="fill-muted font-mono text-[7.5px]">
        {k(near)} TO {k(far)} LY
      </text>
      <text x={16} y={208} className="fill-other font-mono text-[7.5px]">
        {ring ? "A THIN RING IN ONE PLANE, EVEN ALL THE WAY ROUND. BUILT" : "A RAGGED CLOUD OF DUST. NO ONE BUILT IT"}
      </text>
    </svg>
  );
}

/** A warm glow not yet ranged: somewhere on a line out from the Sun, a soft band sweeping along it as our Infrared
 *  Telescope works, and below, the Years from first sight to its range, filled to now. One that faded first stays grey.
 *  Before this it had no page, and its row on the jump card led nowhere. Playtest 2026-11-07. */
export function RangingArt({ seen, at, now, faded }: { seen: number; at: number | null; now: number; faded?: number }) {
  const band = useRef<SVGRectElement>(null);
  const [x0, x1, y] = [24, 296, 92];
  const top = 80000;
  const X = (ly: number) => x0 + (ly / top) * (x1 - x0);
  const gone = faded !== undefined;
  const working = !gone && at !== null && at > now;
  useTicks((t) => {
    if (!band.current) return;
    // Back and forth along the line, as the telescope weighs its reddening against the dust maps.
    const k = 0.5 - 0.5 * Math.cos(t * 0.7);
    band.current.setAttribute("x", String(x0 + k * (x1 - x0 - 46)));
    band.current.setAttribute("opacity", working ? String(0.22 + 0.1 * Math.sin(t * 2.3)) : "0");
  }, 1.5);
  // The Years from first sight to the range, as a bar.
  const [t0, t1, ty] = [x0, x1, 168];
  const end = gone ? faded! : at ?? seen + 4;
  const T = (yr: number) => t0 + Math.max(0, Math.min(1, (yr - seen) / Math.max(0.1, end - seen))) * (t1 - t0);
  const tone = gone ? "var(--muted)" : "var(--other)";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={gone ? "A warm glow that faded before we could range it" : "A warm glow somewhere on a line out from the Sun, its distance not yet found"}>
      <text x={x0} y={34} className="fill-muted font-mono text-[7.5px]">
        {gone ? "IT LAY SOMEWHERE ON THIS LINE" : "SOMEWHERE ON THIS LINE, NOT YET RANGED"}
      </text>
      <defs>
        <linearGradient id="ranging-line" x1="0" x2="1">
          <stop offset="0" stopColor={tone} stopOpacity={0.05} />
          <stop offset="0.5" stopColor={tone} stopOpacity={0.35} />
          <stop offset="1" stopColor={tone} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect x={x0} y={y - 10} width={x1 - x0} height={20} rx={10} fill="url(#ranging-line)" />
      <rect ref={band} x={x0} y={y - 14} width={46} height={28} rx={14} fill="var(--other)" opacity={0} />
      <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--faint)" />
      <circle cx={x0} cy={y} r={3} fill="#f4f6ff" />
      <text x={x0} y={y + 24} className="fill-muted font-mono text-[7.5px]">
        SUN
      </text>
      <line x1={X(27000)} x2={X(27000)} y1={y - 8} y2={y + 8} stroke="var(--muted)" />
      <text x={X(27000)} y={y + 24} textAnchor="middle" className="fill-muted font-mono text-[7.5px]">
        GALAXY’S HEART
      </text>
      <text x={x1} y={y + 24} textAnchor="end" className="fill-muted font-mono text-[7.5px]">
        80,000 LY
      </text>
      <line x1={t0} x2={t1} y1={ty} y2={ty} stroke="var(--track)" strokeWidth={4} strokeLinecap="round" />
      <line x1={t0} x2={T(now)} y1={ty} y2={ty} stroke={tone} strokeWidth={4} strokeLinecap="round" />
      <circle cx={T(now)} cy={ty} r={4} fill={tone} />
      <text x={t0} y={ty - 10} className="fill-muted font-mono text-[7.5px]">
        SEEN, YEAR {yearText(seen)}
      </text>
      <text x={t1} y={ty - 10} textAnchor="end" className={`font-mono text-[7.5px] ${gone ? "fill-muted" : "fill-other"}`}>
        {gone ? `FADED, YEAR ${yearText(faded!)}` : at !== null ? `RANGED BY YEAR ${yearText(Math.ceil(at * 10) / 10)}` : "NEEDS OUR INFRARED TELESCOPE"}
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
function NearArt({ where, struck, L = "L5", rock: on, on: from }: { where: "moon" | "co-orbital" | "warning" | "rock"; struck?: boolean; L?: "L4" | "L5"; rock?: string; on?: "sun" | "moon" | "rock" }) {
  // Found by its warning, drawn where its laser came from. By the Sun–Earth L4 or L5: the Sun, Earth going round, the
  // point 60° ahead or behind, and the laser's line to Earth. 2026-11-14.
  const sun = where === "warning" && from === "sun";
  const moving = useRef<SVGCircleElement>(null);
  const laser = useRef<SVGLineElement>(null);
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
    // The point 60° ahead of the Moon, its L4, or 60° behind, its L5. The Moon goes round the way the angle falls.
    const [px, py] = where === "co-orbital" ? at(R, a + 0.35 + 0.25 * Math.sin(t * 0.3)) : at(R, a + (L === "L4" ? -1 : 1) * (Math.PI / 3));
    point.current?.setAttribute("cx", String(px));
    point.current?.setAttribute("cy", String(py));
    point.current?.setAttribute("opacity", String(0.55 + 0.45 * Math.sin(t * 2)));
    if (laser.current) for (const [k, v] of [["x1", px], ["y1", py], ["x2", mx], ["y2", my]] as const) laser.current.setAttribute(k, String(v));
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
  // A rock that shares our orbit is drawn as it moves seen from Earth, and the Moon Search's find as it was found.
  // 2026-11-07.
  if (where === "co-orbital" && on)
    return (
      <div className="flex flex-col gap-3 py-2">
        <TourMap rock={on} />
        <CoOrbitArt rock={on} />
      </div>
    );
  const co = where === "co-orbital" || (where === "warning" && from === "rock");
  // The Sun at the center, Earth going round it, as a rock beside us is drawn.
  const solar = co || sun;
  const diagram = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={sun ? `The Sun and Earth's orbit, with the watcher holding at the Sun–Earth ${L} point and its laser reaching Earth` : co ? "A rock sharing Earth's orbit, with something on it" : `Earth and the Moon, with a dark body holding at the Moon's ${L} point`}
    >
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--muted)" strokeWidth={0.6} strokeDasharray="1 3" />
      {sun && <line ref={laser} stroke="var(--other)" strokeWidth={0.8} strokeDasharray="3 2" opacity={0.6} />}
      <circle cx={cx} cy={cy} r={solar ? 7 : 6} fill={solar ? "#f4e9c8" : "var(--you)"} opacity={0.9} />
      <circle ref={moving} cx={cx + R} cy={cy} r={solar ? 4.5 : 3.5} fill={solar ? "var(--you)" : "#d8d8d8"} />
      <circle ref={point} cx={cx} cy={cy - R} r={2.4} fill="var(--other)" />
      <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted font-mono text-[7px]">{solar ? "SUN" : "EARTH"}</text>
      <text x={16} y={H - 12} className="fill-muted font-mono text-[7px]">
        {sun
          ? `SUN–EARTH ${L}: 60° ${L === "L4" ? "AHEAD OF" : "BEHIND"} EARTH, AND ITS LASER`
          : co
            ? where === "warning" ? "A ROCK SHARING OUR ORBIT, WHERE ITS LASER CAME FROM" : "A ROCK SHARING OUR ORBIT, AND WHAT RIDES IT"
            : L === "L4"
              ? "THE MOON’S L4: 60° AHEAD OF IT, HOLDING"
              : "THE MOON’S L5: 60° BEHIND IT, HOLDING"}
      </text>
    </svg>
  );
  if (where !== "moon") return diagram;
  return (
    <div className="flex flex-col gap-3 py-2">
      <MoonStack L={L} />
      {diagram}
    </div>
  );
}

export function LeadArt({ art }: { art: Art }) {
  if (art.kind === "near") return <NearArt where={art.where} struck={art.struck} L={art.L} rock={art.rock} on={art.on} />;
  if (art.kind === "warm" && art.shape) return <ShapeArt shape={art.shape} near={art.near} far={art.far} />;
  if (art.kind === "warm") return <WarmArt near={art.near} far={art.far} />;
  if (art.kind === "orbit") return <Orbit a={art.a} e={art.e} hz={art.hz} />;
  if (art.kind === "dark") return <Dark mass={art.mass} ly={art.ly} />;
  if (art.kind === "pair") return <Pair mass={art.mass} ly={art.ly} a={art.a} e={art.e} days={art.days} />;
  if (art.kind === "glow" && art.panels) return <PanelsArt ly={art.ly} />;
  if (art.kind === "glow") return <GlowArt ly={art.ly} steady={art.steady} />;
  if (art.kind === "nova") return <NovaArt ly={art.ly} />;
  if (art.kind === "seed") return <VisitArt sight={art.sight} size={220} />;
  return <Reply windows={art.windows} />;
}
