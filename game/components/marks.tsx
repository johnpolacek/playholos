import { useRef } from "react";
import type { Art } from "@/lib/game/leads";
import { buildOf, type Does } from "@/lib/game/plan";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

// Each row's mark on Scan, Build and Reach, in place of a dot, and beside the name on its page. Plain things are
// Lucide's shapes (ISC license, lucide.dev), drawn on its 24-unit grid with its 2-unit line, which at our size is the
// 1.3 line of our own marks on 16. The game's own ideas are ours. Every mark moves, a little: a world on its stretched
// orbit, faster near its star, a new world turning, a message out and a reply
// back, the sky watch's dish sweeping, a flash, thought breathing as the Mind's mark does, a telescope nodding, a
// rocket's thrust, a yard rocking and a probe leaving it, the Moon rocking as it librates, and the array's light
// pushing a sail up. What our builds open moves too: a sun over a panel, a mirror gathering light, rock thrown off the
// Moon, a foundry's wheel, a craft round a rock, a hum coming down to the far side, and power beamed down, 2026-10-20. A star's cold glow, an annex's heat going out to
// the sky, and light bent round the Sun to a focus, 2026-10-26. Rock thrown off Mercury, a ring filling round the Sun, a
// beam gathered from an arc, and mirrors spread wide to one focus, 2026-10-29. Each starts at its own moment, so like marks don't move as one. Each takes its color from the
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

/** The X-Ray Watch: a lobster-eye's cells, and a flame flaring in its sight. 2026-10-28. */
const XRay = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("flare"), { opacity: 0.2 }, { opacity: 1 }, 1.2)}>
    <path d="M3 4h10v8H3zM6.3 4v8M9.7 4v8M3 8h10" opacity={0.6} />
    <circle data-k="flare" cx="11.4" cy="5.8" r="1.2" fill="currentColor" stroke="none" opacity={still ? 1 : 0.2} />
  </Moving>
);

/** Quiet Radars: a dish whose sweep fades out. 2026-10-28. */
const Quiet = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("sweep"), { opacity: 0.8 }, { opacity: 0.05 }, 2.2)}>
    <path d="M3 13.6h6M6 13.6V10M2.6 6.4a4.6 4.6 0 0 0 6.8 3.6z" />
    <path data-k="sweep" d="M9.6 6.8a3 3 0 0 1 2.2 2.2M10.6 4.4a5.6 5.6 0 0 1 3.6 3.6" opacity={still ? 0.4 : 0.8} />
  </Moving>
);

/** The Interceptor: a kill vehicle meeting a craft head on. 2026-10-28. */
const Intercept = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: offset() })
        .fromTo(part("kv"), { attr: { cx: 2 }, opacity: 1 }, { attr: { cx: 9.2 }, duration: 0.8, ease: "power1.in" })
        .to(part("kv"), { opacity: 0, duration: 0.1 })
    }
  >
    <path d="M10.4 6.8h3.8l-1.2 1.2 1.2 1.2h-3.8z" />
    <circle data-k="kv" cx={still ? 7 : 2} cy="8" r="0.9" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Picket Yard: a grid of pellets on a line, and a bullet breaking on it. 2026-10-28. */
const Picket = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("spray"), { opacity: 0 }, { opacity: 0.9 }, 1.1)}>
    <path d="M9 2.6v10.8" strokeDasharray="0.6 1.6" />
    <path d="M2 8h6" />
    <path data-k="spray" d="M10.4 8l3.4-2.4M10.4 8h3.8M10.4 8l3.4 2.4" opacity={still ? 0.9 : 0} />
  </Moving>
);

/** The Strike Yard: a bullet on its long flame, outbound. 2026-10-28. */
const Strike = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("flame"), { opacity: 0.3 }, { opacity: 1 }, 0.7)}>
    <path d="M8.6 6.6h4.2l1.4 1.4-1.4 1.4H8.6z" />
    <path data-k="flame" d="M8.4 8H1.8M7.6 7l-4 -1.4M7.6 9l-4 1.4" opacity={still ? 1 : 0.3} />
  </Moving>
);

/** The Rock Deflector: an impactor streaking in, and the rock it meets nudged aside. 2026-10-28. */
const Deflector = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 0.8, delay: offset() })
        .fromTo(part("craft"), { attr: { cx: 1.6, cy: 14.2 }, opacity: 1 }, { attr: { cx: 8.4, cy: 7.6 }, duration: 0.9, ease: "power1.in" })
        .to(part("craft"), { opacity: 0, duration: 0.15 })
        .fromTo(part("rock"), { x: 0, y: 0 }, { x: 1.2, y: -0.8, duration: 0.6, ease: "power2.out" }, "<")
        .to(part("rock"), { x: 0, y: 0, duration: 0.01 }, "+=0.6")
    }
  >
    <path data-k="rock" d="M8.6 5.4c1.4-1.8 4.6-1.6 5.4.6.8 2-.2 4.4-2.6 4.8-2.2.4-4.2-1.2-3.8-3.2z" />
    <path d="M1.6 14.2 6.4 9.6" strokeDasharray="1 1.4" opacity={0.55} />
    <circle data-k="craft" cx={still ? 6.8 : 1.6} cy={still ? 9.2 : 14.2} r="0.9" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Trojan Vault: a dark rock, and a light inside it, steady and slow. 2026-10-28. */
const Trojan = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => void sway(part("light"), { opacity: 0.3 }, { opacity: 1 }, 2.4)}
  >
    <path d="M3 8.4C2.4 5.4 4.6 3 7.6 3.2c2.4-.6 5 .6 5.6 3.2.8 2.8-.4 5.6-3.2 6.4-2.6 1-6 .6-7-4.4z" />
    <circle data-k="light" cx="8.2" cy="8" r="1.3" fill="currentColor" stroke="none" opacity={still ? 1 : 0.3} />
  </Moving>
);

/** Fusion Plants: a tokamak's ring, and the plasma in it glowing brighter and dimmer. 2026-10-28. */
const Fusion = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => void sway(part("plasma"), { opacity: 0.35 }, { opacity: 1 }, 1.4)}
  >
    <ellipse cx="8" cy="8.6" rx="6.4" ry="3.6" />
    <ellipse cx="8" cy="8.6" rx="2.6" ry="1.2" />
    <ellipse data-k="plasma" cx="8" cy="8.6" rx="4.5" ry="2.4" strokeWidth={1.6} opacity={still ? 1 : 0.35} />
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

/** The Orbital Ring: a ring round the world, a ladder hanging from it, and a craft climbing. 2026-10-28. */
const Ring = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 0.5, delay: offset() })
        .fromTo(part("craft"), { attr: { cy: 6 }, opacity: 1 }, { attr: { cy: 2.6 }, duration: 1.4, ease: "sine.inOut" })
        .to(part("craft"), { opacity: 0, duration: 0.3 }, "-=0.3")
    }
  >
    <circle cx="8" cy="10.4" r="4.4" />
    <ellipse cx="8" cy="7.6" rx="7" ry="5" opacity={0.55} />
    <path d="M8 2.6v3.4" />
    <circle data-k="craft" cx="8" cy={still ? 4.3 : 6} r="1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Launch Tunnel: a mountain, a tunnel up through it, and a craft thrown out of its mouth. Ours. 2026-10-27. */
const Tunnel = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: offset() })
        .fromTo(part("craft"), { attr: { cx: 2.2, cy: 13.2 }, opacity: 1 }, { attr: { cx: 15, cy: 3.4 }, duration: 1.1, ease: "power2.in" })
        .to(part("craft"), { opacity: 0, duration: 0.25 }, "-=0.25")
    }
  >
    <path d="M1 14.6 7 5.2l2.4 3.4 1.6-1.8 4 7.8" />
    <path d="M2.2 13.2 9.6 9.4" strokeDasharray="1 1.2" />
    <circle data-k="craft" cx={still ? 11.6 : 2.2} cy={still ? 7.8 : 13.2} r="1" fill="currentColor" stroke="none" />
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

/** The Halo Survey: a star, and a faint ring of cold glow round it, brightening and fading. Ours. 2026-10-26. */
const Halo = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => {
      sway(part("glow"), { opacity: 0.25, scale: 0.85, svgOrigin: "8 8" }, { opacity: 0.9, scale: 1.05, svgOrigin: "8 8" }, 2.4);
      gsap.to(part("glow"), { rotation: 360, svgOrigin: "8 8", duration: 24, ease: "none", repeat: -1 });
    }}
  >
    <circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none" />
    <circle data-k="glow" cx="8" cy="8" r="5.6" strokeDasharray="0.1 1.9" />
  </Moving>
);

/** The Solar Lens: the Sun, and a world's light bent round it, coming to a point. Ours. 2026-10-26. */
const SunLens = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) => void sway(part("focus"), { opacity: 0.25, scale: 0.6, svgOrigin: "14.2 8" }, { opacity: 1, scale: 1.2, svgOrigin: "14.2 8" }, 1.8)}
  >
    <circle cx="5.4" cy="8" r="2.4" />
    <path d="M1.4 3.2Q5.4 4.6 14.2 8M1.4 12.8Q5.4 11.4 14.2 8" opacity={0.55} />
    <circle data-k="focus" cx="14.2" cy="8" r="1.1" fill="currentColor" stroke="none" />
  </Moving>
);

/** A black hole: a dark point, a star beside it pushed out and back as the hole passes. Ours. 2026-10-26. */
const Hole = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("star"), { x: 0, y: 0 }, { x: 1.6, y: -1.2 }, 2.2)}>
    <circle cx="7" cy="9" r="2.6" />
    <circle cx="7" cy="9" r="5.4" strokeDasharray="0.1 1.9" opacity={0.6} />
    <circle data-k="star" cx="12.6" cy="4.6" r="1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Cold Annex: panels on the sunward side of a shade, radiators behind it, their heat drifting out to the cold
 *  sky. Ours. 2026-10-26. */
const Annex = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(
        part("heat"),
        { strokeDashoffset: 0 },
        { strokeDashoffset: -2, duration: 1.4, ease: "none", repeat: -1, delay: offset() },
      )
    }
  >
    <path d="M1.4 4.6h3.8v6.8H1.4z" />
    <path d="M3.3 4.6v6.8" opacity={0.55} />
    <path d="M7 2.4v11.2" />
    <path d="M7 5.2h4.2M7 8h4.2M7 10.8h4.2" opacity={0.55} />
    <path data-k="heat" d="M12.4 5.2h2.4M12.4 8h2.4M12.4 10.8h2.4" strokeDasharray="0.1 1.9" />
  </Moving>
);

/** The Cold Halo: sheets in a ring round the annex, turning slowly, their heat going out. Ours. 2026-10-28. */
const Swarm = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.to(part("ring"), { rotation: 360, svgOrigin: "8 8", duration: 40, ease: "none", repeat: -1, delay: offset() })
    }
  >
    <path d="M6.6 6.6h2.8v2.8H6.6z" />
    <g data-k="ring">
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4, [x, y] = [8 + 5.4 * Math.cos(a), 8 + 5.4 * Math.sin(a)];
        return <path key={k} d={`M${(x - 0.8).toFixed(2)} ${(y - 0.8).toFixed(2)}h1.6v1.6h-1.6z`} opacity={k % 2 ? 0.55 : 1} />;
      })}
    </g>
  </Moving>
);

/** Mercury Works: a small world, and a seed on it throwing rock up off its face. Ours. 2026-10-29. */
const MercuryWorks = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(part("rock"), { x: 0, y: 0, opacity: 1 }, { x: 3.6, y: -5.4, opacity: 0, duration: 1.6, ease: "power1.out", repeat: -1, delay: offset() })
    }
  >
    <circle cx="6.4" cy="10" r="4.2" />
    <path d="M8.6 6.4l2-1.6" />
    <circle data-k="rock" cx="10.6" cy="4.8" r="0.8" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Solar Swarm: the Sun, and a ring of collectors round it filling in, one more each beat. Ours. 2026-10-29. */
const SolarSwarm = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(
        part("ring")?.children ? [...part("ring")!.children] : [],
        { opacity: 0.2 },
        { opacity: 1, duration: 0.5, stagger: { each: 0.35, repeat: -1, yoyo: true }, ease: "sine.inOut", delay: offset() },
      )
    }
  >
    <circle cx="8" cy="8" r="2.2" />
    <g data-k="ring">
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k * Math.PI) / 6, [x, y] = [8 + 5.6 * Math.cos(a), 8 + 5.6 * Math.sin(a)];
        return <circle key={k} cx={x.toFixed(2)} cy={y.toFixed(2)} r="0.7" fill="currentColor" stroke="none" />;
      })}
    </g>
  </Moving>
);

/** The Star Beam: collectors in an arc phased as one, their light gathered to a narrow beam going out. Ours. 2026-10-29. */
const StarBeam = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(part("beam"), { strokeDashoffset: 0 }, { strokeDashoffset: -4, duration: 0.8, ease: "none", repeat: -1, delay: offset() })
    }
  >
    <path d="M3 2.6Q6.4 8 3 13.4" />
    <path d="M3.6 4.6L8 8M3.6 11.4L8 8M4.4 8H8" opacity={0.55} />
    <path data-k="beam" d="M8 8h6.6" strokeDasharray="2 2" />
  </Moving>
);

/** The Hypertelescope: mirrors spread wide in a curve, their light brought to one focus, which drifts as the fleet
 *  turns to a new star. Ours. 2026-10-29. */
const Hyper = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void rock(part("fleet"), -6, 6, 3.2, "8 4")}>
    <g data-k="fleet">
      {[[1.8, 12.6], [4.6, 13.8], [8, 14.2], [11.4, 13.8], [14.2, 12.6]].map(([x, y]) => (
        <path key={x} d={`M${x - 0.9} ${y}h1.8`} />
      ))}
      <path d="M1.8 12.6L8 4M8 14.2V4M14.2 12.6L8 4" opacity={0.4} />
    </g>
    <circle cx="8" cy="3.4" r="1.1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Helium-3 Harvest: an ice giant, and a craft dipping into its air and climbing out again. Ours. 2026-10-29. */
const Harvest = ({ size, still }: MarkProps) => (
  <Moving size={size} still={still} move={(_, part) => void sway(part("craft"), { x: 0, y: 0 }, { x: -1.8, y: 2.2 }, 1.8)}>
    <circle cx="6.4" cy="9.6" r="4.6" />
    <path d="M2.6 8.4h7.6" opacity={0.45} />
    <circle data-k="craft" cx="12.6" cy="4.2" r="1" fill="currentColor" stroke="none" />
  </Moving>
);

/** The Mind Link: a wide mirror, its beam going out in pulses. Ours. 2026-10-26. */
const Link = ({ size, still }: MarkProps) => (
  <Moving
    size={size}
    still={still}
    move={(_, part) =>
      void gsap.fromTo(part("beam"), { strokeDashoffset: 0 }, { strokeDashoffset: -3, duration: 1.2, ease: "none", repeat: -1, delay: offset() })
    }
  >
    <path d="M2.4 2.6Q6.6 8 2.4 13.4" />
    <circle cx="5.6" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <path data-k="beam" d="M6.8 8h7.6" strokeDasharray="1.2 1.8" />
  </Moving>
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
    case "Warm Sky Watch":
    case "Moon Search":
    case "Asteroid Tour":
      return <Telescope size={size} still={still} />;
    case "Launch Complex":
      return <Rocket size={size} still={still} />;
    case "Launch Tunnel":
      return <Tunnel size={size} still={still} />;
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
    case "X-Ray Watch":
      return <XRay size={size} still={still} />;
    case "Quiet Radars":
      return <Quiet size={size} still={still} />;
    case "Interceptor":
      return <Intercept size={size} still={still} />;
    case "Picket Yard":
      return <Picket size={size} still={still} />;
    case "Strike Yard":
      return <Strike size={size} still={still} />;
    case "Rock Deflector":
      return <Deflector size={size} still={still} />;
    case "Trojan Vault":
      return <Trojan size={size} still={still} />;
    case "Fusion Plants":
      return <Fusion size={size} still={still} />;
    case "Ground Solar":
      return <Solar size={size} still={still} />;
    case "15 m Mirror":
      return <Mirror size={size} still={still} />;
    case "Mass Driver":
      return <Driver size={size} still={still} />;
    case "Orbital Ring":
      return <Ring size={size} still={still} />;
    case "Orbital Foundry":
      return <Foundry size={size} still={still} />;
    case "Belt Mining":
      return <Belt size={size} still={still} />;
    case "Far-Side Array":
      return <FarSide size={size} still={still} />;
    case "Power from Orbit":
      return <Beamed size={size} still={still} />;
    case "Halo Survey":
    case "Halo Array":
      return <Halo size={size} still={still} />;
    case "Cold Annex":
      return <Annex size={size} still={still} />;
    case "Cold Halo":
      return <Swarm size={size} still={still} />;
    case "Solar Lens":
      return <SunLens size={size} still={still} />;
    case "Mercury Works":
      return <MercuryWorks size={size} still={still} />;
    case "Solar Swarm":
      return <SolarSwarm size={size} still={still} />;
    case "Star Beam":
      return <StarBeam size={size} still={still} />;
    case "Hypertelescope":
      return <Hyper size={size} still={still} />;
    case "Helium-3 Harvest":
      return <Harvest size={size} still={still} />;
    case "Star Mapper":
      return <Hole size={size} still={still} />;
    case "Mind Link":
      return <Link size={size} still={still} />;
    default:
      return <Probe size={size} still={still} />;
  }
}

/** A lead's mark, by what its page draws: a stretched orbit, a world felt by its tug, or a reply. */
export function LeadMark({ art, size = 16, still }: { art: Art; size?: number; still?: boolean }) {
  if (art.kind === "reply") return <Beam back size={size} still={still} />;
  if (art.kind === "dark" || art.kind === "pair") return <Hole size={size} still={still} />;
  if (art.kind === "glow" || art.kind === "warm") return <Halo size={size} still={still} />;
  // A star our seed probe reached: the Seed Ship's sprout, for the copy of it there. 2026-10-26.
  if (art.kind === "seed") return <Sprout size={size} still={still} />;
  // Here at home: a rock coming, or something left by the Moon or on a rock beside us. 2026-10-30.
  if (art.kind === "near") return art.where === "rock" ? <Deflector size={size} still={still} /> : art.where === "co-orbital" ? <Trojan size={size} still={still} /> : <Moon size={size} still={still} />;
  if (art.e > 0) return <Orbit e={art.e} size={size} still={still} />;
  return <World size={size} still={still} />;
}

/** A message's mark: out to its star, or a reply back. */
export function BeamMark({ back, size = 16, still }: { back: boolean; size?: number; still?: boolean }) {
  return <Beam back={back} size={size} still={still} />;
}

/** What a craft brings home, as Reach's roads show it: a flyby, past a world in minutes, a craft moving along its line.
 *  Ours. 2026-10-25. */
function Pass({ size, still }: MarkProps) {
  return (
    <Moving
      size={size}
      still={still}
      move={(_, part) => {
        const keyframes = { x: [0, 12], opacity: [0, 1, 1, 0], easeEach: "none" };
        gsap.to(part("craft"), { keyframes, duration: 2.4, ease: "none", repeat: -1, delay: offset() });
      }}
    >
      <circle cx="8" cy="10.5" r="3.5" />
      <path d="M1.5 4.5h13" strokeDasharray="1.5 2" opacity={0.6} />
      <circle data-k="craft" cx="2" cy="4.5" r="1.1" fill="currentColor" stroke="none" />
    </Moving>
  );
}

/** Pictures, Lucide's image, its sun rising a little. */
const Picture = ({ size, still }: MarkProps) => (
  <Moving size={size} grid={24} still={still} move={(_, part) => void sway(part("sun"), { y: 0.8 }, { y: -0.6 }, 2.2)}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle data-k="sun" cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </Moving>
);

/** A world's air, Lucide's wind, drifting. */
const Air = ({ size, still }: MarkProps) => (
  <Moving size={size} grid={24} still={still} move={(_, part) => void sway(part("gust"), { x: -1 }, { x: 1.2 }, 1.8)}>
    <g data-k="gust">
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </g>
  </Moving>
);

/** What a road brings home: past in minutes, pictures, and a world's air. */
export function BringsMark({
  what,
  size = 14,
  still,
}: {
  what: "pass" | "pictures" | "air";
  size?: number;
  still?: boolean;
}) {
  if (what === "pass") return <Pass size={size} still={still} />;
  if (what === "pictures") return <Picture size={size} still={still} />;
  return <Air size={size} still={still} />;
}
