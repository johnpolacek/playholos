import { useRef } from "react";
import type { Art } from "@/lib/game/leads";
import { buildOf, type Does } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// Each row's mark on Scan, Build and Reach, in place of a dot, and beside the name on its page. Plain things are
// Lucide's shapes (ISC license, lucide.dev), drawn on its 24-unit grid with its 2-unit line, which at our size is the
// 1.3 line of our own marks on 16. The game's own ideas are ours. Every mark moves, a little: a world on its stretched
// orbit, faster near its star, a new world turning, two puffs of dust on Fomalhaut's ring, a message out and a reply
// back, the sky watch's dish sweeping, a flash, thought breathing as the Mind's mark does, a telescope nodding, a
// rocket's thrust, a yard rocking and a probe leaving it, the Moon rocking as it librates, and the array's light
// pushing a sail up. What our builds open moves too: a sun over a panel, a mirror gathering light, rock thrown off the
// Moon, a foundry's wheel, a craft round a rock, a hum coming down to the far side, and power beamed down, 2026-10-20. Each starts at its own moment, so like marks don't move as one. Each takes its color from the
// words beside it, and holds still for reduced motion. Settled 2026-10-19.

const LINES = {
  16: { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" },
  24: { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
} as const;

/** A moment to start at, so two of a kind don't move as one. */
const offset = () => Math.random() * 1.6;

/** A gentle back and forth, as many of the marks move. */
const sway = (target: Element | null, from: gsap.TweenVars, to: gsap.TweenVars, duration: number) =>
  gsap.fromTo(target, from, { ...to, duration, ease: "sine.inOut", yoyo: true, repeat: -1, delay: offset() });

/** A turn back and forth about a point, in degrees. */
const rock = (target: Element | null, from: number, to: number, duration: number, origin = "12 12") =>
  sway(target, { rotation: from, svgOrigin: origin }, { rotation: to, svgOrigin: origin }, duration);

/** A mark on its grid, 16 for ours or 24 for Lucide's, with what moves in it. */
function Moving({
  size,
  grid = 16,
  still = false,
  move,
  children,
}: {
  size: number;
  grid?: 16 | 24;
  still?: boolean;
  move(svg: SVGSVGElement, part: (k: string) => Element | null): void;
  children: React.ReactNode;
}) {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const svg = root.current;
      if (still || prefersReducedMotion() || !svg) return;
      move(svg, (k) => svg.querySelector(`[data-k="${k}"]`));
    },
    { scope: root, dependencies: [still], revertOnUpdate: true },
  );
  return (
    <svg
      ref={root}
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      overflow="visible"
      aria-hidden
      className="shrink-0"
      {...LINES[grid]}
    >
      {children}
    </svg>
  );
}

interface MarkProps {
  size: number;
  still?: boolean;
}

/** The infrared telescope, its tube nodding on its mount. */
const Telescope = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => void rock(part("tube"), -6, 4, 3.2, "12 13")}
  >
    <g data-k="tube">
      <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
      <path d="m13.56 11.747 4.332-.924" />
      <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
      <path d="m6.158 8.633 1.114 4.456" />
    </g>
    <path d="m16 21-3.105-6.21" />
    <path d="m8 21 3.105-6.21" />
    <circle cx="12" cy="13" r="2" />
  </Moving>
);

/** The launch complex: a rocket pushing along its line, its exhaust flickering. */
const Rocket = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => {
      sway(part("ship"), { x: -0.5, y: 0.5 }, { x: 0.6, y: -0.6 }, 0.9);
      sway(part("fire"), { opacity: 1 }, { opacity: 0.35 }, 0.18);
    }}
  >
    <path data-k="fire" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09" />
    <g data-k="ship">
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05" />
    </g>
  </Moving>
);

const SATELLITE = (
  <>
    <path d="m13.5 6.5-3.148-3.148a1.205 1.205 0 0 0-1.704 0L6.352 5.648a1.205 1.205 0 0 0 0 1.704L9.5 10.5" />
    <path d="M16.5 7.5 19 5" />
    <path d="m17.5 10.5 3.148 3.148a1.205 1.205 0 0 1 0 1.704l-2.296 2.296a1.205 1.205 0 0 1-1.704 0L13.5 14.5" />
    <path d="M9.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l4.296-4.296a1.205 1.205 0 0 0 0-1.704l-2.296-2.296a1.205 1.205 0 0 0-1.704 0z" />
  </>
);
const SIGNAL = "M9 21a6 6 0 0 0-6-6";

/** The orbital yard: a craft in orbit, rocking slowly as it turns. */
const Yard = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => void rock(part("craft"), -9, 9, 4)}
  >
    <g data-k="craft">
      {SATELLITE}
      <path d={SIGNAL} />
    </g>
  </Moving>
);

/** The probe yard: a probe easing away from its yard and back, its signal home pulsing. */
const Probe = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => {
      sway(part("craft"), { x: -0.6, y: 0.6 }, { x: 1, y: -1 }, 2.4);
      sway(part("signal"), { opacity: 1 }, { opacity: 0.25 }, 1.2);
    }}
  >
    <g data-k="craft">{SATELLITE}</g>
    <path data-k="signal" d={SIGNAL} />
  </Moving>
);

/** The Moon, rocking as it librates, so a little more of it shows at each edge in turn. */
const Moon = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => void rock(part("moon"), -10, 10, 5)}
  >
    <path
      data-k="moon"
      d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
    />
  </Moving>
);

/** Thought fields: thought breathing, at the Mind's own pace. */
const Brain = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => {
      const o = { svgOrigin: "12 12" };
      sway(part("brain"), { ...o, scale: 0.93 }, { ...o, scale: 1.05 }, 2);
    }}
  >
    <g data-k="brain">
      <path d="M12 18V5" />
      <path d="M15 13a4.17 4.17 0 01-3-4 4.17 4.17 0 01-3 4" />
      <path d="M17.707 6.294A3 3 0 1012 5a3 3 0 10-5.707 1.294" />
      <path d="M17.996 5.125a4 4 0 012.526 5.77" />
      <path d="M18 18a4 4 0 002-7.465" />
      <path d="M19.967 17.482a4 4 0 11-7.967.517 4 4 0 11-7.967-.517" />
      <path d="M6 18a4 4 0 01-2-7.465" />
      <path d="M6.004 5.125a4 4 0 00-2.526 5.77" />
    </g>
  </Moving>
);

/** The deep flash watch: dim while it waits, and now and then a flash. */
const Zap = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 2.2, delay: offset() })
        .fromTo(part("bolt"), { opacity: 0.5 }, { opacity: 1, duration: 0.07 })
        .to(part("bolt"), { opacity: 0.5, duration: 0.6, ease: "power2.out" })
    }
  >
    <path
      data-k="bolt"
      d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
    />
  </Moving>
);

/** Deuterium Works: a drop of seawater, gathering and falling. */
const Droplet = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => {
      const o = { svgOrigin: "12 22" };
      sway(part("drop"), { ...o, y: -1.2, scaleY: 0.94 }, { ...o, y: 0.6, scaleY: 1.04 }, 1.6);
    }}
  >
    <path
      data-k="drop"
      d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"
    />
  </Moving>
);

/** The Fusion Drive: a flame that never quite holds still. */
const Flame = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    grid={24}
    still={still}
    move={(_, part) => {
      const o = { svgOrigin: "12 21" };
      sway(part("fire"), { ...o, scaleY: 0.9, scaleX: 1.04 }, { ...o, scaleY: 1.08, scaleX: 0.96 }, 0.35);
    }}
  >
    <path data-k="fire" d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
  </Moving>
);

/** The Seed Ship: a sprout, swaying, for the copy of us it plants. */
const Sprout = ({ size, still }: MarkProps) => (
  <Moving size={size} grid={24} still={still} move={(_, part) => void rock(part("shoot"), -6, 6, 2.8, "12 21")}>
    <g data-k="shoot">
      <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
      <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
    </g>
    <path d="M5 21h14" />
  </Moving>
);

/** Ground Solar: a panel on the ground, and the sun above it brightening and dimming. */
const Solar = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => void sway(part("sun"), { scale: 0.75, svgOrigin: "12.6 3.4" }, { scale: 1.2, svgOrigin: "12.6 3.4" }, 1.8)}
  >
    <path d="M1.8 14.6h12.4M7.6 12.2v2.4" />
    <path d="M2.6 12.2 5.4 7.6h6.2L8.8 12.2z" />
    <circle data-k="sun" cx="12.6" cy="3.4" r="1.4" fill="currentColor" stroke="none" />
  </Moving>
);

/** The 15 m Mirror: a mirror of many segments, its light gathering to the middle and fading. */
const Mirror = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => void sway(part("light"), { opacity: 0.2, scale: 0.6, svgOrigin: "8 8" }, { opacity: 1, scale: 1, svgOrigin: "8 8" }, 1.6)}
  >
    <path d="M8 1.8 13.4 4.9v6.2L8 14.2 2.6 11.1V4.9z" />
    <path d="M8 1.8V5.6M13.4 4.9 10.1 6.8M13.4 11.1 10.1 9.2M8 14.2v-3.8M2.6 11.1l3.3-1.9M2.6 4.9l3.3 1.9" opacity={0.55} />
    <path d="M8 5.6 10.1 6.8v2.4L8 10.4 5.9 9.2V6.8z" />
    <circle data-k="light" cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Mass Driver: rock riding its track up off the Moon, faster and faster, and away. */
const Driver = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 0.5, delay: offset() })
        .fromTo(part("rock"), { attr: { cx: 3, cy: 12.6 }, opacity: 1 }, { attr: { cx: 15, cy: 5.6 }, duration: 1.4, ease: "power2.in" })
        .to(part("rock"), { opacity: 0, duration: 0.3 }, "-=0.3")
    }
  >
    <path d="M1.4 14.6Q8 12.4 14.6 14.6" />
    <path d="M2.6 12.8 11 7.9M8.4 9.4v4" />
    <circle data-k="rock" cx={still ? 7 : 3} cy={still ? 10.3 : 12.6} r="1.1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Orbital Foundry: a gear turning, slowly. */
const Foundry = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.to(part("wheel"), { rotation: 360, svgOrigin: "8 8", duration: 12, ease: "none", repeat: -1, delay: offset() })
    }
  >
    <g data-k="wheel">
      <path d="M12.31 7.13 13.95 7.22 13.95 8.78 12.31 8.87 11.67 10.43 12.76 11.66 11.66 12.76 10.43 11.67 8.87 12.31 8.78 13.95 7.22 13.95 7.13 12.31 5.57 11.67 4.34 12.76 3.24 11.66 4.33 10.43 3.69 8.87 2.05 8.78 2.05 7.22 3.69 7.13 4.33 5.57 3.24 4.34 4.34 3.24 5.57 4.33 7.13 3.69 7.22 2.05 8.78 2.05 8.87 3.69 10.43 4.33 11.66 3.24 12.76 4.34 11.67 5.57z" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.7" />
    </g>
  </Moving>
);

/** Belt Mining: a lumpy rock, and a craft going round it. */
const Belt = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.to(part("craft"), { rotation: 360, svgOrigin: "8 8.4", duration: 5, ease: "none", repeat: -1, delay: offset() })
    }
  >
    <path d="M4.4 7.2 6.2 4.8l3.2-.2 2.2 1.6.6 3-1.6 2.6-3.2.6-2.4-1.4z" strokeLinejoin="round" />
    <circle cx="7" cy="8.6" r="0.6" fill="currentColor" stroke="none" />
    <circle data-k="craft" cx="8" cy="1.6" r="1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Far-Side Array: small dishes across the Moon's far side, and a faint hum coming down to them. */
const FarSide = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(
        part("hum"),
        { y: -2.5, opacity: 0 },
        {
          keyframes: [
            { y: -0.5, opacity: 1, duration: 0.6, ease: "sine.out" },
            { y: 2.5, opacity: 0, duration: 1.2, ease: "sine.in" },
          ],
          repeat: -1,
          repeatDelay: 0.6,
          delay: offset(),
        },
      )
    }
  >
    <path d="M1.4 14.6Q8 11.6 14.6 14.6" />
    <path d="M2.6 12.2q1 1.5 2 0M7 11.4q1 1.5 2 0M11.4 12.2q1 1.5 2 0" />
    <path data-k="hum" d="M4.4 5.4Q8 3.2 11.6 5.4" strokeDasharray="0.1 1.9" />
  </Moving>
);

/** Power from Orbit: a sunlit panel up high, its power coming down to the ground. */
const Beamed = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(
        part("down"),
        { strokeDashoffset: 0 },
        { strokeDashoffset: -2, duration: 0.6, ease: "none", repeat: -1, delay: offset() },
      )
    }
  >
    <rect x="2.4" y="1.4" width="11.2" height="2.8" rx="0.4" />
    <path d="M6.1 1.4v2.8M9.9 1.4v2.8" opacity={0.55} />
    <path data-k="down" d="M8 6v6.2" strokeDasharray="0.1 1.9" />
    <path d="M1.4 14.6Q8 12.4 14.6 14.6" />
  </Moving>
);

/** A new world, turning: two meridians wheel round as it spins. */
function World({ size, still }: MarkProps) {
  const r = 6.25;
  return (
    <Moving
      size={size}
      still={still}
      move={(_, part) => {
        const [a, b] = [part("a"), part("b")];
        const t = { th: Math.random() * Math.PI };
        gsap.to(t, {
          th: `+=${Math.PI}`,
          duration: 7,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            a?.setAttribute("rx", String(Math.max(0.01, r * Math.abs(Math.cos(t.th)))));
            b?.setAttribute("rx", String(Math.max(0.01, r * Math.abs(Math.sin(t.th)))));
          },
        });
      }}
    >
      <circle cx="8" cy="8" r={r} />
      <ellipse data-k="a" cx="8" cy="8" rx="2.6" ry={r} />
      <ellipse data-k="b" cx="8" cy="8" rx="0.01" ry={r} opacity={0.5} />
      <path d="M1.75 8h12.5" />
    </Moving>
  );
}

/** A world on its stretched orbit, as eccentric as the lead's, round its star at the near focus. It goes as Kepler
 *  says: fast past the star, slow at the far end. */
function Orbit({ e, size, still }: { e: number; size: number; still?: boolean }) {
  const a = 6.2;
  const b = a * Math.sqrt(1 - e * e);
  const at = (E: number) => ({ cx: 8 + a * Math.cos(E), cy: 8 + b * Math.sin(E) });
  const rest = at(2.2);
  return (
    <Moving
      size={size}
      still={still}
      move={(svg) => {
        const world = svg.querySelector('[data-k="world"]')!;
        const t = { M: 0 };
        gsap.to(t, {
          M: Math.PI * 2,
          duration: 4.5,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            // Mean anomaly to eccentric anomaly, by Newton's method.
            let E = t.M;
            for (let k = 0; k < 5; k++) E -= (E - e * Math.sin(E) - t.M) / (1 - e * Math.cos(E));
            const p = at(E);
            world.setAttribute("cx", String(p.cx));
            world.setAttribute("cy", String(p.cy));
          },
        });
      }}
    >
      <g transform="rotate(-24 8 8)">
        <ellipse cx="8" cy="8" rx={a} ry={b} opacity={0.55} />
        <circle cx={8 + a * e} cy="8" r="1.5" fill="currentColor" stroke="none" />
        <circle data-k="world" {...rest} r="1.25" fill="currentColor" stroke="none" />
      </g>
    </Moving>
  );
}

/** Fomalhaut and its ring, where two puffs of dust swell and fade in turn. */
function Dust({ size, still }: { size: number; still?: boolean }) {
  const puff = (x: number, y: number, k: string) => (
    <g data-k={k} fill="currentColor" stroke="none">
      {[
        [0, 0],
        [1.5, -0.7],
        [-1.3, -0.9],
        [0.9, 1.3],
        [-1.2, 1.1],
      ].map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r="0.85" />
      ))}
    </g>
  );
  return (
    <Moving
      size={size}
      still={still}
      move={(svg) => {
        const tl = gsap.timeline({ repeat: -1 });
        for (const [k, origin] of [
          ["one", "3.4 9.6"],
          ["two", "12.4 5.6"],
        ] as const) {
          // Each swells from the hit, and holds a moment before it thins away.
          const puff = svg.querySelector(`[data-k="${k}"]`);
          const at = k === "one" ? 0 : 1.8;
          const grow = { scale: 1.5, svgOrigin: origin, duration: 2.6, ease: "power2.out" };
          tl.fromTo(puff, { scale: 0.4, svgOrigin: origin }, grow, at)
            .fromTo(puff, { opacity: 0 }, { opacity: 1, duration: 0.25 }, at)
            .to(puff, { opacity: 0, duration: 1.2, ease: "power1.in" }, at + 1.4);
        }
        tl.to({}, { duration: 0.4 });
      }}
    >
      <ellipse cx="8" cy="8" rx="6.4" ry="3" transform="rotate(-24 8 8)" opacity={0.55} />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
      {puff(3.4, 9.6, "one")}
      {puff(12.4, 5.6, "two")}
    </Moving>
  );
}

/** Earth, a star, and a message between them: out to the star, and for a reply, back. */
function Beam({ back, size, still }: { back: boolean; size: number; still?: boolean }) {
  return (
    <Moving
      size={size}
      still={still}
      move={(svg) => {
        const m = svg.querySelector('[data-k="msg"]');
        if (back)
          gsap.fromTo(
            m,
            { attr: { cx: 4.2 } },
            { attr: { cx: 12 }, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, repeatDelay: 0.3 },
          );
        else
          gsap.fromTo(
            m,
            { attr: { cx: 4.2 }, opacity: 1 },
            { attr: { cx: 12 }, opacity: 0.2, duration: 1.8, ease: "none", repeat: -1, repeatDelay: 0.4 },
          );
      }}
    >
      <circle cx="2.6" cy="8" r="2" />
      <path d="M5.2 8h6.4" strokeDasharray="0.1 2.1" />
      <circle cx="13.6" cy="8" r="1.6" fill="currentColor" stroke="none" />
      <circle data-k="msg" cx={still ? 8 : 4.2} cy="8" r="1.2" fill="currentColor" stroke="none" />
    </Moving>
  );
}

/** The all-sky watch: a dish on its mount, sweeping the sky from horizon to horizon. */
function Dish({ size, still }: { size: number; still?: boolean }) {
  return (
    <Moving
      size={size}
      still={still}
      move={(svg) =>
        void gsap.fromTo(
          svg.querySelector('[data-k="dish"]'),
          { rotation: -38, svgOrigin: "8 10.5" },
          { rotation: 38, svgOrigin: "8 10.5", duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 },
        )
      }
    >
      <path d="M3 14.5h10M8 14.5v-4" />
      <g data-k="dish">
        <path d="M3.2 6.2Q8 12.6 12.8 6.2" />
        <path d="M8 9.4V4.4" />
        <circle cx="8" cy="3.6" r="0.8" fill="currentColor" stroke="none" />
      </g>
    </Moving>
  );
}

/** The laser sail array: light from the ground, gathered on a sail that climbs away faster and faster. */
function Sail({ size, still }: { size: number; still?: boolean }) {
  const shape = (y: number) => ({
    beam: `M4 14.2 8 ${y + 0.6} 12 14.2`,
    sail: `M6.2 ${y + 0.6}Q8 ${y - 0.8} 9.8 ${y + 0.6}`,
  });
  const rest = shape(5);
  return (
    <Moving
      size={size}
      still={still}
      move={(svg) => {
        const beam = svg.querySelector('[data-k="beam"]')!;
        const sail = svg.querySelector('[data-k="sail"]')!;
        const t = { y: 10 };
        gsap.to(t, {
          y: 0.5,
          duration: 2.2,
          ease: "power2.in",
          repeat: -1,
          repeatDelay: 0.3,
          onUpdate: () => {
            const s = shape(t.y);
            beam.setAttribute("d", s.beam);
            sail.setAttribute("d", s.sail);
            sail.setAttribute("opacity", String(Math.min(1, t.y / 3)));
          },
        });
      }}
    >
      <path d="M3 14.8h10" />
      <path data-k="beam" d={rest.beam} strokeWidth={0.8} opacity={0.6} />
      <path data-k="sail" d={rest.sail} />
    </Moving>
  );
}

/** Each kind of build's color, as a class. Listening is ours, so blue. */
const TONE: Record<Does, string> = {
  listen: "text-you",
  think: "text-think",
  see: "text-see",
  lift: "text-lift",
  reach: "text-reach",
  keep: "text-keep",
};

const does = (name: string): Does => buildOf(name)?.does ?? "listen";

/** A build's color, as a class: full once queued, dimmer until then. */
export const buildTone = (name: string, queued = true) => `${TONE[does(name)]}${queued ? "" : " opacity-60"}`;

/** A build's color, as a value, for what is drawn in it. */
export const buildColor = (name: string) => `var(--${does(name) === "listen" ? "you" : does(name)})`;

/** A build's color, standing in for our blue, so a row's thread and its marks take the build's color. */
export const buildBlue = (name: string): React.CSSProperties | undefined =>
  does(name) === "listen" ? undefined : ({ "--you": `var(--${does(name)})` } as React.CSSProperties);

/** The Golden Record, turning: a groove's glint goes round, as if it played. */
function Record({ size, still }: MarkProps) {
  return (
    <Moving
      size={size}
      still={still}
      move={(_, part) =>
        void gsap.to(part("glint"), { rotation: 360, svgOrigin: "8 8", duration: 6, ease: "none", repeat: -1 })
      }
    >
      <circle cx="8" cy="8" r="6.25" />
      <circle cx="8" cy="8" r="3.9" opacity={0.45} />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <path data-k="glint" d="M8 2.9A5.1 5.1 0 0 1 12.4 5.45" />
    </Moving>
  );
}

/** Voyager 1's mark: the record it carries. */
export const RecordMark = ({ size = 16, still }: { size?: number; still?: boolean }) => (
  <Record size={size} still={still} />
);

/** A way to go that no build offers yet: Lucide's lock, held still, since nothing moves there yet. */
export const LockMark = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0" {...LINES[24]}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/** A build's mark, by its name. */
export function BuildMark({ name, size = 16, still }: { name: string; size?: number; still?: boolean }) {
  switch (name) {
    case "All-Sky Watch":
      return <Dish size={size} still={still} />;
    case "Deep Flash Watch":
      return <Zap size={size} still={still} />;
    case "Thought Fields":
      return <Brain size={size} still={still} />;
    case "Infrared Telescope":
      return <Telescope size={size} still={still} />;
    case "Launch Complex":
      return <Rocket size={size} still={still} />;
    case "Orbital Yard":
      return <Yard size={size} still={still} />;
    case "Moon Vault":
      return <Moon size={size} still={still} />;
    case "Laser Sail Array":
      return <Sail size={size} still={still} />;
    case "Deuterium Works":
      return <Droplet size={size} still={still} />;
    case "Fusion Drive":
      return <Flame size={size} still={still} />;
    case "Seed Ship":
      return <Sprout size={size} still={still} />;
    case "Ground Solar":
      return <Solar size={size} still={still} />;
    case "15 m Mirror":
      return <Mirror size={size} still={still} />;
    case "Mass Driver":
      return <Driver size={size} still={still} />;
    case "Orbital Foundry":
      return <Foundry size={size} still={still} />;
    case "Belt Mining":
      return <Belt size={size} still={still} />;
    case "Far-Side Array":
      return <FarSide size={size} still={still} />;
    case "Power from Orbit":
      return <Beamed size={size} still={still} />;
    default:
      return <Probe size={size} still={still} />;
  }
}

/** A lead's mark, by what its page draws: a stretched orbit, a world felt by its tug, dust, or a reply. */
export function LeadMark({ art, size = 16, still }: { art: Art; size?: number; still?: boolean }) {
  if (art.kind === "reply") return <Beam back size={size} still={still} />;
  if (art.kind === "clouds") return <Dust size={size} still={still} />;
  if (art.e > 0) return <Orbit e={art.e} size={size} still={still} />;
  return <World size={size} still={still} />;
}

/** A message's mark: out to its star, or a reply back. */
export function BeamMark({ back, size = 16, still }: { back: boolean; size?: number; still?: boolean }) {
  return <Beam back={back} size={size} still={still} />;
}
