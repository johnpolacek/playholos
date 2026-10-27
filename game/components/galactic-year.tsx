import { useId, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// The mark in the game's corner, and the about pages': the galactic year. Sol, in cyan, circles the galaxy's glowing
// core, as it does once every 230 million years. Here a lap takes 14 seconds, and the core swells and settles once
// every six. Drawn on a 24-unit grid around the center. Rounded, so the server and the browser draw it alike.
const round = (v: number) => Math.round(v * 1000) / 1000;
const ORBIT = 9.4;
// Seconds for one lap of Sol, and for the core to swell or settle.
const LAP = 14;
const BREATH = 3;
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
      const sol = gsap.to('[data-g="sol"]', { rotation: -360, svgOrigin: "0 0", duration: LAP, ease: "none", repeat: -1 });
      const breath = { duration: BREATH, ease: "sine.inOut", yoyo: true, repeat: -1 };
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

// The tab's icon: the same mark, drawn on a canvas on the game's paper and handed to the tab 15 times a second. At 16
// pixels the orbit keeps half its dots, and Sol and its wake are drawn twice as thick. Safari keeps the first icon it
// loads, icon.svg, and anyone who asks for less motion gets one still frame.
const TAB = { px: 64, fps: 15, dots: 18, dot: 0.5, sol: 1.6, wake: 2.2 } as const;

const rgba = (hex: string, a: number) =>
  `rgba(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",")},${a})`;

export function animateTab() {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TAB.px;
  const ctx = canvas.getContext("2d");
  if (!link || !ctx) return;
  const css = getComputedStyle(document.documentElement);
  const [paper, ink, muted, you] = ["--paper", "--ink", "--muted", "--you"].map((v) => css.getPropertyValue(v).trim());
  const glow = (r: number) => {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    GLOW.forEach(([offset, opacity]) => g.addColorStop(offset, rgba(ink, opacity)));
    return g;
  };
  const start = performance.now();
  const draw = () => {
    const t = (performance.now() - start) / 1000;
    // How far into a breath the core is, 0 at rest and 1 at the top, eased as the mark's sine.inOut.
    const b = (1 - Math.cos((Math.PI * t) / BREATH)) / 2;
    const sol = SOL_AT - (2 * Math.PI * t) / LAP;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, TAB.px, TAB.px);
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.roundRect(0, 0, TAB.px, TAB.px, TAB.px * 0.22);
    ctx.fill();
    // The 24-unit grid, with room past the orbit for Sol.
    ctx.setTransform(TAB.px / 25, 0, 0, TAB.px / 25, TAB.px / 2, TAB.px / 2);
    for (const [r0, r1, a0, a1] of [
      [...CORE.wide, 0.85, 1],
      [...CORE.bright, 1, 1],
    ]) {
      const r = r0 + (r1 - r0) * b;
      ctx.globalAlpha = a0 + (a1 - a0) * b;
      ctx.fillStyle = glow(r);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = rgba(muted, 0.55);
    for (let i = 0; i < TAB.dots; i++) {
      const a = (2 * Math.PI * i) / TAB.dots;
      ctx.beginPath();
      ctx.arc(ORBIT * Math.cos(a), ORBIT * Math.sin(a), TAB.dot, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.lineCap = "round";
    WAKE.forEach(({ width, opacity }, i) => {
      ctx.strokeStyle = rgba(you, opacity);
      ctx.lineWidth = width * (TAB.wake / 1.1);
      ctx.beginPath();
      ctx.arc(0, 0, ORBIT, sol + i * 0.09, sol + (i + 1) * 0.09);
      ctx.stroke();
    });
    ctx.fillStyle = you;
    ctx.beginPath();
    ctx.arc(ORBIT * Math.cos(sol), ORBIT * Math.sin(sol), TAB.sol, 0, 2 * Math.PI);
    ctx.fill();
    link.type = "image/png";
    link.href = canvas.toDataURL();
  };
  draw();
  if (!prefersReducedMotion()) setInterval(draw, 1000 / TAB.fps);
}
