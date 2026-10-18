import { useId, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The mark in the game's corner, and the about pages': the galactic year. Sol, in cyan, circles the galaxy's glowing
// core, as it does once every 230 million years. Here a lap takes 14 seconds, and the core swells and settles once
// every six. Drawn on a 24-unit grid around the center. Rounded, so the server and the browser draw it alike.
const round = (v: number) => Math.round(v * 1000) / 1000;
const ORBIT = 9.4;
// Where Sol starts, up and to the right, and where it rests for anyone who asks for less motion.
const SOL_AT = -0.8;
// Sol's wake: ten short arcs behind it, each thinner and fainter.
const WAKE = Array.from({ length: 10 }, (_, i) => {
  const p = (a: number) => `${round(ORBIT * Math.cos(a))} ${round(ORBIT * Math.sin(a))}`;
  return {
    d: `M${p(SOL_AT + i * 0.09)}A${ORBIT} ${ORBIT} 0 0 1 ${p(SOL_AT + (i + 1) * 0.09)}`,
    width: round(Math.max(1.1 * (1 - i * 0.07), 0.7)),
    opacity: round(0.8 * (1 - i / 10)),
  };
});
const GLOW = [
  [0, 1],
  [0.3, 0.55],
  [1, 0],
] as const;
// The core's two glows, wide and bright, each at rest and at the top of a breath. The wide one's faint edge reaches
// Sol's orbit at the top of a breath.
const CORE = { wide: [8.2, 9.4], bright: [3.8, 4.25] } as const;
// On hover, the core swells past the mark's edge, Sol laps four times as fast, and the core breathes twice as fast.
const HOVER = { core: 1.45, sol: 4, breath: 2 } as const;

export function GalacticYear({ size }: { size: number }) {
  const root = useRef<SVGSVGElement>(null);
  // Each copy of the mark needs its own gradient id. React's ids carry characters a url(#…) can't.
  const glow = `glow${useId().replace(/[^\w-]/g, "")}`;
  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion()) return;
      const sol = gsap.to('[data-g="sol"]', { rotation: -360, svgOrigin: "0 0", duration: 14, ease: "none", repeat: -1 });
      const breath = { duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 };
      const breaths = [
        gsap.to('[data-g="wide"]', { attr: { r: CORE.wide[1] }, opacity: 1, ...breath }),
        gsap.to('[data-g="bright"]', { attr: { r: CORE.bright[1] }, ...breath }),
      ];
      // Only a copy in a button or a link wakes on hover: the top bar's and the about pages', not the drawer's.
      const button = root.current?.closest("button, a");
      if (!button || !contextSafe) return;
      const wake = contextSafe((on: boolean) => {
        const ease = { duration: 0.6, ease: "power2.out", overwrite: true };
        gsap.to('[data-g="core"]', { scale: on ? HOVER.core : 1, svgOrigin: "0 0", ...ease });
        gsap.to(sol, { timeScale: on ? HOVER.sol : 1, ...ease });
        breaths.forEach((b) => gsap.to(b, { timeScale: on ? HOVER.breath : 1, ...ease }));
      });
      const enter = () => wake(true);
      const leave = () => wake(false);
      button.addEventListener("pointerenter", enter);
      button.addEventListener("pointerleave", leave);
      return () => {
        button.removeEventListener("pointerenter", enter);
        button.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );
  return (
    <svg ref={root} width={size} height={size} viewBox="-12 -12 24 24" overflow="visible" aria-hidden>
      <defs>
        <radialGradient id={glow}>
          {GLOW.map(([offset, opacity]) => (
            <stop key={offset} offset={offset} style={{ stopColor: "var(--ink)", stopOpacity: opacity }} />
          ))}
        </radialGradient>
      </defs>
      {/* The core: a wide soft glow, and a small bright one inside it. */}
      <g data-g="core">
        <circle data-g="wide" r={CORE.wide[0]} opacity={0.85} fill={`url(#${glow})`} />
        <circle data-g="bright" r={CORE.bright[0]} fill={`url(#${glow})`} />
      </g>
      <circle
        r={ORBIT}
        fill="none"
        className="stroke-muted"
        strokeOpacity={0.55}
        strokeWidth={0.55}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`0 ${round(100 / 36)}`}
      />
      <g data-g="sol">
        {WAKE.map(({ d, width, opacity }, i) => (
          <path key={i} d={d} fill="none" className="stroke-you" strokeWidth={width} strokeOpacity={opacity} strokeLinecap="round" />
        ))}
        <circle cx={round(ORBIT * Math.cos(SOL_AT))} cy={round(ORBIT * Math.sin(SOL_AT))} r={0.8} className="fill-you" />
      </g>
    </svg>
  );
}
