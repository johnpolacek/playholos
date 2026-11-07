// Each craft on Reach's walk, drawn: what it is, how it moves, and what it costs, by calcs/craft.py. Asked for 2026-11-07:
// show the sail and the probe themselves, not name tags on a starfield. Lines in the build's own color, labels in
// mono, and slow motion that says how each one works: the beam pushing the sail, the probe's tank draining into its
// flame, the sentinel's loop opening to brake. Numbers from data/works.json where the game uses them.
import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { CATALOG } from "@/lib/sim/works";

const LABEL = "fill-muted font-mono text-[8.5px] tracking-[.06em]";
const HEAD = "fill-ink font-mono text-[8.5px] tracking-[.06em]";
const kt = (n: number) => `${(n * 1000).toLocaleString("en-US", { maximumFractionDigits: 0 })} t`;

/** A row of what it does and costs, under the drawing. */
function Facts({ facts }: { facts: [string, string][] }) {
  return (
    <dl className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="font-mono text-[9px] tracking-[.08em] text-muted uppercase">{k}</dt>
          <dd className="text-[12.5px] leading-snug text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A Starshot sail: 4.1 m across and 2.6 g, a 1 g chip at its middle, pushed by 200 GW from an array 2.7 km across for
 *  8 minutes. The light that misses it goes on toward its star, where a mind can see it (Parkin 2018). */
export function SailArt({ tone }: { tone: string }) {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to("[data-beam]", { strokeDashoffset: -24, duration: 0.6, ease: "none", repeat: -1 });
      gsap.to("[data-spill]", { opacity: 0.15, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to("[data-sail]", { y: -3, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    },
    { scope: root },
  );
  return (
    <figure className={tone}>
      <svg ref={root} viewBox="0 0 360 196" className="w-full overflow-visible" role="img" aria-label="A light sail pushed by a laser beam from Earth">
        {/* What misses the sail goes on, toward its star. */}
        <g data-spill opacity={0.45}>
          {[-1, 1].map((s) => (
            <line key={s} x1={180 + s * 62} y1={58} x2={180 + s * 30} y2={6} stroke="currentColor" strokeWidth={0.8} strokeDasharray="2 3" />
          ))}
          <text x={180} y={0} textAnchor="middle" className={LABEL}>
            ON TOWARD ITS STAR
          </text>
        </g>
        {/* The beam, from the array on Earth. */}
        {[-48, -24, 0, 24, 48].map((dx) => (
          <line key={dx} data-beam x1={180 + dx * 1.7} y1={178} x2={180 + dx} y2={66} stroke="currentColor" strokeWidth={1} strokeDasharray="6 6" opacity={0.55} />
        ))}
        <rect x={86} y={178} width={188} height={5} rx={1} fill="currentColor" opacity={0.7} />
        <text x={180} y={194} textAnchor="middle" className={LABEL}>
          LASER ARRAY · 2.7 KM ACROSS · 200 GW
        </text>
        {/* The sail, billowed by the push, and its chip. */}
        <g data-sail>
          <path d="M118 62 Q180 44 242 62" fill="none" stroke="currentColor" strokeWidth={1.6} />
          <path d="M118 62 Q180 80 242 62" fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.6} />
          <rect x={176} y={56} width={8} height={8} className="fill-ink" />
          <line x1={236} y1={58} x2={262} y2={34} className="stroke-muted" strokeWidth={0.6} />
          <text x={340} y={22} textAnchor="end" className={HEAD}>
            SAIL · 4.1 M · 2.6 G
          </text>
          <text x={340} y={33} textAnchor="end" className={LABEL}>
            thinner than a soap film
          </text>
          <line x1={176} y1={58} x2={98} y2={34} className="stroke-muted" strokeWidth={0.6} />
          <text x={4} y={22} className={HEAD}>
            CHIP · 1 G
          </text>
          <text x={4} y={33} className={LABEL}>
            cameras, laser home
          </text>
        </g>
        <text x={300} y={128} className={LABEL}>
          8 MINUTES
        </text>
        <text x={300} y={139} className={LABEL}>
          OF LIGHT
        </text>
      </svg>
      <Facts
        facts={[
          ["Speed", "A fifth of light’s, in 10 minutes"],
          ["Push", "Up to 15,000 g"],
          ["A launch", "63 GWh, hours of a small grid"],
        ]}
      />
    </figure>
  );
}

/** A flyby probe on a deuterium fusion engine, Firefly's kind: 150 t of instruments, about 400 t of engine and
 *  radiators, and 6.1 kt of deuterium burned over 20 Years to a tenth of light speed. It never slows. */
export function ProbeArt({ tone }: { tone: string }) {
  const root = useRef<SVGSVGElement>(null);
  const { fuel } = CATALOG.probe;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-fuel]", { attr: { width: 100 } }, { attr: { width: 6 }, duration: 9, ease: "none", repeat: -1, repeatDelay: 1 });
      gsap.to("[data-plume]", { scaleX: 0.82, opacity: 0.55, transformOrigin: "100% 50%", duration: 0.09, ease: "none", yoyo: true, repeat: -1 });
    },
    { scope: root },
  );
  return (
    <figure className={tone}>
      <svg ref={root} viewBox="0 0 360 168" className="w-full overflow-visible" role="img" aria-label="A flyby probe: instruments, a deuterium tank, a fusion engine and its radiators">
        <defs>
          <linearGradient id="plume" x1="1" x2="0" y1="0" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity={0.9} />
            <stop offset="1" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Its flame, out the back. */}
        <path data-plume d="M70 84 L4 70 L4 98 Z" fill="url(#plume)" />
        <text x={6} y={118} className={LABEL}>
          EXHAUST · 12,000 KM/S
        </text>
        {/* Radiators, most of the engine's mass: fusion makes heat it must shed. */}
        <path d="M98 74 L110 24 L124 24 L120 74 Z M98 94 L110 144 L124 144 L120 94 Z" fill="currentColor" opacity={0.14} stroke="currentColor" strokeWidth={0.8} />
        {/* The engine. */}
        <path d="M70 72 L96 66 L96 102 L70 96 Z" fill="none" stroke="currentColor" strokeWidth={1.4} />
        <rect x={96} y={74} width={36} height={20} fill="none" stroke="currentColor" strokeWidth={1} />
        <text x={92} y={14} className={HEAD}>
          ENGINE AND RADIATORS · 400 T
        </text>
        {/* The deuterium, draining as it burns. */}
        <rect x={132} y={70} width={104} height={28} rx={14} fill="none" stroke="currentColor" strokeWidth={1.2} />
        <rect data-fuel x={134} y={72} width={100} height={24} rx={12} fill="currentColor" opacity={0.35} />
        <text x={184} y={162} textAnchor="middle" className={HEAD}>
          DEUTERIUM · {kt(fuel)}
        </text>
        <line x1={184} y1={100} x2={184} y2={152} className="stroke-muted" strokeWidth={0.6} />
        {/* Instruments, up front: telescope, spectrometer, and the laser home. */}
        <rect x={244} y={74} width={40} height={20} fill="none" stroke="currentColor" strokeWidth={1.2} />
        <path d="M284 70 L300 64 L300 104 L284 98" fill="none" stroke="currentColor" strokeWidth={1.2} />
        <circle cx={300} cy={84} r={3} className="fill-ink" />
        <text x={340} y={52} textAnchor="end" className={HEAD}>
          INSTRUMENTS · 150 T
        </text>
        <text x={340} y={63} textAnchor="end" className={LABEL}>
          reads a world’s air
        </text>
      </svg>
      <Facts
        facts={[
          ["Speed", "A tenth of light’s, after a 20-Year burn"],
          ["Fuel", `${kt(fuel)}, under a Year of the Works`],
          ["Waits on", "A Fusion Drive, never flown"],
        ]}
      />
    </figure>
  );
}

/** A sentinel braking on its magnetic sail: a superconducting loop about 1,600 km across drags on the thin gas between
 *  the stars, and stops 1,000 t from a tenth of light speed in about 15 Years more than cruising, with no flame (Gros
 *  2017). The loop is drawn to scale against nothing: the craft at its middle is a dot. */
export function SentinelArt({ tone }: { tone: string }) {
  const root = useRef<SVGSVGElement>(null);
  const { fuel, brake } = CATALOG.sentinel;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-loop]", { attr: { r: 6 } }, { attr: { r: 62 }, duration: 3, ease: "power2.out", repeat: -1, repeatDelay: 2.5 });
      gsap.to("[data-gas]", { x: 40, duration: 2.2, ease: "none", repeat: -1 });
    },
    { scope: root },
  );
  return (
    <figure className={tone}>
      <svg ref={root} viewBox="0 0 360 150" className="w-full overflow-hidden" role="img" aria-label="A sentinel braking on a wide magnetic loop">
        {/* The gas between the stars, streaming past. */}
        <g data-gas>
          {Array.from({ length: 36 }, (_, i) => (
            <circle key={i} cx={-40 + (i * 53) % 400} cy={8 + ((i * 37) % 134)} r={0.8} className="fill-muted" opacity={0.6} />
          ))}
        </g>
        <circle data-loop cx={180} cy={75} r={62} fill="none" stroke="currentColor" strokeWidth={1.4} />
        <circle cx={180} cy={75} r={2} className="fill-ink" />
        <text x={250} y={22} className={HEAD}>
          MAGNETIC SAIL
        </text>
        <text x={250} y={33} className={LABEL}>
          a loop 1,600 km across
        </text>
        <text x={188} y={92} className={LABEL}>
          1,000 T
        </text>
      </svg>
      <Facts
        facts={[
          ["Brakes", `${brake} Years, with no flame, unseen`],
          ["Fuel", `${kt(fuel)}, to speed up`],
          ["Waits on", "A Fusion Drive and the Works"],
        ]}
      />
    </figure>
  );
}
