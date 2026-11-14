import { useNavigate } from "react-router";
import { useState } from "react";
import { VisitArt } from "@/components/visit-art";
import { chancesOf } from "@/lib/game/chance";
import { type Lead, type Reading, starName } from "@/lib/game/leads";
import { target } from "@/lib/game/sends";
import { lyOf } from "@/lib/game/clock";

// Homes: every world we know, drawn where it lies round the Sun, each as we last pictured it. A list of nine new worlds
// read the same as each other and said nothing of where they were or which held life. Playtest 2026-11-13. Round the
// chart by where each lies in our sky, out from the Sun by its distance, so the near and the far read at a glance. A
// world that may hold life glows green, brighter as its chance rises. One we have never pictured is a plain dot.

const SIZE = 320;
const MID = SIZE / 2;
/** Room at the edge for a globe and its name. */
const EDGE = 26;

/** Worlds that could be a home: a world we know, going round its star. */
export const isHome = (l: Lead) => l.art.kind === "orbit";

/** The latest picture of a world's face, if we have one. */
const faceOf = (rs: readonly Reading[]) => [...rs].reverse().find((r) => r.sight)?.sight;

export function HomesChart({ leads, readings }: { leads: Lead[]; readings: Record<string, Reading[]> }) {
  const navigate = useNavigate();
  const [over, setOver] = useState<string | null>(null);
  const placed = leads.flatMap((l) => {
    const t = target(l.star);
    if (!t) return [];
    const life = chancesOf(l, readings[l.slug] ?? [])?.life;
    return [{ l, ra: t.ra, d: l.ly, life: life ? (life.lo + life.hi) / 2 : 0, face: faceOf(readings[l.slug] ?? []) }];
  });
  if (!placed.length) return null;
  // Rings every 10 light-years, out past the farthest world.
  const far = Math.max(10, Math.ceil(Math.max(...placed.map((p) => p.d)) / 10) * 10);
  const rings = Array.from({ length: far / 10 }, (_, k) => (k + 1) * 10);
  const scale = (MID - EDGE) / far;
  const at = (ra: number, d: number) => {
    // Right ascension runs round the chart, 0 h at the top, east to the left as on a sky chart.
    const a = (ra / 24) * 2 * Math.PI;
    return { x: MID - Math.sin(a) * d * scale, y: MID - Math.cos(a) * d * scale };
  };
  // Nearest last, so it draws on top.
  const drawn = [...placed].sort((p, q) => q.d - p.d);
  return (
    <figure className="mt-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto block w-full max-w-[340px]" role="img" aria-label="Worlds we know, round the Sun by where they lie">
        <defs>
          <radialGradient id="homes-life">
            <stop offset="0" stopColor="var(--see)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--see)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="homes-sun">
            <stop offset="0" stopColor="#fff6d8" />
            <stop offset=".35" stopColor="#ffd98a" stopOpacity=".7" />
            <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
          </radialGradient>
        </defs>
        {rings.map((r) => (
          <g key={r}>
            <circle cx={MID} cy={MID} r={r * scale} fill="none" stroke="var(--faint)" strokeWidth=".6" />
            {/* Below the Sun, where few names fall. */}
            <text x={MID} y={MID + r * scale + 8} textAnchor="middle" className="fill-muted font-mono" fontSize="6.5" opacity=".7">
              {r} ly
            </text>
          </g>
        ))}
        <circle cx={MID} cy={MID} r="9" fill="url(#homes-sun)" />
        <circle cx={MID} cy={MID} r="1.8" fill="#fff6d8" />
        {drawn.map(({ l, ra, d, life, face }) => {
          const { x, y } = at(ra, d);
          const hot = over === l.slug;
          const g = face ? 18 : 3;
          return (
            <g
              key={l.slug}
              role="link"
              tabIndex={0}
              aria-label={`${starName(l.star)}, ${lyOf(d)} light-years`}
              onClick={() => navigate(`/play/lead/${l.slug}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/play/lead/${l.slug}`)}
              onPointerEnter={() => setOver(l.slug)}
              onPointerLeave={() => setOver(null)}
              className="cursor-pointer outline-none"
            >
              <line x1={MID} y1={MID} x2={x} y2={y} stroke="var(--you)" strokeOpacity={hot ? 0.6 : 0.12} strokeWidth=".6" />
              {life > 0.1 && <circle cx={x} cy={y} r={g * (1.1 + life)} fill="url(#homes-life)" opacity={0.3 + 0.7 * life} />}
              {face ? (
                <g transform={`translate(${x - g / 2} ${y - g / 2})`}>
                  <VisitArt sight={face} size={g} />
                </g>
              ) : (
                <circle cx={x} cy={y} r={g} fill="var(--you)" opacity=".8" />
              )}
              {/* A hit area a finger can find. */}
              <circle cx={x} cy={y} r="11" fill="transparent" />
              {(hot || life >= 0.4) && (
                <text x={x + g / 2 + 3} y={y + 2.5} className={`font-mono ${hot ? "fill-ink" : "fill-page-ink2"}`} fontSize="7.5">
                  {starName(l.star)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-center font-mono text-[10px] text-muted">
        Round the Sun by where each lies in our sky. Green where life may be.
      </figcaption>
    </figure>
  );
}
