import { useEffect, useRef } from "react";
import type { System } from "@/lib/game/systems";
import { AU_LIGHT_S } from "@/lib/light";
import { prefersReducedMotion } from "@/lib/motion";

// A lead's system, drawn from above: its star, in its color, its warm zone, its belts of dust, and every world known to
// go round it, each on its orbit, going as Kepler has it. Distances run on rings at round light-times, with Earth's 8
// light-minutes among them, so a world close in and one far out both show: the angles are true, the distances squeezed. Claims not confirmed are dashed. The
// lead's own world is ringed, and lights in the warm zone. Years keep their true ratios: the innermost goes round in
// three seconds, and the rest as much slower as their years are longer. Settled 2026-10-19.

const W = 320;
const H = 230;
const [CX, CY] = [W / 2 - 10, H / 2 - 4];
const [R0, R1] = [10, H / 2 - 20];

/** The rings, by how long the star's light takes to reach them, each six to ten times the last. Earth's 8 light-minutes
 *  stands in for 10, so we can see where Earth would sit. 2026-10-24. */
const RINGS: [s: number, name: string][] = [
  [1, "1 second"],
  [10, "10 seconds"],
  [60, "1 minute"],
  [AU_LIGHT_S, "Earth, 8 minutes"],
  [3600, "1 hour"],
  [36000, "10 hours"],
];

/** A star's color, by how hot it is. */
const tint = (k: number) =>
  k < 3600 ? "#ffb98a" : k < 5000 ? "#ffd7a3" : k < 6200 ? "#fff0d2" : k < 7500 ? "#f8f7ff" : "#dfe8ff";

export function SystemArt({ system }: { system: System }) {
  const { worlds, hz, belts = [] } = system;
  // The span drawn: from a little inside the nearest thing to a little past the farthest.
  const near = Math.min(...worlds.map((w) => w.a * (1 - w.e)), hz?.[0] ?? Infinity, ...belts.map((b) => b.from));
  const far = Math.max(...worlds.map((w) => w.a * (1 + w.e)), hz?.[1] ?? 0, ...belts.map((b) => b.to));
  const [lo, hi] = [Math.log10(near / 1.8), Math.log10(far * 1.15)];
  const px = (au: number) => R0 + ((Math.log10(au) - lo) / (hi - lo)) * (R1 - R0);
  const ring = (r: number) => `M${CX - r},${CY}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;

  // Each orbit as points round its star at the focus, drawn on the squeezed rings.
  const orbit = (a: number, e: number) =>
    Array.from({ length: 121 }, (_, k) => {
      const v = (k / 120) * 2 * Math.PI;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(v));
      return `${k ? "L" : "M"}${(CX + px(r) * Math.cos(v)).toFixed(1)},${(CY - px(r) * Math.sin(v)).toFixed(1)}`;
    }).join("");
  const rings = RINGS.map(([s, name]) => ({ au: s / AU_LIGHT_S, name })).filter(
    ({ au }) => px(au) > R0 + 4 && px(au) < R1 + 2,
  );

  const dots = useRef<(SVGCircleElement | null)[]>([]);
  useEffect(() => {
    const fastest = Math.min(...worlds.map((w) => w.days));
    // Where each world sits on its orbit after `t` seconds, as Kepler has it.
    const place = (t: number) =>
      worlds.forEach((w, i) => {
        const M = ((2 * Math.PI * t) / (3 * (w.days / fastest)) + i * 2.1) % (2 * Math.PI);
        let E = M;
        for (let k = 0; k < 6; k++) E -= (E - w.e * Math.sin(E) - M) / (1 - w.e * Math.cos(E));
        const x = w.a * (Math.cos(E) - w.e);
        const y = w.a * Math.sqrt(1 - w.e * w.e) * Math.sin(E);
        const r = Math.hypot(x, y);
        const n = dots.current[i];
        if (!n) return;
        n.setAttribute("cx", String(CX + (px(r) * x) / r));
        n.setAttribute("cy", String(CY - (px(r) * y) / r));
        if (w.lead) n.style.fill = hz && r >= hz[0] && r <= hz[1] ? "var(--you)" : "var(--ink)";
      });
    if (prefersReducedMotion()) return place(0.8);
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      place((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // The drawing is fixed for a system, so its motion is too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system]);

  const glow = tint(system.temp);
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Its system, from above">
        {/* Labels on alternate rows, as the names are, so close rings don't crowd. */}
        {rings.map(({ au, name }, i) => (
          <g key={name}>
            <circle cx={CX} cy={CY} r={px(au)} fill="none" stroke="var(--faint)" strokeWidth={0.7} strokeDasharray="1.5 3" />
            <text x={CX + px(au) + 3} y={CY - 3 - (i % 2) * 8} className="fill-muted font-mono text-[7px]">
              {name}
            </text>
          </g>
        ))}
        {belts.map((b) => (
          <g key={b.name}>
            <path d={`${ring(px(b.to))}${ring(px(b.from))}`} fillRule="evenodd" fill="var(--fill2)" opacity={0.12} />
            <text x={CX} y={CY + (px(b.from) + px(b.to)) / 2 + 3} textAnchor="middle" className="fill-muted font-mono text-[7px]">
              {b.name}
            </text>
          </g>
        ))}
        {hz && (
          <>
            <path d={`${ring(px(hz[1]))}${ring(px(hz[0]))}`} fillRule="evenodd" fill="var(--you)" opacity={0.13} />
            <text
              x={CX}
              y={CY - px(hz[1]) + 9}
              textAnchor="middle"
              className="fill-you font-mono text-[7.5px] tracking-[.08em]"
            >
              WARM ZONE
            </text>
          </>
        )}
        {/* Names under the star's line, neighbors on alternate rows so close orbits don't crowd. */}
        {worlds.map((w, i) => (
          <g key={w.name}>
            <path
              d={orbit(w.a, w.e)}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={w.lead ? 1.1 : 0.8}
              strokeDasharray={w.status === "confirmed" ? undefined : "2 3"}
              opacity={w.lead ? 0.8 : 0.45}
            />
            <text
              x={CX + px(w.a * (1 - w.e)) + 2}
              y={CY + 10 + (i % 2) * 9}
              className={`font-mono text-[7.5px] ${w.lead ? "fill-ink" : "fill-muted"}`}
            >
              {w.name}
              {w.status === "confirmed" ? "" : "?"}
            </text>
          </g>
        ))}
        <circle cx={CX} cy={CY} r={13} fill={glow} opacity={0.12} />
        <circle cx={CX} cy={CY} r={5} fill={glow} />
        {worlds.map((w, i) => (
          <circle
            key={w.name}
            ref={(n) => {
              dots.current[i] = n;
            }}
            cx={CX + px(w.a)}
            cy={CY}
            r={Math.min(4.5, 1.8 + Math.log2(1 + (w.mass ?? 1)) * 0.8)}
            fill={w.status === "confirmed" ? "var(--ink)" : "none"}
            stroke={w.status === "confirmed" ? "none" : "var(--ink)"}
            strokeWidth={0.8}
            opacity={w.lead ? 1 : 0.75}
          />
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-between gap-x-3 font-mono text-[9.5px] text-muted">
        <span>rings: how long light takes from the star</span>
        {system.unknown ? (
          <span>only this world is known</span>
        ) : (
          system.beyond && <span>beyond: {system.beyond}</span>
        )}
      </figcaption>
    </figure>
  );
}
