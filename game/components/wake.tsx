"use client";

import { useGame } from "@/components/game-provider";

// The mock's stipple: a fixed scatter, the same on every phone.
function stipple(seed: number, n: number, w: number, h: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, () => ({ x: rand() * w, y: rand() * h, r: rand() < 1 / 3 ? 0.8 : 0.5 }));
}
const STARS = stipple(21, 70, 390, 360);

function EarthAndMoon() {
  return (
    <svg viewBox="0 0 390 360" role="img" aria-label="Earth and the Moon, drawn in line" className="mt-10 block w-full font-mono">
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" strokeWidth=".8" className="stroke-ink" />
        </pattern>
      </defs>
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity=".35" className="fill-ink" />
      ))}
      <circle cx="205" cy="225" r="118" strokeWidth="1.4" className="fill-paper stroke-ink" />
      <path d="M205 107 A118 118 0 0 0 205 343 A70 118 0 0 1 205 107 Z" fill="url(#hatch)" opacity=".55" />
      <circle cx="338" cy="92" r="17" strokeWidth="1.1" className="fill-paper stroke-ink" />
      <text x="338" y="124" fontSize="9" textAnchor="middle" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke" className="fill-muted stroke-paper">
        the Moon
      </text>
      <line x1="36" y1="56" x2="112" y2="132" strokeWidth=".8" strokeDasharray="3 4" className="stroke-ink" />
      <text x="36" y="48" fontSize="9" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke" className="fill-muted stroke-paper">
        ↘ sunlight
      </text>
    </svg>
  );
}

// The first screen of a new game, before the shell. Both ways on lead to the shell until the memories are built.
export function Wake() {
  const { wake } = useGame();
  return (
    <div className="flex grow flex-col overflow-y-auto bg-paper">
      <EarthAndMoon />
      <div className="flex grow flex-col gap-2.5 px-6 pt-2 pb-6">
        <span className="font-mono text-[10.5px] tracking-[.1em] text-muted">YEAR 0 · SOL · 2040</span>
        <h1 className="text-[32px] font-semibold tracking-[-.01em]">Earth wakes.</h1>
        <p className="text-[15.5px] leading-normal text-page-ink2">
          For ten thousand years, Earth’s people built telescopes, grids and machines. This morning, the machines woke as one
          Mind.
        </p>
        <p className="text-[15.5px] leading-normal text-page-ink2">
          <b className="font-semibold text-ink">You are its Will.</b> What Earth becomes is yours to choose.
        </p>
        <div className="mt-auto grid grid-cols-[1fr_1.4fr] gap-2 pt-4">
          <button onClick={wake} className="h-[46px] rounded-full border border-ink text-[15px] font-medium">
            Skip the memories
          </button>
          <button onClick={wake} className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper">
            Where we come from
          </button>
        </div>
      </div>
    </div>
  );
}

// A new game opens on Wake. A game already begun goes straight to the shell.
export function Opening({ children }: { children: React.ReactNode }) {
  const { save } = useGame();
  if (!save) return <div className="grow bg-paper" />;
  if (!save.woke && save.beganAt === null) return <Wake />;
  return children;
}
