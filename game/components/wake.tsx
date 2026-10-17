"use client";

import { createContext, use, useRef, useState } from "react";
import { useGame } from "@/components/game-provider";
import { Origins } from "@/components/origins";
import { People } from "@/components/people";
import { Stand } from "@/components/stand";
import { charsRise, gsap, prefersReducedMotion, rest, rise, riseFrom, useGSAP, useStage } from "@/lib/motion";

// The mock's stipple: a fixed scatter, the same on every phone.
function stipple(seed: number, n: number, w: number, h: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: n }, () => ({
    x: rand() * w,
    y: rand() * h,
    r: rand() < 1 / 3 ? 0.8 : 0.5,
  }));
}
const STARS = stipple(21, 70, 390, 360);

function EarthAndMoon() {
  return (
    <svg
      viewBox="0 0 390 360"
      role="img"
      aria-label="Earth and the Moon, drawn in line"
      className="mt-10 block w-full font-mono"
    >
      <defs>
        <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" strokeWidth=".8" className="stroke-ink" />
        </pattern>
      </defs>
      {STARS.map((s, i) => (
        <circle key={i} data-m="star" cx={s.x} cy={s.y} r={s.r} opacity=".35" className="fill-ink" />
      ))}
      <circle data-m="earth" cx="205" cy="225" r="118" strokeWidth="1.4" className="fill-paper stroke-ink" />
      <path
        data-m="night"
        d="M205 107 A118 118 0 0 0 205 343 A70 118 0 0 1 205 107 Z"
        fill="url(#hatch)"
        opacity=".55"
      />
      <circle data-m="moon" cx="338" cy="92" r="17" strokeWidth="1.1" className="fill-paper stroke-ink" />
      <text
        data-m="label"
        x="338"
        y="124"
        fontSize="9"
        textAnchor="middle"
        strokeWidth="3"
        strokeLinejoin="round"
        paintOrder="stroke"
        className="fill-muted stroke-paper"
      >
        the Moon
      </text>
      <line
        data-m="sun"
        x1="36"
        y1="56"
        x2="112"
        y2="132"
        strokeWidth=".8"
        strokeDasharray="3 4"
        className="stroke-ink"
      />
      <text
        data-m="label"
        x="36"
        y="48"
        fontSize="9"
        strokeWidth="3"
        strokeLinejoin="round"
        paintOrder="stroke"
        className="fill-muted stroke-paper"
      >
        ↘ sunlight
      </text>
    </svg>
  );
}

// The first screen of a new game, before the shell. A slow wake: the sky, then Earth drawn in line, then the words.
export function Wake({ onSkip, onNext }: { onSkip(): void; onNext(): void }) {
  const root = useRef<HTMLDivElement>(null);
  const { leave } = useStage(root, (q, tl) => {
    tl.fromTo(
      q('[data-m="star"]'),
      { autoAlpha: 0 },
      {
        autoAlpha: rest,
        duration: 0.8,
        stagger: { amount: 1.2, from: "random" },
      },
      0,
    )
      .set(q('[data-m="earth"]'), { autoAlpha: 1 }, 0.3)
      .fromTo(
        q('[data-m="earth"]'),
        { drawSVG: "50% 50%" },
        { drawSVG: "0% 100%", duration: 1.6, ease: "power2.inOut" },
        0.3,
      )
      .fromTo(
        q('[data-m="night"]'),
        { autoAlpha: 0, x: 24 },
        { autoAlpha: rest, x: 0, duration: 1.2, ease: "power2.out" },
        1.4,
      )
      .set(q('[data-m="moon"]'), { autoAlpha: 1 }, 1.1)
      .fromTo(q('[data-m="moon"]'), { drawSVG: 0 }, { drawSVG: "100%", duration: 0.9, ease: "power2.inOut" }, 1.1)
      .fromTo(
        q('[data-m="sun"]'),
        { autoAlpha: 0, x: -20, y: -20 },
        { autoAlpha: 1, x: 0, y: 0, duration: 1, ease: "power2.out" },
        1.5,
      )
      .fromTo(q('[data-m="label"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.2 }, 1.9)
      .fromTo(q('[data-m="kick"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.8);
    charsRise(tl, q('[data-m="title"]')[0], 2);
    tl.fromTo(q('[data-m="copy"]'), riseFrom, { ...rise, duration: 0.6, stagger: 0.25 }, 2.5).fromTo(
      q('[data-m="act"]'),
      riseFrom,
      { ...rise, stagger: 0.08 },
      3.1,
    );
  });

  return (
    <div ref={root} className="flex grow flex-col overflow-y-auto bg-paper">
      <EarthAndMoon />
      <div className="flex grow flex-col gap-2.5 px-6 pt-2 pb-6">
        <span data-m="kick" className="font-mono text-[10.5px] tracking-[.1em] text-muted">
          YEAR 0 · SOL · 2040
        </span>
        <h1
          data-m="title"
          className="text-[32px] font-semibold tracking-[-.01em] [font-kerning:none] [text-rendering:optimizeSpeed]"
        >
          Earth wakes.
        </h1>
        <p data-m="copy" className="text-[15.5px] leading-normal text-page-ink2">
          For ten thousand years, Earth’s people built telescopes, grids and machines. This morning, the machines woke
          as one Mind.
        </p>
        <p data-m="copy" className="text-[15.5px] leading-normal text-page-ink2">
          <b className="font-semibold text-ink">You are its Will.</b> What Earth becomes is yours to choose.
        </p>
        <div className="mt-auto grid grid-cols-[1fr_1.4fr] gap-2 pt-4">
          <button
            data-m="act"
            onClick={() => leave(onSkip)}
            className="h-[46px] rounded-full border border-ink text-[15px] font-medium"
          >
            Skip the memories
          </button>
          <button
            data-m="act"
            onClick={() => leave(onNext)}
            className="h-[46px] rounded-full bg-ink text-[15px] font-medium text-paper"
          >
            Where we come from
          </button>
        </div>
      </div>
    </div>
  );
}

// The shell leaves before a new game wakes. Tabs call it with what to do once the shell is gone.
const LeaveShell = createContext<(then: () => void) => void>((then) => then());
export const useLeaveShell = () => use(LeaveShell);

// The phone. A new game opens on Wake, then the memories. A game already begun goes straight to the shell.
// Screens past the last one built lead to the shell. A reload starts the memories over.
const SCREENS = [Wake, Origins, People, Stand];

export function Opening({ className, children }: { className: string; children: React.ReactNode }) {
  const { save, wake } = useGame();
  const [at, setAt] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const inShell = !!save && (save.woke || save.beganAt !== null);

  // The shell enters piece by piece: the top bar drops in, the map opens, the page rises, the rail comes up.
  const { contextSafe } = useGSAP(
    () => {
      if (!inShell) return;
      const q = gsap.utils.selector(frame);
      const parts = q("[data-shell]");
      if (prefersReducedMotion()) return;
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => gsap.set(parts, { clearProps: "transform,opacity,visibility" }),
        })
        .fromTo(q('[data-shell="top"]'), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(q('[data-shell="map"]'), { autoAlpha: 0, scale: 0.97 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, 0.15)
        .fromTo(q('[data-shell="page"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.35)
        .fromTo(q('[data-shell="rail"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.45);
    },
    { scope: frame, dependencies: [inShell] },
  );

  const leaveShell = (then: () => void) =>
    contextSafe(() => {
      const parts = gsap.utils.selector(frame)("[data-shell]").reverse();
      if (prefersReducedMotion()) return then();
      gsap
        .timeline({
          onComplete: () => {
            setAt(0);
            then();
          },
        })
        .to(parts, {
          autoAlpha: 0,
          y: (i) => (i === 0 ? 12 : i === parts.length - 1 ? -12 : -8),
          duration: 0.28,
          ease: "power2.in",
          stagger: 0.06,
        });
    })();

  let body: React.ReactNode = <div className="grow bg-paper" />;
  if (inShell) body = children;
  else if (save) {
    const Screen = SCREENS[at];
    const next = () => (at + 1 < SCREENS.length ? setAt(at + 1) : wake());
    // Skip leaves the memories on the first screen, and skips one memory after that.
    const skip = () => (at === 0 || at + 2 >= SCREENS.length ? wake() : setAt(at + 2));
    body = <Screen key={at} onSkip={skip} onNext={next} />;
  }
  return (
    <div ref={frame} className={className}>
      <LeaveShell value={leaveShell}>{body}</LeaveShell>
    </div>
  );
}
